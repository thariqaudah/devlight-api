const express = require('express');
const Blog = require('../models/Blog');
const {
  getBlogs,
  getBlog,
  createBlog,
  updateBlog,
  deleteBlog,
  searchBlogs,
  photoUpload,
} = require('../controllers/blogs');

// Middlewares
const advancedResult = require('../middlewares/advancedResult');
const { protect } = require('../middlewares/auth');

// Load other resources route
const commentsRoute = require('./comments');

const router = express.Router({ mergeParams: true });

// Re-route to other resources
router.use('/:blogId/comments', commentsRoute);

router
  .route('/')
  .get(advancedResult(Blog, { path: 'topics', select: 'name' }), getBlogs)
  .post(protect, createBlog);
router.route('/search').get(searchBlogs);
router
  .route('/:id')
  .get(getBlog)
  .put(protect, updateBlog)
  .delete(protect, deleteBlog);
router.route('/:id/photo').put(protect, photoUpload);

module.exports = router;
