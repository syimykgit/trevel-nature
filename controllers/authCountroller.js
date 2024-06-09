const jwt = require('jsonwebtoken');

const crypto = require('crypto');

const AppError = require('../utils/appError');

const User = require('../model/userModel');
const asyncErrorHandler = require('../utils/asyncErrHandler');

const Email = require('../utils/email');

const signToken = function (idNum) {
  return jwt.sign({ id: idNum }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXP_TIME,
  });
};
const createCookie = {
  expires: new Date(
    Date.now() + process.env.JWT_COOKIE_EXP_TIME * 24 * 60 * 60 * 1000,
  ),
  httpOnly: true,
};
if (process.env.NODE_ENV === 'production') {
  createCookie.secure = true;
}

const createAendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  res.cookie('jwt', token, createCookie);

  user.password = undefined;

  res.status(statusCode).json({
    status: 'success',
    token,
    data: { user },
  });
};

exports.signup = asyncErrorHandler(async (req, res) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordChangedDate: req.body.passwordChangedDate,
    passwordConfirm: req.body.passwordConfirm,
    role: req.body.role,
  });

  const url = `${req.protocol}://${req.get('host')}/me`;

  await new Email(newUser, url).sendWelcome();

  createAendToken(newUser, 201, res);
});

exports.signin = asyncErrorHandler(async (req, res, next) => {
  const { password, email } = req.body;

  if (!password || !email)
    return next(new AppError('all feild must be filed'), 400);

  const user = await User.findOne({ email: email }).select('+password');

  if (!user || !(await user.checkPassword(password, user.password)))
    return next(new AppError('email or password incorrect'), 400);

  createAendToken(user, 200, res);
});

exports.logOut = (req, res) => {
  res.cookie('jwt', 'logout cookie', {
    expiresIn: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });

  res.status(200).json({
    status: 'success',
  });
};

exports.protect = asyncErrorHandler(async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  if (!token)
    return next(new AppError('please log in to access to the website'), 400);

  const decoded = await jwt.verify(token, process.env.JWT_SECRET);

  const user = await User.findById(decoded.id);

  if (!user) {
    return next(new AppError('user with this token is not exist'), 401);
  }

  if (user.isPasswortCanged(decoded.iat))
    return next(
      new AppError('password hase been changed please login again'),
      401,
    );
  req.user = user;
  res.locals.user = user;
  next();
});

/////// if user loged in if so pass current user to pug templats

exports.isUserLogged = async (req, res, next) => {
  try {
    if (req.cookies.jwt) {
      const decoded = await jwt.verify(req.cookies.jwt, process.env.JWT_SECRET);

      const user = await User.findById(decoded.id);
      if (!user) {
        return next();
      }

      if (user.isPasswortCanged(decoded.iat)) return next();

      res.locals.user = user;
    }
    next();
  } catch (err) {
    return next();
  }
};

exports.permition = function (...roles) {
  return function (req, res, next) {
    if (!roles.includes(req.user.role)) {
      return next(new AppError('you are not allowed to this route'), 403);
    }

    next();
  };
};

exports.forgotPassword = asyncErrorHandler(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(
      new AppError(
        'user with this email is not found please enter valid email',
      ),
      404,
    );
  }

  const token = user.generatePasswordResetToken();

  await user.save({ validateBeforeSave: false });

  try {
    const resetURL = `${req.protocol}://${req.get('host')}/api/v1/users/reset-password/${token}`;
    await new Email(user, resetURL).sendForgotPassword();

    res.status(200).json({
      status: 'success',
      message: 'token send to email',
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpired = undefined;

    await user.save({ validateBeforeSave: false });

    return next(
      new AppError('there was a sending error please try again later!'),
      500,
    );
  }
});

exports.resetPassword = asyncErrorHandler(async (req, res, next) => {
  const userPasswordToken = req.params.token;

  const cryptoUserPasswordToken = crypto
    .createHash('sha256')
    .update(userPasswordToken)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken: cryptoUserPasswordToken,
    passwordResetExpired: { $gt: Date.now() },
  });
  if (!user) {
    return next(
      new AppError(
        'user with this token is not found please enter valid token',
      ),
      404,
    );
  }

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;

  user.passwordResetToken = undefined;
  user.passwordResetExpired = undefined;

  await user.save();
  createAendToken(user, 200, res);
});

exports.updatePassword = asyncErrorHandler(async (req, res, next) => {
  // 1) geting the user to update password
  const user = await User.findOne({ _id: req.user._id }).select('+password');

  // 2) if posted password is correct
  const userInputPass = req.body.userOldPassword;

  if (!user || !(await user.checkPassword(userInputPass, user.password))) {
    return next(new AppError('password is not correct'), 404);
  }

  // 3) if password is matches to original password so i need to update it
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;

  // 4) loging user in

  await user.save();

  createAendToken(user, 201, res);
});
