import { useState, useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function DynamicJobPosting() {
  const { slug } = useParams()
  const [job, setJob] = useState(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    supabase.from('jobs').select('*').eq('slug', slug).single()
      .then(({ data, error }) => {
        if (error || !data) {
          setNotFound(true)
        } else {
          setJob(data)
        }
        setLoading(false)
      })
  }, [slug])

  if (loading) return <div className="min-h-screen flex items-center justify-center"><p className="text-sm text-gray-400">Loading...</p></div>
  if (notFound) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <p className="font-display text-2xl text-brand-charcoal mb-2">Job Not Found</p>
        <Link to="/jobs" className="text-sm text-brand-sage hover:underline">← View all openings</Link>
      </div>
    </div>
  )

  const isOpen = job.is_open !== false

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-brand-border px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link to="/jobs" className="font-body text-sm font-black tracking-widest uppercase">
            <span className="text-brand-charcoal">INSIGHT</span><span className="text-brand-sage font-normal">ASSIST</span>
          </Link>
          {isOpen
            ? <Link to={`/apply/dynamic/${job.slug}`} className="btn-primary">Apply Now</Link>
            : <span className="px-4 py-2 text-sm border border-brand-border text-gray-400 bg-brand-cream">Position Filled</span>
          }
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12">
        <div className="mb-10">
          <p className="text-xs uppercase tracking-widest text-brand-sage font-medium mb-3">Now Hiring{job.client ? ` · ${job.client}` : ''}</p>
          <h1 className="font-display text-5xl text-brand-charcoal mb-6 leading-tight">{job.title}</h1>

          <div className="flex flex-col sm:flex-row flex-wrap gap-3 mt-2">
            {job.job_type && (
              <div className="flex items-center gap-2 bg-brand-cream px-4 py-2.5">
                <span className="w-2 h-2 rounded-full bg-brand-sage flex-shrink-0"></span>
                <span className="text-base font-medium text-brand-charcoal">{job.job_type}</span>
              </div>
            )}
            {job.location && (
              <div className="flex items-center gap-2 bg-brand-cream px-4 py-2.5">
                <span className="w-2 h-2 rounded-full bg-brand-sage flex-shrink-0"></span>
                <span className="text-base font-medium text-brand-charcoal">{job.location}</span>
              </div>
            )}
            {job.compensation && (
              <div className="flex items-center gap-2 bg-brand-sage px-4 py-2.5">
                <span className="w-2 h-2 rounded-full bg-white flex-shrink-0"></span>
                <span className="text-base font-medium text-white">{job.compensation}</span>
              </div>
            )}
          </div>
        </div>

        <div className="section-divider" />

        {/* Benefits */}
        {(job.benefits || []).length > 0 && (
          <section className="mb-10">
            <h2 className="font-display text-2xl text-brand-charcoal mb-4">Benefits</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {job.benefits.map((b, i) => (
                <div key={i} className="bg-brand-cream p-5">
                  <p className="text-xs uppercase tracking-widest text-brand-sage font-medium mb-2">{b.label}</p>
                  <p className="text-sm text-brand-charcoal">{b.detail}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Schedule */}
        {(job.schedule || []).length > 0 && (
          <section className="mb-10">
            <h2 className="font-display text-2xl text-brand-charcoal mb-4">Schedule</h2>
            <div className="bg-brand-cream p-6 text-sm text-brand-charcoal space-y-1.5">
              {job.schedule.map((line, i) => <p key={i}>{line}</p>)}
            </div>
          </section>
        )}

        {/* Overview / Description */}
        {(job.overview || job.description) && (
          <section className="mb-10">
            <h2 className="font-display text-2xl text-brand-charcoal mb-4">About the Role</h2>
            <div className="space-y-4 text-sm text-gray-700 leading-relaxed">
              {job.overview && <p className="font-medium">{job.overview}</p>}
              {job.description && <p className="whitespace-pre-wrap">{job.description}</p>}
            </div>
          </section>
        )}

        {/* Responsibilities */}
        {(job.responsibilities || []).length > 0 && (
          <section className="mb-10">
            <h2 className="font-display text-2xl text-brand-charcoal mb-4">Key Responsibilities</h2>
            <ul className="space-y-2">
              {job.responsibilities.map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-gray-700">
                  <span className="mt-1.5 w-1 h-1 rounded-full bg-brand-sage flex-shrink-0"></span>{item}
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Qualifications */}
        {(job.qualifications || []).length > 0 && (
          <section className="mb-10">
            <h2 className="font-display text-2xl text-brand-charcoal mb-4">What We're Looking For</h2>
            <ul className="space-y-2">
              {job.qualifications.map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-gray-700">
                  <span className="mt-1.5 w-1 h-1 rounded-full bg-brand-sage flex-shrink-0"></span>{item}
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Success markers */}
        {(job.success_markers || []).length > 0 && (
          <section className="mb-12">
            <h2 className="font-display text-2xl text-brand-charcoal mb-4">Success in This Role Looks Like</h2>
            <ul className="space-y-2">
              {job.success_markers.map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-gray-700">
                  <span className="mt-1.5 w-1 h-1 rounded-full bg-brand-sage flex-shrink-0"></span>{item}
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Application process */}
        <section className="mb-12">
          <h2 className="font-display text-2xl text-brand-charcoal mb-4">Application Process</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { step: '01', label: 'Application', desc: 'Basic info, background, and short answers' },
              ...(job.trial_task_questions?.length > 0 ? [{ step: '02', label: 'Trial Task', desc: 'A short practical exercise (5-10 minutes)' }] : []),
              { step: job.trial_task_questions?.length > 0 ? '03' : '02', label: 'Personality Assessment', desc: 'A workplace style inventory — no right answers' },
            ].map(({ step, label, desc }) => (
              <div key={step} className="border border-brand-border p-5">
                <p className="text-xs font-medium text-brand-sage mb-2">{step}</p>
                <p className="font-medium text-brand-charcoal text-sm mb-1">{label}</p>
                <p className="text-xs text-gray-500">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        <div className="border-t border-brand-border pt-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <p className="font-display text-xl text-brand-charcoal">Ready to apply?</p>
            <p className="text-sm text-gray-500 mt-1">The application takes approximately 15-30 minutes.</p>
          </div>
          {isOpen
            ? <Link to={`/apply/dynamic/${job.slug}`} className="btn-primary whitespace-nowrap">Start Application</Link>
            : <span className="px-6 py-3 text-sm border border-brand-border text-gray-400 bg-brand-cream">Position Filled</span>
          }
        </div>

        <p className="text-xs text-gray-400 mt-8 text-center">Insight Assist · insight-assist.net</p>
      </main>
    </div>
  )
}
