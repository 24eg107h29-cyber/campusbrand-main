import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function AppLayout({ children }) {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, logout, isAdmin } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const closeMenu = () => setMenuOpen(false);

  return (
    <div className="portal-shell">
      <header className="topbar">
        <Link className="brand-mark" to="/dashboard" onClick={closeMenu}>
          <span className="brand-icon">C</span>
          <span>Campus<span>Brand</span></span>
        </Link>
        <nav className={`topnav ${menuOpen ? 'is-open' : ''}`}>
          <NavLink to="/dashboard" onClick={closeMenu}>Home</NavLink>
          <NavLink to="/assets" onClick={closeMenu}>Assets</NavLink>
          <Link to="/dashboard#categories" onClick={closeMenu}>Categories</Link>
          {isAdmin && <NavLink to="/admin" onClick={closeMenu}>Admin Dashboard</NavLink>}
          <div className="mobile-nav-actions">
            <Link to="/profile" onClick={closeMenu}>{user?.name || 'Account'}</Link>
            <button type="button" onClick={handleLogout}>Log out</button>
          </div>
        </nav>
        <div className="topbar-account">
          <Link to="/profile" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }} title="View profile">
            <span className="avatar">{(user?.name || 'U').charAt(0).toUpperCase()}</span>
            <span className="account-name">{user?.name || 'Account'}</span>
          </Link>
          <button type="button" className="logout-button" onClick={handleLogout}>Log out</button>
        </div>
        <button type="button" className="menu-toggle" aria-label="Toggle navigation" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? '×' : '☰'}
        </button>
      </header>
      <div className="portal-body">
        <aside className="sidebar">
          <p className="sidebar-label">Workspace</p>
          <NavLink to="/dashboard">⌂ <span>Dashboard</span></NavLink>
          <NavLink to="/assets">▦ <span>All assets</span></NavLink>
          <Link to="/dashboard#categories">◈ <span>Categories</span></Link>
          {isAdmin && (
            <>
              <p className="sidebar-label sidebar-label-spaced">Administration</p>
              <NavLink to="/admin">▦ <span>Admin Dashboard</span></NavLink>
              <NavLink to="/admin/assets/upload">＋ <span>Upload asset</span></NavLink>
            </>
          )}
          <div className="sidebar-footer">
            <Link to="/profile" className="sidebar-user" style={{ textDecoration: 'none' }} title="View Profile">
              <span className="avatar">{(user?.name || 'U').charAt(0).toUpperCase()}</span>
              <span>
                <strong>{user?.name || 'Account'}</strong>
                <small>{user?.role || 'USER'}</small>
              </span>
            </Link>
            <button type="button" onClick={handleLogout}>↪ <span>Log out</span></button>
          </div>
        </aside>
        <main className="portal-content">{children}</main>
      </div>
    </div>
  );
}

export default AppLayout;
