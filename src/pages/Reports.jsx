import { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Download, RefreshCw, AlertTriangle, CheckCircle, Clock, Users } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { getJobs, getCrew, getIncidents } from '../services/dataService';

const PIE_COLORS = { 'Urgent': '#ef4444', 'High': '#ea580c', 'Medium': '#3b82f6', 'Low': '#6b7280' };
const STATUS_COLORS = { 'Active': '#22c55e', 'Scheduled': '#3b82f6', 'Planning': '#f59e0b', 'On Hold': '#eab308', 'Completed': '#6b7280', 'Cancelled': '#ef4444' };

export default function Reports() {
  const [jobs, setJobs] = useState([]);
  const [crew, setCrew] = useState([]);
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getJobs(), getCrew(), getIncidents().catch(() => [])])
      .then(([j, c, i]) => { setJobs(j); setCrew(c); setJobs(j); setIncidents(i); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const activeJobs = jobs.filter(j => j.status === 'Active');
  const completedJobs = jobs.filter(j => j.status === 'Completed');
  const urgentJobs = jobs.filter(j => j.priority === 'Urgent' && j.status !== 'Completed' && j.status !== 'Cancelled');
  const completionRate = jobs.length > 0 ? Math.round((completedJobs.length / jobs.length) * 100) : 0;

  const statusData = Object.entries(STATUS_COLORS).map(([name, color]) => ({ name, value: jobs.filter(j => j.status === name).length, color }));
  const priorityData = Object.entries(PIE_COLORS).map(([name, color]) => ({ name, value: jobs.filter(j => j.priority === name).length, color }));

  // Jobs over time (by month)
  const monthMap = {};
  jobs.forEach(j => {
    if (!j.createdAt && !j.startDate) return;
    const d = new Date(j.createdAt || j.startDate);
    const key = d.toLocaleString('default', { month: 'short', year: '2-digit' });
    monthMap[key] = (monthMap[key] || 0) + 1;
  });
  const trendData = Object.entries(monthMap).map(([month, count]) => ({ month, count }));

  // Top clients
  const clientMap = {};
  jobs.forEach(j => { clientMap[j.client] = (clientMap[j.client] || 0) + 1; });
  const topClients = Object.entries(clientMap).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([name, count]) => ({ name, count }));

  // Crew workload
  const crewMap = {};
  jobs.filter(j => j.status === 'Active' || j.status === 'Scheduled').forEach(j => {
    if (j.crew) crewMap[j.crew] = (crewMap[j.crew] || 0) + 1;
  });
  const crewData = Object.entries(crewMap).map(([name, count]) => ({ name, count }));

  const exportPdf = () => window.print();

  const KPI_CARD = ({ icon: Icon, label, value, sub, color }) => (
    <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
      <div style={{ width: 48, height: 48, borderRadius: 10, background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', color }}>
        <Icon size={24} />
      </div>
      <div>
        <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{value}</div>
        <div style={{ fontSize: '0.78rem', color: 'var(--lux-gray)' }}>{label}</div>
        {sub && <div style={{ fontSize: '0.7rem', color, marginTop: 2 }}>{sub}</div>}
      </div>
    </div>
  );

  if (loading) return <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>Loading reports...</div>;

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><BarChart3 size={24} /> Reports & Analytics</h1>
          <p>Key metrics and visual insights across all operations</p>
        </div>
        <button className="btn btn-outline btn-sm" onClick={exportPdf}><Download size={14} /> Export PDF</button>
      </div>

      <div className="grid-4" style={{ marginBottom: '1.5rem' }}>
        <KPI_CARD icon={BarChart3} label="Total Jobs" value={jobs.length} sub={`${activeJobs.length} active`} color="#264f97" />
        <KPI_CARD icon={CheckCircle} label="Completion Rate" value={`${completionRate}%`} sub={`${completedJobs.length} completed`} color="#10b981" />
        <KPI_CARD icon={AlertTriangle} label="Urgent Jobs" value={urgentJobs.length} sub="Requiring attention" color="#ef4444" />
        <KPI_CARD icon={Users} label="Crews Deployed" value={Object.keys(crewMap).length} sub={`${crew.length} total crews`} color="#3b82f6" />
      </div>

      <div className="grid-2" style={{ marginBottom: '1.5rem' }}>
        <div className="card">
          <h3 style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.03em', color: 'var(--lux-gray)' }}>Jobs by Status</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={statusData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>{statusData.map(d => <Cell key={d.name} fill={d.color} />)}</Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h3 style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.03em', color: 'var(--lux-gray)' }}>Jobs by Priority</h3>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={priorityData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                {priorityData.map(d => <Cell key={d.name} fill={d.color} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid-2" style={{ marginBottom: '1.5rem' }}>
        <div className="card">
          <h3 style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.03em', color: 'var(--lux-gray)' }}>Jobs Created Over Time</h3>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Line type="monotone" dataKey="count" stroke="#264f97" strokeWidth={2} dot={{ fill: '#264f97', r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h3 style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.03em', color: 'var(--lux-gray)' }}>Crew Workload</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={crewData.length > 0 ? crewData : [{ name: 'No data', count: 0 }]} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis type="number" allowDecimals={false} />
              <YAxis dataKey="name" type="category" tick={{ fontSize: 12 }} width={100} />
              <Tooltip />
              <Bar dataKey="count" fill="#3b82f6" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="card">
        <h3 style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.03em', color: 'var(--lux-gray)' }}>Top Clients by Job Count</h3>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={topClients.length > 0 ? topClients : [{ name: 'No data', count: 0 }]}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="name" tick={{ fontSize: 11 }} />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Bar dataKey="count" fill="#f59e0b" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
