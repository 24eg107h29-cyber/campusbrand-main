import { useCallback, useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api, { downloadAssetFile } from '../services/api';
import { useAuth } from '../context/AuthContext';
import AssetPreview, { getAssetType } from '../components/AssetPreview';

const categories = [
  ['All Categories', ''],
  ['Logos', 'LOGO'],
  ['Posters', 'POSTER'],
  ['Templates', 'TEMPLATE'],
  ['Guidelines', 'GUIDELINE'],
  ['Fonts', 'FONT'],
  ['Colors', 'COLOR'],
  ['Other', 'OTHER']
];

const fileTypes = [
  ['All Formats', ''],
  ['Images (PNG, JPG, WebP, SVG)', 'IMAGE'],
  ['PDF Documents', 'PDF']
];

export default function Assets() {
  const { isAdmin } = useAuth();
  const [assets, setAssets] = useState([]);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
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
      setError(requestError.response?.data?.error || 'Unable to load assets from repository.');
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

  const handleClearFilters = () => {
    setSearch('');
    setTypeFilter('');
    setSearchParams(new URLSearchParams());
    loadAssets('');
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

  const handleDelete = async (asset) => {
    if (!window.confirm(`Are you sure you want to delete "${asset.name}"? This action cannot be undone.`)) {
      return;
    }
    try {
      setDeletingId(asset.id);
      await api.delete(`/assets/${asset.id}`);
      setAssets((prev) => prev.filter((a) => a.id !== asset.id));
    } catch (err) {
      setError(err.response?.data?.error || 'Unable to delete asset.');
    } finally {
      setDeletingId(null);
    }
  };

  // Filter client-side by type if requested
  const filteredAssets = assets.filter((asset) => {
    if (!typeFilter) return true;
    const kind = getAssetType(asset);
    if (typeFilter === 'IMAGE') return kind === 'image' || kind === 'svg';
    if (typeFilter === 'PDF') return kind === 'pdf';
    return true;
  });

  const hasActiveFilters = Boolean(search || selectedCategory || typeFilter);

  return (
    <div className="page-container">
      {/* Header section with Eyebrow, Heading, Description, and Upload CTA */}
      <header className="page-header-block">
        <div>
          <span className="eyebrow-tag">RESOURCE LIBRARY</span>
          <h1 className="page-heading">All Assets</h1>
          <p className="page-subheading">
            Official college design resources, brand marks, and production guidelines.
          </p>
        </div>
        {isAdmin && (
          <div className="page-header-actions">
            <Link to="/admin/assets/upload" className="button-link primary-cta">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              <span>Upload Asset</span>
            </Link>
          </div>
        )}
      </header>

      {/* Filter and Search Bar */}
      <section className="filter-toolbar">
        <form onSubmit={submitSearch} className="search-input-wrapper">
          <svg className="search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            className="filter-search-input"
            aria-label="Search assets by name"
            placeholder="Search assets by name or keyword..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button
              type="button"
              className="clear-search-btn"
              onClick={() => {
                setSearch('');
                loadAssets('');
              }}
              title="Clear search"
            >
              ×
            </button>
          )}
        </form>

        <div className="filter-selects-wrapper">
          <div className="custom-select-box">
            <select
              aria-label="Filter by category"
              value={selectedCategory}
              onChange={(e) => handleCategoryChange(e.target.value)}
            >
              {categories.map(([label, value]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>

          <div className="custom-select-box">
            <select
              aria-label="Filter by file type"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              {fileTypes.map(([label, value]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>

          {hasActiveFilters && (
            <button
              type="button"
              className="clear-filters-btn"
              onClick={handleClearFilters}
            >
              Reset
            </button>
          )}
        </div>
      </section>

      {error && (
        <div className="alert-banner alert-error" role="alert">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <span>{error}</span>
        </div>
      )}

      {/* Asset Grid */}
      {loading ? (
        <div className="loading-grid-skeleton">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} className="skeleton-card">
              <div className="skeleton-box skeleton-preview" />
              <div className="skeleton-box skeleton-title" />
              <div className="skeleton-box skeleton-line" />
            </div>
          ))}
        </div>
      ) : filteredAssets.length === 0 ? (
        <div className="empty-state-panel">
          <div className="empty-icon-circle">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <polyline points="21 15 16 10 5 21" />
            </svg>
          </div>
          <h3>No assets found</h3>
          <p>We couldn't find any resources matching your search or filters.</p>
          {hasActiveFilters ? (
            <button type="button" className="button-link secondary-btn" onClick={handleClearFilters}>
              Clear active filters
            </button>
          ) : isAdmin ? (
            <Link to="/admin/assets/upload" className="button-link primary-cta" style={{ marginTop: '8px' }}>
              Upload your first asset
            </Link>
          ) : null}
        </div>
      ) : (
        <div className="modern-asset-grid">
          {filteredAssets.map((asset) => (
            <article className="modern-asset-card" key={asset.id}>
              {/* Reusable Asset Preview Area */}
              <div className="card-preview-wrapper">
                <AssetPreview asset={asset} variant="card" />
                <span className={`category-pill pill-${(asset.category || 'other').toLowerCase()}`}>
                  {asset.category}
                </span>
              </div>

              {/* Card Meta Body */}
              <div className="card-content-body">
                <h2 className="card-asset-title" title={asset.name}>
                  <Link to={`/assets/${asset.id}`}>{asset.name}</Link>
                </h2>
                <p className="card-asset-desc" title={asset.description || ''}>
                  {asset.description || 'Official college branding resource.'}
                </p>

                <div className="card-asset-metadata">
                  <span className="metadata-item">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12 6 12 12 16 14" />
                    </svg>
                    {new Date(asset.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                  <span className="metadata-item metadata-uploader" title={`Uploaded by ${asset.uploadedBy}`}>
                    by {asset.uploadedBy?.split('@')[0] || asset.uploadedBy}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="card-footer-actions">
                <Link to={`/assets/${asset.id}`} className="card-action-btn action-view">
                  View
                </Link>

                <button
                  type="button"
                  className="card-action-btn action-download"
                  onClick={() => handleDownload(asset)}
                  disabled={downloadingId === asset.id}
                  title={`Download ${asset.fileName}`}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                  <span>{downloadingId === asset.id ? 'Saving...' : 'Download'}</span>
                </button>

                {isAdmin && (
                  <button
                    type="button"
                    className="card-action-btn action-delete"
                    onClick={() => handleDelete(asset)}
                    disabled={deletingId === asset.id}
                    title="Delete asset (Admin)"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    </svg>
                  </button>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
