const ErrorResponse = require('../utils/ErrorResponse');

const errorHandler = (err, req, res, next) => {
  // Make copy of error var
  let error = { ...err };
  error.message = err.message;
  error.name = err.name;

  // Logging error for dev
  console.log(err);

  // Mongoose Bad ObjectId
  if (error.name === 'CastError') {
    error = new ErrorResponse(
      `Resource with id of ${error.value} is not found`,
      404
    );
  }

  // Mongoose Validation Failed
  if (error.name === 'ValidationError') {
    const msg = [];
    Object.values(error.errors).forEach((val) =>
      msg.unshift(val.properties.message)
    );
    error = new ErrorResponse(msg.join(), 400);
  }

  // Duplicate field value entered
  if (error.code === 11000) {
    const message = `Duplicate field value entered for ${
      Object.keys(error.keyValue)[0]
    } field`;
    error = new ErrorResponse(message, 400);
  }

  res.status(error.statusCode || 500).json({
    success: false,
    error: error.message || 'Server Error',
  });
};

module.exports = errorHandler;
