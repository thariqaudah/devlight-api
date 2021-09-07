const ErrorResponse = require('../utils/ErrorResponse');
const asyncHandler = require('../middlewares/async');
const Topic = require('../models/Topic');

// @desc      Get all topics
// @path      GET /api/v1/topics
// @access    Public
exports.getTopics = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.advancedResult);
});

// @desc      Get single topics
// @path      GET /api/v1/topics/:id
// @access    Public
exports.getTopic = asyncHandler(async (req, res, next) => {
  const topic = await Topic.findById(req.params.id).populate({
    path: 'blogs',
    select: 'title',
  });

  if (!topic) {
    return next(
      new ErrorResponse(`Topic with id ${req.params.id} is not found`, 404)
    );
  }

  res.status(200).json({
    success: true,
    data: topic,
  });
});

// @desc      Create topic
// @path      POST /api/v1/topics
// @access    Admin
exports.createTopic = asyncHandler(async (req, res, next) => {
  const topic = await Topic.create(req.body);

  res.status(201).json({
    success: true,
    data: topic,
  });
});

// @desc      Update topic
// @path      PUT /api/v1/topics/:id
// @access    Admin
exports.updateTopic = asyncHandler(async (req, res, next) => {
  let topic = await Topic.findById(req.params.id);

  if (!topic) {
    return next(
      new ErrorResponse(`Topic with id ${req.params.id} is not found`, 404)
    );
  }

  topic = await Topic.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    data: topic,
  });
});

// @desc      Delete topic
// @path      DELETE /api/v1/topics/:id
// @access    Admin
exports.deleteTopic = asyncHandler(async (req, res, next) => {
  const topic = await Topic.findById(req.params.id);

  if (!topic) {
    return next(
      new ErrorResponse(`Topic with id ${req.params.id} is not found`, 404)
    );
  }

  await Topic.findByIdAndDelete(req.params.id);

  res.status(200).json({
    success: true,
    data: {},
  });
});
