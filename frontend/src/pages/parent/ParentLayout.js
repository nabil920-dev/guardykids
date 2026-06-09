import React from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import { HiHome, HiCalendar, HiSearch, HiHeart } from 'react-icons/hi';

export default function ParentLayout() {
  const location = useLocation();
  const isActive = (path) => location.pathname === path ? 'sidebar-link active' : 'sidebar-link';

  return (
    <div className="dashboard-layout">
      <aside className="sidebar">
        <div className="sidebar-title">Espace Parent</div>
        <Link to="/parent" className={isActive('/parent')}><HiHome size={18} /> Tableau de bord</Link>
        <Link to="/parent/children" className={isActive('/parent/children')}><HiHeart size={18} /> Mes enfants</Link>
        <Link to="/parent/reservations" className={isActive('/parent/reservations')}><HiCalendar size={18} /> Mes réservations</Link>
        <div className="sidebar-title" style={{ marginTop: 16 }}>Navigation</div>
        <Link to="/nurseries" className="sidebar-link"><HiSearch size={18} /> Trouver une garderie</Link>
      </aside>
      <main className="dashboard-content">
        <Outlet />
      </main>
    </div>
  );
}
