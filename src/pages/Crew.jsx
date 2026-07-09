import { useState } from 'react';
import { Plus, Users, Phone, Truck } from 'lucide-react';
import { crew as defaultCrew, jobs } from '../data/mockData';

export default function Crew() {
  const [crewList, setCrewList] = useState(defaultCrew);
  const [showModal, setShowModal] = useState(false);
  const [editCrew, setEditCrew] = useState(null);
  const [form, setForm] = useState({ name: '', leader: '', members: '', phone: '', email: '', vehicle: '' });

  const openNew = () => { setEditCrew(null); setForm({ name: '', leader: '', members: '', phone: '', email: '', vehicle: '' }); setShowModal(true); };
  const openEdit = (c) => { setEditCrew(c); setForm({ ...c, members: c.members.join(', ') }); setShowModal(true); };

  const save = () => {
    const data = { ...form, members: form.members.split(',').map(s => s.trim()) };
    if (editCrew) {
      setCrewList(crewList.map(c => c.id === editCrew.id ? { ...c, ...data } : c));
    } else {
      const newId = `CRW-${String(crewList.length + 1).padStart(3, '0')}`;
      setCrewList([...crewList, { id: newId, ...data }]);
    }
    setShowModal(false);
  };

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1>Crew Management</h1>
          <p>Manage traffic management crews and personnel</p>
        </div>
        <button className="btn btn-primary" onClick={openNew}><Plus size={16} /> Add Crew</button>
      </div>

      <div className="grid-3">
        {crewList.map(crew => {
          const activeJobs = jobs.filter(j => j.crew === crew.name && j.status === 'Active');
          return (
            <div className="card" key={crew.id} style={{ cursor: 'pointer' }} onClick={() => openEdit(crew)}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Users size={16} /> {crew.name}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--lux-gray)' }}>{crew.id}</div>
                </div>
                <span className="badge badge-info">{activeJobs.length} active</span>
              </div>
              <div style={{ fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                <strong>Leader:</strong> {crew.leader}
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--lux-gray)', marginBottom: '0.5rem' }}>
                <strong>Members:</strong> {crew.members.join(', ')}
              </div>
              <div style={{ display: 'flex', gap: '1rem', fontSize: '0.8rem', color: 'var(--lux-gray)' }}>
                <span><Phone size={13} /> {crew.phone}</span>
                <span><Truck size={13} /> {crew.vehicle}</span>
              </div>
            </div>
          );
        })}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>{editCrew ? 'Edit Crew' : 'Add Crew'}</h2>
            <div className="grid-2">
              <div className="form-group">
                <label>Crew Name</label>
                <input className="form-input" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Leader</label>
                <input className="form-input" value={form.leader} onChange={e => setForm({...form, leader: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Members (comma separated)</label>
                <input className="form-input" value={form.members} onChange={e => setForm({...form, members: e.target.value})} placeholder="Tom, Dick, Harry" />
              </div>
              <div className="form-group">
                <label>Phone</label>
                <input className="form-input" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input className="form-input" type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Vehicle</label>
                <input className="form-input" value={form.vehicle} onChange={e => setForm({...form, vehicle: e.target.value})} />
              </div>
            </div>
            <div className="modal-actions">
              <button className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={save}>{editCrew ? 'Update' : 'Add Crew'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}