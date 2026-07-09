import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { CalendarDays, ClipboardList, Users, HardHat, AlertTriangle, TrendingUp, Activity, ShieldCheck, FileText, ArrowRight, Bot, Zap, Clock, Mail } from 'lucide-react';
import { jobs, crew, clients } from '../data/mockData';

const COLORS = ['#10b981', '#f59e0b', '#3b82f6', '#ef4444', '#8b5cf6', '#ec4899'];

const typeData = [
  { name: 'Lane Closure', value: jobs.filter(j => j.type === 'Lane Closure').length },
  { name: 'Bridge Works', value: jobs.filter(j => j.type === 'Bridge Works').length },
  { name: 'Intersection', value: jobs.filter(j => j.type === 'Intersection Works').length },
  { name: 'Shoulder Works', value: jobs.filter(j => j.type === 'Shoulder Works').length },
  { name: 'Event Traffic', value: jobs.filter(j => j.type === 'Event Traffic').length },
  { name: 'Other', value: jobs.filter(j => ['Utility Works', 'Road Closure', 'Detour Setup'].includes(j.type)).length },
];

const weeklyData = [
  { day: 'Mon', jobs: 3 }, { day: 'Tue', jobs: 5 }, { day: 'Wed', jobs: 4 },
  { day: 'Thu', jobs: 6 }, { day: 'Fri', jobs: 3 }, { day: 'Sat', jobs: 1 }, { day: 'Sun', jobs: 0 },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const activeJobs = jobs.filter(j => j.status === 'Active');
  const urgentJobs = jobs.filter(j => j.priority === 'Urgent');

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--lux-blue)' }}>Operations Dashboard</h1>
          <p style={{ color: 'var(--lux-gray)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
            Perth, WA — {new Date().toLocaleDateString('en-AU', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <span className="badge badge-active">{activeJobs.length} Active Worksites</span>
          <span className="badge badge-urgent">{urgentJobs.length} Urgent</span>
        </div>
      </div>

      <div className="grid-4" style={{ marginBottom: '1.5rem' }}>
        {[
          { icon: ClipboardList, label: 'Active Jobs', value: activeJobs.length, color: 'var(--lux-blue)', bg: '#dbeafe', link: '/jobs' },
          { icon: AlertTriangle, label: 'Urgent Today', value: urgentJobs.length, color: 'var(--lux-danger)', bg: '#fee2e2', link: '/jobs' },
          { icon: Users, label: 'Active Clients', value: clients.filter(c => c.status === 'Active').length, color: 'var(--lux-success)', bg: '#d1fae5', link: '/clients' },
          { icon: HardHat, label: 'Crews Deployed', value: crew.filter(c => jobs.some(j => j.crew === c.name && j.status === 'Active')).length, color: 'var(--lux-gold)', bg: '#fef3c7', link: '/crew' },
        ].map((stat, i) => (
          <div className="card" key={i} style={{ cursor: 'pointer' }} onClick={() => navigate(stat.link)}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ padding: '0.6rem', borderRadius: 10, background: stat.bg, color: stat.color }}>
                <stat.icon size={22} />
              </div>
              <div>
                <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{stat.value}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--lux-gray)' }}>{stat.label}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid-4" style={{ marginBottom: '1.5rem' }}>
        {[
          { icon: AlertTriangle, label: 'Open Incidents', value: 2, color: 'var(--lux-danger)', bg: '#fee2e2', link: '/incidents' },
          { icon: ShieldCheck, label: 'Active Permits', value: 3, color: 'var(--lux-blue)', bg: '#e0e7ff', link: '/permits' },
          { icon: FileText, label: 'TMP Documents', value: 1, color: 'var(--lux-success)', bg: '#d1fae5', link: '/tmp-generator' },
          { icon: CalendarDays, label: 'Pending Timesheets', value: 3, color: 'var(--lux-warning)', bg: '#fef3c7', link: '/timesheets' },
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
            <TrendingUp size={16} /> Weekly Job Load
          </h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="day" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="jobs" fill="var(--lux-blue)" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="card">
          <h3 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Activity size={16} /> Job Types
          </h3>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={typeData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({name, percent}) => `${name} ${(percent*100).toFixed(0)}%`}>
                {typeData.map((entry, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3 style={{ fontSize: '0.9rem', fontWeight: 600 }}>Active & Scheduled Jobs</h3>
          <button className="btn btn-sm btn-outline" onClick={() => navigate('/jobs')}>View All <ArrowRight size={14} /></button>
        </div>
        <table>
          <thead>
            <tr>
              <th>Job ID</th><th>Title</th><th>Location</th><th>Priority</th><th>Type</th><th>Duration</th><th>Crew</th>
            </tr>
          </thead>
          <tbody>
            {jobs.filter(j => j.status === 'Active' || j.status === 'Scheduled').slice(0, 5).map(job => (
              <tr key={job.id}>
                <td style={{ fontFamily: 'monospace', fontWeight: 600 }}>{job.id}</td>
                <td>{job.title}</td>
                <td style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{job.location}</td>
                <td><span className={`badge badge-${job.priority === 'Urgent' ? 'urgent' : job.priority === 'High' ? 'active' : 'info'}`}>{job.priority}</span></td>
                <td style={{ fontSize: '0.8rem' }}>{job.type}</td>
                <td>{job.startDate} - {job.endDate}</td>
                <td><span className="badge badge-info">{job.crew}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid-2" style={{ marginTop: '1.5rem' }}>
        <div className="card">
          <h3 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Bot size={16} /> Agent Status
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {[
              { agent: 'Dispatch Agent', status: 'idle', lastRun: '2h ago', action: 'Crew allocation ready', icon: Zap, color: 'var(--lux-blue)' },
              { agent: 'Permit Monitor', status: 'active', lastRun: '15m ago', action: 'Monitoring 3 permits', icon: AlertTriangle, color: 'var(--lux-warning)' },
              { agent: 'Reporting Agent', status: 'idle', lastRun: '1d ago', action: 'Daily report ready', icon: Activity, color: 'var(--lux-success)' },
              { agent: 'Auto-Email', status: 'active', lastRun: 'Now', action: 'Triggers: Planning→Scheduled→Active→Completed', icon: Mail, color: 'var(--lux-info)' },
            ].map((a, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.5rem 0.75rem', background: '#f8f9fc', borderRadius: 8 }}>
                <div style={{ padding: '0.35rem', borderRadius: 6, background: `${a.color}15`, color: a.color }}>
                  <a.icon size={16} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{a.agent}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--lux-gray)' }}>{a.action}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span className={`badge ${a.status === 'active' ? 'badge-active' : 'badge-pending'}`} style={{ fontSize: '0.65rem' }}>{a.status}</span>
                  <div style={{ fontSize: '0.65rem', color: 'var(--lux-gray)', marginTop: '0.15rem' }}>{a.lastRun}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h3 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Clock size={16} /> Permit & Compliance Alerts
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {[
              { message: 'PRM-002 (JOB-001) expires July 12 — 3 days away', severity: 'warning' },
              { message: 'JOB-004 (Great Eastern Hwy) has no permit — starts Aug 1', severity: 'info' },
              { message: 'PRM-001 (JOB-005) approved — expires Aug 20', severity: 'success' },
            ].map((alert, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.55rem 0.75rem',
                borderRadius: 8, fontSize: '0.8rem',
                background: alert.severity === 'warning' ? '#fef3c7' : alert.severity === 'info' ? '#dbeafe' : '#d1fae5',
                color: alert.severity === 'warning' ? '#92400e' : alert.severity === 'info' ? '#1e40af' : '#065f46',
              }}>
                <AlertTriangle size={14} />
                {alert.message}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}