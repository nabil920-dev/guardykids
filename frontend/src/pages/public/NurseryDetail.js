import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import Spinner from '../../components/Spinner';

export default function NurseryDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [nursery, setNursery] = useState(null);
  const [children, setChildren] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ child_id: '', reservation_date: '', start_time: '', end_time: '' });
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api.get(`/nurseries/${id}`).then((res) => {
      setNursery(res.data);
      setLoading(false);
    });
    if (user?.role === 'parent') {
      api.get('/children').then((res) => setChildren(res.data));
    }
  }, [id, user]);

  const calcPrice = () => {
    if (!form.start_time || !form.end_time || !nursery) return 0;
    const [sh, sm] = form.start_time.split(':').map(Number);
    const [eh, em] = form.end_time.split(':').map(Number);
    const duration = (eh * 60 + em - (sh * 60 + sm)) / 60;
    if (duration <= 0) return 0;
    return (duration * nursery.hourly_price).toFixed(2);
  };

  const handleReserve = async (e) => {
    e.preventDefault();
    if (!user) { navigate('/login'); return; }
    setErrors({});
    setSubmitting(true);
    try {
      await api.post('/reservations', { ...form, nursery_id: nursery.id });
      setSuccess('Réservation effectuée avec succès ! Paiement simulé confirmé. ✅');
      setShowModal(false);
      setForm({ child_id: '', reservation_date: '', start_time: '', end_time: '' });
    } catch (err) {
      if (err.response?.data?.errors) setErrors(err.response.data.errors);
      else setErrors({ general: err.response?.data?.message || 'Erreur lors de la réservation.' });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Spinner />;
  if (!nursery) return <div className="page-wrapper"><p>Garderie introuvable.</p></div>;

  const price = calcPrice();

  return (
    <div className="page-wrapper">
      {success && <div className="alert alert-success">{success}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 24 }}>
        {/* Left */}
        <div>
          <div className="card" style={{ marginBottom: 20 }}>
            <div style={{ height: 260, background: 'var(--green-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 80 }}>
              {nursery.image_url
                ? <img src={nursery.image_url} alt={nursery.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : '🏠'}
            </div>
            <div className="card-body">
              <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 8 }}>{nursery.name}</h1>
              <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 12 }}>
                <span style={{ color: 'var(--gray-500)', fontSize: 14 }}>📍 {nursery.address}, {nursery.neighborhood}, {nursery.city}</span>
                <span style={{ color: 'var(--gray-500)', fontSize: 14 }}>🕐 {nursery.opening_time} – {nursery.closing_time}</span>
                <span style={{ color: 'var(--gray-500)', fontSize: 14 }}>👶 {nursery.capacity} places</span>
              </div>
              <p style={{ color: 'var(--gray-700)', lineHeight: 1.7 }}>{nursery.description || 'Aucune description disponible.'}</p>
            </div>
          </div>

          {/* Map */}
          {nursery.latitude && nursery.longitude && (
            <div className="card">
              <div className="card-header">📍 Localisation</div>
              <MapContainer
                center={[nursery.latitude, nursery.longitude]}
                zoom={15}
                style={{ height: 280 }}
              >
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <Marker position={[nursery.latitude, nursery.longitude]} />
              </MapContainer>
            </div>
          )}
        </div>

        {/* Right — booking card */}
        <div>
          <div className="card" style={{ position: 'sticky', top: 80 }}>
            <div className="card-body">
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--green)', marginBottom: 4 }}>
                {nursery.hourly_price} MAD
              </div>
              <div style={{ color: 'var(--gray-500)', fontSize: 13, marginBottom: 20 }}>par heure</div>

              {user?.role === 'parent' ? (
                <button className="btn btn-primary btn-full" onClick={() => setShowModal(true)}>
                  📅 Réserver un créneau
                </button>
              ) : user ? (
                <div className="alert alert-info">
                  Seuls les parents peuvent effectuer des réservations.
                </div>
              ) : (
                <button className="btn btn-primary btn-full" onClick={() => navigate('/login')}>
                  Se connecter pour réserver
                </button>
              )}

              <div className="divider" />
              <div style={{ fontSize: 13, color: 'var(--gray-600)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span>Horaires :</span>
                  <span>{nursery.opening_time} – {nursery.closing_time}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span>Capacité :</span>
                  <span>{nursery.capacity} enfants</span>
                </div>
                {nursery.owner && (
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Contact :</span>
                    <span>{nursery.owner.phone || 'N/A'}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Reservation Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              📅 Réserver — {nursery.name}
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleReserve}>
              <div className="modal-body">
                {errors.general && <div className="alert alert-error">{errors.general}</div>}

                <div className="form-group">
                  <label className="form-label">Enfant</label>
                  {children.length === 0 ? (
                    <div className="alert alert-info">
                      Vous n'avez pas encore d'enfant.{' '}
                      <a href="/parent/children" style={{ color: 'var(--green)' }}>Ajouter un enfant →</a>
                    </div>
                  ) : (
                    <select className="form-control" value={form.child_id} onChange={(e) => setForm({ ...form, child_id: e.target.value })} required>
                      <option value="">-- Sélectionner un enfant --</option>
                      {children.map((c) => <option key={c.id} value={c.id}>{c.name} ({c.age} ans)</option>)}
                    </select>
                  )}
                  {errors.child_id && <p className="form-error">{errors.child_id[0]}</p>}
                </div>

                <div className="form-group">
                  <label className="form-label">Date de réservation</label>
                  <input type="date" className="form-control" value={form.reservation_date}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={(e) => setForm({ ...form, reservation_date: e.target.value })} required />
                  {errors.reservation_date && <p className="form-error">{errors.reservation_date[0]}</p>}
                </div>

                <div className="form-row form-row-2">
                  <div className="form-group">
                    <label className="form-label">Heure de début</label>
                    <input type="time" className="form-control" value={form.start_time}
                      min={nursery.opening_time} max={nursery.closing_time}
                      onChange={(e) => setForm({ ...form, start_time: e.target.value })} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Heure de fin</label>
                    <input type="time" className="form-control" value={form.end_time}
                      min={form.start_time || nursery.opening_time} max={nursery.closing_time}
                      onChange={(e) => setForm({ ...form, end_time: e.target.value })} required />
                  </div>
                </div>

                {price > 0 && (
                  <div style={{ background: 'var(--green-light)', padding: '12px 16px', borderRadius: 'var(--radius-sm)', textAlign: 'center' }}>
                    <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--green)' }}>{price} MAD</div>
                    <div style={{ fontSize: 12, color: 'var(--gray-500)' }}>Prix total estimé (paiement simulé)</div>
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Annuler</button>
                <button type="submit" className="btn btn-primary" disabled={submitting || children.length === 0}>
                  {submitting ? 'Réservation...' : '✅ Confirmer la réservation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
