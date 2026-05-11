import { useState, useEffect } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'

const SCRIBE_TEMPLATE = {
  title: 'Remote Medical Scribe (Optometry)',
  client: "Dr. Beth's Team",
  location: 'Remote',
  job_type: 'Full Time',
  is_remote: true,
  compensation: '$8–$11 USD/hour depending on experience',
  schedule: [
    'Monday–Thursday: 8:00 AM – 5:00 PM Pacific Time',
    'Friday: 8:00 AM – 2:00 PM Pacific Time',
  ],
  benefits: [
    { label: 'PTO', detail: '40 hours of paid time off per year' },
    { label: 'Sick Pay', detail: '40 hours of paid sick leave per year' },
    { label: 'Utility Stipend', detail: '$70 USD per month toward internet and utilities' },
  ],
  responsibilities: [
    'Real-time charting and clinical documentation',
    'Insurance verification for medical and vision plans',
    'Billing support and claim-related workflows',
    'Referrals and care coordination',
    'Team communication with front desk, technicians, billing, and providers',
    'Anticipating next steps and helping reduce provider mental load',
  ],
  qualifications: [
    'Strong English communication skills',
    'Detail-oriented and highly organized',
    'Proactive — able to anticipate needs before being asked',
    'Comfortable with technology and learning new systems',
    'Experience in medical scribing, healthcare administration, or billing preferred',
  ],
}

const OPTICAL_TEMPLATE = {
  title: 'Float — Optical / Paraoptometric Technician',
  client: 'Newport Vision Source',
  location: '205 S Washington Ave, Newport, WA 99156',
  job_type: 'Part Time',
  is_remote: false,
  compensation: '$19.00/hour',
  schedule: [
    'Tuesday–Thursday: 8:00 AM – 5:00 PM',
    'Occasional Monday coverage',
    '1–2 Fridays per month: 8:00 AM – 2:00 PM',
  ],
  benefits: [
    { label: 'Advancement', detail: '+$2.00/hr after 6 months + CPO exam' },
    { label: 'Training', detail: 'Full on-the-job training provided' },
  ],
  responsibilities: [
    'Help patients select frames for fit, style, and prescription needs',
    'Learn to interpret vision plan and insurance benefits',
    'Recommend lens options tailored to each patient lifestyle',
    'Prescreen patients and assist with special testing',
    'Assist with contact lens fittings',
  ],
  qualifications: [
    'Warm, outgoing personality',
    'Comfortable learning new things',
    'Eye for detail',
    'No experience required — full training provided',
  ],
}

const BLANK_TEMPLATE = {
  title: '',
  client: '',
  location: '',
  job_type: 'Full Time',
  is_remote: false,
  compensation: '',
  schedule: [],
  benefits: [],
  responsibilities: [],
  qualifications: [],
  success_markers: [],
  overview: '',
  description: '',
  trial_task_scenario: '',
  trial_task_encounter: '',
  trial_task_questions: [],
  interview_discussion_points: [],
  interview_star_questions: [],
}

export default function AdminJobManager() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isNew = !id || id === 'new'

  const [job, setJob] = useState({ ...BLANK_TEMPLATE })
  const [loading, setLoading] = useState(!isNew)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [activeTab, setActiveTab] = useState('basics')
  const [aiPrompt, setAiPrompt] = useState('')
  const [aiLoading, setAiLoading] = useState(false)
  const [aiTarget, setAiTarget] = useState(null) // 'description' | 'task' | 'interview'
  const [showTemplates, setShowTemplates] = useState(isNew)

  useEffect(() => {
    if (!isNew) fetchJob()
  }, [id])

  const fetchJob = async () => {
    const { data } = await supabase.from('jobs').select('*').eq('id', id).single()
    if (data) setJob(data)
    setLoading(false)
  }

  const applyTemplate = (source) => {
    const tpl = source === 'scribe' ? SCRIBE_TEMPLATE : source === 'optical' ? OPTICAL_TEMPLATE : BLANK_TEMPLATE
    setJob(prev => ({
      ...BLANK_TEMPLATE,
      ...tpl,
      title: tpl.title || '',
      slug: '',
      template_source: source,
    }))
    setShowTemplates(false)
  }

  const generateSlug = (title) =>
    title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

  const update = (field, value) => setJob(prev => ({ ...prev, [field]: value }))

  const addListItem = (field, value = '') =>
    setJob(prev => ({ ...prev, [field]: [...(prev[field] || []), value] }))

  const updateListItem = (field, idx, value) =>
    setJob(prev => ({ ...prev, [field]: prev[field].map((item, i) => i === idx ? value : item) }))

  const removeListItem = (field, idx) =>
    setJob(prev => ({ ...prev, [field]: prev[field].filter((_, i) => i !== idx) }))

  const updateBenefit = (idx, key, value) =>
    setJob(prev => ({
      ...prev,
      benefits: prev.benefits.map((b, i) => i === idx ? { ...b, [key]: value } : b)
    }))

  const saveJob = async () => {
    if (!job.title) { alert('Please add a job title.'); return }
    setSaving(true)
    const slug = job.slug || generateSlug(job.title)
    const record = { ...job, slug, updated_at: new Date().toISOString() }

    let error
    if (isNew) {
      const res = await supabase.from('jobs').insert([record]).select()
      error = res.error
      if (!error && res.data?.[0]) {
        setSaved(true)
        setTimeout(() => navigate(`/admin/jobs/${res.data[0].id}`), 800)
        setSaving(false)
        return
      }
    } else {
      const res = await supabase.from('jobs').update(record).eq('id', id)
      error = res.error
    }

    if (error) alert('Save failed: ' + error.message)
    else { setSaved(true); setTimeout(() => setSaved(false), 2500) }
    setSaving(false)
  }

  const callAI = async (systemPrompt, userPrompt) => {
    const response = await fetch('/api/ai-generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ systemPrompt, userPrompt })
    })
    const data = await response.json()
    if (data.error) throw new Error(data.error)
    return data.text || ''
  }

  const generateDescription = async () => {
    if (!job.title) { alert('Please add a job title first.'); return }
    setAiLoading(true)
    setAiTarget('description')
    try {
      const text = await callAI(
        'You write clean, professional job descriptions for small healthcare businesses. Write in a warm but professional tone. Return only the description text, no headers, no markdown.',
        `Write a compelling job overview and description for this role:
Title: ${job.title}
Client/Company: ${job.client || 'not specified'}
Location: ${job.location || 'not specified'}
Type: ${job.job_type}
Compensation: ${job.compensation || 'not specified'}
Responsibilities: ${(job.responsibilities || []).join(', ')}
Additional context: ${aiPrompt}

Write 2-3 paragraphs. First paragraph: what makes this role exciting and what the candidate will do. Second paragraph: what success looks like. Third paragraph (optional): culture/team fit. Keep it under 200 words.`
      )
      update('description', text.trim())
    } catch (e) {
      alert('AI generation failed: ' + e.message)
    }
    setAiLoading(false)
    setAiTarget(null)
  }

  const generateTrialTask = async () => {
    if (!job.title) { alert('Please add a job title first.'); return }
    setAiLoading(true)
    setAiTarget('task')
    try {
      const text = await callAI(
        `You design practical trial tasks for job applications at small healthcare businesses. 
Return ONLY valid JSON with no markdown, no backticks, no explanation. 
The JSON must have: scenario (string), encounter (string with relevant details), questions (array of objects).
Each question object must have: id (string like "q1"), type ("short_answer" or "calculation"), prompt (string), rubric object with maxPoints (number) and keyItems (array of objects with item string and points number), and optional bonusItems array.
Keep questions practical and relevant to the actual job. Max 3 questions. Total points must equal 100.`,
        `Design a 5-10 minute trial task for this job:
Title: ${job.title}
Company: ${job.client || ''}
Responsibilities: ${(job.responsibilities || []).join('; ')}
What to test: ${aiPrompt || 'attention to detail, communication, workflow thinking, problem solving'}

Create a realistic scenario with 3 questions that reveal if a candidate has the right skills.`
      )

      // Strip any markdown just in case
      const clean = text.replace(/```json|```/g, '').trim()
      const parsed = JSON.parse(clean)
      update('trial_task_scenario', parsed.scenario || '')
      update('trial_task_encounter', parsed.encounter || '')
      update('trial_task_questions', parsed.questions || [])
    } catch (e) {
      alert('AI generation failed — try again or check the prompt. Error: ' + e.message)
    }
    setAiLoading(false)
    setAiTarget(null)
  }

  const generateInterviewGuide = async () => {
    if (!job.title) { alert('Please add a job title first.'); return }
    setAiLoading(true)
    setAiTarget('interview')
    try {
      const text = await callAI(
        `You design interview guides for small healthcare businesses.
Return ONLY valid JSON with no markdown, no backticks, no explanation.
JSON must have: discussion_points (array of objects with id, number, label, bullets array of strings) and star_questions (array of objects with id, number, prompt string).
Create 5-7 discussion points covering role overview, schedule, expectations, compensation, and culture fit.
Create 2 STAR behavioral questions relevant to the role.`,
        `Create an interview guide for:
Title: ${job.title}
Company: ${job.client || ''}
Location: ${job.location || ''}
Schedule: ${(job.schedule || []).join('; ')}
Compensation: ${job.compensation || ''}
Key responsibilities: ${(job.responsibilities || []).slice(0, 4).join('; ')}
Additional context: ${aiPrompt}`
      )

      const clean = text.replace(/```json|```/g, '').trim()
      const parsed = JSON.parse(clean)
      update('interview_discussion_points', parsed.discussion_points || [])
      update('interview_star_questions', parsed.star_questions || [])
    } catch (e) {
      alert('AI generation failed: ' + e.message)
    }
    setAiLoading(false)
    setAiTarget(null)
  }

  const TABS = ['basics', 'content', 'task', 'interview', 'preview']

  if (loading) return <div className="min-h-screen flex items-center justify-center"><p className="text-sm text-gray-400">Loading...</p></div>

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-brand-border px-6 py-4 bg-brand-charcoal">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/admin/jobs" className="text-gray-400 hover:text-white text-sm transition-colors">← Job Manager</Link>
            <span className="text-gray-600">·</span>
            <span className="text-white text-sm font-medium">{isNew ? 'New Job Posting' : (job.title || 'Edit Job')}</span>
          </div>
          <div className="flex items-center gap-3">
            {saved && <span className="text-brand-sage text-xs">Saved ✓</span>}
            <button
              onClick={() => update('is_open', !job.is_open)}
              className={`px-3 py-1.5 text-xs font-medium border transition-colors ${
                job.is_open
                  ? 'border-green-400 text-green-400 hover:bg-green-900'
                  : 'border-red-400 text-red-400 hover:bg-red-900'
              }`}
            >
              {job.is_open ? 'Open' : 'Closed'}
            </button>
            {!isNew && (
              <a
                href={`/jobs/${job.slug}`}
                target="_blank"
                rel="noreferrer"
                className="text-gray-400 hover:text-white text-xs transition-colors border border-gray-600 px-3 py-1.5"
              >
                View Posting ↗
              </a>
            )}
            <button onClick={saveJob} disabled={saving} className="bg-brand-sage text-white px-4 py-2 text-sm hover:bg-brand-forest transition-colors disabled:opacity-50">
              {saving ? 'Saving...' : isNew ? 'Create Job' : 'Save Changes'}
            </button>
          </div>
        </div>
      </header>

      {/* Template picker for new jobs */}
      {showTemplates && (
        <div className="border-b border-brand-border bg-brand-cream">
          <div className="max-w-5xl mx-auto px-6 py-5">
            <p className="text-xs uppercase tracking-widest text-brand-sage font-medium mb-3">Start From a Template</p>
            <div className="flex flex-wrap gap-3">
              {[
                { id: 'blank', label: 'Blank', desc: 'Start from scratch' },
                { id: 'scribe', label: 'Remote Medical Scribe', desc: 'Copy from Dr. Beth posting' },
                { id: 'optical', label: 'Optical Tech', desc: 'Copy from Newport Vision Source posting' },
              ].map(t => (
                <button
                  key={t.id}
                  onClick={() => applyTemplate(t.id)}
                  className="border border-brand-border bg-white px-4 py-3 text-left hover:border-brand-sage transition-colors"
                >
                  <p className="text-sm font-medium text-brand-charcoal">{t.label}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{t.desc}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-brand-border">
        <div className="max-w-5xl mx-auto px-6">
          <div className="flex gap-0">
            {TABS.map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-3 text-xs font-medium uppercase tracking-wide border-b-2 transition-colors capitalize ${
                  activeTab === tab
                    ? 'border-brand-forest text-brand-forest'
                    : 'border-transparent text-gray-400 hover:text-brand-charcoal'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      <main className="max-w-5xl mx-auto px-6 py-8">

        {/* BASICS TAB */}
        {activeTab === 'basics' && (
          <div className="space-y-6 max-w-2xl">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="form-label">Job Title *</label>
                <input className="input-field" value={job.title} onChange={e => { update('title', e.target.value); if (!job.slug) update('slug', generateSlug(e.target.value)) }} placeholder="e.g. Front Desk Coordinator" />
              </div>
              <div>
                <label className="form-label">Client / Company</label>
                <input className="input-field" value={job.client || ''} onChange={e => update('client', e.target.value)} placeholder="e.g. Newport Vision Source" />
              </div>
              <div>
                <label className="form-label">Location</label>
                <input className="input-field" value={job.location || ''} onChange={e => update('location', e.target.value)} placeholder="e.g. Newport, WA or Remote" />
              </div>
              <div>
                <label className="form-label">Job Type</label>
                <select className="input-field" value={job.job_type || 'Full Time'} onChange={e => update('job_type', e.target.value)}>
                  <option>Full Time</option>
                  <option>Part Time</option>
                  <option>Contract</option>
                  <option>Per Diem</option>
                </select>
              </div>
              <div>
                <label className="form-label">Compensation</label>
                <input className="input-field" value={job.compensation || ''} onChange={e => update('compensation', e.target.value)} placeholder="e.g. $18–$22/hour" />
              </div>
              <div className="sm:col-span-2">
                <label className="form-label">URL Slug</label>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400 flex-shrink-0">/jobs/</span>
                  <input className="input-field" value={job.slug || ''} onChange={e => update('slug', e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))} placeholder="front-desk-coordinator" />
                </div>
                <p className="text-xs text-gray-400 mt-1">This is the URL for the job posting. Auto-generated from title.</p>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="is_remote" checked={job.is_remote || false} onChange={e => update('is_remote', e.target.checked)} className="accent-brand-forest" />
                <label htmlFor="is_remote" className="text-sm text-brand-charcoal">Remote position</label>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="is_open" checked={job.is_open !== false} onChange={e => update('is_open', e.target.checked)} className="accent-brand-forest" />
                <label htmlFor="is_open" className="text-sm text-brand-charcoal">Currently accepting applications</label>
              </div>
            </div>

            {/* Schedule */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="form-label mb-0">Schedule</label>
                <button onClick={() => addListItem('schedule', '')} className="text-xs text-brand-sage hover:text-brand-forest">+ Add line</button>
              </div>
              <div className="space-y-2">
                {(job.schedule || []).map((line, i) => (
                  <div key={i} className="flex gap-2">
                    <input className="input-field text-sm" value={line} onChange={e => updateListItem('schedule', i, e.target.value)} placeholder="e.g. Monday–Friday: 8 AM – 5 PM" />
                    <button onClick={() => removeListItem('schedule', i)} className="text-red-400 hover:text-red-600 text-xs px-2">✕</button>
                  </div>
                ))}
              </div>
            </div>

            {/* Benefits */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="form-label mb-0">Benefits</label>
                <button onClick={() => setJob(prev => ({ ...prev, benefits: [...(prev.benefits || []), { label: '', detail: '' }] }))} className="text-xs text-brand-sage hover:text-brand-forest">+ Add benefit</button>
              </div>
              <div className="space-y-2">
                {(job.benefits || []).map((b, i) => (
                  <div key={i} className="flex gap-2">
                    <input className="input-field text-sm w-32 flex-shrink-0" value={b.label || ''} onChange={e => updateBenefit(i, 'label', e.target.value)} placeholder="Label" />
                    <input className="input-field text-sm flex-1" value={b.detail || ''} onChange={e => updateBenefit(i, 'detail', e.target.value)} placeholder="Detail" />
                    <button onClick={() => removeListItem('benefits', i)} className="text-red-400 hover:text-red-600 text-xs px-2">✕</button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* CONTENT TAB */}
        {activeTab === 'content' && (
          <div className="space-y-8 max-w-2xl">

            {/* AI description generator */}
            <div className="bg-brand-sage-light border border-brand-sage-mid p-5">
              <p className="text-xs uppercase tracking-widest text-brand-forest font-medium mb-3">AI Description Generator</p>
              <textarea
                className="input-field text-sm min-h-[70px] resize-y mb-3"
                value={aiPrompt}
                onChange={e => setAiPrompt(e.target.value)}
                placeholder="Add any extra context for the AI (tone, culture, special requirements)... or leave blank to generate from the basics tab."
              />
              <button
                onClick={generateDescription}
                disabled={aiLoading && aiTarget === 'description'}
                className="btn-primary text-sm disabled:opacity-50"
              >
                {aiLoading && aiTarget === 'description' ? 'Generating...' : '✦ Generate Job Description'}
              </button>
            </div>

            <div>
              <label className="form-label">Job Overview (short — shows at top of posting)</label>
              <textarea className="input-field min-h-[80px] resize-y text-sm" value={job.overview || ''} onChange={e => update('overview', e.target.value)} placeholder="1-2 sentence hook at the top of the posting..." />
            </div>

            <div>
              <label className="form-label">Full Description</label>
              <textarea className="input-field min-h-[160px] resize-y text-sm" value={job.description || ''} onChange={e => update('description', e.target.value)} placeholder="Full job description — can be AI generated above or written manually..." />
            </div>

            {/* Responsibilities */}
            <ListEditor
              label="Key Responsibilities"
              items={job.responsibilities || []}
              onAdd={() => addListItem('responsibilities', '')}
              onChange={(i, v) => updateListItem('responsibilities', i, v)}
              onRemove={(i) => removeListItem('responsibilities', i)}
              placeholder="e.g. Real-time patient charting"
            />

            {/* Qualifications */}
            <ListEditor
              label="Qualifications / What We're Looking For"
              items={job.qualifications || []}
              onAdd={() => addListItem('qualifications', '')}
              onChange={(i, v) => updateListItem('qualifications', i, v)}
              onRemove={(i) => removeListItem('qualifications', i)}
              placeholder="e.g. Strong communication skills"
            />

            {/* Success markers */}
            <ListEditor
              label="Success in This Role Looks Like (optional)"
              items={job.success_markers || []}
              onAdd={() => addListItem('success_markers', '')}
              onChange={(i, v) => updateListItem('success_markers', i, v)}
              onRemove={(i) => removeListItem('success_markers', i)}
              placeholder="e.g. Patients feel warmly welcomed"
            />
          </div>
        )}

        {/* TASK TAB */}
        {activeTab === 'task' && (
          <div className="space-y-6 max-w-2xl">
            <div className="bg-brand-sage-light border border-brand-sage-mid p-5">
              <p className="text-xs uppercase tracking-widest text-brand-forest font-medium mb-1">AI Trial Task Generator</p>
              <p className="text-xs text-brand-sage mb-3">Describe what skills or qualities you want to test. Claude will write the scenario, questions, and full scoring rubric.</p>
              <textarea
                className="input-field text-sm min-h-[80px] resize-y mb-3"
                value={aiPrompt}
                onChange={e => setAiPrompt(e.target.value)}
                placeholder="e.g. Test attention to detail, phone communication, and ability to handle an upset patient professionally..."
              />
              <button
                onClick={generateTrialTask}
                disabled={aiLoading && aiTarget === 'task'}
                className="btn-primary text-sm disabled:opacity-50"
              >
                {aiLoading && aiTarget === 'task' ? 'Generating...' : '✦ Generate Trial Task'}
              </button>
            </div>

            <div>
              <label className="form-label">Scenario Introduction</label>
              <textarea className="input-field min-h-[80px] resize-y text-sm" value={job.trial_task_scenario || ''} onChange={e => update('trial_task_scenario', e.target.value)} placeholder="Sets up the scenario for the candidate..." />
            </div>

            <div>
              <label className="form-label">Encounter / Details Block</label>
              <textarea className="input-field min-h-[140px] resize-y text-sm font-mono" value={job.trial_task_encounter || ''} onChange={e => update('trial_task_encounter', e.target.value)} placeholder="The detailed scenario info the candidate reads (patient chart, call notes, etc.)..." />
            </div>

            {/* Questions preview */}
            {(job.trial_task_questions || []).length > 0 && (
              <div>
                <p className="form-label">Generated Questions ({job.trial_task_questions.length})</p>
                <div className="space-y-4">
                  {job.trial_task_questions.map((q, i) => (
                    <div key={i} className="border border-brand-border p-4">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <p className="text-xs uppercase tracking-widest text-brand-sage font-medium">Question {i + 1}</p>
                        <span className="text-xs text-gray-400">{q.rubric?.maxPoints || 0} pts</span>
                      </div>
                      <p className="text-sm text-brand-charcoal mb-3 leading-relaxed">{q.prompt}</p>
                      {q.rubric?.keyItems && (
                        <details className="text-xs">
                          <summary className="text-brand-sage cursor-pointer">View rubric</summary>
                          <div className="mt-2 space-y-1 pl-2">
                            {q.rubric.keyItems.map((item, j) => (
                              <div key={j} className="flex justify-between gap-2 text-gray-600">
                                <span>• {item.item}</span>
                                <span className="flex-shrink-0 font-medium text-brand-charcoal">+{item.points}</span>
                              </div>
                            ))}
                            {q.rubric.bonusItems?.map((item, j) => (
                              <div key={j} className="flex justify-between gap-2 text-brand-sage">
                                <span>★ {item.item}</span>
                                <span className="flex-shrink-0 font-medium">+{item.points}</span>
                              </div>
                            ))}
                          </div>
                        </details>
                      )}
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-400 mt-3">To edit questions, regenerate with a different prompt or edit the JSON directly in the database.</p>
              </div>
            )}

            {(job.trial_task_questions || []).length === 0 && !aiLoading && (
              <div className="border-2 border-dashed border-brand-border p-8 text-center">
                <p className="text-sm text-gray-400">No trial task yet. Use the AI generator above or it will be skipped in the application.</p>
              </div>
            )}
          </div>
        )}

        {/* INTERVIEW TAB */}
        {activeTab === 'interview' && (
          <div className="space-y-6 max-w-2xl">
            <div className="bg-brand-sage-light border border-brand-sage-mid p-5">
              <p className="text-xs uppercase tracking-widest text-brand-forest font-medium mb-1">AI Interview Guide Generator</p>
              <p className="text-xs text-brand-sage mb-3">Claude will generate discussion points and STAR questions tailored to this role.</p>
              <textarea
                className="input-field text-sm min-h-[70px] resize-y mb-3"
                value={aiPrompt}
                onChange={e => setAiPrompt(e.target.value)}
                placeholder="Any additional context for the interview guide..."
              />
              <button
                onClick={generateInterviewGuide}
                disabled={aiLoading && aiTarget === 'interview'}
                className="btn-primary text-sm disabled:opacity-50"
              >
                {aiLoading && aiTarget === 'interview' ? 'Generating...' : '✦ Generate Interview Guide'}
              </button>
            </div>

            {/* Discussion points */}
            {(job.interview_discussion_points || []).length > 0 && (
              <div>
                <p className="form-label">Discussion Points ({job.interview_discussion_points.length})</p>
                <div className="space-y-3">
                  {job.interview_discussion_points.map((dp, i) => (
                    <div key={i} className="border border-brand-border p-4">
                      <p className="text-sm font-medium text-brand-charcoal mb-1">{dp.number}. {dp.label}</p>
                      <ul className="space-y-0.5">
                        {(dp.bullets || []).map((b, j) => (
                          <li key={j} className="text-xs text-gray-500 flex gap-2">
                            <span className="text-brand-sage">–</span>{b}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* STAR questions */}
            {(job.interview_star_questions || []).length > 0 && (
              <div>
                <p className="form-label">STAR Questions</p>
                <div className="space-y-3">
                  {job.interview_star_questions.map((q, i) => (
                    <div key={i} className="border border-brand-border p-4">
                      <p className="text-xs text-brand-sage font-medium mb-1">Q{q.number}</p>
                      <p className="text-sm text-brand-charcoal italic">{q.prompt}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {(job.interview_discussion_points || []).length === 0 && !aiLoading && (
              <div className="border-2 border-dashed border-brand-border p-8 text-center">
                <p className="text-sm text-gray-400">No interview guide yet. Use the AI generator above.</p>
              </div>
            )}
          </div>
        )}

        {/* PREVIEW TAB */}
        {activeTab === 'preview' && (
          <div className="max-w-2xl">
            <div className="bg-brand-cream p-6 space-y-4 text-sm">
              <div>
                <p className="text-xs uppercase tracking-widest text-brand-sage font-medium mb-1">Preview</p>
                <h2 className="font-display text-3xl text-brand-charcoal">{job.title || 'Untitled Job'}</h2>
                {job.client && <p className="text-brand-sage text-sm mt-1">{job.client}</p>}
              </div>
              <div className="flex flex-wrap gap-2">
                {job.job_type && <span className="text-xs bg-white border border-brand-border px-3 py-1">{job.job_type}</span>}
                {job.location && <span className="text-xs bg-white border border-brand-border px-3 py-1">{job.location}</span>}
                {job.compensation && <span className="text-xs bg-brand-sage text-white px-3 py-1">{job.compensation}</span>}
              </div>
              {job.overview && <p className="text-gray-600 leading-relaxed">{job.overview}</p>}
              {job.description && <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">{job.description}</p>}
              {(job.responsibilities || []).length > 0 && (
                <div>
                  <p className="font-medium text-brand-charcoal mb-2">Key Responsibilities</p>
                  <ul className="space-y-1">
                    {job.responsibilities.map((r, i) => <li key={i} className="flex gap-2 text-gray-600"><span className="text-brand-sage mt-1">•</span>{r}</li>)}
                  </ul>
                </div>
              )}
            </div>
            {!isNew && (
              <a href={`/jobs/${job.slug}`} target="_blank" rel="noreferrer" className="inline-block mt-4 text-sm text-brand-sage hover:text-brand-forest underline">
                View live posting ↗
              </a>
            )}
          </div>
        )}

      </main>
    </div>
  )
}

function ListEditor({ label, items, onAdd, onChange, onRemove, placeholder }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="form-label mb-0">{label}</label>
        <button onClick={onAdd} className="text-xs text-brand-sage hover:text-brand-forest">+ Add item</button>
      </div>
      <div className="space-y-2">
        {items.map((item, i) => (
          <div key={i} className="flex gap-2">
            <input className="input-field text-sm" value={item} onChange={e => onChange(i, e.target.value)} placeholder={placeholder} />
            <button onClick={() => onRemove(i)} className="text-red-400 hover:text-red-600 text-xs px-2 flex-shrink-0">✕</button>
          </div>
        ))}
        {items.length === 0 && (
          <button onClick={onAdd} className="w-full border-2 border-dashed border-brand-border p-3 text-xs text-gray-400 hover:border-brand-sage transition-colors">
            + Add first item
          </button>
        )}
      </div>
    </div>
  )
}
