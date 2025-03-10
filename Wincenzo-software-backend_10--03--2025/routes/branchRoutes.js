const express = require('express');
const router = express.Router();
const branchController = require('../controllers/branchController');
const authMiddleware = require('../middleware/authMiddleware');


router.get('/', branchController.getBranches);
router.get('/:id', branchController.getBranchById);
router.post('/', authMiddleware.authenticateUser, authMiddleware.checkUserRole(["admin"]), branchController.createBranch);
router.put('/:id', authMiddleware.authenticateUser, authMiddleware.checkUserRole(["admin"]), branchController.updateBranch);
router.delete('/:id', authMiddleware.authenticateUser, authMiddleware.checkUserRole(["admin"]), branchController.deleteBranch);

module.exports = router;
