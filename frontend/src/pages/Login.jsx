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
    <main className="auth-shell">
      <section className="auth-card">
        <p className="eyebrow">CampusBrand</p>
        <h1>Welcome back</h1>
        <p className="auth-subtitle">Sign in to access your campus brand resources.</p>

        {message && <p className="message success-message">{message}</p>}
        {error && <p className="message error-message">{error}</p>}

        <form onSubmit={submit}>
          <label>
            Email
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={updateField}
              placeholder="e.g. user@campusbrand.edu"
              required
            />
          </label>
          <label>
            Password
            <input
              name="password"
              type="password"
              value={form.password}
              onChange={updateField}
              placeholder="••••••••"
              required
            />
          </label>
          <button type="submit" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <p className="auth-link">New to CampusBrand? <Link to="/register">Create an account</Link></p>
      </section>
    </main>
  );
}

export default Login;
