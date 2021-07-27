const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  header: {
    type: String,
    trim: true,
    maxLength: 100,
    required: [true, 'Please add a comment header'],
  },
  text: {
    type: String,
    required: [true, 'Please add a comment'],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  blog: {
    type: mongoose.Types.ObjectId,
    required: true,
    ref: 'Blog',
  },
  from: {
    type: mongoose.Types.ObjectId,
    required: true,
    ref: 'User',
  },
});

module.exports = mongoose.model('Comment', commentSchema);
