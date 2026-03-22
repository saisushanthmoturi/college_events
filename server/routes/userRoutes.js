const express = require('express');
const router = express.Router();
const { getAllUsers, updateUserRole, deleteUser } = require('../controllers/userController');
const protect = require('../middleware/auth');
const authorize = require('../middleware/role');

router.get('/', protect, authorize('superadmin'), getAllUsers);
router.put('/:id/role', protect, authorize('superadmin'), updateUserRole);
router.delete('/:id', protect, authorize('superadmin'), deleteUser);

module.exports = router;
