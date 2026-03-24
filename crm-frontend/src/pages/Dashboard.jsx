// src/pages/Dashboard.jsx
// Premium Main dashboard — Live stats, Recharts visualizations, and recent leads

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useStats, useLeads } from '../hooks/useLeads';
import { Card, CardHeader, StatusBadge, SourceTag, Avatar, EmptyState, Spinner, Button } from '../components/UI';
import { useAuth } from '../context/AuthContext';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

// ─── STAT CARD ────────────────────────────────────────────────────────────────
const StatCard = ({ label, value, color, icon, sub, delay = '0s' }) => (
  <Card className="glass-card" style={{
    padding: '24px', position: 'relative', overflow: 'hidden', 
    animation: `fadeIn 0.5s ease backwards ${delay}`, cursor: 'default'
  }}>
    <div style={{ position: 'absolute', top: 0, right: 0, width: '120px', height: '120px',
      borderRadius: '50%', background: color, opacity: .1, filter: 'blur(30px)',
      transform: 'translate(30%, -30%)' }} />
    <div style={{ position: 'absolute', top: '24px', right: '24px', fontSize: '28px', opacity: .8, filter: `drop-shadow(0 4px 8px ${color})` }}>{icon}</div>
    <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '12px', fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase' }}>{label}</div>
    <div style={{ fontFamily: 'var(--font-head)', fontSize: '36px', fontWeight: 800, color: '#fff', lineHeight: 1, letterSpacing: '-1px' }}>{value}</div>
    {sub && <div style={{ fontSize: '13px', color: color, marginTop: '12px', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '6px' }}>
      <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: color }} />
      {sub}
    </div>}
  </Card>
);

// ─── CUSTOM CHART TOOLTIP ─────────────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass" style={{ padding: '12px', borderRadius: '12px', border: '1px solid var(--border-light)' }}>
        <p style={{ color: 'var(--text-muted)', fontSize: '12px', marginBottom: '4px', fontWeight: 600 }}>{label}</p>
        <p style={{ color: payload[0].color || '#fff', fontSize: '16px', fontWeight: 700 }}>
          {payload[0].name}: {payload[0].value}
        </p>
      </div>
    );
  }
  return null;
};

// Colors for the pie chart
const SOURCE_COLORS = {
  web: '#6366f1',
  social: '#ec4899',
  referral: '#10b981',
  cold: '#f59e0b',
  email: '#3b82f6',
  other: '#64748b'
};

export default function Dashboard() {
  const { stats, loading: statsLoading } = useStats();
  const { leads: recentLeads, loading: leadsLoading } = useLeads({ limit: 5, sortBy: '-createdAt' });
  const { user } = useAuth();
  const navigate = useNavigate();

  const ov = stats?.overview;

  // Format daily data for AreaChart
  const dailyData = stats?.leadsPerDay || [];

  // Format source data for PieChart
  const sourceData = stats?.bySource ? Object.entries(stats.bySource).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    key: name,
    value
  })) : [];

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '36px' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-head)', fontSize: '28px', fontWeight: 800, letterSpacing: '-0.5px' }}>
            Welcome back, <span style={{ color: 'var(--accent2)' }}>{user?.name?.split(' ')[0]}</span> 👋
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '15px', marginTop: '6px' }}>
            Here is your pipeline snapshot for today.
          </p>
        </div>
        <Button variant="primary" size="lg" onClick={() => navigate('/new')} style={{ padding: '14px 28px', borderRadius: '12px' }}>
          <span style={{ fontSize: '18px', marginRight: '6px' }}>✧</span> Add Lead
        </Button>
      </div>

      {/* Stat Cards */}
      {statsLoading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}>
          <Spinner size={36} />
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '24px', marginBottom: '36px' }}>
          <StatCard label="Total Leads"  value={ov?.total || 0}     color="var(--blue)"    icon="👥" sub="All time database" delay="0.1s" />
          <StatCard label="New Leads"    value={ov?.new || 0}       color="var(--accent2)" icon="✨" sub="Needs immediate contact" delay="0.2s" />
          <StatCard label="In Progress"  value={ov?.contacted || 0} color="var(--amber)"   icon="🔥" sub="Currently engaging" delay="0.3s" />
          <StatCard label="Converted"    value={ov?.converted || 0} color="var(--green)"   icon="🏆" sub={`${ov?.conversionRate || '0%'} success rate`} delay="0.4s" />
        </div>
      )}

      {/* Charts Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px', marginBottom: '36px' }}>
        
        {/* Area Chart: Leads over time */}
        <Card className="glass-card" style={{ animation: 'fadeIn 0.5s ease backwards 0.2s' }}>
          <CardHeader>
            <h2 style={{ fontFamily: 'var(--font-head)', fontSize: '18px', fontWeight: 700 }}>Lead Acquisition (Last 7 Days)</h2>
          </CardHeader>
          <div style={{ padding: '24px', height: '320px', width: '100%' }}>
            {statsLoading ? (
               <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}><Spinner /></div>
            ) : dailyData.length === 0 ? (
               <EmptyState icon="📈" title="No recent data" message="Start adding leads to see the trend." />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={dailyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorLeads" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--accent)" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="var(--accent)" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} dy={10} />
                  <YAxis stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="leads" name="New Leads" stroke="var(--accent)" strokeWidth={3} fillOpacity={1} fill="url(#colorLeads)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>

        {/* Pie Chart: Lead Sources */}
        <Card className="glass-card" style={{ animation: 'fadeIn 0.5s ease backwards 0.3s' }}>
          <CardHeader>
            <h2 style={{ fontFamily: 'var(--font-head)', fontSize: '18px', fontWeight: 700 }}>Sources Distribution</h2>
          </CardHeader>
          <div style={{ padding: '24px', height: '320px', width: '100%', display: 'flex', flexDirection: 'column' }}>
            {statsLoading ? (
               <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}><Spinner /></div>
            ) : sourceData.length === 0 ? (
               <EmptyState icon="🍕" title="No source data" message="Not enough sources recorded." />
            ) : (
              <>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={sourceData} innerRadius={60} outerRadius={85} paddingAngle={5} dataKey="value" stroke="none">
                      {sourceData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={SOURCE_COLORS[entry.key] || 'var(--accent)'} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                
                {/* Custom Legend */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', justifyContent: 'center', marginTop: '16px' }}>
                  {sourceData.map((entry, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--text-muted)', fontWeight: 500 }}>
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: SOURCE_COLORS[entry.key] || 'var(--accent)' }} />
                      {entry.name}
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </Card>

      </div>

      {/* Recent Leads Row */}
      <Card className="glass-card" style={{ animation: 'fadeIn 0.5s ease backwards 0.4s' }}>
        <CardHeader>
          <h2 style={{ fontFamily: 'var(--font-head)', fontSize: '18px', fontWeight: 700 }}>Recent Pipeline Activity</h2>
          <Button size="sm" variant="ghost" onClick={() => navigate('/leads')} style={{ color: 'var(--accent)' }}>View all leads →</Button>
        </CardHeader>

        {leadsLoading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}><Spinner size={28} /></div>
        ) : recentLeads.length === 0 ? (
          <EmptyState icon="📬" title="Your inbox is empty" message="Create your first lead or wait for new form submissions." />
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  {['Lead Name', 'Email Address', 'Source', 'Status', 'Date Added'].map(h => (
                    <th key={h} style={{
                      textAlign: 'left', padding: '16px 24px', fontSize: '12px',
                      textTransform: 'uppercase', letterSpacing: '1.5px',
                      color: 'var(--text-muted)', fontWeight: 700,
                      background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--border-light)',
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recentLeads.map((lead, i) => (
                  <tr
                    key={lead._id}
                    onClick={() => navigate(`/leads/${lead._id}`)}
                    style={{ cursor: 'pointer', transition: 'background .2s' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--glass-bg-hover)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <td style={{ padding: '18px 24px', borderBottom: '1px solid var(--border-light)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                        <Avatar name={lead.fullName || `${lead.firstName} ${lead.lastName}`} size={42} radius="12px" />
                        <div style={{ fontWeight: 600, fontSize: '15px', color: '#fff' }}>
                          {lead.firstName} {lead.lastName}
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '18px 24px', borderBottom: '1px solid var(--border-light)', color: 'var(--text-muted)', fontSize: '14px' }}>
                      {lead.email}
                    </td>
                    <td style={{ padding: '18px 24px', borderBottom: '1px solid var(--border-light)' }}>
                      <SourceTag source={lead.source} />
                    </td>
                    <td style={{ padding: '18px 24px', borderBottom: '1px solid var(--border-light)' }}>
                      <StatusBadge status={lead.status} />
                    </td>
                    <td style={{ padding: '18px 24px', borderBottom: '1px solid var(--border-light)', color: 'var(--text-muted)', fontSize: '14px', fontWeight: 500 }}>
                      {new Date(lead.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
