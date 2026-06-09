import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { HiExclamationCircle, HiUserGroup, HiOfficeBuilding } from 'react-icons/hi';
import guardyIcon from '../../guardy_icon.svg';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    role: 'parent',
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    password: '',
    password_confirmation: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);
    try {
      const user = await register(form);
      if (user.role === 'nursery_owner') navigate('/owner');
      else navigate('/parent');
    } catch (err) {
      if (err.response?.data?.errors) {
        setErrors(err.response.data.errors);
      } else {
        setErrors({ general: err.response?.data?.message || 'Erreur lors de l\'inscription.' });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <h1><img src={guardyIcon} alt="" style={{ width: 40, height: 40, borderRadius: 10, verticalAlign: 'middle', marginRight: 10 }} />Guardy<span>Kids</span></h1>
          <p>Créer votre compte</p>
        </div>

        {errors.general && <div className="alert alert-error"><HiExclamationCircle size={18} /> {errors.general}</div>}

        {/* Role selector */}
        <div className="auth-tabs" style={{ marginBottom: 20 }}>
          <div
            className={`auth-tab ${form.role === 'parent' ? 'active' : ''}`}
            onClick={() => setForm({ ...form, role: 'parent' })}
          >
            <HiUserGroup size={16} style={{ marginRight: 6, verticalAlign: 'middle' }} />Parent
          </div>
          <div
            className={`auth-tab ${form.role === 'nursery_owner' ? 'active' : ''}`}
            onClick={() => setForm({ ...form, role: 'nursery_owner' })}
          >
            <HiOfficeBuilding size={16} style={{ marginRight: 6, verticalAlign: 'middle' }} />Propriétaire
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-row form-row-2">
            <div className="form-group">
              <label className="form-label">Prénom</label>
              <input type="text" name="first_name" className="form-control" value={form.first_name} onChange={handleChange} required />
              {errors.first_name && <p className="form-error">{errors.first_name[0]}</p>}
            </div>
            <div className="form-group">
              <label className="form-label">Nom</label>
              <input type="text" name="last_name" className="form-control" value={form.last_name} onChange={handleChange} required />
              {errors.last_name && <p className="form-error">{errors.last_name[0]}</p>}
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input type="email" name="email" className="form-control" value={form.email} onChange={handleChange} required />
            {errors.email && <p className="form-error">{errors.email[0]}</p>}
          </div>
          <div className="form-group">
            <label className="form-label">Téléphone (optionnel)</label>
            <input type="tel" name="phone" className="form-control" value={form.phone} onChange={handleChange} />
          </div>
          <div className="form-row form-row-2">
            <div className="form-group">
              <label className="form-label">Mot de passe</label>
              <input type="password" name="password" className="form-control" value={form.password} onChange={handleChange} required minLength={6} />
              {errors.password && <p className="form-error">{errors.password[0]}</p>}
            </div>
            <div className="form-group">
              <label className="form-label">Confirmer</label>
              <input type="password" name="password_confirmation" className="form-control" value={form.password_confirmation} onChange={handleChange} required />
            </div>
          </div>
          <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
            {loading ? 'Inscription...' : 'Créer mon compte'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: 16, fontSize: 13, color: 'var(--gray-500)' }}>
          Déjà un compte ?{' '}
          <Link to="/login" style={{ color: 'var(--green)', fontWeight: 600 }}>Se connecter</Link>
        </div>
      </div>
    </div>
  );
}
