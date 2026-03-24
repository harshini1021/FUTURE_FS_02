// src/pages/LeadsList.jsx
// Premium Full lead table — filter, search, sort, paginate, quick status update

import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLeads } from '../hooks/useLeads';
import { leadsAPI } from '../services/api';
import { Card, CardHeader, StatusBadge, SourceTag, Avatar, Button, EmptyState, Spinner } from '../components/UI';
import { useToast } from '../hooks/useToast';
import { ToastContainer } from '../components/UI';

const STATUSES = ['', 'new', 'contacted', 'qualified', 'converted', 'lost'];
const STATUS_LABELS = { '': 'All Status', new: 'New', contacted: 'Contacted',
  qualified: 'Qualified', converted: 'Converted', lost: 'Lost' };

export default function LeadsList() {
  const navigate = useNavigate();
  const { toasts, success, error: toastError } = useToast();
  const [searchInput, setSearchInput] = useState('');
  const [openDropdown, setOpenDropdown] = useState(null);

  const {
    leads, pagination, loading, params,
    updateParams, goToPage, optimisticStatusUpdate, removeLead,
  } = useLeads({ limit: 15 });

  const handleSearch = useCallback((val) => {
    setSearchInput(val);
    clearTimeout(window._searchTimer);
    window._searchTimer = setTimeout(() => {
      updateParams({ search: val || undefined });
    }, 400);
  }, [updateParams]);

  const handleStatusChange = async (leadId, status) => {
    optimisticStatusUpdate(leadId, status);
    setOpenDropdown(null);
    try {
      await leadsAPI.updateStatus(leadId, status);
      success(`Status updated to ${status}`);
    } catch {
      toastError('Failed to update status');
    }
  };

  const handleDelete = async (leadId, name) => {
    if (!window.confirm(`Archive lead "${name}"?`)) return;
    try {
      await leadsAPI.delete(leadId);
      removeLead(leadId);
      success('Lead archived');
    } catch {
      toastError('Failed to archive lead');
    }
  };

  return (
    <div>
      <ToastContainer toasts={toasts} />

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-head)', fontSize: '28px', fontWeight: 800, letterSpacing: '-0.5px' }}>All Leads</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '15px', marginTop: '4px' }}>
            {pagination?.total ?? '—'} total records found
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <Button variant="ghost" className="glass" onClick={() => {
            const data = leads.map(l =>
              [l.firstName, l.lastName, l.email, l.company, l.source, l.status, l.createdAt].join(',')
            );
            const csv = ['Name,Last,Email,Company,Source,Status,Date', ...data].join('\n');
            const a = document.createElement('a');
            a.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv);
            a.download = 'leads.csv';
            a.click();
          }}>⬇ Export CSV</Button>
          <Button variant="primary" onClick={() => navigate('/new')}>+ Add Lead</Button>
        </div>
      </div>

      <Card className="glass-card" style={{ animation: 'fadeIn 0.5s ease backwards' }}>
        {/* Filters bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '20px 24px',
          borderBottom: '1px solid var(--border-light)', flexWrap: 'wrap', background: 'rgba(255,255,255,0.01)' }}>

          {/* Search */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px',
            background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-sm)',
            padding: '10px 16px', flex: 1, minWidth: '220px', transition: 'border 0.2s', backdropFilter: 'blur(10px)' }}>
            <span style={{ color: 'var(--text-muted)' }}>🔍</span>
            <input
              value={searchInput}
              onChange={e => handleSearch(e.target.value)}
              placeholder="Search by name, email, company..."
              style={{ background: 'none', border: 'none', outline: 'none',
                color: 'var(--text-main)', fontFamily: 'var(--font-body)', fontSize: '14px', flex: 1 }}
              onFocus={e => e.currentTarget.parentElement.style.borderColor = 'var(--accent)'}
              onBlur={e => e.currentTarget.parentElement.style.borderColor = 'var(--border-light)'}
            />
          </div>

          <select
            value={params.status || ''}
            onChange={e => updateParams({ status: e.target.value || undefined })}
            style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-light)',
              borderRadius: 'var(--radius-sm)', color: 'var(--text-main)', fontFamily: 'var(--font-body)',
              fontSize: '14px', padding: '10px 16px', outline: 'none', cursor: 'pointer', backdropFilter: 'blur(10px)' }}
          >
            {STATUSES.map(s => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
          </select>

          <select
            value={params.source || ''}
            onChange={e => updateParams({ source: e.target.value || undefined })}
            style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-light)',
              borderRadius: 'var(--radius-sm)', color: 'var(--text-main)', fontFamily: 'var(--font-body)',
              fontSize: '14px', padding: '10px 16px', outline: 'none', cursor: 'pointer', backdropFilter: 'blur(10px)' }}
          >
            <option value="">All Sources</option>
            {['web','social','referral','cold','email','other'].map(s => (
              <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
            ))}
          </select>

          <select
            value={params.sortBy || '-createdAt'}
            onChange={e => updateParams({ sortBy: e.target.value })}
            style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-light)',
              borderRadius: 'var(--radius-sm)', color: 'var(--text-main)', fontFamily: 'var(--font-body)',
              fontSize: '14px', padding: '10px 16px', outline: 'none', cursor: 'pointer', backdropFilter: 'blur(10px)' }}
          >
            <option value="-createdAt">Newest first</option>
            <option value="createdAt">Oldest first</option>
            <option value="firstName">Name A-Z</option>
            <option value="-firstName">Name Z-A</option>
          </select>
        </div>

        {/* Table */}
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '80px' }}>
            <Spinner size={36} />
          </div>
        ) : leads.length === 0 ? (
          <div style={{ padding: '60px 0' }}>
            <EmptyState icon="📬" title="No leads found" message="Try adjusting your filters or add a new lead." />
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  {['Lead', 'Company', 'Source', 'Status', 'Date', 'Actions'].map(h => (
                    <th key={h} style={{
                      textAlign: 'left', padding: '14px 24px', fontSize: '12px',
                      textTransform: 'uppercase', letterSpacing: '1px',
                      color: 'var(--text-muted)', fontWeight: 600,
                      background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--border-light)',
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {leads.map((lead, i) => (
                  <tr
                    key={lead._id}
                    style={{ cursor: 'pointer', transition: 'background .2s', animation: `fadeIn 0.3s ease backwards ${0.05 * i}s` }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--glass-bg-hover)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <td style={{ padding: '16px 24px', borderBottom: '1px solid var(--border-light)' }}
                      onClick={() => navigate(`/leads/${lead._id}`)}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                        <Avatar name={`${lead.firstName} ${lead.lastName}`} size={42} radius="10px" />
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '15px', color: '#fff', marginBottom: '4px' }}>
                            {lead.firstName} {lead.lastName}
                          </div>
                          <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{lead.email}</div>
                        </div>
                      </div>
                    </td>

                    <td style={{ padding: '16px 24px', borderBottom: '1px solid var(--border-light)',
                      fontSize: '14px', color: 'var(--text-muted)' }}
                      onClick={() => navigate(`/leads/${lead._id}`)}>
                      {lead.company || '—'}
                    </td>

                    <td style={{ padding: '16px 24px', borderBottom: '1px solid var(--border-light)' }}
                      onClick={() => navigate(`/leads/${lead._id}`)}>
                      <SourceTag source={lead.source} />
                    </td>

                    <td style={{ padding: '16px 24px', borderBottom: '1px solid var(--border-light)', position: 'relative' }}
                      onClick={e => e.stopPropagation()}>
                      <div style={{ position: 'relative', display: 'inline-block' }}>
                        <div
                          onClick={() => setOpenDropdown(openDropdown === lead._id ? null : lead._id)}
                          style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                        >
                          <StatusBadge status={lead.status} />
                          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>▾</span>
                        </div>
                        {openDropdown === lead._id && (
                          <div className="glass-card" style={{
                            position: 'absolute', top: '110%', left: 0, zIndex: 50,
                            padding: '6px', minWidth: '150px',
                            animation: 'fadeIn 0.2s',
                          }}>
                            {STATUSES.filter(s => s).map(s => (
                              <div
                                key={s}
                                onClick={() => handleStatusChange(lead._id, s)}
                                style={{
                                  padding: '8px 12px', borderRadius: '8px', cursor: 'pointer',
                                  fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px',
                                  color: lead.status === s ? 'var(--accent2)' : 'var(--text-main)',
                                  background: lead.status === s ? 'rgba(108,99,255,0.1)' : 'transparent',
                                  fontWeight: lead.status === s ? 600 : 400
                                }}
                                onMouseEnter={e => e.currentTarget.style.background = 'var(--glass-bg-hover)'}
                                onMouseLeave={e => e.currentTarget.style.background = lead.status === s ? 'rgba(108,99,255,0.1)' : 'transparent'}
                              >
                                {STATUS_LABELS[s]}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </td>

                    <td style={{ padding: '16px 24px', borderBottom: '1px solid var(--border-light)',
                      fontSize: '13px', color: 'var(--text-muted)', fontWeight: 500 }}
                      onClick={() => navigate(`/leads/${lead._id}`)}>
                      {new Date(lead.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>

                    <td style={{ padding: '16px 24px', borderBottom: '1px solid var(--border-light)' }}
                      onClick={e => e.stopPropagation()}>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        {[
                          { icon: '👁️', title: 'View', action: () => navigate(`/leads/${lead._id}`) },
                          { icon: '✏️', title: 'Edit', action: () => navigate(`/leads/${lead._id}/edit`) },
                          { icon: '🗑️', title: 'Archive', action: () => handleDelete(lead._id, `${lead.firstName} ${lead.lastName}`), color: 'var(--red)' },
                        ].map(({ icon, title, action, color }) => (
                          <button key={icon} onClick={action} title={title} style={{
                            width: '32px', height: '32px', borderRadius: '8px',
                            border: '1px solid var(--border-light)', background: 'var(--glass-bg)',
                            color: color || 'var(--text-muted)', cursor: 'pointer', fontSize: '15px',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            transition: 'all .2s',
                          }}
                          onMouseEnter={e => { e.currentTarget.style.background = 'var(--glass-bg-hover)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                          onMouseLeave={e => { e.currentTarget.style.background = 'var(--glass-bg)'; e.currentTarget.style.borderColor = 'var(--border-light)'; e.currentTarget.style.transform = 'translateY(0)'; }}
                          >{icon}</button>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {pagination && pagination.pages > 1 && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '16px 24px', borderTop: '1px solid var(--border-light)' }}>
                <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 500 }}>
                  Page <strong style={{ color: '#fff' }}>{pagination.page}</strong> of <strong style={{ color: '#fff' }}>{pagination.pages}</strong>
                </span>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <Button size="sm" variant="ghost" className="glass" disabled={!pagination.hasPrev} onClick={() => goToPage(pagination.page - 1)}>← Prev</Button>
                  <Button size="sm" variant="ghost" className="glass" disabled={!pagination.hasNext} onClick={() => goToPage(pagination.page + 1)}>Next →</Button>
                </div>
              </div>
            )}
          </div>
        )}
      </Card>

      {openDropdown && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 40 }}
          onClick={() => setOpenDropdown(null)} />
      )}
    </div>
  );
}
