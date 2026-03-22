const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Event title is required'],
    trim: true,
  },
  description: {
    type: String,
    required: [true, 'Event description is required'],
  },
  date: {
    type: Date,
    required: [true, 'Event date is required'],
  },
  endDate: {
    type: Date,
  },
  time: {
    type: String,
    default: '',
  },
  venue: {
    type: String,
    required: [true, 'Venue is required'],
  },
  club: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Club',
    required: true,
  },
  organizer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  price: {
    type: Number,
    default: 0,
  },
  capacity: {
    type: Number,
    default: 100,
  },
  registrationCount: {
    type: Number,
    default: 0,
  },
  category: {
    type: String,
    enum: ['workshop', 'seminar', 'hackathon', 'competition', 'cultural', 'sports', 'other'],
    default: 'other',
  },
  coverImage: {
    type: String,
    default: '',
  },
  gallery: [{
    type: String,
  }],
  tags: [{
    type: String,
  }],
  status: {
    type: String,
    enum: ['draft', 'published', 'ongoing', 'completed', 'cancelled'],
    default: 'draft',
  },
  isApproved: {
    type: Boolean,
    default: false,
  },
  chiefGuest: {
    type: String,
    default: '',
  },
  hostDetails: {
    type: String,
    default: '',
  },
  isFeatured: {
    type: Boolean,
    default: false,
  },
}, { timestamps: true });

module.exports = mongoose.model('Event', eventSchema);
