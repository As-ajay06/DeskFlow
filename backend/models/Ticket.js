const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema(
  {
    subject: {
      type: String,
      required: [true, 'Subject is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
    },
    customerEmail: {
      type: String,
      required: [true, 'Customer email is required'],
      trim: true,
      lowercase: true,
      validate: {
        validator: function (v) {
          return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
        },
        message: 'Please provide a valid email address',
      },
    },
    priority: {
      type: String,
      required: [true, 'Priority is required'],
      enum: {
        values: ['low', 'medium', 'high', 'urgent'],
        message: 'Priority must be one of: low, medium, high, urgent',
      },
    },
    status: {
      type: String,
      enum: {
        values: ['open', 'in_progress', 'resolved', 'closed'],
        message: 'Status must be one of: open, in_progress, resolved, closed',
      },
      default: 'open',
    },
    resolvedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

// SLA targets in minutes
const SLA_TARGETS = {
  urgent: 60,
  high: 240,
  medium: 1440,
  low: 4320,
};

// Compute derived fields
ticketSchema.methods.toResponseJSON = function () {
  const obj = this.toObject();
  const now = new Date();

  // ageMinutes: time between createdAt and now, or createdAt and resolvedAt
  const endTime =
    (obj.status === 'resolved' || obj.status === 'closed') && obj.resolvedAt
      ? obj.resolvedAt
      : now;
  obj.ageMinutes = Math.floor((endTime - obj.createdAt) / 60000);

  // slaBreached: true if unresolved past target, or resolved after target
  const targetMinutes = SLA_TARGETS[obj.priority];
  if (obj.status === 'resolved' || obj.status === 'closed') {
    // Check if it was resolved after the target
    const resolveTime = obj.resolvedAt || now;
    const minutesToResolve = Math.floor((resolveTime - obj.createdAt) / 60000);
    obj.slaBreached = minutesToResolve > targetMinutes;
  } else {
    // Still open/in_progress — check if past target
    const minutesOpen = Math.floor((now - obj.createdAt) / 60000);
    obj.slaBreached = minutesOpen > targetMinutes;
  }

  // Clean up mongoose internals
  delete obj.__v;

  return obj;
};

module.exports = mongoose.model('Ticket', ticketSchema);
module.exports.SLA_TARGETS = SLA_TARGETS;
