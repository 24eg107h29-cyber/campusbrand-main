import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';

function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const updateField = (event) => {
    setForm({ ...form, [event.target.name]: event.target.value });
  };

  const submit = async (event) => {
    event.preventDefault();
    setError('');

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (form.password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);
    try {
      await api.post('/auth/register', {
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password
      });
      navigate('/login', { state: { message: 'Registration successful! Please sign in.' } });
    } catch (requestError) {
      const fields = requestError.response?.data?.fields;
      setError(fields ? Object.values(fields).join(' ') : requestError.response?.data?.error || 'Unable to register. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-split-wrapper">
      <div className="auth-split-container">
        {/* Left Section: Value Proposition & Information */}
        <section className="auth-left-pane">
          <Link className="brand-mark auth-left-brand" to="/">
            <span className="brand-icon">C</span>
            <span>Campus<span>Brand</span></span>
          </Link>

          <div className="auth-left-eyebrow">
            <span className="auth-left-eyebrow-icon">✦</span> JOIN THE CREATIVE NETWORK
          </div>

          <h1 className="auth-left-title">
            Empowering every<br /><em>campus creator.</em>
          </h1>

          <p className="auth-left-desc">
            Join your college's official design hub. Access verified vectors, download publication kits, and collaborate with fellow campus designers.
          </p>

          <div className="auth-features-list">
            <div className="auth-feature-item">
              <span className="auth-feature-icon">🎓</span>
              <div className="auth-feature-content">
                <strong>Self-Service Brand Hub</strong>
                <p>Instantly download high-resolution logos, fonts, and banners for your club or department.</p>
              </div>
            </div>

            <div className="auth-feature-item">
              <span className="auth-feature-icon">🚀</span>
              <div className="auth-feature-content">
                <strong>Creator Application Path</strong>
                <p>Apply with original work samples to get approved as a Creator and showcase your portfolio.</p>
              </div>
            </div>

            <div className="auth-feature-item">
              <span className="auth-feature-icon">🛡️</span>
              <div className="auth-feature-content">
                <strong>Consistent College Identity</strong>
                <p>Maintain visual alignment across student fest posters, presentations, and digital media.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Right Section: Elevated Register Card */}
        <div className="auth-right-pane">
          <div className="auth-box-card">
            <div className="auth-box-emblem" aria-hidden="true">
              <span>C</span>
            </div>

            <p className="auth-box-eyebrow">CREATE AN ACCOUNT</p>
            <h2 className="auth-box-title">
              Get started<span className="dot">.</span>
            </h2>
            <p className="auth-box-subtitle">
              Register for your central brand workspace.
            </p>

            {error && <div className="auth-alert-msg auth-alert-error">{error}</div>}

            <form onSubmit={submit} className="auth-form">
              <div className="auth-input-group">
                <label className="auth-input-label" htmlFor="register-name">
                  Full Name
                </label>
                <div className="auth-input-field-wrap">
                  <input
                    id="register-name"
                    className="auth-input-field"
                    name="name"
                    value={form.name}
                    onChange={updateField}
                    placeholder="e.g. Alex Morgan"
                    autoComplete="name"
                    required
                  />
                </div>
              </div>

              <div className="auth-input-group">
                <label className="auth-input-label" htmlFor="register-email">
                  Institutional Email
                </label>
                <div className="auth-input-field-wrap">
                  <input
                    id="register-email"
                    className="auth-input-field"
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={updateField}
                    placeholder="e.g. student@campusbrand.edu"
                    autoComplete="email"
                    required
                  />
                </div>
              </div>

              <div className="auth-input-group">
                <label className="auth-input-label" htmlFor="register-password">
                  Password
                </label>
                <div className="auth-input-field-wrap">
                  <input
                    id="register-password"
                    className="auth-input-field"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={form.password}
                    onChange={updateField}
                    placeholder="At least 6 characters"
                    minLength="6"
                    autoComplete="new-password"
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

              <div className="auth-input-group">
                <label className="auth-input-label" htmlFor="register-confirm-password">
                  Confirm Password
                </label>
                <div className="auth-input-field-wrap">
                  <input
                    id="register-confirm-password"
                    className="auth-input-field"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={form.confirmPassword}
                    onChange={updateField}
                    placeholder="Repeat password"
                    minLength="6"
                    autoComplete="new-password"
                    required
                    style={{ paddingRight: '42px' }}
                  />
                  <button
                    type="button"
                    className="auth-eye-btn"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                  >
                    {showConfirmPassword ? (
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
                {loading ? 'Creating account...' : (
                  <>
                    Create account <span style={{ fontSize: '1.05rem' }}>→</span>
                  </>
                )}
              </button>
            </form>

            <div className="auth-divider">
              <span>ALREADY HAVE AN ACCOUNT?</span>
            </div>

            <Link to="/login" className="auth-secondary-btn">
              Sign in instead
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

export default Register;
