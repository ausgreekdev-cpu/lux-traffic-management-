import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { lazy, Suspense } from 'react';

const Layout = lazy(() => import('./components/Layout'));
const Login = lazy(() => import('./pages/Login'));

const Dashboard = lazy(() => import('./pages/Dashboard'));
const Jobs = lazy(() => import('./pages/Jobs'));
const Clients = lazy(() => import('./pages/Clients'));
const Crew = lazy(() => import('./pages/Crew'));
const Equipment = lazy(() => import('./pages/Equipment'));
const EmailPage = lazy(() => import('./pages/EmailPage'));
const Settings = lazy(() => import('./pages/Settings'));
const ExportPage = lazy(() => import('./pages/ExportPage'));
const Incidents = lazy(() => import('./pages/Incidents'));
const Permits = lazy(() => import('./pages/Permits'));
const TmpGenerator = lazy(() => import('./pages/TmpGenerator'));
const Timesheets = lazy(() => import('./pages/Timesheets'));
const AgentDashboard = lazy(() => import('./pages/AgentDashboard'));
const AutomationCenter = lazy(() => import('./pages/AutomationCenter'));
const Reports = lazy(() => import('./pages/Reports'));
const Scoping = lazy(() => import('./pages/Scoping'));
const Quotes = lazy(() => import('./pages/Quotes'));
const LuxRepository = lazy(() => import('./pages/LuxRepository'));
const AuditLog = lazy(() => import('./pages/AuditLog'));
const BulkImport = lazy(() => import('./pages/BulkImport'));
const CalendarView = lazy(() => import('./pages/CalendarView'));
const Notifications = lazy(() => import('./pages/Notifications'));
const KanbanBoard = lazy(() => import('./pages/KanbanBoard'));

function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return children;
}

function AppRoutes() {
  return (
    <Suspense fallback={
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#f8f9fc' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: '#264f97', margin: '0 auto 1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1.2rem', color: '#fff' }}>L</div>
          <div style={{ fontSize: '0.85rem', color: '#6c757d' }}>Loading...</div>
        </div>
      </div>
    }>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route index element={<Dashboard />} />
          <Route path="jobs" element={<Jobs />} />
          <Route path="clients" element={<Clients />} />
          <Route path="crew" element={<Crew />} />
          <Route path="timesheets" element={<Timesheets />} />
          <Route path="incidents" element={<Incidents />} />
          <Route path="permits" element={<Permits />} />
          <Route path="tmp-generator" element={<TmpGenerator />} />
          <Route path="agents" element={<AgentDashboard />} />
          <Route path="automation" element={<AutomationCenter />} />
          <Route path="reports" element={<Reports />} />
          <Route path="equipment" element={<Equipment />} />
          <Route path="email" element={<EmailPage />} />
          <Route path="export" element={<ExportPage />} />
          <Route path="scoping" element={<Scoping />} />
          <Route path="quotes" element={<Quotes />} />
          <Route path="lux-repository" element={<LuxRepository />} />
          <Route path="kanban" element={<KanbanBoard />} />
          <Route path="notifications" element={<Notifications />} />
          <Route path="calendar" element={<CalendarView />} />
          <Route path="import" element={<BulkImport />} />
          <Route path="audit-log" element={<AuditLog />} />
          <Route path="settings" element={<Settings />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
