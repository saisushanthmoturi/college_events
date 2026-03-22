const Event = require('../models/Event');
const Notification = require('../models/Notification');

// GET /api/events
exports.getEvents = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.category) filter.category = req.query.category;
    if (req.query.club) filter.club = req.query.club;
    if (req.query.featured === 'true') filter.isFeatured = true;
    if (req.query.search) {
      filter.title = { $regex: req.query.search, $options: 'i' };
    }

    // Only show approved published events to participants
    if (!req.query.all) {
      filter.isApproved = true;
      filter.status = filter.status || { $in: ['published', 'ongoing'] };
    }

    const [events, total] = await Promise.all([
      Event.find(filter)
        .populate('club', 'name logo')
        .populate('organizer', 'name email')
        .skip(skip)
        .limit(limit)
        .sort({ date: 1 }),
      Event.countDocuments(filter),
    ]);

    res.json({
      success: true,
      events,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/events/:id
exports.getEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('club', 'name logo description')
      .populate('organizer', 'name email avatar');

    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    res.json({ success: true, event });
  } catch (error) {
    next(error);
  }
};

// POST /api/events
exports.createEvent = async (req, res, next) => {
  try {
    const data = { ...req.body, organizer: req.user._id };
    if (req.file) {
      data.coverImage = req.file.path.startsWith('http') ? req.file.path : `/uploads/${req.file.filename}`;
    }
    if (data.tags && typeof data.tags === 'string') {
      data.tags = data.tags.split(',').map((t) => t.trim());
    }
    if (data.price) data.price = Number(data.price);
    if (data.capacity) data.capacity = Number(data.capacity);

    const event = await Event.create(data);

    res.status(201).json({ success: true, event });
  } catch (error) {
    next(error);
  }
};

// PUT /api/events/:id
exports.updateEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id).populate('club');
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    const isAuthorized = 
      req.user.role === 'superadmin' || 
      event.organizer.toString() === req.user._id.toString() ||
      (event.club && (
        event.club.admin.toString() === req.user._id.toString() ||
        (event.club.president && event.club.president.toString() === req.user._id.toString()) ||
        (event.club.vicePresident && event.club.vicePresident.toString() === req.user._id.toString())
      ));

    if (!isAuthorized) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const updates = { ...req.body };
    if (req.file) {
      updates.coverImage = req.file.path.startsWith('http') ? req.file.path : `/uploads/${req.file.filename}`;
    }
    if (updates.tags && typeof updates.tags === 'string') {
      updates.tags = updates.tags.split(',').map((t) => t.trim());
    }
    if (updates.price) updates.price = Number(updates.price);
    if (updates.capacity) updates.capacity = Number(updates.capacity);

    const updated = await Event.findByIdAndUpdate(req.params.id, updates, { new: true });
    res.json({ success: true, event: updated });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/events/:id
exports.deleteEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id).populate('club');
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    const isAuthorized = 
      req.user.role === 'superadmin' || 
      event.organizer.toString() === req.user._id.toString() ||
      (event.club && (
        event.club.admin.toString() === req.user._id.toString() ||
        (event.club.president && event.club.president.toString() === req.user._id.toString()) ||
        (event.club.vicePresident && event.club.vicePresident.toString() === req.user._id.toString())
      ));

    if (!isAuthorized) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    await Event.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Event deleted' });
  } catch (error) {
    next(error);
  }
};

// PUT /api/events/:id/approve
exports.approveEvent = async (req, res, next) => {
  try {
    const event = await Event.findByIdAndUpdate(
      req.params.id,
      { isApproved: true, status: 'published' },
      { new: true }
    );

    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    // Notify organizer
    await Notification.create({
      user: event.organizer,
      title: 'Event Approved',
      message: `Your event "${event.title}" has been approved and published!`,
      type: 'success',
      link: `/events/${event._id}`,
    });

    res.json({ success: true, event });
  } catch (error) {
    next(error);
  }
};

// POST /api/events/:id/gallery
exports.uploadGallery = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id).populate('club');
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    const isAuthorized = 
      req.user.role === 'superadmin' || 
      event.organizer.toString() === req.user._id.toString() ||
      (event.club && (
        event.club.admin.toString() === req.user._id.toString() ||
        (event.club.president && event.club.president.toString() === req.user._id.toString()) ||
        (event.club.vicePresident && event.club.vicePresident.toString() === req.user._id.toString())
      ));

    if (!isAuthorized) {
      return res.status(403).json({ success: false, message: 'Not authorized to upload gallery' });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, message: 'No files uploaded' });
    }

    const paths = req.files.map((f) => f.path.startsWith('http') ? f.path : `/uploads/${f.filename}`);
    event.gallery.push(...paths);
    await event.save();

    res.json({ success: true, gallery: event.gallery });
  } catch (error) {
    next(error);
  }
};

// GET /api/events/stats
exports.getStats = async (req, res, next) => {
  try {
    const [totalEvents, publishedEvents, completedEvents] = await Promise.all([
      Event.countDocuments(),
      Event.countDocuments({ status: 'published', isApproved: true }),
      Event.countDocuments({ status: 'completed' }),
    ]);

    res.json({
      success: true,
      stats: { totalEvents, publishedEvents, completedEvents },
    });
  } catch (error) {
    next(error);
  }
};
