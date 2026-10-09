import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Profile() {
  const { user, logout, isAdmin } = useAuth();

  return (
    <div className="page-container">
      <nav className="details-breadcrumb">
        <Link to="/dashboard" className="back-link">
          ← Back to Workspace
        </Link>
      </nav>

      <div className="form-card-wrapper" style={{ maxWidth: '680px' }}>
        <header className="page-header-block" style={{ marginBottom: '28px' }}>
          <div>
            <span className="eyebrow-tag">ACCOUNT SETTINGS</span>
            <h1 className="page-heading">User Profile</h1>
            <p className="page-subheading">
              Account information and security role details.
            </p>
          </div>
        </header>

        <div className="profile-identity-card">
          <div className="profile-avatar-large">
            {(user?.name || 'U').charAt(0).toUpperCase()}
          </div>
          <div className="profile-identity-meta">
            <h2>{user?.name || 'Authorized Member'}</h2>
            <p>{user?.email || 'user@campusbrand.edu'}</p>
            <span className="user-role-pill" style={{ display: 'inline-block', marginTop: '6px' }}>
              ROLE: {user?.role || 'USER'}
            </span>
          </div>
        </div>

        <div className="details-specs-section" style={{ marginTop: '24px' }}>
          <h3 className="specs-section-title">SECURITY & CREDENTIALS</h3>
          <div className="spec-row">
            <span className="spec-label">Full Name</span>
            <span className="spec-value">{user?.name}</span>
          </div>
          <div className="spec-row">
            <span className="spec-label">Email Address</span>
            <span className="spec-value spec-mono">{user?.email}</span>
          </div>
          <div className="spec-row">
            <span className="spec-label">Account Status</span>
            <span className="spec-value" style={{ color: '#16a34a', fontWeight: 600 }}>
              ● Active (Session Authenticated)
            </span>
          </div>
          <div className="spec-row">
            <span className="spec-label">Permissions</span>
            <span className="spec-value">
              {isAdmin
                ? 'Full Administrator: Create, edit, delete, preview, and manage all campus assets.'
                : 'Standard Member: Browse, filter, search, preview, and download official brand resources.'}
            </span>
          </div>
        </div>

        <div className="form-submit-row" style={{ marginTop: '32px' }}>
          <Link to="/assets" className="button-link primary-cta">
            Browse Assets
          </Link>
          {isAdmin && (
            <Link to="/admin" className="button-link secondary-btn">
              Admin Dashboard
            </Link>
          )}
          <button
            type="button"
            className="button-link danger-btn"
            onClick={logout}
          >
            Sign out
          </button>
        </div>
      </div>
    </div>
  );
}
