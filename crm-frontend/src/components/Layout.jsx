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
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

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
    <div className="layout-root">
      {/* Mobile Menu Toggle */}
      <button 
        className="mobile-menu-toggle glass"
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
      >
        {isSidebarOpen ? '✕' : '☰'}
      </button>

      {/* ── Sidebar ─────────────────────────────────────────────────────────── */}
      <aside className={`glass side-nav ${isSidebarOpen ? 'mobile-open' : ''}`}>
        {/* Overlay for mobile */}
        {isSidebarOpen && (
          <div className="sidebar-overlay" onClick={() => setIsSidebarOpen(false)} />
        )}
        
        {/* Logo */}
        <div className="nav-logo">
          <div className="logo-icon">⚡</div>
          <span className="logo-text">LeadFlow</span>
        </div>

        {/* Main nav */}
        <div className="nav-links">
          <p className="nav-section-label">Main</p>

          {NAV.map(({ to, icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            >
              <span className="nav-icon">{icon}</span>
              <span className="nav-label">{label}</span>
            </NavLink>
          ))}

          <p className="nav-section-label">Admin</p>

          {NAV2.map(({ to, icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            >
              <span className="nav-icon">{icon}</span>
              <span className="nav-label">{label}</span>
            </NavLink>
          ))}
        </div>

        {/* User footer */}
        <div className="nav-footer">
          <div className="user-profile glass">
            <Avatar name={user?.name || 'Admin'} size={36} radius="10px" />
            <div className="user-info">
              <div className="user-name">{user?.name || 'Admin'}</div>
              <div className="user-role">{user?.role || 'User'}</div>
            </div>
            <button onClick={handleLogout} disabled={loggingOut} title="Logout" className="logout-btn">
              ⎋
            </button>
          </div>
        </div>
      </aside>

      {/* ── Main Content ────────────────────────────────────────────────────── */}
      <main className="main-content">
        <div className="animate-fade-in">
          {children}
        </div>
      </main>
    </div>
  );
}
