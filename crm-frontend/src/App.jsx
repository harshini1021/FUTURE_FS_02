// src/App.jsx
// Router setup — public routes + protected routes wrapped in Layout

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';

// Pages
import Login      from './pages/Login';
import Signup     from './pages/Signup';
import Dashboard  from './pages/Dashboard';
import CalendarView from './pages/CalendarView';
import LeadsList  from './pages/LeadsList';
import LeadDetail from './pages/LeadDetail';
import LeadForm   from './pages/LeadForm';
import Settings   from './pages/Settings';

// Wrap page in Layout + ProtectedRoute
const Protected = ({ children, role }) => (
  <ProtectedRoute requiredRole={role}>
    <Layout>{children}</Layout>
  </ProtectedRoute>
);

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* Protected */}
          <Route path="/"              element={<Protected><Dashboard /></Protected>} />
          <Route path="/calendar"      element={<Protected><CalendarView /></Protected>} />
          <Route path="/leads"         element={<Protected><LeadsList /></Protected>} />
          <Route path="/leads/:id"     element={<Protected><LeadDetail /></Protected>} />
          <Route path="/leads/:id/edit" element={<Protected><LeadForm /></Protected>} />
          <Route path="/new"           element={<Protected><LeadForm /></Protected>} />
          <Route path="/settings"      element={<Protected><Settings /></Protected>} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
