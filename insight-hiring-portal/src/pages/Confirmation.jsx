import { Link } from 'react-router-dom'

export default function Confirmation() {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6">
      <div className="max-w-md text-center">
        <div className="w-12 h-12 rounded-full bg-brand-sage-light border border-brand-sage-mid flex items-center justify-center mx-auto mb-6">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#76886C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>

        <h1 className="font-display text-4xl text-brand-charcoal mb-3">Application Submitted</h1>
        <p className="text-sm text-gray-500 leading-relaxed mb-8">
          Thank you for applying. Your application, resume, trial task, and personality assessment have been received.
        </p>
        <p className="text-sm text-gray-500 leading-relaxed mb-8">
          We review every application carefully. If your background is a strong match, we will reach out to discuss next steps.
        </p>

        <div className="text-xs text-gray-400 space-y-1 mb-10">
          <p>Questions? Email us at <span className="text-brand-sage">kim@insight-assist.net</span></p>
        </div>

        <Link to="/" className="text-sm text-brand-sage hover:text-brand-forest transition-colors">
          ← Back to job posting
        </Link>
      </div>
    </div>
  )
}
