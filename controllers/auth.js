const crypto = require('crypto');
const ErrorResponse = require('../utils/ErrorResponse');
const sendEmail = require('../utils/sendEmail');
const asyncHandler = require('../middlewares/async');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

// @desc      Register user
// @path      POST /api/v1/auth/register
// @access    Public
exports.register = asyncHandler(async (req, res, next) => {
  const { name, email, role, password } = req.body;

  const user = await User.create({
    name,
    email,
    role,
    password,
  });

  // Sign JWT Token
  sendTokenResponse(res, 200, user);
});

// @desc      Login user
// @path      POST /api/v1/auth/login
// @access    Public
exports.login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  // Check if email and password is send in
  if (!email || !password) {
    return next(
      new ErrorResponse('Please provide an email and password to login', 400)
    );
  }

  const user = await User.findOne({ email }).select('+password');

  // Check if user's email exist
  if (!user) {
    return next(new ErrorResponse('Invalid Credentials', 401));
  }

  // Check if password is match
  const isMatch = await user.matchPassword(password);

  if (!isMatch) {
    return next(new ErrorResponse('Invalid Credentials', 401));
  }

  // Sign JWT Token
  sendTokenResponse(res, 200, user);
});

// @desc      Logout user / remove token from cookie
// @path      GET /api/v1/auth/logout
// @access    Private
exports.logout = asyncHandler(async (req, res, next) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });

  res.status(200).json({
    success: true,
    data: {},
  });
});

// @desc      Get currently log in user
// @path      GET /api/v1/auth/me
// @access    Private
exports.getMe = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  res.status(200).json({
    success: true,
    data: user,
  });
});

// @desc      Forgot password by sending email
// @path      POST /api/v1/auth/forgotpassword
// @access    Public
exports.forgotPassword = asyncHandler(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });

  // Check if user with email that sent is exist
  if (!user) {
    return next(
      new ErrorResponse(`User with that email is not registered`, 404)
    );
  }

  // Get reset password token
  const resetToken = await user.getResetPasswordToken();

  // Email reset email message
  const message = `You have requested to reset password. Please make a PUT request to this URL: http://localhost:5000/api/v1/auth/resetpassword/${resetToken}`;

  // Send email
  const info = await sendEmail({
    name: process.env.FROM_NAME,
    email: process.env.FROM_EMAIL,
    to: user.email,
    subject: 'Reset Password',
    message,
  });

  res.status(200).json({
    success: true,
    data: 'Reset password link has been sent to email',
  });
});

// @desc      Reset password by sending token
// @path      PUT /api/v1/auth/resetpassword
// @access    Public
exports.resetPassword = asyncHandler(async (req, res, next) => {
  // Hash reset token that sent in url
  const resetToken = crypto
    .createHash('sha256')
    .update(req.params.resetToken)
    .digest('hex');

  // Find user that match hashed reset token
  const user = await User.findOne({
    resetPasswordToken: resetToken,
    resetPasswordExpire: { $gt: Date.now() },
  }).select('+password');

  if (!user) {
    return next(new ErrorResponse(`Invalid token`, 401));
  }

  // Save new password and reset token
  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;

  await user.save();

  sendTokenResponse(res, 200, user);
});

// Helper for sending token reponse
const sendTokenResponse = (res, statusCode, user) => {
  // Sign JWT Token
  const token = user.getSignedJwtToken();

  // Create cookie options
  const options = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };

  // Secure cookie if in production
  if (process.env.NODE_ENV === 'production') {
    options.secure = true;
  }

  res.status(statusCode).cookie('token', token, options).json({
    success: true,
    token,
  });
};
