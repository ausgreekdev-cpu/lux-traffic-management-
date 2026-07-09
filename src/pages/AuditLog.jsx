import { useState, useEffect } from 'react';
import { History, Search, RefreshCw, Filter, Download } from 'lucide-react';
import { getAuditLog } from '../services/dataService';

export default function AuditLog() {
  const [logs, setLogs] = useState([]);
  const [search, setSearch] = useState('');
  const [methodFilter, setMethodFilter] = useState('All');
  const [loading, setLoading] = useState(false);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const data = await getAuditLog();
      setLogs(data.reverse());
    } catch (e) {
      console.error('Failed to fetch audit log:', e);
    }
    setLoading(false);
  };

  useEffect(() => { fetchLogs(); }, []);

  const filtered = logs.filter(l =>
    (methodFilter === 'All' || l.method === methodFilter) &&
    (l.path.toLowerCase().includes(search.toLowerCase()) || JSON.stringify(l.body).toLowerCase().includes(search.toLowerCase()))
  );

  const exportLog = () => {
    const blob = new Blob([JSON.stringify(filtered, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-log-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><History size={24} /> Audit Log</h1>
          <p>Track all changes made across the system — full compliance trail</p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button className="btn btn-outline btn-sm" onClick={exportLog}><Download size={14} /> Export</button>
          <button className="btn btn-primary btn-sm" onClick={fetchLogs} disabled={loading}>
            <RefreshCw size={14} /> {loading ? 'Loading...' : 'Refresh'}
          </button>
        </div>
      </div>

      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--lux-gray)' }} />
            <input className="form-input" style={{ paddingLeft: '2.2rem' }} placeholder="Search audit log..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <Filter size={16} style={{ color: 'var(--lux-gray)' }} />
          <select className="form-select" style={{ width: 'auto' }} value={methodFilter} onChange={e => setMethodFilter(e.target.value)}>
            <option value="All">All Methods</option>
            <option value="POST">POST</option>
            <option value="PATCH">PATCH</option>
            <option value="DELETE">DELETE</option>
          </select>
        </div>
      </div>

      <div className="card" style={{ overflowX: 'auto' }}>
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--lux-gray)' }}>
            <History size={40} style={{ opacity: 0.3, marginBottom: '0.75rem' }} />
            <div style={{ fontSize: '0.9rem', fontWeight: 500 }}>No audit entries found</div>
            <div style={{ fontSize: '0.8rem', marginTop: '0.25rem' }}>Changes will appear here as you create, update, or delete records</div>
          </div>
        ) : (
          <table>
            <thead>
              <tr><th>Timestamp</th><th>Method</th><th>Path</th><th>Details</th></tr>
            </thead>
            <tbody>
              {filtered.map(log => (
                <tr key={log.id}>
                  <td style={{ fontSize: '0.8rem', whiteSpace: 'nowrap' }}>{new Date(log.timestamp).toLocaleString()}</td>
                  <td>
                    <span className={`badge ${log.method === 'POST' ? 'badge-active' : log.method === 'PATCH' ? 'badge-info' : 'badge-urgent'}`}>
                      {log.method}
                    </span>
                  </td>
                  <td style={{ fontFamily: 'monospace', fontSize: '0.8rem', maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{log.path}</td>
                  <td style={{ fontSize: '0.8rem', color: 'var(--lux-gray)', maxWidth: 400, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {log.body ? JSON.stringify(log.body).substring(0, 200) : '-'}
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
