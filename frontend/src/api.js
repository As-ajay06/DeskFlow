const API = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

export async function fetchTickets(filters = {}) {
  const params = new URLSearchParams();
  if (filters.status) params.set('status', filters.status);
  if (filters.priority) params.set('priority', filters.priority);
  if (filters.breached) params.set('breached', 'true');

  const res = await fetch(`${API}/tickets?${params}`);
  if (!res.ok) throw new Error((await res.json()).error || 'Failed to fetch tickets');
  return res.json();
}

export async function fetchStats() {
  const res = await fetch(`${API}/tickets/stats`);
  if (!res.ok) throw new Error('Failed to fetch stats');
  return res.json();
}

export async function createTicket(data) {
  const res = await fetch(`${API}/tickets`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok) throw json;
  return json;
}

export async function updateTicket(id, data) {
  const res = await fetch(`${API}/tickets/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok) throw json;
  return json;
}

export async function deleteTicket(id) {
  const res = await fetch(`${API}/tickets/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete ticket');
  return res.json();
}
