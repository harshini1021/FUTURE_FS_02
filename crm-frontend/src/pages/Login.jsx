// src/pages/Login.jsx
// Premium Glassmorphism Login Page

import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Spinner } from '../components/UI';

export default function Login() {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: '', password: '' });
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
    if (!form.email || !form.password) {
      setError('Please fill in all fields');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await login(form.email, form.password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Background Orbs */}
      <div className="animate-float" style={{
        position: 'absolute', top: '10%', left: '15%',
        width: '400px', height: '400px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(99,102,241,0.2) 0%, transparent 70%)',
        filter: 'blur(60px)', pointerEvents: 'none',
      }} />
      <div className="animate-float" style={{
        position: 'absolute', bottom: '10%', right: '15%',
        width: '500px', height: '500px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(16,185,129,0.15) 0%, transparent 70%)',
        filter: 'blur(60px)', pointerEvents: 'none', animationDelay: '-3s'
      }} />

      <div className="glass-card animate-fade-in" style={{
        width: '100%', maxWidth: '1000px', display: 'flex',
        borderRadius: '24px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)',
        boxShadow: '0 24px 80px rgba(0,0,0,0.5)', zIndex: 10
      }}>
        {/* Left Side: Branding */}
        <div style={{
          flex: '1.2', padding: '60px', position: 'relative',
          background: 'linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0) 100%)',
          borderRight: '1px solid rgba(255,255,255,0.05)',
          display: 'flex', flexDirection: 'column', justifyContent: 'center'
        }}>
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
              Convert every lead.<br />Close every deal.
            </h1>
            <p style={{ fontSize: '16px', color: 'var(--text-muted)', lineHeight: 1.6, maxWidth: '400px' }}>
              The premium CRM solution built for modern teams. Track, nurture, and turn prospects into loyal clients seamlessly.
            </p>

            <div style={{ marginTop: '48px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {[
                { icon: '✨', text: 'Real-time pipeline dashboard' },
                { icon: '📝', text: 'Integrated notes & follow-ups' },
                { icon: '🔒', text: 'Secure, role-based admin access' },
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

        {/* Right Side: Login Form */}
        <div style={{
          flex: '1', padding: '60px', display: 'flex', flexDirection: 'column', justifyContent: 'center',
          background: 'rgba(0,0,0,0.2)', backdropFilter: 'blur(20px)'
        }}>
          <div style={{ maxWidth: '360px', width: '100%', margin: '0 auto' }}>
            <h2 style={{ fontFamily: 'var(--font-head)', fontSize: '28px', fontWeight: 700, marginBottom: '8px', letterSpacing: '-0.5px' }}>
              Welcome back
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '15px', marginBottom: '40px' }}>
              Sign in to access your dashboard.
            </p>

            <div style={{
              background: 'linear-gradient(90deg, rgba(99,102,241,0.15), rgba(99,102,241,0.05))',
              borderLeft: '4px solid var(--accent)', borderRadius: '8px', padding: '16px', marginBottom: '32px',
              fontSize: '13px', color: 'var(--text-main)', display: 'flex', flexDirection: 'column', gap: '4px'
            }}>
              <span style={{ fontWeight: 600, color: 'var(--accent2)', textTransform: 'uppercase', letterSpacing: '1px', fontSize: '11px' }}>Demo Credentials</span>
              <span>Email: <strong>admin@leadflow.com</strong></span>
              <span>Pass: <strong>Admin@1234</strong></span>
            </div>

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
                  display: 'block', fontSize: '12px', textTransform: 'uppercase',
                  letterSpacing: '1px', color: 'var(--text-muted)', marginBottom: '8px', fontWeight: 600,
                }}>Email Address</label>
                <input
                  name="email"
                  type="email"
                  placeholder="admin@leadflow.com"
                  value={form.email}
                  onChange={handleChange}
                  autoComplete="email"
                  style={{
                    width: '100%', background: 'rgba(0,0,0,0.3)',
                    border: `1px solid ${error ? 'var(--red)' : 'var(--border-light)'}`,
                    borderRadius: '10px', color: '#fff', fontFamily: 'var(--font-body)',
                    fontSize: '15px', padding: '14px 16px', outline: 'none',
                    transition: 'all .25s', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.2)'
                  }}
                  onFocus={e => { e.target.style.borderColor = 'var(--accent)'; e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.2)'; }}
                  onBlur={e => { e.target.style.borderColor = error ? 'var(--red)' : 'var(--border-light)'; e.target.style.boxShadow = 'inset 0 2px 4px rgba(0,0,0,0.2)'; }}
                />
              </div>

              <div style={{ marginBottom: '36px' }}>
                <label style={{
                  display: 'block', fontSize: '12px', textTransform: 'uppercase',
                  letterSpacing: '1px', color: 'var(--text-muted)', marginBottom: '8px', fontWeight: 600,
                }}>Password</label>
                <div style={{ position: 'relative' }}>
                  <input
                    name="password"
                    type={showPass ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={form.password}
                    onChange={handleChange}
                    autoComplete="current-password"
                    style={{
                      width: '100%', background: 'rgba(0,0,0,0.3)',
                      border: `1px solid ${error ? 'var(--red)' : 'var(--border-light)'}`,
                      borderRadius: '10px', color: '#fff', fontFamily: 'var(--font-body)',
                      fontSize: '15px', padding: '14px 48px 14px 16px', outline: 'none',
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
                  <><Spinner size={20} color="#fff" /> Authenticating...</>
                ) : (
                  'Sign In to LeadFlow →'
                )}
              </button>
            </form>

            <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '14px', color: 'var(--text-muted)' }}>
              Don't have an account? <span 
                onClick={() => navigate('/signup')} 
                style={{ color: 'var(--accent)', cursor: 'pointer', fontWeight: 600, transition: 'color 0.2s' }}
                onMouseEnter={e => e.target.style.color = '#fff'}
                onMouseLeave={e => e.target.style.color = 'var(--accent)'}
              >Sign Up</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
