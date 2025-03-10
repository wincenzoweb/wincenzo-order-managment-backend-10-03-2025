// routes/dataRoutes.js
const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentFileController');
const authMiddleware = require('../middleware/authMiddleware');

// Route to receive data
router.post('/addnewpaymentdata', authMiddleware.authenticateUser, authMiddleware.checkUserRole(["admin"]), paymentController.receiveData);

// Route to get all data
router.get('/getallpaymentdata', authMiddleware.authenticateUser, authMiddleware.checkUserRole(["admin", "branchAdmin", "employee"]), paymentController.getAllData);

// Route to get all payment-data with paginated
router.get('/payment-data', authMiddleware.authenticateUser, authMiddleware.checkUserRole(["admin", "branchAdmin", "employee"]), paymentController.getPaginatedPaymentData);

// Route to get duplicates artical number
router.get('/duplicatesarticalnumber', authMiddleware.authenticateUser, authMiddleware.checkUserRole(["admin", "branchAdmin", "employee"]), paymentController.getDuplicateArticleNumbers);

// Route to delete multiple data
router.post('/delete-multiplepaymentdata', authMiddleware.authenticateUser, authMiddleware.checkUserRole(["admin"]), paymentController.deleteMultipleData);

// Route to get data by ID
router.get('/:id', authMiddleware.authenticateUser, authMiddleware.checkUserRole(["admin", "branchAdmin", "employee"]), paymentController.getDataById);

// Route to update data by ID
router.put('/:id', authMiddleware.authenticateUser, authMiddleware.checkUserRole(["admin"]), paymentController.updateDataById);

// Route to delete data by ID
router.delete('/:id', authMiddleware.authenticateUser, authMiddleware.checkUserRole(["admin"]), paymentController.deleteDataById);


module.exports = router;
