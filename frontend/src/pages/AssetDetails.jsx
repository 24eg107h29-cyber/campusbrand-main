import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import api, { downloadAssetFile } from '../services/api';
import { useAuth } from '../context/AuthContext';
import AssetPreview from '../components/AssetPreview.jsx';

function AssetDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const [asset, setAsset] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
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
        setError(requestError.response?.data?.error || 'Unable to load asset.');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id]);

  const deleteAsset = async () => {
    if (!window.confirm('Are you sure you want to delete this asset?')) return;
    setDeleting(true);
    setError('');
    try {
      await api.delete(`/assets/${id}`);
      navigate('/assets');
    } catch (requestError) {
      setError(requestError.response?.data?.error || 'Unable to delete asset.');
      setDeleting(false);
    }
  };

  const saveEdit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    try {
      const response = await api.put(`/assets/${id}`, editForm);
      setAsset(response.data);
      setEditing(false);
    } catch (requestError) {
      setError(requestError.response?.data?.error || 'Unable to update asset.');
    } finally {
      setSaving(false);
    }
  };

  const handleDownload = async () => {
    if (!asset) return;
    setDownloading(true);
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
      <main className="details-shell">
        <Link to="/assets">← Back to assets</Link>
        <p style={{ marginTop: '20px' }}>Loading asset details...</p>
      </main>
    );
  }

  if (!asset && error) {
    return (
      <main className="details-shell">
        <Link to="/assets">← Back to assets</Link>
        <p className="message error-message" style={{ marginTop: '20px' }}>{error}</p>
      </main>
    );
  }

  if (!asset) return null;

  return (
    <main className="details-shell">
      <Link to="/assets">← Back to assets</Link>

      <section className="details-card">
        <div className="details-preview">
          <AssetPreview asset={asset} variant="details" />
        </div>

        <div>
          <p className="eyebrow">{asset.category}</p>
          <h1>{asset.name}</h1>
          <p className="intro">{asset.description || 'No description provided.'}</p>
          <p>Uploaded by <strong>{asset.uploadedBy}</strong></p>
          <p>Created {new Date(asset.createdAt).toLocaleString()}</p>
          <p>Filename: <code style={{ background: '#f0f1f5', padding: '2px 6px', borderRadius: '4px' }}>{asset.fileName}</code></p>

          {error && <p className="message error-message">{error}</p>}

          {editing && (
            <form onSubmit={saveEdit}>
              <label>
                Name
                <input
                  value={editForm.name}
                  onChange={(event) => setEditForm({ ...editForm, name: event.target.value })}
                  required
                />
              </label>
              <label>
                Description
                <textarea
                  rows="3"
                  value={editForm.description}
                  onChange={(event) => setEditForm({ ...editForm, description: event.target.value })}
                />
              </label>
              <label>
                Category
                <select
                  value={editForm.category}
                  onChange={(event) => setEditForm({ ...editForm, category: event.target.value })}
                >
                  {['LOGO', 'POSTER', 'TEMPLATE', 'GUIDELINE', 'FONT', 'COLOR', 'OTHER'].map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </label>
              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button type="submit" disabled={saving}>
                  {saving ? 'Saving...' : 'Save changes'}
                </button>
                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => {
                    setEditing(false);
                    setError('');
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

          <div className="card-actions" style={{ marginTop: '24px' }}>
            <button
              type="button"
              className="button-link"
              onClick={handleDownload}
              disabled={downloading}
            >
              {downloading ? 'Downloading...' : 'Download asset'}
            </button>
            {isAdmin && !editing && (
              <button type="button" className="secondary-button" onClick={() => setEditing(true)}>
                Edit
              </button>
            )}
            {isAdmin && (
              <button
                type="button"
                onClick={deleteAsset}
                disabled={deleting}
              >
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}

export default AssetDetails;
