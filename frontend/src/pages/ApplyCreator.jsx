import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

function ApplyCreator() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [existingApp, setExistingApp] = useState(null);
  const [reapplying, setReapplying] = useState(false);

  // Form state
  const [department, setDepartment] = useState('');
  const [skills, setSkills] = useState('');
  const [bio, setBio] = useState('');
  const [sampleFiles, setSampleFiles] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    checkExistingApplication();
  }, []);

  const checkExistingApplication = async () => {
    setLoading(true);
    try {
      const res = await api.get('/creator-applications/my');
      if (res.data?.hasApplication) {
        setExistingApp(res.data.application);
      }
    } catch (err) {
      console.error('Failed to check application status', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 4) {
      alert('You can upload a maximum of 4 sample files.');
      return;
    }
    setSampleFiles(files);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!department.trim() || !skills.trim() || !bio.trim()) {
      setError('Please fill in all required fields.');
      return;
    }
    setSubmitting(true);
    setError('');
    setSuccess('');

    const formData = new FormData();
    formData.append('department', department.trim());
    formData.append('skills', skills.trim());
    formData.append('bio', bio.trim());
    sampleFiles.forEach((file) => {
      formData.append('sampleFiles', file);
    });

    try {
      const res = await api.post('/creator-applications', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setExistingApp(res.data);
      setReapplying(false);
      setSuccess('Application submitted successfully! The administration will review your portfolio.');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit application. Please verify your files.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="portal-content-inner">
        <div className="empty-state" style={{ minHeight: '300px' }}>
          <strong>Checking creator application status...</strong>
        </div>
      </div>
    );
  }

  // Already Approved
  if (user?.role === 'CREATOR' || existingApp?.status === 'APPROVED') {
    return (
      <div className="portal-content-inner">
        <div style={{ background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '16px', padding: '36px', maxWidth: '640px', margin: '40px auto', textAlign: 'center' }}>
          <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: '#dcfce7', color: '#16a34a', margin: '0 auto 18px', display: 'grid', placeItems: 'center', fontSize: '1.8rem' }}>
            ✓
          </div>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#111827', margin: '0 0 10px' }}>
            You are a Verified Campus Creator!
          </h2>
          <p style={{ color: '#4b5563', lineHeight: 1.6, marginBottom: '24px' }}>
            Your application was approved by the brand administration team. You have full permissions to publish artworks, showcase your design portfolio, and participate in community features.
          </p>
          <Link to="/creator-studio" className="button-link">
            Go to Creator Studio →
          </Link>
        </div>
      </div>
    );
  }

  // Under Review (PENDING)
  if (existingApp?.status === 'PENDING' && !reapplying) {
    return (
      <div className="portal-content-inner">
        <div style={{ background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '16px', padding: '36px', maxWidth: '680px', margin: '30px auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
            <span style={{ background: '#fef3c7', color: '#b45309', padding: '6px 14px', borderRadius: '20px', fontWeight: 700, fontSize: '0.82rem', textTransform: 'uppercase' }}>
              ● Application Under Review
            </span>
            <span style={{ color: '#9ca3af', fontSize: '0.82rem' }}>
              Submitted on {new Date(existingApp.createdAt).toLocaleDateString()}
            </span>
          </div>

          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#111827', margin: '0 0 12px' }}>
            Your Creator Application is Being Reviewed
          </h2>
          <p style={{ color: '#4b5563', lineHeight: 1.6, marginBottom: '24px' }}>
            The brand administration team is currently evaluating your design samples and credentials. You will automatically receive creator access once your application is reviewed.
          </p>

          <div style={{ background: '#f9fafb', borderRadius: '12px', padding: '20px', border: '1px solid #f3f4f6' }}>
            <div style={{ marginBottom: '14px' }}>
              <span style={{ fontSize: '0.78rem', color: '#6b7280', textTransform: 'uppercase', fontWeight: 700 }}>Department</span>
              <div style={{ fontWeight: 600, color: '#111827' }}>{existingApp.department}</div>
            </div>
            <div style={{ marginBottom: '14px' }}>
              <span style={{ fontSize: '0.78rem', color: '#6b7280', textTransform: 'uppercase', fontWeight: 700 }}>Creative Skills</span>
              <div style={{ fontWeight: 600, color: '#111827' }}>{existingApp.skills}</div>
            </div>
            <div>
              <span style={{ fontSize: '0.78rem', color: '#6b7280', textTransform: 'uppercase', fontWeight: 700 }}>Bio / Creative Statement</span>
              <div style={{ color: '#374151', fontSize: '0.9rem', marginTop: '4px' }}>{existingApp.bio}</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // REJECTED with Feedback
  const isRejected = existingApp?.status === 'REJECTED';

  return (
    <div className="portal-content-inner">
      <div style={{ maxWidth: '680px', margin: '0 auto' }}>
        <p className="eyebrow">CAMPUS TALENT ONBOARDING</p>
        <h2>Apply to Become a <em>Creator</em></h2>
        <p className="intro" style={{ margin: '0 0 28px' }}>
          Showcase your original posters, illustrations, UI concepts, and brand designs to the entire campus community.
        </p>

        {isRejected && !reapplying && (
          <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '12px', padding: '20px', marginBottom: '24px' }}>
            <div style={{ color: '#991b1b', fontWeight: 700, fontSize: '0.95rem', marginBottom: '6px' }}>
              Previous Application Requires Revision
            </div>
            <p style={{ color: '#7f1d1d', fontSize: '0.88rem', margin: '0 0 14px', lineHeight: 1.5 }}>
              <strong>Admin Feedback:</strong> {existingApp.adminFeedback || 'Please provide more distinct campus design samples.'}
            </p>
            <button
              type="button"
              className="button-link compact-button"
              onClick={() => {
                setReapplying(true);
                setDepartment(existingApp.department);
                setSkills(existingApp.skills);
                setBio(existingApp.bio);
              }}
            >
              Reapply with Updated Portfolio
            </button>
          </div>
        )}

        {(!isRejected || reapplying) && (
          <div style={{ background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '16px', padding: '32px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
            <form onSubmit={handleSubmit}>
              <div>
                <label htmlFor="dept">
                  Department / Branch <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  id="dept"
                  type="text"
                  required
                  placeholder="e.g. Computer Science, Design & Media, Electrical Eng."
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                />
              </div>

              <div>
                <label htmlFor="skills">
                  Creative Skills &amp; Tools <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  id="skills"
                  type="text"
                  required
                  placeholder="e.g. Poster Design, Typography, Figma, Illustrator, 3D"
                  value={skills}
                  onChange={(e) => setSkills(e.target.value)}
                />
              </div>

              <div>
                <label htmlFor="bio">
                  Short Bio &amp; Creative Statement <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <textarea
                  id="bio"
                  rows="4"
                  required
                  placeholder="Describe your design background, interests, and what you aim to create for the campus..."
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                />
              </div>

              <div>
                <label htmlFor="samples">
                  Original Work Samples (1 to 4 files)
                </label>
                <input
                  id="samples"
                  type="file"
                  multiple
                  accept="image/png,image/jpeg,image/svg+xml,image/webp,application/pdf"
                  onChange={handleFileChange}
                />
                <small style={{ color: '#6b7280', marginTop: '4px', display: 'block' }}>
                  Supported formats: PNG, JPG, SVG, WebP, PDF (Max 4 files).
                </small>
              </div>

              {sampleFiles.length > 0 && (
                <div style={{ background: '#f9fafb', padding: '12px', borderRadius: '8px', fontSize: '0.84rem' }}>
                  <strong>Selected files ({sampleFiles.length}):</strong>
                  <ul style={{ margin: '4px 0 0', paddingLeft: '20px', color: '#4b5563' }}>
                    {sampleFiles.map((f, i) => (
                      <li key={i}>{f.name} ({(f.size / 1024).toFixed(0)} KB)</li>
                    ))}
                  </ul>
                </div>
              )}

              {error && <div className="message error-message">{error}</div>}
              {success && <div className="message success-message">{success}</div>}

              <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
                <button
                  type="submit"
                  disabled={submitting}
                  className="button-link"
                >
                  {submitting ? 'Submitting Application...' : 'Submit Application'}
                </button>
                {reapplying && (
                  <button
                    type="button"
                    className="secondary-button"
                    onClick={() => setReapplying(false)}
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

export default ApplyCreator;

