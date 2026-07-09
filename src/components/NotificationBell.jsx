import { useState, useEffect, useRef } from 'react';
import { Bell, Check, X } from 'lucide-react';
import { getNotifications, markNotificationRead, deleteNotification } from '../services/dataService';
import { useNavigate } from 'react-router-dom';

export default function NotificationBell() {
  const [notifs, setNotifs] = useState([]);
  const [open, setOpen] = useState(false);
  const ref = useRef();
  const navigate = useNavigate();

  const fetchNotifs = async () => {
    try {
      const data = await getNotifications();
      setNotifs(data);
    } catch (e) { /* ignore */ }
  };

  useEffect(() => {
    fetchNotifs();
    const interval = setInterval(fetchNotifs, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClick = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const unread = notifs.filter(n => !n.read).length;

  const handleMarkRead = async (id, e) => {
    e.stopPropagation();
    await markNotificationRead(id);
    setNotifs(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    await deleteNotification(id);
    setNotifs(prev => prev.filter(n => n.id !== id));
  };

  const handleViewAll = () => {
    setOpen(false);
    navigate('/notifications');
  };

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button onClick={() => setOpen(!open)} style={{ background: 'none', border: 'none', cursor: 'pointer', position: 'relative', padding: 4, color: 'var(--lux-gray)' }}>
        <Bell size={20} />
        {unread > 0 && (
          <span style={{
            position: 'absolute', top: 0, right: 0,
            background: '#ef4444', color: '#fff',
            fontSize: '0.6rem', fontWeight: 700,
            minWidth: 16, height: 16, borderRadius: 8,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '0 3px',
          }}>{unread > 99 ? '99+' : unread}</span>
        )}
      </button>

      {open && (
        <div style={{
          position: 'absolute', top: '100%', right: 0, zIndex: 200,
          width: 380, maxHeight: 420, overflowY: 'auto',
          background: '#fff', border: '1px solid var(--lux-border)',
          borderRadius: 10, boxShadow: '0 8px 30px rgba(0,0,0,0.15)',
          marginTop: 8,
        }}>
          <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--lux-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <strong>Notifications</strong>
            {unread > 0 && <span style={{ fontSize: '0.75rem', color: 'var(--lux-gray)' }}>{unread} unread</span>}
          </div>

          {notifs.length === 0 ? (
            <div style={{ padding: '2rem 1rem', textAlign: 'center', fontSize: '0.85rem', color: 'var(--lux-gray)' }}>
              <Bell size={28} style={{ opacity: 0.3, marginBottom: 8 }} /><br />
              No notifications yet
            </div>
          ) : (
            notifs.slice(0, 20).map(n => (
              <div key={n.id} style={{
                padding: '0.6rem 1rem', borderBottom: '1px solid var(--lux-border)',
                background: n.read ? 'transparent' : '#f0f4ff', cursor: 'default',
                display: 'flex', gap: '0.5rem', alignItems: 'flex-start',
              }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: n.read ? 400 : 600 }}>{n.title}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--lux-gray)', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{n.message}</div>
                  <div style={{ fontSize: '0.65rem', color: '#9ca3af', marginTop: 2 }}>{new Date(n.createdAt).toLocaleString()}</div>
                </div>
                <div style={{ display: 'flex', gap: '0.25rem', flexShrink: 0 }}>
                  {!n.read && <button onClick={(e) => handleMarkRead(n.id, e)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, color: '#3b82f6' }} title="Mark read"><Check size={14} /></button>}
                  <button onClick={(e) => handleDelete(n.id, e)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, color: '#9ca3af' }} title="Dismiss"><X size={14} /></button>
                </div>
              </div>
            ))
          )}

          <div style={{ padding: '0.5rem 1rem', borderTop: '1px solid var(--lux-border)', textAlign: 'center' }}>
            <button onClick={handleViewAll} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.8rem', color: 'var(--lux-blue)', fontWeight: 600 }}>View All</button>
          </div>
        </div>
      )}
    </div>
  );
}
