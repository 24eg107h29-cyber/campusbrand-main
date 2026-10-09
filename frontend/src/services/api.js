import axios from 'axios';

export const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:8081').replace(/\/+$/, '');

if (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && API_BASE_URL.includes('localhost')) {
  console.warn(
    '[CampusBrand] Warning: Frontend is running in production, but VITE_API_URL is pointing to localhost. ' +
    'Please set VITE_API_URL in your Vercel project settings to your Render backend URL (e.g. https://your-backend.onrender.com) and redeploy.'
  );
}

const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Intercept 401 Unauthorized responses to clear stale credentials and redirect to login
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const publicPaths = ['/login', '/register', '/'];
      if (!publicPaths.includes(window.location.pathname)) {
        localStorage.removeItem('campusbrand-user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export async function downloadAssetFile(downloadPath, defaultFilename = 'download') {
  const url = downloadPath.startsWith('http') ? downloadPath : `${API_BASE_URL}${downloadPath}`;
  const response = await api.get(url, { responseType: 'blob' });
  const disposition = response.headers['content-disposition'];
  let filename = defaultFilename;
  if (disposition) {
    const match = disposition.match(/filename\*?=(?:UTF-8'')?["']?([^"';]+)["']?/i);
    if (match && match[1]) {
      filename = decodeURIComponent(match[1]);
    }
  }
  const blobUrl = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = blobUrl;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(blobUrl);
}

export default api;
