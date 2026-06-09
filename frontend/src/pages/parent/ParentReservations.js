import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import StatusBadge from '../../components/StatusBadge';
import Spinner from '../../components/Spinner';

export default function ParentReservations() {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState('');
  const [tab, setTab] = useState('all');

  const fetch = () => {
    api.get('/reservations').then((res) => { setReservations(res.data); setLoading(false); });
  };

  useEffect(fetch, []);

  const handleCancel = async (id) => {
    if (!window.confirm('Annuler cette réservation ?')) return;
    await api.put(`/reservations/${id}`, { status: 'cancelled' });
    setSuccess('Réservation annulée.');
    fetch();
  };

  const tabs = [
    { key: 'all', label: 'Toutes' },
    { key: 'pending', label: 'En attente' },
    { key: 'confirmed', label: 'Confirmées' },
    { key: 'cancelled', label: 'Annulées' },
  ];

  const filtered = tab === 'all' ? reservations : reservations.filter((r) => r.status === tab);

  if (loading) return <Spinner />;

  return (
    <div>
      <div className="flex-between page-header">
        <div>
          <h1 className="page-title">Mes réservations</h1>
          <p className="page-subtitle">{reservations.length} réservation(s) au total</p>
        </div>
        <Link to="/nurseries" className="btn btn-primary">+ Nouvelle réservation</Link>
      </div>

      {success && <div className="alert alert-success">✅ {success}</div>}

      <div className="tabs">
        {tabs.map((t) => (
          <button key={t.key} className={`tab-btn ${tab === t.key ? 'active' : ''}`} onClick={() => setTab(t.key)}>
            {t.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📅</div>
          <p>Aucune réservation dans cette catégorie.</p>
        </div>
      ) : (
        <div className="card">
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>Référence</th>
                  <th>Garderie</th>
                  <th>Enfant</th>
                  <th>Date</th>
                  <th>Horaire</th>
                  <th>Durée</th>
                  <th>Prix</th>
                  <th>Statut</th>
                  <th>Paiement</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => (
                  <tr key={r.id}>
                    <td style={{ fontSize: 12, color: 'var(--gray-500)' }}>{r.payment_reference}</td>
                    <td><strong>{r.nursery?.name}</strong></td>
                    <td>{r.child?.name}</td>
                    <td>{new Date(r.reservation_date).toLocaleDateString('fr-FR')}</td>
                    <td>{r.start_time} – {r.end_time}</td>
                    <td>{r.duration_hours}h</td>
                    <td><strong>{r.total_price} MAD</strong></td>
                    <td><StatusBadge status={r.status} /></td>
                    <td><StatusBadge status={r.payment_status} /></td>
                    <td>
                      {(r.status === 'pending' || r.status === 'confirmed') && (
                        <button className="btn btn-danger btn-sm" onClick={() => handleCancel(r.id)}>Annuler</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
