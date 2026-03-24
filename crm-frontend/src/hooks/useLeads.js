// src/hooks/useLeads.js
// Custom hook — manages lead list state, fetching, filtering, pagination

import { useState, useEffect, useCallback, useRef } from 'react';
import { leadsAPI } from '../services/api';

export const useLeads = (initialParams = {}) => {
  const [leads, setLeads] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [params, setParams] = useState({ page: 1, limit: 20, ...initialParams });

  const fetchLeads = useCallback(async (queryParams) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await leadsAPI.getAll(queryParams || params);
      setLeads(data.data.leads);
      setPagination(data.data.pagination);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load leads');
    } finally {
      setLoading(false);
    }
  }, [params]);

  useEffect(() => {
    fetchLeads(params);
  }, [params]);

  const updateParams = useCallback((updates) => {
    setParams(prev => ({ ...prev, page: 1, ...updates }));
  }, []);

  const goToPage = useCallback((page) => {
    setParams(prev => ({ ...prev, page }));
  }, []);

  // Optimistic status update (instant UI, confirmed by server)
  const optimisticStatusUpdate = useCallback((id, status) => {
    setLeads(prev => prev.map(l => l._id === id ? { ...l, status } : l));
  }, []);

  const removeLead = useCallback((id) => {
    setLeads(prev => prev.filter(l => l._id !== id));
    setPagination(prev => prev ? { ...prev, total: prev.total - 1 } : null);
  }, []);

  const addLead = useCallback((lead) => {
    setLeads(prev => [lead, ...prev]);
    setPagination(prev => prev ? { ...prev, total: prev.total + 1 } : null);
  }, []);

  const updateLead = useCallback((id, updates) => {
    setLeads(prev => prev.map(l => l._id === id ? { ...l, ...updates } : l));
  }, []);

  return {
    leads, pagination, loading, error, params,
    refetch: fetchLeads,
    updateParams,
    goToPage,
    optimisticStatusUpdate,
    removeLead,
    addLead,
    updateLead,
  };
};

// ─── Stats hook ───────────────────────────────────────────────────────────────
export const useStats = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await leadsAPI.getStats();
      setStats(data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load stats');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchStats(); }, [fetchStats]);

  return { stats, loading, error, refetch: fetchStats };
};
