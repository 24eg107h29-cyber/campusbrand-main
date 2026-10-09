import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api, { downloadAssetFile } from '../services/api';

function AdminDashboard() {
  const [assets, setAssets] = useState([]);
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

  // Compute real metrics from loaded assets
  const totalAssets = assets.length;
  const categoryCounts = assets.reduce((acc, curr) => {
    acc[curr.category] = (acc[curr.category] || 0) + 1;
    return acc;
  }, {});

  return (
    <main className="dashboard-page">
      <header className="page-header">
        <div>
          <p className="eyebrow">Administration Panel</p>
          <h1>Admin Dashboard</h1>
          <p className="intro">Manage college branding assets, view library statistics, and oversee content.</p>
        </div>
        <div className="page-header-actions">
          <Link className="button-link" to="/admin/assets/upload">＋ Upload new asset</Link>
        </div>
      </header>

      {error && <p className="message error-message" style={{ marginTop: '20px' }}>{error}</p>}

      {/* Real Statistics Grid */}
      <section className="admin-stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', margin: '28px 0' }}>
        <div className="quick-card" style={{ padding: '20px', borderRadius: '10px' }}>
          <span style={{ fontSize: '1.4rem' }}>▦</span>
          <strong style={{ fontSize: '1.8rem', marginTop: '6px' }}>{loading ? '...' : totalAssets}</strong>
          <small>Total Uploaded Assets</small>
        </div>
        <div className="quick-card" style={{ padding: '20px', borderRadius: '10px' }}>
          <span style={{ fontSize: '1.4rem' }}>◈</span>
          <strong style={{ fontSize: '1.8rem', marginTop: '6px' }}>{loading ? '...' : Object.keys(categoryCounts).length}</strong>
          <small>Active Categories</small>
        </div>
        <div className="quick-card" style={{ padding: '20px', borderRadius: '10px' }}>
          <span style={{ fontSize: '1.4rem' }}>🛡</span>
          <strong style={{ fontSize: '1.2rem', marginTop: '12px' }}>Role: ADMIN</strong>
          <small>Full Content Permissions</small>
        </div>
      </section>

      {/* Asset Inventory Table */}
      <section className="dashboard-section" style={{ paddingTop: '10px' }}>
        <div className="section-heading">
          <div>
            <p className="eyebrow">Asset Inventory</p>
            <h2>All Uploaded Resources</h2>
          </div>
          <Link className="arrow-link" to="/assets">View Public Grid <span>↗</span></Link>
        </div>

        {loading ? (
          <div className="empty-state"><strong>Loading asset records...</strong></div>
        ) : assets.length === 0 ? (
          <div className="empty-state">
            <strong>No assets found in the database.</strong>
            <span>Upload an official branding resource to get started.</span>
            <Link className="button-link" to="/admin/assets/upload" style={{ marginTop: '16px' }}>
              Upload first asset
            </Link>
          </div>
        ) : (
          <div style={{ overflowX: 'auto', background: 'white', borderRadius: '12px', border: '1px solid #e5e6e1' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #e8e8e4', background: '#fafaf8' }}>
                  <th style={{ padding: '14px 18px', fontWeight: 600, color: '#3d465b' }}>Name</th>
                  <th style={{ padding: '14px 18px', fontWeight: 600, color: '#3d465b' }}>Category</th>
                  <th style={{ padding: '14px 18px', fontWeight: 600, color: '#3d465b' }}>Filename</th>
                  <th style={{ padding: '14px 18px', fontWeight: 600, color: '#3d465b' }}>Uploaded By</th>
                  <th style={{ padding: '14px 18px', fontWeight: 600, color: '#3d465b' }}>Created</th>
                  <th style={{ padding: '14px 18px', fontWeight: 600, color: '#3d465b', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {assets.map((asset) => (
                  <tr key={asset.id} style={{ borderBottom: '1px solid #f0f0ee' }}>
                    <td style={{ padding: '14px 18px', fontWeight: 600 }}>
                      <Link to={`/assets/${asset.id}`} style={{ color: '#6572e8' }}>
                        {asset.name}
                      </Link>
                    </td>
                    <td style={{ padding: '14px 18px' }}>
                      <span className="category-label">{asset.category}</span>
                    </td>
                    <td style={{ padding: '14px 18px', color: '#697187' }}>{asset.fileName}</td>
                    <td style={{ padding: '14px 18px', color: '#697187' }}>{asset.uploadedBy}</td>
                    <td style={{ padding: '14px 18px', color: '#697187' }}>
                      {new Date(asset.createdAt).toLocaleDateString()}
                    </td>
                    <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '8px' }}>
                        <Link
                          to={`/assets/${asset.id}`}
                          className="button-link compact-button secondary-button"
                          style={{ padding: '6px 10px', fontSize: '0.75rem' }}
                        >
                          Details / Edit
                        </Link>
                        <button
                          type="button"
                          className="button-link compact-button secondary-button"
                          style={{ padding: '6px 10px', fontSize: '0.75rem' }}
                          onClick={() => handleDownload(asset)}
                        >
                          Download
                        </button>
                        <button
                          type="button"
                          className="compact-button"
                          style={{
                            padding: '6px 10px',
                            fontSize: '0.75rem',
                            color: '#b34e4e',
                            background: '#fff0f0',
                            border: '1px solid #fed7d7'
                          }}
                          disabled={deletingId === asset.id}
                          onClick={() => handleDelete(asset.id, asset.name)}
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
    </main>
  );
}

export default AdminDashboard;
