const express = require('express');
const router = express.Router();
const {
  getEvents, getEvent, createEvent, updateEvent, deleteEvent,
  approveEvent, uploadGallery, getStats,
} = require('../controllers/eventController');
const protect = require('../middleware/auth');
const authorize = require('../middleware/role');
const upload = require('../middleware/upload');

router.get('/stats', protect, getStats);
router.get('/', getEvents);
router.get('/:id', getEvent);
router.post('/', protect, authorize('superadmin', 'clubadmin', 'club_president', 'club_vp'), upload.single('coverImage'), createEvent);
router.put('/:id', protect, authorize('superadmin', 'clubadmin', 'club_president', 'club_vp'), upload.single('coverImage'), updateEvent);
router.delete('/:id', protect, authorize('superadmin', 'clubadmin', 'club_president', 'club_vp'), deleteEvent);
router.put('/:id/approve', protect, authorize('superadmin'), approveEvent);
router.post('/:id/gallery', protect, authorize('superadmin', 'clubadmin', 'club_president', 'club_vp'), upload.array('images', 10), uploadGallery);

module.exports = router;
