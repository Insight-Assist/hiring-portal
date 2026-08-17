import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { personalityTypes } from '../data/assessment'
import { trialTask } from '../data/trialTask'

const DISCUSSION_POINTS = [
  { id: 'dp_intro', number: '1', label: 'Intro Understanding', bullets: ['Rural Washington State practice on the West Coast of the USA', 'Real-time, high-engagement scribe role — not passive', 'On Google Meet with the doctor all day'] },
  { id: 'dp_schedule', number: '2', label: 'Schedule Alignment', bullets: ['Mon–Thu: 8:00 AM – 5:00 PM PST', 'Friday: 8:00 AM – 2:00 PM PST (~39 hrs/week)', 'Option to add +1 hour on Friday to reach 40 hours', 'Lunch break + short breaks throughout the day, communicated with doctor'] },
  { id: 'dp_workflow', number: '3', label: 'Workflow Expectations', bullets: ['On Google Meet with doctor all day', 'Fast-paced, real-time scribing', 'Completing tasks between patients', 'First 3–6 months: primary focus is scribing accuracy and flow'] },
  { id: 'dp_fridays', number: '4', label: 'Admin Fridays', bullets: ['Every other Friday is lighter and admin-focused', 'Used for catch-up work and training'] },
  { id: 'dp_comp', number: '5', label: 'Compensation Alignment', bullets: ['Ask candidate: "What hourly rate are you looking for?"', 'Role range: $8.00–$11.00 USD/hour depending on experience', 'Confirm expectation of consistent weekly hours'] },
  { id: 'dp_communication', number: '6', label: 'Communication & Fit', bullets: ['Highly engaged virtual team environment', 'Expect proactive communication throughout the day', 'Fit matters both ways'] },
  { id: 'dp_questions', number: '7', label: 'Candidate Questions / Curiosity', bullets: ['Did the candidate ask thoughtful or relevant questions about the role, workflow, or expectations?'] },
]

const STAR_QUESTIONS = [
  { id: 'star_learning', number: '1', prompt: '"Tell me about a time you had to learn something new quickly to do your job well."' },
  { id: 'star_multitask', number: '2', prompt: '"Tell me about a time when you had to manage multiple responsibilities at once — such as responding to team messages, tracking tasks, and staying focused on a primary responsibility. How did you stay organized and ensure nothing was missed?"' },
]

const RUBRIC = [
  { score: 5, label: 'Excellent', desc: 'Proactive, clear communicator, fast learner, confident under pressure' },
  { score: 4, label: 'Strong', desc: 'Solid examples, reliable, coachable, good awareness' },
  { score: 3, label: 'OK', desc: 'Adequate but lacks depth or clarity' },
  { score: 2, label: 'Weak', desc: 'Limited ownership, struggles with examples' },
  { score: 1, label: 'Poor', desc: 'Red flags: defensive, slow, unclear communication' },
]

export default function PrintApplicant() {
  const { id } = useParams()
  const [applicant, setApplicant] = useState(null)
  const [loading, setLoading] = useState(true)
  const [mode, setMode] = useState('both') // 'both' | 'application' | 'interview'

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const m = params.get('mode')
    if (m) setMode(m)
  }, [])

  useEffect(() => {
    supabase.from('applications').select('*').eq('id', id).single()
      .then(({ data }) => { if (data) setApplicant(data); setLoading(false) })
  }, [id])

  if (loading) return <div style={{ padding: 40, fontFamily: 'Georgia, serif' }}>Loading...</div>
  if (!applicant) return <div style={{ padding: 40 }}>Applicant not found.</div>

  const iv = applicant.interview_guide || {}
  const tr = applicant.trial_task_responses || {}
  const ts = applicant.task_scores || {}
  const pDominant = personalityTypes[applicant.personality_dominant]
  const pSecondary = personalityTypes[applicant.personality_secondary]
  const totalTaskScore = Object.values(ts).reduce((a, b) => a + Number(b || 0), 0)

  const formatDate = (iso) => iso ? new Date(iso).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : '—'
  const interviewDate = iv.date ? new Date(iv.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : '—'

  return (
    <>
      {/* Print styles */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600&family=DM+Sans:wght@300;400;500&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        body {
          font-family: 'DM Sans', sans-serif;
          font-size: 11px;
          color: #1C1C1C;
          background: white;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }

        .page { max-width: 800px; margin: 0 auto; padding: 32px 40px; }

        h1, h2, h3, h4 { font-family: 'Cormorant Garamond', Georgia, serif; font-weight: 400; }

        .doc-header {
          border-bottom: 2px solid #2F332E;
          padding-bottom: 14px;
          margin-bottom: 20px;
        }

        .doc-title { font-size: 26px; color: #2F332E; letter-spacing: -0.01em; }
        .doc-subtitle { font-size: 11px; color: #76886C; margin-top: 3px; letter-spacing: 0.05em; text-transform: uppercase; }

        .section-header {
          background: #2F332E;
          color: white;
          padding: 6px 12px;
          font-size: 9px;
          font-weight: 500;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          margin: 20px 0 10px;
        }

        .info-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
          margin-bottom: 14px;
        }

        .info-block {
          border: 1px solid #E2E4E0;
          padding: 8px 10px;
        }

        .info-label {
          font-size: 8px;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: #76886C;
          margin-bottom: 3px;
        }

        .info-value { font-size: 11px; color: #1C1C1C; line-height: 1.5; }

        .response-block { margin-bottom: 12px; }
        .response-label { font-size: 9px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.08em; color: #76886C; margin-bottom: 4px; }
        .response-text {
          border: 1px solid #E2E4E0;
          padding: 8px 10px;
          font-size: 11px;
          color: #1C1C1C;
          line-height: 1.6;
          min-height: 36px;
          white-space: pre-wrap;
          background: #F1EFEA;
        }

        .score-badge {
          display: inline-block;
          background: #2F332E;
          color: white;
          font-size: 9px;
          font-weight: 500;
          padding: 2px 7px;
          letter-spacing: 0.05em;
        }

        .score-circle {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 22px;
          height: 22px;
          border: 2px solid #2F332E;
          font-size: 11px;
          font-weight: 500;
          color: #2F332E;
          margin-right: 3px;
        }

        .score-circle.selected {
          background: #2F332E;
          color: white;
        }

        .strength-tag {
          display: inline-block;
          border: 1px solid #E2E4E0;
          padding: 2px 8px;
          font-size: 9px;
          font-weight: 500;
          margin-right: 4px;
          color: #888;
        }

        .strength-tag.selected {
          background: #76886C;
          border-color: #76886C;
          color: white;
        }

        .overall-tag {
          display: inline-block;
          border: 1px solid #E2E4E0;
          padding: 3px 10px;
          font-size: 10px;
          font-weight: 500;
          margin-right: 6px;
          color: #bbb;
        }

        .overall-tag.selected {
          background: #2F332E;
          border-color: #2F332E;
          color: white;
        }

        .note-field {
          border: 1px solid #E2E4E0;
          padding: 8px 10px;
          min-height: 48px;
          font-size: 11px;
          color: #1C1C1C;
          line-height: 1.6;
          white-space: pre-wrap;
        }

        .note-field.blank {
          min-height: 40px;
          background: #FAFAFA;
        }

        .two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        .three-col { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px; }

        .divider { border: none; border-top: 1px solid #E2E4E0; margin: 14px 0; }

        .page-break { page-break-before: always; }

        .rubric-row { display: flex; gap: 8px; padding: 4px 0; border-bottom: 1px solid #E2E4E0; font-size: 10px; }
        .rubric-score { font-weight: 600; width: 14px; flex-shrink: 0; color: #2F332E; }
        .rubric-label { width: 52px; font-weight: 500; flex-shrink: 0; }
        .rubric-desc { color: #666; }

        .print-controls {
          position: fixed;
          top: 16px;
          right: 16px;
          display: flex;
          gap: 8px;
          z-index: 100;
        }

        .print-btn {
          padding: 8px 16px;
          font-size: 12px;
          font-family: 'DM Sans', sans-serif;
          font-weight: 500;
          cursor: pointer;
          border: none;
          border-radius: 2px;
        }

        .print-btn-primary { background: #2F332E; color: white; }
        .print-btn-secondary { background: white; color: #2F332E; border: 1px solid #2F332E; }

        @media print {
          .print-controls { display: none !important; }
          .page { padding: 18px 28px; }
          body { font-size: 10px; }
          .doc-title { font-size: 22px; }
        }
      `}</style>

      {/* Print controls — hidden when printing */}
      <div className="print-controls">
        <button className="print-btn print-btn-secondary" onClick={() => window.close()}>← Back</button>
        <select
          className="print-btn print-btn-secondary"
          value={mode}
          onChange={e => setMode(e.target.value)}
          style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 12 }}
        >
          <option value="both">Full Document</option>
          <option value="application">Application Only</option>
          <option value="interview">Interview Guide Only</option>
        </select>
        <button className="print-btn print-btn-primary" onClick={() => window.print()}>
          Print / Save as PDF
        </button>
      </div>

      <div className="page">

        {/* ── APPLICATION SECTION ── */}
        {(mode === 'both' || mode === 'application') && (
          <>
            {/* Doc header */}
            <div className="doc-header">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div>
                  <div className="doc-title">Candidate Application Summary</div>
                  <div className="doc-subtitle">Insight Assist · Remote Medical Scribe · Dr. Beth's Team</div>
                </div>
                <div style={{ textAlign: 'right', fontSize: 10, color: '#888' }}>
                  <div>Submitted: {formatDate(applicant.submitted_at)}</div>
                  <div style={{ marginTop: 2, fontWeight: 500, color: '#2F332E' }}>Status: {applicant.status || '—'}</div>
                </div>
              </div>
            </div>

            {/* Candidate info */}
            <div className="info-grid">
              <div className="info-block">
                <div className="info-label">Candidate</div>
                <div className="info-value" style={{ fontSize: 14, fontFamily: 'Cormorant Garamond, serif' }}>{applicant.full_name}</div>
              </div>
              <div className="info-block">
                <div className="info-label">Contact</div>
                <div className="info-value">{applicant.email}{applicant.phone ? ` · ${applicant.phone}` : ''}</div>
              </div>
              <div className="info-block">
                <div className="info-label">Location</div>
                <div className="info-value">{applicant.city_timezone}{applicant.country ? `, ${applicant.country}` : ''}</div>
              </div>
              <div className="info-block">
                <div className="info-label">English · Pacific Time</div>
                <div className="info-value">{applicant.english_proficiency || '—'} · {applicant.can_work_pacific || '—'}</div>
              </div>
            </div>

            {/* Experience */}
            <div className="three-col" style={{ marginBottom: 14 }}>
              {[
                { label: 'Medical Scribing', value: applicant.exp_scribing },
                { label: 'Insurance Verification', value: applicant.exp_insurance },
                { label: 'Medical Billing', value: applicant.exp_billing },
                { label: 'Healthcare Admin', value: applicant.exp_admin },
                pDominant ? { label: 'Personality (Dominant)', value: pDominant.label + (pSecondary ? ` / ${pSecondary.label}` : '') } : null,
                applicant.recommendation ? { label: 'Recommendation', value: applicant.recommendation } : null,
              ].filter(Boolean).map((item, i) => (
                <div key={i} className="info-block">
                  <div className="info-label">{item.label}</div>
                  <div className="info-value">{item.value || '—'}</div>
                </div>
              ))}
            </div>

            {/* Short answers */}
            <div className="section-header">Short Answer Responses</div>

            <div className="response-block">
              <div className="response-label">Why are you interested in this role?</div>
              <div className="response-text">{applicant.why_interested || '—'}</div>
            </div>

            <div className="response-block">
              <div className="response-label">What makes you good at supporting a provider and reducing mental load?</div>
              <div className="response-text">{applicant.why_good_fit || '—'}</div>
            </div>

            {/* Trial task */}
            <div className="section-header">
              Trial Task Responses
              {totalTaskScore > 0 && <span style={{ float: 'right', fontWeight: 400 }}>Total Score: {totalTaskScore} / 100</span>}
            </div>

            {trialTask.questions.map((q, qi) => {
              const qKey = `q${qi + 1}`
              const score = ts[qKey]
              const priorityIds = tr.q4 || []
              const priorityItems = trialTask.questions[3].items

              return (
                <div key={q.id} className="response-block">
                  <div className="response-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Question {qi + 1}</span>
                    {score !== undefined && score !== '' && (
                      <span style={{ color: '#2F332E', fontWeight: 600 }}>Score: {score} / {q.rubric.maxPoints}</span>
                    )}
                  </div>
                  <div style={{ fontSize: 10, color: '#444', marginBottom: 4, fontStyle: 'italic', lineHeight: 1.5 }}>
                    {q.prompt.length > 120 ? q.prompt.substring(0, 120) + '...' : q.prompt}
                  </div>
                  {qi < 3 ? (
                    <div className="response-text">{tr[qKey] || '—'}</div>
                  ) : (
                    <div className="response-text">
                      {priorityIds.length > 0
                        ? priorityIds.map((pid, idx) => {
                            const item = priorityItems.find(i => i.id === pid)
                            return `${idx + 1}. ${item?.text || ''}`
                          }).join('\n')
                        : '—'}
                      {tr.q4_reasoning ? `\n\nReasoning: ${tr.q4_reasoning}` : ''}
                    </div>
                  )}
                </div>
              )
            })}

            {/* Internal notes */}
            {applicant.internal_notes && (
              <>
                <div className="section-header">Internal Notes</div>
                <div className="response-text">{applicant.internal_notes}</div>
              </>
            )}
          </>
        )}

        {/* Page break between sections when printing both */}
        {mode === 'both' && <div className="page-break" />}

        {/* ── INTERVIEW GUIDE SECTION ── */}
        {(mode === 'both' || mode === 'interview') && (
          <>
            <div className="doc-header">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div>
                  <div className="doc-title">Medical Scribe Interview Guide</div>
                  <div className="doc-subtitle">Insight Assist · Dr. Beth's Team · Rural Washington State, USA</div>
                </div>
                <div style={{ textAlign: 'right', fontSize: 10, color: '#888' }}>
                  <div>Candidate: <strong style={{ color: '#1C1C1C' }}>{applicant.full_name}</strong></div>
                  <div style={{ marginTop: 2 }}>Interview Date: {interviewDate}</div>
                </div>
              </div>
            </div>

            {/* Section 1: Discussion Points */}
            <div className="section-header">Section 1 — Key Discussion Points (Notes Only)</div>

            {DISCUSSION_POINTS.map((dp) => (
              <div key={dp.id} style={{ marginBottom: 10 }}>
                <div style={{ display: 'flex', gap: 6, marginBottom: 4 }}>
                  <span style={{ color: '#76886C', fontWeight: 600, fontSize: 10, flexShrink: 0 }}>{dp.number}.</span>
                  <span style={{ fontWeight: 500, fontSize: 11 }}>{dp.label}</span>
                </div>
                <ul style={{ marginLeft: 18, marginBottom: 5 }}>
                  {dp.bullets.map((b, i) => (
                    <li key={i} style={{ fontSize: 10, color: '#555', lineHeight: 1.6, listStyleType: 'disc' }}>{b}</li>
                  ))}
                </ul>
                <div className="response-label">Notes</div>
                <div className={`note-field ${!iv.discussion_notes?.[dp.id] ? 'blank' : ''}`}>
                  {iv.discussion_notes?.[dp.id] || ''}
                </div>
              </div>
            ))}

            {/* Section 2: STAR Questions */}
            <div className="section-header">Section 2 — STAR Questions (Scored)</div>

            {/* Rubric */}
            <div style={{ marginBottom: 12, border: '1px solid #E2E4E0', padding: '8px 10px' }}>
              <div style={{ fontSize: 8, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#76886C', marginBottom: 5 }}>Scoring Rubric</div>
              {RUBRIC.map(r => (
                <div key={r.score} className="rubric-row">
                  <span className="rubric-score">{r.score}</span>
                  <span className="rubric-label">{r.label}</span>
                  <span className="rubric-desc">{r.desc}</span>
                </div>
              ))}
            </div>

            {STAR_QUESTIONS.map((q) => {
              const score = iv.star_scores?.[q.id]
              const strength = iv.star_strength?.[q.id]
              const noteVal = iv.star_notes?.[q.id] || ''

              return (
                <div key={q.id} style={{ marginBottom: 14, border: '1px solid #E2E4E0', padding: '10px 12px' }}>
                  <div style={{ display: 'flex', gap: 6, marginBottom: 6 }}>
                    <span style={{ color: '#76886C', fontWeight: 600, fontSize: 10, flexShrink: 0 }}>Q{q.number}.</span>
                    <span style={{ fontStyle: 'italic', fontSize: 11, color: '#333', lineHeight: 1.5 }}>{q.prompt}</span>
                  </div>

                  <div style={{ display: 'flex', gap: 20, alignItems: 'center', marginBottom: 8 }}>
                    <div>
                      <div className="response-label" style={{ marginBottom: 4 }}>Rating</div>
                      <div style={{ display: 'flex', gap: 3 }}>
                        {[1, 2, 3, 4, 5].map(n => (
                          <span key={n} className={`score-circle ${score === n ? 'selected' : ''}`}>{n}</span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <div className="response-label" style={{ marginBottom: 4 }}>Strength</div>
                      <div>
                        {['Strong', 'Moderate', 'Weak'].map(opt => (
                          <span key={opt} className={`strength-tag ${strength === opt ? 'selected' : ''}`}>{opt}</span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="response-label">Notes</div>
                  <div className={`note-field ${!noteVal ? 'blank' : ''}`}>{noteVal}</div>
                </div>
              )
            })}

            {/* Section 3: Overall Impression */}
            <div className="section-header">Section 3 — Overall Impression</div>

            <div style={{ marginBottom: 10 }}>
              <div className="response-label" style={{ marginBottom: 6 }}>Overall Recommendation</div>
              <div>
                {['Strong Yes', 'Yes', 'Maybe', 'No'].map(opt => (
                  <span key={opt} className={`overall-tag ${iv.overall === opt ? 'selected' : ''}`}>{opt}</span>
                ))}
              </div>
            </div>

            <div className="two-col" style={{ marginBottom: 10 }}>
              <div>
                <div className="response-label">Top Strengths</div>
                <div className={`note-field ${!iv.top_strengths ? 'blank' : ''}`} style={{ minHeight: 60 }}>{iv.top_strengths || ''}</div>
              </div>
              <div>
                <div className="response-label">Potential Concerns</div>
                <div className={`note-field ${!iv.concerns ? 'blank' : ''}`} style={{ minHeight: 60 }}>{iv.concerns || ''}</div>
              </div>
            </div>

            {(iv.overall_notes !== undefined) && (
              <div>
                <div className="response-label">Additional Notes</div>
                <div className={`note-field ${!iv.overall_notes ? 'blank' : ''}`} style={{ minHeight: 48 }}>{iv.overall_notes || ''}</div>
              </div>
            )}

            <div style={{ marginTop: 24, paddingTop: 10, borderTop: '1px solid #E2E4E0', fontSize: 9, color: '#aaa', textAlign: 'center' }}>
              Insight Assist · insight-assist.net · Confidential
            </div>
          </>
        )}

      </div>
    </>
  )
}
