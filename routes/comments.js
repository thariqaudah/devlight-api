const express = require('express');
const Comment = require('../models/Comment');
const {
  getComments,
  getComment,
  createComment,
  updateComment,
  deleteComment,
} = require('../controllers/comments');

// Middlewares
const advancedResult = require('../middlewares/advancedResult');
const { protect } = require('../middlewares/auth');

const router = express.Router({ mergeParams: true });

router
  .route('/')
  .get(advancedResult(Comment, 'from'), getComments)
  .post(protect, createComment);
router
  .route('/:id')
  .get(getComment)
  .put(protect, updateComment)
  .delete(protect, deleteComment);

module.exports = router;
