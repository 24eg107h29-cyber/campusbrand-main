import { useState } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState(location.state?.message || '');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const updateField = (event) => {
    setForm({ ...form, [event.target.name]: event.target.value });
  };

  const fillDemoAccount = (email, password) => {
    setForm({ email, password });
    setError('');
  };

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      const response = await api.post('/auth/login', form);
      login(response.data.user);
      const category = searchParams.get('category');
      const targetDestination = location.state?.from || (category ? `/assets?category=${category}` : '/dashboard');
      navigate(targetDestination, { replace: true });
    } catch (requestError) {
      setError(
        requestError.response?.data?.error ||
        requestError.response?.data?.message ||
        'Unable to log in. Please check your credentials.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-split-wrapper">
      <div className="auth-split-container">
        {/* Left Section: Informational Brand Architecture & Features */}
        <section className="auth-left-pane">
          <Link className="brand-mark auth-left-brand" to="/">
            <span className="brand-icon">C</span>
            <span>Campus<span>Brand</span></span>
          </Link>

          <div className="auth-left-eyebrow">
            <span className="auth-left-eyebrow-icon">✦</span> CENTRAL BRANDING & DESIGN HUB
          </div>

          <h1 className="auth-left-title">
            Your campus.<br /><em>Your identity.</em>
          </h1>

          <p className="auth-left-desc">
            A centralized institutional platform to discover, verify, and manage official university logos, event design kits, and student creative portfolios.
          </p>

          <div className="auth-features-list">
            <div className="auth-feature-item">
              <span className="auth-feature-icon">◒</span>
              <div className="auth-feature-content">
                <strong>Certified Brand Assets</strong>
                <p>High-resolution vectors, university crests, approved palettes, and typographic guidelines.</p>
              </div>
            </div>

            <div className="auth-feature-item">
              <span className="auth-feature-icon">▤</span>
              <div className="auth-feature-content">
                <strong>Event Templates & Kits</strong>
                <p>Pre-approved posters, symposium banners, and certificate layouts ready for download.</p>
              </div>
            </div>

            <div className="auth-feature-item">
              <span className="auth-feature-icon">✦</span>
              <div className="auth-feature-content">
                <strong>Creator Studio & Community</strong>
                <p>Student designers can apply to become verified Creators, publish work, and receive ratings.</p>
              </div>
            </div>
          </div>

          {/* Quick Demo Credentials Autofill Helper */}
          <div className="auth-demo-helper">
            <div className="auth-demo-title">
              <span>⚡</span> Quick Demo Access (Click to autofill)
            </div>
            <div className="auth-demo-chips">
              <button
                type="button"
                className="auth-demo-chip"
                onClick={() => fillDemoAccount('admin@campusbrand.edu', 'Admin@123')}
                title="Autofill Administrator credentials"
              >
                <span>Admin</span>
                <small>admin@campusbrand.edu</small>
              </button>
              <button
                type="button"
                className="auth-demo-chip"
                onClick={() => fillDemoAccount('creator@campusbrand.edu', 'Creator@123')}
                title="Autofill Creator credentials"
              >
                <span>Creator</span>
                <small>creator@campusbrand.edu</small>
              </button>
              <button
                type="button"
                className="auth-demo-chip"
                onClick={() => fillDemoAccount('user@campusbrand.edu', 'User@123')}
                title="Autofill Student User credentials"
              >
                <span>Student</span>
                <small>user@campusbrand.edu</small>
              </button>
            </div>
          </div>
        </section>

        {/* Right Section: Elevated Auth Card matching CampusBrand theme */}
        <div className="auth-right-pane">
          <div className="auth-box-card">
            <div className="auth-box-emblem" aria-hidden="true">
              <span>C</span>
            </div>

            <p className="auth-box-eyebrow">PORTAL AUTHENTICATION</p>
            <h2 className="auth-box-title">
              Welcome back<span className="dot">.</span>
            </h2>
            <p className="auth-box-subtitle">
              Sign in to access your campus brand workspace.
            </p>

            {message && <div className="auth-alert-msg auth-alert-success">{message}</div>}
            {error && <div className="auth-alert-msg auth-alert-error">{error}</div>}

            <form onSubmit={submit} className="auth-form">
              <div className="auth-input-group">
                <label className="auth-input-label" htmlFor="login-email">
                  Institutional Email
                </label>
                <div className="auth-input-field-wrap">
                  <input
                    id="login-email"
                    className="auth-input-field"
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={updateField}
                    placeholder="e.g. admin@campusbrand.edu"
                    autoComplete="email"
                    required
                  />
                </div>
              </div>

              <div className="auth-input-group">
                <label className="auth-input-label" htmlFor="login-password">
                  Password
                </label>
                <div className="auth-input-field-wrap">
                  <input
                    id="login-password"
                    className="auth-input-field"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={form.password}
                    onChange={updateField}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    required
                    style={{ paddingRight: '42px' }}
                  />
                  <button
                    type="button"
                    className="auth-eye-btn"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                        <line x1="1" y1="1" x2="23" y2="23" />
                      </svg>
                    ) : (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <button type="submit" className="auth-primary-btn" disabled={loading}>
                {loading ? 'Signing in...' : (
                  <>
                    Sign in <span style={{ fontSize: '1.05rem' }}>→</span>
                  </>
                )}
              </button>
            </form>

            <div className="auth-divider">
              <span>NEW TO CAMPUSBRAND?</span>
            </div>

            <Link to="/register" className="auth-secondary-btn">
              Create an account
            </Link>

            <p className="auth-box-footer">
              OFFICIAL ANURAG CAMPUS BRAND SYSTEM • SECURE ACCESS
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
