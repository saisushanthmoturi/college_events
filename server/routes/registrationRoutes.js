const express = require('express');
const router = express.Router();
const {
  registerForEvent, getMyRegistrations, getEventRegistrations,
  markAttendance, cancelRegistration,
} = require('../controllers/registrationController');
const protect = require('../middleware/auth');
const authorize = require('../middleware/role');

router.post('/', protect, registerForEvent);
router.get('/my', protect, getMyRegistrations);
router.get('/event/:eventId', protect, authorize('superadmin', 'clubadmin'), getEventRegistrations);
router.put('/:id/attend', protect, authorize('superadmin', 'clubadmin'), markAttendance);
router.put('/:id/cancel', protect, cancelRegistration);

module.exports = router;
