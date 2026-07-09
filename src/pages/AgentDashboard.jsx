import { useState, useEffect } from 'react';
import { Bot, Activity, CheckCircle, XCircle, AlertTriangle, RefreshCw, Play, Trash2, Zap } from 'lucide-react';
import { getLogs, getAgentStats, clearLogs } from '../services/agentLogger';
import { checkAllPermits } from '../services/permitMonitor';
import { getCrewAvailability } from '../services/dispatchAgent';
import { generateDailyReport } from '../services/reportAgent';

const agentIcons = {
  'Dispatch Agent': { icon: Zap, color: 'var(--lux-blue)', bg: '#dbeafe' },
  'Permit Monitor': { icon: AlertTriangle, color: 'var(--lux-warning)', bg: '#fef3c7' },
  'Reporting Agent': { icon: Activity, color: 'var(--lux-success)', bg: '#d1fae5' },
};

export default function AgentDashboard() {
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState({});
  const [running, setRunning] = useState(null);

  useEffect(() => { setLogs(getLogs()); setStats(getAgentStats()); }, []);

  const refresh = () => { setLogs(getLogs(100)); setStats(getAgentStats()); };

  const runAgent = (name) => {
    setRunning(name);
    setTimeout(() => {
      if (name === 'Permit Monitor') checkAllPermits();
      if (name === 'Reporting Agent') generateDailyReport();
      if (name === 'Dispatch Agent') {
        const avail = getCrewAvailability();
      }
      setTimeout(() => { setRunning(null); refresh(); }, 500);
    }, 100);
  };

  const runAllAgents = () => {
    setRunning('all');
    setTimeout(() => {
      checkAllPermits();
      generateDailyReport();
      getCrewAvailability();
      setTimeout(() => { setRunning(null); refresh(); }, 500);
    }, 100);
  };

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Bot size={24} /> Agent Operations</h1>
          <p>Autonomous agents monitoring and managing your traffic operations</p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button className="btn btn-gold" onClick={runAllAgents} disabled={running}><Zap size={16} /> {running === 'all' ? 'Running...' : 'Run All Agents'}</button>
          <button className="btn btn-outline" onClick={refresh}><RefreshCw size={16} /> Refresh</button>
          <button className="btn btn-outline" onClick={() => { clearLogs(); refresh(); }}><Trash2 size={16} /> Clear Logs</button>
        </div>
      </div>

      <div className="grid-3" style={{ marginBottom: '1.5rem' }}>
        {['Dispatch Agent', 'Permit Monitor', 'Reporting Agent'].map(name => {
          const s = stats[name] || { total: 0, success: 0, fail: 0 };
          const meta = agentIcons[name] || { icon: Bot, color: 'var(--lux-gray)', bg: '#f8f9fc' };
          const Icon = meta.icon;
          return (
            <div className="card" key={name}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div style={{ padding: '0.4rem', borderRadius: 8, background: meta.bg, color: meta.color }}><Icon size={20} /></div>
                  <div>
                    <div style={{ fontWeight: 600 }}>{name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--lux-gray)' }}>{s.total || 0} actions</div>
                  </div>
                </div>
                <button className="btn btn-sm btn-primary" onClick={() => runAgent(name)} disabled={running}>
                  <Play size={12} /> {running === name ? 'Running' : 'Run'}
                </button>
              </div>
              <div style={{ display: 'flex', gap: '1rem', fontSize: '0.8rem' }}>
                <span style={{ color: 'var(--lux-success)' }}><CheckCircle size={12} /> {s.success}</span>
                <span style={{ color: 'var(--lux-danger)' }}><XCircle size={12} /> {s.fail}</span>
              </div>
              {s.actions && (
                <div style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: 'var(--lux-gray)' }}>
                  {Object.entries(s.actions).slice(0, 3).map(([action, count]) => (
                    <span key={action} className="badge badge-info" style={{ marginRight: '0.25rem' }}>{action}: {count}</span>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="card">
        <h3 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Activity size={16} /> Agent Activity Log
        </h3>
        {logs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--lux-gray)', fontSize: '0.85rem' }}>
            No agent activity yet. Click "Run All Agents" to see them in action.
          </div>
        ) : (
          <table>
            <thead>
              <tr><th>Time</th><th>Agent</th><th>Action</th><th>Details</th><th>Status</th></tr>
            </thead>
            <tbody>
              {logs.slice(0, 20).map(log => (
                <tr key={log.id}>
                  <td style={{ fontSize: '0.75rem', whiteSpace: 'nowrap' }}>{new Date(log.timestamp).toLocaleString()}</td>
                  <td style={{ fontWeight: 500 }}>{log.agent}</td>
                  <td><span className="badge badge-info">{log.action}</span></td>
                  <td style={{ fontSize: '0.8rem', maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{log.details}</td>
                  <td>
                    <span className={`badge ${log.status === 'success' ? 'badge-active' : log.status === 'warning' ? 'badge-pending' : 'badge-urgent'}`}>
                      {log.status === 'warning' ? <AlertTriangle size={12} /> : log.status === 'success' ? <CheckCircle size={12} /> : <XCircle size={12} />}
                      {' '}{log.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}