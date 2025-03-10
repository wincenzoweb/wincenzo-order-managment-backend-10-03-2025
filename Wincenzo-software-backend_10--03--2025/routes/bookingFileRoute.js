const express = require('express');
const router = express.Router();
const bookingFileController = require('../controllers/bookingFileController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/addbooking', authMiddleware.authenticateUser, authMiddleware.checkUserRole(["admin"]), bookingFileController.receiveData);
router.get('/allbooking', authMiddleware.authenticateUser, authMiddleware.checkUserRole(["admin", "branchAdmin", "employee"]), bookingFileController.getAllData);
// router.get('/hello', bookingFileController.sayHello);

router.get('/duplicatebookingsbarcodenumber', authMiddleware.authenticateUser, authMiddleware.checkUserRole(["admin", "branchAdmin", "employee"]), bookingFileController.getDuplicateBarcodes);



//get data with paginated
router.get('/bookings', authMiddleware.authenticateUser, authMiddleware.checkUserRole(["admin", "branchAdmin", "employee"]), bookingFileController.getPaginatedData);
router.delete('/delete-bookinglist', authMiddleware.authenticateUser, authMiddleware.checkUserRole(["admin"]), bookingFileController.deleteMultipleData);

router.get('/:bookingid', authMiddleware.authenticateUser, authMiddleware.checkUserRole(["admin", "branchAdmin", "employee"]), bookingFileController.getDataById);
router.put('/:bookingid', authMiddleware.authenticateUser, authMiddleware.checkUserRole(["admin"]), bookingFileController.updateDataById);
router.delete('/:bookingid', authMiddleware.authenticateUser, authMiddleware.checkUserRole(["admin"]), bookingFileController.deleteDataById);





module.exports = router;