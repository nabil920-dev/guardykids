import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';

// Public pages
import Home from './pages/public/Home';
import Login from './pages/public/Login';
import Register from './pages/public/Register';
import Nurseries from './pages/public/Nurseries';
import NurseryDetail from './pages/public/NurseryDetail';

// Parent pages
import ParentLayout from './pages/parent/ParentLayout';
import ParentDashboard from './pages/parent/ParentDashboard';
import Children from './pages/parent/Children';
import ParentReservations from './pages/parent/ParentReservations';

// Owner pages
import OwnerLayout from './pages/owner/OwnerLayout';
import OwnerDashboard from './pages/owner/OwnerDashboard';
import ManageNursery from './pages/owner/ManageNursery';
import OwnerReservations from './pages/owner/OwnerReservations';

// Admin pages
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminNurseries from './pages/admin/AdminNurseries';
import AdminReservations from './pages/admin/AdminReservations';

// Auth Guards
function RequireAuth({ children, role }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) return <Navigate to="/" replace />;
  return children;
}

function AppRoutes() {
  const { user } = useAuth();

  return (
    <>
      <Navbar />
      <Routes>
        {/* Public */}
        <Route path="/" element={<Home />} />
        <Route path="/nurseries" element={<Nurseries />} />
        <Route path="/nurseries/:id" element={<NurseryDetail />} />
        <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />
        <Route path="/register" element={user ? <Navigate to="/" /> : <Register />} />

        {/* Parent routes */}
        <Route path="/parent" element={<RequireAuth role="parent"><ParentLayout /></RequireAuth>}>
          <Route index element={<ParentDashboard />} />
          <Route path="children" element={<Children />} />
          <Route path="reservations" element={<ParentReservations />} />
        </Route>

        {/* Owner routes */}
        <Route path="/owner" element={<RequireAuth role="nursery_owner"><OwnerLayout /></RequireAuth>}>
          <Route index element={<OwnerDashboard />} />
          <Route path="nursery" element={<ManageNursery />} />
          <Route path="reservations" element={<OwnerReservations />} />
        </Route>

        {/* Admin routes */}
        <Route path="/admin" element={<RequireAuth role="admin"><AdminLayout /></RequireAuth>}>
          <Route index element={<AdminDashboard />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="nurseries" element={<AdminNurseries />} />
          <Route path="reservations" element={<AdminReservations />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
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
