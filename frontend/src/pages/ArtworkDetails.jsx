import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api, { downloadAssetFile } from '../services/api';
import AssetPreview from '../components/AssetPreview';
import StarRating from '../components/StarRating';
import { useAuth } from '../context/AuthContext';

function ArtworkDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();

  const [artwork, setArtwork] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Rating form state
  const [selectedRating, setSelectedRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [submittingRating, setSubmittingRating] = useState(false);
  const [ratingMessage, setRatingMessage] = useState('');

  // Report modal state
  const [reporting, setReporting] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reportSuccess, setReportSuccess] = useState('');

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const [artRes, revRes] = await Promise.all([
        api.get(`/artworks/${id}`),
        api.get(`/artworks/${id}/reviews`)
      ]);
      setArtwork(artRes.data);
      setReviews(revRes.data || []);
      if (artRes.data?.userRating) {
        setSelectedRating(artRes.data.userRating);
      }
    } catch (err) {
      setError('Unable to load artwork details.');
    } finally {
      setLoading(false);
    }
  };

  const handleRateSubmit = async (e) => {
    e.preventDefault();
    if (!selectedRating) return;
    setSubmittingRating(true);
    setRatingMessage('');
    try {
      const res = await api.post(`/artworks/${id}/rate`, {
        rating: selectedRating,
        review: reviewText.trim()
      });
      setArtwork(res.data);
      setRatingMessage('Thank you! Your rating and review have been recorded.');
      // Refresh reviews list
      const revRes = await api.get(`/artworks/${id}/reviews`);
      setReviews(revRes.data || []);
      setReviewText('');
    } catch (err) {
      setRatingMessage(err.response?.data?.error || 'Failed to submit rating.');
    } finally {
      setSubmittingRating(false);
    }
  };

  const handleReport = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/artworks/${id}/report`, { reason: reportReason.trim() });
      setReportSuccess('Thank you. This artwork has been flagged for administrative review.');
      setReporting(false);
    } catch (err) {
      alert('Failed to report artwork.');
    }
  };

  const handleModerateHide = async (hide) => {
    try {
      await api.put(`/artworks/${id}/moderate`, { hidden: hide });
      setArtwork(prev => ({ ...prev, hidden: hide }));
    } catch (err) {
      alert('Failed to update artwork visibility');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this artwork? This action cannot be undone.')) {
      return;
    }
    try {
      await api.delete(`/artworks/${id}`);
      navigate('/community');
    } catch (err) {
      alert('Failed to delete artwork.');
    }
  };

  if (loading) {
    return (
      <div className="portal-content-inner">
        <div className="empty-state" style={{ minHeight: '400px' }}>
          <strong>Loading artwork details...</strong>
        </div>
      </div>
    );
  }

  if (error || !artwork) {
    return (
      <div className="portal-content-inner">
        <div className="message error-message">{error || 'Artwork not found'}</div>
        <Link to="/community" className="button-link secondary-button compact-button" style={{ marginTop: '16px' }}>
          ← Back to Community
        </Link>
      </div>
    );
  }

  const isCreatorOfWork = user?.id === artwork.creatorId || user?.email === artwork.creatorEmail;

  return (
    <div className="portal-content-inner">
      <div style={{ marginBottom: '20px' }}>
        <Link to="/community" style={{ color: '#6366f1', fontSize: '0.86rem', fontWeight: 600 }}>
          ← Back to Community Showcase
        </Link>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '32px', alignItems: 'start' }}>
        {/* Left Column: Big Preview */}
        <div style={{ background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '16px', overflow: 'hidden', padding: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
          <div style={{ minHeight: '420px', background: '#fafafa', borderRadius: '12px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <AssetPreview
              previewUrl={artwork.previewUrl}
              fileName={artwork.fileName}
              assetName={artwork.title}
              aspectRatio="auto"
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px', flexWrap: 'wrap', gap: '12px' }}>
            <span style={{ fontSize: '0.85rem', color: '#6b7280', fontFamily: 'monospace' }}>
              {artwork.fileName}
            </span>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                type="button"
                className="button-link compact-button"
                onClick={() => downloadAssetFile(artwork.downloadUrl, artwork.fileName)}
              >
                Download Artwork
              </button>
              <button
                type="button"
                className="secondary-button compact-button"
                onClick={() => setReporting(true)}
                style={{ color: '#991b1b' }}
              >
                ⚑ Report
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Metadata, Ratings, & Reviews */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Header Card */}
          <div style={{ background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '16px', padding: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px', marginBottom: '12px' }}>
              <span style={{ background: '#ede9fe', color: '#6366f1', fontSize: '0.75rem', fontWeight: 700, padding: '4px 10px', borderRadius: '20px', textTransform: 'uppercase' }}>
                {artwork.category}
              </span>
              {isAdmin && (
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    type="button"
                    className="secondary-button compact-button"
                    style={{ fontSize: '0.78rem', padding: '4px 10px' }}
                    onClick={() => handleModerateHide(!artwork.hidden)}
                  >
                    {artwork.hidden ? 'Unhide' : 'Hide from Public'}
                  </button>
                  <button
                    type="button"
                    className="secondary-button compact-button"
                    style={{ fontSize: '0.78rem', padding: '4px 10px', color: '#dc2626' }}
                    onClick={handleDelete}
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>

            <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#111827', margin: '0 0 12px', lineHeight: 1.2 }}>
              {artwork.title}
            </h1>

            <p style={{ color: '#4b5563', lineHeight: 1.6, margin: '0 0 20px' }}>
              {artwork.description || 'No detailed description provided by the creator.'}
            </p>

            {/* Creator Info */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px', background: '#f9fafb', borderRadius: '12px', border: '1px solid #f3f4f6' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#6366f1', color: 'white', display: 'grid', placeItems: 'center', fontWeight: 700 }}>
                {artwork.creatorName.charAt(0).toUpperCase()}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#111827' }}>{artwork.creatorName}</div>
                <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>Verified Campus Creator</div>
              </div>
            </div>

            {/* Community Rating Summary */}
            <div style={{ marginTop: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px', background: '#fffbeb', borderRadius: '12px', border: '1px solid #fef3c7' }}>
              <div>
                <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#92400e', textTransform: 'uppercase' }}>Community Score</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                  <StarRating rating={artwork.averageRating} count={artwork.ratingCount} size="lg" />
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#b45309' }}>
                  {artwork.averageRating > 0 ? artwork.averageRating.toFixed(1) : '–'}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#92400e' }}>
                  {artwork.ratingCount} {artwork.ratingCount === 1 ? 'review' : 'reviews'}
                </div>
              </div>
            </div>
          </div>

          {/* Rate & Review Form */}
          <div style={{ background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '16px', padding: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: '0 0 6px', color: '#111827' }}>
              Rate this Artwork
            </h3>

            {isCreatorOfWork ? (
              <div style={{ padding: '12px 14px', background: '#f3f4f6', borderRadius: '8px', color: '#6b7280', fontSize: '0.85rem' }}>
                ℹ You are the creator of this artwork. Creators cannot rate their own creations.
              </div>
            ) : (
              <form onSubmit={handleRateSubmit} style={{ marginTop: '12px', gap: '14px' }}>
                <div>
                  <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '6px' }}>
                    Your Score (1 to 5 Stars):
                  </span>
                  <StarRating
                    rating={selectedRating}
                    interactive={true}
                    onRate={(val) => setSelectedRating(val)}
                    size="lg"
                  />
                </div>

                <div>
                  <label htmlFor="reviewText" style={{ fontSize: '0.85rem', fontWeight: 600, color: '#374151' }}>
                    Optional Review or Feedback:
                  </label>
                  <textarea
                    id="reviewText"
                    rows="3"
                    placeholder="Share what inspired you about this work..."
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    style={{ fontSize: '0.88rem' }}
                  />
                </div>

                {ratingMessage && (
                  <div className={`message ${ratingMessage.includes('Thank') ? 'success-message' : 'error-message'}`}>
                    {ratingMessage}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submittingRating}
                  className="button-link compact-button"
                  style={{ justifySelf: 'start' }}
                >
                  {submittingRating ? 'Submitting...' : artwork.userRating ? 'Update Rating' : 'Submit Rating'}
                </button>
              </form>
            )}
          </div>

          {/* User Reviews List */}
          <div style={{ background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '16px', padding: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: '0 0 16px', color: '#111827' }}>
              Reviews ({reviews.length})
            </h3>

            {reviews.length === 0 ? (
              <p style={{ color: '#9ca3af', fontSize: '0.85rem', fontStyle: 'italic', margin: 0 }}>
                No reviews yet. Be the first to leave feedback!
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {reviews.map((rev) => (
                  <div key={rev.id} style={{ borderBottom: '1px solid #f3f4f6', paddingBottom: '14px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <strong style={{ fontSize: '0.9rem', color: '#111827' }}>{rev.userName}</strong>
                      <StarRating rating={rev.rating} size="sm" />
                    </div>
                    {rev.review ? (
                      <p style={{ margin: 0, color: '#4b5563', fontSize: '0.85rem', lineHeight: 1.5 }}>
                        {rev.review}
                      </p>
                    ) : (
                      <span style={{ color: '#9ca3af', fontSize: '0.8rem', fontStyle: 'italic' }}>Rated {rev.rating} stars</span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Report Modal */}
      {reporting && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'grid', placeItems: 'center', zIndex: 1000, padding: '20px' }}>
          <div style={{ background: 'white', borderRadius: '16px', padding: '28px', maxWidth: '440px', width: '100%', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
            <h3 style={{ marginTop: 0, fontSize: '1.25rem', color: '#111827' }}>Report Artwork</h3>
            <p style={{ color: '#6b7280', fontSize: '0.85rem', lineHeight: 1.5 }}>
              Please let our campus administrators know why this artwork should be reviewed (e.g., copyright violation, inappropriate content).
            </p>
            <form onSubmit={handleReport}>
              <textarea
                required
                rows="3"
                placeholder="Reason for reporting..."
                value={reportReason}
                onChange={(e) => setReportReason(e.target.value)}
              />
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
                <button type="button" className="secondary-button compact-button" onClick={() => setReporting(false)}>
                  Cancel
                </button>
                <button type="submit" className="button-link compact-button" style={{ background: '#dc2626' }}>
                  Submit Report
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default ArtworkDetails;

