const express = require('express');
const Topic = require('../models/Topic');
const {
  getTopics,
  getTopic,
  createTopic,
  updateTopic,
  deleteTopic,
} = require('../controllers/topics');

// Load other resource routes
const blogsRoute = require('./blogs');

// Middlewares
const advancedResult = require('../middlewares/advancedResult');
const { protect } = require('../middlewares/auth');
const { authorize } = require('../middlewares/auth');

const router = express.Router();

// Re-route to other resource
router.use('/:topicId/blogs', blogsRoute);

router
  .route('/')
  .get(advancedResult(Topic, { path: 'blogs', select: 'title' }), getTopics)
  .post(protect, authorize('admin'), createTopic);
router
  .route('/:id')
  .get(getTopic)
  .put(protect, updateTopic)
  .delete(protect, deleteTopic);

module.exports = router;
