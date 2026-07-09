import { useState } from 'react';
import { Plus, Search, CheckCircle, XCircle } from 'lucide-react';
import { crew, jobs } from '../data/mockData';

const defaultShifts = [
  { id: 'TS-001', crewId: 'CRW-001', jobId: 'JOB-001', date: '2026-07-10', member: 'Tom Baker', startTime: '19:30', endTime: '05:30', hours: 10, breakHours: 1, notes: 'Night shift. TMA truck setup.', status: 'Approved' },
  { id: 'TS-002', crewId: 'CRW-001', jobId: 'JOB-001', date: '2026-07-10', member: 'Sarah Connor', startTime: '19:30', endTime: '05:30', hours: 10, breakHours: 1, notes: 'Night shift. Cone placement.', status: 'Approved' },
  { id: 'TS-003', crewId: 'CRW-001', jobId: 'JOB-001', date: '2026-07-11', member: 'Tom Baker', startTime: '19:30', endTime: '05:30', hours: 10, breakHours: 1, notes: '', status: 'Pending' },
  { id: 'TS-004', crewId: 'CRW-002', jobId: 'JOB-005', date: '2026-07-11', member: 'David Lee', startTime: '07:00', endTime: '17:00', hours: 10, breakHours: 0.5, notes: 'Intersection works - day shift', status: 'Pending' },
];

const allMembers = crew.flatMap(c => c.members);

export default function Timesheets() {
  const [shifts, setShifts] = useState(defaultShifts);
  const [showModal, setShowModal] = useState(false);
  const [edit, setEdit] = useState(null);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [form, setForm] = useState({ crewId: '', jobId: '', date: '', member: '', startTime: '', endTime: '', hours: 8, breakHours: 0.5, notes: '', status: 'Pending' });

  const filtered = shifts.filter(s =>
    (filterStatus === 'All' || s.status === filterStatus) &&
    (s.member.toLowerCase().includes(search.toLowerCase()) || s.jobId.toLowerCase().includes(search.toLowerCase()))
  );

  const totalHours = filtered.reduce((sum, s) => sum + (s.hours || 0), 0);
  const pending = filtered.filter(s => s.status === 'Pending').length;

  const openNew = () => { setEdit(null); setForm({ crewId: '', jobId: '', date: new Date().toISOString().split('T')[0], member: '', startTime: '07:00', endTime: '17:00', hours: 10, breakHours: 0.5, notes: '', status: 'Pending' }); setShowModal(true); };

  const save = () => {
    const calcHours = form.hours || 0;
    const data = { ...form, hours: calcHours };
    if (edit) setShifts(shifts.map(s => s.id === edit.id ? { ...s, ...data } : s));
    else setShifts([{ id: `TS-${String(shifts.length + 1).padStart(3, '0')}`, ...data }, ...shifts]);
    setShowModal(false);
  };

  const approveShift = (id) => setShifts(shifts.map(s => s.id === id ? { ...s, status: 'Approved' } : s));
  const rejectShift = (id) => setShifts(shifts.map(s => s.id === id ? { ...s, status: 'Rejected' } : s));

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1>Timesheets & Shifts</h1>
          <p>Crew scheduling, shift tracking, and timesheet approval</p>
        </div>
        <button className="btn btn-primary" onClick={openNew}><Plus size={16} /> New Shift</button>
      </div>

      <div className="grid-4" style={{ marginBottom: '1.5rem' }}>
        {[
          { label: 'Total Shifts', value: filtered.length, color: 'var(--lux-blue)', bg: '#dbeafe' },
          { label: 'Pending Approval', value: pending, color: 'var(--lux-warning)', bg: '#fef3c7' },
          { label: 'Total Hours', value: totalHours, color: 'var(--lux-success)', bg: '#d1fae5' },
          { label: 'Crew Members', value: allMembers.length, color: 'var(--lux-info)', bg: '#e0e7ff' },
        ].map((stat, i) => (
          <div className="card" key={i} style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: stat.color }}>{stat.value}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--lux-gray)' }}>{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="card" style={{ overflowX: 'auto' }}>
        <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem', alignItems: 'center' }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--lux-gray)' }} />
            <input className="form-input" style={{ paddingLeft: '2.2rem' }} placeholder="Search by member or job..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select className="form-select" style={{ width: 'auto' }} value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
            <option value="All">All</option>
            <option value="Pending">Pending</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>

        <table>
          <thead>
            <tr><th>Date</th><th>Member</th><th>Job</th><th>Start</th><th>End</th><th>Hours</th><th>Break</th><th>Status</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {filtered.map(shift => (
              <tr key={shift.id}>
                <td style={{ fontSize: '0.8rem', whiteSpace: 'nowrap' }}>{shift.date}</td>
                <td style={{ fontWeight: 500 }}>{shift.member}</td>
                <td style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>{shift.jobId}</td>
                <td>{shift.startTime}</td>
                <td>{shift.endTime}</td>
                <td style={{ fontWeight: 600 }}>{shift.hours}h</td>
                <td>{shift.breakHours}h</td>
                <td>
                  <span className={`badge ${shift.status === 'Approved' ? 'badge-active' : shift.status === 'Rejected' ? 'badge-urgent' : 'badge-pending'}`}>
                    {shift.status}
                  </span>
                </td>
                <td>
                  <div style={{ display: 'flex', gap: '0.3rem' }}>
                    {shift.status === 'Pending' && (
                      <>
                        <button className="btn btn-sm btn-success" onClick={() => approveShift(shift.id)} title="Approve"><CheckCircle size={14} /></button>
                        <button className="btn btn-sm btn-danger" onClick={() => rejectShift(shift.id)} title="Reject"><XCircle size={14} /></button>
                      </>
                    )}
                    <button className="btn btn-sm btn-outline" onClick={() => { setEdit(shift); setForm(shift); setShowModal(true); }}>Edit</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>{edit ? 'Edit Shift' : 'New Shift'}</h2>
            <div className="grid-2">
              <div className="form-group">
                <label>Crew Member</label>
                <select className="form-select" value={form.member} onChange={e => setForm({...form, member: e.target.value})}>
                  <option value="">Select member</option>
                  {allMembers.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Job</label>
                <select className="form-select" value={form.jobId} onChange={e => setForm({...form, jobId: e.target.value})}>
                  <option value="">Select job</option>
                  {jobs.map(j => <option key={j.id} value={j.id}>{j.id} - {j.title.substring(0, 30)}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Date</label>
                <input className="form-input" type="date" value={form.date} onChange={e => setForm({...form, date: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Crew</label>
                <select className="form-select" value={form.crewId} onChange={e => setForm({...form, crewId: e.target.value})}>
                  <option value="">Select crew</option>
                  {crew.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Start Time</label>
                <input className="form-input" type="time" value={form.startTime} onChange={e => setForm({...form, startTime: e.target.value})} />
              </div>
              <div className="form-group">
                <label>End Time</label>
                <input className="form-input" type="time" value={form.endTime} onChange={e => setForm({...form, endTime: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Total Hours</label>
                <input className="form-input" type="number" value={form.hours} onChange={e => { const v = Number(e.target.value) || 0; setForm({...form, hours: v}); }} />
              </div>
              <div className="form-group">
                <label>Break (hours)</label>
                <input className="form-input" type="number" step="0.5" value={form.breakHours} onChange={e => { const v = Number(e.target.value) || 0; setForm({...form, breakHours: v}); }} />
              </div>
            </div>
            <div className="form-group">
              <label>Notes</label>
              <input className="form-input" value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} />
            </div>
            <div className="form-group">
              <label>Status</label>
              <select className="form-select" value={form.status} onChange={e => setForm({...form, status: e.target.value})}>
                <option>Pending</option><option>Approved</option><option>Rejected</option>
              </select>
            </div>
            <div className="modal-actions">
              <button className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={save}>{edit ? 'Update' : 'Create Shift'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}