// src/components/Layout.jsx
// Premium Glassmorphism shell — sidebar + main content area

import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Avatar } from './UI';

const NAV = [
  { to: '/',       icon: '✨', label: 'Dashboard'  },
  { to: '/calendar', icon: '📅', label: 'Calendar'   },
  { to: '/leads',  icon: '👥', label: 'All Leads'  },
  { to: '/new',    icon: '➕', label: 'Add Lead'   },
];

const NAV2 = [
  { to: '/settings', icon: '⚙️', label: 'Settings' },
];

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    await logout();
    navigate('/login');
  };

  const linkStyle = (isActive) => ({
    display: 'flex', alignItems: 'center', gap: '12px',
    padding: '12px 16px', borderRadius: 'var(--radius-md)', marginBottom: '4px',
    color: isActive ? '#fff' : 'var(--text-muted)',
    background: isActive ? 'linear-gradient(90deg, rgba(99,102,241,0.15), rgba(99,102,241,0.05))' : 'transparent',
    borderLeft: isActive ? '3px solid var(--accent)' : '3px solid transparent',
    fontSize: '14px', fontWeight: isActive ? 600 : 500,
    transition: 'all .25s cubic-bezier(0.2, 0.8, 0.2, 1)', textDecoration: 'none',
    letterSpacing: '0.3px'
  });

  return (
    <div style={{ display: 'flex', minHeight: '100vh', position: 'relative' }}>
      {/* ── Sidebar ─────────────────────────────────────────────────────────── */}
      <aside className="glass" style={{
        width: '260px', 
        borderRight: '1px solid var(--border-light)',
        borderTop: 'none', borderBottom: 'none', borderLeft: 'none',
        display: 'flex', flexDirection: 'column',
        position: 'fixed', top: 0, left: 0, bottom: 0, zIndex: 100,
        boxShadow: '10px 0 30px rgba(0,0,0,0.1)'
      }}>
        {/* Logo */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '12px',
          padding: '24px', marginBottom: '16px',
        }}>
          <div style={{
            width: '36px', height: '36px',
            background: 'linear-gradient(135deg, var(--accent), var(--accent2))',
            borderRadius: '10px', display: 'flex', alignItems: 'center',
            justifyContent: 'center', fontSize: '18px', flexShrink: 0,
            boxShadow: '0 4px 12px var(--accent-glow)'
          }}>⚡</div>
          <span style={{ fontFamily: 'var(--font-head)', fontSize: '20px', fontWeight: 800, letterSpacing: '0.5px', background: 'linear-gradient(to right, #fff, #94a3b8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            LeadFlow
          </span>
        </div>

        {/* Main nav */}
        <div style={{ padding: '0 16px', flex: 1 }}>
          <p style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1.5px',
            color: 'var(--text-muted)', padding: '0 12px', marginBottom: '12px', fontWeight: 600 }}>Main</p>

          {NAV.map(({ to, icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              style={({ isActive }) => linkStyle(isActive)}
              onMouseEnter={e => { if (!e.currentTarget.classList.contains('active')) { e.currentTarget.style.background = 'var(--glass-bg-hover)'; e.currentTarget.style.color = 'var(--text-main)'; } }}
              onMouseLeave={e => { if (!e.currentTarget.classList.contains('active')) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)'; } }}
            >
              <span style={{ fontSize: '18px', width: '22px', textAlign: 'center', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))' }}>{icon}</span>
              {label}
            </NavLink>
          ))}

          <p style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1.5px',
            color: 'var(--text-muted)', padding: '0 12px', margin: '32px 0 12px', fontWeight: 600 }}>Admin</p>

          {NAV2.map(({ to, icon, label }) => (
            <NavLink
              key={to}
              to={to}
              style={({ isActive }) => linkStyle(isActive)}
              onMouseEnter={e => { if (!e.currentTarget.classList.contains('active')) { e.currentTarget.style.background = 'var(--glass-bg-hover)'; e.currentTarget.style.color = 'var(--text-main)'; } }}
              onMouseLeave={e => { if (!e.currentTarget.classList.contains('active')) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)'; } }}
            >
              <span style={{ fontSize: '18px', width: '22px', textAlign: 'center', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))' }}>{icon}</span>
              {label}
            </NavLink>
          ))}
        </div>

        {/* User footer */}
        <div style={{ padding: '20px 16px', borderTop: '1px solid var(--border-light)', background: 'rgba(0,0,0,0.1)' }}>
          <div className="glass" style={{
            display: 'flex', alignItems: 'center', gap: '12px',
            padding: '12px', borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-light)', transition: 'all .25s'
          }}>
            <Avatar name={user?.name || 'Admin'} size={36} radius="10px" />
            <div style={{ flex: 1, overflow: 'hidden' }}>
              <div style={{ fontSize: '14px', fontWeight: 600, whiteSpace: 'nowrap',
                overflow: 'hidden', textOverflow: 'ellipsis', color: 'var(--text-main)' }}>{user?.name || 'Admin'}</div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'capitalize' }}>{user?.role || 'User'}</div>
            </div>
            <button
              onClick={handleLogout}
              disabled={loggingOut}
              title="Logout"
              style={{
                background: 'rgba(239, 68, 68, 0.1)', border: 'none', color: 'var(--red)',
                cursor: 'pointer', fontSize: '16px', padding: '8px',
                borderRadius: '8px', transition: 'all .2s', display: 'flex',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)'; e.currentTarget.style.transform = 'scale(1.05)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'; e.currentTarget.style.transform = 'scale(1)'; }}
            >
              ⎋
            </button>
          </div>
        </div>
      </aside>

      {/* ── Main Content ────────────────────────────────────────────────────── */}
      <main style={{ marginLeft: '260px', flex: 1, padding: '40px 48px', minHeight: '100vh', position: 'relative', zIndex: 1 }}>
        <div className="animate-fade-in">
          {children}
        </div>
      </main>
    </div>
  );
}
