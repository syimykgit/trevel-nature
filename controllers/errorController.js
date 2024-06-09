// module.exports = (err, req, res, next) => {
//   err.status = err.status || 'error';
//   err.statusCode = err.statusCode || 500;
//   res.status(err.statusCode).json({
//     status: err.status,
//     message: err.message,
//   });
// };

const AppError = require('../utils/appError');
// A) API
const sendErrorDev = (err, req, res) => {
  if (req.originalUrl.startsWith('/api')) {
    return res.status(err.statusCode).json({
      error: err,
      message: err.message,
      stack: err.stack,
      status: err.status,
    });
  }
  // B) RENDER WEBSITE
  console.error('ERROR: ', err);
  return res.status(err.statusCode).render('error', {
    title: 'something went wrong',
    msg: err.message,
  });
};

const sendErrorProd = (err, req, res) => {
  //  A) API
  if (req.originalUrl.startsWith('/api')) {
    //  operational error
    if (err.isOperational) {
      return res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
      });
    }
    console.error('ERROR: ', err);
    return res.status(500).json({
      status: 'error',
      message: 'Something went wrong',
    });
  }
  //  B) RENDER WEBSITE
  //  operational error
  if (err.isOperational) {
    return res.status(err.statusCode).render('error', {
      title: 'something went wrong',
      msg: err.message,
    });
  }
  console.error('ERROR: ', err);
  return res.status(err.statusCode).render('error', {
    title: 'something went wrong',
    msg: 'pleace try again later',
  });
};

const handleCastErrDB = function (err) {
  return new AppError(`invalid ${err.path}:${err.value}`, 404);
};
const handleDuplicateNameErrDB = (err) => {
  const getStr = err.errmsg.match(/name: "(.*?)"/)[1];
  return new AppError(`this name: ${getStr} alrady exist`, 404);
};
const handleAllErrOnceDB = (err) => {
  const str = Object.values(err.errors)
    .map((value) => value.message)
    .join(',');

  return new AppError(`invalid data: ${str}`, 404);
};

const handleInvalidTokenErrDB = function () {
  return new AppError(`invalid token please sign in again`, 401);
};

const handleExpiredTokenErrDB = function () {
  return new AppError(`current token is expired please sign in again`, 401);
};

module.exports = (err, req, res, next) => {
  err.status = err.status || 'error';
  err.statusCode = err.statusCode || 500;

  if (process.env.NODE_ENV.trim() === 'development') {
    sendErrorDev(err, req, res);
  } else if (process.env.NODE_ENV.trim() === 'production') {
    let error = { ...err };
    if (err.name === 'CastError') error = handleCastErrDB(err);
    if (err.code === 11000) error = handleDuplicateNameErrDB(err);
    if (err.name === 'ValidationError') {
      error = handleAllErrOnceDB(err);
    }
    if (err.name === 'JsonWebTokenError') error = handleInvalidTokenErrDB();
    if (err.name === 'TokenExpiredError') error = handleExpiredTokenErrDB();

    sendErrorProd(error, req, res);
  }
};
