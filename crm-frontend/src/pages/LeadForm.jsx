// src/pages/LeadForm.jsx
// Premium Add new lead or edit existing — single form, two modes

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { leadsAPI, authAPI } from '../services/api';
import { Button, Input, Select, Textarea, Card, Spinner, ToastContainer } from '../components/UI';
import { useToast } from '../hooks/useToast';

const EMPTY = {
  firstName: '', lastName: '', email: '', phone: '',
  company: '', message: '', source: 'web', status: 'new',
  priority: 'medium', initialNote: '',
  assignedTo: '', tags: '', followUpDate: '',
  leadValue: 0,
};

export default function LeadForm() {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();
  const { toasts, success, error: toastError } = useToast();

  const [form, setForm] = useState(EMPTY);
  const [users, setUsers] = useState([]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEdit);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const { data } = await authAPI.getUsers();
        setUsers(data.data.users || []);
      } catch (err) {
        console.error('Failed to fetch users', err);
      }
    };
    fetchUsers();
  }, []);

  useEffect(() => {
    if (!isEdit) return;
    const load = async () => {
      try {
        const { data } = await leadsAPI.getOne(id);
        const l = data.data.lead;
        setForm({
          firstName: l.firstName || '', lastName: l.lastName || '',
          email: l.email || '', phone: l.phone || '',
          company: l.company || '', message: l.message || '',
          source: l.source || 'web', status: l.status || 'new',
          priority: l.priority || 'medium', initialNote: '',
          assignedTo: l.assignedTo || '',
          tags: (l.tags || []).join(', '),
          followUpDate: l.followUpDate ? new Date(l.followUpDate).toISOString().split('T')[0] : '',
          leadValue: l.leadValue || 0,
        });
      } catch {
        toastError('Failed to load lead');
        navigate('/leads');
      } finally {
        setFetching(false);
      }
    };
    load();
  }, [id, isEdit]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const errs = {};
    if (!form.firstName.trim()) errs.firstName = 'First name is required';
    if (!form.email.trim()) errs.email = 'Email is required';
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) errs.email = 'Must be a valid email';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    const payload = {
      ...form,
      tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
      assignedTo: form.assignedTo || null,
      followUpDate: form.followUpDate || null,
    };

    setLoading(true);
    try {
      if (isEdit) {
        await leadsAPI.update(id, payload);
        success('Lead updated!');
        setTimeout(() => navigate(`/leads/${id}`), 1000);
      } else {
        const { data } = await leadsAPI.create(payload);
        success('Lead created!');
        setTimeout(() => navigate(`/leads/${data.data.lead._id}`), 1000);
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Something went wrong';
      toastError(msg);
      if (err.response?.data?.errors) {
        const be = {};
        err.response.data.errors.forEach(({ field, message }) => { be[field] = message; });
        setErrors(be);
      }
    } finally {
      if (!isEdit) setLoading(false);
    }
  };

  if (fetching) return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '100px' }}>
      <Spinner size={40} />
    </div>
  );

  return (
    <div className="animate-fade-in" style={{ maxWidth: '720px', margin: '0 auto' }}>
      <ToastContainer toasts={toasts} />

      <div style={{ marginBottom: '32px' }}>
        <Button variant="ghost" className="glass" onClick={() => navigate(isEdit ? `/leads/${id}` : '/leads')}>← Back</Button>
      </div>

      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontFamily: 'var(--font-head)', fontSize: '28px', fontWeight: 800, marginBottom: '8px', letterSpacing: '-0.5px' }}>
          {isEdit ? 'Edit Lead Details' : 'Add New Lead'}
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '15px' }}>
          {isEdit ? 'Update the lead information below.' : 'Fill in the details for the new prospect.'}
        </p>
      </div>

      <Card className="glass-card">
        <form onSubmit={handleSubmit} style={{ padding: '32px' }}>

          <h3 style={{ fontFamily: 'var(--font-head)', fontSize: '14px', fontWeight: 700,
            color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1.5px',
            marginBottom: '20px', borderBottom: '1px solid var(--border-light)', paddingBottom: '8px' }}>Contact Information</h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <Input label="First Name *" name="firstName" value={form.firstName}
              onChange={handleChange} placeholder="e.g. Priya" error={errors.firstName} />
            <Input label="Last Name" name="lastName" value={form.lastName}
              onChange={handleChange} placeholder="e.g. Sharma" />
          </div>

          <Input label="Email Address *" name="email" type="email" value={form.email}
            onChange={handleChange} placeholder="e.g. priya@company.com" error={errors.email} />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <Input label="Phone Number" name="phone" value={form.phone}
              onChange={handleChange} placeholder="e.g. +91 98001 12345" />
            <Input label="Company Name" name="company" value={form.company}
              onChange={handleChange} placeholder="e.g. Tech Solutions" />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <Input label="Lead Value (₹)" name="leadValue" type="number" value={form.leadValue}
              onChange={handleChange} placeholder="e.g. 50000" />
            <div /> {/* Spacer */}
          </div>

          <Textarea label="Message / Enquiry" name="message" value={form.message}
            onChange={handleChange} placeholder="What did they enquire about?" />

          <h3 style={{ fontFamily: 'var(--font-head)', fontSize: '14px', fontWeight: 700,
            color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1.5px',
            marginTop: '32px', marginBottom: '20px', borderBottom: '1px solid var(--border-light)', paddingBottom: '8px' }}>CRM Settings</h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
            <Select label="Lead Source" name="source" value={form.source} onChange={handleChange}>
              <option value="web">🌐 Website</option>
              <option value="social">📱 Social Media</option>
              <option value="referral">🤝 Referral</option>
              <option value="cold">⚡ Cold Outreach</option>
              <option value="email">✉️ Email</option>
              <option value="other">📌 Other</option>
            </Select>
            <Select label="Status" name="status" value={form.status} onChange={handleChange}>
              <option value="new">New</option>
              <option value="contacted">Contacted</option>
              <option value="qualified">Qualified</option>
              <option value="converted">Converted</option>
              <option value="lost">Lost</option>
            </Select>
            <Select label="Priority" name="priority" value={form.priority} onChange={handleChange}>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </Select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '16px' }}>
            <Select label="Assign To" name="assignedTo" value={form.assignedTo} onChange={handleChange}>
              <option value="">Unassigned</option>
              {users.map(u => (
                <option key={u._id} value={u._id}>{u.name} ({u.role})</option>
              ))}
            </Select>
            <Input label="Follow-up Reminder" name="followUpDate" type="date" value={form.followUpDate}
              onChange={handleChange} />
          </div>

          <div style={{ marginTop: '16px' }}>
            <Input label="Tags (Comma separated)" name="tags" value={form.tags}
              onChange={handleChange} placeholder="e.g. VIP, Q2-Lead, Urgent" />
          </div>

          {!isEdit && (
            <div style={{ marginTop: '16px' }}>
              <Textarea label="Initial Follow-up Note (Optional)" name="initialNote" value={form.initialNote}
                onChange={handleChange} placeholder="Add any background context about this lead..." />
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '40px',
            paddingTop: '24px', borderTop: '1px solid var(--border-light)' }}>
            <Button variant="ghost" className="glass" onClick={() => navigate(isEdit ? `/leads/${id}` : '/leads')}>Cancel</Button>
            <Button variant="primary" size="lg" type="submit" loading={loading} style={{ padding: '12px 28px' }}>
              {isEdit ? 'Save Changes' : 'Create Lead ✨'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
