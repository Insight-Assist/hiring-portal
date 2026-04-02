import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './lib/AuthContext'
import JobPosting from './pages/JobPosting'
import Apply from './pages/Apply'
import Confirmation from './pages/Confirmation'
import AdminLogin from './pages/AdminLogin'
import AdminDashboard from './pages/AdminDashboard'
import AdminApplicant from './pages/AdminApplicant'

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-brand-sage text-sm">Loading...</div>
    </div>
  )
  return user ? children : <Navigate to="/admin/login" replace />
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<JobPosting />} />
      <Route path="/apply" element={<Apply />} />
      <Route path="/confirmation" element={<Confirmation />} />
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin" element={
        <ProtectedRoute><AdminDashboard /></ProtectedRoute>
      } />
      <Route path="/admin/applicant/:id" element={
        <ProtectedRoute><AdminApplicant /></ProtectedRoute>
      } />
    </Routes>
  )
}
