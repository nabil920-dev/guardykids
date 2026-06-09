import React from 'react';
import { Link } from 'react-router-dom';
import { HiLocationMarker, HiCalendar, HiShieldCheck, HiUserGroup } from 'react-icons/hi';

export default function Home() {
  return (
    <div>
      {/* Hero */}
      <section className="hero">
        <div className="hero-content">
          <h1>Faites vos courses en toute sérénité</h1>
          <p>
            Réservez une place dans une garderie partenaire agréée, proche de votre centre
            commercial ou de votre quartier à Casablanca.
          </p>
          <div className="hero-actions">
            <Link to="/nurseries" className="btn-hero-primary">Réserver maintenant</Link>
            <Link to="/register" className="btn-hero-secondary">Créer un compte</Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="features">
        <h2>Pourquoi choisir GuardyKids ?</h2>
        <p className="features-subtitle">
          Une solution simple et sécurisée pour la garde de vos enfants
        </p>
        <div className="features-grid">
          <div className="feature-item">
            <div className="feature-icon"><HiLocationMarker color="#2e8b57" /></div>
            <h3>Carte interactive</h3>
            <p>Visualisez toutes les garderies disponibles autour de vous sur une carte OpenStreetMap.</p>
          </div>
          <div className="feature-item">
            <div className="feature-icon"><HiCalendar color="#2e8b57" /></div>
            <h3>Réservation en ligne</h3>
            <p>Choisissez votre créneau horaire et réservez en quelques clics, 24h/24.</p>
          </div>
          <div className="feature-item">
            <div className="feature-icon"><HiShieldCheck color="#2e8b57" /></div>
            <h3>Établissements vérifiés</h3>
            <p>Toutes nos garderies partenaires sont agréées et supervisées par notre équipe.</p>
          </div>
          <div className="feature-item">
            <div className="feature-icon"><HiUserGroup color="#2e8b57" /></div>
            <h3>Espace parent</h3>
            <p>Gérez vos réservations, suivez l'historique et ajoutez vos enfants facilement.</p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{
        background: 'linear-gradient(135deg, #e8f5ee 0%, #d4edda 100%)',
        padding: '88px 20px',
        textAlign: 'center',
        borderTop: '1px solid var(--gray-200)',
      }}>
        <h2 style={{ fontSize: '1.9rem', fontWeight: 800, marginBottom: 14, color: 'var(--gray-900)' }}>
          Vous êtes propriétaire d'une garderie ?
        </h2>
        <p style={{ color: 'var(--gray-500)', maxWidth: 520, margin: '0 auto 32px', fontSize: '1.05rem', lineHeight: 1.75 }}>
          Rejoignez notre réseau de garderies partenaires et gérez vos réservations facilement.
        </p>
        <Link to="/register" className="btn btn-primary" style={{ padding: '13px 36px', borderRadius: 50, fontSize: 15, boxShadow: '0 4px 16px rgba(46,139,87,0.3)' }}>
          Inscrire ma garderie
        </Link>
      </section>
    </div>
  );
}
