const mongoose = require('mongoose');

const registrationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true,
  },
  paymentId: {
    type: String,
    default: '',
  },
  orderId: {
    type: String,
    default: '',
  },
  amountPaid: {
    type: Number,
    default: 0,
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded', 'free'],
    default: 'pending',
  },
  attended: {
    type: Boolean,
    default: false,
  },
  certificateGenerated: {
    type: Boolean,
    default: false,
  },
  status: {
    type: String,
    enum: ['registered', 'confirmed', 'cancelled', 'waitlisted'],
    default: 'registered',
  },
}, { timestamps: true });

registrationSchema.index({ user: 1, event: 1 }, { unique: true });

module.exports = mongoose.model('Registration', registrationSchema);
