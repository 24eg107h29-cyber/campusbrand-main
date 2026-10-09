import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const categories = ['LOGO', 'POSTER', 'TEMPLATE', 'GUIDELINE', 'FONT', 'COLOR', 'OTHER'];
const ALLOWED_EXTENSIONS = ['png', 'jpg', 'jpeg', 'svg', 'pdf'];

function UploadAsset() {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const [form, setForm] = useState({ name: '', description: '', category: 'LOGO', file: null });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isAdmin) {
    return (
      <main className="auth-shell">
        <section className="auth-card">
          <p className="message error-message">Only administrators can upload assets.</p>
          <p style={{ marginTop: '16px' }}><Link to="/dashboard">Return to Dashboard</Link></p>
        </section>
      </main>
    );
  }

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    const extension = selectedFile.name.split('.').pop().toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(extension)) {
      setError(`Invalid file type (.${extension}). Only PNG, JPG, JPEG, SVG, and PDF files are supported.`);
      e.target.value = '';
      setForm({ ...form, file: null });
      return;
    }

    if (selectedFile.size > 50 * 1024 * 1024) {
      setError('File size exceeds the 50MB limit.');
      e.target.value = '';
      setForm({ ...form, file: null });
      return;
    }

    setError('');
    setForm({ ...form, file: selectedFile });
  };

  const submit = async (event) => {
    event.preventDefault();
    if (!form.file) {
      setError('Please choose a file to upload.');
      return;
    }

    const body = new FormData();
    body.append('name', form.name.trim());
    body.append('description', form.description.trim());
    body.append('category', form.category);
    body.append('file', form.file);

    setLoading(true);
    setError('');
    try {
      // Content-Type: undefined allows Axios / Browser to generate the correct multipart boundary
      await api.post('/assets', body, {
        headers: { 'Content-Type': undefined }
      });
      navigate('/assets');
    } catch (requestError) {
      setError(requestError.response?.data?.error || 'Unable to upload asset. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-shell">
      <section className="auth-card">
        <Link to="/assets">← Back to assets</Link>
        <h1 style={{ marginTop: '16px' }}>Upload asset</h1>
        {error && <p className="message error-message">{error}</p>}
        <form onSubmit={submit}>
          <label>
            Asset Name
            <input
              value={form.name}
              onChange={(event) => setForm({ ...form, name: event.target.value })}
              placeholder="e.g. University Primary Logo"
              maxLength="255"
              required
            />
          </label>
          <label>
            Description
            <textarea
              rows="3"
              value={form.description}
              onChange={(event) => setForm({ ...form, description: event.target.value })}
              placeholder="Optional notes or usage instructions"
              maxLength="2000"
            />
          </label>
          <label>
            Category
            <select
              value={form.category}
              onChange={(event) => setForm({ ...form, category: event.target.value })}
            >
              {categories.map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </select>
          </label>
          <label>
            File (PNG, JPG, SVG, PDF)
            <input
              type="file"
              accept=".png,.jpg,.jpeg,.svg,.pdf"
              onChange={handleFileChange}
              required
            />
          </label>
          <button type="submit" disabled={loading}>
            {loading ? 'Uploading...' : 'Upload Asset'}
          </button>
        </form>
      </section>
    </main>
  );
}

export default UploadAsset;
