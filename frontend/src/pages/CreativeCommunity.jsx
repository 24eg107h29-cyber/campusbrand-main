import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api, { downloadAssetFile } from '../services/api';
import AssetPreview from '../components/AssetPreview';
import StarRating from '../components/StarRating';
import { useAuth } from '../context/AuthContext';

const CATEGORIES = ['All', 'Branding', 'Poster', 'Illustration', 'UI/UX', 'Photography'];

function CreativeCommunity() {
  const { user } = useAuth();
  const [artworks, setArtworks] = useState([]);
  const [creators, setCreators] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCreators();
  }, []);

  useEffect(() => {
    fetchArtworks();
  }, [selectedCategory, searchQuery]);

  const fetchCreators = async () => {
    try {
      const res = await api.get('/creators');
      setCreators(res.data || []);
    } catch (err) {
      console.error('Failed to load creators', err);
    }
  };

  const fetchArtworks = async () => {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (selectedCategory !== 'All') {
        params.category = selectedCategory;
      }
      if (searchQuery.trim()) {
        params.search = searchQuery.trim();
      }
      const res = await api.get('/artworks', { params });
      setArtworks(res.data || []);
    } catch (err) {
      setError('Unable to load creative works. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="portal-content-inner">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <p className="eyebrow">CREATIVE COMMUNITY</p>
          <h2>Student &amp; Faculty <em>Creations</em></h2>
          <p className="intro" style={{ margin: 0 }}>
            Discover and rate original posters, illustrations, and design systems crafted by verified campus creators.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          {user?.role === 'CREATOR' && (
            <Link to="/creator-studio" className="button-link compact-button">
              <span>✎ Creator Studio</span>
            </Link>
          )}
          {user?.role === 'USER' && (
            <Link to="/apply-creator" className="button-link secondary-button compact-button">
              <span>★ Apply as Creator</span>
            </Link>
          )}
        </div>
      </div>

      {/* Featured Creators Ribbon */}
      {creators.length > 0 && (
        <section style={{ margin: '24px 0 32px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#4b5563', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Verified Campus Creators
            </span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '14px' }}>
            {creators.map((c) => (
              <div
                key={c.id || c.userId}
                style={{
                  background: '#ffffff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '12px',
                  padding: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
                }}
              >
                <div
                  style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '50%',
                    background: '#ede9fe',
                    color: '#6366f1',
                    display: 'grid',
                    placeItems: 'center',
                    fontWeight: 700,
                    fontSize: '1.1rem'
                  }}
                >
                  {(c.displayName || c.name || 'C').charAt(0).toUpperCase()}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <strong style={{ fontSize: '0.92rem', color: '#111827', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {c.displayName || c.name}
                    </strong>
                    <span style={{ fontSize: '0.7rem', color: '#6366f1', background: '#eef2ff', padding: '2px 6px', borderRadius: '4px', fontWeight: 600 }}>
                      ✓ Creator
                    </span>
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#6b7280', marginTop: '2px' }}>
                    {c.department || 'Design Chapter'} • {c.artworkCount} {c.artworkCount === 1 ? 'work' : 'works'}
                  </div>
                  {c.averageRating > 0 && (
                    <div style={{ marginTop: '4px' }}>
                      <StarRating rating={c.averageRating} size="sm" />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Filter and Search Bar */}
      <div className="filter-controls-card" style={{ background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '16px 20px', margin: '24px 0', display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              className={selectedCategory === cat ? 'button-link compact-button' : 'secondary-button compact-button'}
              onClick={() => setSelectedCategory(cat)}
              style={{ borderRadius: '20px', padding: '6px 14px', fontSize: '0.82rem' }}
            >
              {cat}
            </button>
          ))}
        </div>
        <div style={{ minWidth: '240px', flex: '1', maxWidth: '360px' }}>
          <input
            type="search"
            placeholder="Search artworks or creators..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ padding: '8px 14px', fontSize: '0.88rem' }}
          />
        </div>
      </div>

      {error && <div className="message error-message">{error}</div>}

      {/* Artworks Grid */}
      {loading ? (
        <div className="empty-state" style={{ minHeight: '300px' }}>
          <strong>Loading community artworks...</strong>
        </div>
      ) : artworks.length === 0 ? (
        <div className="empty-state" style={{ minHeight: '300px', background: '#ffffff', border: '1px dashed #d1d5db', borderRadius: '12px' }}>
          <span style={{ fontSize: '2rem' }}>✦</span>
          <strong>No artworks found</strong>
          <p style={{ color: '#6b7280', margin: '6px 0 16px' }}>
            {searchQuery || selectedCategory !== 'All'
              ? 'Try adjusting your search query or category filter.'
              : 'Be the first creator to publish original work on CampusBrand!'}
          </p>
          {user?.role === 'CREATOR' && (
            <Link to="/creator-studio" className="button-link compact-button">
              Publish Your Artwork
            </Link>
          )}
        </div>
      ) : (
        <div className="asset-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '22px' }}>
          {artworks.map((art) => (
            <div
              key={art.id}
              className="asset-card-refined"
              style={{
                background: '#ffffff',
                border: '1px solid #e5e7eb',
                borderRadius: '14px',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                transition: 'transform 0.2s, box-shadow 0.2s',
                boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
              }}
            >
              {/* Preview Window */}
              <div style={{ height: '200px', background: '#fafafa', borderBottom: '1px solid #f3f4f6', position: 'relative' }}>
                <AssetPreview
                  previewUrl={art.previewUrl}
                  fileName={art.fileName}
                  assetName={art.title}
                  aspectRatio="auto"
                />
                <span
                  style={{
                    position: 'absolute',
                    top: '12px',
                    left: '12px',
                    background: '#111827e6',
                    color: '#ffffff',
                    fontSize: '0.72rem',
                    fontWeight: 600,
                    padding: '3px 8px',
                    borderRadius: '6px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em'
                  }}
                >
                  {art.category}
                </span>
              </div>

              {/* Card Body */}
              <div style={{ padding: '16px 18px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: '0 0 6px', color: '#111827', lineHeight: 1.3 }}>
                  {art.title}
                </h3>
                <p style={{ fontSize: '0.82rem', color: '#6b7280', margin: '0 0 12px', flex: 1, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {art.description || 'Original campus creative artwork.'}
                </p>

                {/* Rating Strip */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', paddingTop: '10px', borderTop: '1px solid #f3f4f6' }}>
                  <StarRating rating={art.averageRating} count={art.ratingCount} size="sm" />
                  <span style={{ fontSize: '0.78rem', color: '#9ca3af' }}>
                    by <strong style={{ color: '#4b5563' }}>{art.creatorName}</strong>
                  </span>
                </div>

                {/* Card Action Buttons */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  <Link
                    to={`/community/artworks/${art.id}`}
                    className="secondary-button compact-button"
                    style={{ textAlign: 'center', padding: '8px 10px', fontSize: '0.82rem' }}
                  >
                    View &amp; Rate
                  </Link>
                  <button
                    type="button"
                    className="button-link compact-button"
                    style={{ padding: '8px 10px', fontSize: '0.82rem' }}
                    onClick={() => downloadAssetFile(art.downloadUrl, art.fileName)}
                  >
                    Download
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default CreativeCommunity;

