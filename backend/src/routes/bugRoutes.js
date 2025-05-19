const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const {
    createBug,
    getBugs,
    getBugById,
    updateBug,
    deleteBug
} = require('../controllers/bugController');

// All routes require authentication
router.use(auth);

// Bug routes
router.post('/', createBug);
router.get('/', getBugs);
router.get('/:id', getBugById);
router.put('/:id', updateBug);
router.delete('/:id', deleteBug);

module.exports = router; 