import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useSelector } from 'react-redux';
import { useEffect } from 'react';

import ProtectedRoute from './components/common/ProtectedRoute';
import Layout from './components/layout/Layout';

import LoginPage from './pages/auth/LoginPage';
import UnauthorizedPage from './pages/UnauthorizedPage';

// Admin
import AdminDashboard from './pages/admin/AdminDashboard';
import PatientsPage from './pages/admin/PatientsPage';
import ReportsPage from './pages/admin/ReportsPage';
import UploadReportPage from './pages/admin/UploadReportPage';
import UsersPage from './pages/admin/UsersPage';
import AnalyticsPage from './pages/admin/AnalyticsPage';

// Staff
import StaffDashboard from './pages/staff/StaffDashboard';

// Patient
import PatientDashboard from './pages/patient/PatientDashboard';
import PatientReportsPage from './pages/patient/PatientReportsPage';
import NotificationsPage from './pages/patient/NotificationsPage';

// Shared
import ProfilePage from './pages/patient/ProfilePage';

function RootRedirect() {
  const { user } = useSelector((s) => s.auth);
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'admin') return <Navigate to="/admin" replace />;
  if (user.role === 'lab_staff') return <Navigate to="/staff" replace />;
  return <Navigate to="/patient" replace />;
}

export default function App() {
  const { darkMode } = useSelector((s) => s.ui);
  useEffect(() => { document.documentElement.classList.toggle('dark', darkMode); }, [darkMode]);

  return (
    <BrowserRouter>
      <Toaster position="top-right" toastOptions={{ duration: 3000, style: { borderRadius: '12px' } }} />
      <Routes>
        <Route path="/" element={<RootRedirect />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/unauthorized" element={<UnauthorizedPage />} />

        {/* Admin */}
        <Route path="/admin" element={<ProtectedRoute roles={['admin']}><Layout /></ProtectedRoute>}>
          <Route index element={<AdminDashboard />} />
          <Route path="patients" element={<PatientsPage />} />
          <Route path="reports" element={<ReportsPage />} />
          <Route path="upload" element={<UploadReportPage />} />
          <Route path="users" element={<UsersPage />} />
          <Route path="analytics" element={<AnalyticsPage />} />
          <Route path="profile" element={<ProfilePage />} />
        </Route>

        {/* Lab Staff */}
        <Route path="/staff" element={<ProtectedRoute roles={['lab_staff']}><Layout /></ProtectedRoute>}>
          <Route index element={<StaffDashboard />} />
          <Route path="upload" element={<UploadReportPage />} />
          <Route path="reports" element={<ReportsPage />} />
          <Route path="patients" element={<PatientsPage />} />
          <Route path="profile" element={<ProfilePage />} />
        </Route>

        {/* Patient */}
        <Route path="/patient" element={<ProtectedRoute roles={['patient']}><Layout /></ProtectedRoute>}>
          <Route index element={<PatientDashboard />} />
          <Route path="reports" element={<PatientReportsPage />} />
          <Route path="notifications" element={<NotificationsPage />} />
          <Route path="profile" element={<ProfilePage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
