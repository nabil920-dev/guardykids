import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import Spinner from '../../components/Spinner';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/dashboard').then((res) => { setStats(res.data); setLoading(false); });
  }, []);

  if (loading) return <Spinner />;

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Administration GuardyKids</h1>
        <p className="page-subtitle">Vue d'ensemble de la plateforme</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">{stats.total_users}</div>
          <div className="stat-label">Utilisateurs</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.total_parents}</div>
          <div className="stat-label">Parents</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.total_owners}</div>
          <div className="stat-label">Propriétaires</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.total_nurseries}</div>
          <div className="stat-label">Garderies</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.total_reservations}</div>
          <div className="stat-label">Réservations</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color: 'var(--warning)' }}>{stats.pending_reservations}</div>
          <div className="stat-label">En attente</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <Link to="/admin/users" className="card" style={{ display: 'block', padding: 24, textAlign: 'center' }}>
          <div style={{ fontSize: 40, marginBottom: 8 }}>👥</div>
          <div style={{ fontWeight: 700 }}>Gérer les utilisateurs</div>
          <div style={{ fontSize: 13, color: 'var(--gray-500)', marginTop: 4 }}>{stats.total_users} utilisateurs</div>
        </Link>
        <Link to="/admin/nurseries" className="card" style={{ display: 'block', padding: 24, textAlign: 'center' }}>
          <div style={{ fontSize: 40, marginBottom: 8 }}>🏠</div>
          <div style={{ fontWeight: 700 }}>Gérer les garderies</div>
          <div style={{ fontSize: 13, color: 'var(--gray-500)', marginTop: 4 }}>{stats.total_nurseries} garderies</div>
        </Link>
      </div>
    </div>
  );
}
