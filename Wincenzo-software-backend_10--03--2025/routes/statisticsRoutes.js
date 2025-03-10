const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const statisticsController = require('../controllers/statisticsController')

router.get('/match-counts', authMiddleware.authenticateUser, statisticsController.getMatchCounts);
router.get('/get-order-statistics', authMiddleware.authenticateUser, statisticsController.getOrderStatistics);
router.get('/get-employee-statistics', authMiddleware.authenticateUser, statisticsController.getEmployeeStatistics);

module.exports = router;