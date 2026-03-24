// src/components/UI.jsx
// Premium Glassmorphism UI Kit

import React from 'react';

// ─── BUTTON ──────────────────────────────────────────────────────────────────
export const Button = ({
  children, onClick, variant = 'default', size = 'md',
  loading = false, disabled = false, type = 'button', style = {}, className = ''
}) => {
  const base = {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    gap: '8px', border: '1px solid', borderRadius: 'var(--radius-sm)',
    fontFamily: 'var(--font-body)', fontWeight: 600, cursor: disabled || loading ? 'not-allowed' : 'pointer',
    opacity: disabled || loading ? 0.6 : 1, transition: 'all .25s cubic-bezier(0.2, 0.8, 0.2, 1)', whiteSpace: 'nowrap',
    letterSpacing: '0.3px'
  };
  const sizes = {
    sm:  { padding: '6px 14px',  fontSize: '13px' },
    md:  { padding: '10px 20px',  fontSize: '14px' },
    lg:  { padding: '12px 28px', fontSize: '15px' },
  };
  const variants = {
    default: { background: 'var(--glass-bg)', borderColor: 'var(--border-light)', color: 'var(--text-main)', backdropFilter: 'blur(10px)' },
    primary: { background: 'linear-gradient(135deg, var(--accent), var(--accent2))', borderColor: 'transparent', color: '#fff', boxShadow: '0 4px 14px rgba(99, 102, 241, 0.3)' },
    danger:  { background: 'rgba(239, 68, 68, 0.1)', borderColor: 'rgba(239, 68, 68, 0.3)', color: 'var(--red)' },
    ghost:   { background: 'transparent', borderColor: 'transparent', color: 'var(--text-muted)' },
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      style={{ ...base, ...sizes[size], ...variants[variant], ...style }}
      className={`glass-btn ${className}`}
      onMouseEnter={e => {
        if (!disabled && !loading) {
          e.currentTarget.style.transform = 'translateY(-2px)';
          if (variant === 'primary') e.currentTarget.style.boxShadow = '0 6px 20px rgba(99, 102, 241, 0.4)';
          else if (variant === 'default') e.currentTarget.style.background = 'var(--glass-bg-hover)';
        }
      }}
      onMouseLeave={e => {
        if (!disabled && !loading) {
          e.currentTarget.style.transform = 'translateY(0)';
          if (variant === 'primary') e.currentTarget.style.boxShadow = '0 4px 14px rgba(99, 102, 241, 0.3)';
          else if (variant === 'default') e.currentTarget.style.background = 'var(--glass-bg)';
        }
      }}
    >
      {loading ? <Spinner size={14} color={variant === 'primary' ? '#fff' : 'var(--accent)'}/> : null}
      {children}
    </button>
  );
};

// ─── INPUT ────────────────────────────────────────────────────────────────────
export const Input = ({ label, error, style = {}, ...props }) => (
  <div style={{ marginBottom: '16px' }}>
    {label && (
      <label style={{ display: 'block', fontSize: '12px', textTransform: 'uppercase',
        letterSpacing: '1px', color: 'var(--text-muted)', marginBottom: '8px', fontWeight: 600 }}>
        {label}
      </label>
    )}
    <input
      {...props}
      style={{
        width: '100%', background: 'rgba(0,0,0,0.2)', border: `1px solid ${error ? 'var(--red)' : 'var(--border-light)'}`,
        borderRadius: 'var(--radius-sm)', color: 'var(--text-main)', fontFamily: 'var(--font-body)',
        fontSize: '14px', padding: '12px 16px', outline: 'none',
        transition: 'all .25s', backdropFilter: 'blur(10px)', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)', ...style,
      }}
      onFocus={e => {
        e.target.style.borderColor = 'var(--accent)';
        e.target.style.background = 'var(--glass-bg)';
        e.target.style.boxShadow = '0 0 0 3px rgba(99, 102, 241, 0.2), inset 0 2px 4px rgba(0,0,0,0.1)';
      }}
      onBlur={e => {
        e.target.style.borderColor = error ? 'var(--red)' : 'var(--border-light)';
        e.target.style.background = 'rgba(0,0,0,0.2)';
        e.target.style.boxShadow = 'inset 0 2px 4px rgba(0,0,0,0.1)';
      }}
    />
    {error && <p style={{ fontSize: '12px', color: 'var(--red)', marginTop: '6px' }}>{error}</p>}
  </div>
);

// ─── SELECT ───────────────────────────────────────────────────────────────────
export const Select = ({ label, children, style = {}, ...props }) => (
  <div style={{ marginBottom: '16px' }}>
    {label && (
      <label style={{ display: 'block', fontSize: '12px', textTransform: 'uppercase',
        letterSpacing: '1px', color: 'var(--text-muted)', marginBottom: '8px', fontWeight: 600 }}>
        {label}
      </label>
    )}
    <select
      {...props}
      style={{
        width: '100%', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-light)',
        borderRadius: 'var(--radius-sm)', color: 'var(--text-main)', fontFamily: 'var(--font-body)',
        fontSize: '14px', padding: '12px 16px', outline: 'none', cursor: 'pointer',
        transition: 'all .25s', backdropFilter: 'blur(10px)', appearance: 'none', ...style,
      }}
      onFocus={e => {
        e.target.style.borderColor = 'var(--accent)';
        e.target.style.background = 'var(--glass-bg)';
        e.target.style.boxShadow = '0 0 0 3px rgba(99, 102, 241, 0.2)';
      }}
      onBlur={e => {
        e.target.style.borderColor = 'var(--border-light)';
        e.target.style.background = 'rgba(0,0,0,0.2)';
        e.target.style.boxShadow = 'none';
      }}
    >
      {children}
    </select>
  </div>
);

// ─── TEXTAREA ─────────────────────────────────────────────────────────────────
export const Textarea = ({ label, style = {}, ...props }) => (
  <div style={{ marginBottom: '16px' }}>
    {label && (
      <label style={{ display: 'block', fontSize: '12px', textTransform: 'uppercase',
        letterSpacing: '1px', color: 'var(--text-muted)', marginBottom: '8px', fontWeight: 600 }}>
        {label}
      </label>
    )}
    <textarea
      {...props}
      style={{
        width: '100%', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-light)',
        borderRadius: 'var(--radius-sm)', color: 'var(--text-main)', fontFamily: 'var(--font-body)',
        fontSize: '14px', padding: '12px 16px', outline: 'none', resize: 'vertical',
        minHeight: '100px', transition: 'all .25s', backdropFilter: 'blur(10px)', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)', ...style,
      }}
      onFocus={e => {
        e.target.style.borderColor = 'var(--accent)';
        e.target.style.background = 'var(--glass-bg)';
        e.target.style.boxShadow = '0 0 0 3px rgba(99, 102, 241, 0.2), inset 0 2px 4px rgba(0,0,0,0.1)';
      }}
      onBlur={e => {
        e.target.style.borderColor = 'var(--border-light)';
        e.target.style.background = 'rgba(0,0,0,0.2)';
        e.target.style.boxShadow = 'inset 0 2px 4px rgba(0,0,0,0.1)';
      }}
    />
  </div>
);

// ─── MODAL ────────────────────────────────────────────────────────────────────
export const Modal = ({ isOpen, onClose, title, children, width = '520px' }) => {
  if (!isOpen) return null;
  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,.6)', zIndex: 1000,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        backdropFilter: 'blur(8px)', padding: '20px', animation: 'fadeIn .2s'
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        className="glass-card"
        style={{
          width, maxWidth: '100%', maxHeight: '90vh', overflowY: 'auto',
          padding: '32px', animation: 'fadeIn .3s cubic-bezier(0.2, 0.8, 0.2, 1)',
          transform: 'translateY(0)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
          <h2 style={{ fontFamily: 'var(--font-head)', fontSize: '20px', fontWeight: 700 }}>{title}</h2>
          <button
            onClick={onClose}
            style={{
              width: '32px', height: '32px', borderRadius: '50%', border: 'none',
              background: 'var(--glass-bg)', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '18px',
              display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all .2s'
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = '#fff' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'var(--glass-bg)'; e.currentTarget.style.color = 'var(--text-muted)' }}
          >✕</button>
        </div>
        {children}
      </div>
    </div>
  );
};

// ─── SPINNER ──────────────────────────────────────────────────────────────────
export const Spinner = ({ size = 20, color = 'var(--accent)' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    style={{ animation: 'spin .8s cubic-bezier(0.4, 0, 0.2, 1) infinite', flexShrink: 0 }}>
    <circle cx="12" cy="12" r="10" stroke={color} strokeOpacity=".2" strokeWidth="3"/>
    <path d="M12 2a10 10 0 0 1 10 10" stroke={color} strokeWidth="3" strokeLinecap="round"/>
    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
  </svg>
);

// ─── TOAST CONTAINER ──────────────────────────────────────────────────────────
export const ToastContainer = ({ toasts }) => {
  const icons = { success: '✨', error: '⚠️', info: '💡' };
  const colors = { success: 'var(--green)', error: 'var(--red)', info: 'var(--blue)' };

  return (
    <div style={{ position: 'fixed', bottom: '32px', right: '32px', zIndex: 1100,
      display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {toasts.map(t => (
        <div key={t.id} className="glass" style={{
          borderLeft: `4px solid ${colors[t.type]}`,
          borderRadius: '12px', padding: '16px 20px', fontSize: '14px', color: 'var(--text-main)',
          display: 'flex', alignItems: 'center', gap: '12px', minWidth: '300px', maxWidth: '400px',
          animation: 'slideInRight .4s cubic-bezier(0.2, 0.8, 0.2, 1)',
        }}>
          <span style={{ fontSize: '18px' }}>{icons[t.type]}</span>
          {t.message}
        </div>
      ))}
      <style>{`
        @keyframes slideInRight { from { transform: translateX(40px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
      `}</style>
    </div>
  );
};

// ─── BADGE ────────────────────────────────────────────────────────────────────
export const StatusBadge = ({ status }) => {
  const cfg = {
    new:       { bg: 'rgba(59, 130, 246, 0.15)',  color: 'var(--blue)',   border: 'rgba(59, 130, 246, 0.3)',   dot: '#60a5fa', label: 'New' },
    contacted: { bg: 'rgba(245, 158, 11, 0.15)',  color: 'var(--amber)',  border: 'rgba(245, 158, 11, 0.3)',   dot: '#f59e0b', label: 'Contacted' },
    qualified: { bg: 'rgba(139, 92, 246, 0.15)',  color: 'var(--accent2)',border: 'rgba(139, 92, 246, 0.3)',   dot: '#8b5cf6', label: 'Qualified' },
    converted: { bg: 'rgba(16, 185, 129, 0.15)',  color: 'var(--green)',  border: 'rgba(16, 185, 129, 0.3)',   dot: '#10b981', label: 'Converted' },
    lost:      { bg: 'rgba(239, 68, 68, 0.15)',   color: 'var(--red)',    border: 'rgba(239, 68, 68, 0.3)',  dot: '#ef4444', label: 'Lost' },
  };
  const c = cfg[status] || cfg.new;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '6px',
      padding: '4px 12px', borderRadius: '24px', fontSize: '12px', fontWeight: 600,
      background: c.bg, color: c.color, border: `1px solid ${c.border}`,
      boxShadow: `0 0 10px ${c.bg}`
    }}>
      <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: c.dot, flexShrink: 0, boxShadow: `0 0 6px ${c.dot}` }} />
      {c.label}
    </span>
  );
};

// ─── SOURCE TAG ───────────────────────────────────────────────────────────────
export const SourceTag = ({ source }) => {
  const cfg = {
    web:      { icon: '🌐', label: 'Website',  bg: 'rgba(59, 130, 246, 0.1)',  color: 'var(--blue)' },
    social:   { icon: '📱', label: 'Social',   bg: 'rgba(139, 92, 246, 0.1)', color: 'var(--accent2)' },
    referral: { icon: '🤝', label: 'Referral', bg: 'rgba(16, 185, 129, 0.1)', color: 'var(--green)' },
    cold:     { icon: '⚡', label: 'Cold',     bg: 'rgba(245, 158, 11, 0.1)', color: 'var(--amber)' },
    email:    { icon: '✉️', label: 'Email',    bg: 'rgba(239, 68, 68, 0.1)',  color: 'var(--red)' },
    other:    { icon: '📌', label: 'Other',    bg: 'rgba(148, 163, 184, 0.1)', color: 'var(--text-muted)' },
  };
  const c = cfg[source] || cfg.other;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '6px',
      padding: '4px 10px', borderRadius: '8px', fontSize: '12px', fontWeight: 600,
      background: c.bg, color: c.color, border: `1px solid rgba(255,255,255,0.05)`
    }}>
      <span style={{ fontSize: '13px' }}>{c.icon}</span>
      {c.label}
    </span>
  );
};

// ─── AVATAR ───────────────────────────────────────────────────────────────────
const COLORS = ['linear-gradient(135deg, #6366f1, #8b5cf6)','linear-gradient(135deg, #10b981, #34d399)','linear-gradient(135deg, #f59e0b, #fbbf24)','linear-gradient(135deg, #3b82f6, #60a5fa)','linear-gradient(135deg, #ef4444, #f87171)'];

export const Avatar = ({ name = '?', size = 36, radius = '50%', style = {} }) => {
  const initials = name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
  const bg = COLORS[name.charCodeAt(0) % COLORS.length];
  return (
    <div style={{
      width: size, height: size, borderRadius: radius,
      background: bg, display: 'flex', alignItems: 'center',
      justifyContent: 'center', flexShrink: 0, fontSize: size * 0.38,
      fontWeight: 700, color: '#fff', boxShadow: '0 4px 10px rgba(0,0,0,0.2)', ...style,
    }}>
      {initials}
    </div>
  );
};

// ─── EMPTY STATE ─────────────────────────────────────────────────────────────
export const EmptyState = ({ icon = '✨', title, message }) => (
  <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
    <div style={{ fontSize: '48px', marginBottom: '16px', filter: 'drop-shadow(0 0 10px rgba(255,255,255,0.1))' }} className="animate-float">{icon}</div>
    {title && <div style={{ fontFamily: 'var(--font-head)', fontSize: '18px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '8px' }}>{title}</div>}
    {message && <div style={{ fontSize: '14px', maxWidth: '300px', lineHeight: 1.5 }}>{message}</div>}
  </div>
);

// ─── CARD ─────────────────────────────────────────────────────────────────────
export const Card = ({ children, style = {}, className = '' }) => (
  <div className={`glass-card ${className}`} style={{ overflow: 'hidden', ...style }}>
    {children}
  </div>
);

export const CardHeader = ({ children, style = {}, className = '' }) => (
  <div className={className} style={{
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '20px 24px', borderBottom: '1px solid var(--border-light)', 
    background: 'rgba(255,255,255,0.02)', ...style,
  }}>
    {children}
  </div>
);
