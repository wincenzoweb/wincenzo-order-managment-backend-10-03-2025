// routes/dataRoutes.js
const express = require('express');
const router = express.Router();
const ReturnAndPendingController = require('../controllers/ReturnAndPendingFileController');
const authMiddleware = require('../middleware/authMiddleware');

// Route to receive data
router.post('/addnewreturndata', authMiddleware.authenticateUser, authMiddleware.checkUserRole(["admin"]), ReturnAndPendingController.receiveData);

// Route to get all data
router.get('/getallreturndata', authMiddleware.authenticateUser, authMiddleware.checkUserRole(["admin", "branchAdmin", "employee"]), ReturnAndPendingController.getAllData);

// Route to get all data with pagination
router.get('/get-return-data', authMiddleware.authenticateUser, authMiddleware.checkUserRole(["admin", "branchAdmin", "employee"]), ReturnAndPendingController.getPaginatedReturnData);

// Route to get duplicates barcode number
router.get('/duplicatesbarcodenumber', authMiddleware.authenticateUser, authMiddleware.checkUserRole(["admin", "branchAdmin", "employee"]), ReturnAndPendingController.getDuplicateBarcodeNumbers);


// Route to delete multiple data
router.post('/delete-multiplereturndata', authMiddleware.authenticateUser, authMiddleware.checkUserRole(["admin"]), ReturnAndPendingController.deleteMultipleData);

// Route to get data by ID
router.get('/:id', authMiddleware.authenticateUser, authMiddleware.checkUserRole(["admin", "branchAdmin", "employee"]), ReturnAndPendingController.getDataById);

// Route to update data by ID
router.put('/:id', authMiddleware.authenticateUser, authMiddleware.checkUserRole(["admin"]), ReturnAndPendingController.updateDataById);

// Route to delete data by ID
router.delete('/:id', authMiddleware.authenticateUser, authMiddleware.checkUserRole(["admin"]), ReturnAndPendingController.deleteDataById);


module.exports = router;
