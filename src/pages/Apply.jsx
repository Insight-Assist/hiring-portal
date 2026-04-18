import { useState, useRef } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { questions, shuffleAnswers, calculatePersonality } from '../data/assessment'
import { trialTask } from '../data/trialTask'

const STEPS = ['Application', 'Trial Task', 'Assessment', 'Review']
const TOTAL_STEPS = STEPS.length

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

  const [form, setForm] = useState({
    full_name: '', email: '', phone: '', country: '', city_timezone: '',
    can_work_pacific: '', english_proficiency: '',
    exp_scribing: '', exp_insurance: '', exp_billing: '', exp_admin: '',
    why_interested: '', why_good_fit: '', linkedin_url: '',
  })
  const [resumeFile, setResumeFile] = useState(null)
  const [taskAnswers, setTaskAnswers] = useState({ q1: '', q2: '', q3: '', q4: [] })
  const [assessmentAnswers, setAssessmentAnswers] = useState(Array(questions.length).fill(null))

  const scrollTop = () => topRef.current?.scrollIntoView({ behavior: 'smooth' })
  const updateForm = (field, value) => setForm(prev => ({ ...prev, [field]: value }))

  const initPriorityItems = trialTask.questions[3].items

  const getPriorityList = () => {
    if (taskAnswers.q4.length === 0) return initPriorityItems
    return taskAnswers.q4.map(id => initPriorityItems.find(i => i.id === id))
  }

  const moveItem = (idx, direction) => {
    const list = getPriorityList().map(i => i.id)
    const newIdx = idx + direction
    if (newIdx < 0 || newIdx >= list.length) return
    const updated = [...list]
    const temp = updated[idx]
    updated[idx] = updated[newIdx]
    updated[newIdx] = temp
    setTaskAnswers(prev => ({ ...prev, q4: updated }))
  }

  const validateStep = () => {
    if (step === 0) {
      const required = ['full_name', 'email', 'country', 'city_timezone', 'can_work_pacific', 'english_proficiency', 'why_interested', 'why_good_fit']
      for (const f of required) {
        if (!form[f]) { setError('Please complete all required fields.'); return false }
      }
      if (!resumeFile) { setError('Please upload your resume.'); return false }
    }
    if (step === 1) {
      if (!taskAnswers.q1.trim() || !taskAnswers.q2.trim() || !taskAnswers.q3.trim()) {
        setError('Please complete all trial task questions.'); return false
      }
      if (taskAnswers.q4.length < 5) {
        setError('Please rank all five items using the up and down arrows.'); return false
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
      const ext = resumeFile.name.split('.').pop()
      const fileName = `${Date.now()}_${form.full_name.replace(/\s+/g, '_')}.${ext}`
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('resumes')
        .upload(fileName, resumeFile)
      if (uploadError) throw new Error(`Resume upload failed: ${uploadError.message}`)

      const personalityResult = calculatePersonality(assessmentAnswers)

      const record = {
        full_name: form.full_name || null,
        email: form.email || null,
        phone: form.phone || null,
        country: form.country || null,
        city_timezone: form.city_timezone || null,
        can_work_pacific: form.can_work_pacific || null,
        english_proficiency: form.english_proficiency || null,
        exp_scribing: form.exp_scribing || null,
        exp_insurance: form.exp_insurance || null,
        exp_billing: form.exp_billing || null,
        exp_admin: form.exp_admin || null,
        why_interested: form.why_interested || null,
        why_good_fit: form.why_good_fit || null,
        linkedin_url: form.linkedin_url || null,
        resume_path: uploadData.path,
        trial_task_responses: taskAnswers,
        assessment_answers: assessmentAnswers,
        personality_dominant: personalityResult.dominant || null,
        personality_secondary: personalityResult.secondary || null,
        personality_scores: personalityResult.scores,
        status: 'New',
      }

      const { error: insertError } = await supabase.from('applications').insert([record])
      if (insertError) throw new Error(`Submission failed: ${insertError.message}`)

      navigate('/confirmation')
    } catch (err) {
      console.error('Submit error:', err)
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-white" ref={topRef}>
      <header className="border-b border-brand-border px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <Link to="/" className="font-body text-sm font-black tracking-widest uppercase">
            <span className="text-brand-charcoal">INSIGHT</span><span className="text-brand-sage font-normal">ASSIST</span>
          </Link>
          <span className="text-sm text-gray-400">Remote Medical Scribe Application</span>
        </div>
      </header>

      <div className="border-b border-brand-border">
        <div className="max-w-3xl mx-auto px-6 py-4">
          <div className="flex items-center gap-2">
            {STEPS.map((label, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className={`flex items-center gap-1.5 text-xs font-medium ${i === step ? 'text-brand-forest' : i < step ? 'text-brand-sage' : 'text-gray-300'}`}>
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs border ${
                    i === step ? 'border-brand-forest text-brand-forest bg-white' :
                    i < step ? 'border-brand-sage bg-brand-sage text-white' :
                    'border-gray-200 text-gray-300'
                  }`}>
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
        {error && (
          <div className="mb-6 px-4 py-3 bg-red-50 border border-red-200 text-red-700 text-sm">
            {error}
          </div>
        )}

        {step === 0 && <ApplicationForm form={form} updateForm={updateForm} resumeFile={resumeFile} setResumeFile={setResumeFile} />}
        {step === 1 && (
          <TrialTaskStep
            taskAnswers={taskAnswers}
            setTaskAnswers={setTaskAnswers}
            priorityList={getPriorityList()}
            moveItem={moveItem}
          />
        )}
        {step === 2 && (
          <AssessmentStep
            questions={shuffledQuestions}
            answers={assessmentAnswers}
            setAnswers={setAssessmentAnswers}
          />
        )}
        {step === 3 && <ReviewStep form={form} resumeFile={resumeFile} />}

        <div className="mt-10 flex justify-between items-center border-t border-brand-border pt-6">
          {step > 0 ? (
            <button onClick={prevStep} className="btn-secondary">Back</button>
          ) : (
            <Link to="/" className="text-sm text-gray-400 hover:text-brand-charcoal transition-colors">Back to posting</Link>
          )}
          {step < TOTAL_STEPS - 1 ? (
            <button onClick={nextStep} className="btn-primary">Continue</button>
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

function ApplicationForm({ form, updateForm, resumeFile, setResumeFile }) {
  const expOptions = ['0', '< 1 year', '1-2 years', '3-5 years', '5+ years']
  return (
    <div>
      <h2 className="font-display text-3xl text-brand-charcoal mb-1">Your Application</h2>
      <p className="text-sm text-gray-500 mb-8">All fields marked * are required.</p>
      <div className="space-y-6">
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
          <label className="form-label">Are you able to work the required Pacific Time schedule and adjust for daylight savings? *</label>
          <div className="flex gap-4 mt-2">
            {['Yes', 'No'].map(v => (
              <label key={v} className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="pacific" value={v} checked={form.can_work_pacific === v} onChange={() => updateForm('can_work_pacific', v)} className="accent-brand-forest" />
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
        <div>
          <label className="form-label">Why are you interested in this role? *</label>
          <textarea className="input-field min-h-[100px] resize-y" value={form.why_interested} onChange={e => updateForm('why_interested', e.target.value)} placeholder="Tell us what draws you to this opportunity..." />
        </div>
        <div>
          <label className="form-label">What makes you good at supporting a provider and reducing mental load? *</label>
          <textarea className="input-field min-h-[100px] resize-y" value={form.why_good_fit} onChange={e => updateForm('why_good_fit', e.target.value)} placeholder="Share specific examples or qualities..." />
        </div>
        <div className="section-divider" />
        <div>
          <label className="form-label">Resume Upload *</label>
          <label className="block cursor-pointer">
            <div className={`border-2 border-dashed p-6 text-center transition-colors ${resumeFile ? 'border-brand-sage bg-brand-sage-light' : 'border-brand-border hover:border-brand-sage'}`}>
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
            <input type="file" accept=".pdf,.doc,.docx" className="hidden" onChange={e => setResumeFile(e.target.files[0] || null)} />
          </label>
        </div>
        <div>
          <label className="form-label">LinkedIn or Portfolio URL (optional)</label>
          <input className="input-field" value={form.linkedin_url} onChange={e => updateForm('linkedin_url', e.target.value)} placeholder="https://linkedin.com/in/..." />
        </div>
      </div>
    </div>
  )
}

function TrialTaskStep({ taskAnswers, setTaskAnswers, priorityList, moveItem }) {
  const { scenario, encounterSummary, questions: tq } = trialTask
  return (
    <div>
      <h2 className="font-display text-3xl text-brand-charcoal mb-1">Trial Task</h2>
      <p className="text-sm text-gray-500 mb-2">This should take approximately 5-10 minutes. Read the scenario carefully before answering.</p>
      <p className="text-xs text-brand-sage font-medium uppercase tracking-wide mb-8">There are no trick questions. We want to see how you think.</p>
      <div className="bg-brand-cream p-6 mb-8 text-sm leading-relaxed text-brand-charcoal">
        <p className="font-medium mb-3 text-xs uppercase tracking-widest text-brand-sage">Scenario</p>
        <p className="mb-4">{scenario}</p>
        <div className="border-l-2 border-brand-sage-mid pl-4 space-y-1 text-xs leading-relaxed font-mono text-brand-forest">
          {encounterSummary.split('\n').map((line, i) => <p key={i}>{line || '\u00A0'}</p>)}
        </div>
      </div>
      <div className="space-y-8">
        {[0, 1, 2].map(qi => (
          <div key={qi}>
            <p className="text-xs uppercase tracking-widest text-brand-sage font-medium mb-2">Question {qi + 1} of 4</p>
            <p className="text-sm font-medium text-brand-charcoal mb-3 leading-relaxed">{tq[qi].prompt}</p>
            <textarea
              className="input-field min-h-[120px] resize-y text-sm"
              value={taskAnswers[`q${qi + 1}`]}
              onChange={e => setTaskAnswers(p => ({ ...p, [`q${qi + 1}`]: e.target.value }))}
              placeholder="Your response..."
            />
          </div>
        ))}

        {/* Prioritization — up/down buttons, works on all devices */}
        <div>
          <p className="text-xs uppercase tracking-widest text-brand-sage font-medium mb-2">Question 4 of 4</p>
          <p className="text-sm font-medium text-brand-charcoal mb-2 leading-relaxed">{tq[3].prompt}</p>
          <p className="text-xs text-gray-400 mb-4">Use the arrows to reorder from most urgent (top) to least urgent (bottom).</p>

          <div className="space-y-2">
            {priorityList.map((item, idx) => (
              <div
                key={item.id}
                className="flex items-center gap-3 border border-brand-border p-3 bg-white"
              >
                {/* Position number */}
                <span className="text-xs font-medium text-brand-sage w-4 flex-shrink-0">{idx + 1}</span>

                {/* Up / Down buttons */}
                <div className="flex flex-col gap-0.5 flex-shrink-0">
                  <button
                    type="button"
                    onClick={() => moveItem(idx, -1)}
                    disabled={idx === 0}
                    className="w-7 h-7 flex items-center justify-center border border-brand-border text-brand-charcoal hover:bg-brand-cream disabled:opacity-20 disabled:cursor-not-allowed transition-colors text-xs"
                    aria-label="Move up"
                  >
                    ▲
                  </button>
                  <button
                    type="button"
                    onClick={() => moveItem(idx, 1)}
                    disabled={idx === priorityList.length - 1}
                    className="w-7 h-7 flex items-center justify-center border border-brand-border text-brand-charcoal hover:bg-brand-cream disabled:opacity-20 disabled:cursor-not-allowed transition-colors text-xs"
                    aria-label="Move down"
                  >
                    ▼
                  </button>
                </div>

                {/* Item text */}
                <span className="text-sm text-brand-charcoal leading-snug">{item.text}</span>
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
      <p className="text-sm text-gray-500 mb-2">20 questions. There are no right or wrong answers.</p>
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
          <p className="text-xs font-medium text-brand-forest uppercase tracking-wide mb-2">Included in your application</p>
          <ul className="text-xs text-brand-forest space-y-0.5">
            <li>✓ Application form completed</li>
            <li>✓ Resume uploaded</li>
            <li>✓ Trial task responses</li>
            <li>✓ Workplace Personality Assessment</li>
          </ul>
        </div>
        <p className="text-xs text-gray-400">By submitting, you confirm that all information provided is accurate.</p>
      </div>
    </div>
  )
}
