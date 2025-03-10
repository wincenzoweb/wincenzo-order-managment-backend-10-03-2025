const express = require("express")
const settingController = require("../controllers/settingController")
const authMiddleware = require('../middleware/authMiddleware');


const router = express.Router();

// Setting routes
router.post('/add-setting', authMiddleware.authenticateUser, authMiddleware.checkUserRole(["admin"]), settingController.createSetting);
router.get('/get-setting', settingController.getSetting);
router.put('/update-setting', authMiddleware.authenticateUser, authMiddleware.checkUserRole(["admin"]), settingController.updateSetting);
router.delete('/delete-setting', authMiddleware.authenticateUser, authMiddleware.checkUserRole(["admin"]), settingController.deleteSetting);

// ReceiverMail routes
router.post('/add-receiverMail', authMiddleware.authenticateUser, authMiddleware.checkUserRole(["admin"]), settingController.addNewReceiverMail);
router.get('/get-receiverMail', settingController.getAllReceiverMails);
router.put('/update-receiverMail/:id', authMiddleware.authenticateUser, authMiddleware.checkUserRole(["admin"]), settingController.updateReceiverMail);
router.delete('/delete-receiverMail/:id', authMiddleware.authenticateUser, authMiddleware.checkUserRole(["admin"]), settingController.deleteReceiverMail);

// router.post("/settings-details", authMiddleware.authenticateUser, authMiddleware.checkUserRole(["admin"]), settingController.createSetting);
// router.get("/getsettings", settingController.getSetting);
// router.put("/:id", authMiddleware.authenticateUser, authMiddleware.checkUserRole(["admin"]), settingController.updateSetting);
// router.delete("/:id", authMiddleware.authenticateUser, authMiddleware.checkUserRole(["admin"]), settingController.deleteSetting);

module.exports = router;