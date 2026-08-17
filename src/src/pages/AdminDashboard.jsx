import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../lib/AuthContext'
import { personalityTypes } from '../data/assessment'
import { getJobStatus, setJobStatus } from '../lib/jobStatus'

const STATUS_COLORS = {
  New: 'bg-blue-50 text-blue-700 border-blue-200',
  Reviewed: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  Interview: 'bg-green-50 text-green-700 border-green-200',
  Hold: 'bg-orange-50 text-orange-700 border-orange-200',
  Rejected: 'bg-red-50 text-red-700 border-red-200',
}

const ALL_STATUSES = ['All', 'New', 'Reviewed', 'Interview', 'Hold', 'Rejected']

// Static hardcoded jobs
const STATIC_JOBS = [
  { id: 'scribe', role: 'scribe', label: 'Remote Medical Scribe', client: "Dr. Beth's Team", type: 'static' },
  { id: 'optical', role: 'optical-technician', label: 'Float Optical / Paraoptometric Tech', client: 'Newport Vision Source', type: 'static' },
]

export default function AdminDashboard() {
  const { signOut } = useAuth()

  // Jobs
  const [allJobs, setAllJobs] = useState([])
  const [jobStatuses, setJobStatuses] = useState({})
  const [loadingJobs, setLoadingJobs] = useState(true)

  // Selected job
  const [selectedJob, setSelectedJob] = useState(null)

  // Applicants for selected job
  const [applicants, setApplicants] = useState([])
  const [loadingApplicants, setLoadingApplicants] = useState(false)

  // Filters
  const [statusFilter, setStatusFilter] = useState('New')
  const [search, setSearch] = useState('')
  const [sortField, setSortField] = useState('submitted_at')
  const [sortDir, setSortDir] = useState('desc')

  const [togglingRole, setTogglingRole] = useState(null)

  // Load all jobs on mount
  useEffect(() => {
    loadAllJobs()
  }, [])

  const loadAllJobs = async () => {
    const [scribs, opt, { data: dynJobs }] = await Promise.all([
      getJobStatus('scribe'),
      getJobStatus('optical-technician'),
      supabase.from('jobs').select('id, title, client, slug, is_open').order('created_at', { ascending: false })
    ])

    const staticWithStatus = [
      { ...STATIC_JOBS[0], is_open: scribs },
      { ...STATIC_JOBS[1], is_open: opt },
    ]

    const dynamicJobs = (dynJobs || []).map(j => ({
      id: j.id,
      role: `dynamic-${j.slug}`,
      label: j.title,
      client: j.client,
      slug: j.slug,
      is_open: j.is_open,
      type: 'dynamic',
    }))

    const combined = [...staticWithStatus, ...dynamicJobs]
    setAllJobs(combined)

    // Default to first open job
    const firstOpen = combined.find(j => j.is_open)
    if (firstOpen) setSelectedJob(firstOpen)
    else setSelectedJob(combined[0] || null)

    setLoadingJobs(false)
  }

  // Fetch applicants when selected job changes
  useEffect(() => {
    if (!selectedJob) return
    fetchApplicants(selectedJob)
  }, [selectedJob])

  const fetchApplicants = async (job) => {
    setLoadingApplicants(true)
    setApplicants([])

    let query = supabase
      .from('applications')
      .select('id, full_name, email, country, city_timezone, status, submitted_at, personality_dominant, can_work_pacific, recommendation, role')
      .order('submitted_at', { ascending: false })

    if (job.type === 'static') {
      if (job.role === 'scribe') {
        query = query.or('role.eq.scribe,role.is.null')
      } else {
        query = query.eq('role', job.role)
      }
    } else {
      query = query.eq('role', job.role)
    }

    const { data } = await query
    setApplicants(data || [])
    setLoadingApplicants(false)
  }

  const toggleJobStatus = async (job) => {
    setTogglingRole(job.id)
    const newStatus = !job.is_open

    if (job.type === 'static') {
      const ok = await setJobStatus(job.role, newStatus)
      if (ok) {
        setAllJobs(prev => prev.map(j => j.id === job.id ? { ...j, is_open: newStatus } : j))
        if (selectedJob?.id === job.id) setSelectedJob(prev => ({ ...prev, is_open: newStatus }))
      }
    } else {
      const { error } = await supabase.from('jobs').update({ is_open: newStatus }).eq('id', job.id)
      if (!error) {
        setAllJobs(prev => prev.map(j => j.id === job.id ? { ...j, is_open: newStatus } : j))
        if (selectedJob?.id === job.id) setSelectedJob(prev => ({ ...prev, is_open: newStatus }))
      }
    }
    setTogglingRole(null)
  }

  const filtered = applicants
    .filter(a => statusFilter === 'All' || a.status === statusFilter)
    .filter(a => {
      if (!search) return true
      const s = search.toLowerCase()
      return a.full_name?.toLowerCase().includes(s) || a.email?.toLowerCase().includes(s) || a.country?.toLowerCase().includes(s)
    })
    .sort((a, b) => {
      const av = a[sortField] || ''
      const bv = b[sortField] || ''
      return sortDir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av)
    })

  const counts = ALL_STATUSES.slice(1).reduce((acc, s) => {
    acc[s] = applicants.filter(a => a.status === s).length
    return acc
  }, {})

  const toggleSort = (field) => {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortField(field); setSortDir('asc') }
  }

  const formatDate = (iso) => {
    if (!iso) return '—'
    return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-brand-border px-6 py-4 bg-brand-charcoal">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <span className="font-body text-sm font-black tracking-widest uppercase">
            <span className="text-white">INSIGHT</span><span className="text-brand-sage font-normal">ASSIST</span>
          </span>
          <div className="flex items-center gap-5">
            <Link to="/admin/jobs" className="text-sm text-gray-400 hover:text-white transition-colors">Job Manager</Link>
            <button onClick={signOut} className="text-sm text-gray-400 hover:text-white transition-colors">Sign Out</button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

          {/* LEFT: Job selector */}
          <div className="lg:col-span-1">
            <p className="text-xs uppercase tracking-widest text-brand-sage font-medium mb-3">Positions</p>

            {loadingJobs ? (
              <p className="text-sm text-gray-400">Loading...</p>
            ) : (
              <div className="space-y-2">
                {allJobs.map(job => (
                  <div
                    key={job.id}
                    className={`border p-3 cursor-pointer transition-colors ${
                      selectedJob?.id === job.id
                        ? 'border-brand-forest bg-brand-sage-light'
                        : 'border-brand-border hover:border-brand-sage'
                    }`}
                    onClick={() => { setSelectedJob(job); setStatusFilter('New'); setSearch('') }}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-brand-charcoal leading-tight truncate">{job.label}</p>
                        {job.client && <p className="text-xs text-gray-400 mt-0.5 truncate">{job.client}</p>}
                      </div>
                      <span className={`text-xs flex-shrink-0 mt-0.5 ${job.is_open ? 'text-green-600' : 'text-red-400'}`}>
                        {job.is_open ? '●' : '○'}
                      </span>
                    </div>

                    {selectedJob?.id === job.id && (
                      <div className="mt-2 pt-2 border-t border-brand-border flex items-center justify-between">
                        <span className="text-xs text-gray-500">{job.is_open ? 'Accepting applications' : 'Position closed'}</span>
                        <button
                          onClick={e => { e.stopPropagation(); toggleJobStatus(job) }}
                          disabled={togglingRole === job.id}
                          className={`text-xs font-medium px-2 py-0.5 border transition-colors disabled:opacity-50 ${
                            job.is_open
                              ? 'border-red-200 text-red-500 hover:bg-red-50'
                              : 'border-green-200 text-green-600 hover:bg-green-50'
                          }`}
                        >
                          {togglingRole === job.id ? '...' : job.is_open ? 'Close' : 'Reopen'}
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* RIGHT: Applicants */}
          <div className="lg:col-span-3">
            {!selectedJob ? (
              <div className="flex items-center justify-center h-48 border-2 border-dashed border-brand-border">
                <p className="text-sm text-gray-400">Select a position to view applicants</p>
              </div>
            ) : (
              <>
                {/* Job header */}
                <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
                  <div>
                    <h1 className="font-display text-2xl text-brand-charcoal">{selectedJob.label}</h1>
                    {selectedJob.client && <p className="text-sm text-gray-400 mt-0.5">{selectedJob.client}</p>}
                  </div>
                  {/* Status counts for this job only */}
                  <div className="flex gap-2 flex-wrap">
                    {Object.entries(counts).map(([s, count]) => (
                      <div
                        key={s}
                        onClick={() => setStatusFilter(s)}
                        className={`text-center border px-3 py-1.5 cursor-pointer transition-colors ${
                          statusFilter === s ? 'border-brand-forest bg-brand-sage-light' : 'border-brand-border hover:border-brand-sage'
                        }`}
                      >
                        <p className="text-base font-display text-brand-charcoal leading-none">{count}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{s}</p>
                      </div>
                    ))}
                    <div
                      onClick={() => setStatusFilter('All')}
                      className={`text-center border px-3 py-1.5 cursor-pointer transition-colors ${
                        statusFilter === 'All' ? 'border-brand-forest bg-brand-sage-light' : 'border-brand-forest'
                      }`}
                    >
                      <p className="text-base font-display text-brand-forest leading-none">{applicants.length}</p>
                      <p className="text-xs text-brand-sage mt-0.5">Total</p>
                    </div>
                  </div>
                </div>

                {/* Search + status filters */}
                <div className="flex flex-wrap gap-3 mb-5 items-center">
                  <input
                    type="text"
                    className="input-field w-56 text-sm py-2"
                    placeholder="Search name, email, location..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                  />
                  <div className="flex gap-1 flex-wrap">
                    {ALL_STATUSES.map(s => (
                      <button
                        key={s}
                        onClick={() => setStatusFilter(s)}
                        className={`px-3 py-1.5 text-xs font-medium border transition-colors ${
                          statusFilter === s
                            ? 'bg-brand-forest text-white border-brand-forest'
                            : 'bg-white text-gray-500 border-brand-border hover:border-brand-sage'
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Applicant table */}
                {loadingApplicants ? (
                  <div className="text-sm text-gray-400 py-12 text-center">Loading applicants...</div>
                ) : filtered.length === 0 ? (
                  <div className="border-2 border-dashed border-brand-border py-12 text-center">
                    <p className="text-sm text-gray-400">
                      {applicants.length === 0
                        ? 'No applicants for this position yet.'
                        : `No applicants with status "${statusFilter}".`}
                    </p>
                    {applicants.length > 0 && statusFilter !== 'All' && (
                      <button onClick={() => setStatusFilter('All')} className="text-xs text-brand-sage mt-2 hover:underline">
                        Show all {applicants.length} applicants
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="border border-brand-border overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-brand-cream border-b border-brand-border">
                          {[
                            { label: 'Name', field: 'full_name' },
                            { label: 'Location', field: 'city_timezone' },
                            { label: 'Schedule', field: 'can_work_pacific' },
                            { label: 'Personality', field: 'personality_dominant' },
                            { label: 'Status', field: 'status' },
                            { label: 'Recommendation', field: 'recommendation' },
                            { label: 'Submitted', field: 'submitted_at' },
                            { label: '', field: null },
                          ].map(({ label, field }) => (
                            <th
                              key={label}
                              onClick={() => field && toggleSort(field)}
                              className={`text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap ${field ? 'cursor-pointer hover:text-brand-charcoal' : ''}`}
                            >
                              {label}
                              {sortField === field && <span className="ml-1">{sortDir === 'asc' ? '↑' : '↓'}</span>}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {filtered.map((a, i) => {
                          const pType = personalityTypes[a.personality_dominant]
                          return (
                            <tr key={a.id} className={`border-b border-brand-border hover:bg-brand-cream transition-colors ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'}`}>
                              <td className="px-4 py-3">
                                <p className="font-medium text-brand-charcoal whitespace-nowrap">{a.full_name}</p>
                                <p className="text-xs text-gray-400">{a.email}</p>
                              </td>
                              <td className="px-4 py-3 text-gray-600 text-xs">
                                <p>{a.country}</p>
                                <p className="text-gray-400">{a.city_timezone}</p>
                              </td>
                              <td className="px-4 py-3">
                                <span className={`text-xs font-medium ${a.can_work_pacific === 'Yes' ? 'text-green-600' : a.can_work_pacific === 'No' ? 'text-red-500' : 'text-gray-400'}`}>
                                  {a.can_work_pacific || '—'}
                                </span>
                              </td>
                              <td className="px-4 py-3">
                                {pType ? (
                                  <span className="inline-flex items-center gap-1.5 text-xs font-medium whitespace-nowrap">
                                    <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: pType.color }}></span>
                                    {pType.label}
                                  </span>
                                ) : '—'}
                              </td>
                              <td className="px-4 py-3">
                                <span className={`text-xs font-medium px-2 py-1 border rounded-sm whitespace-nowrap ${STATUS_COLORS[a.status] || 'bg-gray-50 text-gray-500 border-gray-200'}`}>
                                  {a.status}
                                </span>
                              </td>
                              <td className="px-4 py-3">
                                {a.recommendation ? (
                                  <span className={`text-xs font-medium px-2 py-1 border rounded-sm whitespace-nowrap ${
                                    a.recommendation === 'Strong Yes' ? 'bg-green-50 text-green-700 border-green-200' :
                                    a.recommendation === 'Yes' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                    a.recommendation === 'Maybe' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                                    a.recommendation === 'No' ? 'bg-red-50 text-red-700 border-red-200' :
                                    'bg-gray-50 text-gray-500 border-gray-200'
                                  }`}>
                                    {a.recommendation}
                                  </span>
                                ) : <span className="text-xs text-gray-300">—</span>}
                              </td>
                              <td className="px-4 py-3 text-xs text-gray-400 whitespace-nowrap">{formatDate(a.submitted_at)}</td>
                              <td className="px-4 py-3">
                                <Link
                                  to={`/admin/applicant/${a.id}`}
                                  className="text-xs text-brand-sage hover:text-brand-forest font-medium transition-colors whitespace-nowrap"
                                >
                                  View →
                                </Link>
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </>
            )}
          </div>

        </div>
      </div>
    </div>
  )
}
