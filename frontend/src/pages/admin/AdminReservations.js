import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import StatusBadge from '../../components/StatusBadge';
import Spinner from '../../components/Spinner';

export default function AdminReservations() {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('all');

  useEffect(() => {
    api.get('/admin/reservations').then((res) => { setReservations(res.data); setLoading(false); });
  }, []);

  const tabs = [
    { key: 'all', label: 'Toutes' },
    { key: 'pending', label: 'En attente' },
    { key: 'confirmed', label: 'Confirmées' },
    { key: 'rejected', label: 'Refusées' },
    { key: 'cancelled', label: 'Annulées' },
  ];

  const filtered = tab === 'all' ? reservations : reservations.filter((r) => r.status === tab);

  if (loading) return <Spinner />;

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Toutes les réservations</h1>
        <p className="page-subtitle">{reservations.length} réservation(s)</p>
      </div>

      <div className="tabs">
        {tabs.map((t) => (
          <button key={t.key} className={`tab-btn ${tab === t.key ? 'active' : ''}`} onClick={() => setTab(t.key)}>
            {t.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state"><div className="empty-state-icon">📅</div><p>Aucune réservation.</p></div>
      ) : (
        <div className="card">
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>Réf.</th>
                  <th>Garderie</th>
                  <th>Parent</th>
                  <th>Enfant</th>
                  <th>Date</th>
                  <th>Horaire</th>
                  <th>Prix</th>
                  <th>Statut</th>
                  <th>Paiement</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => (
                  <tr key={r.id}>
                    <td style={{ fontSize: 11, color: 'var(--gray-500)' }}>{r.payment_reference}</td>
                    <td><strong>{r.nursery?.name}</strong></td>
                    <td>{r.parent?.first_name} {r.parent?.last_name}</td>
                    <td>{r.child?.name}</td>
                    <td>{new Date(r.reservation_date).toLocaleDateString('fr-FR')}</td>
                    <td>{r.start_time} – {r.end_time}</td>
                    <td><strong>{r.total_price} MAD</strong></td>
                    <td><StatusBadge status={r.status} /></td>
                    <td><StatusBadge status={r.payment_status} /></td>
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
