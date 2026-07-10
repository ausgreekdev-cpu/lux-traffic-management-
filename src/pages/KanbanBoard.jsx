import { useState, useEffect, useCallback } from 'react';
import { Columns3, Search, ArrowUpDown, Clock, MapPin, HardHat, User, UserCircle, AlertCircle } from 'lucide-react';
import { getJobs, saveJob, getClients } from '../services/dataService';

const STATUS_LANES = ['Planning', 'Scheduled', 'Active', 'On Hold', 'Completed', 'Cancelled'];

const LANE_COLORS = {
  'Planning': { bg: '#fef3c7', border: '#f59e0b', text: '#92400e' },
  'Scheduled': { bg: '#dbeafe', border: '#3b82f6', text: '#1e40af' },
  'Active': { bg: '#dcfce7', border: '#22c55e', text: '#166534' },
  'On Hold': { bg: '#fef9c3', border: '#eab308', text: '#854d0e' },
  'Completed': { bg: '#f3f4f6', border: '#6b7280', text: '#374151' },
  'Cancelled': { bg: '#fee2e2', border: '#ef4444', text: '#991b1b' },
};

const PRIORITY_BADGE = {
  'Urgent': { bg: '#fecaca', color: '#dc2626' },
  'High': { bg: '#fed7aa', color: '#ea580c' },
  'Medium': { bg: '#dbeafe', color: '#2563eb' },
  'Low': { bg: '#f3f4f6', color: '#6b7280' },
};

export default function KanbanBoard() {
  const [allJobs, setAllJobs] = useState([]);
  const [clients, setClients] = useState([]);
  const [search, setSearch] = useState('');
  const [clientFilter, setClientFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [dragId, setDragId] = useState(null);
  const [dropLane, setDropLane] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      const [jobs, cl] = await Promise.all([getJobs(), getClients().catch(() => [])]);
      setAllJobs(jobs);
      setClients(cl);
    } catch (e) { /* ignore */ }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const filtered = allJobs.filter(j =>
    (search === '' || j.title.toLowerCase().includes(search.toLowerCase()) || j.client?.toLowerCase().includes(search.toLowerCase()) || j.location?.toLowerCase().includes(search.toLowerCase())) &&
    (clientFilter === 'all' || j.clientId === clientFilter) &&
    (priorityFilter === 'all' || j.priority === priorityFilter)
  );

  const grouped = Object.fromEntries(STATUS_LANES.map(s => [s, filtered.filter(j => j.status === s)]));

  const handleDragStart = (jobId) => setDragId(jobId);

  const handleDragOver = (e, lane) => {
    e.preventDefault();
    setDropLane(lane);
  };

  const handleDrop = async (e, targetStatus) => {
    e.preventDefault();
    setDropLane(null);
    if (!dragId) return;
    const job = allJobs.find(j => j.id === dragId);
    if (!job || job.status === targetStatus) return;
    const updated = { ...job, status: targetStatus };
    setAllJobs(prev => prev.map(j => j.id === dragId ? updated : j));
    setDragId(null);
    try { await saveJob(updated); } catch (e) { fetchData(); }
  };

  const handleDragEnd = () => { setDragId(null); setDropLane(null); };

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Columns3 size={24} /> Kanban Board</h1>
          <p>Drag jobs between lanes to update their workflow status</p>
        </div>
        <button className="btn btn-outline btn-sm" onClick={fetchData}><ArrowUpDown size={14} /> Refresh</button>
      </div>

      <div className="card" style={{ marginBottom: '1rem' }}>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 200, position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--lux-gray)' }} />
            <input className="form-input" style={{ paddingLeft: '2.2rem' }} placeholder="Search jobs..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select className="form-select" style={{ width: 'auto' }} value={clientFilter} onChange={e => setClientFilter(e.target.value)}>
            <option value="all">All Clients</option>
            {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <select className="form-select" style={{ width: 'auto' }} value={priorityFilter} onChange={e => setPriorityFilter(e.target.value)}>
            <option value="all">All Priorities</option>
            {['Urgent', 'High', 'Medium', 'Low'].map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '0.75rem', overflowX: 'auto', paddingBottom: '1rem', minHeight: 'calc(100vh - 280px)', alignItems: 'flex-start' }}>
        {STATUS_LANES.map(status => {
          const jobs = grouped[status] || [];
          const colors = LANE_COLORS[status];
          return (
            <div
              key={status}
              onDragOver={(e) => handleDragOver(e, status)}
              onDrop={(e) => handleDrop(e, status)}
              onDragLeave={() => setDropLane(null)}
              style={{
                flex: '0 0 280px', minWidth: 280, borderRadius: 10,
                background: dropLane === status ? '#f0f9ff' : colors.bg,
                border: `2px solid ${dropLane === status ? '#3b82f6' : colors.border}`,
                borderStyle: dropLane === status ? 'dashed' : 'solid',
                transition: 'all 0.2s', display: 'flex', flexDirection: 'column', maxHeight: 'calc(100vh - 280px)',
              }}
            >
              <div style={{ padding: '0.75rem 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
                <div style={{ fontWeight: 700, fontSize: '0.85rem', color: colors.text }}>{status}</div>
                <div style={{ background: colors.border, color: '#fff', borderRadius: 10, fontSize: '0.7rem', fontWeight: 700, minWidth: 22, height: 22, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 6px' }}>{jobs.length}</div>
              </div>

              <div style={{ padding: '0 0.5rem 0.5rem', overflowY: 'auto', flex: 1 }}>
                {jobs.length === 0 && (
                  <div style={{ textAlign: 'center', padding: '2rem 0.5rem', fontSize: '0.78rem', color: colors.text, opacity: 0.5 }}>
                    <AlertCircle size={20} style={{ margin: '0 auto 0.3rem' }} />
                    Drop jobs here
                  </div>
                )}
                {jobs.map(job => (
                  <div
                    key={job.id}
                    draggable
                    onDragStart={() => handleDragStart(job.id)}
                    onDragEnd={handleDragEnd}
                    style={{
                      background: '#fff', borderRadius: 8, padding: '0.65rem',
                      marginBottom: '0.4rem', cursor: 'grab', boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                      borderLeft: `3px solid ${PRIORITY_BADGE[job.priority]?.color || '#6b7280'}`,
                      opacity: dragId === job.id ? 0.4 : 1,
                      transition: 'opacity 0.15s',
                    }}
                  >
                    <div style={{ fontWeight: 600, fontSize: '0.8rem', marginBottom: '0.3rem', lineHeight: 1.3 }}>{job.title}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.72rem', color: 'var(--lux-gray)', marginBottom: '0.25rem' }}>
                      <User size={11} /> {job.client}
                    </div>
                    {job.location && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.72rem', color: 'var(--lux-gray)', marginBottom: '0.25rem' }}>
                        <MapPin size={11} /> {job.location}
                      </div>
                    )}
                    <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap', marginTop: '0.3rem', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.65rem', padding: '1px 5px', borderRadius: 4, background: PRIORITY_BADGE[job.priority]?.bg || '#f3f4f6', color: PRIORITY_BADGE[job.priority]?.color || '#6b7280', fontWeight: 600 }}>{job.priority}</span>
                      <span style={{ fontSize: '0.65rem', color: 'var(--lux-gray)', display: 'flex', alignItems: 'center', gap: '0.15rem' }}><Clock size={10} /> {job.startDate}</span>
                      {job.crew && <span style={{ fontSize: '0.65rem', color: 'var(--lux-gray)', display: 'flex', alignItems: 'center', gap: '0.15rem' }}><HardHat size={10} /> {job.crew}</span>}
                      {job.planner && <span style={{ fontSize: '0.65rem', color: 'var(--lux-gray)', display: 'flex', alignItems: 'center', gap: '0.15rem' }}><UserCircle size={10} /> {job.planner}</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
