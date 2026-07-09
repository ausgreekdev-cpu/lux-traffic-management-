import { useState } from 'react';
import { Plus, Search, CheckCircle, XCircle, Clock, FileText } from 'lucide-react';
import { jobs } from '../data/mockData';

const defaultPermits = [
  { id: 'PRM-001', jobId: 'JOB-005', authority: 'Main Roads WA', type: 'TMP Approval', appliedDate: '2026-06-20', approvedDate: '2026-07-01', expiryDate: '2026-08-20', status: 'Approved', reference: 'MRWA-TMP-2026-0842', conditions: 'Night works only. ATCP must be on site.' },
  { id: 'PRM-002', jobId: 'JOB-001', authority: 'Main Roads WA', type: 'TMP Approval', appliedDate: '2026-07-01', approvedDate: null, expiryDate: '2026-07-12', status: 'Pending', reference: 'MRWA-TMP-2026-0915', conditions: '' },
  { id: 'PRM-003', jobId: 'JOB-002', authority: 'City of Perth', type: 'Works Permit', appliedDate: '2026-07-05', approvedDate: '2026-07-08', expiryDate: '2026-07-20', status: 'Approved', reference: 'CP-PRM-0726-44', conditions: 'Pedestrian access maintained at all times.' },
];

const statusIcons = { Approved: CheckCircle, Pending: Clock, Expired: XCircle, Rejected: XCircle };
const statusColors = { Approved: 'badge-active', Pending: 'badge-pending', Expired: 'badge-urgent', Rejected: 'badge-urgent' };

export default function Permits() {
  const [permits, setPermits] = useState(defaultPermits);
  const [showModal, setShowModal] = useState(false);
  const [edit, setEdit] = useState(null);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');
  const [form, setForm] = useState({ jobId: '', authority: 'Main Roads WA', type: 'TMP Approval', appliedDate: '', approvedDate: '', expiryDate: '', status: 'Pending', reference: '', conditions: '' });

  const filtered = permits.filter(p =>
    (filter === 'All' || p.status === filter) &&
    (p.authority.toLowerCase().includes(search.toLowerCase()) || p.reference.toLowerCase().includes(search.toLowerCase()) || p.id.toLowerCase().includes(search.toLowerCase()))
  );

  const openNew = () => { setEdit(null); setForm({ jobId: '', authority: 'Main Roads WA', type: 'TMP Approval', appliedDate: new Date().toISOString().split('T')[0], approvedDate: '', expiryDate: '', status: 'Pending', reference: '', conditions: '' }); setShowModal(true); };

  const save = () => {
    if (edit) setPermits(permits.map(p => p.id === edit.id ? { ...p, ...form } : p));
    else setPermits([{ id: `PRM-${String(permits.length + 1).padStart(3, '0')}`, ...form }, ...permits]);
    setShowModal(false);
  };

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1>Permit Management</h1>
          <p>Track TMP approvals, works permits, and authority submissions</p>
        </div>
        <button className="btn btn-primary" onClick={openNew}><Plus size={16} /> New Permit</button>
      </div>

      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--lux-gray)' }} />
            <input className="form-input" style={{ paddingLeft: '2.2rem' }} placeholder="Search permits..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select className="form-select" style={{ width: 'auto' }} value={filter} onChange={e => setFilter(e.target.value)}>
            <option value="All">All</option>
            <option value="Approved">Approved</option>
            <option value="Pending">Pending</option>
            <option value="Expired">Expired</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>
      </div>

      <div className="card" style={{ overflowX: 'auto' }}>
        <table>
          <thead>
            <tr><th>ID</th><th>Job</th><th>Authority</th><th>Type</th><th>Applied</th><th>Approved</th><th>Expires</th><th>Status</th><th>Reference</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {filtered.map(p => {
              const StatusIcon = statusIcons[p.status] || FileText;
              return (
                <tr key={p.id}>
                  <td style={{ fontFamily: 'monospace', fontWeight: 600, fontSize: '0.8rem' }}>{p.id}</td>
                  <td style={{ fontSize: '0.8rem' }}>{p.jobId}</td>
                  <td>{p.authority}</td>
                  <td style={{ fontSize: '0.8rem' }}>{p.type}</td>
                  <td style={{ fontSize: '0.8rem', whiteSpace: 'nowrap' }}>{p.appliedDate}</td>
                  <td style={{ fontSize: '0.8rem' }}>{p.approvedDate || '-'}</td>
                  <td style={{ fontSize: '0.8rem', whiteSpace: 'nowrap' }}>{p.expiryDate}</td>
                  <td><span className={`badge ${statusColors[p.status]}`}><StatusIcon size={12} /> {p.status}</span></td>
                  <td style={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>{p.reference || '-'}</td>
                  <td><button className="btn btn-sm btn-outline" onClick={() => { setEdit(p); setForm(p); setShowModal(true); }}>Edit</button></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>{edit ? 'Edit Permit' : 'New Permit'}</h2>
            <div className="grid-2">
              <div className="form-group">
                <label>Related Job</label>
                <select className="form-select" value={form.jobId} onChange={e => setForm({...form, jobId: e.target.value})}>
                  <option value="">Select job</option>
                  {jobs.map(j => <option key={j.id} value={j.id}>{j.id} - {j.title.substring(0, 40)}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Authority</label>
                <select className="form-select" value={form.authority} onChange={e => setForm({...form, authority: e.target.value})}>
                  <option>Main Roads WA</option><option>City of Perth</option>
                  <option>City of Stirling</option><option>WA Police</option><option>City of Fremantle</option><option>Other Council</option>
                </select>
              </div>
              <div className="form-group">
                <label>Permit Type</label>
                <select className="form-select" value={form.type} onChange={e => setForm({...form, type: e.target.value})}>
                  <option>TMP Approval</option><option>Works Permit</option>
                  <option>Road Closure Permit</option><option>Event Permit</option><option>Oversize Load Permit</option>
                </select>
              </div>
              <div className="form-group">
                <label>Status</label>
                <select className="form-select" value={form.status} onChange={e => setForm({...form, status: e.target.value})}>
                  <option>Pending</option><option>Approved</option><option>Rejected</option><option>Expired</option>
                </select>
              </div>
              <div className="form-group">
                <label>Applied Date</label>
                <input className="form-input" type="date" value={form.appliedDate} onChange={e => setForm({...form, appliedDate: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Approved Date</label>
                <input className="form-input" type="date" value={form.approvedDate || ''} onChange={e => setForm({...form, approvedDate: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Expiry Date</label>
                <input className="form-input" type="date" value={form.expiryDate} onChange={e => setForm({...form, expiryDate: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Reference Number</label>
                <input className="form-input" value={form.reference} onChange={e => setForm({...form, reference: e.target.value})} placeholder="e.g. MRWA-TMP-2026-xxxx" />
              </div>
            </div>
            <div className="form-group">
              <label>Conditions / Notes</label>
              <textarea className="form-textarea" value={form.conditions} onChange={e => setForm({...form, conditions: e.target.value})} />
            </div>
            <div className="modal-actions">
              <button className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={save}>{edit ? 'Update' : 'Create Permit'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}