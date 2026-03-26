// src/pages/Signup.jsx
// Premium Glassmorphism Registration Page

import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Spinner } from '../components/UI';

export default function Signup() {
  const { register, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPass, setShowPass] = useState(false);

  if (isAuthenticated) return <Navigate to="/" replace />;

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password || !form.confirmPassword) {
      setError('Please fill in all fields');
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (form.password.length < 3) {
      setError('Password must be at least 3 characters');
      return;
    }
    
    setLoading(true);
    setError('');
    try {
      await register(form.name, form.email, form.password);
      navigate('/');
    } catch (err) {
      // If backend returns specific validation errors array, show the first one
      const backEndErrors = err.response?.data?.errors;
      if (backEndErrors && backEndErrors.length > 0) {
        setError(backEndErrors[0].message);
      } else {
        setError(err.response?.data?.message || 'Failed to register account. Check your connection.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      {/* Background Orbs */}
      <div className="animate-float" style={{
        position: 'absolute', top: '5%', right: '10%',
        width: '400px', height: '400px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(16,185,129,0.2) 0%, transparent 70%)',
        filter: 'blur(60px)', pointerEvents: 'none',
      }} />
      <div className="animate-float" style={{
        position: 'absolute', bottom: '5%', left: '10%',
        width: '500px', height: '500px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)',
        filter: 'blur(60px)', pointerEvents: 'none', animationDelay: '-3s'
      }} />

      <div className="auth-card animate-fade-in">
        {/* Left Side: Branding */}
        <div className="auth-sidebar">
          {/* Grid texture */}
          <div style={{
            position: 'absolute', inset: 0,
            backgroundImage: `linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)`,
            backgroundSize: '30px 30px', pointerEvents: 'none', zIndex: 0
          }} />

          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '60px' }}>
              <div style={{
                width: '48px', height: '48px',
                background: 'linear-gradient(135deg, var(--accent), var(--accent2))',
                borderRadius: '14px', display: 'flex', alignItems: 'center',
                justifyContent: 'center', fontSize: '24px', boxShadow: '0 8px 24px rgba(99,102,241,0.4)'
              }}>⚡</div>
              <span style={{ fontFamily: 'var(--font-head)', fontSize: '26px', fontWeight: 800, letterSpacing: '0.5px' }}>LeadFlow</span>
            </div>

            <h1 style={{
              fontFamily: 'var(--font-head)', fontSize: '42px', fontWeight: 800,
              lineHeight: 1.1, marginBottom: '24px', letterSpacing: '-1px',
              background: 'linear-gradient(to right, #ffffff, #94a3b8)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>
              Join the team.<br />Multiply your impact.
            </h1>
            <p style={{ fontSize: '16px', color: 'var(--text-muted)', lineHeight: 1.6, maxWidth: '400px' }}>
              Create an account to start managing your agency's pipeline with the premium CRM solution.
            </p>

            <div style={{ marginTop: '48px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {[
                { icon: '🚀', text: 'Instant access to the unified dashboard' },
                { icon: '👥', text: 'Collaborate with your sales team' },
                { icon: '📈', text: 'Track conversions visually' },
              ].map((f, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div className="glass" style={{
                    width: '40px', height: '40px', borderRadius: '12px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', border: '1px solid rgba(255,255,255,0.1)'
                  }}>{f.icon}</div>
                  <span style={{ fontSize: '15px', color: 'var(--text-muted)', fontWeight: 500 }}>{f.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side: Signup Form */}
        <div className="auth-form-container">
          <div style={{ maxWidth: '360px', width: '100%', margin: '0 auto' }}>
            <h2 style={{ fontFamily: 'var(--font-head)', fontSize: '28px', fontWeight: 700, marginBottom: '8px', letterSpacing: '-0.5px' }}>
              Create an Account
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '32px' }}>
              Fill in the details below to register.
            </p>

            {error && (
              <div style={{
                background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: '8px', padding: '14px', marginBottom: '24px',
                fontSize: '14px', color: 'var(--red)', display: 'flex', alignItems: 'center', gap: '10px',
              }}>
                ⚠️ {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '20px' }}>
                <label style={{
                  display: 'block', fontSize: '11px', textTransform: 'uppercase',
                  letterSpacing: '1px', color: 'var(--text-muted)', marginBottom: '8px', fontWeight: 600,
                }}>Full Name</label>
                <input
                  name="name"
                  type="text"
                  placeholder="John Doe"
                  value={form.name}
                  onChange={handleChange}
                  style={{
                    width: '100%', background: 'rgba(0,0,0,0.3)',
                    border: `1px solid ${error ? 'var(--red)' : 'var(--border-light)'}`,
                    borderRadius: '10px', color: '#fff', fontFamily: 'var(--font-body)',
                    fontSize: '15px', padding: '12px 16px', outline: 'none',
                    transition: 'all .25s', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.2)'
                  }}
                  onFocus={e => { e.target.style.borderColor = 'var(--accent)'; e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.2)'; }}
                  onBlur={e => { e.target.style.borderColor = error ? 'var(--red)' : 'var(--border-light)'; e.target.style.boxShadow = 'inset 0 2px 4px rgba(0,0,0,0.2)'; }}
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{
                  display: 'block', fontSize: '11px', textTransform: 'uppercase',
                  letterSpacing: '1px', color: 'var(--text-muted)', marginBottom: '8px', fontWeight: 600,
                }}>Email Address</label>
                <input
                  name="email"
                  type="text"
                  placeholder="admin@leadflow.com"
                  value={form.email}
                  onChange={handleChange}
                  autoComplete="email"
                  style={{
                    width: '100%', background: 'rgba(0,0,0,0.3)',
                    border: `1px solid ${error ? 'var(--red)' : 'var(--border-light)'}`,
                    borderRadius: '10px', color: '#fff', fontFamily: 'var(--font-body)',
                    fontSize: '15px', padding: '12px 16px', outline: 'none',
                    transition: 'all .25s', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.2)'
                  }}
                  onFocus={e => { e.target.style.borderColor = 'var(--accent)'; e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.2)'; }}
                  onBlur={e => { e.target.style.borderColor = error ? 'var(--red)' : 'var(--border-light)'; e.target.style.boxShadow = 'inset 0 2px 4px rgba(0,0,0,0.2)'; }}
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{
                  display: 'block', fontSize: '11px', textTransform: 'uppercase',
                  letterSpacing: '1px', color: 'var(--text-muted)', marginBottom: '8px', fontWeight: 600,
                }}>Password</label>
                <div style={{ position: 'relative' }}>
                  <input
                    name="password"
                    type={showPass ? 'text' : 'password'}
                    placeholder="Min 3 chars"
                    value={form.password}
                    onChange={handleChange}
                    autoComplete="new-password"
                    style={{
                      width: '100%', background: 'rgba(0,0,0,0.3)',
                      border: `1px solid ${error ? 'var(--red)' : 'var(--border-light)'}`,
                      borderRadius: '10px', color: '#fff', fontFamily: 'var(--font-body)',
                      fontSize: '15px', padding: '12px 48px 12px 16px', outline: 'none',
                      transition: 'all .25s', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.2)'
                    }}
                    onFocus={e => { e.target.style.borderColor = 'var(--accent)'; e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.2)'; }}
                    onBlur={e => { e.target.style.borderColor = error ? 'var(--red)' : 'var(--border-light)'; e.target.style.boxShadow = 'inset 0 2px 4px rgba(0,0,0,0.2)'; }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(s => !s)}
                    style={{
                      position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)',
                      background: 'none', border: 'none', color: 'var(--text-muted)',
                      cursor: 'pointer', fontSize: '16px', padding: '4px', transition: 'color 0.2s'
                    }}
                    onMouseEnter={e => e.target.style.color = '#fff'}
                    onMouseLeave={e => e.target.style.color = 'var(--text-muted)'}
                  >{showPass ? '🙈' : '👁️'}</button>
                </div>
              </div>

              <div style={{ marginBottom: '32px' }}>
                <label style={{
                  display: 'block', fontSize: '11px', textTransform: 'uppercase',
                  letterSpacing: '1px', color: 'var(--text-muted)', marginBottom: '8px', fontWeight: 600,
                }}>Confirm Password</label>
                <input
                  name="confirmPassword"
                  type={showPass ? 'text' : 'password'}
                  placeholder="Repeat password"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  autoComplete="new-password"
                  style={{
                    width: '100%', background: 'rgba(0,0,0,0.3)',
                    border: `1px solid ${error ? 'var(--red)' : 'var(--border-light)'}`,
                    borderRadius: '10px', color: '#fff', fontFamily: 'var(--font-body)',
                    fontSize: '15px', padding: '12px 16px', outline: 'none',
                    transition: 'all .25s', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.2)'
                  }}
                  onFocus={e => { e.target.style.borderColor = 'var(--accent)'; e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.2)'; }}
                  onBlur={e => { e.target.style.borderColor = error ? 'var(--red)' : 'var(--border-light)'; e.target.style.boxShadow = 'inset 0 2px 4px rgba(0,0,0,0.2)'; }}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%', padding: '16px', borderRadius: '10px',
                  background: loading ? 'rgba(255,255,255,0.1)' : 'linear-gradient(135deg, var(--accent), var(--accent2))',
                  border: 'none', color: '#fff', fontFamily: 'var(--font-head)',
                  fontSize: '16px', fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                  transition: 'all .25s', boxShadow: loading ? 'none' : '0 8px 16px rgba(99,102,241,0.3)',
                  letterSpacing: '0.5px'
                }}
                onMouseEnter={e => !loading && (e.currentTarget.style.transform = 'translateY(-2px)', e.currentTarget.style.boxShadow = '0 12px 24px rgba(99,102,241,0.4)')}
                onMouseLeave={e => !loading && (e.currentTarget.style.transform = 'translateY(0)', e.currentTarget.style.boxShadow = '0 8px 16px rgba(99,102,241,0.3)')}
              >
                {loading ? (
                  <><Spinner size={20} color="#fff" /> Registering...</>
                ) : (
                  'Create Account ✨'
                )}
              </button>
            </form>

            <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '14px', color: 'var(--text-muted)' }}>
              Already have an account? <span 
                onClick={() => navigate('/login')} 
                style={{ color: 'var(--accent)', cursor: 'pointer', fontWeight: 600, transition: 'color 0.2s' }}
                onMouseEnter={e => e.target.style.color = '#fff'}
                onMouseLeave={e => e.target.style.color = 'var(--accent)'}
              >Sign In</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
