const express = require('express');
const priceController = require('../controllers/priceController');

const router = express.Router();

// GET /prices
router.get('/', priceController.getPrices);

module.exports = router;
