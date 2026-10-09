import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Profile() {
  const { user, logout, isAdmin } = useAuth();

  return (
    <main className="details-shell">
      <Link to="/dashboard">← Back to Dashboard</Link>

      <section className="details-card" style={{ gridTemplateColumns: '1fr', maxWidth: '640px', marginTop: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
            <span
              className="avatar"
              style={{ width: '56px', height: '56px', fontSize: '1.4rem', borderRadius: '50%' }}
            >
              {(user?.name || 'U').charAt(0).toUpperCase()}
            </span>
            <div>
              <h1 style={{ fontSize: '1.8rem', marginBottom: '4px' }}>{user?.name || 'User Profile'}</h1>
              <span className="category-label" style={{ fontSize: '0.75rem' }}>
                Role: {user?.role || 'USER'}
              </span>
            </div>
          </div>

          <div style={{ display: 'grid', gap: '16px', borderTop: '1px solid #e5e6e1', paddingTop: '20px' }}>
            <div>
              <p className="eyebrow" style={{ marginBottom: '4px' }}>Full Name</p>
              <strong style={{ fontSize: '1.05rem', color: '#192033' }}>{user?.name}</strong>
            </div>

            <div>
              <p className="eyebrow" style={{ marginBottom: '4px' }}>Email Address</p>
              <strong style={{ fontSize: '1.05rem', color: '#192033' }}>{user?.email}</strong>
            </div>

            <div>
              <p className="eyebrow" style={{ marginBottom: '4px' }}>Account Status</p>
              <span style={{ color: '#17643e', fontWeight: 600, fontSize: '0.9rem' }}>
                ● Active (Session Authenticated)
              </span>
            </div>

            <div>
              <p className="eyebrow" style={{ marginBottom: '4px' }}>System Permissions</p>
              <p style={{ margin: 0, fontSize: '0.88rem', color: '#697187' }}>
                {isAdmin
                  ? 'Administrator: Upload, edit, delete, preview, download, and manage all campus assets.'
                  : 'Regular User: Browse, search, filter, preview, and download official campus branding assets.'}
              </p>
            </div>
          </div>

          <div className="card-actions" style={{ marginTop: '32px', paddingTop: '20px', borderTop: '1px solid #e5e6e1' }}>
            <Link className="button-link" to="/assets">
              Browse Assets
            </Link>
            {isAdmin && (
              <Link className="button-link secondary-button" to="/admin">
                Admin Dashboard
              </Link>
            )}
            <button
              type="button"
              className="secondary-button"
              onClick={logout}
            >
              Log out
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}

export default Profile;
