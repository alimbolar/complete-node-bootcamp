const AppError = require('./../utils/AppError');

const handleCastErrorDB = function(err) {
  const message = `Invalid ${err.path} : ${err.value}`;
  return new AppError(message, 400);
};

const handleDuplicateFieldsDB = function(err) {
  const message = `The  '${
    Object.keys(err.keyValue)[0]
  }' field has a  duplicate value of '${Object.values(err.keyValue)[0]}'`;
  return new AppError(message, 400);
};

const handleValidationError = function(err) {
  const errors = Object.values(err.errors)
    .map(el => el.message)
    .join('. ');
  const message = `Validation Errors : ${errors} `;
  return new AppError(message, 400);
};

const sendErrorDev = function(err, res) {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack
  });
};

const sendErrorProd = function(err, res) {
  // Operational Error : can be send to client
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message
    });
    // Programatic Error : should not be leaked out to client
  } else {
    // 1) Log Error
    console.error('ERROR 💥 :', err);
    // 2) Send to client
    res.status(500).json({
      status: 'error',
      message: 'Something went wrong'
    });
  }
};

module.exports = (err, req, res, next) => {
  console.log(process.env.NODE_ENV);
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
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

    sendErrorProd(error, res);
  }

  next();
};
