import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';

function Register() {
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
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      await api.post('/auth/register', {
        name: form.name,
        email: form.email,
        password: form.password
      });
      navigate('/login', { state: { message: 'Registration successful. Please log in.' } });
    } catch (requestError) {
      const fields = requestError.response?.data?.fields;
      setError(fields ? Object.values(fields).join(' ') : requestError.response?.data?.error || 'Unable to register. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-shell">
      <section className="auth-card">
        <p className="eyebrow">CampusBrand</p>
        <h1>Create your account</h1>
        <p className="auth-subtitle">Join the central home for official campus design resources.</p>
        {error && <p className="message error-message">{error}</p>}
        <form onSubmit={submit}>
          <label>
            Name
            <input name="name" value={form.name} onChange={updateField} required />
          </label>
          <label>
            Email
            <input name="email" type="email" value={form.email} onChange={updateField} required />
          </label>
          <label>
            Password
            <input name="password" type="password" value={form.password} onChange={updateField} minLength="6" required />
          </label>
          <label>
            Confirm Password
            <input name="confirmPassword" type="password" value={form.confirmPassword} onChange={updateField} required />
          </label>
          <button type="submit" disabled={loading}>{loading ? 'Registering...' : 'Register'}</button>
        </form>
        <p className="auth-link">Already registered? <Link to="/login">Log in</Link></p>
      </section>
    </main>
  );
}

export default Register;
