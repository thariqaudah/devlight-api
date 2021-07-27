const mongoose = require('mongoose');

const topicSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      unique: [true, 'This topic has already been added'],
      required: [true, 'Please add a topic'],
    },
    description: {
      type: String,
      maxLength: 250,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Create virtual field for blogs
topicSchema.virtual('blogs', {
  ref: 'Blog',
  localField: '_id',
  foreignField: 'topics',
  justOne: false,
});

module.exports = mongoose.model('Topic', topicSchema);
