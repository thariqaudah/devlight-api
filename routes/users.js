const express = require('express');
const {
  getUsersProfile,
  getUserProfile,
  uploadUserPhoto,
} = require('../controllers/users');

// Middlewares
const { protect } = require('../middlewares/auth');

const router = express.Router();

router.route('/').get(getUsersProfile);
router.route('/:id').get(getUserProfile);
router.route('/:id/photoupload').put(protect, uploadUserPhoto);

module.exports = router;
