const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const {
    register,
    login,
    getProfile,
    updateProfile,
    getUsers
} = require('../controllers/userController');

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected routes
router.get('/profile', auth, getProfile);
router.put('/profile', auth, updateProfile);
router.get('/', auth, getUsers);

module.exports = router; 