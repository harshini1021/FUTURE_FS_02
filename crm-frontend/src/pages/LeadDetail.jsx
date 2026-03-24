// src/pages/LeadDetail.jsx
// Premium Full lead detail — info, notes, status change, history

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { leadsAPI } from '../services/api';
import { Button, StatusBadge, SourceTag, Avatar, Spinner, Card, CardHeader, Modal, ToastContainer } from '../components/UI';
import { useToast } from '../hooks/useToast';
import { useAuth } from '../context/AuthContext';

const STATUSES = ['new', 'contacted', 'qualified', 'converted', 'lost'];
const STATUS_LABELS = { new: 'New', contacted: 'Contacted', qualified: 'Qualified', converted: 'Converted', lost: 'Lost' };

export default function LeadDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isManager } = useAuth();
  const { toasts, success, error: toastError } = useToast();

  const [lead, setLead] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [noteText, setNoteText] = useState('');
  const [addingNote, setAddingNote] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  useEffect(() => {
    const fetchLead = async () => {
      setLoading(true);
      try {
        const { data } = await leadsAPI.getOne(id);
        setLead(data.data.lead);
      } catch {
        toastError('Failed to load lead');
        navigate('/leads');
      } finally {
        setLoading(false);
      }
    };
    fetchLead();
  }, [id]);

  const handleStatusUpdate = async (status) => {
    setUpdatingStatus(true);
    try {
      const { data } = await leadsAPI.updateStatus(id, status);
      setLead(data.data.lead);
      success(`Status updated to ${status}`);
    } catch {
      toastError('Failed to update status');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleAddNote = async () => {
    if (!noteText.trim()) return;
    setAddingNote(true);
    try {
      const { data } = await leadsAPI.addNote(id, noteText.trim());
      setLead(prev => ({ ...prev, notes: data.data.notes }));
      setNoteText('');
      success('Note added');
    } catch {
      toastError('Failed to add note');
    } finally {
      setAddingNote(false);
    }
  };

  const handleDeleteNote = async (noteId) => {
    try {
      await leadsAPI.deleteNote(id, noteId);
      setLead(prev => ({ ...prev, notes: prev.notes. filter(n => n._id !== noteId) }));
      success('Note deleted');
    } catch {
      toastError('Failed to delete note');
    }
  };

  const tabStyle = (tab) => ({
    padding: '12px 20px', fontSize: '14px', cursor: 'pointer',
    borderBottom: `2px solid ${activeTab === tab ? 'var(--accent)' : 'transparent'}`,
    color: activeTab === tab ? '#fff' : 'var(--text-muted)',
    marginBottom: '-1px', transition: 'all .25s', background: 'none', borderTop: 'none', borderLeft: 'none', borderRight: 'none',
    fontFamily: 'var(--font-body)', fontWeight: activeTab === tab ? 600 : 500, letterSpacing: '0.5px'
  });

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '100px' }}>
      <Spinner size={40} />
    </div>
  );

  if (!lead) return null;

  return (
    <div className="animate-fade-in">
      <ToastContainer toasts={toasts} />

      {/* Back + actions */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px' }}>
        <Button variant="ghost" className="glass" onClick={() => navigate('/leads')}>← Back to Leads</Button>
        <div style={{ display: 'flex', gap: '12px' }}>
          <Button className="glass" onClick={() => navigate(`/leads/${id}/edit`)}>✏️ Edit Detail</Button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 360px', gap: '32px' }}>
        {/* Left — main info */}
        <div>
          <Card className="glass-card">
            {/* Lead header */}
            <div style={{ padding: '32px', borderBottom: '1px solid var(--border-light)' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '20px', marginBottom: '8px' }}>
                <Avatar name={`${lead.firstName} ${lead.lastName}`} size={64} radius="16px" style={{ boxShadow: '0 8px 24px rgba(0,0,0,0.3)' }} />
                <div style={{ flex: 1 }}>
                  <h1 style={{ fontFamily: 'var(--font-head)', fontSize: '26px', fontWeight: 800, marginBottom: '6px', letterSpacing: '-0.5px' }}>
                    {lead.firstName} {lead.lastName}
                  </h1>
                  <div style={{ color: 'var(--text-muted)', fontSize: '15px', marginBottom: '16px', fontWeight: 500 }}>
                    {lead.company || 'No company'} <span style={{ padding: '0 8px', color: 'var(--border-light)' }}>|</span> <SourceTag source={lead.source} />
                  </div>
                  <StatusBadge status={lead.status} />
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', borderBottom: '1px solid var(--border-light)', padding: '0 24px', background: 'rgba(255,255,255,0.01)' }}>
              {[
                { key: 'overview', label: `Overview` },
                { key: 'notes',    label: `Notes (${lead.notes?.length || 0})` },
                { key: 'history',  label: 'History' },
              ].map(({ key, label }) => (
                <button key={key} style={tabStyle(key)} onClick={() => setActiveTab(key)}>{label}</button>
              ))}
            </div>

            {/* Tab body */}
            <div style={{ padding: '32px' }}>

              {/* OVERVIEW */}
              {activeTab === 'overview' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', animation: 'fadeIn 0.3s ease' }}>
                  {[
                    { label: 'Email',    value: lead.email },
                    { label: 'Phone',    value: lead.phone || '—' },
                    { label: 'Company',  value: lead.company || '—' },
                    { label: 'Priority', value: lead.priority?.toUpperCase() || 'MEDIUM' },
                    { label: 'Added',    value: new Date(lead.createdAt).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) },
                    { label: 'Updated',  value: new Date(lead.updatedAt).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) },
                  ].map(({ label, value }) => (
                    <div key={label} className="glass" style={{ padding: '16px 20px', borderRadius: '12px' }}>
                      <div style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px',
                        color: 'var(--text-muted)', marginBottom: '8px', fontWeight: 600 }}>{label}</div>
                      <div style={{ fontSize: '15px', fontWeight: 500 }}>{value}</div>
                    </div>
                  ))}
                  {lead.message && (
                    <div style={{ gridColumn: '1/-1' }}>
                      <div style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px',
                        color: 'var(--text-muted)', marginBottom: '8px', fontWeight: 600 }}>Message</div>
                      <div className="glass" style={{ borderRadius: '12px',
                        padding: '20px', lineHeight: 1.6, color: 'var(--text-main)', fontSize: '15px' }}>{lead.message}</div>
                    </div>
                  )}
                </div>
              )}

              {/* NOTES */}
              {activeTab === 'notes' && (
                <div style={{ animation: 'fadeIn 0.3s ease' }}>
                  {lead.notes?.length === 0 && (
                    <div style={{ padding: '40px 0' }}>
                      <EmptyState icon="📝" title="No notes yet" message="Add your first follow-up note below." />
                    </div>
                  )}
                  {lead.notes?.map((note, i) => (
                    <div key={note._id} className="glass animate-fade-in" style={{
                      borderRadius: '12px', padding: '20px',
                      marginBottom: '16px', position: 'relative', animationDelay: `${i * 0.05}s`
                    }}>
                      <p style={{ fontSize: '15px', lineHeight: 1.6, marginBottom: '12px' }}>{note.text}</p>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <Avatar name={note.addedByName} size={24} />
                          <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 500 }}>
                            {note.addedByName} <span style={{ padding: '0 4px' }}>·</span> {new Date(note.createdAt).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                          </span>
                        </div>
                        <button
                          onClick={() => handleDeleteNote(note._id)}
                          style={{ background: 'none', border: 'none', color: 'var(--text-muted)',
                            cursor: 'pointer', fontSize: '13px', padding: '4px 8px', borderRadius: '6px', transition: 'all .2s' }}
                          onMouseEnter={e => { e.target.style.color = 'var(--red)'; e.target.style.background = 'rgba(239, 68, 68, 0.1)' }}
                          onMouseLeave={e => { e.target.style.color = 'var(--text-muted)'; e.target.style.background = 'transparent' }}
                        >Delete</button>
                      </div>
                    </div>
                  ))}

                  {/* Add note */}
                  <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                    <input
                      value={noteText}
                      onChange={e => setNoteText(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleAddNote()}
                      placeholder="Add a follow-up note... (Enter to submit)"
                      style={{
                        flex: 1, background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-light)',
                        borderRadius: 'var(--radius-sm)', color: 'var(--text-main)', fontFamily: 'var(--font-body)',
                        fontSize: '14px', padding: '12px 16px', outline: 'none', backdropFilter: 'blur(10px)',
                        transition: 'all .25s', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)'
                      }}
                      onFocus={e => {
                        e.target.style.borderColor = 'var(--accent)';
                        e.target.style.background = 'var(--glass-bg)';
                      }}
                      onBlur={e => {
                        e.target.style.borderColor = 'var(--border-light)';
                        e.target.style.background = 'rgba(0,0,0,0.2)';
                      }}
                    />
                    <Button variant="primary" onClick={handleAddNote} loading={addingNote}>Post Note</Button>
                  </div>
                </div>
              )}

              {/* HISTORY */}
              {activeTab === 'history' && (
                <div style={{ animation: 'fadeIn 0.3s ease' }}>
                  {lead.statusHistory?.length === 0 && (
                    <div style={{ padding: '40px 0' }}>
                      <EmptyState icon="⏳" title="No history" />
                    </div>
                  )}
                  <div style={{ position: 'relative', borderLeft: '2px solid var(--border-light)', marginLeft: '12px', paddingLeft: '24px' }}>
                    {[...(lead.statusHistory || [])].reverse().map((h, i) => (
                      <div key={i} className="animate-fade-in" style={{ position: 'relative', marginBottom: '24px', animationDelay: `${i * 0.05}s` }}>
                        <div style={{ position: 'absolute', left: '-31px', top: '4px', width: '12px', height: '12px', borderRadius: '50%',
                          background: 'var(--bg)', border: '2px solid var(--accent)', boxShadow: '0 0 8px var(--accent-glow)' }} />
                        <div>
                          <div style={{ fontSize: '15px', color: '#fff', marginBottom: '4px' }}>
                            {h.from
                              ? <><span style={{ color: 'var(--text-muted)' }}>{STATUS_LABELS[h.from]}</span> → <strong>{STATUS_LABELS[h.to]}</strong></>
                              : <><strong>Lead created</strong> as {STATUS_LABELS[h.to]}</>
                            }
                          </div>
                          <div style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 500 }}>
                            {h.changedByName} <span style={{ padding: '0 6px' }}>·</span> {new Date(h.createdAt).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Right — quick actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <Card className="glass-card">
            <CardHeader>
              <h3 style={{ fontFamily: 'var(--font-head)', fontSize: '16px', fontWeight: 700 }}>Update Status</h3>
              {updatingStatus && <Spinner size={16} />}
            </CardHeader>
            <div style={{ padding: '24px' }}>
              {STATUSES.map(s => (
                <button
                  key={s}
                  onClick={() => handleStatusUpdate(s)}
                  disabled={s === lead.status || updatingStatus}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '12px', width: '100%',
                    padding: '12px 16px', borderRadius: '10px', marginBottom: '8px',
                    border: `1px solid ${s === lead.status ? 'var(--accent)' : 'var(--border-light)'}`,
                    background: s === lead.status ? 'linear-gradient(90deg, rgba(99,102,241,0.15), rgba(99,102,241,0.05))' : 'var(--glass-bg)',
                    color: s === lead.status ? '#fff' : 'var(--text-main)',
                    cursor: s === lead.status ? 'default' : 'pointer',
                    fontFamily: 'var(--font-body)', fontSize: '14px', fontWeight: s === lead.status ? 700 : 500,
                    transition: 'all .25s', backdropFilter: 'blur(10px)'
                  }}
                  onMouseEnter={e => { if (s !== lead.status) { e.currentTarget.style.background = 'var(--glass-bg-hover)'; e.currentTarget.style.transform = 'translateY(-1px)'; } }}
                  onMouseLeave={e => { if (s !== lead.status) { e.currentTarget.style.background = 'var(--glass-bg)'; e.currentTarget.style.transform = 'translateY(0)'; } }}
                >
                  <StatusBadge status={s} />
                  {s === lead.status && <span style={{ marginLeft: 'auto', fontSize: '12px', color: 'var(--accent)' }}>Current</span>}
                </button>
              ))}
            </div>
          </Card>

          {/* Contact card */}
          <Card className="glass-card">
            <CardHeader>
              <h3 style={{ fontFamily: 'var(--font-head)', fontSize: '16px', fontWeight: 700 }}>Contact Info</h3>
            </CardHeader>
            <div style={{ padding: '24px' }}>
              {[
                { icon: '✉️', label: 'Email Address', value: lead.email, href: `mailto:${lead.email}` },
                { icon: '📞', label: 'Phone Number', value: lead.phone || 'Not provided', href: lead.phone ? `tel:${lead.phone}` : null },
              ].map(({ icon, label, value, href }) => (
                <div key={label} style={{ marginBottom: '20px', display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'var(--glass-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', border: '1px solid var(--border-light)' }}>
                    {icon}
                  </div>
                  <div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600 }}>{label}</div>
                    {href ? (
                      <a href={href} style={{ fontSize: '15px', color: '#fff', textDecoration: 'none', fontWeight: 500, borderBottom: '1px solid rgba(255,255,255,0.3)', paddingBottom: '2px', transition: 'border 0.2s' }}
                        onMouseEnter={e => e.currentTarget.style.borderColor = '#fff'} onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)'}>
                        {value}
                      </a>
                    ) : (
                      <div style={{ fontSize: '15px', color: 'var(--text-main)', fontWeight: 500 }}>{value}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
