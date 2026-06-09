import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import guardyIcon from '../guardy_icon.svg';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const isActive = (path) =>
    location.pathname === path || location.pathname.startsWith(path + '/') ? 'nav-link active' : 'nav-link';

  const dashboardPath =
    user?.role === 'admin' ? '/admin' :
    user?.role === 'nursery_owner' ? '/owner' :
    '/parent';

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="navbar-logo">
          <img src={guardyIcon} alt="GuardyKids" style={{ width: 36, height: 36, borderRadius: 8 }} />
          Guardy<span>Kids</span>
        </Link>

        <div className="navbar-links">
          <Link to="/" className={isActive('/')}>Accueil</Link>
          <Link to="/nurseries" className={isActive('/nurseries')}>Garderies</Link>

          {!user && (
            <>
              <Link to="/login" className={isActive('/login')}>Connexion</Link>
              <Link to="/register" className="btn btn-primary btn-sm">S'inscrire</Link>
            </>
          )}

          {user && (
            <>
              <span className="nav-user">
                {user.first_name} ({user.role === 'nursery_owner' ? 'Garderie' : user.role === 'admin' ? 'Admin' : 'Parent'})
              </span>
              <Link to={dashboardPath} className={isActive(dashboardPath)}>Tableau de bord</Link>
              <button className="btn btn-secondary btn-sm" onClick={handleLogout}>Déconnexion</button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
