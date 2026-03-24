// src/pages/Settings.jsx
// Premium Profile info + change password

import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';
import { Button, Input, Card, CardHeader, Avatar, ToastContainer } from '../components/UI';
import { useToast } from '../hooks/useToast';

export default function Settings() {
  const { user } = useAuth();
  const { toasts, success, error: toastError } = useToast();

  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [pwErrors, setPwErrors] = useState({});
  const [changingPw, setChangingPw] = useState(false);

  const handlePwChange = (e) => {
    setPwForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    if (pwErrors[e.target.name]) setPwErrors(prev => ({ ...prev, [e.target.name]: '' }));
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!pwForm.currentPassword) errs.currentPassword = 'Required';
    if (!pwForm.newPassword) errs.newPassword = 'Required';
    else if (pwForm.newPassword.length < 8) errs.newPassword = 'Min 8 characters';
    if (pwForm.newPassword !== pwForm.confirmPassword) errs.confirmPassword = 'Passwords do not match';
    if (Object.keys(errs).length) { setPwErrors(errs); return; }

    setChangingPw(true);
    try {
      await authAPI.changePassword(pwForm.currentPassword, pwForm.newPassword);
      success('Password changed successfully!');
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      toastError(err.response?.data?.message || 'Failed to change password');
    } finally {
      setChangingPw(false);
    }
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: '640px', margin: '0 auto' }}>
      <ToastContainer toasts={toasts} />

      <div style={{ marginBottom: '36px' }}>
        <h1 style={{ fontFamily: 'var(--font-head)', fontSize: '28px', fontWeight: 800, marginBottom: '6px', letterSpacing: '-0.5px' }}>Account Settings</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '15px' }}>Manage your profile and security preferences.</p>
      </div>

      {/* Profile card */}
      <Card className="glass-card" style={{ marginBottom: '24px' }}>
        <CardHeader>
          <h2 style={{ fontFamily: 'var(--font-head)', fontSize: '16px', fontWeight: 700 }}>Profile Information</h2>
        </CardHeader>
        <div style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '32px' }}>
            <Avatar name={user?.name || 'Admin'} size={64} radius="16px" />
            <div>
              <div style={{ fontFamily: 'var(--font-head)', fontSize: '20px', fontWeight: 700, color: '#fff', marginBottom: '2px' }}>{user?.name}</div>
              <div style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '8px' }}>{user?.email}</div>
              <div>
                <span style={{
                  background: 'linear-gradient(90deg, rgba(99,102,241,0.2), rgba(99,102,241,0.05))', color: 'var(--accent2)',
                  fontSize: '12px', padding: '4px 12px', borderRadius: '24px', border: '1px solid rgba(99,102,241,0.3)',
                  fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px'
                }}>{user?.role}</span>
              </div>
            </div>
          </div>
          <div className="glass" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', padding: '20px', borderRadius: '12px' }}>
            {[
              { label: 'Account created', value: user?.createdAt ? new Date(user.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) : '—' },
              { label: 'Last active', value: user?.lastLogin ? new Date(user.lastLogin).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' }) : 'Just now' },
            ].map(({ label, value }) => (
              <div key={label}>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px',
                  textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600 }}>{label}</div>
                <div style={{ fontSize: '14px', fontWeight: 500 }}>{value}</div>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Change password */}
      <Card className="glass-card">
        <CardHeader>
          <h2 style={{ fontFamily: 'var(--font-head)', fontSize: '16px', fontWeight: 700 }}>Security: Change Password</h2>
        </CardHeader>
        <form onSubmit={handleChangePassword} style={{ padding: '24px' }}>
          <Input label="Current Password" name="currentPassword" type="password"
            value={pwForm.currentPassword} onChange={handlePwChange}
            placeholder="••••••••" error={pwErrors.currentPassword} />
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <Input label="New Password" name="newPassword" type="password"
              value={pwForm.newPassword} onChange={handlePwChange}
              placeholder="Min 8 chars" error={pwErrors.newPassword} />
            <Input label="Confirm New Password" name="confirmPassword" type="password"
              value={pwForm.confirmPassword} onChange={handlePwChange}
              placeholder="Repeat password" error={pwErrors.confirmPassword} />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px', paddingTop: '20px', borderTop: '1px solid var(--border-light)' }}>
            <Button variant="primary" type="submit" loading={changingPw} style={{ padding: '12px 24px' }}>Update Password ✨</Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
