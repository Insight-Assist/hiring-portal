import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './lib/AuthContext'
import JobsIndex from './pages/JobsIndex'
import JobPosting from './pages/JobPosting'
import JobPostingOptical from './pages/JobPostingOptical'
import DynamicJobPosting from './pages/DynamicJobPosting'
import Apply from './pages/Apply'
import ApplyOptical from './pages/ApplyOptical'
import ApplyDynamic from './pages/ApplyDynamic'
import Confirmation from './pages/Confirmation'
import AdminLogin from './pages/AdminLogin'
import AdminDashboard from './pages/AdminDashboard'
import AdminApplicant from './pages/AdminApplicant'
import PrintApplicant from './pages/PrintApplicant'
import AdminJobsList from './pages/AdminJobsList'
import AdminJobManager from './pages/AdminJobManager'

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="text-brand-sage text-sm">Loading...</div></div>
  return user ? children : <Navigate to="/admin/login" replace />
}

export default function App() {
  return (
    <Routes>
      {/* Job listings */}
      <Route path="/" element={<JobsIndex />} />
      <Route path="/jobs" element={<JobsIndex />} />
      <Route path="/jobs/scribe" element={<JobPosting />} />
      <Route path="/jobs/optical" element={<JobPostingOptical />} />
      <Route path="/jobs/:slug" element={<DynamicJobPosting />} />

      {/* Applications */}
      <Route path="/apply" element={<Apply />} />
      <Route path="/apply/optical" element={<ApplyOptical />} />
      <Route path="/apply/dynamic/:slug" element={<ApplyDynamic />} />
      <Route path="/confirmation" element={<Confirmation />} />

      {/* Admin */}
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
      <Route path="/admin/applicant/:id" element={<ProtectedRoute><AdminApplicant /></ProtectedRoute>} />
      <Route path="/admin/print/:id" element={<ProtectedRoute><PrintApplicant /></ProtectedRoute>} />
      <Route path="/admin/jobs" element={<ProtectedRoute><AdminJobsList /></ProtectedRoute>} />
      <Route path="/admin/jobs/:id" element={<ProtectedRoute><AdminJobManager /></ProtectedRoute>} />
    </Routes>
  )
}
