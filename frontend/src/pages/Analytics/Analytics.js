import React, { useEffect, useState } from 'react';
import {
  ResponsiveContainer,
  BarChart, Bar,
  XAxis, YAxis, Tooltip, Legend,
  LineChart, Line
} from 'recharts';
import './Analytics.css';

export default function Analytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    (async () => {
      try {
        const res = await fetch('http://localhost:4000/api/analytics', {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || 'Failed to load analytics');
        setData(json);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <div style={{ paddingTop:80, color:'#fff', textAlign:'center' }}>Loading analytics...</div>;
  if (error) return <div style={{ paddingTop:80, color:'#fff', textAlign:'center' }}>{String(error)}</div>;
  if (!data) return <div style={{ paddingTop:80, color:'#fff', textAlign:'center' }}>No analytics available.</div>;

  const { summary, weekly } = data;

  return (
    <div style={{ paddingTop: 80, minHeight: '100vh', color: '#fff', maxWidth: 1100, margin: '0 auto', padding: '80px 24px 120px' }}>
      <h1 style={{ textAlign: 'center', marginBottom: 8 }}>Analytics</h1>
      <p style={{ textAlign: 'center', opacity: 0.7, marginBottom: 40 }}>Food efficiency & usage trends</p>

      <div className="analytics-grid">
        <Metric label="Efficiency" value={`${(summary.efficiency * 100).toFixed(1)}%`} hint="Consumed / (Consumed + Expired)" />
        <Metric label="Waste Rate" value={`${(summary.wasteRate * 100).toFixed(1)}%`} hint="Expired / (Consumed + Expired)" />
        <Metric label="Avg Shelf Life" value={summary.avgShelfLifeDays.toFixed(1)} hint="Days (purchase → expire)" />
        <Metric label="Soon Expiring" value={summary.soonExpiring} hint="<= 3 days left (active)" />
        <Metric label="Active Items" value={summary.activeCount} />
        <Metric label="Consumed" value={summary.consumed} />
        <Metric label="Expired" value={summary.expired} />
        <Metric label="Total Items" value={summary.totalItems} />
      </div>

      <section style={{ marginTop: 50 }}>
        <h2 style={{ marginBottom: 16 }}>Weekly Outcomes</h2>
        <div style={{ width: '100%', height: 320, background: '#1e1f24', borderRadius: 12, padding: 12 }}>
          <ResponsiveContainer>
            <BarChart data={weekly}>
              <XAxis dataKey="label" stroke="#ccc" />
              <YAxis stroke="#ccc" />
              <Tooltip />
              <Legend />
              <Bar dataKey="consumed" fill="#4caf50" name="Consumed" />
              <Bar dataKey="expired" fill="#f44336" name="Expired" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section style={{ marginTop: 50 }}>
        <h2 style={{ marginBottom: 16 }}>Efficiency Trend (Cumulative)</h2>
        <div style={{ width: '100%', height: 300, background: '#1e1f24', borderRadius: 12, padding: 12 }}>
          <ResponsiveContainer>
            <LineChart data={computeEfficiencySeries(weekly)}>
              <XAxis dataKey="label" stroke="#ccc" />
              <YAxis stroke="#ccc" domain={[0, 1]} tickFormatter={(v)=> (v*100).toFixed(0)+'%'} />
              <Tooltip formatter={(v)=> (v*100).toFixed(1)+'%'} />
              <Legend />
              <Line type="monotone" dataKey="efficiency" stroke="#03a9f4" strokeWidth={2} dot />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>
    </div>
  );
}

function Metric({ label, value, hint }) {
  return (
    <div className="metric">
      <div className="metric-label">{label}</div>
      <div className="metric-value">{value}</div>
      {hint && <div className="metric-hint">{hint}</div>}
    </div>
  );
}

function computeEfficiencySeries(weekly) {
  let cumConsumed = 0;
  let cumOutcome = 0; // consumed + expired
  return weekly.map(w => {
    cumConsumed += w.consumed;
    cumOutcome += (w.consumed + w.expired);
    return {
      label: w.label,
      efficiency: cumOutcome ? (cumConsumed / cumOutcome) : 0
    };
  });
}

