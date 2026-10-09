import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function AppLayout({ children }) {
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, logout, isAdmin } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const closeSidebar = () => setMobileOpen(false);

  return (
    <div className="portal-shell-v2">
      {/* Mobile-only header (hidden on desktop) */}
      <header className="mobile-topbar-only">
        <Link className="brand-mark" to="/dashboard" onClick={closeSidebar}>
          <span className="brand-icon">C</span>
          <span>Campus<span>Brand</span></span>
        </Link>
        <button
          type="button"
          className="mobile-menu-btn"
          aria-label="Toggle navigation"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? '✕' : '☰'}
        </button>
      </header>

      {mobileOpen && (
        <div className="mobile-drawer-backdrop" onClick={closeSidebar} aria-hidden="true" />
      )}

      <div className="portal-body-single">
        {/* The SINGLE left sidebar navigation */}
        <aside className={`single-sidebar ${mobileOpen ? 'is-open' : ''}`}>
          {/* Brand mark at top of sidebar */}
          <div className="sidebar-brand-header">
            <Link className="brand-mark" to="/dashboard" onClick={closeSidebar}>
              <span className="brand-icon">C</span>
              <span>Campus<span>Brand</span></span>
            </Link>
          </div>

          <nav className="sidebar-nav-links">
            <p className="sidebar-label">Workspace</p>
            <NavLink
              to="/dashboard"
              className={({ isActive }) => (isActive ? 'active' : '')}
              onClick={closeSidebar}
            >
              <span>⌂</span>
              <span>Dashboard</span>
            </NavLink>
            <NavLink
              to="/assets"
              className={({ isActive }) => (isActive ? 'active' : '')}
              onClick={closeSidebar}
            >
              <span>▦</span>
              <span>All assets</span>
            </NavLink>
            <NavLink
              to="/categories"
              className={({ isActive }) => (isActive ? 'active' : '')}
              onClick={closeSidebar}
            >
              <span>◈</span>
              <span>Categories</span>
            </NavLink>

            {isAdmin && (
              <>
                <p className="sidebar-label sidebar-label-spaced">Administration</p>
                <NavLink
                  to="/admin"
                  end
                  className={({ isActive }) => (isActive ? 'active' : '')}
                  onClick={closeSidebar}
                >
                  <span>▦</span>
                  <span>Admin Dashboard</span>
                </NavLink>
                <NavLink
                  to="/admin/assets/upload"
                  className={({ isActive }) => (isActive ? 'active' : '')}
                  onClick={closeSidebar}
                >
                  <span>＋</span>
                  <span>Upload asset</span>
                </NavLink>
              </>
            )}
          </nav>

          <div className="sidebar-footer">
            <Link to="/profile" className="sidebar-user" onClick={closeSidebar} title="View Profile">
              <span className="avatar">{(user?.name || 'U').charAt(0).toUpperCase()}</span>
              <span>
                <strong>{user?.name || 'Account'}</strong>
                <small>{user?.role || 'USER'}</small>
              </span>
            </Link>
            <button type="button" onClick={handleLogout}>
              ↪ <span>Log out</span>
            </button>
          </div>
        </aside>

        {/* Main content pane */}
        <main className="portal-content-single">
          {children}
        </main>
      </div>
    </div>
  );
}

export default AppLayout;
