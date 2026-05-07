import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from '@/hooks/useAuth'
import { Toaster } from '@/components/ui/Toaster'

import LandingPage from '@/pages/Landing'
import LoginPage from '@/pages/Login'
import SignupPage from '@/pages/Signup'
import InvitePage from '@/pages/Invite'
import DashboardPage from '@/pages/Dashboard'
import CalendarPage from '@/pages/Calendar'
import SessionsPage from '@/pages/Sessions'
import MilestonesPage from '@/pages/Milestones'
import GearPage from '@/pages/Gear'
import PartnerPage from '@/pages/Partner'
import SettingsPage from '@/pages/Settings'
import AppLayout from '@/components/shared/AppLayout'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-trail-600 text-sm animate-pulse">Loading…</div>
    </div>
  )
  if (!user) return <Navigate to="/login" replace />
  return <>{children}</>
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  if (loading) return null
  if (user) return <Navigate to="/dashboard" replace />
  return <>{children}</>
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<PublicRoute><LandingPage /></PublicRoute>} />
          <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
          <Route path="/signup" element={<PublicRoute><SignupPage /></PublicRoute>} />
          <Route path="/invite" element={<InvitePage />} />

          <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/calendar" element={<CalendarPage />} />
            <Route path="/sessions" element={<SessionsPage />} />
            <Route path="/milestones" element={<MilestonesPage />} />
            <Route path="/gear" element={<GearPage />} />
            <Route path="/partner" element={<PartnerPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <Toaster />
      </BrowserRouter>
    </AuthProvider>
  )
}
