// src/pages/CalendarView.jsx
// Premium Glassmorphism Calendar

import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLeads } from '../hooks/useLeads';
import { Card, CardHeader, StatusBadge, Spinner, Button, Avatar } from '../components/UI';

const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function CalendarView() {
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(new Date());

  // Fetch a larger chunk of leads to map on the calendar
  // In a real app we would pass startDate and endDate to the API
  const { leads, loading } = useLeads({ limit: 100, sortBy: '-createdAt' });

  // Calendar Logic
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Create grid cells
  const calendarCells = useMemo(() => {
    const cells = [];
    // Empty prefix cells
    for (let i = 0; i < firstDayOfMonth; i++) {
      cells.push({ type: 'empty', id: `empty-${i}` });
    }
    // Day cells
    for (let day = 1; day <= daysInMonth; day++) {
      const cellDate = new Date(year, month, day);
      
      // Find leads created on this exact day
      const dayLeads = leads.filter(l => {
        const ld = new Date(l.createdAt);
        return ld.getDate() === day && ld.getMonth() === month && ld.getFullYear() === year;
      });

      cells.push({ type: 'day', day, date: cellDate, leads: dayLeads, id: `day-${day}` });
    }
    return cells;
  }, [year, month, leads]);

  const handlePrevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const handleNextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const handleToday = () => setCurrentDate(new Date());

  const monthName = currentDate.toLocaleString('default', { month: 'long' });

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-head)', fontSize: '28px', fontWeight: 800, letterSpacing: '-0.5px' }}>
            Pipeline Calendar
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '15px', marginTop: '6px' }}>
            Track lead acquisition and activity mapped by day.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <Button variant="ghost" className="glass" onClick={handleToday}>Today</Button>
          <div className="glass" style={{ display: 'flex', alignItems: 'center', borderRadius: '12px', padding: '4px' }}>
            <button onClick={handlePrevMonth} style={{ background: 'none', border: 'none', color: '#fff', fontSize: '18px', cursor: 'pointer', padding: '8px 12px', borderRadius: '8px', transition: 'background 0.2s' }} onMouseEnter={e => e.target.style.background = 'var(--glass-bg)'} onMouseLeave={e => e.target.style.background = 'transparent'}>←</button>
            <span style={{ fontSize: '16px', fontWeight: 700, fontFamily: 'var(--font-head)', padding: '0 16px', minWidth: '140px', textAlign: 'center' }}>
              {monthName} {year}
            </span>
            <button onClick={handleNextMonth} style={{ background: 'none', border: 'none', color: '#fff', fontSize: '18px', cursor: 'pointer', padding: '8px 12px', borderRadius: '8px', transition: 'background 0.2s' }} onMouseEnter={e => e.target.style.background = 'var(--glass-bg)'} onMouseLeave={e => e.target.style.background = 'transparent'}>→</button>
          </div>
        </div>
      </div>

      <Card className="glass-card" style={{ padding: '0', overflow: 'hidden' }}>
        {loading ? (
           <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '500px' }}><Spinner size={36} /></div>
        ) : (
          <div style={{ width: '100%' }}>
            {/* Days of week header */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', borderBottom: '1px solid var(--border-light)', background: 'rgba(255,255,255,0.02)' }}>
              {DAYS_OF_WEEK.map(day => (
                <div key={day} style={{ padding: '16px', textAlign: 'center', fontSize: '13px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gridAutoRows: 'minmax(140px, auto)' }}>
              {calendarCells.map((cell, idx) => (
                <div key={cell.id} style={{
                  borderRight: (idx + 1) % 7 !== 0 ? '1px solid var(--border-light)' : 'none',
                  borderBottom: '1px solid var(--border-light)',
                  padding: '12px',
                  background: cell.type === 'empty' ? 'rgba(0,0,0,0.1)' : 'transparent',
                  transition: 'background 0.2s',
                }}
                onMouseEnter={e => { if (cell.type === 'day') e.currentTarget.style.background = 'rgba(255,255,255,0.02)' }}
                onMouseLeave={e => { if (cell.type === 'day') e.currentTarget.style.background = 'transparent' }}
                >
                  {cell.type === 'day' && (
                    <>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                        <span style={{
                          fontSize: '14px', fontWeight: 600,
                          color: (cell.day === new Date().getDate() && month === new Date().getMonth() && year === new Date().getFullYear()) ? '#fff' : 'var(--text-muted)',
                          background: (cell.day === new Date().getDate() && month === new Date().getMonth() && year === new Date().getFullYear()) ? 'var(--accent)' : 'transparent',
                          width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%',
                          boxShadow: (cell.day === new Date().getDate() && month === new Date().getMonth() && year === new Date().getFullYear()) ? '0 0 12px var(--accent-glow)' : 'none'
                        }}>
                          {cell.day}
                        </span>
                      </div>
                      
                      {/* Render leads for this day */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        {cell.leads.map((lead) => (
                          <div
                            key={lead._id}
                            onClick={() => navigate(`/leads/${lead._id}`)}
                            title={`${lead.firstName} ${lead.lastName} - ${lead.status}`}
                            className="glass animate-fade-in"
                            style={{
                              padding: '6px 8px', borderRadius: '6px', fontSize: '12px',
                              color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px',
                              borderLeft: `3px solid ${lead.status === 'new' ? 'var(--accent2)' : lead.status === 'converted' ? 'var(--green)' : lead.status === 'lost' ? 'var(--red)' : 'var(--amber)'}`,
                              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
                            }}
                            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'}
                            onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                          >
                            <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis' }}>{lead.firstName}</span>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
