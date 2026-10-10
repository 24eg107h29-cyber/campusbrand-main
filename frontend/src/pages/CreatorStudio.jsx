import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import AssetPreview from '../components/AssetPreview';
import StarRating from '../components/StarRating';
import { useAuth } from '../context/AuthContext';

const ARTWORK_CATEGORIES = ['Branding', 'Poster', 'Illustration', 'UI/UX', 'Photography', 'Other'];

function CreatorStudio() {
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState('artworks'); // 'artworks' | 'upload' | 'profile'
  const [profile, setProfile] = useState(null);
  const [myArtworks, setMyArtworks] = useState([]);
  const [loading, setLoading] = useState(true);

  // Upload form state
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Branding');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState('');
  const [uploadError, setUploadError] = useState('');

  // Profile edit form state
  const [displayName, setDisplayName] = useState('');
  const [department, setDepartment] = useState('');
  const [bio, setBio] = useState('');
  const [skills, setSkills] = useState('');
  const [portfolioUrl, setPortfolioUrl] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMessage, setProfileMessage] = useState('');

  useEffect(() => {
    fetchStudioData();
  }, []);

  const fetchStudioData = async () => {
    setLoading(true);
    try {
      const [pRes, aRes] = await Promise.all([
        api.get('/creators/me'),
        api.get('/artworks/my')
      ]);
      setProfile(pRes.data);
      setDisplayName(pRes.data?.displayName || user?.name || '');
      setDepartment(pRes.data?.department || '');
      setBio(pRes.data?.bio || '');
      setSkills(pRes.data?.skills || '');
      setPortfolioUrl(pRes.data?.portfolioUrl || '');

      setMyArtworks(aRes.data || []);
    } catch (err) {
      console.error('Failed to load creator studio data', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      setFile(selected);
      if (selected.type.startsWith('image/')) {
        setFilePreview(URL.createObjectURL(selected));
      } else {
        setFilePreview(null);
      }
    }
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setUploadError('Please select a file to upload.');
      return;
    }
    setUploading(true);
    setUploadError('');
    setUploadSuccess('');

    const formData = new FormData();
    formData.append('title', title.trim());
    formData.append('category', category);
    formData.append('description', description.trim());
    formData.append('file', file);

    try {
      const res = await api.post('/artworks', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setMyArtworks([res.data, ...myArtworks]);
      setUploadSuccess('Artwork published to Creative Community successfully!');
      setTitle('');
      setDescription('');
      setFile(null);
      setFilePreview(null);
      setTimeout(() => setActiveTab('artworks'), 1500);
    } catch (err) {
      setUploadError(err.response?.data?.error || 'Failed to publish artwork.');
    } finally {
      setUploading(false);
    }
  };

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    setProfileMessage('');
    try {
      const res = await api.put('/creators/me', {
        displayName: displayName.trim(),
        department: department.trim(),
        bio: bio.trim(),
        skills: skills.trim(),
        portfolioUrl: portfolioUrl.trim()
      });
      setProfile(res.data);
      setProfileMessage('Creator profile updated successfully!');
    } catch (err) {
      setProfileMessage('Failed to update profile.');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleDeleteArtwork = async (artId) => {
    if (!window.confirm('Are you sure you want to delete this artwork?')) return;
    try {
      await api.delete(`/artworks/${artId}`);
      setMyArtworks(myArtworks.filter((a) => a.id !== artId));
    } catch (err) {
      alert('Failed to delete artwork.');
    }
  };

  if (loading) {
    return (
      <div className="portal-content-inner">
        <div className="empty-state" style={{ minHeight: '300px' }}>
          <strong>Loading Creator Studio...</strong>
        </div>
      </div>
    );
  }

  return (
    <div className="portal-content-inner">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <p className="eyebrow">CREATOR WORKSPACE</p>
          <h2>Creator <em>Studio</em></h2>
          <p className="intro" style={{ margin: 0 }}>
            Manage your design portfolio, publish original campus artworks, and review community feedback.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            type="button"
            className={activeTab === 'upload' ? 'button-link compact-button' : 'secondary-button compact-button'}
            onClick={() => setActiveTab('upload')}
          >
            ＋ Publish Artwork
          </button>
        </div>
      </div>

      {/* Creator Profile Summary Bar */}
      <div style={{ background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '16px', padding: '22px 26px', margin: '24px 0', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '54px', height: '54px', borderRadius: '50%', background: '#ede9fe', color: '#6366f1', display: 'grid', placeItems: 'center', fontSize: '1.4rem', fontWeight: 800 }}>
            {(profile?.displayName || user?.name || 'C').charAt(0).toUpperCase()}
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: '#111827' }}>
                {profile?.displayName || user?.name}
              </h3>
              <span style={{ fontSize: '0.72rem', background: '#eef2ff', color: '#6366f1', padding: '2px 8px', borderRadius: '12px', fontWeight: 700 }}>
                Verified Creator
              </span>
            </div>
            <div style={{ fontSize: '0.84rem', color: '#6b7280', marginTop: '3px' }}>
              {profile?.department || 'Design Department'} • {profile?.skills || 'Design & Illustration'}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '28px', alignItems: 'center' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#111827' }}>{myArtworks.length}</div>
            <div style={{ fontSize: '0.75rem', color: '#9ca3af', textTransform: 'uppercase', fontWeight: 600 }}>Artworks</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#f59e0b' }}>
              {profile?.averageRating > 0 ? profile.averageRating.toFixed(1) : '–'}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#9ca3af', textTransform: 'uppercase', fontWeight: 600 }}>Avg Rating</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '10px', borderBottom: '1px solid #e5e7eb', paddingBottom: '12px', marginBottom: '24px' }}>
        <button
          type="button"
          className={activeTab === 'artworks' ? 'button-link compact-button' : 'secondary-button compact-button'}
          onClick={() => setActiveTab('artworks')}
        >
          My Portfolio ({myArtworks.length})
        </button>
        <button
          type="button"
          className={activeTab === 'upload' ? 'button-link compact-button' : 'secondary-button compact-button'}
          onClick={() => setActiveTab('upload')}
        >
          Publish Artwork
        </button>
        <button
          type="button"
          className={activeTab === 'profile' ? 'button-link compact-button' : 'secondary-button compact-button'}
          onClick={() => setActiveTab('profile')}
        >
          Creator Settings
        </button>
      </div>

      {/* TAB 1: Artworks */}
      {activeTab === 'artworks' && (
        <div>
          {myArtworks.length === 0 ? (
            <div className="empty-state" style={{ minHeight: '300px', background: '#ffffff', border: '1px dashed #d1d5db', borderRadius: '14px' }}>
              <span style={{ fontSize: '2rem' }}>✎</span>
              <strong>No artworks published yet</strong>
              <p style={{ color: '#6b7280', margin: '6px 0 16px' }}>
                Upload your first poster, illustration, or brand concept to show the campus community.
              </p>
              <button
                type="button"
                className="button-link compact-button"
                onClick={() => setActiveTab('upload')}
              >
                Publish Your First Artwork
              </button>
            </div>
          ) : (
            <div className="asset-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '22px' }}>
              {myArtworks.map((art) => (
                <div
                  key={art.id}
                  style={{
                    background: '#ffffff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '14px',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
                  }}
                >
                  <div style={{ height: '180px', background: '#fafafa', position: 'relative' }}>
                    <AssetPreview
                      previewUrl={art.previewUrl}
                      fileName={art.fileName}
                      assetName={art.title}
                      aspectRatio="auto"
                    />
                    <span style={{ position: 'absolute', top: '10px', left: '10px', background: '#111827e6', color: '#ffffff', fontSize: '0.7rem', fontWeight: 600, padding: '3px 8px', borderRadius: '6px', textTransform: 'uppercase' }}>
                      {art.category}
                    </span>
                  </div>
                  <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: '0 0 6px', color: '#111827' }}>
                      {art.title}
                    </h3>
                    <div style={{ marginBottom: '12px' }}>
                      <StarRating rating={art.averageRating} count={art.ratingCount} size="sm" />
                    </div>
                    <div style={{ display: 'flex', gap: '8px', marginTop: 'auto' }}>
                      <Link
                        to={`/community/artworks/${art.id}`}
                        className="secondary-button compact-button"
                        style={{ flex: 1, textAlign: 'center', fontSize: '0.8rem' }}
                      >
                        View Page
                      </Link>
                      <button
                        type="button"
                        className="secondary-button compact-button"
                        style={{ color: '#dc2626', fontSize: '0.8rem' }}
                        onClick={() => handleDeleteArtwork(art.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: Upload Artwork */}
      {activeTab === 'upload' && (
        <div style={{ maxWidth: '640px', background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '16px', padding: '32px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
          <h3 style={{ fontSize: '1.4rem', fontWeight: 800, margin: '0 0 8px', color: '#111827' }}>
            Publish New Artwork
          </h3>
          <p style={{ color: '#6b7280', fontSize: '0.88rem', margin: '0 0 24px' }}>
            Add your creative work to the public Creative Community page for students and faculty to explore.
          </p>

          <form onSubmit={handleUploadSubmit}>
            <div>
              <label htmlFor="artTitle">Artwork Title *</label>
              <input
                id="artTitle"
                type="text"
                required
                placeholder="e.g. Innovision 2026 Key Visual"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div>
              <label htmlFor="artCategory">Category *</label>
              <select
                id="artCategory"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                {ARTWORK_CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="artDesc">Description</label>
              <textarea
                id="artDesc"
                rows="3"
                placeholder="Tell the story or concept behind this artwork..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div>
              <label htmlFor="artFile">Artwork File (Image or PDF) *</label>
              <input
                id="artFile"
                type="file"
                required
                accept="image/png,image/jpeg,image/svg+xml,image/webp,image/gif,application/pdf"
                onChange={handleFileSelect}
              />
              <small style={{ color: '#6b7280', marginTop: '4px', display: 'block' }}>
                PNG, JPG, SVG, WebP, GIF, or PDF formats up to 50MB.
              </small>
            </div>

            {filePreview && (
              <div style={{ marginTop: '10px', textAlign: 'center', background: '#f9fafb', padding: '12px', borderRadius: '8px' }}>
                <span style={{ fontSize: '0.78rem', color: '#6b7280', display: 'block', marginBottom: '8px' }}>Preview:</span>
                <img src={filePreview} alt="Preview" style={{ maxHeight: '180px', borderRadius: '6px' }} />
              </div>
            )}

            {uploadError && <div className="message error-message">{uploadError}</div>}
            {uploadSuccess && <div className="message success-message">{uploadSuccess}</div>}

            <button
              type="submit"
              disabled={uploading}
              className="button-link"
              style={{ marginTop: '10px' }}
            >
              {uploading ? 'Publishing to Community...' : 'Publish Artwork'}
            </button>
          </form>
        </div>
      )}

      {/* TAB 3: Profile Settings */}
      {activeTab === 'profile' && (
        <div style={{ maxWidth: '640px', background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '16px', padding: '32px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
          <h3 style={{ fontSize: '1.4rem', fontWeight: 800, margin: '0 0 8px', color: '#111827' }}>
            Creator Profile &amp; Bio
          </h3>
          <p style={{ color: '#6b7280', fontSize: '0.88rem', margin: '0 0 24px' }}>
            This information is shown to campus users visiting your artwork pages.
          </p>

          <form onSubmit={handleProfileSave}>
            <div>
              <label htmlFor="pName">Display Name *</label>
              <input
                id="pName"
                type="text"
                required
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
              />
            </div>

            <div>
              <label htmlFor="pDept">Department / Affiliation</label>
              <input
                id="pDept"
                type="text"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
              />
            </div>

            <div>
              <label htmlFor="pSkills">Creative Skills</label>
              <input
                id="pSkills"
                type="text"
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
              />
            </div>

            <div>
              <label htmlFor="pBio">Bio Statement</label>
              <textarea
                id="pBio"
                rows="4"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
              />
            </div>

            <div>
              <label htmlFor="pUrl">Portfolio / Social URL</label>
              <input
                id="pUrl"
                type="url"
                placeholder="https://..."
                value={portfolioUrl}
                onChange={(e) => setPortfolioUrl(e.target.value)}
              />
            </div>

            {profileMessage && (
              <div className={`message ${profileMessage.includes('success') ? 'success-message' : 'error-message'}`}>
                {profileMessage}
              </div>
            )}

            <button
              type="submit"
              disabled={savingProfile}
              className="button-link"
              style={{ marginTop: '10px' }}
            >
              {savingProfile ? 'Saving...' : 'Save Profile'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

export default CreatorStudio;

