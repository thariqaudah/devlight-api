const crypto = require('crypto');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: [true, 'Please add a name'],
    },
    email: {
      type: String,
      required: [true, 'Please add an email'],
      unique: true,
      match: [
        /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i,
        'Please add a valid email address',
      ],
    },
    role: {
      type: String,
      enum: ['user'],
      default: 'user',
    },
    photo: {
      type: String,
      default: 'no-user-photo.jpg',
    },
    password: {
      type: String,
      required: [true, 'Please add a password'],
      minLength: [6, 'Password has to be at least 6 characters'],
      select: false,
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
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
userSchema.virtual('blogs', {
  ref: 'Blog',
  localField: '_id',
  foreignField: 'author',
  justOne: false,
});

// Encrypt password before save to database
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Sign JWT Token
userSchema.methods.getSignedJwtToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET_KEY, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

// Match password with bcrypt
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Reset password token
userSchema.methods.getResetPasswordToken = async function () {
  // Generate random bytes for reset token
  const resetToken = crypto.randomBytes(10).toString('hex');

  // Hash token and save to db
  this.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  // Save reset token expiration (10 minutes)
  this.resetPasswordExpire =
    Date.now() + process.env.RESET_PASSWORD_EXPIRE * 60 * 1000;

  await this.save({ validateBeforeSave: false });

  return resetToken;
};

module.exports = mongoose.model('User', userSchema);
