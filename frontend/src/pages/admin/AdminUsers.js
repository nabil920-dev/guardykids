import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import Spinner from '../../components/Spinner';

const roleLabel = { parent: 'Parent', nursery_owner: 'Propriétaire', admin: 'Admin' };
const roleColor = { parent: '#3182ce', nursery_owner: '#2e8b57', admin: '#e53e3e' };

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState('');
  const [search, setSearch] = useState('');

  const fetch = () => {
    api.get('/admin/users').then((res) => { setUsers(res.data); setLoading(false); });
  };

  useEffect(fetch, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer cet utilisateur ?')) return;
    await api.delete(`/admin/users/${id}`);
    setSuccess('Utilisateur supprimé.');
    fetch();
  };

  const filtered = users.filter((u) =>
    !search ||
    u.first_name.toLowerCase().includes(search.toLowerCase()) ||
    u.last_name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <Spinner />;

  return (
    <div>
      <div className="flex-between page-header">
        <div>
          <h1 className="page-title">Utilisateurs</h1>
          <p className="page-subtitle">{users.length} utilisateur(s)</p>
        </div>
      </div>

      {success && <div className="alert alert-success">✅ {success}</div>}

      <div style={{ marginBottom: 16 }}>
        <input type="text" className="form-control" placeholder="🔍 Rechercher par nom ou email..."
          value={search} onChange={(e) => setSearch(e.target.value)} style={{ maxWidth: 340 }} />
      </div>

      <div className="card">
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>#</th>
                <th>Nom complet</th>
                <th>Email</th>
                <th>Téléphone</th>
                <th>Rôle</th>
                <th>Inscrit le</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => (
                <tr key={u.id}>
                  <td style={{ color: 'var(--gray-500)', fontSize: 12 }}>{u.id}</td>
                  <td><strong>{u.first_name} {u.last_name}</strong></td>
                  <td>{u.email}</td>
                  <td>{u.phone || '—'}</td>
                  <td>
                    <span style={{
                      background: roleColor[u.role] + '22',
                      color: roleColor[u.role],
                      padding: '2px 10px',
                      borderRadius: 20,
                      fontSize: 12,
                      fontWeight: 600,
                    }}>
                      {roleLabel[u.role]}
                    </span>
                  </td>
                  <td style={{ fontSize: 13 }}>{new Date(u.created_at).toLocaleDateString('fr-FR')}</td>
                  <td>
                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(u.id)}>🗑️ Supprimer</button>
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
