import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import AssetPreview from '../components/AssetPreview.jsx';

function Dashboard() {
  const { user } = useAuth();
  const [recentAssets, setRecentAssets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/assets')
      .then((res) => {
        setRecentAssets(res.data.slice(0, 4));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="dashboard-page">
      <section className="dashboard-hero">
        <div>
          <p className="eyebrow">Good morning, {user?.name?.split(' ')[0] || 'designer'}</p>
          <h1>Welcome to your<br /><em>creative space.</em></h1>
          <p className="intro">Everything you need to create consistently and keep our campus identity strong.</p>
          <Link className="button-link" to="/assets">Browse all assets <span>→</span></Link>
        </div>
        <div className="dashboard-visual">
          <span>BRAND<br /><strong>GUIDE</strong></span>
          <small>2024 / 2025</small>
          <i>✦</i>
        </div>
      </section>

      {/* Categories Section */}
      <section className="dashboard-section" id="categories">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Explore the library</p>
            <h2>Find what you need</h2>
          </div>
          <Link className="arrow-link" to="/assets">View all <span>↗</span></Link>
        </div>
        <div className="quick-grid">
          <Link to="/assets?category=LOGO" className="quick-card">
            <span>◒</span>
            <strong>Logos</strong>
            <small>Identity marks</small>
          </Link>
          <Link to="/assets?category=POSTER" className="quick-card">
            <span>▤</span>
            <strong>Posters</strong>
            <small>Event materials</small>
          </Link>
          <Link to="/assets?category=TEMPLATE" className="quick-card">
            <span>▧</span>
            <strong>Templates</strong>
            <small>Ready to customize</small>
          </Link>
          <Link to="/assets?category=GUIDELINE" className="quick-card">
            <span>◫</span>
            <strong>Guidelines</strong>
            <small>Stay on brand</small>
          </Link>
        </div>
      </section>

      {/* Recently Added Section so user sees their uploaded assets immediately */}
      {!loading && recentAssets.length > 0 && (
        <section className="dashboard-section" style={{ paddingTop: '0' }}>
          <div className="section-heading">
            <div>
              <p className="eyebrow">Recent uploads</p>
              <h2>Latest assets in library</h2>
            </div>
            <Link className="arrow-link" to="/assets">All assets ({recentAssets.length}) <span>↗</span></Link>
          </div>
          <div className="asset-grid">
            {recentAssets.map((asset) => (
              <article className="asset-card" key={asset.id}>
                <div className="asset-preview">
                  <AssetPreview asset={asset} variant="card" />
                </div>
                <h2>{asset.name}</h2>
                <span className="category-label">{asset.category}</span>
                <p>{asset.description || 'Official campus branding resource.'}</p>
                <small>Added by {asset.uploadedBy} on {new Date(asset.createdAt).toLocaleDateString()}</small>
                <div className="card-actions">
                  <Link to={`/assets/${asset.id}`}>View details</Link>
                  <a
                    href={`${api.defaults.baseURL || ''}/assets/download/${asset.id}`}
                    className="button-link compact-button secondary-button"
                    style={{ padding: '4px 10px', fontSize: '0.78rem' }}
                  >
                    Download
                  </a>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      <section className="dashboard-callout">
        <div>
          <p className="eyebrow">Create with confidence</p>
          <h2>Good design starts<br />with the right <em>foundation.</em></h2>
        </div>
        <Link className="button-link secondary-button" to="/assets">Explore the library <span>→</span></Link>
      </section>
    </main>
  );
}

export default Dashboard;
