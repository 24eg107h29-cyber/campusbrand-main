import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api, { downloadAssetFile } from '../services/api';
import AssetPreview, { getAssetExtension } from '../components/AssetPreview';

export default function AdminDashboard() {
  const [assets, setAssets] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState(null);

  const loadAssets = async () => {
    setLoading(true);
    try {
      const response = await api.get('/assets');
      setAssets(response.data);
      setError('');
    } catch (err) {
      setError(err.response?.data?.error || 'Unable to load asset inventory.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAssets();
  }, []);

  const handleDelete = async (assetId, assetName) => {
    if (!window.confirm(`Are you sure you want to permanently delete "${assetName}"?`)) {
      return;
    }
    setDeletingId(assetId);
    try {
      await api.delete(`/assets/${assetId}`);
      setAssets((prev) => prev.filter((a) => a.id !== assetId));
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete asset.');
    } finally {
      setDeletingId(null);
    }
  };

  const handleDownload = async (asset) => {
    try {
      await downloadAssetFile(asset.downloadUrl, asset.fileName);
    } catch (err) {
      setError(err.response?.data?.error || 'Download failed.');
    }
  };

  // Compute real metrics from loaded assets only
  const totalAssets = assets.length;
  const uniqueCategories = new Set(assets.map((a) => a.category)).size;
  const recentWeekUploads = assets.filter((a) => {
    const assetDate = new Date(a.createdAt);
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    return assetDate >= oneWeekAgo;
  }).length;

  const filteredAssets = assets.filter((a) =>
    a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.fileName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="page-container">
      <header className="page-header-block">
        <div>
          <span className="eyebrow-tag">ADMINISTRATION</span>
          <h1 className="page-heading">Admin Dashboard</h1>
          <p className="page-subheading">
            Manage college branding assets, view library statistics, and oversee content permissions.
          </p>
        </div>
        <div className="page-header-actions">
          <Link to="/admin/assets/upload" className="button-link primary-cta">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            <span>Upload New Asset</span>
          </Link>
        </div>
      </header>

      {error && (
        <div className="alert-banner alert-error" style={{ marginBottom: '20px' }}>
          <span>{error}</span>
        </div>
      )}

      {/* Real Statistics Calculated from Actual Database Records */}
      <section className="admin-stats-grid">
        <div className="admin-stat-card">
          <div className="stat-card-top">
            <span className="stat-card-title">TOTAL ASSETS</span>
            <span className="stat-icon-badge">▦</span>
          </div>
          <div className="stat-number">{loading ? '...' : totalAssets}</div>
          <p className="stat-caption">Published brand resources</p>
        </div>

        <div className="admin-stat-card">
          <div className="stat-card-top">
            <span className="stat-card-title">ACTIVE CATEGORIES</span>
            <span className="stat-icon-badge">◈</span>
          </div>
          <div className="stat-number">{loading ? '...' : uniqueCategories}</div>
          <p className="stat-caption">Distinct resource types represented</p>
        </div>

        <div className="admin-stat-card">
          <div className="stat-card-top">
            <span className="stat-card-title">RECENT (7 DAYS)</span>
            <span className="stat-icon-badge">✦</span>
          </div>
          <div className="stat-number">{loading ? '...' : recentWeekUploads}</div>
          <p className="stat-caption">Assets added in the last week</p>
        </div>

        <div className="admin-stat-card">
          <div className="stat-card-top">
            <span className="stat-card-title">SECURITY ACCESS</span>
            <span className="stat-icon-badge">🛡</span>
          </div>
          <div className="stat-number" style={{ fontSize: '1.4rem' }}>ROLE: ADMIN</div>
          <p className="stat-caption">Full management & deletion privileges</p>
        </div>
      </section>

      {/* Asset Inventory Table */}
      <section className="admin-table-container">
        <div className="table-header-bar">
          <div>
            <h2 className="table-heading-title">Asset Inventory</h2>
            <p className="table-heading-desc">List of all resources stored in the system</p>
          </div>

          <div className="table-filter-box">
            <input
              type="text"
              className="table-search-input"
              placeholder="Filter by name or category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div className="loading-state-panel">
            <p>Loading asset inventory records...</p>
          </div>
        ) : filteredAssets.length === 0 ? (
          <div className="empty-state-panel">
            <p>No asset records match your criteria.</p>
          </div>
        ) : (
          <div className="table-responsive-wrapper">
            <table className="modern-data-table">
              <thead>
                <tr>
                  <th>Preview</th>
                  <th>Asset Name</th>
                  <th>Category</th>
                  <th>Format</th>
                  <th>Uploaded By</th>
                  <th>Date Added</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAssets.map((asset) => (
                  <tr key={asset.id}>
                    <td style={{ width: '64px' }}>
                      <div className="table-thumb-box">
                        <AssetPreview asset={asset} variant="thumb" />
                      </div>
                    </td>
                    <td>
                      <Link to={`/assets/${asset.id}`} className="table-asset-link">
                        {asset.name}
                      </Link>
                    </td>
                    <td>
                      <span className={`category-pill pill-${asset.category.toLowerCase()}`}>
                        {asset.category}
                      </span>
                    </td>
                    <td>
                      <span className="file-format-badge">{getAssetExtension(asset)}</span>
                    </td>
                    <td className="table-text-muted">
                      {asset.uploadedBy}
                    </td>
                    <td className="table-text-muted">
                      {new Date(asset.createdAt).toLocaleDateString()}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div className="table-actions-group">
                        <Link
                          to={`/assets/${asset.id}`}
                          className="table-btn btn-details"
                          title="View and edit"
                        >
                          View / Edit
                        </Link>
                        <button
                          type="button"
                          className="table-btn btn-download"
                          onClick={() => handleDownload(asset)}
                          title="Download file"
                        >
                          Download
                        </button>
                        <button
                          type="button"
                          className="table-btn btn-delete"
                          disabled={deletingId === asset.id}
                          onClick={() => handleDelete(asset.id, asset.name)}
                          title="Delete asset"
                        >
                          {deletingId === asset.id ? 'Deleting...' : 'Delete'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
