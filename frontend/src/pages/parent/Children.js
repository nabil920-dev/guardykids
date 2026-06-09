import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import Spinner from '../../components/Spinner';

export default function Children() {
  const [children, setChildren] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', age: '', notes: '' });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState('');

  const fetch = () => {
    api.get('/children').then((res) => { setChildren(res.data); setLoading(false); });
  };

  useEffect(fetch, []);

  const openAdd = () => { setEditing(null); setForm({ name: '', age: '', notes: '' }); setErrors({}); setShowModal(true); };
  const openEdit = (c) => { setEditing(c); setForm({ name: c.name, age: c.age, notes: c.notes || '' }); setErrors({}); setShowModal(true); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setSubmitting(true);
    try {
      if (editing) {
        await api.put(`/children/${editing.id}`, form);
        setSuccess('Enfant modifié avec succès.');
      } else {
        await api.post('/children', form);
        setSuccess('Enfant ajouté avec succès.');
      }
      setShowModal(false);
      fetch();
    } catch (err) {
      if (err.response?.data?.errors) setErrors(err.response.data.errors);
      else setErrors({ general: 'Une erreur est survenue.' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer cet enfant ?')) return;
    await api.delete(`/children/${id}`);
    setSuccess('Enfant supprimé.');
    fetch();
  };

  if (loading) return <Spinner />;

  return (
    <div>
      <div className="flex-between page-header">
        <div>
          <h1 className="page-title">Mes enfants</h1>
          <p className="page-subtitle">{children.length} enfant(s) enregistré(s)</p>
        </div>
        <button className="btn btn-primary" onClick={openAdd}>+ Ajouter un enfant</button>
      </div>

      {success && <div className="alert alert-success">✅ {success}</div>}

      {children.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">👶</div>
          <p>Aucun enfant enregistré. Ajoutez votre premier enfant pour réserver.</p>
          <button className="btn btn-primary" style={{ marginTop: 12 }} onClick={openAdd}>Ajouter un enfant</button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
          {children.map((c) => (
            <div key={c.id} className="card">
              <div className="card-body">
                <div style={{ fontSize: 40, textAlign: 'center', marginBottom: 8 }}>👶</div>
                <div style={{ fontWeight: 700, fontSize: '1.1rem', textAlign: 'center' }}>{c.name}</div>
                <div style={{ color: 'var(--gray-500)', fontSize: 13, textAlign: 'center', marginBottom: 12 }}>{c.age} ans</div>
                {c.notes && <p style={{ fontSize: 13, color: 'var(--gray-600)', marginBottom: 12 }}>{c.notes}</p>}
                <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
                  <button className="btn btn-secondary btn-sm" onClick={() => openEdit(c)}>✏️ Modifier</button>
                  <button className="btn btn-danger btn-sm" onClick={() => handleDelete(c.id)}>🗑️ Supprimer</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              {editing ? '✏️ Modifier l\'enfant' : '👶 Ajouter un enfant'}
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                {errors.general && <div className="alert alert-error">{errors.general}</div>}
                <div className="form-group">
                  <label className="form-label">Prénom de l'enfant</label>
                  <input type="text" className="form-control" value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                  {errors.name && <p className="form-error">{errors.name[0]}</p>}
                </div>
                <div className="form-group">
                  <label className="form-label">Âge (0–12 ans)</label>
                  <input type="number" className="form-control" value={form.age} min={0} max={12}
                    onChange={(e) => setForm({ ...form, age: e.target.value })} required />
                  {errors.age && <p className="form-error">{errors.age[0]}</p>}
                </div>
                <div className="form-group">
                  <label className="form-label">Notes / Informations médicales (optionnel)</label>
                  <textarea className="form-control" value={form.notes}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                    placeholder="Allergies, informations particulières..." />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Annuler</button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Enregistrement...' : editing ? 'Modifier' : 'Ajouter'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
