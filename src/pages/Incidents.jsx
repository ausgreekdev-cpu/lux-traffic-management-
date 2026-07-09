import { useState } from 'react';
import { Plus, AlertTriangle, Search, Filter } from 'lucide-react';
import { jobs } from '../data/mockData';

const defaultIncidents = [
  { id: 'INC-001', jobId: 'JOB-003', type: 'Near Miss', date: '2026-07-09', time: '14:30', reportedBy: 'James Mitchell', location: 'Kwinana Freeway, Como WA', description: 'Vehicle nearly entered closed lane. Crew shouted warning.', severity: 'Medium', actions: 'Reported to Main Roads. Additional signage deployed.', status: 'Closed', createdAt: '2026-07-09T14:45:00Z' },
  { id: 'INC-002', jobId: 'JOB-001', type: 'Equipment Damage', date: '2026-07-10', time: '22:15', reportedBy: 'Tom Baker', location: 'Mitchell Freeway, Perth WA', description: 'TMA Truck struck by debris. Minor rear bumper damage.', severity: 'Low', actions: 'Vehicle removed from service. Scheduled for repair.', status: 'Open', createdAt: '2026-07-10T22:30:00Z' },
];

const severityColors = { Low: 'badge-active', Medium: 'badge-pending', High: 'badge-urgent', Critical: 'badge-urgent' };

export default function Incidents() {
  const [incidents, setIncidents] = useState(defaultIncidents);
  const [showModal, setShowModal] = useState(false);
  const [edit, setEdit] = useState(null);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');
  const [form, setForm] = useState({ jobId: '', type: 'Near Miss', date: '', time: '', reportedBy: '', location: '', description: '', severity: 'Medium', actions: '', status: 'Open', workflowStage: 'reported' });

  const filtered = incidents.filter(inc =>
    (filter === 'All' || inc.status === filter) &&
    (inc.description.toLowerCase().includes(search.toLowerCase()) || inc.location.toLowerCase().includes(search.toLowerCase()) || inc.id.toLowerCase().includes(search.toLowerCase()))
  );

  const openNew = () => { setEdit(null); setForm({ jobId: '', type: 'Near Miss', date: new Date().toISOString().split('T')[0], time: '', reportedBy: '', location: '', description: '', severity: 'Medium', actions: '', status: 'Open', workflowStage: 'reported' }); setShowModal(true); };
  const openEdit = (inc) => { setEdit(inc); setForm(inc); setShowModal(true); };

  const save = () => {
    if (edit) setIncidents(incidents.map(i => i.id === edit.id ? { ...i, ...form } : i));
    else setIncidents([{ id: `INC-${String(incidents.length + 1).padStart(3, '0')}`, ...form, createdAt: new Date().toISOString() }, ...incidents]);
    setShowModal(false);
  };

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1>Incident Reporting</h1>
          <p>Record and track safety incidents, near misses, and equipment damage</p>
        </div>
        <button className="btn btn-primary" onClick={openNew}><Plus size={16} /> Report Incident</button>
      </div>

      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--lux-gray)' }} />
            <input className="form-input" style={{ paddingLeft: '2.2rem' }} placeholder="Search incidents..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select className="form-select" style={{ width: 'auto' }} value={filter} onChange={e => setFilter(e.target.value)}>
            <option value="All">All</option>
            <option value="Open">Open</option>
            <option value="Closed">Closed</option>
          </select>
        </div>
      </div>

      <div className="card" style={{ overflowX: 'auto' }}>
        <table>
          <thead>
            <tr><th>ID</th><th>Type</th><th>Date</th><th>Location</th><th>Severity</th><th>Reported By</th><th>Status</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {filtered.map(inc => (
              <tr key={inc.id}>
                <td style={{ fontFamily: 'monospace', fontWeight: 600, fontSize: '0.8rem' }}>{inc.id}</td>
                <td>{inc.type}</td>
                <td style={{ fontSize: '0.8rem', whiteSpace: 'nowrap' }}>{inc.date} {inc.time}</td>
                <td style={{ fontSize: '0.8rem', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{inc.location}</td>
                <td><span className={`badge ${severityColors[inc.severity] || 'badge-info'}`}>{inc.severity}</span></td>
                <td>{inc.reportedBy}</td>
                <td><span className={`badge ${inc.status === 'Open' ? 'badge-pending' : 'badge-active'}`}>{inc.status}</span></td>
                <td><button className="btn btn-sm btn-outline" onClick={() => openEdit(inc)}>View</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>{edit ? 'View / Edit Incident' : 'Report Incident'}</h2>
            <div className="grid-2">
              <div className="form-group">
                <label>Incident Type</label>
                <select className="form-select" value={form.type} onChange={e => setForm({...form, type: e.target.value})}>
                  <option>Near Miss</option><option>Equipment Damage</option><option>Injury</option>
                  <option>Traffic Incident</option><option>Property Damage</option><option>Other</option>
                </select>
              </div>
              <div className="form-group">
                <label>Severity</label>
                <select className="form-select" value={form.severity} onChange={e => setForm({...form, severity: e.target.value})}>
                  <option>Low</option><option>Medium</option><option>High</option><option>Critical</option>
                </select>
              </div>
              <div className="form-group">
                <label>Date</label>
                <input className="form-input" type="date" value={form.date} onChange={e => setForm({...form, date: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Time</label>
                <input className="form-input" type="time" value={form.time} onChange={e => setForm({...form, time: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Related Job</label>
                <select className="form-select" value={form.jobId} onChange={e => setForm({...form, jobId: e.target.value})}>
                  <option value="">None</option>
                  {jobs.map(j => <option key={j.id} value={j.id}>{j.id} - {j.title}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Reported By</label>
                <input className="form-input" value={form.reportedBy} onChange={e => setForm({...form, reportedBy: e.target.value})} />
              </div>
            </div>
            <div className="form-group">
              <label>Location</label>
              <input className="form-input" value={form.location} onChange={e => setForm({...form, location: e.target.value})} />
            </div>
            <div className="form-group">
              <label>Description</label>
              <textarea className="form-textarea" value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="What happened?" />
            </div>
            <div className="form-group">
              <label>Actions Taken</label>
              <textarea className="form-textarea" value={form.actions} onChange={e => setForm({...form, actions: e.target.value})} placeholder="What was done in response?" />
            </div>
            <div className="form-group">
              <label>Workflow Stage</label>
              <div style={{ display: 'flex', gap: '0.25rem', marginBottom: '0.5rem', fontSize: '0.75rem' }}>
                {[
                  { key: 'reported', label: 'Reported', color: '#ef4444' },
                  { key: 'investigating', label: 'Investigating', color: '#f59e0b' },
                  { key: 'corrective', label: 'Corrective Actions', color: '#f97316' },
                  { key: 'signoff', label: 'Sign-off', color: '#3b82f6' },
                  { key: 'closed', label: 'Closed', color: '#10b981' },
                ].map((stage, i) => {
                  const active = form.workflowStage === stage.key;
                  const done = ['reported', 'investigating', 'corrective', 'signoff', 'closed'].indexOf(form.workflowStage) > ['reported', 'investigating', 'corrective', 'signoff', 'closed'].indexOf(stage.key);
                  return (
                    <button key={stage.key} type="button" onClick={() => setForm({...form, workflowStage: stage.key, status: stage.key === 'closed' ? 'Closed' : 'Open' })}
                      style={{
                        flex: 1, padding: '0.4rem 0.2rem', borderRadius: 6, border: active ? `2px solid ${stage.color}` : '1px solid #e2e8f0',
                        background: active ? `${stage.color}15` : done ? `${stage.color}10` : '#fff',
                        color: active ? stage.color : done ? stage.color : 'var(--lux-gray)',
                        fontWeight: active ? 700 : 400, cursor: 'pointer', fontSize: '0.7rem', textAlign: 'center',
                      }}>
                      {i + 1}. {stage.label}
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="form-group">
              <label>Status</label>
              <select className="form-select" value={form.status} onChange={e => setForm({...form, status: e.target.value})}>
                <option>Open</option><option>Closed</option>
              </select>
            </div>
            <div className="modal-actions">
              <button className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={save}>{edit ? 'Update' : 'Report Incident'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}