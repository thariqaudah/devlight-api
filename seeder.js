const fs = require('fs');
const path = require('path');
const colors = require('colors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

// Environment vars
dotenv.config({ path: './config/config.env' });

// Connect to DB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false,
  useUnifiedTopology: true,
});

// Load model
const Blog = require('./models/Blog');
const User = require('./models/User');
const Comment = require('./models/Comment');

// Read JSON file
const blogs = JSON.parse(
  fs.readFileSync(path.join(__dirname, '_data/blogs.json'), {
    encoding: 'utf8',
  })
);
const users = JSON.parse(
  fs.readFileSync(path.join(__dirname, '_data/users.json'), {
    encoding: 'utf8',
  })
);
// const comments = JSON.parse(
//   fs.readFileSync(path.join(__dirname, '_data/comments.json'), {
//     encoding: 'utf8',
//   })
// );

// Insert data to database
const insertData = async () => {
  try {
    await Blog.create(blogs);
    await User.create(users);
    // await Comment.create(comments);
    console.log('Data Inserted...'.green.inverse);
    process.exit();
  } catch (err) {
    console.log(err);
  }
};

// Remove data from database
const removeData = async () => {
  try {
    await Blog.deleteMany();
    await User.deleteMany();
    // await Comment.deleteMany();
    console.log('Data Destroyed...'.red.inverse);
    process.exit();
  } catch (err) {
    console.log(err);
  }
};

if (process.argv[2] === '-i') {
  insertData();
} else if (process.argv[2] === '-d') {
  removeData();
}
