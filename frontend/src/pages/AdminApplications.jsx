import { useEffect, useState } from 'react';
import api, { API_BASE_URL } from '../services/api';

function AdminApplications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('ALL'); // 'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'

  // Review modal state
  const [reviewingApp, setReviewingApp] = useState(null);
  const [reviewAction, setReviewAction] = useState('APPROVED');
  const [reviewFeedback, setReviewFeedback] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState('');

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const res = await api.get('/creator-applications');
      setApplications(res.data || []);
    } catch (err) {
      console.error('Failed to load applications', err);
    } finally {
      setLoading(false);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!reviewingApp) return;
    setSubmittingReview(true);
    setReviewError('');
    try {
      const res = await api.post(`/creator-applications/${reviewingApp.id}/review`, {
        status: reviewAction,
        feedback: reviewFeedback.trim()
      });
      setApplications(applications.map((a) => (a.id === reviewingApp.id ? res.data : a)));
      setReviewingApp(null);
      setReviewFeedback('');
    } catch (err) {
      setReviewError(err.response?.data?.error || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  const filtered = applications.filter((a) => {
    if (filterStatus === 'ALL') return true;
    return a.status === filterStatus;
  });

  const pendingCount = applications.filter((a) => a.status === 'PENDING').length;

  return (
    <div className="portal-content-inner">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <p className="eyebrow">ADMINISTRATION</p>
          <h2>Creator <em>Applications</em></h2>
          <p className="intro" style={{ margin: 0 }}>
            Evaluate student and faculty applications to grant verified Campus Creator publishing permissions.
          </p>
        </div>
        {pendingCount > 0 && (
          <div style={{ background: '#fef3c7', color: '#b45309', padding: '8px 16px', borderRadius: '10px', fontWeight: 700, fontSize: '0.88rem' }}>
            ● {pendingCount} Pending Review
          </div>
        )}
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '8px', margin: '24px 0 20px', flexWrap: 'wrap' }}>
        {['ALL', 'PENDING', 'APPROVED', 'REJECTED'].map((st) => (
          <button
            key={st}
            type="button"
            className={filterStatus === st ? 'button-link compact-button' : 'secondary-button compact-button'}
            onClick={() => setFilterStatus(st)}
            style={{ borderRadius: '20px', padding: '6px 16px', fontSize: '0.82rem' }}
          >
            {st} {st !== 'ALL' && `(${applications.filter((a) => a.status === st).length})`}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="empty-state" style={{ minHeight: '300px' }}>
          <strong>Loading creator applications...</strong>
        </div>
      ) : filtered.length === 0 ? (
        <div className="empty-state" style={{ minHeight: '260px', background: '#ffffff', border: '1px dashed #d1d5db', borderRadius: '14px' }}>
          <span>✓</span>
          <strong>No {filterStatus.toLowerCase()} applications found</strong>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {filtered.map((app) => (
            <div
              key={app.id}
              style={{
                background: '#ffffff',
                border: '1px solid #e5e7eb',
                borderRadius: '16px',
                padding: '24px',
                boxShadow: '0 4px 14px rgba(0,0,0,0.02)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '14px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0, color: '#111827' }}>
                      {app.applicantName}
                    </h3>
                    <span
                      style={{
                        fontSize: '0.74rem',
                        fontWeight: 700,
                        padding: '3px 10px',
                        borderRadius: '12px',
                        textTransform: 'uppercase',
                        background:
                          app.status === 'APPROVED' ? '#dcfce7' : app.status === 'REJECTED' ? '#fee2e2' : '#fef3c7',
                        color:
                          app.status === 'APPROVED' ? '#16a34a' : app.status === 'REJECTED' ? '#dc2626' : '#b45309'
                      }}
                    >
                      {app.status}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.84rem', color: '#6b7280', marginTop: '4px' }}>
                    {app.applicantEmail} • {app.department}
                  </div>
                </div>

                <div style={{ fontSize: '0.78rem', color: '#9ca3af' }}>
                  Applied {new Date(app.createdAt).toLocaleDateString()}
                </div>
              </div>

              <div style={{ background: '#f9fafb', borderRadius: '10px', padding: '14px 16px', margin: '12px 0', border: '1px solid #f3f4f6' }}>
                <div style={{ marginBottom: '8px' }}>
                  <strong style={{ fontSize: '0.8rem', color: '#4b5563', textTransform: 'uppercase' }}>Skills: </strong>
                  <span style={{ fontSize: '0.86rem', color: '#1f2937' }}>{app.skills}</span>
                </div>
                <div>
                  <strong style={{ fontSize: '0.8rem', color: '#4b5563', textTransform: 'uppercase' }}>Bio Statement: </strong>
                  <p style={{ margin: '4px 0 0', color: '#374151', fontSize: '0.88rem', lineHeight: 1.5 }}>
                    {app.bio}
                  </p>
                </div>
              </div>

              {/* Sample Works */}
              {app.sampleFiles && app.sampleFiles.length > 0 && (
                <div style={{ margin: '14px 0' }}>
                  <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>
                    Submitted Samples ({app.sampleFiles.length})
                  </span>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {app.sampleFiles.map((fileName, idx) => {
                      const url = `${API_BASE_URL}/api/creator-applications/sample/${fileName}`;
                      return (
                        <a
                          key={idx}
                          href={url}
                          target="_blank"
                          rel="noreferrer"
                          className="secondary-button compact-button"
                          style={{ fontSize: '0.8rem', padding: '6px 12px' }}
                        >
                          👁 Sample {idx + 1}: {fileName.replace(/^sample-[a-f0-9-]+-/, '')}
                        </a>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Feedback note if reviewed */}
              {app.adminFeedback && (
                <div style={{ background: '#f8fafc', padding: '10px 14px', borderRadius: '8px', fontSize: '0.82rem', color: '#475569', marginTop: '12px' }}>
                  <strong>Feedback Given:</strong> {app.adminFeedback}
                </div>
              )}

              {/* Actions */}
              <div style={{ display: 'flex', gap: '10px', marginTop: '16px', borderTop: '1px solid #f3f4f6', paddingTop: '14px' }}>
                {app.status === 'PENDING' ? (
                  <>
                    <button
                      type="button"
                      className="button-link compact-button"
                      style={{ background: '#16a34a' }}
                      onClick={() => {
                        setReviewingApp(app);
                        setReviewAction('APPROVED');
                        setReviewFeedback('Approved as verified campus creator.');
                      }}
                    >
                      ✓ Approve Application
                    </button>
                    <button
                      type="button"
                      className="secondary-button compact-button"
                      style={{ color: '#dc2626' }}
                      onClick={() => {
                        setReviewingApp(app);
                        setReviewAction('REJECTED');
                        setReviewFeedback('Please add more distinct campus designs and reapply.');
                      }}
                    >
                      ✕ Reject Application
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    className="secondary-button compact-button"
                    style={{ fontSize: '0.8rem' }}
                    onClick={() => {
                      setReviewingApp(app);
                      setReviewAction(app.status === 'APPROVED' ? 'REJECTED' : 'APPROVED');
                      setReviewFeedback(app.adminFeedback || '');
                    }}
                  >
                    Change Decision / Edit Feedback
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Review Modal */}
      {reviewingApp && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'grid', placeItems: 'center', zIndex: 1000, padding: '20px' }}>
          <div style={{ background: 'white', borderRadius: '16px', padding: '28px', maxWidth: '480px', width: '100%', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
            <h3 style={{ marginTop: 0, fontSize: '1.25rem', color: '#111827' }}>
              Review Application: {reviewingApp.applicantName}
            </h3>

            <form onSubmit={handleReviewSubmit}>
              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Decision</label>
                <div style={{ display: 'flex', gap: '12px', marginTop: '4px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                    <input
                      type="radio"
                      name="decision"
                      value="APPROVED"
                      checked={reviewAction === 'APPROVED'}
                      onChange={() => setReviewAction('APPROVED')}
                    />
                    Approve (Promote to Creator)
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                    <input
                      type="radio"
                      name="decision"
                      value="REJECTED"
                      checked={reviewAction === 'REJECTED'}
                      onChange={() => setReviewAction('REJECTED')}
                    />
                    Reject
                  </label>
                </div>
              </div>

              <div style={{ marginTop: '14px' }}>
                <label htmlFor="fb" style={{ fontSize: '0.85rem', fontWeight: 600 }}>
                  Feedback to Applicant
                </label>
                <textarea
                  id="fb"
                  rows="3"
                  placeholder="Optional comments or suggestions for the applicant..."
                  value={reviewFeedback}
                  onChange={(e) => setReviewFeedback(e.target.value)}
                />
              </div>

              {reviewError && <div className="message error-message">{reviewError}</div>}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '16px' }}>
                <button
                  type="button"
                  className="secondary-button compact-button"
                  onClick={() => setReviewingApp(null)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingReview}
                  className="button-link compact-button"
                  style={{ background: reviewAction === 'APPROVED' ? '#16a34a' : '#dc2626' }}
                >
                  {submittingReview ? 'Saving...' : `Confirm ${reviewAction}`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminApplications;

