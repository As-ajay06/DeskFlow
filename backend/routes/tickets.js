const express = require('express');
const router = express.Router();
const Ticket = require('../models/Ticket');
const { SLA_TARGETS } = require('../models/Ticket');

// Valid status transitions: forward only one step, backward only one step
const VALID_TRANSITIONS = {
  open: ['in_progress'],
  in_progress: ['resolved', 'open'],
  resolved: ['closed', 'in_progress'],
  closed: ['resolved'],
};

// POST /tickets — Create a ticket
router.post('/', async (req, res) => {
  try {
    const { subject, description, customerEmail, priority } = req.body;

    const ticket = new Ticket({ subject, description, customerEmail, priority });
    await ticket.save();

    res.status(201).json(ticket.toResponseJSON());
  } catch (err) {
    if (err.name === 'ValidationError') {
      const errors = {};
      for (const field in err.errors) {
        errors[field] = err.errors[field].message;
      }
      return res.status(400).json({ error: 'Validation failed', details: errors });
    }
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /tickets/stats — Aggregate counts
router.get('/stats', async (req, res) => {
  try {
    const tickets = await Ticket.find();
    const now = new Date();

    const stats = {
      byStatus: { open: 0, in_progress: 0, resolved: 0, closed: 0 },
      byPriority: { low: 0, medium: 0, high: 0, urgent: 0 },
      breachedOpen: 0,
    };

    tickets.forEach((ticket) => {
      stats.byStatus[ticket.status]++;
      stats.byPriority[ticket.priority]++;

      // Count breached tickets that are still open (not resolved/closed)
      if (ticket.status === 'open' || ticket.status === 'in_progress') {
        const minutesOpen = Math.floor((now - ticket.createdAt) / 60000);
        const target = SLA_TARGETS[ticket.priority];
        if (minutesOpen > target) {
          stats.breachedOpen++;
        }
      }
    });

    res.json(stats);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /tickets — List tickets with optional filters
router.get('/', async (req, res) => {
  try {
    const { status, priority, breached } = req.query;
    const filter = {};

    if (status) {
      if (!['open', 'in_progress', 'resolved', 'closed'].includes(status)) {
        return res.status(400).json({ error: `Invalid status: ${status}` });
      }
      filter.status = status;
    }

    if (priority) {
      if (!['low', 'medium', 'high', 'urgent'].includes(priority)) {
        return res.status(400).json({ error: `Invalid priority: ${priority}` });
      }
      filter.priority = priority;
    }

    const tickets = await Ticket.find(filter).sort({ createdAt: -1 });

    let results = tickets.map((t) => t.toResponseJSON());

    // Filter breached tickets
    if (breached === 'true') {
      results = results.filter((t) => t.slaBreached === true);
    }

    res.json(results);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// PATCH /tickets/:id — Update a ticket (status transition)
router.patch('/:id', async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    const { status, subject, description, customerEmail, priority } = req.body;

    // Handle status transition
    if (status && status !== ticket.status) {
      const allowed = VALID_TRANSITIONS[ticket.status];
      if (!allowed || !allowed.includes(status)) {
        return res.status(400).json({
          error: `Invalid status transition from '${ticket.status}' to '${status}'. Allowed transitions: ${(allowed || []).join(', ')}`,
        });
      }

      // Set resolvedAt when moving to resolved
      if (status === 'resolved') {
        ticket.resolvedAt = new Date();
      }

      // Clear resolvedAt when moving back from resolved
      if (ticket.status === 'resolved' && status !== 'closed') {
        ticket.resolvedAt = null;
      }

      ticket.status = status;
    }

    // Update other fields if provided
    if (subject !== undefined) ticket.subject = subject;
    if (description !== undefined) ticket.description = description;
    if (customerEmail !== undefined) ticket.customerEmail = customerEmail;
    if (priority !== undefined) {
      if (!['low', 'medium', 'high', 'urgent'].includes(priority)) {
        return res.status(400).json({ error: `Invalid priority: ${priority}` });
      }
      ticket.priority = priority;
    }

    await ticket.save();
    res.json(ticket.toResponseJSON());
  } catch (err) {
    if (err.name === 'ValidationError') {
      const errors = {};
      for (const field in err.errors) {
        errors[field] = err.errors[field].message;
      }
      return res.status(400).json({ error: 'Validation failed', details: errors });
    }
    if (err.name === 'CastError') {
      return res.status(400).json({ error: 'Invalid ticket ID' });
    }
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /tickets/:id — Delete a ticket
router.delete('/:id', async (req, res) => {
  try {
    const ticket = await Ticket.findByIdAndDelete(req.params.id);
    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }
    res.json({ message: 'Ticket deleted' });
  } catch (err) {
    if (err.name === 'CastError') {
      return res.status(400).json({ error: 'Invalid ticket ID' });
    }
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
