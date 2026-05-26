import { useState, useEffect, useCallback } from 'react';
import { fetchTickets, fetchStats } from './api';
import Board from './components/Board';
import StatsStrip from './components/StatsStrip';
import Filters from './components/Filters';
import CreateTicketModal from './components/CreateTicketModal';

export default function App() {
  const [tickets, setTickets] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');
  const [showModal, setShowModal] = useState(false);

  // Filters
  const [priority, setPriority] = useState('');
  const [breached, setBreached] = useState(false);

  const loadTickets = useCallback(async () => {
    try {
      const filters = {};
      if (priority) filters.priority = priority;
      if (breached) filters.breached = true;
      const data = await fetchTickets(filters);
      setTickets(data);
      setError('');
    } catch (err) {
      setError(err.message || 'Failed to load tickets');
    }
  }, [priority, breached]);

  const loadStats = useCallback(async () => {
    try {
      const data = await fetchStats();
      setStats(data);
    } catch {
      // stats failing silently is fine
    }
  }, []);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      await Promise.all([loadTickets(), loadStats()]);
      setLoading(false);
    };
    load();
  }, [loadTickets, loadStats]);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const handleTicketUpdate = (updated, deletedId) => {
    if (deletedId) {
      setTickets((prev) => prev.filter((t) => t._id !== deletedId));
    } else if (updated) {
      setTickets((prev) => {
        const exists = prev.find((t) => t._id === updated._id);
        if (exists) {
          return prev.map((t) => (t._id === updated._id ? updated : t));
        }
        return [updated, ...prev];
      });
    }
    loadStats();
  };

  const handleTicketCreated = (ticket) => {
    setTickets((prev) => [ticket, ...prev]);
    loadStats();
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>
          <span>Desk</span>Flow
        </h1>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          + New Ticket
        </button>
      </header>

      <StatsStrip stats={stats} />

      <Filters
        priority={priority}
        onPriorityChange={setPriority}
        breached={breached}
        onBreachedChange={setBreached}
      />

      {error && <div className="error-banner">{error}</div>}

      {loading ? (
        <div className="loading">
          <div className="spinner" />
          Loading tickets...
        </div>
      ) : (
        <Board tickets={tickets} onTicketUpdate={handleTicketUpdate} onError={showToast} />
      )}

      {toast && <div className="toast">{toast}</div>}

      {showModal && (
        <CreateTicketModal onClose={() => setShowModal(false)} onCreated={handleTicketCreated} />
      )}
    </div>
  );
}
