import { useState, useEffect } from 'react';
import { Bell, Check, X, Trash2 } from 'lucide-react';
import { getNotifications, markNotificationRead, deleteNotification } from '../services/dataService';

export default function Notifications() {
  const [notifs, setNotifs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifs = async () => {
    try {
      const data = await getNotifications();
      setNotifs(data);
    } catch (e) { /* ignore */ }
    setLoading(false);
  };

  useEffect(() => { fetchNotifs(); }, []);

  const handleMarkRead = async (id) => {
    await markNotificationRead(id);
    setNotifs(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const handleDelete = async (id) => {
    await deleteNotification(id);
    setNotifs(prev => prev.filter(n => n.id !== id));
  };

  const markAllRead = async () => {
    const unread = notifs.filter(n => !n.read);
    for (const n of unread) await markNotificationRead(n.id);
    setNotifs(prev => prev.map(n => ({ ...n, read: true })));
  };

  const clearAll = async () => {
    for (const n of notifs) await deleteNotification(n.id);
    setNotifs([]);
  };

  const unread = notifs.filter(n => !n.read).length;

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Bell size={24} /> Notifications</h1>
          <p>{unread} unread notification{unread !== 1 ? 's' : ''}</p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {unread > 0 && <button className="btn btn-sm btn-outline" onClick={markAllRead}><Check size={14} /> Mark All Read</button>}
          {notifs.length > 0 && <button className="btn btn-sm btn-outline" onClick={clearAll}><Trash2 size={14} /> Clear All</button>}
        </div>
      </div>

      <div className="card">
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--lux-gray)' }}>Loading...</div>
        ) : notifs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--lux-gray)' }}>
            <Bell size={40} style={{ opacity: 0.3, marginBottom: '0.75rem' }} />
            <div style={{ fontSize: '0.9rem', fontWeight: 500 }}>No notifications</div>
            <div style={{ fontSize: '0.8rem', marginTop: '0.25rem' }}>Notifications appear here when job statuses change or crew assignments are updated</div>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table>
              <thead>
                <tr><th>Status</th><th>Type</th><th>Message</th><th>Time</th><th style={{ width: 80 }}>Actions</th></tr>
              </thead>
              <tbody>
                {notifs.map(n => (
                  <tr key={n.id} style={{ background: n.read ? undefined : '#f0f4ff' }}>
                    <td>{n.read ? <span style={{ color: '#9ca3af', fontSize: '0.8rem' }}>Read</span> : <span className="badge badge-active">New</span>}</td>
                    <td><span style={{ fontSize: '0.8rem' }}>{n.type === 'job_status' ? 'Status Change' : n.type === 'crew_change' ? 'Crew Change' : n.type}</span></td>
                    <td style={{ maxWidth: 400 }}>
                      <div style={{ fontWeight: n.read ? 400 : 600, fontSize: '0.85rem' }}>{n.title}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--lux-gray)' }}>{n.message}</div>
                    </td>
                    <td style={{ fontSize: '0.78rem', whiteSpace: 'nowrap', color: 'var(--lux-gray)' }}>{new Date(n.createdAt).toLocaleString()}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.25rem' }}>
                        {!n.read && <button className="btn btn-sm" onClick={() => handleMarkRead(n.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: '#3b82f6' }} title="Mark read"><Check size={14} /></button>}
                        <button className="btn btn-sm" onClick={() => handleDelete(n.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: '#9ca3af' }} title="Delete"><X size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
