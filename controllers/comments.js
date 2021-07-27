const ErrorResponse = require('../utils/ErrorResponse');
const asyncHandler = require('../middlewares/async');
const Comment = require('../models/Comment');
const Blog = require('../models/Blog');

// @desc      Get all comments
// @path      GET /api/v1/comments
// @path      GET /api/v1/blogs/:blogId/comments
// @access    Public
exports.getComments = asyncHandler(async (req, res, next) => {
  if (req.params.blogId) {
    const blog = await Blog.findById(req.params.blogId);

    if (!blog) {
      return next(
        new ErrorResponse(`Blog with ID ${req.params.blogId} is not found`, 404)
      );
    }

    const comments = await Comment.find({ blog: req.params.blogId }).populate(
      'from'
    );

    res.status(200).json({
      success: true,
      count: comments.length,
      data: comments,
    });
  } else {
    res.status(200).json(res.advancedResult);
  }
});

// @desc      Get single comment
// @path      GET /api/v1/comments/:id
// @access    Public
exports.getComment = asyncHandler(async (req, res, next) => {
  const comment = await Comment.findById(req.params.id).populate('from');

  if (!comment) {
    return next(
      new ErrorResponse(`Comment with ID of ${req.params.id} is not found`, 404)
    );
  }

  res.status(200).json({
    success: true,
    data: comment,
  });
});

// @desc      Create new comment
// @path      POST /api/v1/blogs/:blogId/comments
// @access    Private
exports.createComment = asyncHandler(async (req, res, next) => {
  const blog = await Blog.findById(req.params.blogId);

  if (!blog) {
    return next(
      new ErrorResponse(`Blog with ID ${req.params.blogId} is not found`, 404)
    );
  }

  req.body.blog = blog._id;
  req.body.from = req.user._id;

  const comment = await Comment.create(req.body);

  res.status(201).json({
    success: true,
    data: comment,
  });
});

// @desc      Update single comment
// @path      PUT /api/v1/comments/:id
// @access    Private
exports.updateComment = asyncHandler(async (req, res, next) => {
  let comment = await Comment.findById(req.params.id);

  if (!comment) {
    return next(
      new ErrorResponse(`Comment with id of ${req.params.id} is not found`, 404)
    );
  }

  // Check the ownership of the blog
  if (comment.from.toString() !== req.user.id) {
    return next(
      new ErrorResponse(
        `User with ID ${req.user.id} is not authorize to update this comment`,
        403
      )
    );
  }

  comment = await Comment.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    data: comment,
  });
});

// @desc      Delete blog
// @path      DELETE /api/v1/comments/:id
// @access    Private
exports.deleteComment = asyncHandler(async (req, res, next) => {
  const comment = await Comment.findById(req.params.id);

  if (!comment) {
    return next(
      new ErrorResponse(`Comment with id of ${req.params.id} is not found`, 404)
    );
  }

  // Check the ownership of the blog
  if (comment.from.toString() !== req.user.id) {
    return next(
      new ErrorResponse(
        `User with ID ${req.user.id} is not authorize to delete this comment`,
        403
      )
    );
  }

  await Comment.findByIdAndDelete(req.params.id);

  res.status(200).json({
    success: true,
    data: {},
  });
});
