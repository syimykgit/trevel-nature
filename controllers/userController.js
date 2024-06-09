// sharp for resizing a photo
const sharp = require('sharp');
// multer for uploading user photo from a form to memory or diskStorage
const multer = require('multer');

const AppError = require('../utils/appError');
const User = require('../model/userModel');
const asyncErrorHandler = require('../utils/asyncErrHandler');
const factory = require('./factoryHandler');

// multer for uploading user photo to diskStorage
// const multerStorage = multer.diskStorage({
//   destination: (req, file, cd) => {
//     cd(null, 'public/img/users');
//   },
//   filename: (req, file, cd) => {
//     const extention = file.mimetype.split('/')[1];
//     cd(null, `user-${req.user.id}-${Date.now()}.${extention}`);
//   },
// });

// multer for uploading user photo to memoryStorage
const multerStorage = multer.memoryStorage();

exports.resizeUserPhoto = (req, res, next) => {
  if (!req.file) return next();

  req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;

  sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat('jpeg')
    .jpeg({ quality: 80 })
    .toFile(`public/img/users/${req.file.filename}`);

  next();
};

const multerFilter = (req, file, cd) => {
  if (file.mimetype.startsWith('image')) {
    cd(null, true);
  } else {
    cd(new AppError('please upload only image file !', 400), false);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

exports.uploadUserPic = upload.single('photo');

///////////////////////////////////
exports.getUsers = factory.getAll(User);
exports.getUser = factory.getOne(User);
exports.updateUser = factory.updateOne(User); // not for updating password
exports.deleteUser = factory.deleteOne(User);

exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};

const filterBody = (obj, next, ...rest) => {
  const newObj = {};

  Object.keys(obj).forEach((el) => {
    if (el === 'password' || el === 'passwordConfirm') {
      return next(
        new AppError(
          'you can not update your password from this route please use "/update-password" route',
          400,
        ),
      );
    }
    if (rest.includes(el)) {
      newObj[el] = obj[el];
    }
  });
  return newObj;
};

exports.updateMe = asyncErrorHandler(async (req, res, next) => {
  console.log(req.file, req.body);

  const filteredBody = filterBody(req.body, next, 'name', 'email');

  if (req.file) filteredBody.photo = req.file.filename;

  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser,
    },
  });
});

exports.deleteMe = asyncErrorHandler(async (req, res, next) => {
  const user = await User.findOne({ _id: req.user.id });
  user.active = false;

  await user.save({ validateBeforeSave: false });

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

exports.createUser = function (req, res) {
  res.status(500).json({
    status: 500,
    message: "user's function is not written yet",
  });
};
