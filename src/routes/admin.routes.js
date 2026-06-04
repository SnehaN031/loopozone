const express = require('express')
const verifyAdmin = require('../middleware/verifyAdmin')
const adminController = require('../controllers/adminController')
const priceController = require('../controllers/priceController')
const categoryController = require('../controllers/categoryController')

const router = express.Router()

// Public route
router.post('/login', adminController.login)

// Protected routes (admin authorization required)
router.get('/kyc/pending', verifyAdmin, adminController.getPendingUsers)
router.get('/kyc/user/:userId', verifyAdmin, adminController.getUserDocuments)
router.post('/kyc/approve/:userId', verifyAdmin, adminController.approveKYC)
router.post('/kyc/reject/:userId', verifyAdmin, adminController.rejectKYC)
router.get('/kyc/all', verifyAdmin, adminController.getAllUsers)
router.post('/create', verifyAdmin, adminController.createAdmin)

// Live Indicative Prices CMS Admin Routes
router.post('/prices', verifyAdmin, priceController.createPrice)
router.get('/prices', verifyAdmin, priceController.getPrices)
router.put('/prices/:id', verifyAdmin, priceController.updatePrice)
router.delete('/prices/:id', verifyAdmin, priceController.deletePrice)

// Categories CMS Admin Routes
router.post('/categories', verifyAdmin, categoryController.createCategory)
router.get('/categories', verifyAdmin, categoryController.getCategories)
router.put('/categories/:id', verifyAdmin, categoryController.updateCategory)
router.delete('/categories/:id', verifyAdmin, categoryController.deleteCategory)

module.exports = router
