const ErrorResponse = require('../utils/ErrorResponse');
const asyncHandler = require('../middlewares/async');
const User = require('../models/User');

// @desc      Get users profile
// @path      GET /api/v1/users
// @access    Public
exports.getUsersProfile = asyncHandler(async (req, res, next) => {
  const users = await User.find().populate({ path: 'blogs', select: 'title' });

  res.status(200).json({
    success: true,
    count: users.length,
    data: users,
  });
});

// @desc      Get single user public profile
// @path      GET /api/v1/users/:id
// @access    Public
exports.getUserProfile = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id).populate('blogs');

  if (!user) {
    return next(
      new ErrorResponse(`No user with that ID ${req.params.id}`, 404)
    );
  }

  res.status(200).json({
    success: true,
    data: user,
  });
});
