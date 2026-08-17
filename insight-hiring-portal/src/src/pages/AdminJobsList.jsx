import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../lib/AuthContext'

export default function AdminJobsList() {
  const { signOut } = useAuth()
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.from('jobs').select('id, title, client, location, job_type, compensation, is_open, slug, created_at')
      .order('created_at', { ascending: false })
      .then(({ data }) => { setJobs(data || []); setLoading(false) })
  }, [])

  const toggle = async (id, current) => {
    await supabase.from('jobs').update({ is_open: !current }).eq('id', id)
    setJobs(prev => prev.map(j => j.id === id ? { ...j, is_open: !current } : j))
  }

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-brand-border px-6 py-4 bg-brand-charcoal">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/admin" className="text-gray-400 hover:text-white text-sm">← Applicants</Link>
            <span className="text-gray-600">·</span>
            <span className="font-body text-sm font-black tracking-widest uppercase">
              <span className="text-white">INSIGHT</span><span className="text-brand-sage font-normal">ASSIST</span>
            </span>
          </div>
          <button onClick={signOut} className="text-sm text-gray-400 hover:text-white transition-colors">Sign Out</button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-3xl text-brand-charcoal mb-1">Job Manager</h1>
            <p className="text-sm text-gray-400">Create and manage dynamic job postings</p>
          </div>
          <Link to="/admin/jobs/new" className="btn-primary">+ New Job</Link>
        </div>

        {/* Static jobs */}
        <div className="mb-8">
          <p className="text-xs uppercase tracking-widest text-brand-sage font-medium mb-3">Existing Jobs (hardcoded)</p>
          <div className="space-y-2">
            {[
              { label: 'Remote Medical Scribe', client: "Dr. Beth's Team", url: '/jobs/scribe' },
              { label: 'Float Optical / Paraoptometric Tech', client: 'Newport Vision Source', url: '/jobs/optical' },
            ].map(j => (
              <div key={j.url} className="flex items-center justify-between border border-brand-border px-4 py-3 bg-brand-cream">
                <div>
                  <p className="text-sm font-medium text-brand-charcoal">{j.label}</p>
                  <p className="text-xs text-gray-400">{j.client} · Managed via admin dashboard</p>
                </div>
                <a href={j.url} target="_blank" rel="noreferrer" className="text-xs text-brand-sage hover:underline">View ↗</a>
              </div>
            ))}
          </div>
        </div>

        {/* Dynamic jobs */}
        <div>
          <p className="text-xs uppercase tracking-widest text-brand-sage font-medium mb-3">Dynamic Job Postings ({jobs.length})</p>
          {loading ? (
            <p className="text-sm text-gray-400">Loading...</p>
          ) : jobs.length === 0 ? (
            <div className="border-2 border-dashed border-brand-border p-10 text-center">
              <p className="font-display text-xl text-brand-charcoal mb-2">No dynamic jobs yet</p>
              <p className="text-sm text-gray-500 mb-4">Create your first job posting using the builder.</p>
              <Link to="/admin/jobs/new" className="btn-primary">Create First Job</Link>
            </div>
          ) : (
            <div className="border border-brand-border overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-brand-cream border-b border-brand-border">
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Title</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Type</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Status</th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {jobs.map(j => (
                    <tr key={j.id} className="border-b border-brand-border hover:bg-brand-cream transition-colors">
                      <td className="px-4 py-3">
                        <p className="font-medium text-brand-charcoal">{j.title}</p>
                        <p className="text-xs text-gray-400">{j.client} · /jobs/{j.slug}</p>
                      </td>
                      <td className="px-4 py-3 text-gray-500 text-xs">{j.job_type}</td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => toggle(j.id, j.is_open)}
                          className={`text-xs font-medium px-2 py-1 border rounded-sm transition-colors ${
                            j.is_open
                              ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100'
                              : 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100'
                          }`}
                        >
                          {j.is_open ? 'Open' : 'Closed'}
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3 justify-end">
                          <a href={`/jobs/${j.slug}`} target="_blank" rel="noreferrer" className="text-xs text-gray-400 hover:text-brand-sage">View ↗</a>
                          <Link to={`/admin/jobs/${j.id}`} className="text-xs text-brand-sage hover:text-brand-forest font-medium">Edit →</Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
