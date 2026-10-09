import { useCallback, useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api, { downloadAssetFile } from '../services/api';
import { useAuth } from '../context/AuthContext';
import AssetPreview from '../components/AssetPreview.jsx';

const categories = [
  ['All', ''],
  ['Logos', 'LOGO'],
  ['Posters', 'POSTER'],
  ['Templates', 'TEMPLATE'],
  ['Guidelines', 'GUIDELINE'],
  ['Fonts', 'FONT'],
  ['Colors', 'COLOR'],
  ['Other', 'OTHER']
];

function Assets() {
  const { isAdmin } = useAuth();
  const [assets, setAssets] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState(null);
  const [error, setError] = useState('');
  const [searchParams, setSearchParams] = useSearchParams();

  const selectedCategory = searchParams.get('category') || '';

  const loadAssets = useCallback(async (currentSearch = search) => {
    setLoading(true);
    try {
      const params = {};
      if (selectedCategory) params.category = selectedCategory;
      if (currentSearch.trim()) params.name = currentSearch.trim();

      const hasFilters = Object.keys(params).length > 0;
      const response = hasFilters
        ? await api.get('/assets/search', { params })
        : await api.get('/assets');

      setAssets(response.data);
      setError('');
    } catch (requestError) {
      setError(requestError.response?.data?.error || 'Unable to load assets.');
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, search]);

  useEffect(() => {
    loadAssets();
  }, [selectedCategory]);

  const handleCategoryChange = (newCategory) => {
    const nextParams = new URLSearchParams(searchParams);
    if (newCategory) {
      nextParams.set('category', newCategory);
    } else {
      nextParams.delete('category');
    }
    setSearchParams(nextParams);
  };

  const submitSearch = (event) => {
    event.preventDefault();
    loadAssets(search);
  };

  const handleDownload = async (asset) => {
    try {
      setDownloadingId(asset.id);
      await downloadAssetFile(asset.downloadUrl, asset.fileName);
    } catch (err) {
      setError(err.response?.data?.error || 'Download failed. Please try again.');
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <main className="library-page">
      <header className="page-header">
        <div>
          <p className="eyebrow">The resource library</p>
          <h1>All assets</h1>
          <p className="intro">Official resources to help you create with consistency.</p>
        </div>
        <nav className="page-header-actions">
          {isAdmin && (
            <Link className="button-link" to="/admin/assets/upload">＋ Upload asset</Link>
          )}
        </nav>
      </header>

      <section className="asset-tools">
        <form onSubmit={submitSearch} className="search-form">
          <input
            aria-label="Search assets"
            placeholder="Search by asset name"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          <button type="submit">Search</button>
        </form>
        <select
          aria-label="Filter by category"
          value={selectedCategory}
          onChange={(event) => handleCategoryChange(event.target.value)}
        >
          {categories.map(([label, value]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
      </section>

      {error && <p className="message error-message">{error}</p>}

      {loading ? (
        <div className="empty-state"><strong>Loading assets...</strong></div>
      ) : (
        <section className="asset-grid">
          {assets.map((asset) => (
            <article className="asset-card" key={asset.id}>
              <div className="asset-preview">
                <AssetPreview asset={asset} variant="card" />
              </div>
              <h2>{asset.name}</h2>
              <span className="category-label">{asset.category}</span>
              <p>{asset.description || 'No description provided.'}</p>
              <small>Uploaded by {asset.uploadedBy} on {new Date(asset.createdAt).toLocaleDateString()}</small>
              <div className="card-actions">
                <Link to={`/assets/${asset.id}`}>View</Link>
                <button
                  type="button"
                  className="button-link compact-button"
                  style={{ background: 'transparent', color: '#6572e8', padding: '0', border: 'none', boxShadow: 'none' }}
                  onClick={() => handleDownload(asset)}
                  disabled={downloadingId === asset.id}
                >
                  {downloadingId === asset.id ? 'Downloading...' : 'Download'}
                </button>
              </div>
            </article>
          ))}
        </section>
      )}

      {!loading && !error && assets.length === 0 && (
        <div className="empty-state">
          <strong>No assets found yet.</strong>
          <span>Try another search or check back after new resources are added.</span>
        </div>
      )}
    </main>
  );
}

export default Assets;
