import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { HiExclamationCircle } from 'react-icons/hi';
import guardyIcon from '../../guardy_icon.svg';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      if (user.role === 'admin') navigate('/admin');
      else if (user.role === 'nursery_owner') navigate('/owner');
      else navigate('/parent');
    } catch (err) {
      setError(err.response?.data?.message || 'Email ou mot de passe incorrect.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <h1><img src={guardyIcon} alt="" style={{ width: 40, height: 40, borderRadius: 10, verticalAlign: 'middle', marginRight: 10 }} />Guardy<span>Kids</span></h1>
          <p>Connexion à votre compte</p>
        </div>

        {error && <div className="alert alert-error"><HiExclamationCircle size={18} /> {error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              type="email"
              name="email"
              className="form-control"
              placeholder="votre@email.com"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Mot de passe</label>
            <input
              type="password"
              name="password"
              className="form-control"
              placeholder="••••••••"
              value={form.password}
              onChange={handleChange}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: 'var(--gray-500)' }}>
          Pas encore de compte ?{' '}
          <Link to="/register" style={{ color: 'var(--green)', fontWeight: 600 }}>S'inscrire</Link>
        </div>

        <div className="divider" />
        <div style={{ fontSize: 12, color: 'var(--gray-500)', textAlign: 'center' }}>
          <strong>Comptes de démonstration :</strong><br />
          Admin: admin@guardykids.ma / admin123<br />
          Parent: parent@guardykids.ma / parent123<br />
          Garderie: owner@guardykids.ma / owner123
        </div>
      </div>
    </div>
  );
}
