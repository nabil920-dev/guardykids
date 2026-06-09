import React from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import { HiChartBar, HiUsers, HiOfficeBuilding, HiCalendar } from 'react-icons/hi';

export default function AdminLayout() {
  const location = useLocation();
  const isActive = (path) => location.pathname === path ? 'sidebar-link active' : 'sidebar-link';

  return (
    <div className="dashboard-layout">
      <aside className="sidebar">
        <div className="sidebar-title">Administration</div>
        <Link to="/admin" className={isActive('/admin')}><HiChartBar size={18} /> Tableau de bord</Link>
        <Link to="/admin/users" className={isActive('/admin/users')}><HiUsers size={18} /> Utilisateurs</Link>
        <Link to="/admin/nurseries" className={isActive('/admin/nurseries')}><HiOfficeBuilding size={18} /> Garderies</Link>
        <Link to="/admin/reservations" className={isActive('/admin/reservations')}><HiCalendar size={18} /> Réservations</Link>
      </aside>
      <main className="dashboard-content">
        <Outlet />
      </main>
    </div>
  );
}
