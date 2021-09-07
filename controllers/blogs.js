const path = require('path');
const ErrorResponse = require('../utils/ErrorResponse');
const asyncHandler = require('../middlewares/async');
const Blog = require('../models/Blog');

// @desc      Get all blogs
// @path      GET /api/v1/blogs
// @path      GET /api/v1/:tagName
// @access    Public
exports.getBlogs = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.advancedResult);
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

  // Validate tags field (Maximum is 3 item)
  if (req.body.tags.length > 3) {
    return next(new ErrorResponse('Maximum tags for the blog is 3'), 400);
  }

  // Add cover photo

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

// @desc      Search blogs by passing keyword or tag name in query params
// @path      GET /api/v1/blogs/search?keyword=keyword
// @path      GET /api/v1/blogs/search?tag=tagName
// @access    Public
exports.searchBlogs = asyncHandler(async (req, res, next) => {
  if (req.query.tag) {
    const blogs = await Blog.find({ tags: req.query.tag });

    return res.status(200).json({
      status: true,
      count: blogs.length,
      data: blogs,
    });
  } else if (req.query.keyword) {
    const blogs = await Blog.find({ $text: { $search: req.query.keyword } });

    return res.status(200).json({
      status: true,
      count: blogs.length,
      data: blogs,
    });
  }
});

// @desc      Blog photo upload
// @path      PUT /api/v1/blogs/:id/photo
// @access    Private
exports.photoUpload = asyncHandler(async (req, res, next) => {
  let blog = await Blog.findById(req.params.id);

  // Check if blog is exist
  if (!blog) {
    return next(
      new ErrorResponse(`Blog with id ${req.params.id} is not found`, 404)
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
  const uploadPath = `${process.env.FILE_UPLOAD_PATH}/blogs/${customFileName}`;

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

// // Custom helper for upload file
// const uploadFile = async (req, blog, next) => {
//   // Check if file is uploaded
//   if (!req.files || Object.keys(req.files).length === 0) {
//     return next(new ErrorResponse(`Please select a file to upload`, 400));
//   }

//   const file = req.files.file;

//   // Check if file is image type
//   if (!file.mimetype.startsWith('image')) {
//     return next(
//       new ErrorResponse(`Please select an image file (eg. jpg, jpeg, png)`, 400)
//     );
//   }

//   // Check if file is greater than 1 MB
//   if (file.size > process.env.FILE_MAX_SIZE) {
//     return next(
//       new ErrorResponse(
//         `File size can not be greater than ${process.env.FILE_MAX_SIZE} bytes`,
//         400
//       )
//     );
//   }

//   // Create path of uploaded file
//   const customFileName = `photo_${blog.id}${path.parse(file.name).ext}`;
//   const uploadPath = `${process.env.FILE_UPLOAD_PATH}/blogs/${customFileName}`;

//   // Proceeds to upload the file
//   file.mv(uploadPath, async (err) => {
//     if (err) {
//       console.log(err);
//       return next(new ErrorResponse('File failed to upload', 500));
//     }

//     try {
//       blog = await Blog.findByIdAndUpdate(
//         req.params.id,
//         {
//           cover: customFileName,
//         },
//         { new: true, runValidators: true }
//       );

//       res.status(200).json({
//         success: true,
//         data: blog.cover,
//       });
//     } catch (err) {
//       console.log(err);
//       next(err);
//     }
//   });
// }
