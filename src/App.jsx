import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Jobs from './pages/Jobs';
import Clients from './pages/Clients';
import Crew from './pages/Crew';
import Equipment from './pages/Equipment';
import EmailPage from './pages/EmailPage';
import Settings from './pages/Settings';
import ExportPage from './pages/ExportPage';
import Incidents from './pages/Incidents';
import Permits from './pages/Permits';
import TmpGenerator from './pages/TmpGenerator';
import Timesheets from './pages/Timesheets';
import AgentDashboard from './pages/AgentDashboard';
import AutomationCenter from './pages/AutomationCenter';
import Reports from './pages/Reports';
import Scoping from './pages/Scoping';
import Quotes from './pages/Quotes';
import LuxRepository from './pages/LuxRepository';
import AuditLog from './pages/AuditLog';
import BulkImport from './pages/BulkImport';
import CalendarView from './pages/CalendarView';
import Notifications from './pages/Notifications';
import KanbanBoard from './pages/KanbanBoard';

function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return children;
}

function AppRoutes() {
  return (
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