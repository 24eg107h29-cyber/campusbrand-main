import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function AppLayout({ children }) {
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, logout, isAdmin } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const closeSidebar = () => setMobileOpen(false);

  return (
    <div className="app-shell">
      {/* Mobile Top Header - ONLY brand and drawer toggle for small screens */}
      <header className="mobile-header">
        <Link to="/dashboard" className="brand-badge" onClick={closeSidebar}>
          <span className="brand-badge-icon">CB</span>
          <span className="brand-badge-text">Campus<strong>Brand</strong></span>
        </Link>
        <button
          type="button"
          className="mobile-toggle-btn"
          aria-label="Toggle navigation"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          ) : (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          )}
        </button>
      </header>

      {/* Backdrop overlay for mobile drawer */}
      {mobileOpen && (
        <div className="mobile-overlay" onClick={closeSidebar} aria-hidden="true" />
      )}

      {/* Persistent Left Sidebar */}
      <aside className={`app-sidebar ${mobileOpen ? 'is-open' : ''}`}>
        {/* Brand Header */}
        <div className="sidebar-brand-section">
          <Link to="/dashboard" className="brand-badge" onClick={closeSidebar}>
            <span className="brand-badge-icon">CB</span>
            <div className="brand-badge-details">
              <span className="brand-badge-text">Campus<strong>Brand</strong></span>
              <span className="brand-badge-subtitle">Design Portal</span>
            </div>
          </Link>
        </div>

        {/* Navigation Sections */}
        <nav className="sidebar-nav">
          <div className="nav-group">
            <span className="nav-group-title">WORKSPACE</span>
            <NavLink
              to="/dashboard"
              className={({ isActive }) => `nav-item ${isActive ? 'is-active' : ''}`}
              onClick={closeSidebar}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
              <span>Dashboard</span>
            </NavLink>
            <NavLink
              to="/assets"
              className={({ isActive }) => `nav-item ${isActive ? 'is-active' : ''}`}
              onClick={closeSidebar}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="7" height="7" rx="1" />
                <rect x="14" y="3" width="7" height="7" rx="1" />
                <rect x="14" y="14" width="7" height="7" rx="1" />
                <rect x="3" y="14" width="7" height="7" rx="1" />
              </svg>
              <span>All Assets</span>
            </NavLink>
            <NavLink
              to="/categories"
              className={({ isActive }) => `nav-item ${isActive ? 'is-active' : ''}`}
              onClick={closeSidebar}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
              </svg>
              <span>Categories</span>
            </NavLink>
          </div>

          {isAdmin && (
            <div className="nav-group">
              <span className="nav-group-title">ADMINISTRATION</span>
              <NavLink
                to="/admin"
                end
                className={({ isActive }) => `nav-item ${isActive ? 'is-active' : ''}`}
                onClick={closeSidebar}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
                <span>Admin Dashboard</span>
              </NavLink>
              <NavLink
                to="/admin/assets/upload"
                className={({ isActive }) => `nav-item ${isActive ? 'is-active' : ''}`}
                onClick={closeSidebar}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
                <span>Upload Asset</span>
              </NavLink>
            </div>
          )}
        </nav>

        {/* Sidebar Footer: User Account and Logout */}
        <div className="sidebar-footer">
          <Link to="/profile" className="sidebar-user-card" onClick={closeSidebar} title="View account profile">
            <span className="user-avatar-badge">
              {(user?.name || 'U').charAt(0).toUpperCase()}
            </span>
            <div className="user-meta">
              <span className="user-name">{user?.name || 'Account'}</span>
              <span className="user-role-pill">{user?.role || 'USER'}</span>
            </div>
          </Link>

          <button
            type="button"
            className="sidebar-logout-btn"
            onClick={handleLogout}
            title="Sign out of CampusBrand"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            <span>Sign out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="app-main-content">
        <div className="main-content-inner">
          {children}
        </div>
      </main>
    </div>
  );
}
