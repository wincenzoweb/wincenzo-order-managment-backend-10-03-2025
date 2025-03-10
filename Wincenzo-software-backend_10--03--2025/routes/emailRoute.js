const express = require('express');
const router = express.Router();
const emailController = require('../controllers/emailController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/sendmail', authMiddleware.authenticateUser, authMiddleware.checkUserRole(["admin"]), emailController.sendEmail);

module.exports = router;
