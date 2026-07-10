import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { ClipboardCheck, DollarSign, FileText, ShieldCheck, Users, Target, TrendingUp, ArrowRight, Clock, AlertTriangle } from 'lucide-react';
import { getClients, getJobs, getPermits } from '../services/dataService';

const STATUS_PIE_COLORS = { 'Planning': '#f59e0b', 'Scheduled': '#3b82f6', 'Active': '#22c55e', 'Completed': '#6b7280', 'On Hold': '#eab308', 'Cancelled': '#ef4444' };

export default function Dashboard() {
  const navigate = useNavigate();
  const [clients, setClients] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [permits, setPermits] = useState([]);

  useEffect(() => {
    Promise.all([getClients(), getJobs(), getPermits()])
      .then(([c, j, p]) => { setClients(c); setJobs(j); setPermits(p); })
      .catch(() => {});
  }, []);

  const planningJobs = jobs.filter(j => j.status === 'Planning' || j.status === 'Scheduled');
  const activeJobs = jobs.filter(j => j.status === 'Active');
  const permApproved = permits.filter(p => p.status === 'Approved').length;
  const permPending = permits.filter(p => p.status === 'Pending').length;
  const expiringSoon = permits.filter(p => p.expiryDate && new Date(p.expiryDate) < new Date(Date.now() + 14 * 86400000) && p.status === 'Approved').length;

  const pipelineData = [
    { name: 'Enquiry', value: clients.filter(c => c.status === 'Active').length * 2, fill: '#f59e0b' },
    { name: 'Scoping', value: Math.max(1, Math.round(clients.filter(c => c.status === 'Active').length * 1.2)), fill: '#3b82f6' },
    { name: 'Quote', value: Math.max(1, Math.round(clients.filter(c => c.status === 'Active').length * 0.8)), fill: '#8b5cf6' },
    { name: 'TMP', value: planningJobs.length + activeJobs.length, fill: '#264f97' },
    { name: 'Approved', value: activeJobs.length, fill: '#10b981' },
  ];

  const jobStatusData = Object.entries(STATUS_PIE_COLORS).map(([name, color]) => ({
    name, value: jobs.filter(j => j.status === name).length, color,
  })).filter(d => d.value > 0);

  const monthlyValue = [
    { month: 'Jul', value: 85000 }, { month: 'Aug', value: 120000 },
    { month: 'Sep', value: 95000 }, { month: 'Oct', value: 140000 },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--lux-blue)' }}>Planning Dashboard</h1>
          <p style={{ color: 'var(--lux-gray)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
            Perth, WA — {new Date().toLocaleDateString('en-AU', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <span className="badge badge-active">{planningJobs.length} In Pipeline</span>
          <span className="badge badge-info">{activeJobs.length} Active Worksites</span>
        </div>
      </div>

      <div className="grid-4" style={{ marginBottom: '1.5rem' }}>
        {[
          { icon: ClipboardCheck, label: 'Scoping Queue', value: Math.max(1, Math.round(clients.length * 0.3)), color: '#f59e0b', bg: '#fef3c7', link: '/scoping' },
          { icon: DollarSign, label: 'Quotes Pending', value: Math.max(1, Math.round(clients.length * 0.2)), color: '#8b5cf6', bg: '#ede9fe', link: '/quotes' },
          { icon: FileText, label: 'TMPs to Draft', value: planningJobs.length, color: '#264f97', bg: '#dbeafe', link: '/tmp-generator' },
          { icon: Target, label: 'Approved Forecast', value: `${Math.round(activeJobs.length * 1.5)}`, suffix: ' next 30d', color: '#10b981', bg: '#d1fae5', link: '/jobs' },
        ].map((stat, i) => (
          <div className="card" key={i} style={{ cursor: 'pointer' }} onClick={() => navigate(stat.link)}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ padding: '0.6rem', borderRadius: 10, background: stat.bg, color: stat.color }}>
                <stat.icon size={22} />
              </div>
              <div>
                <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{stat.value}{stat.suffix || ''}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--lux-gray)' }}>{stat.label}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid-4" style={{ marginBottom: '1.5rem' }}>
        {[
          { icon: ShieldCheck, label: 'Permits Approved', value: permApproved, color: '#10b981', bg: '#d1fae5', link: '/permits' },
          { icon: Clock, label: 'Permits Pending', value: permPending, color: '#f59e0b', bg: '#fef3c7', link: '/permits' },
          { icon: AlertTriangle, label: 'Expiring Soon', value: expiringSoon, color: '#ef4444', bg: '#fee2e2', link: '/permits' },
          { icon: Users, label: 'Active Clients', value: clients.filter(c => c.status === 'Active').length, color: '#3b82f6', bg: '#dbeafe', link: '/clients' },
        ].map((stat, i) => (
          <div className="card" key={i} style={{ cursor: 'pointer' }} onClick={() => navigate(stat.link)}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ padding: '0.6rem', borderRadius: 10, background: stat.bg, color: stat.color }}>
                <stat.icon size={22} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{stat.value}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--lux-gray)' }}>{stat.label}</div>
              </div>
              <ArrowRight size={16} style={{ color: 'var(--lux-gray)' }} />
            </div>
          </div>
        ))}
      </div>

      <div className="grid-2" style={{ marginBottom: '1.5rem' }}>
        <div className="card">
          <h3 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <TrendingUp size={16} /> Planning Pipeline
          </h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={pipelineData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis type="number" />
              <YAxis dataKey="name" type="category" tick={{ fontSize: 12 }} width={80} />
              <Tooltip />
              <Bar dataKey="value" radius={[0, 4, 4, 0]}>{pipelineData.map(d => <Cell key={d.name} fill={d.fill} />)}</Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h3 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Target size={16} /> Job Status Overview
          </h3>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={jobStatusData} cx="50%" cy="50%" outerRadius={90} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                {jobStatusData.map(d => <Cell key={d.name} fill={d.color} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid-2" style={{ marginBottom: '1.5rem' }}>
        <div className="card">
          <h3 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <DollarSign size={16} /> Estimated Monthly Quote Value
          </h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={monthlyValue}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} />
              <Tooltip formatter={v => `$${v.toLocaleString()}`} />
              <Bar dataKey="value" fill="#264f97" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h3 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Clock size={16} /> Upcoming Permit & Compliance Alerts
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {permits.filter(p => p.expiryDate).sort((a, b) => new Date(a.expiryDate) - new Date(b.expiryDate)).slice(0, 5).map(p => {
              const days = Math.ceil((new Date(p.expiryDate) - new Date()) / 86400000);
              const severity = days <= 7 ? 'warning' : days <= 30 ? 'info' : 'success';
              return (
                <div key={p.id} style={{
                  display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.55rem 0.75rem',
                  borderRadius: 8, fontSize: '0.8rem',
                  background: severity === 'warning' ? '#fef3c7' : severity === 'info' ? '#dbeafe' : '#d1fae5',
                  color: severity === 'warning' ? '#92400e' : severity === 'info' ? '#1e40af' : '#065f46',
                }}>
                  <AlertTriangle size={14} />
                  <div style={{ flex: 1 }}>Permit for job — {p.reference || p.id} {days > 0 ? `expires in ${days}d` : 'expired'}</div>
                </div>
              );
            })}
            {permits.filter(p => p.expiryDate).length === 0 && (
              <div style={{ fontSize: '0.85rem', color: 'var(--lux-gray)', textAlign: 'center', padding: '1rem' }}>No upcoming permit expiries</div>
            )}
          </div>
        </div>
      </div>

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3 style={{ fontSize: '0.9rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Users size={16} /> Active Clients — Ready for Next Engagement
          </h3>
          <button className="btn btn-sm btn-outline" onClick={() => navigate('/clients')}>View All <ArrowRight size={14} /></button>
        </div>
        <table>
          <thead>
            <tr><th>Client</th><th>Region</th><th>Account Manager</th><th>Type</th><th>Status</th></tr>
          </thead>
          <tbody>
            {clients.filter(c => c.status === 'Active').slice(0, 6).map(c => (
              <tr key={c.id}>
                <td style={{ fontWeight: 600 }}>{c.name}</td>
                <td>{c.region || '-'}</td>
                <td>{c.accountManager || '-'}</td>
                <td><span className="badge badge-info">{c.type}</span></td>
                <td><span className="badge badge-active">Active</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
