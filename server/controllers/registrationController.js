const Registration = require('../models/Registration');
const Event = require('../models/Event');
const Notification = require('../models/Notification');

// POST /api/registrations
exports.registerForEvent = async (req, res, next) => {
  try {
    const { eventId, paymentId, orderId, amountPaid } = req.body;

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    if (event.registrationCount >= event.capacity) {
      return res.status(400).json({ success: false, message: 'Event is full' });
    }

    const existing = await Registration.findOne({ user: req.user._id, event: eventId });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Already registered for this event' });
    }

    const paymentStatus = event.price === 0 ? 'free' : (paymentId ? 'completed' : 'pending');

    const registration = await Registration.create({
      user: req.user._id,
      event: eventId,
      paymentId: paymentId || '',
      orderId: orderId || '',
      amountPaid: amountPaid || 0,
      paymentStatus,
      status: paymentStatus === 'free' || paymentStatus === 'completed' ? 'confirmed' : 'registered',
    });

    // Increment event registration count
    event.registrationCount += 1;
    await event.save();

    // Notify user
    await Notification.create({
      user: req.user._id,
      title: 'Registration Confirmed',
      message: `You have successfully registered for "${event.title}"!`,
      type: 'registration',
      link: `/events/${event._id}`,
    });

    res.status(201).json({ success: true, registration });
  } catch (error) {
    next(error);
  }
};

// GET /api/registrations/my
exports.getMyRegistrations = async (req, res, next) => {
  try {
    const registrations = await Registration.find({ user: req.user._id })
      .populate({
        path: 'event',
        populate: { path: 'club', select: 'name logo' },
      })
      .sort({ createdAt: -1 });

    res.json({ success: true, registrations });
  } catch (error) {
    next(error);
  }
};

// GET /api/registrations/event/:eventId
exports.getEventRegistrations = async (req, res, next) => {
  try {
    const registrations = await Registration.find({ event: req.params.eventId })
      .populate('user', 'name email department year phone')
      .sort({ createdAt: -1 });

    res.json({ success: true, registrations });
  } catch (error) {
    next(error);
  }
};

// PUT /api/registrations/:id/attend
exports.markAttendance = async (req, res, next) => {
  try {
    const registration = await Registration.findByIdAndUpdate(
      req.params.id,
      { attended: true },
      { new: true }
    );

    if (!registration) {
      return res.status(404).json({ success: false, message: 'Registration not found' });
    }

    res.json({ success: true, registration });
  } catch (error) {
    next(error);
  }
};

// PUT /api/registrations/:id/cancel
exports.cancelRegistration = async (req, res, next) => {
  try {
    const registration = await Registration.findById(req.params.id);
    if (!registration) {
      return res.status(404).json({ success: false, message: 'Registration not found' });
    }

    if (registration.user.toString() !== req.user._id.toString() && req.user.role === 'participant') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    registration.status = 'cancelled';
    await registration.save();

    // Decrement count
    await Event.findByIdAndUpdate(registration.event, { $inc: { registrationCount: -1 } });

    res.json({ success: true, message: 'Registration cancelled' });
  } catch (error) {
    next(error);
  }
};
