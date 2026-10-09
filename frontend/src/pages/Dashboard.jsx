import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import AssetPreview from '../components/AssetPreview.jsx';

const quickCategories = [
  { id: 'LOGO', title: 'Logos & Crests', desc: 'Identity marks', icon: '◒', color: '#4f46e5' },
  { id: 'POSTER', title: 'Posters & Media', desc: 'Campaign visuals', icon: '▤', color: '#0ea5e9' },
  { id: 'TEMPLATE', title: 'Templates', desc: 'Decks & letterheads', icon: '▧', color: '#10b981' },
  { id: 'GUIDELINE', title: 'Guidelines', desc: 'Brand compliance', icon: '◫', color: '#f59e0b' }
];

export default function Dashboard() {
  const { user, isAdmin } = useAuth();
  const [recentAssets, setRecentAssets] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/assets')
      .then((res) => {
        setTotalCount(res.data.length);
        setRecentAssets(res.data.slice(0, 4));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const firstName = user?.name ? user.name.split(' ')[0] : 'Member';

  return (
    <div className="page-container">
      {/* Modern Hero Greeting */}
      <section className="dashboard-hero-card">
        <div className="hero-card-left">
          <span className="eyebrow-tag">CREATIVE WORKSPACE</span>
          <h1 className="hero-card-title">
            Welcome back, <span className="hero-name-accent">{firstName}</span>.
          </h1>
          <p className="hero-card-subtitle">
            Access official university logos, posters, guidelines, and templates to keep our collegiate identity consistent and strong.
          </p>

          <div className="hero-card-actions">
            <Link to="/assets" className="button-link primary-cta">
              <span>Browse All Assets</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </Link>

            <Link to="/categories" className="button-link secondary-btn">
              <span>View Categories</span>
            </Link>

            {isAdmin && (
              <Link to="/admin/assets/upload" className="button-link secondary-btn">
                <span>+ Upload New Asset</span>
              </Link>
            )}
          </div>
        </div>

        <div className="hero-card-right">
          <div className="brand-stat-pill">
            <span className="stat-pill-num">{loading ? '...' : totalCount}</span>
            <span className="stat-pill-label">Approved Assets</span>
          </div>
          <div className="brand-crest-box">
            <span className="crest-initials">CB</span>
            <small>EST. 2024</small>
          </div>
        </div>
      </section>

      {/* Explore By Category */}
      <section className="dashboard-section-block">
        <div className="section-title-row">
          <div>
            <span className="eyebrow-tag">EXPLORE DIRECTORY</span>
            <h2 className="section-heading-text">Categories</h2>
          </div>
          <Link to="/categories" className="inline-arrow-link">
            <span>View all categories</span>
            <span>↗</span>
          </Link>
        </div>

        <div className="dashboard-category-grid">
          {quickCategories.map((cat) => (
            <Link
              key={cat.id}
              to={`/assets?category=${cat.id}`}
              className="dash-category-card"
            >
              <div className="dash-cat-icon" style={{ color: cat.color }}>
                {cat.icon}
              </div>
              <h3 className="dash-cat-title">{cat.title}</h3>
              <p className="dash-cat-desc">{cat.desc}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Recently Added Assets */}
      <section className="dashboard-section-block">
        <div className="section-title-row">
          <div>
            <span className="eyebrow-tag">LATEST ADDITIONS</span>
            <h2 className="section-heading-text">Recently Added Resources</h2>
          </div>
          <Link to="/assets" className="inline-arrow-link">
            <span>Explore repository</span>
            <span>↗</span>
          </Link>
        </div>

        {loading ? (
          <div className="loading-grid-skeleton" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="skeleton-card" style={{ height: '240px' }} />
            ))}
          </div>
        ) : recentAssets.length === 0 ? (
          <div className="empty-state-panel">
            <p>No assets uploaded yet in this environment.</p>
            {isAdmin && (
              <Link to="/admin/assets/upload" className="button-link primary-cta" style={{ marginTop: '12px' }}>
                Upload First Asset
              </Link>
            )}
          </div>
        ) : (
          <div className="dashboard-recent-grid">
            {recentAssets.map((asset) => (
              <Link to={`/assets/${asset.id}`} key={asset.id} className="dash-recent-card">
                <div className="dash-recent-preview">
                  <AssetPreview asset={asset} variant="card" />
                </div>
                <div className="dash-recent-info">
                  <span className={`category-pill pill-${asset.category.toLowerCase()}`}>
                    {asset.category}
                  </span>
                  <h4>{asset.name}</h4>
                  <small>{new Date(asset.createdAt).toLocaleDateString()}</small>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
