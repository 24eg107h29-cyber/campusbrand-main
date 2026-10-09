import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import api, { downloadAssetFile } from '../services/api';
import { useAuth } from '../context/AuthContext';
import AssetPreview, { getAssetExtension } from '../components/AssetPreview';

const categoryOptions = ['LOGO', 'POSTER', 'TEMPLATE', 'GUIDELINE', 'FONT', 'COLOR', 'OTHER'];

export default function AssetDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const [asset, setAsset] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', description: '', category: '' });

  useEffect(() => {
    setLoading(true);
    api.get(`/assets/${id}`)
      .then((response) => {
        setAsset(response.data);
        setEditForm({
          name: response.data.name,
          description: response.data.description || '',
          category: response.data.category
        });
        setError('');
      })
      .catch((requestError) => {
        setError(requestError.response?.data?.error || 'Unable to load asset details.');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id]);

  const deleteAsset = async () => {
    if (!window.confirm(`Are you sure you want to delete "${asset.name}"? This action cannot be undone.`)) {
      return;
    }
    setDeleting(true);
    setError('');
    try {
      await api.delete(`/assets/${id}`);
      navigate('/assets', { replace: true });
    } catch (requestError) {
      setError(requestError.response?.data?.error || 'Unable to delete asset.');
      setDeleting(false);
    }
  };

  const saveEdit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const response = await api.put(`/assets/${id}`, editForm);
      setAsset(response.data);
      setEditing(false);
      setSuccess('Asset details updated successfully.');
    } catch (requestError) {
      setError(requestError.response?.data?.error || 'Unable to update asset.');
    } finally {
      setSaving(false);
    }
  };

  const handleDownload = async () => {
    if (!asset) return;
    setDownloading(true);
    setError('');
    try {
      await downloadAssetFile(asset.downloadUrl, asset.fileName);
    } catch (err) {
      setError(err.response?.data?.error || 'Download failed. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading-state-panel">
          <div className="spinner-icon" />
          <p>Loading asset details...</p>
        </div>
      </div>
    );
  }

  if (!asset && error) {
    return (
      <div className="page-container">
        <Link to="/assets" className="back-link">
          ← Back to All Assets
        </Link>
        <div className="alert-banner alert-error" style={{ marginTop: '20px' }}>
          <span>{error}</span>
        </div>
      </div>
    );
  }

  if (!asset) return null;

  const ext = getAssetExtension(asset);

  return (
    <div className="page-container">
      {/* Breadcrumb / Back Link */}
      <nav className="details-breadcrumb">
        <Link to="/assets" className="back-link">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
          <span>Back to All Assets</span>
        </Link>
      </nav>

      {success && (
        <div className="alert-banner alert-success" style={{ marginBottom: '20px' }}>
          <span>{success}</span>
        </div>
      )}

      {error && (
        <div className="alert-banner alert-error" style={{ marginBottom: '20px' }}>
          <span>{error}</span>
        </div>
      )}

      {/* Main Details Layout Grid */}
      <div className="details-two-column-layout">
        {/* Left Column: Big, Rich Preview Area */}
        <div className="details-preview-card">
          <AssetPreview asset={asset} variant="details" />
        </div>

        {/* Right Column: Metadata and Operations */}
        <div className="details-info-card">
          <div className="details-header-meta">
            <span className={`category-pill pill-${asset.category.toLowerCase()}`}>
              {asset.category}
            </span>
            <span className="file-format-badge">{ext}</span>
          </div>

          <h1 className="details-title">{asset.name}</h1>
          <p className="details-description">
            {asset.description || 'No description provided for this campus asset.'}
          </p>

          {/* Quick Download CTA */}
          <div className="details-primary-actions">
            <button
              type="button"
              className="button-link primary-cta download-main-btn"
              onClick={handleDownload}
              disabled={downloading}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              <span>{downloading ? 'Downloading asset...' : 'Download Asset File'}</span>
            </button>
          </div>

          {/* Detailed Specifications List */}
          <div className="details-specs-section">
            <h3 className="specs-section-title">FILE SPECIFICATIONS</h3>
            <div className="spec-row">
              <span className="spec-label">Original Filename</span>
              <span className="spec-value spec-mono" title={asset.fileName}>{asset.fileName}</span>
            </div>
            <div className="spec-row">
              <span className="spec-label">Category</span>
              <span className="spec-value">{asset.category}</span>
            </div>
            <div className="spec-row">
              <span className="spec-label">Format / Type</span>
              <span className="spec-value">{ext} File</span>
            </div>
            <div className="spec-row">
              <span className="spec-label">Uploaded By</span>
              <span className="spec-value">{asset.uploadedBy}</span>
            </div>
            <div className="spec-row">
              <span className="spec-label">Date Added</span>
              <span className="spec-value">
                {new Date(asset.createdAt).toLocaleString(undefined, {
                  dateStyle: 'medium',
                  timeStyle: 'short'
                })}
              </span>
            </div>
          </div>

          {/* Administrator Actions */}
          {isAdmin && (
            <div className="details-admin-section">
              <h3 className="specs-section-title">ADMINISTRATOR CONTROLS</h3>

              {!editing ? (
                <div className="admin-btn-group">
                  <button
                    type="button"
                    className="button-link secondary-btn"
                    onClick={() => setEditing(true)}
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                    </svg>
                    <span>Edit Metadata</span>
                  </button>
                  <button
                    type="button"
                    className="button-link danger-btn"
                    onClick={deleteAsset}
                    disabled={deleting}
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    </svg>
                    <span>{deleting ? 'Deleting...' : 'Delete Asset'}</span>
                  </button>
                </div>
              ) : (
                <form onSubmit={saveEdit} className="admin-edit-form">
                  <label className="form-label">
                    <span>Asset Name</span>
                    <input
                      type="text"
                      className="form-input"
                      value={editForm.name}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      required
                    />
                  </label>
                  <label className="form-label">
                    <span>Description</span>
                    <textarea
                      rows="3"
                      className="form-input"
                      value={editForm.description}
                      onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                    />
                  </label>
                  <label className="form-label">
                    <span>Category</span>
                    <select
                      className="form-input"
                      value={editForm.category}
                      onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                    >
                      {categoryOptions.map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </label>
                  <div className="form-actions-row">
                    <button type="submit" className="button-link primary-cta" disabled={saving}>
                      {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                    <button
                      type="button"
                      className="button-link secondary-btn"
                      onClick={() => {
                        setEditing(false);
                        setEditForm({
                          name: asset.name,
                          description: asset.description || '',
                          category: asset.category
                        });
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
