import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import StatusBadge from '../../components/StatusBadge';
import Spinner from '../../components/Spinner';

export default function ParentDashboard() {
  const { user } = useAuth();
  const [reservations, setReservations] = useState([]);
  const [children, setChildren] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.get('/reservations'), api.get('/children')]).then(([r, c]) => {
      setReservations(r.data);
      setChildren(c.data);
      setLoading(false);
    });
  }, []);

  if (loading) return <Spinner />;

  const upcoming = reservations.filter((r) => r.status === 'confirmed' || r.status === 'pending');

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Bonjour, {user?.first_name} 👋</h1>
        <p className="page-subtitle">Gérez vos réservations et vos enfants</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">{reservations.length}</div>
          <div className="stat-label">Total réservations</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{upcoming.length}</div>
          <div className="stat-label">À venir</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{children.length}</div>
          <div className="stat-label">Enfants enregistrés</div>
        </div>
      </div>

      {/* Quick actions */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 28, flexWrap: 'wrap' }}>
        <Link to="/nurseries" className="btn btn-primary">🔍 Trouver une garderie</Link>
        <Link to="/parent/children" className="btn btn-secondary">👶 Gérer mes enfants</Link>
        <Link to="/parent/reservations" className="btn btn-secondary">📅 Voir mes réservations</Link>
      </div>

      {/* Upcoming reservations */}
      <div className="card">
        <div className="card-header">Réservations à venir</div>
        <div className="card-body" style={{ padding: 0 }}>
          {upcoming.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">📅</div>
              <p>Aucune réservation à venir.</p>
              <Link to="/nurseries" className="btn btn-primary" style={{ marginTop: 12 }}>Réserver maintenant</Link>
            </div>
          ) : (
            <div className="table-wrapper">
              <table className="table">
                <thead>
                  <tr>
                    <th>Garderie</th>
                    <th>Enfant</th>
                    <th>Date</th>
                    <th>Horaire</th>
                    <th>Prix</th>
                    <th>Statut</th>
                  </tr>
                </thead>
                <tbody>
                  {upcoming.map((r) => (
                    <tr key={r.id}>
                      <td><strong>{r.nursery?.name}</strong></td>
                      <td>{r.child?.name}</td>
                      <td>{new Date(r.reservation_date).toLocaleDateString('fr-FR')}</td>
                      <td>{r.start_time} – {r.end_time}</td>
                      <td>{r.total_price} MAD</td>
                      <td><StatusBadge status={r.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
