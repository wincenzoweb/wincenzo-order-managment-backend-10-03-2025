const express = require('express');
const router = express.Router();
const shiprocketController = require('../controllers/shiprocketController');

const shiprocketAuthMiddleware = require('../middleware/checkShiprocketToken');


// Apply middleware to protect Shiprocket-related routes
router.post('/login', shiprocketController.addOrUpdateCredentials);

// Apply middleware to any route that interacts with Shiprocket
router.get('/gettoken', shiprocketAuthMiddleware, shiprocketController.getToken);

router.put('/updatecredentials', shiprocketAuthMiddleware, shiprocketController.updateCredentials);

router.get('/getcredentials',shiprocketAuthMiddleware, shiprocketController.getCredentials);


router.post('/track-order', shiprocketController.trackOrderByAWB);



module.exports = router;
