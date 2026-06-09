import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import StatusBadge from '../../components/StatusBadge';
import Spinner from '../../components/Spinner';

export default function OwnerReservations() {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState('');
  const [tab, setTab] = useState('all');

  const fetch = () => {
    api.get('/reservations').then((res) => { setReservations(res.data); setLoading(false); });
  };

  useEffect(fetch, []);

  const handleStatus = async (id, status) => {
    await api.put(`/reservations/${id}`, { status });
    setSuccess(`Réservation ${status === 'confirmed' ? 'confirmée' : 'refusée'}.`);
    fetch();
  };

  const tabs = [
    { key: 'all', label: 'Toutes' },
    { key: 'pending', label: 'En attente' },
    { key: 'confirmed', label: 'Confirmées' },
    { key: 'rejected', label: 'Refusées' },
  ];

  const filtered = tab === 'all' ? reservations : reservations.filter((r) => r.status === tab);

  if (loading) return <Spinner />;

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Réservations reçues</h1>
        <p className="page-subtitle">{reservations.length} réservation(s) au total</p>
      </div>

      {success && <div className="alert alert-success">✅ {success}</div>}

      <div className="tabs">
        {tabs.map((t) => (
          <button key={t.key} className={`tab-btn ${tab === t.key ? 'active' : ''}`} onClick={() => setTab(t.key)}>
            {t.label}{t.key === 'pending' && reservations.filter(r => r.status === 'pending').length > 0
              ? ` (${reservations.filter(r => r.status === 'pending').length})` : ''}
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
                  <th>Parent</th>
                  <th>Contact</th>
                  <th>Enfant</th>
                  <th>Date</th>
                  <th>Horaire</th>
                  <th>Durée</th>
                  <th>Prix</th>
                  <th>Statut</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => (
                  <tr key={r.id}>
                    <td><strong>{r.parent?.first_name} {r.parent?.last_name}</strong></td>
                    <td style={{ fontSize: 12 }}>{r.parent?.phone || r.parent?.email}</td>
                    <td>{r.child?.name} ({r.child?.age} ans)</td>
                    <td>{new Date(r.reservation_date).toLocaleDateString('fr-FR')}</td>
                    <td>{r.start_time} – {r.end_time}</td>
                    <td>{r.duration_hours}h</td>
                    <td><strong>{r.total_price} MAD</strong></td>
                    <td><StatusBadge status={r.status} /></td>
                    <td>
                      {r.status === 'pending' && (
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button className="btn btn-primary btn-sm" onClick={() => handleStatus(r.id, 'confirmed')}>✅ Confirmer</button>
                          <button className="btn btn-danger btn-sm" onClick={() => handleStatus(r.id, 'rejected')}>❌ Refuser</button>
                        </div>
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
