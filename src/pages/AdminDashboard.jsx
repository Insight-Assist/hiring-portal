import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../lib/AuthContext'
import { personalityTypes } from '../data/assessment'

const STATUS_COLORS = {
  New: 'bg-blue-50 text-blue-700 border-blue-200',
  Reviewed: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  Interview: 'bg-green-50 text-green-700 border-green-200',
  Hold: 'bg-orange-50 text-orange-700 border-orange-200',
  Rejected: 'bg-red-50 text-red-700 border-red-200',
}

const ALL_STATUSES = ['All', 'New', 'Reviewed', 'Interview', 'Hold', 'Rejected']

export default function AdminDashboard() {
  const { signOut } = useAuth()
  const [applicants, setApplicants] = useState([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('All')
  const [search, setSearch] = useState('')
  const [sortField, setSortField] = useState('submitted_at')
  const [sortDir, setSortDir] = useState('desc')

  useEffect(() => {
    fetchApplicants()
  }, [])

  const fetchApplicants = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('applications')
      .select('id, full_name, email, country, city_timezone, status, submitted_at, personality_dominant, exp_scribing, exp_insurance, can_work_pacific')
      .order('submitted_at', { ascending: false })

    if (!error) setApplicants(data || [])
    setLoading(false)
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
      {/* Admin Header */}
      <header className="border-b border-brand-border px-6 py-4 bg-brand-charcoal">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="font-body text-sm font-black tracking-widest uppercase"><span className="text-white">INSIGHT</span><span className="text-brand-sage font-normal">ASSIST</span></span>
            <span className="text-brand-sage-mid text-sm">· Hiring Portal</span>
          </div>
          <button
            onClick={signOut}
            className="text-sm text-gray-400 hover:text-white transition-colors"
          >
            Sign Out
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Page title + summary stats */}
        <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
          <div>
            <h1 className="font-display text-3xl text-brand-charcoal mb-1">Applicants</h1>
            <p className="text-sm text-gray-400">Remote Medical Scribe (Optometry) · Dr. Beth's Team</p>
          </div>
          <div className="flex gap-3 flex-wrap">
            {Object.entries(counts).map(([status, count]) => (
              <div key={status} className="text-center border border-brand-border px-4 py-2">
                <p className="text-lg font-display text-brand-charcoal">{count}</p>
                <p className="text-xs text-gray-400">{status}</p>
              </div>
            ))}
            <div className="text-center border border-brand-forest px-4 py-2">
              <p className="text-lg font-display text-brand-forest">{applicants.length}</p>
              <p className="text-xs text-brand-sage">Total</p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-6 items-center">
          <input
            type="text"
            className="input-field w-64 text-sm py-2"
            placeholder="Search by name, email, country..."
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

        {/* Table */}
        {loading ? (
          <div className="text-sm text-gray-400 py-12 text-center">Loading applicants...</div>
        ) : filtered.length === 0 ? (
          <div className="text-sm text-gray-400 py-12 text-center">No applicants match this filter.</div>
        ) : (
          <div className="border border-brand-border overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-brand-cream border-b border-brand-border">
                  {[
                    { label: 'Name', field: 'full_name' },
                    { label: 'Location', field: 'country' },
                    { label: 'Pacific Time', field: 'can_work_pacific' },
                    { label: 'Scribing Exp', field: 'exp_scribing' },
                    { label: 'Personality', field: 'personality_dominant' },
                    { label: 'Status', field: 'status' },
                    { label: 'Submitted', field: 'submitted_at' },
                    { label: '', field: null },
                  ].map(({ label, field }) => (
                    <th
                      key={label}
                      onClick={() => field && toggleSort(field)}
                      className={`text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide ${field ? 'cursor-pointer hover:text-brand-charcoal' : ''}`}
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
                        <p className="font-medium text-brand-charcoal">{a.full_name}</p>
                        <p className="text-xs text-gray-400">{a.email}</p>
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        <p>{a.country}</p>
                        <p className="text-xs text-gray-400">{a.city_timezone}</p>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-medium ${a.can_work_pacific === 'Yes' ? 'text-green-600' : 'text-red-500'}`}>
                          {a.can_work_pacific || '—'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-600 text-xs">{a.exp_scribing || '—'}</td>
                      <td className="px-4 py-3">
                        {pType ? (
                          <span className="inline-flex items-center gap-1.5 text-xs font-medium">
                            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: pType.color }}></span>
                            {pType.label}
                          </span>
                        ) : '—'}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-medium px-2 py-1 border rounded-sm ${STATUS_COLORS[a.status] || 'bg-gray-50 text-gray-500 border-gray-200'}`}>
                          {a.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-400">{formatDate(a.submitted_at)}</td>
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
      </main>
    </div>
  )
}
