const express = require('express');
const router = express.Router();
const { getClubs, getClub, createClub, updateClub, deleteClub, joinClub, resolveJoinRequest } = require('../controllers/clubController');
const protect = require('../middleware/auth');
const authorize = require('../middleware/role');
const upload = require('../middleware/upload');

router.get('/', getClubs);
router.get('/:id', getClub);
router.post('/', protect, authorize('superadmin', 'clubadmin', 'club_president', 'club_vp'), upload.single('logo'), createClub);
router.put('/:id', protect, authorize('superadmin', 'clubadmin', 'club_president', 'club_vp'), upload.single('logo'), updateClub);
router.delete('/:id', protect, authorize('superadmin', 'clubadmin', 'club_president', 'club_vp'), deleteClub);
router.post('/:id/join', protect, joinClub);
router.post('/:id/requests/:reqId/resolve', protect, authorize('superadmin', 'clubadmin', 'club_president', 'club_vp'), resolveJoinRequest);

module.exports = router;
