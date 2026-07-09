import { useState } from 'react';
import { Search, Wrench, CalendarDays, MapPin, Plus } from 'lucide-react';
import { equipment as defaultEquipment } from '../data/mockData';

export default function Equipment() {
  const [equipList, setEquipList] = useState(defaultEquipment);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');
  const [showModal, setShowModal] = useState(false);
  const [edit, setEdit] = useState(null);
  const [form, setForm] = useState({ name: '', type: 'TMA Truck', status: 'Available', lastService: '', location: '' });

  const filtered = equipList.filter(e =>
    (filter === 'All' || e.status === filter) &&
    (e.name.toLowerCase().includes(search.toLowerCase()) || e.type.toLowerCase().includes(search.toLowerCase()))
  );

  const save = () => {
    if (edit) setEquipList(equipList.map(e => e.id === edit.id ? { ...e, ...form } : e));
    else setEquipList([...equipList, { id: `EQ-${String(equipList.length + 1).padStart(3, '0')}`, ...form }]);
    setShowModal(false);
  };

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1>Equipment & Assets</h1>
          <p>Track traffic management equipment, service schedules, and deployment</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setEdit(null); setForm({ name: '', type: 'TMA Truck', status: 'Available', lastService: '', location: '' }); setShowModal(true); }}><Plus size={16} /> Add Equipment</button>
      </div>

      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--lux-gray)' }} />
            <input className="form-input" style={{ paddingLeft: '2.2rem' }} placeholder="Search equipment..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select className="form-select" style={{ width: 'auto' }} value={filter} onChange={e => setFilter(e.target.value)}>
            <option value="All">All Status</option>
            <option value="Available">Available</option>
            <option value="In Use">In Use</option>
            <option value="Maintenance">Maintenance</option>
          </select>
        </div>
      </div>

      <div className="card" style={{ overflowX: 'auto' }}>
        <table>
          <thead>
            <tr><th>ID</th><th>Name</th><th>Type</th><th>Status</th><th>Last Service</th><th>Location</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {filtered.map(eq => (
              <tr key={eq.id}>
                <td style={{ fontFamily: 'monospace', fontWeight: 600, fontSize: '0.8rem' }}>{eq.id}</td>
                <td style={{ fontWeight: 500 }}>{eq.name}</td>
                <td>{eq.type}</td>
                <td>
                  <span className={`badge ${eq.status === 'Available' ? 'badge-active' : eq.status === 'In Use' ? 'badge-info' : 'badge-pending'}`}>
                    {eq.status}
                  </span>
                </td>
                <td style={{ fontSize: '0.8rem' }}>{eq.lastService}</td>
                <td style={{ fontSize: '0.8rem', color: 'var(--lux-gray)' }}><MapPin size={13} /> {eq.location}</td>
                <td>
                  <button className="btn btn-sm btn-outline" onClick={() => { setEdit(eq); setForm(eq); setShowModal(true); }}>Edit</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>{edit ? 'Edit Equipment' : 'Add Equipment'}</h2>
            <div className="grid-2">
              <div className="form-group">
                <label>Equipment Name</label>
                <input className="form-input" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Type</label>
                <select className="form-select" value={form.type} onChange={e => setForm({...form, type: e.target.value})}>
                  <option>TMA Truck</option><option>VMS Board</option><option>Arrow Board</option>
                  <option>Traffic Cones</option><option>Barriers</option><option>Signage</option>
                </select>
              </div>
              <div className="form-group">
                <label>Status</label>
                <select className="form-select" value={form.status} onChange={e => setForm({...form, status: e.target.value})}>
                  <option>Available</option><option>In Use</option><option>Maintenance</option>
                </select>
              </div>
              <div className="form-group">
                <label>Last Service Date</label>
                <input className="form-input" type="date" value={form.lastService} onChange={e => setForm({...form, lastService: e.target.value})} />
              </div>
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label>Location / Deployment</label>
                <input className="form-input" value={form.location} onChange={e => setForm({...form, location: e.target.value})} />
              </div>
            </div>
            <div className="modal-actions">
              <button className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={save}>{edit ? 'Update' : 'Add'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}