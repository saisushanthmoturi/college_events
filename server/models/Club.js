const mongoose = require('mongoose');

const clubSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Club name is required'],
    trim: true,
    unique: true,
  },
  description: {
    type: String,
    required: [true, 'Club description is required'],
  },
  logo: {
    type: String,
    default: '',
  },
  banner: {
    type: String,
    default: '',
  },
  category: {
    type: String,
    enum: ['technical', 'cultural', 'sports', 'literary', 'social', 'other'],
    default: 'other',
  },
  admin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  president: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  vicePresident: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  members: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  joinRequests: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    answers: {
      type: Map,
      of: String
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending'
    },
    submittedAt: {
      type: Date,
      default: Date.now
    }
  }],
  socialLinks: {
    website: { type: String, default: '' },
    instagram: { type: String, default: '' },
    twitter: { type: String, default: '' },
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, { timestamps: true });

module.exports = mongoose.model('Club', clubSchema);
