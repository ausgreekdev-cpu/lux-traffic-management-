import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { LayoutDashboard, ClipboardList, Users, HardHat, Wrench, Mail, FileDown, Settings, Menu, LogOut, AlertTriangle, FileText, CalendarDays, ShieldCheck, Bot, BarChart3, Zap, ClipboardCheck, DollarSign, BookOpen, History, Upload, Calendar, Bell, Columns3 } from 'lucide-react';
import { useState, useEffect, Fragment } from 'react';
import { useAuth } from '../context/AuthContext';
import NotificationBell from './NotificationBell';
import OnboardingTour from './OnboardingTour';

const navItems = [
  // ── Planning ──
  { to: '/', icon: LayoutDashboard, label: 'Dashboard', roles: ['admin', 'manager', 'crew', 'viewer'], section: 'PLANNING' },
  { to: '/scoping', icon: ClipboardCheck, label: 'Scoping & Intake', roles: ['admin', 'manager'] },
  { to: '/quotes', icon: DollarSign, label: 'Quotes & Proposals', roles: ['admin', 'manager'] },
  { to: '/tmp-generator', icon: FileText, label: 'TMP Generator', roles: ['admin', 'manager'] },
  { to: '/permits', icon: ShieldCheck, label: 'Permits & Approvals', roles: ['admin', 'manager'] },
  { to: '/lux-repository', icon: BookOpen, label: 'LUX Repository', roles: ['admin', 'manager', 'crew'] },
  { to: '/calendar', icon: Calendar, label: 'Planning Calendar', roles: ['admin', 'manager', 'crew', 'viewer'] },
  { to: '/kanban', icon: Columns3, label: 'Planning Board', roles: ['admin', 'manager'] },
  { to: '/reports', icon: BarChart3, label: 'Reports & Analytics', roles: ['admin', 'manager', 'viewer'] },

  // ── Operations ──
  { to: '/jobs', icon: ClipboardList, label: 'Job Board', roles: ['admin', 'manager', 'crew', 'viewer'], section: 'OPERATIONS' },
  { to: '/crew', icon: HardHat, label: 'Crew', roles: ['admin', 'manager'] },
  { to: '/equipment', icon: Wrench, label: 'Equipment', roles: ['admin', 'manager', 'crew'] },
  { to: '/incidents', icon: AlertTriangle, label: 'Incidents', roles: ['admin', 'manager', 'crew'] },
  { to: '/timesheets', icon: CalendarDays, label: 'Timesheets', roles: ['admin', 'manager', 'crew'] },
  { to: '/clients', icon: Users, label: 'Clients', roles: ['admin', 'manager'] },

  // ── Admin ──
  { to: '/email', icon: Mail, label: 'Email & Templates', roles: ['admin', 'manager'], section: 'ADMIN' },
  { to: '/agents', icon: Bot, label: 'Agents', roles: ['admin', 'manager'] },
  { to: '/automation', icon: Zap, label: 'Automation', roles: ['admin'] },
  { to: '/notifications', icon: Bell, label: 'Notifications', roles: ['admin', 'manager', 'crew'] },
  { to: '/import', icon: Upload, label: 'Bulk Import', roles: ['admin', 'manager'] },
  { to: '/export', icon: FileDown, label: 'Export', roles: ['admin', 'manager', 'viewer'] },
  { to: '/audit-log', icon: History, label: 'Audit Log', roles: ['admin'] },
  { to: '/users', icon: ShieldCheck, label: 'User Management', roles: ['admin'] },
  { to: '/settings', icon: Settings, label: 'Settings', roles: ['admin'] },
];

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showTour, setShowTour] = useState(() => localStorage.getItem('lux_tour_complete') !== 'true');
  const { user, logout, hasRole } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const visibleItems = navItems.filter(item => item.roles.some(r => hasRole(r)));

  // Deduplicate section labels for rendered separators
  const renderSectionLabel = (item, i) => {
    if (!item.section) return null;
    const prev = visibleItems[i - 1];
    if (prev && prev.section === item.section) return null;
    return (
      <div key={`sec-${item.section}`} style={{
        fontSize: '0.6rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em',
        color: 'rgba(255,255,255,0.35)', padding: '1rem 1rem 0.35rem',
      }}>{item.section}</div>
    );
  };

  useEffect(() => {
    const apply = () => {
      const isDark = localStorage.getItem('lux_dark_mode') === 'true';
      document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
    };
    apply();
    window.addEventListener('themechange', apply);
    window.addEventListener('storage', (e) => { if (e.key === 'lux_dark_mode') apply(); });
    return () => { window.removeEventListener('themechange', apply); };
  }, []);

  return (
    <>
    <div className="app-layout" style={{ display: 'flex', minHeight: '100vh' }}>
      <aside className={`sidebar ${sidebarOpen ? 'sidebar--open' : ''}`}>
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: 40, height: 40, borderRadius: 10,
              background: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 800, fontSize: '1.2rem', color: 'var(--lux-blue)',
            }}>L</div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '1rem', lineHeight: 1.2 }}>LUX Traffic</div>
              <div style={{ fontSize: '0.7rem', opacity: 0.7 }}>Management Portal</div>
            </div>
          </div>
        </div>
        <nav style={{ flex: 1, padding: '0.75rem', overflowY: 'auto' }}>
          {visibleItems.map((item, i) => (
            <Fragment key={item.to}>
              {renderSectionLabel(item, i)}
              <NavLink
              to={item.to}
              end={item.to === '/'}
              onClick={() => setSidebarOpen(false)}
              style={({ isActive }) => ({
                display: 'flex', alignItems: 'center', gap: '0.75rem',
                padding: '0.65rem 1rem', borderRadius: 8,
                marginBottom: 2, fontSize: '0.85rem', fontWeight: 500,
                background: isActive ? 'rgba(255,255,255,0.12)' : 'transparent',
                color: isActive ? '#fff' : 'rgba(255,255,255,0.7)',
                transition: 'all 0.2s',
              })}
            >
              <item.icon size={18} />
              {item.label}
            </NavLink>
          </Fragment>
        ))}
        </nav>
        <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid rgba(255,255,255,0.1)', fontSize: '0.75rem', opacity: 0.5 }}>
          LUX Traffic Management v2.0<br />
          Perth, Western Australia
        </div>
      </aside>

      <div className="main-area">
        <header className="top-header">
          <button className="menu-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
            <Menu size={20} />
          </button>
          <div style={{ flex: 1 }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <NotificationBell />
            {user && (
              <>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 600 }}>{user.name}</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--lux-gray)' }}>{user.email}</div>
                </div>
                <div style={{
                  width: 36, height: 36, borderRadius: '50%',
                  background: 'var(--lux-blue)', color: '#fff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 700, fontSize: '0.9rem',
                }}>{user.avatar}</div>
                <button onClick={() => { localStorage.removeItem('lux_tour_complete'); setShowTour(true); }} style={{ background: 'none', border: 'none', color: 'var(--lux-gray)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem' }}>
                  ? Help
                </button>
                <button onClick={handleLogout} style={{ background: 'none', border: 'none', color: 'var(--lux-gray)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.8rem' }}>
                  <LogOut size={16} /> Logout
                </button>
              </>
            )}
          </div>
        </header>
        <main className="main-content">
          <Outlet />
        </main>
      </div>

      <style>{`
        .sidebar {
          width: var(--sidebar-width);
          min-width: var(--sidebar-width);
          background: var(--lux-blue);
          color: #fff;
          display: flex;
          flex-direction: column;
          min-height: 100vh;
          position: fixed;
          top: 0;
          left: 0;
          bottom: 0;
          z-index: 100;
        }

        .main-area {
          margin-left: var(--sidebar-width);
          flex: 1;
          display: flex;
          flex-direction: column;
          min-height: 100vh;
        }

        .top-header {
          height: var(--header-height);
          border-bottom: 1px solid var(--lux-border);
          background: #fff;
          display: flex;
          align-items: center;
          padding: 0 1.5rem;
          position: sticky;
          top: 0;
          z-index: 50;
        }

        .menu-toggle {
          background: none;
          border: none;
          display: none;
          margin-right: 0.75rem;
          cursor: pointer;
          color: var(--lux-gray);
        }

        .main-content {
          flex: 1;
          padding: 1.5rem;
          max-width: 1400px;
          width: 100%;
          margin: 0 auto;
        }

        @media (max-width: 768px) {
          .sidebar {
            position: fixed;
            transform: translateX(-100%);
            transition: transform 0.3s ease;
          }
          .sidebar.sidebar--open {
            transform: translateX(0);
          }
          .main-area {
            margin-left: 0;
          }
          .menu-toggle {
            display: flex;
          }
          .sidebar nav a {
            padding: 0.75rem 1rem;
            font-size: 0.9rem;
          }
        }

        @media (min-width: 769px) {
          .sidebar {
            position: fixed;
          }
        }
      `}</style>
      </div>
      {showTour && <OnboardingTour onComplete={() => setShowTour(false)} />}
    </>
  );
}