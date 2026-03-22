const Club = require('../models/Club');

// GET /api/clubs
exports.getClubs = async (req, res, next) => {
  try {
    const filter = { isActive: true };
    if (req.query.category) filter.category = req.query.category;
    if (req.query.search) {
      filter.name = { $regex: req.query.search, $options: 'i' };
    }

    const clubs = await Club.find(filter)
      .populate('admin', 'name email avatar')
      .populate('president', 'name email avatar')
      .populate('vicePresident', 'name email avatar')
      .sort({ createdAt: -1 });

    res.json({ success: true, clubs });
  } catch (error) {
    next(error);
  }
};

// GET /api/clubs/:id
exports.getClub = async (req, res, next) => {
  try {
    const club = await Club.findById(req.params.id)
      .populate('admin', 'name email avatar')
      .populate('president', 'name email avatar')
      .populate('vicePresident', 'name email avatar')
      .populate('members', 'name email avatar department')
      .populate('joinRequests.user', 'name email avatar department year');

    if (!club) {
      return res.status(404).json({ success: false, message: 'Club not found' });
    }

    res.json({ success: true, club });
  } catch (error) {
    next(error);
  }
};

// POST /api/clubs
exports.createClub = async (req, res, next) => {
  try {
    const { name, description, category, socialLinks } = req.body;

    const club = await Club.create({
      name,
      description,
      category,
      socialLinks: socialLinks ? JSON.parse(socialLinks) : {},
      admin: req.user._id,
      logo: req.file ? (req.file.path.startsWith('http') ? req.file.path : `/uploads/${req.file.filename}`) : '',
    });

    res.status(201).json({ success: true, club });
  } catch (error) {
    next(error);
  }
};

// PUT /api/clubs/:id
exports.updateClub = async (req, res, next) => {
  try {
    const club = await Club.findById(req.params.id);
    if (!club) {
      return res.status(404).json({ success: false, message: 'Club not found' });
    }

    // Only club admin or super-admin can update
    if (club.admin.toString() !== req.user._id.toString() && req.user.role !== 'superadmin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const updates = { ...req.body };
    if (req.file) {
      updates.logo = req.file.path.startsWith('http') ? req.file.path : `/uploads/${req.file.filename}`;
    }
    if (updates.socialLinks && typeof updates.socialLinks === 'string') {
      updates.socialLinks = JSON.parse(updates.socialLinks);
    }

    const updated = await Club.findByIdAndUpdate(req.params.id, updates, { new: true });
    res.json({ success: true, club: updated });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/clubs/:id
exports.deleteClub = async (req, res, next) => {
  try {
    const club = await Club.findById(req.params.id);
    if (!club) {
      return res.status(404).json({ success: false, message: 'Club not found' });
    }

    if (club.admin.toString() !== req.user._id.toString() && req.user.role !== 'superadmin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    await Club.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Club deleted' });
  } catch (error) {
    next(error);
  }
};

// POST /api/clubs/:id/join
exports.joinClub = async (req, res, next) => {
  try {
    const club = await Club.findById(req.params.id);
    if (!club) {
      return res.status(404).json({ success: false, message: 'Club not found' });
    }

    if (club.members.includes(req.user._id)) {
      return res.status(400).json({ success: false, message: 'Already a member' });
    }
    
    // Check if already requested
    const existingReq = club.joinRequests.find(r => r.user.toString() === req.user._id.toString() && r.status === 'pending');
    if (existingReq) {
      return res.status(400).json({ success: false, message: 'Join request already pending' });
    }

    // answers from the dynamic form
    const answers = req.body.answers || {};

    club.joinRequests.push({
      user: req.user._id,
      answers,
      status: 'pending'
    });
    await club.save();

    res.json({ success: true, message: 'Join request submitted successfully' });
  } catch (error) {
    next(error);
  }
};

// POST /api/clubs/:id/requests/:reqId/resolve
exports.resolveJoinRequest = async (req, res, next) => {
  try {
    const { status } = req.body; // 'approved' or 'rejected'
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const club = await Club.findById(req.params.id);
    if (!club) {
      return res.status(404).json({ success: false, message: 'Club not found' });
    }

    const isAuthorized = 
      req.user.role === 'superadmin' || 
      club.admin.toString() === req.user._id.toString() ||
      (club.president && club.president.toString() === req.user._id.toString()) || 
      (club.vicePresident && club.vicePresident.toString() === req.user._id.toString());
      
    if (!isAuthorized) {
      return res.status(403).json({ success: false, message: 'Not authorized to manage join requests' });
    }

    const request = club.joinRequests.id(req.params.reqId);
    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }

    request.status = status;
    
    if (status === 'approved') {
      if (!club.members.includes(request.user)) {
        club.members.push(request.user);
      }
    }

    await club.save();
    res.json({ success: true, message: `Request ${status}` });
  } catch (error) {
    next(error);
  }
};
