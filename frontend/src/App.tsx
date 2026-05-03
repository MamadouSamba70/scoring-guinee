import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './store/authStore'
import Layout from './components/Layout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Clients from './pages/Clients'
import Scoring from './pages/Scoring'

import Users from './pages/Users'
import Agents from './pages/Agents'
import Landing from './pages/Landing'
import ClientPortal from './pages/ClientPortal'
import History from './pages/History'
import Profile from './pages/Profile'
import Settings from './pages/Settings'

// Protected Route Component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}

function App() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={isAuthenticated ? <Navigate to="/app" replace /> : <Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/portal" element={<ClientPortal />} />
      <Route path="/mon-score" element={<ClientPortal />} />
      
      {/* Application Routes */}
      <Route
        path="/app"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="clients" element={<Clients />} />
        <Route path="agents" element={<Agents />} />
        <Route path="users" element={<Users />} />
        <Route path="scoring" element={<Scoring />} />
        <Route path="history" element={<History />} />
        <Route path="profile" element={<Profile />} />
        <Route path="settings" element={<Settings />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
