const path = require('path');
const dotenv = require('dotenv');
const express = require('express');
const connectDb = require('./config/db');
const errorHandler = require('./middlewares/error');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const colors = require('colors');
const fileUpload = require('express-fileupload');

// Environment vars
dotenv.config({ path: path.resolve(__dirname, 'config/config.env') });

// Connect to DB
connectDb();

// Load route files
const blogsRoute = require('./routes/blogs');
const authRoute = require('./routes/auth');
const usersRoute = require('./routes/users');
const commentsRoute = require('./routes/comments');

const app = express();

// Static files
app.use(express.static(path.join(__dirname, 'public')));

// Logger
app.use(morgan('dev'));

// Bodyparser
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// File upload
app.use(fileUpload());

// Cookie Parser
app.use(cookieParser());

// Mounting routes
app.use('/api/v1/blogs', blogsRoute);
app.use('/api/v1/auth', authRoute);
app.use('/api/v1/users', usersRoute);
app.use('/api/v1/comments', commentsRoute);

// Error handler middleware
app.use(errorHandler);

// Server connection
const port = process.env.PORT || 5000;
const server = app.listen(port, () =>
  console.log(
    `App is running in ${process.env.NODE_ENV} mode on port ${port}`.blue.bold
  )
);

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.log(`Error: ${err.message}`);
  // Close server and exit with failure
  server.close(() => process.exit(1));
});
