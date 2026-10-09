import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const updateField = (event) => {
    setForm({ ...form, [event.target.name]: event.target.value });
  };

  const submit = async (event) => {
    event.preventDefault();
    setError('');

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match. Please verify both entries.');
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
      navigate('/login', { state: { message: 'Registration successful! Please sign in with your credentials.' } });
    } catch (requestError) {
      const fields = requestError.response?.data?.fields;
      setError(fields ? Object.values(fields).join(' ') : requestError.response?.data?.error || 'Unable to register account.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-shell">
      <div className="auth-card-modern">
        <div className="auth-header-center">
          <Link to="/" className="brand-badge auth-brand-badge">
            <span className="brand-badge-icon">CB</span>
            <span className="brand-badge-text">Campus<strong>Brand</strong></span>
          </Link>
          <h1 className="auth-title">Create Account</h1>
          <p className="auth-subtitle">Join the collegiate platform for official design resources.</p>
        </div>

        {error && (
          <div className="alert-banner alert-error" style={{ marginBottom: '20px' }}>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={submit} className="modern-form-stack">
          <div className="form-group-item">
            <label className="form-label" htmlFor="reg-name">
              <span>Full Name</span>
              <input
                id="reg-name"
                name="name"
                type="text"
                className="form-input"
                value={form.name}
                onChange={updateField}
                placeholder="e.g. John Doe"
                required
              />
            </label>
          </div>

          <div className="form-group-item">
            <label className="form-label" htmlFor="reg-email">
              <span>Campus Email</span>
              <input
                id="reg-email"
                name="email"
                type="email"
                className="form-input"
                value={form.email}
                onChange={updateField}
                placeholder="e.g. john@campusbrand.edu"
                required
              />
            </label>
          </div>

          <div className="form-group-item">
            <label className="form-label" htmlFor="reg-password">
              <span>Password</span>
              <input
                id="reg-password"
                name="password"
                type="password"
                className="form-input"
                value={form.password}
                onChange={updateField}
                placeholder="At least 6 characters"
                minLength="6"
                required
              />
            </label>
          </div>

          <div className="form-group-item">
            <label className="form-label" htmlFor="reg-confirm">
              <span>Confirm Password</span>
              <input
                id="reg-confirm"
                name="confirmPassword"
                type="password"
                className="form-input"
                value={form.confirmPassword}
                onChange={updateField}
                placeholder="Re-enter password"
                required
              />
            </label>
          </div>

          <button type="submit" className="button-link primary-cta auth-submit-btn" disabled={loading}>
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <div className="auth-card-footer">
          <p>
            Already have an account? <Link to="/login" className="auth-link-bold">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
