
const express = require('express');
const router = express.Router();

const pendingOrderControlller = require('../controllers/pendingOrderController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/get-pending-orders', authMiddleware.authenticateUser, authMiddleware.checkUserRole(["admin", "branchAdmin", "employee"]), pendingOrderControlller.getPaginatedPendingData);
router.get('/getallpendingorders', authMiddleware.authenticateUser, authMiddleware.checkUserRole(["admin", "branchAdmin", "employee"]), pendingOrderControlller.getAllpendingOrder);
router.delete('/delete-pendinglist', authMiddleware.authenticateUser, authMiddleware.checkUserRole(["admin"]), pendingOrderControlller.deleteMultiplePendingOrder);

router.put('/:id', authMiddleware.authenticateUser, authMiddleware.checkUserRole(["admin"]), pendingOrderControlller.updatePendingOrderById);
router.delete('/:id', authMiddleware.authenticateUser, authMiddleware.checkUserRole(["admin"]), pendingOrderControlller.deletePendingOrderById);


router.get('/duplicatesbarcodenumber', authMiddleware.authenticateUser, authMiddleware.checkUserRole(["admin", "branchAdmin", "employee"]), pendingOrderControlller.getDuplicateBarcodeNumbers);



// router.post('/move-old-orders', 
//     authMiddleware.authenticateUser, // Ensure user is authenticated
//     authMiddleware.checkUserRole(["admin"]), // Ensure user has "admin" role
//     async (req, res) => {
//         try {
//             await pendingOrderControlller.moveOldOrdersToPending();
//             res.status(200).json({ message: 'Old orders moved to pending successfully.' });
//         } catch (error) {
//             console.error('Error in moving old orders:', error);
//             res.status(500).json({ error: 'Failed to move old orders to pending.' });
//         }
//     }
// );


module.exports = router;
