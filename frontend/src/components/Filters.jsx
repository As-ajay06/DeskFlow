export default function Filters({ priority, onPriorityChange, breached, onBreachedChange }) {
  return (
    <div className="filters-bar">
      <span className="filters-label">Filter</span>

      <select value={priority} onChange={(e) => onPriorityChange(e.target.value)}>
        <option value="">All Priorities</option>
        <option value="low">Low</option>
        <option value="medium">Medium</option>
        <option value="high">High</option>
        <option value="urgent">Urgent</option>
      </select>

      <label>
        <input type="checkbox" checked={breached} onChange={(e) => onBreachedChange(e.target.checked)} />
        SLA Breached Only
      </label>
    </div>
  );
}
