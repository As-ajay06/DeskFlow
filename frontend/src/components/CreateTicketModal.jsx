import { useState } from 'react';
import { createTicket } from '../api';

export default function CreateTicketModal({ onClose, onCreated }) {
  const [form, setForm] = useState({
    subject: '',
    description: '',
    customerEmail: '',
    priority: 'medium',
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const errs = {};
    if (!form.subject.trim()) errs.subject = 'Subject is required';
    if (!form.description.trim()) errs.description = 'Description is required';
    if (!form.customerEmail.trim()) {
      errs.customerEmail = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.customerEmail)) {
      errs.customerEmail = 'Enter a valid email';
    }
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }

    setSubmitting(true);
    try {
      const ticket = await createTicket(form);
      onCreated(ticket);
      onClose();
    } catch (err) {
      if (err.details) {
        setErrors(err.details);
      } else {
        setErrors({ _general: err.error || 'Failed to create ticket' });
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Create Ticket</h2>
          <button className="modal-close" onClick={onClose}>
            ×
          </button>
        </div>

        {errors._general && <div className="error-banner">{errors._general}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="subject">Subject</label>
            <input
              id="subject"
              name="subject"
              type="text"
              value={form.subject}
              onChange={handleChange}
              className={errors.subject ? 'error' : ''}
              placeholder="Brief summary of the issue"
            />
            {errors.subject && <div className="field-error">{errors.subject}</div>}
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={form.description}
              onChange={handleChange}
              className={errors.description ? 'error' : ''}
              placeholder="Detailed description of the issue"
            />
            {errors.description && <div className="field-error">{errors.description}</div>}
          </div>

          <div className="form-group">
            <label htmlFor="customerEmail">Customer Email</label>
            <input
              id="customerEmail"
              name="customerEmail"
              type="email"
              value={form.customerEmail}
              onChange={handleChange}
              className={errors.customerEmail ? 'error' : ''}
              placeholder="customer@example.com"
            />
            {errors.customerEmail && <div className="field-error">{errors.customerEmail}</div>}
          </div>

          <div className="form-group">
            <label htmlFor="priority">Priority</label>
            <select id="priority" name="priority" value={form.priority} onChange={handleChange}>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>

          <div className="form-actions">
            <button type="button" className="btn btn-ghost" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Creating...' : 'Create Ticket'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
