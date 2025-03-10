

//old code 
// const express = require('express');
// const router = express.Router();
// const userPaymentDataController = require('../controllers/userPaymentDataController');
// const authMiddleware = require('../middleware/authMiddleware');



// router.get('/get-paymentinfo-data', authMiddleware.authenticateUser, authMiddleware.checkUserRole(["admin", "branchAdmin", "employee"]), userPaymentDataController.getPaginatedPaidUserInfos);
// router.get('/get-user-payment-info', authMiddleware.authenticateUser, authMiddleware.checkUserRole(["admin", "branchAdmin", "employee"]), userPaymentDataController.getUserPaymentData);
// // Route to get duplicates barcode number
// router.get('/duplicatesbarcodenumber', authMiddleware.authenticateUser, authMiddleware.checkUserRole(["admin", "branchAdmin", "employee"]), userPaymentDataController.getDuplicateBarcodeNumbers);

// router.post('/delete-multiple-user-payment-info', authMiddleware.authenticateUser, authMiddleware.checkUserRole(["admin"]), userPaymentDataController.deleteMultipleUserPaymentData);
// router.put('/update-user-payment-info/:id', authMiddleware.authenticateUser, authMiddleware.checkUserRole(["admin"]), userPaymentDataController.updateUserPaymentDataById);
// router.delete('/delete-user-payment-info/:id', authMiddleware.authenticateUser, authMiddleware.checkUserRole(["admin"]), userPaymentDataController.deleteUserPaymentDataById);

// module.exports = router;






const express = require('express');
const router = express.Router();
const userPaymentDataController = require('../controllers/userPaymentDataController');
const authMiddleware = require('../middleware/authMiddleware');


router.get('/completed/all', authMiddleware.authenticateUser, authMiddleware.checkUserRole(["admin", "branchAdmin", "employee"]), userPaymentDataController.transferAllCompletedData);


router.get(
    '/completed/paginated-with-filters',
    authMiddleware.authenticateUser,
    authMiddleware.checkUserRole(["admin", "branchAdmin", "employee"]),
    userPaymentDataController.getCompletedDataWithFilters 
);

router.get('/completed/duplicates', authMiddleware.authenticateUser, authMiddleware.checkUserRole(["admin", "branchAdmin", "employee"]), userPaymentDataController.getDuplicateBarcodes);

router.delete('/completed/delete-multiple-bookings', userPaymentDataController.deleteMultipleBookingData);




module.exports = router;








// const express = require('express');
// const router = express.Router();
// const userPaymentDataController = require('../controllers/userPaymentDataController');
// const authMiddleware = require('../middleware/authMiddleware');



// // router.get('/get-paymentinfo-data', authMiddleware.authenticateUser, authMiddleware.checkUserRole(["admin", "branchAdmin", "employee"]), userPaymentDataController.getPaginatedPaidUserInfos);
// // router.get('/get-user-payment-info', authMiddleware.authenticateUser, authMiddleware.checkUserRole(["admin", "branchAdmin", "employee"]), userPaymentDataController.getUserPaymentData);
// // // Route to get duplicates barcode number
// // router.get('/duplicatesbarcodenumber', authMiddleware.authenticateUser, authMiddleware.checkUserRole(["admin", "branchAdmin", "employee"]), userPaymentDataController.getDuplicateBarcodeNumbers);

// // router.post('/delete-multiple-user-payment-info', authMiddleware.authenticateUser, authMiddleware.checkUserRole(["admin"]), userPaymentDataController.deleteMultipleUserPaymentData);
// // router.put('/update-user-payment-info/:id', authMiddleware.authenticateUser, authMiddleware.checkUserRole(["admin"]), userPaymentDataController.updateUserPaymentDataById);
// // router.delete('/delete-user-payment-info/:id', authMiddleware.authenticateUser, authMiddleware.checkUserRole(["admin"]), userPaymentDataController.deleteUserPaymentDataById);


// //router.get('/transfer/completed',  authMiddleware.authenticateUser, authMiddleware.checkUserRole(["admin", "branchAdmin", "employee"]), userPaymentDataController.transferCompletedData);
// //router.get('/completed/paginated-with-filters',  authMiddleware.authenticateUser, authMiddleware.checkUserRole(["admin", "branchAdmin", "employee"]), userPaymentDataController.transferCompletedPaginatedData);

// router.get(
//     '/completed/paginated-with-filters',
//     authMiddleware.authenticateUser,
//     authMiddleware.checkUserRole(["admin", "branchAdmin", "employee"]),
//     userPaymentDataController.getCompletedDataWithFilters 
// );

// router.get('/transfer/duplicates', authMiddleware.authenticateUser, authMiddleware.checkUserRole(["admin", "branchAdmin", "employee"]), userPaymentDataController.transferDuplicateData);
// router.get('/transfer/all', authMiddleware.authenticateUser, authMiddleware.checkUserRole(["admin", "branchAdmin", "employee"]), userPaymentDataController.transferAllCompletedData);

// router.delete('/delete-multiple-bookings', authMiddleware.authenticateUser, authMiddleware.checkUserRole(["admin", "branchAdmin", "employee"]), userPaymentDataController.deleteMultipleBookingData);



// module.exports = router;
