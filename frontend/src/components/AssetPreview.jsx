import { useState } from 'react';
import { API_BASE_URL } from '../services/api';

/**
 * Determines file classification based on file extension and metadata
 */
export function getAssetType(asset) {
  const fileName = (asset?.fileName || '').trim().toLowerCase();
  const fileType = (asset?.fileType || '').trim().toLowerCase();

  if (/\.(png|jpe?g|webp|gif)$/i.test(fileName) || ['png', 'jpg', 'jpeg', 'webp', 'gif'].includes(fileType)) {
    return 'image';
  }
  if (/\.svg$/i.test(fileName) || fileType === 'svg') {
    return 'svg';
  }
  if (/\.pdf$/i.test(fileName) || fileType === 'pdf') {
    return 'pdf';
  }
  return 'file';
}

/**
 * Formats file extension cleanly
 */
export function getAssetExtension(asset) {
  if (asset?.fileType) return asset.fileType.toUpperCase();
  const name = asset?.fileName || '';
  const dot = name.lastIndexOf('.');
  return dot >= 0 ? name.substring(dot + 1).toUpperCase() : 'ASSET';
}

/**
 * Reusable AssetPreview component supporting Cards, Details, and Thumbnails
 */
export default function AssetPreview({ asset, variant = 'card', className = '' }) {
  const [imgError, setImgError] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);

  if (!asset) {
    return (
      <div className={`asset-preview-container preview-empty ${className}`}>
        <span className="preview-fallback-text">No asset data</span>
      </div>
    );
  }

  const type = getAssetType(asset);
  const ext = getAssetExtension(asset);
  const isLogo = asset.category === 'LOGO';
  const isPoster = asset.category === 'POSTER';

  // Construct absolute preview URL safely
  const previewPath = asset.previewUrl || `/api/assets/preview/${asset.id}`;
  const fileUrl = previewPath.startsWith('http') ? previewPath : `${API_BASE_URL}${previewPath}`;

  // 1. Image or SVG preview
  if ((type === 'image' || type === 'svg') && !imgError) {
    return (
      <div
        className={`asset-preview-container preview-${variant} ${isLogo ? 'is-logo-preview' : ''} ${isPoster ? 'is-poster-preview' : ''} ${className}`}
      >
        {!imgLoaded && <div className="preview-shimmer" />}
        <img
          src={fileUrl}
          alt={asset.name}
          loading="lazy"
          className={`preview-media ${imgLoaded ? 'is-loaded' : 'is-loading'}`}
          onLoad={() => setImgLoaded(true)}
          onError={() => {
            setImgError(true);
            setImgLoaded(true);
          }}
        />
        <div className="preview-badge-overlay">
          <span className="file-pill pill-img">{ext}</span>
        </div>
      </div>
    );
  }

  // 2. PDF preview
  if (type === 'pdf') {
    if (variant === 'details') {
      return (
        <div className={`asset-preview-container preview-details is-pdf-details ${className}`}>
          <div className="pdf-embed-wrapper">
            <object
              data={`${fileUrl}#toolbar=0&navpanes=0`}
              type="application/pdf"
              className="pdf-embed-object"
            >
              <div className="pdf-fallback-card">
                <div className="pdf-icon-badge">
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                    <line x1="16" y1="13" x2="8" y2="13" />
                    <line x1="16" y1="17" x2="8" y2="17" />
                    <polyline points="10 9 9 9 8 9" />
                  </svg>
                </div>
                <h3>{asset.fileName || 'PDF Document'}</h3>
                <p>Interactive preview not available in this browser window.</p>
                <a
                  href={`${API_BASE_URL}/api/assets/download/${asset.id}?inline=true`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="button-link compact-button"
                >
                  Open PDF in New Tab ↗
                </a>
              </div>
            </object>
          </div>
          <div className="preview-badge-overlay">
            <span className="file-pill pill-pdf">PDF DOCUMENT</span>
          </div>
        </div>
      );
    }

    // Card / Thumbnail variant for PDF
    return (
      <div className={`asset-preview-container preview-${variant} is-pdf-card ${className}`}>
        <div className="pdf-card-visual">
          <div className="pdf-icon-wrapper">
            <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <path d="M9 13h6" />
              <path d="M9 17h4" />
            </svg>
          </div>
          <span className="pdf-type-label">PDF DOCUMENT</span>
          <span className="pdf-filename-hint">{asset.fileName}</span>
        </div>
        <div className="preview-badge-overlay">
          <span className="file-pill pill-pdf">PDF</span>
        </div>
      </div>
    );
  }

  // 3. Fallback for failed image load or unsupported document types
  return (
    <div className={`asset-preview-container preview-${variant} is-generic-file ${className}`}>
      <div className="generic-file-visual">
        <div className="generic-icon-box">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" />
            <polyline points="13 2 13 9 20 9" />
          </svg>
        </div>
        <span className="generic-ext-label">{ext}</span>
        <span className="generic-name-hint">{asset.fileName || 'Resource File'}</span>
      </div>
      <div className="preview-badge-overlay">
        <span className="file-pill pill-generic">{ext}</span>
      </div>
    </div>
  );
}

