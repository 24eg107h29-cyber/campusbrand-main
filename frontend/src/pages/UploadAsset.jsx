import { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const categories = ['LOGO', 'POSTER', 'TEMPLATE', 'GUIDELINE', 'FONT', 'COLOR', 'OTHER'];
const ALLOWED_EXTENSIONS = ['png', 'jpg', 'jpeg', 'svg', 'webp', 'gif', 'pdf'];

function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export default function UploadAsset() {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const fileInputRef = useRef(null);

  const [form, setForm] = useState({ name: '', description: '', category: 'LOGO', file: null });
  const [filePreviewUrl, setFilePreviewUrl] = useState(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isAdmin) {
    return (
      <div className="page-container">
        <div className="alert-banner alert-error">
          <p>Only administrators are authorized to upload college brand assets.</p>
        </div>
        <p style={{ marginTop: '16px' }}>
          <Link to="/dashboard" className="button-link secondary-btn">Return to Workspace</Link>
        </p>
      </div>
    );
  }

  const processSelectedFile = (selectedFile) => {
    if (!selectedFile) return;

    const extension = selectedFile.name.split('.').pop().toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(extension)) {
      setError(`Invalid file type (.${extension}). Only PNG, JPG, JPEG, SVG, WEBP, GIF, and PDF files are supported.`);
      if (fileInputRef.current) fileInputRef.current.value = '';
      setForm({ ...form, file: null });
      setFilePreviewUrl(null);
      return;
    }

    if (selectedFile.size > 50 * 1024 * 1024) {
      setError('File size exceeds the 50MB maximum upload limit.');
      if (fileInputRef.current) fileInputRef.current.value = '';
      setForm({ ...form, file: null });
      setFilePreviewUrl(null);
      return;
    }

    setError('');
    setForm({ ...form, file: selectedFile });

    // Generate local preview if image
    if (['png', 'jpg', 'jpeg', 'webp', 'gif', 'svg'].includes(extension)) {
      const url = URL.createObjectURL(selectedFile);
      setFilePreviewUrl(url);
    } else {
      setFilePreviewUrl(null);
    }
  };

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    processSelectedFile(selected);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const submit = async (event) => {
    event.preventDefault();
    if (!form.file) {
      setError('Please attach a branding asset file before publishing.');
      return;
    }

    const body = new FormData();
    body.append('name', form.name.trim());
    body.append('description', form.description.trim());
    body.append('category', form.category);
    body.append('file', form.file);

    setLoading(true);
    setError('');
    try {
      await api.post('/assets', body, {
        headers: { 'Content-Type': undefined }
      });
      navigate('/assets');
    } catch (requestError) {
      setError(requestError.response?.data?.error || 'Unable to upload asset. Please verify file integrity and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <nav className="details-breadcrumb">
        <Link to="/assets" className="back-link">
          ← Back to Assets
        </Link>
      </nav>

      <div className="form-card-wrapper">
        <header className="page-header-block" style={{ marginBottom: '24px' }}>
          <div>
            <span className="eyebrow-tag">ADMINISTRATION</span>
            <h1 className="page-heading">Upload Brand Asset</h1>
            <p className="page-subheading">
              Publish official logos, posters, guidelines, or templates to the collegiate repository.
            </p>
          </div>
        </header>

        {error && (
          <div className="alert-banner alert-error" style={{ marginBottom: '24px' }}>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={submit} className="modern-form-stack">
          {/* File Dropzone Area */}
          <div
            className={`file-dropzone ${isDragOver ? 'is-drag-over' : ''} ${form.file ? 'has-file' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              type="file"
              ref={fileInputRef}
              accept=".png,.jpg,.jpeg,.svg,.webp,.gif,.pdf"
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />

            {form.file ? (
              <div className="dropzone-file-selected">
                {filePreviewUrl ? (
                  <div className="dropzone-thumb-preview">
                    <img src={filePreviewUrl} alt="Preview" />
                  </div>
                ) : (
                  <div className="dropzone-doc-badge">
                    <span>{form.file.name.split('.').pop().toUpperCase()}</span>
                  </div>
                )}
                <div className="dropzone-file-info">
                  <strong>{form.file.name}</strong>
                  <small>{formatBytes(form.file.size)} • Click or drag to replace</small>
                </div>
              </div>
            ) : (
              <div className="dropzone-prompt">
                <div className="dropzone-icon">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="17 8 12 3 7 8" />
                    <line x1="12" y1="3" x2="12" y2="15" />
                  </svg>
                </div>
                <p className="dropzone-title">Click to upload or drag & drop</p>
                <p className="dropzone-hint">PNG, JPG, SVG, WebP, GIF, or PDF (up to 50MB)</p>
              </div>
            )}
          </div>

          {/* Form Fields */}
          <div className="form-group-item">
            <label className="form-label" htmlFor="asset-name">
              <span>Asset Name <strong style={{ color: '#ef4444' }}>*</strong></span>
              <input
                id="asset-name"
                className="form-input"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. University Crest - Primary Horizontal Logo"
                maxLength="255"
                required
              />
            </label>
          </div>

          <div className="form-group-item">
            <label className="form-label" htmlFor="asset-category">
              <span>Category <strong style={{ color: '#ef4444' }}>*</strong></span>
              <select
                id="asset-category"
                className="form-input"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              >
                {categories.map((item) => (
                  <option key={item} value={item}>{item}</option>
                ))}
              </select>
            </label>
          </div>

          <div className="form-group-item">
            <label className="form-label" htmlFor="asset-desc">
              <span>Description / Usage Guidelines</span>
              <textarea
                id="asset-desc"
                rows="4"
                className="form-input"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Specify dimensions, clearspace requirements, approved background colors, or contextual usage..."
                maxLength="2000"
              />
            </label>
          </div>

          <div className="form-submit-row">
            <button
              type="submit"
              className="button-link primary-cta"
              disabled={loading}
              style={{ minWidth: '180px' }}
            >
              {loading ? (
                <>
                  <span className="spinner-icon" style={{ width: '16px', height: '16px' }} />
                  <span>Uploading asset...</span>
                </>
              ) : (
                <span>Publish to Library</span>
              )}
            </button>

            <Link to="/assets" className="button-link secondary-btn">
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
