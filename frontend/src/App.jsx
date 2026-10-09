import { Navigate, Route, Routes } from 'react-router-dom';
import Dashboard from './pages/Dashboard.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Assets from './pages/Assets.jsx';
import AssetDetails from './pages/AssetDetails.jsx';
import UploadAsset from './pages/UploadAsset.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';
import Profile from './pages/Profile.jsx';
import Landing from './pages/Landing.jsx';
import Categories from './pages/Categories.jsx';
import AppLayout from './components/AppLayout.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import { AuthProvider } from './context/AuthContext.jsx';

const withLayout = (page) => <AppLayout>{page}</AppLayout>;

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/dashboard"
          element={<ProtectedRoute>{withLayout(<Dashboard />)}</ProtectedRoute>}
        />
        <Route
          path="/assets"
          element={<ProtectedRoute>{withLayout(<Assets />)}</ProtectedRoute>}
        />
        <Route
          path="/categories"
          element={<ProtectedRoute>{withLayout(<Categories />)}</ProtectedRoute>}
        />
        <Route
          path="/assets/:id"
          element={<ProtectedRoute>{withLayout(<AssetDetails />)}</ProtectedRoute>}
        />
        <Route
          path="/admin"
          element={<ProtectedRoute requiredRole="ADMIN">{withLayout(<AdminDashboard />)}</ProtectedRoute>}
        />
        <Route
          path="/admin/assets/upload"
          element={<ProtectedRoute requiredRole="ADMIN">{withLayout(<UploadAsset />)}</ProtectedRoute>}
        />
        <Route
          path="/profile"
          element={<ProtectedRoute>{withLayout(<Profile />)}</ProtectedRoute>}
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;
