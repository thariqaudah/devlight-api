const ErrorResponse = require('../utils/ErrorResponse');
const asyncHandler = require('./async');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.protect = asyncHandler(async (req, res, next) => {
  let token;

  // Check if authorization header is exist and correctly formatted
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    // Set token from bearer token in header
    token = req.headers.authorization.split(' ')[1];
  }

  // Second option to set token from cookie
  // else if (req.cookies.token) {
  //   token = req.cookies.token;
  // }

  // Check if token exist
  if (!token) {
    return next(new ErrorResponse('Not authorized to access this route', 401));
  }

  // Verify token
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

    // Populate verified user to req.user
    req.user = await User.findById(decoded.id);

    next();
  } catch (err) {
    return next(new ErrorResponse('Not authorized to access this route', 401));
  }
});

exports.authorize =
  (...roles) =>
  (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new ErrorResponse(
          `User's ${req.user.role} role is not authorize to access this route`,
          403
        )
      );
    }
    next();
  };
