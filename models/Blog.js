const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema({
  title: {
    type: String,
    trim: true,
    maxLength: [100, 'Title can not be greater than 100 chars'],
    required: [true, 'Please add a blog title'],
  },
  content: {
    type: String,
    required: [true, 'Please add a blog content'],
  },
  category: {
    type: String,
    required: [true, 'Please add a category for the blog'],
    enum: ['front-end', 'back-end', 'full-stack'],
  },
  tags: [String],
  cover: {
    type: String,
    default: 'no-photo.jpg',
  },
  likes: Number,
  readingTime: Number,
  createdAt: {
    type: Date,
    default: Date.now,
  },
  author: {
    type: mongoose.Types.ObjectId,
    required: true,
    ref: 'User',
  },
});

// Add text index for title and content to allow search over those
blogSchema.index({ title: 'text', content: 'text' });

// Calculate minutes of reading time
blogSchema.pre('save', function (next) {
  const contentWords = this.content.replace(/<[a-zA-Z\/][^>]*>/g, '').length;
  this.readingTime = Math.round(contentWords / 200);
  next();
});

module.exports = mongoose.model('Blog', blogSchema);
