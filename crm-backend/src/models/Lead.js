// src/models/Lead.js
// Lead / contact form submission model

const mongoose = require('mongoose');

// Sub-schema for notes/follow-ups
const noteSchema = new mongoose.Schema(
  {
    text: {
      type: String,
      required: [true, 'Note text is required'],
      trim: true,
      maxlength: [1000, 'Note cannot exceed 1000 characters'],
    },
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    addedByName: {
      type: String, // denormalized for quick display
    },
  },
  { timestamps: true }
);

// Sub-schema for status change history
const statusHistorySchema = new mongoose.Schema(
  {
    from: String,
    to: String,
    changedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    changedByName: String,
  },
  { timestamps: true }
);

const leadSchema = new mongoose.Schema(
  {
    // ── Contact Info ──────────────────────────────
    firstName: {
      type: String,
      required: [true, 'First name is required'],
      trim: true,
      maxlength: [50, 'First name too long'],
    },
    lastName: {
      type: String,
      trim: true,
      default: '',
      maxlength: [50, 'Last name too long'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
    },
    phone: {
      type: String,
      trim: true,
      default: '',
    },
    company: {
      type: String,
      trim: true,
      default: '',
      maxlength: [100, 'Company name too long'],
    },
    message: {
      type: String,
      trim: true,
      default: '',
      maxlength: [2000, 'Message too long'],
    },

    // ── CRM Fields ────────────────────────────────
    source: {
      type: String,
      enum: ['web', 'social', 'referral', 'cold', 'email', 'other'],
      default: 'web',
    },
    status: {
      type: String,
      enum: ['new', 'contacted', 'qualified', 'converted', 'lost'],
      default: 'new',
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
    },

    // ── Relationships ─────────────────────────────
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    notes: [noteSchema],
    statusHistory: [statusHistorySchema],

    // ── Follow-up ─────────────────────────────────
    followUpDate: {
      type: Date,
      default: null,
    },

    // ── Meta ──────────────────────────────────────
    tags: {
      type: [String],
      default: [],
    },
    isArchived: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ─── VIRTUALS ────────────────────────────────────────────────────────────────

leadSchema.virtual('fullName').get(function () {
  return `${this.firstName} ${this.lastName}`.trim();
});

// ─── INDEXES ─────────────────────────────────────────────────────────────────
// Speed up common queries
leadSchema.index({ status: 1 });
leadSchema.index({ email: 1 });
leadSchema.index({ createdAt: -1 });
leadSchema.index({ assignedTo: 1 });
leadSchema.index({ source: 1 });
// Text search index
leadSchema.index({ firstName: 'text', lastName: 'text', email: 'text', company: 'text' });

module.exports = mongoose.model('Lead', leadSchema);
