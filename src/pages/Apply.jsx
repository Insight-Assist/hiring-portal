import { useState, useRef } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { questions, shuffleAnswers, calculatePersonality } from '../data/assessment'
import { trialTask } from '../data/trialTask'

const STEPS = ['Application', 'Trial Task', 'Assessment', 'Review']
const TOTAL_STEPS = STEPS.length

// Initialize shuffled answers once
const shuffledQuestions = questions.map(q => ({
  ...q,
  answers: shuffleAnswers(q.answers)
}))

export default function Apply() {
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const topRef = useRef(null)

  // Form state
  const [form, setForm] = useState({
    full_name: '', email: '', phone: '', country: '', city_timezone: '',
    can_work_pacific: '', english_proficiency: '',
    exp_scribing: '', exp_insurance: '', exp_billing: '', exp_admin: '',
    why_interested: '', why_good_fit: '', linkedin_url: '',
  })
  const [resumeFile, setResumeFile] = useState(null)

  // Trial task state
  const [taskAnswers, setTaskAnswers] = useState({ q1: '', q2: '', q3: '', q4: [] })

  // Assessment state
  const [assessmentAnswers, setAssessmentAnswers] = useState(Array(questions.length).fill(null))

  const scrollTop = () => topRef.current?.scrollIntoView({ behavior: 'smooth' })

  const updateForm = (field, value) => setForm(prev => ({ ...prev, [field]: value }))

  const validateStep = () => {
    if (step === 0) {
      const required = ['full_name', 'email', 'country', 'city_timezone', 'can_work_pacific',
        'english_proficiency', 'why_interested', 'why_good_fit']
      for (const f of required) {
        if (!form[f]) { setError(`Please complete all required fields.`); return false }
      }
      if (!resumeFile) { setError('Please upload your resume.'); return false }
    }
    if (step === 1) {
      if (!taskAnswers.q1.trim() || !taskAnswers.q2.trim() || !taskAnswers.q3.trim()) {
        setError('Please complete all trial task questions.'); return false
      }
      if (taskAnswers.q4.length < 5) {
        setError('Please rank all five items in the prioritization task.'); return false
      }
    }
    if (step === 2) {
      if (assessmentAnswers.includes(null)) {
        setError('Please answer all assessment questions.'); return false
      }
    }
    setError('')
    return true
  }

  const nextStep = () => {
    if (!validateStep()) return
    setStep(s => s + 1)
    scrollTop()
  }

  const prevStep = () => { setStep(s => s - 1); scrollTop() }

  const handleSubmit = async () => {
    setSubmitting(true)
    setError('')
    try {
      // 1. Upload resume to Supabase Storage
      const ext = resumeFile.name.split('.').pop()
      const fileName = `${Date.now()}_${form.full_name.replace(/\s+/g, '_')}.${ext}`
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('resumes')
        .upload(fileName, resumeFile)
      if (uploadError) throw uploadError

      // 2. Calculate personality result
      const personalityResult = calculatePersonality(assessmentAnswers)

      // 3. Insert application record
      const { data, error: insertError } = await supabase.from('applications').insert([{
        ...form,
        resume_path: uploadData.path,
        trial_task_responses: taskAnswers,
        assessment_answers: assessmentAnswers,
        personality_dominant: personalityResult.dominant,
        personality_secondary: personalityResult.secondary,
        personality_scores: personalityResult.scores,
        status: 'New',
        submitted_at: new Date().toISOString(),
      }]).select()

      if (insertError) throw insertError
      navigate('/confirmation')
    } catch (err) {
      setError('Something went wrong. Please try again or email kim@insight-assist.net.')
      console.error(err)
    } finally {
      setSubmitting(false)
    }
  }

  // Drag state for prioritization
  const [dragItem, setDragItem] = useState(null)
  const initPriorityItems = trialTask.questions[3].items

  const getPriorityList = () => {
    if (taskAnswers.q4.length === 0) return initPriorityItems
    return taskAnswers.q4.map(id => initPriorityItems.find(i => i.id === id))
  }

  const handleDragStart = (id) => setDragItem(id)
  const handleDrop = (targetId) => {
    const list = getPriorityList().map(i => i.id)
    const from = list.indexOf(dragItem)
    const to = list.indexOf(targetId)
    const updated = [...list]
    updated.splice(from, 1)
    updated.splice(to, 0, dragItem)
    setTaskAnswers(prev => ({ ...prev, q4: updated }))
    setDragItem(null)
  }

  return (
    <div className="min-h-screen bg-white" ref={topRef}>
      {/* Header */}
      <header className="border-b border-brand-border px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <Link to="/" className="font-display text-xl text-brand-charcoal">Insight Assist</Link>
          <span className="text-sm text-gray-400">Remote Medical Scribe Application</span>
        </div>
      </header>

      {/* Progress */}
      <div className="border-b border-brand-border">
        <div className="max-w-3xl mx-auto px-6 py-4">
          <div className="flex items-center gap-2">
            {STEPS.map((label, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className={`flex items-center gap-1.5 text-xs font-medium ${
                  i === step ? 'text-brand-forest' : i < step ? 'text-brand-sage' : 'text-gray-300'
                }`}>
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs border ${
                    i === step ? 'border-brand-forest text-brand-forest bg-white' :
                    i < step ? 'border-brand-sage bg-brand-sage text-white' :
                    'border-gray-200 text-gray-300'
                  }`}>
                    {i < step ? '✓' : i + 1}
                  </span>
                  <span className="hidden sm:block">{label}</span>
                </div>
                {i < STEPS.length - 1 && (
                  <div className={`h-px w-6 ${i < step ? 'bg-brand-sage' : 'bg-gray-200'}`} />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <main className="max-w-3xl mx-auto px-6 py-10">
        {error && (
          <div className="mb-6 px-4 py-3 bg-red-50 border border-red-200 text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* STEP 0: Application Form */}
        {step === 0 && <ApplicationForm form={form} updateForm={updateForm} resumeFile={resumeFile} setResumeFile={setResumeFile} />}

        {/* STEP 1: Trial Task */}
        {step === 1 && (
          <TrialTaskStep
            taskAnswers={taskAnswers}
            setTaskAnswers={setTaskAnswers}
            priorityList={getPriorityList()}
            onDragStart={handleDragStart}
            onDrop={handleDrop}
            dragItem={dragItem}
          />
        )}

        {/* STEP 2: Personality Assessment */}
        {step === 2 && (
          <AssessmentStep
            questions={shuffledQuestions}
            answers={assessmentAnswers}
            setAnswers={setAssessmentAnswers}
          />
        )}

        {/* STEP 3: Review */}
        {step === 3 && (
          <ReviewStep form={form} resumeFile={resumeFile} />
        )}

        {/* Navigation */}
        <div className="mt-10 flex justify-between items-center border-t border-brand-border pt-6">
          {step > 0 ? (
            <button onClick={prevStep} className="btn-secondary">Back</button>
          ) : (
            <Link to="/" className="text-sm text-gray-400 hover:text-brand-charcoal transition-colors">
              ← Back to posting
            </Link>
          )}

          {step < TOTAL_STEPS - 1 ? (
            <button onClick={nextStep} className="btn-primary">
              Continue
            </button>
          ) : (
            <button onClick={handleSubmit} disabled={submitting} className="btn-primary disabled:opacity-50">
              {submitting ? 'Submitting...' : 'Submit Application'}
            </button>
          )}
        </div>
      </main>
    </div>
  )
}

// ---- Sub-components ----

function ApplicationForm({ form, updateForm, resumeFile, setResumeFile }) {
  const expOptions = ['0', '< 1 year', '1–2 years', '3–5 years', '5+ years']

  return (
    <div>
      <h2 className="font-display text-3xl text-brand-charcoal mb-1">Your Application</h2>
      <p className="text-sm text-gray-500 mb-8">All fields marked * are required.</p>

      <div className="space-y-6">
        {/* Basic info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="form-label">Full Name *</label>
            <input className="input-field" value={form.full_name} onChange={e => updateForm('full_name', e.target.value)} placeholder="Your full name" />
          </div>
          <div>
            <label className="form-label">Email Address *</label>
            <input className="input-field" type="email" value={form.email} onChange={e => updateForm('email', e.target.value)} placeholder="you@email.com" />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="form-label">Phone / WhatsApp</label>
            <input className="input-field" value={form.phone} onChange={e => updateForm('phone', e.target.value)} placeholder="+54 9 11 ..." />
          </div>
          <div>
            <label className="form-label">Country *</label>
            <input className="input-field" value={form.country} onChange={e => updateForm('country', e.target.value)} placeholder="e.g. Argentina" />
          </div>
        </div>

        <div>
          <label className="form-label">City / Time Zone *</label>
          <input className="input-field" value={form.city_timezone} onChange={e => updateForm('city_timezone', e.target.value)} placeholder="e.g. Buenos Aires (ART, UTC-3)" />
        </div>

        <div>
          <label className="form-label">
            Are you able to work the required Pacific Time schedule (Mon–Thu 8 AM–5 PM, Fri 8 AM–2 PM) and adjust for daylight savings? *
          </label>
          <div className="flex gap-4 mt-2">
            {['Yes', 'No'].map(v => (
              <label key={v} className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="pacific" value={v} checked={form.can_work_pacific === v}
                  onChange={() => updateForm('can_work_pacific', v)} className="accent-brand-forest" />
                <span className="text-sm">{v}</span>
              </label>
            ))}
          </div>
        </div>

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

        <div className="section-divider" />

        {/* Experience */}
        <div>
          <p className="form-label mb-3">Years of Experience</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { field: 'exp_scribing', label: 'Medical Scribing' },
              { field: 'exp_insurance', label: 'Insurance Verification' },
              { field: 'exp_billing', label: 'Medical Billing' },
              { field: 'exp_admin', label: 'Healthcare Administration' },
            ].map(({ field, label }) => (
              <div key={field}>
                <label className="form-label text-xs text-gray-500">{label}</label>
                <select className="input-field" value={form[field]} onChange={e => updateForm(field, e.target.value)}>
                  <option value="">Select...</option>
                  {expOptions.map(o => <option key={o}>{o}</option>)}
                </select>
              </div>
            ))}
          </div>
        </div>

        <div className="section-divider" />

        {/* Short answers */}
        <div>
          <label className="form-label">Why are you interested in this role? *</label>
          <textarea className="input-field min-h-[100px] resize-y" value={form.why_interested}
            onChange={e => updateForm('why_interested', e.target.value)}
            placeholder="Tell us what draws you to this opportunity..." />
        </div>

        <div>
          <label className="form-label">What makes you good at supporting a provider and reducing mental load? *</label>
          <textarea className="input-field min-h-[100px] resize-y" value={form.why_good_fit}
            onChange={e => updateForm('why_good_fit', e.target.value)}
            placeholder="Share specific examples or qualities..." />
        </div>

        <div className="section-divider" />

        {/* Resume upload */}
        <div>
          <label className="form-label">Resume Upload *</label>
          <label className="block cursor-pointer">
            <div className={`border-2 border-dashed p-6 text-center transition-colors ${
              resumeFile ? 'border-brand-sage bg-brand-sage-light' : 'border-brand-border hover:border-brand-sage'
            }`}>
              {resumeFile ? (
                <div>
                  <p className="text-sm font-medium text-brand-forest">{resumeFile.name}</p>
                  <p className="text-xs text-gray-400 mt-1">Click to change file</p>
                </div>
              ) : (
                <div>
                  <p className="text-sm text-gray-500">Click to upload your resume</p>
                  <p className="text-xs text-gray-400 mt-1">PDF or Word document, max 5MB</p>
                </div>
              )}
            </div>
            <input type="file" accept=".pdf,.doc,.docx" className="hidden"
              onChange={e => setResumeFile(e.target.files[0] || null)} />
          </label>
        </div>

        <div>
          <label className="form-label">LinkedIn or Portfolio URL (optional)</label>
          <input className="input-field" value={form.linkedin_url}
            onChange={e => updateForm('linkedin_url', e.target.value)}
            placeholder="https://linkedin.com/in/..." />
        </div>
      </div>
    </div>
  )
}

function TrialTaskStep({ taskAnswers, setTaskAnswers, priorityList, onDragStart, onDrop, dragItem }) {
  const { scenario, encounterSummary, questions: tq } = trialTask

  return (
    <div>
      <h2 className="font-display text-3xl text-brand-charcoal mb-1">Trial Task</h2>
      <p className="text-sm text-gray-500 mb-2">This should take approximately 5–10 minutes. Read the scenario carefully before answering.</p>
      <p className="text-xs text-brand-sage font-medium uppercase tracking-wide mb-8">There are no trick questions. We want to see how you think.</p>

      {/* Scenario */}
      <div className="bg-brand-cream p-6 mb-8 text-sm leading-relaxed text-brand-charcoal">
        <p className="font-medium mb-3 text-xs uppercase tracking-widest text-brand-sage">Scenario</p>
        <p className="mb-4">{scenario}</p>
        <div className="border-l-2 border-brand-sage-mid pl-4 space-y-1 text-xs leading-relaxed font-mono text-brand-forest">
          {encounterSummary.split('\n').map((line, i) => (
            <p key={i}>{line || '\u00A0'}</p>
          ))}
        </div>
      </div>

      <div className="space-y-8">
        {/* Q1 */}
        <div>
          <p className="text-xs uppercase tracking-widest text-brand-sage font-medium mb-2">Question 1 of 4</p>
          <p className="text-sm font-medium text-brand-charcoal mb-3 leading-relaxed">{tq[0].prompt}</p>
          <textarea
            className="input-field min-h-[140px] resize-y text-sm"
            value={taskAnswers.q1}
            onChange={e => setTaskAnswers(p => ({ ...p, q1: e.target.value }))}
            placeholder="List everything — be thorough and specific."
          />
        </div>

        {/* Q2 */}
        <div>
          <p className="text-xs uppercase tracking-widest text-brand-sage font-medium mb-2">Question 2 of 4</p>
          <p className="text-sm font-medium text-brand-charcoal mb-3 leading-relaxed">{tq[1].prompt}</p>
          <textarea
            className="input-field min-h-[120px] resize-y text-sm"
            value={taskAnswers.q2}
            onChange={e => setTaskAnswers(p => ({ ...p, q2: e.target.value }))}
            placeholder="Describe your approach..."
          />
        </div>

        {/* Q3 */}
        <div>
          <p className="text-xs uppercase tracking-widest text-brand-sage font-medium mb-2">Question 3 of 4</p>
          <p className="text-sm font-medium text-brand-charcoal mb-3 leading-relaxed">{tq[2].prompt}</p>
          <textarea
            className="input-field min-h-[140px] resize-y text-sm"
            value={taskAnswers.q3}
            onChange={e => setTaskAnswers(p => ({ ...p, q3: e.target.value }))}
            placeholder="Write your message to Dr. Beth here..."
          />
        </div>

        {/* Q4: Drag prioritization */}
        <div>
          <p className="text-xs uppercase tracking-widest text-brand-sage font-medium mb-2">Question 4 of 4</p>
          <p className="text-sm font-medium text-brand-charcoal mb-2 leading-relaxed">{tq[3].prompt}</p>
          <p className="text-xs text-gray-400 mb-4">Drag to reorder from most urgent (top) to least urgent (bottom).</p>

          <div className="space-y-2">
            {priorityList.map((item, idx) => (
              <div
                key={item.id}
                draggable
                onDragStart={() => onDragStart(item.id)}
                onDragOver={e => e.preventDefault()}
                onDrop={() => onDrop(item.id)}
                className={`flex items-center gap-3 border border-brand-border p-3 cursor-grab bg-white select-none transition-colors ${
                  dragItem === item.id ? 'opacity-40' : 'hover:border-brand-sage'
                }`}
              >
                <span className="text-xs font-medium text-brand-sage w-4">{idx + 1}</span>
                <span className="text-gray-300 mr-1">⠿</span>
                <span className="text-sm text-brand-charcoal">{item.text}</span>
              </div>
            ))}
          </div>

          <div className="mt-4">
            <label className="form-label text-xs">Briefly explain your reasoning:</label>
            <textarea
              className="input-field min-h-[80px] resize-y text-sm"
              value={taskAnswers.q4_reasoning || ''}
              onChange={e => setTaskAnswers(p => ({ ...p, q4_reasoning: e.target.value }))}
              placeholder="Why did you prioritize in this order?"
            />
          </div>
        </div>
      </div>
    </div>
  )
}

function AssessmentStep({ questions, answers, setAnswers }) {
  const updateAnswer = (qIdx, type) => {
    const updated = [...answers]
    updated[qIdx] = type
    setAnswers(updated)
  }

  const answered = answers.filter(a => a !== null).length

  return (
    <div>
      <h2 className="font-display text-3xl text-brand-charcoal mb-1">Workplace Personality Assessment</h2>
      <p className="text-sm text-gray-500 mb-2">20 questions. There are no right or wrong answers — choose what feels most true for you.</p>
      <p className="text-xs text-brand-sage font-medium uppercase tracking-wide mb-8">
        {answered} of {questions.length} answered
      </p>

      <div className="space-y-8">
        {questions.map((q, qIdx) => (
          <div key={q.id} className={`pb-8 border-b border-brand-border last:border-0`}>
            <p className="text-xs text-gray-400 mb-2">Question {qIdx + 1}</p>
            <p className="text-sm font-medium text-brand-charcoal mb-4 leading-relaxed">{q.text}</p>
            <div className="space-y-2">
              {q.answers.map((ans, aIdx) => (
                <label key={aIdx} className={`flex items-start gap-3 cursor-pointer p-3 border transition-colors ${
                  answers[qIdx] === ans.type
                    ? 'border-brand-forest bg-brand-sage-light'
                    : 'border-brand-border hover:border-brand-sage-mid'
                }`}>
                  <input
                    type="radio"
                    name={`q${q.id}`}
                    checked={answers[qIdx] === ans.type}
                    onChange={() => updateAnswer(qIdx, ans.type)}
                    className="mt-0.5 accent-brand-forest flex-shrink-0"
                  />
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

function ReviewStep({ form, resumeFile }) {
  return (
    <div>
      <h2 className="font-display text-3xl text-brand-charcoal mb-2">Review & Submit</h2>
      <p className="text-sm text-gray-500 mb-8">Please confirm your information before submitting.</p>

      <div className="space-y-4 text-sm">
        <div className="bg-brand-cream p-5 space-y-2">
          <p className="font-medium text-brand-charcoal">{form.full_name}</p>
          <p className="text-gray-500">{form.email}</p>
          <p className="text-gray-500">{form.city_timezone}, {form.country}</p>
          <p className="text-gray-500">English: {form.english_proficiency}</p>
        </div>
        <div className="border border-brand-border p-4 flex items-center gap-2 text-gray-500">
          <span>📄</span>
          <span className="text-sm">{resumeFile?.name || 'Resume uploaded'}</span>
        </div>
        <div className="border border-brand-sage-mid p-4 bg-brand-sage-light">
          <p className="text-xs font-medium text-brand-forest uppercase tracking-wide mb-1">Included in your application</p>
          <ul className="text-xs text-brand-forest space-y-0.5 mt-2">
            <li>✓ Application form completed</li>
            <li>✓ Resume uploaded</li>
            <li>✓ Trial task responses</li>
            <li>✓ Workplace Personality Assessment</li>
          </ul>
        </div>
        <p className="text-xs text-gray-400">
          By submitting, you confirm that all information provided is accurate. We will be in touch if your application moves forward.
        </p>
      </div>
    </div>
  )
}
