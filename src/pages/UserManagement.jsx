import { useState, useEffect } from 'react';
import { Users, Plus, Edit3, Trash2, ShieldCheck, X } from 'lucide-react';
import { getUsers, saveUser, deleteUser } from '../services/dataService';

const ROLES = ['admin', 'manager', 'crew', 'viewer'];

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'crew', avatar: '' });
  const [error, setError] = useState('');

  useEffect(() => { getUsers().then(setUsers).catch(() => {}); }, []);

  const openNew = () => { setEditUser(null); setForm({ name: '', email: '', password: '', role: 'crew', avatar: '' }); setError(''); setShowModal(true); };
  const openEdit = (u) => { setEditUser(u); setForm({ name: u.name, email: u.email, password: '', role: u.role, avatar: u.avatar || '' }); setError(''); setShowModal(true); };

  const handleSave = async () => {
    setError('');
    if (!form.name || !form.email) { setError('Name and email are required'); return; }
    if (!editUser && !form.password) { setError('Password is required for new users'); return; }
    if (form.password && form.password.length < 6) { setError('Password must be at least 6 characters'); return; }
    try {
      const payload = { ...form };
      if (!payload.password) delete payload.password;
      if (!payload.avatar) payload.avatar = form.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
      if (editUser) payload.id = editUser.id;
      const saved = await saveUser(payload);
      if (editUser) setUsers(users.map(u => u.id === saved.id ? saved : u));
      else setUsers([...users, saved]);
      setShowModal(false);
    } catch (err) { setError(err.message); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this user?')) return;
    try { await deleteUser(id); setUsers(users.filter(u => u.id !== id)); } catch (err) { alert(err.message); }
  };

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Users size={24} /> User Management</h1>
          <p>{users.length} users — manage accounts, roles, and credentials</p>
        </div>
        <button className="btn btn-primary" onClick={openNew}><Plus size={14} /> Add User</button>
      </div>

      <div className="card" style={{ overflowX: 'auto' }}>
        <table>
          <thead>
            <tr><th>Name</th><th>Email</th><th>Role</th><th>Password</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id}>
                <td style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--lux-blue)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 700 }}>{u.avatar || u.name?.split(' ').map(w => w[0]).join('').slice(0, 2)}</div>
                  {u.name}
                </td>
                <td>{u.email}</td>
                <td><span className={`badge ${u.role === 'admin' ? 'badge-urgent' : u.role === 'manager' ? 'badge-active' : u.role === 'crew' ? 'badge-info' : 'badge-completed'}`}>{u.role}</span></td>
                <td style={{ fontSize: '0.75rem', color: 'var(--lux-gray)' }}>{u.password?.startsWith('$2a') || u.password?.startsWith('$2b') ? '•••••••• (hashed)' : '⚠ plaintext'}</td>
                <td>
                  <div style={{ display: 'flex', gap: '0.3rem' }}>
                    <button className="btn btn-sm btn-outline" onClick={() => openEdit(u)}><Edit3 size={14} /></button>
                    <button className="btn btn-sm btn-outline" style={{ color: 'var(--lux-danger)' }} onClick={() => handleDelete(u.id)}><Trash2 size={14} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 480 }}>
            <h2>{editUser ? 'Edit User' : 'Add User'}</h2>
            {error && <div style={{ background: '#fee2e2', border: '1px solid #fecaca', borderRadius: 8, padding: '0.6rem', marginBottom: '1rem', fontSize: '0.8rem', color: '#991b1b' }}>{error}</div>}
            <div className="form-group">
              <label>Name</label>
              <input className="form-input" value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="Full name" />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input className="form-input" type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="email@lux-traffic.com.au" />
            </div>
            <div className="form-group">
              <label>Password {editUser && <span style={{ fontWeight: 400, color: 'var(--lux-gray)' }}>(leave blank to keep current)</span>}</label>
              <input className="form-input" type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} placeholder={editUser ? 'New password' : 'Password'} />
            </div>
            <div className="form-group">
              <label>Role</label>
              <select className="form-select" value={form.role} onChange={e => setForm({...form, role: e.target.value})}>
                {ROLES.map(r => <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>)}
              </select>
            </div>
            <div className="modal-actions">
              <button className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSave}>{editUser ? 'Update' : 'Create'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
