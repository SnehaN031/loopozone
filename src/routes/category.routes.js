const express = require('express');
const categoryController = require('../controllers/categoryController');

const router = express.Router();

// GET /categories
router.get('/', categoryController.getCategories);

module.exports = router;
