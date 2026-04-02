import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { personalityTypes } from '../data/assessment'
import { trialTask } from '../data/trialTask'

const STATUS_OPTIONS = ['New', 'Reviewed', 'Interview', 'Hold', 'Rejected']
const STATUS_COLORS = {
  New: 'bg-blue-50 text-blue-700 border-blue-200',
  Reviewed: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  Interview: 'bg-green-50 text-green-700 border-green-200',
  Hold: 'bg-orange-50 text-orange-700 border-orange-200',
  Rejected: 'bg-red-50 text-red-700 border-red-200',
}

export default function AdminApplicant() {
  const { id } = useParams()
  const [applicant, setApplicant] = useState(null)
  const [loading, setLoading] = useState(true)
  const [resumeUrl, setResumeUrl] = useState(null)
  const [notes, setNotes] = useState('')
  const [status, setStatus] = useState('')
  const [recommendation, setRecommendation] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [taskScores, setTaskScores] = useState({})
  const [totalScore, setTotalScore] = useState(null)

  useEffect(() => {
    fetchApplicant()
  }, [id])

  const fetchApplicant = async () => {
    const { data, error } = await supabase
      .from('applications')
      .select('*')
      .eq('id', id)
      .single()

    if (!error && data) {
      setApplicant(data)
      setNotes(data.internal_notes || '')
      setStatus(data.status || 'New')
      setRecommendation(data.recommendation || '')

      // Get resume URL
      if (data.resume_path) {
        const { data: urlData } = supabase.storage
          .from('resumes')
          .getPublicUrl(data.resume_path)
        setResumeUrl(urlData?.publicUrl)
      }

      // Restore saved scores
      if (data.task_scores) {
        setTaskScores(data.task_scores)
        setTotalScore(Object.values(data.task_scores).reduce((a, b) => a + Number(b), 0))
      }
    }
    setLoading(false)
  }

  const saveChanges = async () => {
    setSaving(true)
    const { error } = await supabase
      .from('applications')
      .update({
        status,
        internal_notes: notes,
        recommendation,
        task_scores: taskScores,
      })
      .eq('id', id)

    if (!error) {
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    }
    setSaving(false)
  }

  const updateScore = (qId, val) => {
    const updated = { ...taskScores, [qId]: val }
    setTaskScores(updated)
    setTotalScore(Object.values(updated).reduce((a, b) => a + Number(b || 0), 0))
  }

  const formatDate = (iso) => iso
    ? new Date(iso).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })
    : '—'

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-sm text-gray-400">Loading applicant...</p>
    </div>
  )

  if (!applicant) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-sm text-red-400">Applicant not found.</p>
    </div>
  )

  const pDominant = personalityTypes[applicant.personality_dominant]
  const pSecondary = personalityTypes[applicant.personality_secondary]
  const taskResponses = applicant.trial_task_responses || {}

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-brand-border px-6 py-4 bg-brand-charcoal">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/admin" className="text-gray-400 hover:text-white text-sm transition-colors">← All Applicants</Link>
            <span className="text-gray-600">·</span>
            <span className="text-white text-sm font-medium">{applicant.full_name}</span>
          </div>
          <div className="flex items-center gap-3">
            {saved && <span className="text-brand-sage text-xs">Saved ✓</span>}
            <button
              onClick={saveChanges}
              disabled={saving}
              className="bg-brand-sage text-white px-4 py-2 text-sm hover:bg-brand-forest transition-colors disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* LEFT COLUMN: Candidate summary + controls */}
          <div className="lg:col-span-1 space-y-5">

            {/* Quick summary card */}
            <div className="border border-brand-border p-5">
              <div className="flex items-start justify-between gap-2 mb-4">
                <h1 className="font-display text-2xl text-brand-charcoal leading-tight">{applicant.full_name}</h1>
                <span className={`text-xs font-medium px-2 py-1 border rounded-sm flex-shrink-0 ${STATUS_COLORS[status]}`}>
                  {status}
                </span>
              </div>
              <div className="space-y-1.5 text-sm text-gray-500">
                <p>{applicant.email}</p>
                {applicant.phone && <p>{applicant.phone}</p>}
                <p>{applicant.city_timezone}</p>
                <p>{applicant.country}</p>
                {applicant.linkedin_url && (
                  <a href={applicant.linkedin_url} target="_blank" rel="noreferrer" className="text-brand-sage hover:underline block truncate text-xs">
                    {applicant.linkedin_url}
                  </a>
                )}
              </div>
              <div className="mt-4 pt-4 border-t border-brand-border text-xs text-gray-400">
                Submitted {formatDate(applicant.submitted_at)}
              </div>
            </div>

            {/* Eligibility */}
            <div className="border border-brand-border p-5">
              <p className="text-xs uppercase tracking-widest text-brand-sage font-medium mb-3">Eligibility</p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Pacific Time</span>
                  <span className={`font-medium ${applicant.can_work_pacific === 'Yes' ? 'text-green-600' : 'text-red-500'}`}>
                    {applicant.can_work_pacific || '—'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">English</span>
                  <span className="font-medium text-brand-charcoal">{applicant.english_proficiency || '—'}</span>
                </div>
              </div>
            </div>

            {/* Experience */}
            <div className="border border-brand-border p-5">
              <p className="text-xs uppercase tracking-widest text-brand-sage font-medium mb-3">Experience</p>
              <div className="space-y-2 text-sm">
                {[
                  { label: 'Scribing', value: applicant.exp_scribing },
                  { label: 'Insurance', value: applicant.exp_insurance },
                  { label: 'Billing', value: applicant.exp_billing },
                  { label: 'Admin', value: applicant.exp_admin },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between">
                    <span className="text-gray-500">{label}</span>
                    <span className="font-medium text-brand-charcoal text-xs">{value || '—'}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Personality */}
            {pDominant && (
              <div className="border border-brand-border p-5">
                <p className="text-xs uppercase tracking-widest text-brand-sage font-medium mb-3">Personality</p>
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: pDominant.color }}></span>
                  <span className="font-medium text-brand-charcoal">{pDominant.label}</span>
                  <span className="text-xs text-gray-400">{pDominant.subtitle}</span>
                </div>
                {pSecondary && (
                  <div className="flex items-center gap-2 mt-1">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: pSecondary.color }}></span>
                    <span className="text-sm text-gray-500">{pSecondary.label}</span>
                    <span className="text-xs text-gray-400">(secondary)</span>
                  </div>
                )}
                {applicant.personality_scores && (
                  <div className="mt-4 space-y-1.5">
                    {Object.entries(applicant.personality_scores).map(([key, val]) => {
                      const pt = personalityTypes[key]
                      const pct = Math.round((val / 20) * 100)
                      return (
                        <div key={key}>
                          <div className="flex justify-between text-xs text-gray-500 mb-0.5">
                            <span>{pt?.label}</span>
                            <span>{val}/20</span>
                          </div>
                          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all"
                              style={{ width: `${pct}%`, backgroundColor: pt?.color }}
                            />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Status + Admin controls */}
            <div className="border border-brand-border p-5 space-y-4">
              <div>
                <p className="text-xs uppercase tracking-widest text-brand-sage font-medium mb-2">Status</p>
                <select
                  className="input-field text-sm"
                  value={status}
                  onChange={e => setStatus(e.target.value)}
                >
                  {STATUS_OPTIONS.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <p className="text-xs uppercase tracking-widest text-brand-sage font-medium mb-2">Recommendation</p>
                <select
                  className="input-field text-sm"
                  value={recommendation}
                  onChange={e => setRecommendation(e.target.value)}
                >
                  <option value="">—</option>
                  <option>Strong Yes</option>
                  <option>Yes</option>
                  <option>Maybe</option>
                  <option>No</option>
                </select>
              </div>
              {resumeUrl && (
                <div>
                  <p className="text-xs uppercase tracking-widest text-brand-sage font-medium mb-2">Resume</p>
                  <a
                    href={resumeUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm text-brand-sage hover:text-brand-forest underline"
                  >
                    Open Resume ↗
                  </a>
                </div>
              )}
            </div>

          </div>

          {/* RIGHT COLUMN: Application content */}
          <div className="lg:col-span-2 space-y-8">

            {/* Short answers */}
            <Section title="Short Answer Responses">
              <div className="space-y-5">
                <ResponseBlock label="Why are you interested in this role?" value={applicant.why_interested} />
                <ResponseBlock label="What makes you good at supporting a provider and reducing mental load?" value={applicant.why_good_fit} />
              </div>
            </Section>

            {/* Trial Task */}
            <Section title="Trial Task Responses">
              <div className="mb-4 flex items-center justify-between">
                <p className="text-sm text-gray-500">Score each response using the rubric below. Total is out of 100 points.</p>
                {totalScore !== null && (
                  <div className="text-right">
                    <span className="text-2xl font-display text-brand-charcoal">{totalScore}</span>
                    <span className="text-sm text-gray-400">/100</span>
                  </div>
                )}
              </div>

              <div className="space-y-8">
                {trialTask.questions.map((q, qi) => {
                  const qKey = `q${qi + 1}`
                  const response = qi < 3 ? taskResponses[qKey] : null
                  const priorityIds = taskResponses.q4 || []
                  const priorityItems = trialTask.questions[3].items
                  const maxPts = q.rubric.maxPoints

                  return (
                    <div key={q.id} className="border border-brand-border p-5">
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <p className="text-xs uppercase tracking-widest text-brand-sage font-medium">Question {qi + 1}</p>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <label className="text-xs text-gray-400">Score:</label>
                          <input
                            type="number"
                            min="0"
                            max={maxPts}
                            className="w-16 border border-brand-border px-2 py-1 text-sm text-center focus:outline-none focus:border-brand-sage"
                            value={taskScores[qKey] ?? ''}
                            onChange={e => updateScore(qKey, e.target.value)}
                          />
                          <span className="text-xs text-gray-400">/ {maxPts}</span>
                        </div>
                      </div>

                      <p className="text-sm font-medium text-brand-charcoal mb-3 leading-relaxed">{q.prompt}</p>

                      {/* Candidate response */}
                      {qi < 3 && (
                        <div className="bg-brand-cream p-4 mb-4 text-sm text-brand-charcoal leading-relaxed whitespace-pre-wrap min-h-[60px]">
                          {response || <span className="text-gray-400 italic">No response</span>}
                        </div>
                      )}

                      {/* Prioritization response */}
                      {qi === 3 && (
                        <div className="bg-brand-cream p-4 mb-4">
                          {priorityIds.length > 0 ? (
                            <ol className="space-y-1">
                              {priorityIds.map((pid, idx) => {
                                const item = priorityItems.find(i => i.id === pid)
                                return (
                                  <li key={pid} className="text-sm text-brand-charcoal flex gap-2">
                                    <span className="text-brand-sage font-medium">{idx + 1}.</span>
                                    {item?.text}
                                  </li>
                                )
                              })}
                            </ol>
                          ) : <span className="text-gray-400 italic text-sm">No response</span>}
                          {taskResponses.q4_reasoning && (
                            <div className="mt-3 pt-3 border-t border-brand-border">
                              <p className="text-xs text-gray-500 mb-1">Reasoning:</p>
                              <p className="text-sm text-brand-charcoal">{taskResponses.q4_reasoning}</p>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Rubric */}
                      <details className="text-xs">
                        <summary className="text-brand-sage cursor-pointer hover:text-brand-forest font-medium">View Scoring Rubric</summary>
                        <div className="mt-3 space-y-1.5 pl-2">
                          {q.rubric.keyItems?.map((item, i) => (
                            <div key={i} className="flex justify-between gap-2 text-gray-600">
                              <span>• {item.item}</span>
                              <span className="flex-shrink-0 font-medium text-brand-charcoal">+{item.points}</span>
                            </div>
                          ))}
                          {q.rubric.bonusItems?.map((item, i) => (
                            <div key={i} className="flex justify-between gap-2 text-brand-sage">
                              <span>★ Bonus: {item.item}</span>
                              <span className="flex-shrink-0 font-medium">+{item.points}</span>
                            </div>
                          ))}
                          {q.rubric.notes && (
                            <p className="text-gray-400 italic mt-2 leading-relaxed">{q.rubric.notes}</p>
                          )}
                        </div>
                      </details>
                    </div>
                  )
                })}
              </div>
            </Section>

            {/* Internal Notes */}
            <Section title="Internal Notes">
              <textarea
                className="input-field min-h-[140px] resize-y text-sm"
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Add private notes about this candidate..."
              />
            </Section>

            {/* Save button at bottom */}
            <div className="flex justify-end">
              <button
                onClick={saveChanges}
                disabled={saving}
                className="btn-primary disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>

          </div>
        </div>
      </main>
    </div>
  )
}

function Section({ title, children }) {
  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <h2 className="font-display text-xl text-brand-charcoal">{title}</h2>
        <div className="flex-1 h-px bg-brand-border" />
      </div>
      {children}
    </div>
  )
}

function ResponseBlock({ label, value }) {
  return (
    <div>
      <p className="text-xs font-medium text-gray-500 mb-2">{label}</p>
      <div className="bg-brand-cream p-4 text-sm text-brand-charcoal leading-relaxed whitespace-pre-wrap min-h-[60px]">
        {value || <span className="text-gray-400 italic">No response</span>}
      </div>
    </div>
  )
}
