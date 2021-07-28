const path = require('path');
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

// @desc      Upload user photo
// @path      PUT /api/v1/users/:id/photoupload
// @access    Private
exports.uploadUserPhoto = asyncHandler(async (req, res, next) => {
  let user = await User.findById(req.params.id);

  if (!user) {
    return next(new ErrorResponse(`No user with ID of ${req.params.id}, 404`));
  }

  // Check ownership
  if (user.id !== req.user.id) {
    return next(
      new ErrorResponse(
        `User with ID ${user.id} is not authorized to update photo, 403`
      )
    );
  }

  // Check if file is uploaded
  if (!req.files || Object.keys(req.files).length === 0) {
    return next(new ErrorResponse(`Please select a file to upload`, 400));
  }

  const file = req.files.file;

  // Check if file is image type
  if (!file.mimetype.startsWith('image')) {
    return next(
      new ErrorResponse(`Please select an image file (eg. jpg, jpeg, png)`, 400)
    );
  }

  // Check if file is greater than 1 MB
  if (file.size > process.env.FILE_MAX_SIZE) {
    return next(
      new ErrorResponse(
        `File size can not be greater than ${process.env.FILE_MAX_SIZE} bytes`,
        400
      )
    );
  }

  // Create path of uploaded file
  const customFileName = `photo_${user.id}${path.parse(file.name).ext}`;
  const uploadPath = `${process.env.FILE_UPLOAD_PATH}/users/${customFileName}`;

  // Proceeds to upload the file
  file.mv(uploadPath, async (err) => {
    if (err) {
      console.log(err);
      return next(new ErrorResponse('Photo failed to upload', 500));
    }

    try {
      user = await User.findByIdAndUpdate(
        req.params.id,
        {
          photo: customFileName,
        },
        { new: true, runValidators: true }
      );

      res.status(200).json({
        success: true,
        data: user.photo,
      });
    } catch (err) {
      console.log(err);
      next(err);
    }
  });
});
