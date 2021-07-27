const path = require('path');
const ErrorResponse = require('../utils/ErrorResponse');
const asyncHandler = require('../middlewares/async');
const Blog = require('../models/Blog');
const Topic = require('../models/Topic');

// @desc      Get all blogs
// @path      GET /api/v1/blogs
// @path      GET /api/v1/topics/:topicId/blogs
// @access    Public
exports.getBlogs = asyncHandler(async (req, res, next) => {
  if (req.params.topicId) {
    const topic = await Topic.findById(req.params.topicId);

    if (!topic) {
      return next(
        new ErrorResponse(
          `Topic with id ${req.params.topicId} is not found`,
          404
        )
      );
    }

    const blogs = await Blog.find({ topics: topic }).populate({
      path: 'topics',
      select: 'name',
    });

    res.status(200).json({
      success: true,
      count: blogs.length,
      data: blogs,
    });
  } else {
    res.status(200).json(res.advancedResult);
  }
});

// @desc      Get single blog
// @path      GET /api/v1/blogs/:id
// @access    Public
exports.getBlog = asyncHandler(async (req, res, next) => {
  const blog = await Blog.findById(req.params.id).populate('topics');

  if (!blog) {
    return next(
      new ErrorResponse(`Blog with id of ${req.params.id} is not found`, 404)
    );
  }

  res.status(200).json({
    success: true,
    data: blog,
  });
});

// @desc      Create new blog
// @path      POST /api/v1/blogs
// @access    Private
exports.createBlog = asyncHandler(async (req, res, next) => {
  // Add author to req.body
  req.body.author = req.user;

  const topics = req.body.topics;

  // Check if no topics
  if (!topics) {
    return next(new ErrorResponse(`Please add the topics for your blog`, 400));
  }

  // Check for maximum topic to add
  if (topics.length > process.env.MAX_BLOG_TOPICS) {
    return next(
      new ErrorResponse(
        `You can add topics for your blog up to ${process.env.MAX_BLOG_TOPICS}`,
        400
      )
    );
  }

  const blog = await Blog.create(req.body);

  res.status(201).json({
    success: true,
    data: blog,
  });
});

// @desc      Update single blog
// @path      PUT /api/v1/blogs/:id
// @access    Private
exports.updateBlog = asyncHandler(async (req, res, next) => {
  let blog = await Blog.findById(req.params.id);

  if (!blog) {
    return next(
      new ErrorResponse(`Blog with id of ${req.params.id} is not found`, 404)
    );
  }

  // Check the ownership of the blog
  if (blog.author.toString() !== req.user.id) {
    return next(
      new ErrorResponse(
        `User with ID ${req.user.id} is not authorize to update this blog`,
        403
      )
    );
  }

  blog = await Blog.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    data: blog,
  });
});

// @desc      Delete blog
// @path      DELETE /api/v1/blogs/:id
// @access    Private
exports.deleteBlog = asyncHandler(async (req, res, next) => {
  const blog = await Blog.findById(req.params.id);

  if (!blog) {
    return next(
      new ErrorResponse(`Blog with id of ${req.params.id} is not found`, 404)
    );
  }

  // Check the ownership of the blog
  if (blog.author.toString() !== req.user.id) {
    return next(
      new ErrorResponse(
        `User with ID ${req.user.id} is not authorize to delete this blog`,
        403
      )
    );
  }

  await Blog.findByIdAndDelete(req.params.id);

  res.status(200).json({
    success: true,
    data: {},
  });
});

// @desc      Search blogs by passing keyword in query
// @path      GET /api/v1/blogs/search?q=keyword
// @access    Public
exports.searchBlogs = asyncHandler(async (req, res, next) => {
  const keyword = req.query.q;

  const blogs = await Blog.find({ $text: { $search: keyword } });

  res.status(200).json({
    status: true,
    count: blogs.length,
    data: blogs,
  });
});

// @desc      Blog photo upload
// @path      PUT /api/v1/blogs/:id/photo
// @access    Private
exports.photoUpload = asyncHandler(async (req, res, next) => {
  let blog = await Blog.findById(req.params.id);

  // Check the ownership of the blog
  if (blog.author.toString() !== req.user.id) {
    return next(
      new ErrorResponse(
        `User with ID ${req.user.id} is not authorize to update this blog`,
        403
      )
    );
  }

  // Check if blog is exist
  if (!blog) {
    return next(
      new ErrorResponse(`Blog with id ${req.params.id} is not found`, 404)
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
  const customFileName = `photo_${blog.id}${path.parse(file.name).ext}`;
  const uploadPath = `${process.env.FILE_UPLOAD_PATH}/${customFileName}`;
  console.log(customFileName, uploadPath);

  // Proceeds to upload the file
  file.mv(uploadPath, async (err) => {
    if (err) {
      console.log(err);
      return next(new ErrorResponse('File failed to upload', 500));
    }

    try {
      blog = await Blog.findByIdAndUpdate(
        req.params.id,
        {
          cover: customFileName,
        },
        { new: true, runValidators: true }
      );

      res.status(200).json({
        success: true,
        data: blog.cover,
      });
    } catch (err) {
      console.log(err);
      next(err);
    }
  });
});
