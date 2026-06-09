import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import StatusBadge from '../../components/StatusBadge';
import Spinner from '../../components/Spinner';

export default function OwnerDashboard() {
  const { user } = useAuth();
  const [reservations, setReservations] = useState([]);
  const [nurseries, setNurseries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.get('/reservations'), api.get('/my-nurseries')]).then(([r, n]) => {
      setReservations(r.data);
      setNurseries(n.data);
      setLoading(false);
    });
  }, []);

  if (loading) return <Spinner />;

  const pending = reservations.filter((r) => r.status === 'pending');
  const confirmed = reservations.filter((r) => r.status === 'confirmed');
  const revenue = reservations
    .filter((r) => r.status === 'confirmed' && r.payment_status === 'paid')
    .reduce((sum, r) => sum + r.total_price, 0);

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Bonjour, {user?.first_name} 👋</h1>
        <p className="page-subtitle">Tableau de bord de votre garderie</p>
      </div>

      {nurseries.length === 0 && (
        <div className="alert alert-info">
          Vous n'avez pas encore créé de profil de garderie.{' '}
          <Link to="/owner/nursery" style={{ color: 'var(--green)', fontWeight: 600 }}>Créer ma garderie →</Link>
        </div>
      )}

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">{reservations.length}</div>
          <div className="stat-label">Total réservations</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{pending.length}</div>
          <div className="stat-label">En attente</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{confirmed.length}</div>
          <div className="stat-label">Confirmées</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{revenue.toFixed(0)} MAD</div>
          <div className="stat-label">Chiffre d'affaires</div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">Réservations récentes</div>
        <div className="card-body" style={{ padding: 0 }}>
          {reservations.length === 0 ? (
            <div className="empty-state"><div className="empty-state-icon">📅</div><p>Aucune réservation reçue.</p></div>
          ) : (
            <div className="table-wrapper">
              <table className="table">
                <thead>
                  <tr>
                    <th>Parent</th>
                    <th>Enfant</th>
                    <th>Date</th>
                    <th>Horaire</th>
                    <th>Prix</th>
                    <th>Statut</th>
                  </tr>
                </thead>
                <tbody>
                  {reservations.slice(0, 8).map((r) => (
                    <tr key={r.id}>
                      <td>{r.parent?.first_name} {r.parent?.last_name}</td>
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
