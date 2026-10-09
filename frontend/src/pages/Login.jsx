import { useState } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [message, setMessage] = useState(location.state?.message || '');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const updateField = (event) => {
    setForm({ ...form, [event.target.name]: event.target.value });
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
    <div className="auth-shell">
      <div className="auth-card-modern">
        <div className="auth-header-center">
          <Link to="/" className="brand-badge auth-brand-badge">
            <span className="brand-badge-icon">CB</span>
            <span className="brand-badge-text">Campus<strong>Brand</strong></span>
          </Link>
          <h1 className="auth-title">Welcome back</h1>
          <p className="auth-subtitle">Sign in to access your campus design and branding assets.</p>
        </div>

        {message && (
          <div className="alert-banner alert-success" style={{ marginBottom: '20px' }}>
            <span>{message}</span>
          </div>
        )}

        {error && (
          <div className="alert-banner alert-error" style={{ marginBottom: '20px' }}>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={submit} className="modern-form-stack">
          <div className="form-group-item">
            <label className="form-label" htmlFor="email-input">
              <span>Campus Email</span>
              <input
                id="email-input"
                name="email"
                type="email"
                className="form-input"
                value={form.email}
                onChange={updateField}
                placeholder="e.g. admin@campusbrand.edu"
                required
              />
            </label>
          </div>

          <div className="form-group-item">
            <label className="form-label" htmlFor="password-input">
              <span>Password</span>
              <input
                id="password-input"
                name="password"
                type="password"
                className="form-input"
                value={form.password}
                onChange={updateField}
                placeholder="••••••••"
                required
              />
            </label>
          </div>

          <button type="submit" className="button-link primary-cta auth-submit-btn" disabled={loading}>
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        <div className="auth-card-footer">
          <p>
            New to CampusBrand? <Link to="/register" className="auth-link-bold">Create an account</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
