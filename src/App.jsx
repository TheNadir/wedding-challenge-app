import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { FeatureFlagsProvider } from './context/FeatureFlagsContext'
import ProtectedRoute from './components/ProtectedRoute'
import AdminRoute from './components/AdminRoute'
import Login from './pages/Login'
import AuthCallback from './pages/AuthCallback'
import Challenges from './pages/Challenges'
import Upload from './pages/Upload'
import CameraRoll from './pages/CameraRoll'
import Admin from './pages/Admin'

export default function App() {
  return (
    <FeatureFlagsProvider>
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/" element={<Login />} />
        <Route path="/auth/callback" element={<AuthCallback />} />

        {/* Protected */}
        <Route
          path="/challenges"
          element={
            <ProtectedRoute>
              <Challenges />
            </ProtectedRoute>
          }
        />
        <Route
          path="/upload/:challengeId"
          element={
            <ProtectedRoute>
              <Upload />
            </ProtectedRoute>
          }
        />
        <Route
          path="/camera-roll"
          element={
            <ProtectedRoute>
              <CameraRoll />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin"
          element={
            <AdminRoute>
              <Admin />
            </AdminRoute>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
    </FeatureFlagsProvider>
  )
}
