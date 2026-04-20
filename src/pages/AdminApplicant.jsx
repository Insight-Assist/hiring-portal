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

const DISCUSSION_POINTS = [
  {
    id: 'dp_intro',
    number: '1',
    label: 'Intro Understanding',
    bullets: [
      'Rural Washington State practice on the West Coast of the USA',
      'Real-time, high-engagement scribe role — not passive',
      'On Google Meet with the doctor all day',
    ],
  },
  {
    id: 'dp_schedule',
    number: '2',
    label: 'Schedule Alignment',
    bullets: [
      'Mon–Thu: 8:00 AM – 5:00 PM PST',
      'Friday: 8:00 AM – 2:00 PM PST (~39 hrs/week)',
      'Option to add +1 hour on Friday to reach 40 hours',
      'Lunch break + short breaks throughout the day, communicated with doctor',
    ],
  },
  {
    id: 'dp_workflow',
    number: '3',
    label: 'Workflow Expectations',
    bullets: [
      'On Google Meet with doctor all day',
      'Fast-paced, real-time scribing',
      'Completing tasks between patients',
      'First 3–6 months: primary focus is scribing accuracy and flow',
    ],
  },
  {
    id: 'dp_fridays',
    number: '4',
    label: 'Admin Fridays',
    bullets: [
      'Every other Friday is lighter and admin-focused',
      'Used for catch-up work and training',
    ],
  },
  {
    id: 'dp_comp',
    number: '5',
    label: 'Compensation Alignment',
    bullets: [
      'Ask candidate: "What hourly rate are you looking for?"',
      'Role range: $8.00–$11.00 USD/hour depending on experience',
      'Confirm expectation of consistent weekly hours',
    ],
  },
  {
    id: 'dp_communication',
    number: '6',
    label: 'Communication & Fit',
    bullets: [
      'Highly engaged virtual team environment',
      'Expect proactive communication throughout the day',
      'Fit matters both ways',
    ],
  },
  {
    id: 'dp_questions',
    number: '7',
    label: 'Candidate Questions / Curiosity',
    bullets: [
      'Did the candidate ask thoughtful or relevant questions about the role, workflow, or expectations?',
    ],
  },
]

const STAR_QUESTIONS = [
  {
    id: 'star_learning',
    number: '1',
    prompt: '"Tell me about a time you had to learn something new quickly to do your job well."',
  },
  {
    id: 'star_multitask',
    number: '2',
    prompt: '"Tell me about a time when you had to manage multiple responsibilities at once — such as responding to team messages, tracking tasks, and staying focused on a primary responsibility. How did you stay organized and ensure nothing was missed?"',
  },
]

const STRENGTH_OPTIONS = ['Strong', 'Moderate', 'Weak']

const RUBRIC = [
  { score: 5, label: 'Excellent', desc: 'Proactive, clear communicator, fast learner, confident under pressure' },
  { score: 4, label: 'Strong', desc: 'Solid examples, reliable, coachable, good awareness' },
  { score: 3, label: 'OK', desc: 'Adequate but lacks depth or clarity' },
  { score: 2, label: 'Weak', desc: 'Limited ownership, struggles with examples' },
  { score: 1, label: 'Poor', desc: 'Red flags: defensive, slow, unclear communication' },
]

const defaultInterview = () => ({
  date: '',
  discussion_notes: {},
  star_scores: {},
  star_strength: {},
  star_notes: {},
  overall: '',
  top_strengths: '',
  concerns: '',
  overall_notes: '',
})

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
  const [interview, setInterview] = useState(defaultInterview())

  useEffect(() => { fetchApplicant() }, [id])

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
      if (data.resume_path) {
        const { data: urlData } = supabase.storage.from('resumes').getPublicUrl(data.resume_path)
        setResumeUrl(urlData?.publicUrl)
      }
      if (data.task_scores) {
        setTaskScores(data.task_scores)
        setTotalScore(Object.values(data.task_scores).reduce((a, b) => a + Number(b), 0))
      }
      if (data.interview_guide) {
        setInterview({ ...defaultInterview(), ...data.interview_guide })
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
        interview_guide: interview,
      })
      .eq('id', id)
    if (!error) { setSaved(true); setTimeout(() => setSaved(false), 2500) }
    setSaving(false)
  }

  const updateScore = (qId, val) => {
    const updated = { ...taskScores, [qId]: val }
    setTaskScores(updated)
    setTotalScore(Object.values(updated).reduce((a, b) => a + Number(b || 0), 0))
  }

  const setDiscussionNote = (id, val) =>
    setInterview(prev => ({ ...prev, discussion_notes: { ...prev.discussion_notes, [id]: val } }))

  const setStarScore = (id, val) =>
    setInterview(prev => ({ ...prev, star_scores: { ...prev.star_scores, [id]: val } }))

  const setStarStrength = (id, val) =>
    setInterview(prev => ({ ...prev, star_strength: { ...prev.star_strength, [id]: val } }))

  const setStarNote = (id, val) =>
    setInterview(prev => ({ ...prev, star_notes: { ...prev.star_notes, [id]: val } }))

  const formatDate = (iso) => iso
    ? new Date(iso).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })
    : '—'

  if (loading) return <div className="min-h-screen flex items-center justify-center"><p className="text-sm text-gray-400">Loading applicant...</p></div>
  if (!applicant) return <div className="min-h-screen flex items-center justify-center"><p className="text-sm text-red-400">Applicant not found.</p></div>

  const pDominant = personalityTypes[applicant.personality_dominant]
  const pSecondary = personalityTypes[applicant.personality_secondary]
  const taskResponses = applicant.trial_task_responses || {}

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-brand-border px-6 py-4 bg-brand-charcoal">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/admin" className="text-gray-400 hover:text-white text-sm transition-colors">← All Applicants</Link>
            <span className="text-gray-600">·</span>
            <span className="text-white text-sm font-medium">{applicant.full_name}</span>
          </div>
          <div className="flex items-center gap-3">
            {saved && <span className="text-brand-sage text-xs">Saved ✓</span>}
            <button onClick={saveChanges} disabled={saving} className="bg-brand-sage text-white px-4 py-2 text-sm hover:bg-brand-forest transition-colors disabled:opacity-50">
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* LEFT COLUMN */}
          <div className="lg:col-span-1 space-y-5">

            <div className="border border-brand-border p-5">
              <div className="flex items-start justify-between gap-2 mb-4">
                <h1 className="font-display text-2xl text-brand-charcoal leading-tight">{applicant.full_name}</h1>
                <span className={`text-xs font-medium px-2 py-1 border rounded-sm flex-shrink-0 ${STATUS_COLORS[status]}`}>{status}</span>
              </div>
              <div className="space-y-1.5 text-sm text-gray-500">
                <p>{applicant.email}</p>
                {applicant.phone && <p>{applicant.phone}</p>}
                <p>{applicant.city_timezone}</p>
                <p>{applicant.country}</p>
                {applicant.linkedin_url && (
                  <a href={applicant.linkedin_url} target="_blank" rel="noreferrer" className="text-brand-sage hover:underline block truncate text-xs">{applicant.linkedin_url}</a>
                )}
              </div>
              <div className="mt-4 pt-4 border-t border-brand-border text-xs text-gray-400">Submitted {formatDate(applicant.submitted_at)}</div>
            </div>

            <div className="border border-brand-border p-5">
              <p className="text-xs uppercase tracking-widest text-brand-sage font-medium mb-3">Eligibility</p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Pacific Time</span>
                  <span className={`font-medium ${applicant.can_work_pacific === 'Yes' ? 'text-green-600' : 'text-red-500'}`}>{applicant.can_work_pacific || '—'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">English</span>
                  <span className="font-medium text-brand-charcoal">{applicant.english_proficiency || '—'}</span>
                </div>
              </div>
            </div>

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
                            <span>{pt?.label}</span><span>{val}/20</span>
                          </div>
                          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: pt?.color }} />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )}

            <div className="border border-brand-border p-5 space-y-4">
              <div>
                <p className="text-xs uppercase tracking-widest text-brand-sage font-medium mb-2">Status</p>
                <select className="input-field text-sm" value={status} onChange={e => setStatus(e.target.value)}>
                  {STATUS_OPTIONS.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <p className="text-xs uppercase tracking-widest text-brand-sage font-medium mb-2">Recommendation</p>
                <select className="input-field text-sm" value={recommendation} onChange={e => setRecommendation(e.target.value)}>
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
                  <a href={resumeUrl} target="_blank" rel="noreferrer" className="text-sm text-brand-sage hover:text-brand-forest underline">Open Resume ↗</a>
                </div>
              )}
            </div>

          </div>

          {/* RIGHT COLUMN */}
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
                <p className="text-sm text-gray-500">Score each response using the rubric. Total is out of 100 points.</p>
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
                          <input type="number" min="0" max={maxPts} className="w-16 border border-brand-border px-2 py-1 text-sm text-center focus:outline-none focus:border-brand-sage" value={taskScores[qKey] ?? ''} onChange={e => updateScore(qKey, e.target.value)} />
                          <span className="text-xs text-gray-400">/ {maxPts}</span>
                        </div>
                      </div>
                      <p className="text-sm font-medium text-brand-charcoal mb-3 leading-relaxed">{q.prompt}</p>
                      {qi < 3 && (
                        <div className="bg-brand-cream p-4 mb-4 text-sm text-brand-charcoal leading-relaxed whitespace-pre-wrap min-h-[60px]">
                          {response || <span className="text-gray-400 italic">No response</span>}
                        </div>
                      )}
                      {qi === 3 && (
                        <div className="bg-brand-cream p-4 mb-4">
                          {priorityIds.length > 0 ? (
                            <ol className="space-y-1">
                              {priorityIds.map((pid, idx) => {
                                const item = priorityItems.find(i => i.id === pid)
                                return <li key={pid} className="text-sm text-brand-charcoal flex gap-2"><span className="text-brand-sage font-medium">{idx + 1}.</span>{item?.text}</li>
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
                      <details className="text-xs">
                        <summary className="text-brand-sage cursor-pointer hover:text-brand-forest font-medium">View Scoring Rubric</summary>
                        <div className="mt-3 space-y-1.5 pl-2">
                          {q.rubric.keyItems?.map((item, i) => (
                            <div key={i} className="flex justify-between gap-2 text-gray-600">
                              <span>• {item.item}</span><span className="flex-shrink-0 font-medium text-brand-charcoal">+{item.points}</span>
                            </div>
                          ))}
                          {q.rubric.bonusItems?.map((item, i) => (
                            <div key={i} className="flex justify-between gap-2 text-brand-sage">
                              <span>★ Bonus: {item.item}</span><span className="flex-shrink-0 font-medium">+{item.points}</span>
                            </div>
                          ))}
                          {q.rubric.notes && <p className="text-gray-400 italic mt-2 leading-relaxed">{q.rubric.notes}</p>}
                        </div>
                      </details>
                    </div>
                  )
                })}
              </div>
            </Section>

            {/* ── INTERVIEW GUIDE ── */}
            <Section title="Interview Guide & Scorecard">
              <div className="border border-brand-border overflow-hidden">

                {/* Header */}
                <div className="bg-brand-charcoal px-6 py-4">
                  <p className="text-white font-display text-lg">Medical Scribe Interview Guide</p>
                  <p className="text-brand-sage-mid text-xs mt-0.5">Remote Medical Scribe · Dr. Beth's Team · Rural Washington State, USA</p>
                </div>

                <div className="divide-y divide-brand-border">

                  {/* Date row */}
                  <div className="px-6 py-4 flex items-center gap-4 bg-white">
                    <label className="text-xs uppercase tracking-widest text-brand-sage font-medium w-12 flex-shrink-0">Date</label>
                    <input
                      type="date"
                      className="input-field max-w-[180px] text-sm py-1.5"
                      value={interview.date}
                      onChange={e => setInterview(prev => ({ ...prev, date: e.target.value }))}
                    />
                  </div>

                  {/* ── SECTION 1: Discussion Points ── */}
                  <div className="bg-brand-sage-light px-6 py-3">
                    <p className="text-xs uppercase tracking-widest text-brand-forest font-medium">Section 1 — Key Discussion Points</p>
                    <p className="text-xs text-brand-sage mt-0.5">Cover each topic with the candidate. Notes only — no scoring.</p>
                  </div>

                  {DISCUSSION_POINTS.map((dp) => (
                    <div key={dp.id} className="px-6 py-5 bg-white">
                      <div className="flex gap-3 mb-3">
                        <span className="text-xs font-medium text-brand-sage flex-shrink-0 mt-0.5">{dp.number}.</span>
                        <p className="text-sm font-medium text-brand-charcoal">{dp.label}</p>
                      </div>
                      <ul className="ml-5 space-y-1 mb-4">
                        {dp.bullets.map((b, i) => (
                          <li key={i} className="flex gap-2 text-xs text-gray-600">
                            <span className="text-brand-sage flex-shrink-0">–</span>
                            {b}
                          </li>
                        ))}
                      </ul>
                      <div>
                        <label className="text-xs text-gray-400 uppercase tracking-wide mb-1 block">Notes</label>
                        <textarea
                          className="input-field text-sm min-h-[64px] resize-y"
                          placeholder="Notes from this discussion..."
                          value={interview.discussion_notes[dp.id] || ''}
                          onChange={e => setDiscussionNote(dp.id, e.target.value)}
                        />
                      </div>
                    </div>
                  ))}

                  {/* ── SECTION 2: STAR Questions ── */}
                  <div className="bg-brand-sage-light px-6 py-3">
                    <p className="text-xs uppercase tracking-widest text-brand-forest font-medium">Section 2 — STAR Questions</p>
                    <p className="text-xs text-brand-sage mt-0.5">Rate each response 1–5 and note key observations.</p>
                  </div>

                  {/* Rubric reference — collapsed by default */}
                  <div className="px-6 py-3 bg-white">
                    <details>
                      <summary className="text-xs text-brand-sage cursor-pointer hover:text-brand-forest font-medium">View Scoring Rubric (1–5)</summary>
                      <div className="mt-3 border border-brand-border overflow-hidden">
                        {RUBRIC.map((r, i) => (
                          <div key={r.score} className={`flex items-start gap-4 px-4 py-2 text-xs ${i < RUBRIC.length - 1 ? 'border-b border-brand-border' : ''}`}>
                            <span className="font-medium text-brand-charcoal w-4 flex-shrink-0">{r.score}</span>
                            <span className="font-medium text-brand-charcoal w-16 flex-shrink-0">{r.label}</span>
                            <span className="text-gray-500 leading-relaxed">{r.desc}</span>
                          </div>
                        ))}
                      </div>
                    </details>
                  </div>

                  {STAR_QUESTIONS.map((q) => (
                    <div key={q.id} className="px-6 py-5 bg-white">
                      <div className="flex gap-3 mb-3">
                        <span className="text-xs font-medium text-brand-sage flex-shrink-0 mt-0.5">Q{q.number}.</span>
                        <p className="text-sm text-brand-charcoal italic leading-relaxed">{q.prompt}</p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                        {/* Score */}
                        <div>
                          <label className="text-xs text-gray-400 uppercase tracking-wide mb-2 block">Rating (1–5)</label>
                          <div className="flex gap-2">
                            {[1, 2, 3, 4, 5].map(n => (
                              <button
                                key={n}
                                type="button"
                                onClick={() => setStarScore(q.id, n)}
                                className={`w-9 h-9 text-sm font-medium border transition-colors ${
                                  interview.star_scores[q.id] === n
                                    ? 'bg-brand-forest text-white border-brand-forest'
                                    : 'bg-white text-brand-charcoal border-brand-border hover:border-brand-sage'
                                }`}
                              >
                                {n}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Strength */}
                        <div>
                          <label className="text-xs text-gray-400 uppercase tracking-wide mb-2 block">Strength</label>
                          <div className="flex gap-2">
                            {STRENGTH_OPTIONS.map(opt => (
                              <button
                                key={opt}
                                type="button"
                                onClick={() => setStarStrength(q.id, opt)}
                                className={`px-3 py-1.5 text-xs font-medium border transition-colors ${
                                  interview.star_strength[q.id] === opt
                                    ? 'bg-brand-forest text-white border-brand-forest'
                                    : 'bg-white text-brand-charcoal border-brand-border hover:border-brand-sage'
                                }`}
                              >
                                {opt}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="text-xs text-gray-400 uppercase tracking-wide mb-1 block">Notes</label>
                        <textarea
                          className="input-field text-sm min-h-[72px] resize-y"
                          placeholder="Key observations from this response..."
                          value={interview.star_notes[q.id] || ''}
                          onChange={e => setStarNote(q.id, e.target.value)}
                        />
                      </div>
                    </div>
                  ))}

                  {/* ── SECTION 3: Overall Impression ── */}
                  <div className="bg-brand-sage-light px-6 py-3">
                    <p className="text-xs uppercase tracking-widest text-brand-forest font-medium">Section 3 — Overall Impression</p>
                  </div>

                  <div className="px-6 py-5 bg-white space-y-5">

                    {/* Overall recommendation */}
                    <div>
                      <label className="text-xs text-gray-400 uppercase tracking-wide mb-2 block">Overall Recommendation</label>
                      <div className="flex flex-wrap gap-2">
                        {['Strong Yes', 'Yes', 'Maybe', 'No'].map(opt => (
                          <button
                            key={opt}
                            type="button"
                            onClick={() => setInterview(prev => ({ ...prev, overall: opt }))}
                            className={`px-4 py-2 text-sm font-medium border transition-colors ${
                              interview.overall === opt
                                ? 'bg-brand-forest text-white border-brand-forest'
                                : 'bg-white text-brand-charcoal border-brand-border hover:border-brand-sage'
                            }`}
                          >
                            {opt}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Strengths + Concerns side by side */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs text-gray-400 uppercase tracking-wide mb-1 block">Top Strengths</label>
                        <textarea
                          className="input-field text-sm min-h-[90px] resize-y"
                          placeholder="What stood out positively..."
                          value={interview.top_strengths}
                          onChange={e => setInterview(prev => ({ ...prev, top_strengths: e.target.value }))}
                        />
                      </div>
                      <div>
                        <label className="text-xs text-gray-400 uppercase tracking-wide mb-1 block">Potential Concerns</label>
                        <textarea
                          className="input-field text-sm min-h-[90px] resize-y"
                          placeholder="Any hesitations or red flags..."
                          value={interview.concerns}
                          onChange={e => setInterview(prev => ({ ...prev, concerns: e.target.value }))}
                        />
                      </div>
                    </div>

                    {/* Overall notes */}
                    <div>
                      <label className="text-xs text-gray-400 uppercase tracking-wide mb-1 block">Additional Notes</label>
                      <textarea
                        className="input-field text-sm min-h-[80px] resize-y"
                        placeholder="Any other observations..."
                        value={interview.overall_notes}
                        onChange={e => setInterview(prev => ({ ...prev, overall_notes: e.target.value }))}
                      />
                    </div>

                  </div>

                </div>
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

            <div className="flex justify-end">
              <button onClick={saveChanges} disabled={saving} className="btn-primary disabled:opacity-50">
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
