const express = require('express');
const { getUsersProfile, getUserProfile } = require('../controllers/users');

const router = express.Router();

router.route('/').get(getUsersProfile);
router.route('/:id').get(getUserProfile);

module.exports = router;
