import { useState, useRef, useEffect } from 'react'
import { useNavigate, Link, useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { questions, shuffleAnswers, calculatePersonality } from '../data/assessment'

const STEPS_WITH_TASK = ['Application', 'Trial Task', 'Assessment', 'Review']
const STEPS_WITHOUT_TASK = ['Application', 'Assessment', 'Review']

const shuffledQuestions = questions.map(q => ({ ...q, answers: shuffleAnswers(q.answers) }))

export default function ApplyDynamic() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const topRef = useRef(null)

  const [job, setJob] = useState(null)
  const [loadingJob, setLoadingJob] = useState(true)
  const [step, setStep] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    full_name: '', email: '', phone: '', country: '', city_timezone: '',
    can_work_schedule: '', english_proficiency: '', why_interested: '', why_good_fit: '',
    availability_date: '', linkedin_url: '',
    availability_date: '', linkedin_url: '',
  })
  const [resumeFile, setResumeFile] = useState(null)
  const [taskAnswers, setTaskAnswers] = useState({})
  const [assessmentAnswers, setAssessmentAnswers] = useState(Array(questions.length).fill(null))

  useEffect(() => {
    supabase.from('jobs').select('*').eq('slug', slug).single()
      .then(({ data }) => {
        if (data) setJob(data)
        setLoadingJob(false)
      })
  }, [slug])

  const hasTask = (job?.trial_task_questions || []).length > 0
  const STEPS = hasTask ? STEPS_WITH_TASK : STEPS_WITHOUT_TASK
  const TOTAL_STEPS = STEPS.length

  const scrollTop = () => topRef.current?.scrollIntoView({ behavior: 'smooth' })
  const updateForm = (field, value) => setForm(prev => ({ ...prev, [field]: value }))

  const getTaskStep = () => hasTask ? 1 : null
  const getAssessmentStep = () => hasTask ? 2 : 1
  const getReviewStep = () => hasTask ? 3 : 2

  const validateStep = () => {
    if (step === 0) {
      const required = ['full_name', 'email', 'city_timezone', 'can_work_schedule', 'why_interested', 'why_good_fit']
      for (const f of required) {
        if (!form[f]) { setError('Please complete all required fields.'); return false }
      }
      if (job.resume_required && !resumeFile) {
        setError('A resume is required for this application.'); return false
      }
    }
    if (hasTask && step === getTaskStep()) {
      const tqs = job.trial_task_questions || []
      for (let i = 0; i < tqs.length; i++) {
        if (!taskAnswers[`q${i + 1}`]?.trim()) {
          setError('Please answer all trial task questions.'); return false
        }
      }
    }
    if (step === getAssessmentStep()) {
      if (assessmentAnswers.includes(null)) {
        setError('Please answer all assessment questions.'); return false
      }
    }
    setError(''); return true
  }

  const nextStep = () => { if (!validateStep()) return; setStep(s => s + 1); scrollTop() }
  const prevStep = () => { setStep(s => s - 1); scrollTop() }

  const handleSubmit = async () => {
    setSubmitting(true)
    setError('')
    try {
      // Store resume as base64 in DB — bypasses storage bucket permissions
      let resumePath = null
      let resumeData = null
      if (resumeFile) {
        const base64 = await new Promise((resolve, reject) => {
          const reader = new FileReader()
          reader.onload = () => resolve(reader.result)
          reader.onerror = reject
          reader.readAsDataURL(resumeFile)
        })
        resumeData = base64
        resumePath = resumeFile.name
      }

      const personalityResult = calculatePersonality(assessmentAnswers)

      const record = {
        role: `dynamic-${job.slug}`,
        full_name: form.full_name || null,
        email: form.email || null,
        phone: form.phone || null,
        country: form.country || null,
        city_timezone: form.city_timezone || null,
        can_work_pacific: form.can_work_schedule || null,
        english_proficiency: job.ask_english_proficiency ? (form.english_proficiency || null) : null,
        why_interested: form.why_interested || null,
        why_good_fit: form.why_good_fit || null,
        linkedin_url: form.linkedin_url || null,
        resume_path: resumePath,
        resume_data: resumeData,
        trial_task_responses: hasTask ? taskAnswers : null,
        assessment_answers: assessmentAnswers,
        personality_dominant: personalityResult.dominant || null,
        personality_secondary: personalityResult.secondary || null,
        personality_scores: personalityResult.scores,
        status: 'New',
        internal_notes: form.availability_date ? `Availability: ${form.availability_date}` : null,
      }

      const { error: insertError } = await supabase.from('applications').insert([record])
      if (insertError) throw new Error(`Submission failed: ${insertError.message}`)

      const ref = job.client?.slice(0, 2).toUpperCase() + '-' + Date.now().toString(36).toUpperCase().slice(-5)
      navigate(`/confirmation?ref=${ref}`)
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  if (loadingJob) return <div className="min-h-screen flex items-center justify-center"><p className="text-sm text-gray-400">Loading...</p></div>
  if (!job) return <div className="min-h-screen flex items-center justify-center"><p className="text-sm text-red-400">Job not found.</p></div>
  if (!job.is_open) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <p className="font-display text-2xl text-brand-charcoal mb-2">This position is no longer accepting applications.</p>
        <Link to="/jobs" className="text-sm text-brand-sage hover:underline">← View open positions</Link>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-white" ref={topRef}>
      <header className="border-b border-brand-border px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <Link to={`/jobs/${job.slug}`} className="font-body text-sm font-black tracking-widest uppercase">
            <span className="text-brand-charcoal">INSIGHT</span><span className="text-brand-sage font-normal">ASSIST</span>
          </Link>
          <span className="text-sm text-gray-400 truncate ml-4">{job.title}</span>
        </div>
      </header>

      {/* Progress */}
      <div className="border-b border-brand-border">
        <div className="max-w-3xl mx-auto px-6 py-4">
          <div className="flex items-center gap-2">
            {STEPS.map((label, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className={`flex items-center gap-1.5 text-xs font-medium ${i === step ? 'text-brand-forest' : i < step ? 'text-brand-sage' : 'text-gray-300'}`}>
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs border ${i === step ? 'border-brand-forest text-brand-forest bg-white' : i < step ? 'border-brand-sage bg-brand-sage text-white' : 'border-gray-200 text-gray-300'}`}>
                    {i < step ? '✓' : i + 1}
                  </span>
                  <span className="hidden sm:block">{label}</span>
                </div>
                {i < STEPS.length - 1 && <div className={`h-px w-6 ${i < step ? 'bg-brand-sage' : 'bg-gray-200'}`} />}
              </div>
            ))}
          </div>
        </div>
      </div>

      <main className="max-w-3xl mx-auto px-6 py-10">
        {error && <div className="mb-6 px-4 py-3 bg-red-50 border border-red-200 text-red-700 text-sm">{error}</div>}

        {step === 0 && <DynamicAppForm job={job} form={form} updateForm={updateForm} resumeFile={resumeFile} setResumeFile={setResumeFile} resumeRequired={job.resume_required || false} askEnglish={job.ask_english_proficiency || false} />}
        {hasTask && step === getTaskStep() && <DynamicTaskStep job={job} taskAnswers={taskAnswers} setTaskAnswers={setTaskAnswers} />}
        {step === getAssessmentStep() && <AssessmentStep questions={shuffledQuestions} answers={assessmentAnswers} setAnswers={setAssessmentAnswers} />}
        {step === getReviewStep() && <ReviewStep job={job} form={form} resumeFile={resumeFile} hasTask={hasTask} resumeRequired={job.resume_required || false} />}

        <div className="mt-10 flex justify-between items-center border-t border-brand-border pt-6">
          {step > 0
            ? <button onClick={prevStep} className="btn-secondary">Back</button>
            : <Link to={`/jobs/${job.slug}`} className="text-sm text-gray-400 hover:text-brand-charcoal">Back to posting</Link>
          }
          {step < TOTAL_STEPS - 1
            ? <button onClick={nextStep} className="btn-primary">Continue</button>
            : <button onClick={handleSubmit} disabled={submitting} className="btn-primary disabled:opacity-50">{submitting ? 'Submitting...' : 'Submit Application'}</button>
          }
        </div>
      </main>
    </div>
  )
}

function DynamicAppForm({ job, form, updateForm, resumeFile, setResumeFile, resumeRequired, askEnglish }) {
  return (
    <div>
      <h2 className="font-display text-3xl text-brand-charcoal mb-1">Your Application</h2>
      <p className="text-sm text-gray-500 mb-8">{job.title}{job.client ? ` · ${job.client}` : ''}</p>
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div><label className="form-label">Full Name *</label><input className="input-field" value={form.full_name} onChange={e => updateForm('full_name', e.target.value)} placeholder="Your full name" /></div>
          <div><label className="form-label">Email *</label><input className="input-field" type="email" value={form.email} onChange={e => updateForm('email', e.target.value)} placeholder="you@email.com" /></div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div><label className="form-label">Phone</label><input className="input-field" value={form.phone} onChange={e => updateForm('phone', e.target.value)} /></div>
          <div><label className="form-label">City / Location *</label><input className="input-field" value={form.city_timezone} onChange={e => updateForm('city_timezone', e.target.value)} placeholder="City, State" /></div>
        </div>
        <div>
          <label className="form-label">Are you available for the required schedule? *</label>
          <div className="flex gap-4 mt-2">
            {['Yes', 'No'].map(v => (
              <label key={v} className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="schedule" value={v} checked={form.can_work_schedule === v} onChange={() => updateForm('can_work_schedule', v)} className="accent-brand-forest" />
                <span className="text-sm">{v}</span>
              </label>
            ))}
          </div>
        </div>
        <div>
          <label className="form-label">Earliest Available Start Date</label>
          <input className="input-field max-w-[200px]" type="date" value={form.availability_date} onChange={e => updateForm('availability_date', e.target.value)} />
        </div>
        <div className="section-divider" />
        <div><label className="form-label">Why are you interested in this role? *</label><textarea className="input-field min-h-[100px] resize-y" value={form.why_interested} onChange={e => updateForm('why_interested', e.target.value)} placeholder="Tell us what draws you to this opportunity..." /></div>
        <div><label className="form-label">What makes you a strong fit for this position? *</label><textarea className="input-field min-h-[100px] resize-y" value={form.why_good_fit} onChange={e => updateForm('why_good_fit', e.target.value)} placeholder="Share relevant skills, experience, or qualities..." /></div>
        {askEnglish && (
          <div>
            <label className="form-label">English Proficiency (self-rating) *</label>
            <select className="input-field" value={form.english_proficiency} onChange={e => updateForm('english_proficiency', e.target.value)}>
              <option value="">Select...</option>
              <option>Basic</option>
              <option>Intermediate</option>
              <option>Advanced</option>
              <option>Fluent / Native</option>
            </select>
          </div>
        )}
        <div className="section-divider" />
        <div>
          <label className="form-label">Resume Upload {resumeRequired ? '*' : '(optional)'}</label>
          <label className="block cursor-pointer">
            <div className={`border-2 border-dashed p-6 text-center transition-colors ${resumeFile ? 'border-brand-sage bg-brand-sage-light' : 'border-brand-border hover:border-brand-sage'}`}>
              {resumeFile ? <div><p className="text-sm font-medium text-brand-forest">{resumeFile.name}</p><p className="text-xs text-gray-400 mt-1">Click to change</p></div>
                : <div><p className="text-sm text-gray-500">{resumeRequired ? 'Click to upload your resume' : 'Click to upload resume (optional)'}</p><p className="text-xs text-gray-400 mt-1">PDF or Word, max 5MB</p></div>}
            </div>
            <input type="file" accept=".pdf,.doc,.docx" className="hidden" onChange={e => setResumeFile(e.target.files[0] || null)} />
          </label>
        </div>
        <div><label className="form-label">LinkedIn or Portfolio (optional)</label><input className="input-field" value={form.linkedin_url} onChange={e => updateForm('linkedin_url', e.target.value)} placeholder="https://linkedin.com/in/..." /></div>
      </div>
    </div>
  )
}

function DynamicTaskStep({ job, taskAnswers, setTaskAnswers }) {
  const tqs = job.trial_task_questions || []
  return (
    <div>
      <h2 className="font-display text-3xl text-brand-charcoal mb-1">Trial Task</h2>
      <p className="text-sm text-gray-500 mb-2">This should take approximately 5-10 minutes.</p>
      <p className="text-xs text-brand-sage font-medium uppercase tracking-wide mb-8">There are no trick questions. We want to see how you think.</p>

      {(job.trial_task_scenario || job.trial_task_encounter) && (
        <div className="bg-brand-cream p-6 mb-8 text-sm leading-relaxed text-brand-charcoal">
          <p className="font-medium mb-3 text-xs uppercase tracking-widest text-brand-sage">Scenario</p>
          {job.trial_task_scenario && <p className="mb-4">{job.trial_task_scenario}</p>}
          {job.trial_task_encounter && (
            <div className="border-l-2 border-brand-sage-mid pl-4 text-xs leading-relaxed font-mono text-brand-forest">
              {job.trial_task_encounter.split('\n').map((line, i) => <p key={i} className="py-0.5">{line || '\u00A0'}</p>)}
            </div>
          )}
        </div>
      )}

      <div className="space-y-8">
        {tqs.map((q, qi) => (
          <div key={q.id || qi}>
            <p className="text-xs uppercase tracking-widest text-brand-sage font-medium mb-2">Question {qi + 1} of {tqs.length}</p>
            <p className="text-sm font-medium text-brand-charcoal mb-3 leading-relaxed">{q.prompt}</p>
            <textarea
              className={`input-field min-h-[120px] resize-y text-sm ${q.type === 'calculation' ? 'font-mono' : ''}`}
              value={taskAnswers[`q${qi + 1}`] || ''}
              onChange={e => setTaskAnswers(p => ({ ...p, [`q${qi + 1}`]: e.target.value }))}
              placeholder={q.type === 'calculation' ? 'Show your math step by step...' : 'Your response...'}
            />
          </div>
        ))}
      </div>
    </div>
  )
}

function AssessmentStep({ questions, answers, setAnswers }) {
  const updateAnswer = (qIdx, type) => { const u = [...answers]; u[qIdx] = type; setAnswers(u) }
  const answered = answers.filter(a => a !== null).length
  return (
    <div>
      <h2 className="font-display text-3xl text-brand-charcoal mb-1">Workplace Personality Assessment</h2>
      <p className="text-sm text-gray-500 mb-2">20 questions. No right or wrong answers.</p>
      <p className="text-xs text-brand-sage font-medium uppercase tracking-wide mb-8">{answered} of {questions.length} answered</p>
      <div className="space-y-8">
        {questions.map((q, qIdx) => (
          <div key={q.id} className="pb-8 border-b border-brand-border last:border-0">
            <p className="text-xs text-gray-400 mb-2">Question {qIdx + 1}</p>
            <p className="text-sm font-medium text-brand-charcoal mb-4 leading-relaxed">{q.text}</p>
            <div className="space-y-2">
              {q.answers.map((ans, aIdx) => (
                <label key={aIdx} className={`flex items-start gap-3 cursor-pointer p-3 border transition-colors ${answers[qIdx] === ans.type ? 'border-brand-forest bg-brand-sage-light' : 'border-brand-border hover:border-brand-sage-mid'}`}>
                  <input type="radio" name={`q${q.id}`} checked={answers[qIdx] === ans.type} onChange={() => updateAnswer(qIdx, ans.type)} className="mt-0.5 accent-brand-forest flex-shrink-0" />
                  <span className="text-sm text-brand-charcoal">{ans.text}</span>
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function ReviewStep({ job, form, resumeFile, hasTask, resumeRequired }) {
  return (
    <div>
      <h2 className="font-display text-3xl text-brand-charcoal mb-2">Review & Submit</h2>
      <p className="text-sm text-gray-500 mb-8">Please confirm your information before submitting.</p>
      <div className="space-y-4 text-sm">
        <div className="bg-brand-cream p-5 space-y-2">
          <p className="font-medium text-brand-charcoal">{form.full_name}</p>
          <p className="text-gray-500">{form.email}</p>
          <p className="text-gray-500">{form.city_timezone}</p>
          {form.availability_date && <p className="text-gray-500">Available from: {form.availability_date}</p>}
        </div>
        {resumeFile && (
          <div className="border border-brand-border p-4 flex items-center gap-2 text-gray-500">
            <span>📄</span><span className="text-sm">{resumeFile.name}</span>
          </div>
        )}
        {resumeRequired && !resumeFile && (
          <div className="border border-red-200 bg-red-50 p-3 text-xs text-red-600">
            Resume is required — please go back and upload your resume.
          </div>
        )}
        <div className="border border-brand-sage-mid p-4 bg-brand-sage-light">
          <p className="text-xs font-medium text-brand-forest uppercase tracking-wide mb-2">Included in your application</p>
          <ul className="text-xs text-brand-forest space-y-0.5">
            <li>✓ Application form completed</li>
            {resumeFile && <li>✓ Resume uploaded</li>}
            {resumeRequired && !resumeFile && <li className="text-red-400">✗ Resume missing (required)</li>}
            {hasTask && <li>✓ Trial task responses</li>}
            <li>✓ Workplace Personality Assessment</li>
          </ul>
        </div>
        <p className="text-xs text-gray-400">By submitting, you confirm all information is accurate.</p>
      </div>
    </div>
  )
}
