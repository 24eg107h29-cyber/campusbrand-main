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
import CreativeCommunity from './pages/CreativeCommunity.jsx';
import ArtworkDetails from './pages/ArtworkDetails.jsx';
import ApplyCreator from './pages/ApplyCreator.jsx';
import CreatorStudio from './pages/CreatorStudio.jsx';
import AdminApplications from './pages/AdminApplications.jsx';
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
          path="/community"
          element={<ProtectedRoute>{withLayout(<CreativeCommunity />)}</ProtectedRoute>}
        />
        <Route
          path="/community/artworks/:id"
          element={<ProtectedRoute>{withLayout(<ArtworkDetails />)}</ProtectedRoute>}
        />
        <Route
          path="/apply-creator"
          element={<ProtectedRoute>{withLayout(<ApplyCreator />)}</ProtectedRoute>}
        />
        <Route
          path="/creator-studio"
          element={<ProtectedRoute>{withLayout(<CreatorStudio />)}</ProtectedRoute>}
        />
        <Route
          path="/admin"
          element={<ProtectedRoute requiredRole="ADMIN">{withLayout(<AdminDashboard />)}</ProtectedRoute>}
        />
        <Route
          path="/admin/applications"
          element={<ProtectedRoute requiredRole="ADMIN">{withLayout(<AdminApplications />)}</ProtectedRoute>}
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
