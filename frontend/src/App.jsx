import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './hooks/useAuth'
import Protected from './components/Protected'

import LandingPage from './pages/LandingPage'
import AuthPage from './pages/AuthPage'
import OnboardingPage from './pages/OnboardingPage'
import DashboardPage from './pages/DashboardPage'
import LearningPlanPage from './pages/LearningPlanPage'
import DiscoverPage from './pages/DiscoverPage'
import VideosPage from './pages/VideosPage'
import ProgressPage from './pages/ProgressPage'
import ProfilePage from './pages/ProfilePage'
import AppLayout from './components/layout/AppLayout'
import Toast from './components/ui/Toast'

function PublicRoute({ children }) {
    const { user, loading } = useAuth()
    if (loading) return <div className="loading-screen"><div className="loading-spinner" /></div>
    if (user) return <Navigate to="/dashboard" replace />
    return children
}

export default function App() {
  return (
    <BrowserRouter>
      <Toast />
      <Routes>
        {/* Public */}
        <Route path="/" element={<PublicRoute><LandingPage /></PublicRoute>} />
        <Route path="/auth" element={<PublicRoute><AuthPage /></PublicRoute>} />

        {/* Onboarding (after auth, before plan) */}
        <Route path="/onboarding" element={<Protected><OnboardingPage /></Protected>} />

        {/* Protected App Routes */}
        <Route path="/" element={<Protected><AppLayout /></Protected>}>
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="plan" element={<LearningPlanPage />} />
          <Route path="discover" element={<DiscoverPage />} />
          <Route path="videos" element={<VideosPage />} />
          <Route path="progress" element={<ProgressPage />} />
          <Route path="profile" element={<ProfilePage />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
