const AppError = require('./../utils/AppError');

const handleCastErrorDB = function (err) {
  const message = `Invalid ${err.path} : ${err.value}`;
  return new AppError(message, 400);
};

const handleDuplicateFieldsDB = function (err) {
  const message = `The  '${
    Object.keys(err.keyValue)[0]
  }' field has a  duplicate value of '${Object.values(err.keyValue)[0]}'`;
  return new AppError(message, 400);
};

const handleValidationError = function (err) {
  const errors = Object.values(err.errors)
    .map((el) => el.message)
    .join('. ');
  const message = `Validation Errors : ${errors} `;
  return new AppError(message, 400);
};

const handleJsonWebTokenError = function (err) {
  const message = 'Invalid token : Please log in again';
  return new AppError(message, 401);
};

const handleTokenExpiredError = function (err) {
  const message = 'Expired token : Please log in again';
  return new AppError(message, 401);
};

const sendErrorDev = function (err, req, res) {
  // A) API
  if (req.originalUrl.startsWith('/api')) {
    return res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack,
    });
  }

  // B) RENDERED WEBSITE
  return res
    .status(err.statusCode)
    .render('error', { title: 'Something went wrong', msg: err.message });
};

const sendErrorProd = function (err, req, res) {
  if (req.originalUrl.startsWith('/api')) {
    console.error('ERROR 💥 :', err);

    // A) API
    /////////// Operational Error : can be send to client
    if (err.isOperational) {
      res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
      });
      //////// Programatic Error : should not be leaked out to client
    }
    // 1) Log Error
    console.error('ERROR 💥 :', err);
    // 2) Send to client
    return res.status(500).json({
      status: 'error',
      message: 'Something went wrong',
    });
  }
  // B) RENDERED WEBSITE
  /////////// Operational Error : can be send to client
  if (err.isOperational) {
    console.error('ERROR 💥 :', err);

    return res.status(err.statusCode).render('error', {
      title: 'Something went wrong',
      msg: err.message,
    });
    // res.status(err.statusCode).json({
    //   status: err.status,
    //   message: err.message,
    // });
    //////// Programatic Error : should not be leaked out to client
  }
  // 1) Log Error
  console.error('ERROR 💥 :', err);
  // 2) Send to client
  return res.status(err.statusCode).render('error', {
    title: 'Something went wrong',
    msg: 'Something went wrong. Please bang your head against the wall a few times and try again.',
  });
  // res.status(500).json({
  //   status: 'error',
  //   message: 'Something went wrong',
  // });
};

module.exports = (err, req, res, next) => {
  console.log(process.env.NODE_ENV);
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, req, res);
  } else if (process.env.NODE_ENV === 'production') {
    // let error = { ...err };
    let error = Object.assign(err);

    if (error.name === 'CastError') {
      error = handleCastErrorDB(error);
    }

    if (error.code === 11000) {
      error = handleDuplicateFieldsDB(error);
    }

    if (error.name === 'ValidationError') {
      error = handleValidationError(error);
    }

    if (error.name === 'JsonWebTokenError') {
      error = handleJsonWebTokenError(error);
    }
    if (error.name === 'TokenExpiredError') {
      error = handleTokenExpiredError(error);
    }
    sendErrorProd(error, req, res);
  }

  next();
};
