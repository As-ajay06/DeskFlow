import { useState, useEffect } from 'react';
import { updateTicket, deleteTicket } from '../api';

const TRANSITIONS = {
  open: ['in_progress'],
  in_progress: ['open', 'resolved'],
  resolved: ['in_progress', 'closed'],
  closed: ['resolved'],
};

const STATUS_LABELS = {
  open: 'Open',
  in_progress: 'In Progress',
  resolved: 'Resolved',
  closed: 'Closed',
};

const SLA_TARGETS = {
  urgent: 60,
  high: 240,
  medium: 1440,
  low: 4320,
};

function formatAge(minutes) {
  if (minutes < 60) return `${minutes}m`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h < 24) return `${h}h ${m}m`;
  const d = Math.floor(h / 24);
  const rh = h % 24;
  return `${d}d ${rh}h`;
}

function formatSLATarget(priority) {
  const mins = SLA_TARGETS[priority];
  if (mins < 60) return `${mins}m`;
  if (mins < 1440) return `${mins / 60}h`;
  return `${mins / 1440}d`;
}

function formatDateTime(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}

function computeLiveAge(ticket) {
  const created = new Date(ticket.createdAt);
  const now = new Date();
  if ((ticket.status === 'resolved' || ticket.status === 'closed') && ticket.resolvedAt) {
    return Math.floor((new Date(ticket.resolvedAt) - created) / 60000);
  }
  return Math.floor((now - created) / 60000);
}

export default function TicketCard({ ticket, onUpdate, onError }) {
  const allowed = TRANSITIONS[ticket.status] || [];
  const [liveAge, setLiveAge] = useState(() => computeLiveAge(ticket));

  // Live-update age every 30 seconds for open/in_progress tickets
  useEffect(() => {
    setLiveAge(computeLiveAge(ticket));
    if (ticket.status === 'open' || ticket.status === 'in_progress') {
      const timer = setInterval(() => {
        setLiveAge(computeLiveAge(ticket));
      }, 30000);
      return () => clearInterval(timer);
    }
  }, [ticket]);

  const slaTarget = SLA_TARGETS[ticket.priority];
  const isBreached = ticket.slaBreached;
  const slaRemaining = slaTarget - liveAge;

  const handleMove = async (newStatus) => {
    try {
      const updated = await updateTicket(ticket._id, { status: newStatus });
      onUpdate(updated);
    } catch (err) {
      onError(err.error || 'Failed to move ticket');
    }
  };

  const handleDelete = async () => {
    try {
      await deleteTicket(ticket._id);
      onUpdate(null, ticket._id);
    } catch (err) {
      onError(err.error || 'Failed to delete ticket');
    }
  };

  return (
    <div
      className={`ticket-card ${isBreached ? 'sla-breached' : ''}`}
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData('ticketId', ticket._id);
        e.dataTransfer.setData('currentStatus', ticket.status);
        e.currentTarget.classList.add('dragging');
      }}
      onDragEnd={(e) => {
        e.currentTarget.classList.remove('dragging');
      }}
    >
      <div className="ticket-card-header">
        <span className="ticket-subject">{ticket.subject}</span>
        <span className={`priority-badge ${ticket.priority}`}>{ticket.priority}</span>
      </div>

      <div className="ticket-timing">
        <div className="timing-row">
          <span className="timing-label">Created</span>
          <span className="timing-value">{formatDateTime(ticket.createdAt)}</span>
        </div>
        <div className="timing-row">
          <span className="timing-label">Age</span>
          <span className={`timing-value ${isBreached ? 'breached-text' : ''}`}>
            ⏱ {formatAge(liveAge)}
          </span>
        </div>
        <div className="timing-row">
          <span className="timing-label">SLA Target</span>
          <span className="timing-value">{formatSLATarget(ticket.priority)}</span>
        </div>
        {(ticket.status === 'open' || ticket.status === 'in_progress') && !isBreached && (
          <div className="timing-row">
            <span className="timing-label">SLA Remaining</span>
            <span className={`timing-value ${slaRemaining <= 30 ? 'warning-text' : ''}`}>
              {formatAge(Math.max(0, slaRemaining))}
            </span>
          </div>
        )}
        {ticket.resolvedAt && (
          <div className="timing-row">
            <span className="timing-label">Resolved</span>
            <span className="timing-value">{formatDateTime(ticket.resolvedAt)}</span>
          </div>
        )}
      </div>

      {isBreached && (
        <div className="sla-breach-banner">⚠ SLA Breached — exceeded by {formatAge(liveAge - slaTarget)}</div>
      )}

      <div className="ticket-actions">
        {allowed.map((s) => (
          <button key={s} className="btn btn-sm btn-ghost" onClick={() => handleMove(s)}>
            → {STATUS_LABELS[s]}
          </button>
        ))}
        <button className="btn btn-sm btn-danger" onClick={handleDelete} title="Delete ticket">
          ✕
        </button>
      </div>
    </div>
  );
}
