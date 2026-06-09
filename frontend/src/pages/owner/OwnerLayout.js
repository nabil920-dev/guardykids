import React from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import { HiHome, HiOfficeBuilding, HiCalendar } from 'react-icons/hi';

export default function OwnerLayout() {
  const location = useLocation();
  const isActive = (path) => location.pathname === path ? 'sidebar-link active' : 'sidebar-link';

  return (
    <div className="dashboard-layout">
      <aside className="sidebar">
        <div className="sidebar-title">Espace Garderie</div>
        <Link to="/owner" className={isActive('/owner')}><HiHome size={18} /> Tableau de bord</Link>
        <Link to="/owner/nursery" className={isActive('/owner/nursery')}><HiOfficeBuilding size={18} /> Ma garderie</Link>
        <Link to="/owner/reservations" className={isActive('/owner/reservations')}><HiCalendar size={18} /> Réservations</Link>
      </aside>
      <main className="dashboard-content">
        <Outlet />
      </main>
    </div>
  );
}
