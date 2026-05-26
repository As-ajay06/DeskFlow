import { useState } from 'react';
import TicketCard from './TicketCard';
import { updateTicket } from '../api';

const STATUSES = ['open', 'in_progress', 'resolved', 'closed'];

const VALID_TRANSITIONS = {
  open: ['in_progress'],
  in_progress: ['resolved', 'open'],
  resolved: ['closed', 'in_progress'],
  closed: ['resolved'],
};

const COLUMN_LABELS = {
  open: 'Open',
  in_progress: 'In Progress',
  resolved: 'Resolved',
  closed: 'Closed',
};

export default function Board({ tickets, onTicketUpdate, onError }) {
  const [dragOverCol, setDragOverCol] = useState(null);

  const grouped = {};
  STATUSES.forEach((s) => (grouped[s] = []));
  tickets.forEach((t) => {
    if (grouped[t.status]) grouped[t.status].push(t);
  });

  const handleDrop = async (e, targetStatus) => {
    e.preventDefault();
    setDragOverCol(null);

    const ticketId = e.dataTransfer.getData('ticketId');
    const currentStatus = e.dataTransfer.getData('currentStatus');

    if (currentStatus === targetStatus) return;

    const allowed = VALID_TRANSITIONS[currentStatus] || [];
    if (!allowed.includes(targetStatus)) {
      onError(`Cannot move from ${COLUMN_LABELS[currentStatus]} to ${COLUMN_LABELS[targetStatus]}`);
      return;
    }

    try {
      const updated = await updateTicket(ticketId, { status: targetStatus });
      onTicketUpdate(updated);
    } catch (err) {
      onError(err.error || 'Failed to move ticket');
    }
  };

  return (
    <div className="board">
      {STATUSES.map((status) => (
        <div
          key={status}
          data-status={status}
          className={`column ${dragOverCol === status ? 'drag-over' : ''}`}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOverCol(status);
          }}
          onDragLeave={() => setDragOverCol(null)}
          onDrop={(e) => handleDrop(e, status)}
        >
          <div className="column-header">
            <div className="column-title-wrap">
              <span className="column-dot" />
              <span className="column-title">{COLUMN_LABELS[status]}</span>
            </div>
            <span className="column-count">{grouped[status].length}</span>
          </div>
          <div className="column-cards">
            {grouped[status].length === 0 ? (
              <div className="empty-column">
                <span className="empty-icon">📭</span>
                No tickets
              </div>
            ) : (
              grouped[status].map((ticket) => (
                <TicketCard
                  key={ticket._id}
                  ticket={ticket}
                  onUpdate={(updated, deletedId) => {
                    if (deletedId) {
                      onTicketUpdate(null, deletedId);
                    } else {
                      onTicketUpdate(updated);
                    }
                  }}
                  onError={onError}
                />
              ))
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
