import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import Spinner from '../../components/Spinner';

export default function AdminNurseries() {
  const [nurseries, setNurseries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [search, setSearch] = useState('');

  const fetch = () => {
    api.get('/admin/nurseries').then((res) => { setNurseries(res.data); setLoading(false); });
  };

  useEffect(fetch, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer cette garderie ?')) return;
    await api.delete(`/admin/nurseries/${id}`);
    setSuccess('Garderie supprimée.');
    fetch();
  };

  const openEdit = (n) => {
    setEditingId(n.id);
    setEditForm({ name: n.name, hourly_price: n.hourly_price, capacity: n.capacity, city: n.city, neighborhood: n.neighborhood });
  };

  const saveEdit = async () => {
    await api.put(`/admin/nurseries/${editingId}`, editForm);
    setSuccess('Garderie mise à jour.');
    setEditingId(null);
    fetch();
  };

  const filtered = nurseries.filter((n) =>
    !search || n.name.toLowerCase().includes(search.toLowerCase()) || n.city.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <Spinner />;

  return (
    <div>
      <div className="flex-between page-header">
        <div>
          <h1 className="page-title">Garderies</h1>
          <p className="page-subtitle">{nurseries.length} garderie(s) enregistrée(s)</p>
        </div>
      </div>

      {success && <div className="alert alert-success">✅ {success}</div>}

      <div style={{ marginBottom: 16 }}>
        <input type="text" className="form-control" placeholder="🔍 Rechercher par nom ou ville..."
          value={search} onChange={(e) => setSearch(e.target.value)} style={{ maxWidth: 340 }} />
      </div>

      <div className="card">
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>#</th>
                <th>Nom</th>
                <th>Ville / Quartier</th>
                <th>Capacité</th>
                <th>Tarif/h</th>
                <th>Propriétaire</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((n) => (
                <tr key={n.id}>
                  <td style={{ fontSize: 12, color: 'var(--gray-500)' }}>{n.id}</td>
                  <td>
                    {editingId === n.id ? (
                      <input className="form-control" value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} style={{ width: 160 }} />
                    ) : <strong>{n.name}</strong>}
                  </td>
                  <td>
                    {editingId === n.id ? (
                      <div style={{ display: 'flex', gap: 4 }}>
                        <input className="form-control" value={editForm.city} onChange={(e) => setEditForm({ ...editForm, city: e.target.value })} style={{ width: 90 }} />
                        <input className="form-control" value={editForm.neighborhood} onChange={(e) => setEditForm({ ...editForm, neighborhood: e.target.value })} style={{ width: 100 }} />
                      </div>
                    ) : `${n.city} / ${n.neighborhood}`}
                  </td>
                  <td>
                    {editingId === n.id ? (
                      <input type="number" className="form-control" value={editForm.capacity} onChange={(e) => setEditForm({ ...editForm, capacity: e.target.value })} style={{ width: 70 }} />
                    ) : n.capacity}
                  </td>
                  <td>
                    {editingId === n.id ? (
                      <input type="number" step="0.01" className="form-control" value={editForm.hourly_price} onChange={(e) => setEditForm({ ...editForm, hourly_price: e.target.value })} style={{ width: 80 }} />
                    ) : `${n.hourly_price} MAD`}
                  </td>
                  <td style={{ fontSize: 13 }}>{n.owner?.first_name} {n.owner?.last_name}</td>
                  <td>
                    {editingId === n.id ? (
                      <div style={{ display: 'flex', gap: 4 }}>
                        <button className="btn btn-primary btn-sm" onClick={saveEdit}>💾</button>
                        <button className="btn btn-secondary btn-sm" onClick={() => setEditingId(null)}>✕</button>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', gap: 4 }}>
                        <button className="btn btn-secondary btn-sm" onClick={() => openEdit(n)}>✏️</button>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(n.id)}>🗑️</button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
