// src/components/ProtectedRoute.jsx
// Redirects unauthenticated users to /login

import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Spinner } from './UI';

export default function ProtectedRoute({ children, requiredRole }) {
  const { isAuthenticated, loading, user } = useAuth();
  const location = useLocation();

  // While checking saved session — show centered spinner
  if (loading) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center',
        justifyContent: 'center', flexDirection: 'column', gap: '16px',
      }}>
        <Spinner size={32} />
        <p style={{ color: 'var(--muted)', fontSize: '13px' }}>Loading...</p>
      </div>
    );
  }

  // Not logged in → redirect to login, preserve intended destination
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Role check (optional)
  if (requiredRole && user?.role !== requiredRole) {
    return (
      <div style={{ padding: '60px', textAlign: 'center', color: 'var(--muted)' }}>
        <div style={{ fontSize: '40px', marginBottom: '12px' }}>🔒</div>
        <h2 style={{ color: 'var(--text)', marginBottom: '8px' }}>Access Denied</h2>
        <p>You need <strong>{requiredRole}</strong> role to view this page.</p>
      </div>
    );
  }

  return children;
}
