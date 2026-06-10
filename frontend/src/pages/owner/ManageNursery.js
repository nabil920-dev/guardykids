import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import Spinner from '../../components/Spinner';

const emptyForm = {
  name: '', description: '', address: '', city: '', neighborhood: '',
  latitude: '', longitude: '', capacity: '', hourly_price: '',
  opening_time: '08:00', closing_time: '18:00',
};

export default function ManageNursery() {
  const [nursery, setNursery] = useState(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [imageFile, setImageFile] = useState(null);

  useEffect(() => {
    api.get('/my-nurseries').then((res) => {
      if (res.data.length > 0) {
        const n = res.data[0];
        setNursery(n);
        setForm({
          name: n.name || '',
          description: n.description || '',
          address: n.address || '',
          city: n.city || '',
          neighborhood: n.neighborhood || '',
          latitude: n.latitude || '',
          longitude: n.longitude || '',
          capacity: n.capacity || '',
          hourly_price: n.hourly_price || '',
          opening_time: n.opening_time || '08:00',
          closing_time: n.closing_time || '18:00',
        });
      }
      setLoading(false);
    });
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setSubmitting(true);
    try {
      const data = new FormData();
      Object.entries(form).forEach(([k, v]) => { if (v !== '') data.append(k, v); });
      if (imageFile) data.append('image', imageFile);

      if (nursery) {
        data.append('_method', 'PUT');
        const res = await api.post(`/nurseries/${nursery.id}`, data, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        setNursery(res.data);
        setSuccess('Garderie mise à jour avec succès.');
      } else {
        const res = await api.post('/nurseries', data, { headers: { 'Content-Type': 'multipart/form-data' } });
        setNursery(res.data);
        setSuccess('Garderie créée avec succès.');
      }
      // Reset the file input state so the freshly-saved image_url is what shows.
      setImageFile(null);
    } catch (err) {
      if (err.response?.data?.errors) setErrors(err.response.data.errors);
      else setErrors({ general: err.response?.data?.message || 'Une erreur est survenue.' });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Spinner />;

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">{nursery ? 'Modifier ma garderie' : 'Créer ma garderie'}</h1>
        <p className="page-subtitle">Renseignez les informations de votre établissement</p>
      </div>

      {success && <div className="alert alert-success">✅ {success}</div>}

      <div className="card">
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            {errors.general && <div className="alert alert-error">⚠️ {errors.general}</div>}

            <div className="form-group">
              <label className="form-label">Nom de la garderie *</label>
              <input type="text" name="name" className="form-control" value={form.name} onChange={handleChange} required />
              {errors.name && <p className="form-error">{errors.name[0]}</p>}
            </div>

            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea name="description" className="form-control" value={form.description} onChange={handleChange} placeholder="Décrivez votre garderie..." />
            </div>

            <div className="form-group">
              <label className="form-label">Adresse *</label>
              <input type="text" name="address" className="form-control" value={form.address} onChange={handleChange} required />
              {errors.address && <p className="form-error">{errors.address[0]}</p>}
            </div>

            <div className="form-row form-row-2">
              <div className="form-group">
                <label className="form-label">Ville *</label>
                <input type="text" name="city" className="form-control" value={form.city} onChange={handleChange} required />
                {errors.city && <p className="form-error">{errors.city[0]}</p>}
              </div>
              <div className="form-group">
                <label className="form-label">Quartier *</label>
                <input type="text" name="neighborhood" className="form-control" value={form.neighborhood} onChange={handleChange} required />
                {errors.neighborhood && <p className="form-error">{errors.neighborhood[0]}</p>}
              </div>
            </div>

            <div className="form-row form-row-2">
              <div className="form-group">
                <label className="form-label">Latitude (GPS)</label>
                <input type="number" step="any" name="latitude" className="form-control" value={form.latitude} onChange={handleChange} placeholder="33.5731" />
              </div>
              <div className="form-group">
                <label className="form-label">Longitude (GPS)</label>
                <input type="number" step="any" name="longitude" className="form-control" value={form.longitude} onChange={handleChange} placeholder="-7.5898" />
              </div>
            </div>

            <div className="form-row form-row-2">
              <div className="form-group">
                <label className="form-label">Capacité (enfants) *</label>
                <input type="number" name="capacity" className="form-control" value={form.capacity} onChange={handleChange} min={1} required />
                {errors.capacity && <p className="form-error">{errors.capacity[0]}</p>}
              </div>
              <div className="form-group">
                <label className="form-label">Tarif horaire (MAD) *</label>
                <input type="number" step="0.01" name="hourly_price" className="form-control" value={form.hourly_price} onChange={handleChange} min={0} required />
                {errors.hourly_price && <p className="form-error">{errors.hourly_price[0]}</p>}
              </div>
            </div>

            <div className="form-row form-row-2">
              <div className="form-group">
                <label className="form-label">Heure d'ouverture *</label>
                <input type="time" name="opening_time" className="form-control" value={form.opening_time} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label className="form-label">Heure de fermeture *</label>
                <input type="time" name="closing_time" className="form-control" value={form.closing_time} onChange={handleChange} required />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Photo de la garderie</label>
              <input type="file" className="form-control" accept="image/*" onChange={(e) => setImageFile(e.target.files[0])} />
              {nursery?.image_url && (
                <img src={nursery.image_url} alt="" style={{ marginTop: 8, height: 80, borderRadius: 6 }} />
              )}
            </div>

            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Enregistrement...' : nursery ? '💾 Mettre à jour' : '🏠 Créer ma garderie'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
