import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import api from '../../api/axios';
import Spinner from '../../components/Spinner';

// Fix default Leaflet icon issue with Webpack/CRA
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

export default function Nurseries() {
  const [nurseries, setNurseries] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState('');
  const [city, setCity] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/nurseries').then((res) => {
      setNurseries(res.data);
      setFiltered(res.data);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    let result = nurseries;
    if (search) {
      const s = search.toLowerCase();
      result = result.filter(
        (n) =>
          n.name.toLowerCase().includes(s) ||
          n.neighborhood.toLowerCase().includes(s) ||
          n.address.toLowerCase().includes(s)
      );
    }
    if (city) result = result.filter((n) => n.city === city);
    setFiltered(result);
  }, [search, city, nurseries]);

  const cities = [...new Set(nurseries.map((n) => n.city))];

  if (loading) return <Spinner />;

  const center = [33.5731, -7.5898]; // Casablanca

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <h1 className="page-title">Trouvez une garderie disponible</h1>
        <p className="page-subtitle">{filtered.length} garderie(s) trouvée(s)</p>
      </div>

      {/* Search bar */}
      <div className="search-bar">
        <input
          type="text"
          className="form-control"
          placeholder="🔍 Nom, quartier ou adresse..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select className="form-control" style={{ maxWidth: 200 }} value={city} onChange={(e) => setCity(e.target.value)}>
          <option value="">Toutes les villes</option>
          {cities.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {/* Map + List layout */}
      <div className="nurseries-layout">
        {/* Map */}
        <div>
          <MapContainer center={center} zoom={11} className="map-container">
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {filtered.filter((n) => n.latitude && n.longitude).map((n) => (
              <Marker key={n.id} position={[n.latitude, n.longitude]}>
                <Popup>
                  <strong>{n.name}</strong><br />
                  {n.address}<br />
                  <strong>{n.hourly_price} MAD/h</strong><br />
                  <Link to={`/nurseries/${n.id}`} style={{ color: 'var(--green)' }}>Voir détails →</Link>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>

        {/* List */}
        <div>
          {filtered.length === 0 && (
            <div className="empty-state">
              <div className="empty-state-icon">🔍</div>
              <p>Aucune garderie trouvée.</p>
            </div>
          )}
          <div className="nursery-grid" style={{ gridTemplateColumns: '1fr' }}>
            {filtered.map((n) => (
              <div key={n.id} className="nursery-card">
                <div className="nursery-card-img">
                  {n.image_url
                    ? <img src={n.image_url} alt={n.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : '🏠'
                  }
                </div>
                <div className="nursery-card-body">
                  <div className="nursery-card-name">{n.name}</div>
                  <div className="nursery-card-meta">📍 {n.neighborhood}, {n.city}</div>
                  <div className="nursery-card-meta">🕐 {n.opening_time} - {n.closing_time}</div>
                  <div className="nursery-card-meta">👶 Capacité : {n.capacity} enfants</div>
                  <div className="nursery-card-price">{n.hourly_price} MAD / heure</div>
                </div>
                <div className="nursery-card-footer">
                  <Link to={`/nurseries/${n.id}`} className="btn btn-primary btn-sm">Voir & Réserver</Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
