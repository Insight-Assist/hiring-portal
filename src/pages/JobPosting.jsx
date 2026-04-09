import { Link } from 'react-router-dom'

const responsibilities = [
  "Real-time charting and clinical documentation",
  "Insurance verification for medical and vision plans",
  "Billing support and claim-related workflows",
  "Referrals and care coordination",
  "Faxing, report generation, and medical records support",
  "Team communication with front desk, technicians, billing, and providers",
  "Patient communication when needed",
  "Anticipating next steps and helping reduce provider mental load",
  "Supporting workflow and follow-up tasks so nothing is missed",
]

const qualifications = [
  "Strong English communication skills",
  "Detail-oriented and highly organized",
  "Proactive — able to anticipate needs before being asked",
  "Comfortable with technology and learning new systems",
  "Reliable internet connection with ability to work full clinic hours aligned to Pacific Time",
  "Experience in medical scribing, healthcare administration, insurance verification, or billing preferred",
]

const successMarkers = [
  "Dr. Beth feels fully supported at all times",
  "Charts are completed accurately and efficiently",
  "Insurance and billing details are handled proactively",
  "Communication is clear and timely",
  "Referrals, reports, and follow-up tasks do not fall through the cracks",
  "The scribe reduces the doctor's mental load — not adds to it",
]

const benefits = [
  { label: "PTO", detail: "40 hours of paid time off per year" },
  { label: "Sick Pay", detail: "40 hours of paid sick leave per year" },
  { label: "Utility Stipend", detail: "$70 USD per month toward internet and utilities" },
]

export default function JobPosting() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-brand-border px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <span className="font-body text-sm font-black tracking-widest uppercase"><span className="text-brand-charcoal">INSIGHT</span><span className="text-brand-sage font-normal">ASSIST</span></span>
          <Link to="/apply" className="btn-primary">
            Apply Now
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12">
        {/* Role Header */}
        <div className="mb-10">
          <p className="text-xs uppercase tracking-widest text-brand-sage font-medium mb-3">Now Hiring</p>
          <h1 className="font-display text-5xl text-brand-charcoal mb-4 leading-tight">
            Remote Medical Scribe<br />
            <span className="italic font-light">(Optometry)</span>
          </h1>
          <div className="flex flex-wrap gap-4 text-sm text-gray-500 mt-5">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-sage"></span>
              Full Time
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-sage"></span>
              Remote — Argentina-based preferred
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-sage"></span>
              $7–$10 USD/hour starting, depending on experience · Contractor
            </span>
          </div>
        </div>

        <div className="section-divider" />

        {/* Schedule */}
        <section className="mb-10">
          <h2 className="font-display text-2xl text-brand-charcoal mb-4">Schedule</h2>
          <div className="bg-brand-cream p-6 text-sm text-brand-charcoal space-y-1.5">
            <p><strong>Monday – Thursday:</strong> 8:00 AM – 5:00 PM Pacific Time</p>
            <p><strong>Friday:</strong> 8:00 AM – 2:00 PM Pacific Time</p>
            <p className="text-gray-500 mt-3 text-xs">Applicants must be able to adjust for U.S. daylight savings time changes.</p>
          </div>
        </section>

        {/* About the Role */}
        <section className="mb-10">
          <h2 className="font-display text-2xl text-brand-charcoal mb-4">About the Role</h2>
          <div className="space-y-4 text-sm text-gray-700 leading-relaxed">
            <p>
              Insight Assist is seeking a highly detail-oriented and proactive Remote Medical Scribe to support Dr. Beth in a busy optometry practice.
            </p>
            <p>
              This role is more than traditional scribing. The primary responsibility is to <strong>reduce the mental load of patient care for the doctor.</strong>
            </p>
            <p>
              This person should function like an extension of Dr. Beth — anticipating needs, helping manage details, keeping communication clear, and making sure nothing falls through the cracks so she can stay fully focused on patient care.
            </p>
            <p className="text-xs text-gray-500 italic">
              This role combines real-time scribing, insurance verification, billing support, administrative coordination, team communication, patient communication, and general support.
            </p>
          </div>
        </section>

        {/* Benefits */}
        <section className="mb-10">
          <h2 className="font-display text-2xl text-brand-charcoal mb-4">Benefits</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {benefits.map(({ label, detail }) => (
              <div key={label} className="bg-brand-cream p-5">
                <p className="text-xs uppercase tracking-widest text-brand-sage font-medium mb-2">{label}</p>
                <p className="text-sm text-brand-charcoal">{detail}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Responsibilities */}
        <section className="mb-10">
          <h2 className="font-display text-2xl text-brand-charcoal mb-4">Key Responsibilities</h2>
          <ul className="space-y-2">
            {responsibilities.map((item, i) => (
              <li key={i} className="flex items-start gap-3 text-sm text-gray-700">
                <span className="mt-1.5 w-1 h-1 rounded-full bg-brand-sage flex-shrink-0"></span>
                {item}
              </li>
            ))}
          </ul>
        </section>

        {/* Qualifications */}
        <section className="mb-10">
          <h2 className="font-display text-2xl text-brand-charcoal mb-4">What We're Looking For</h2>
          <ul className="space-y-2">
            {qualifications.map((item, i) => (
              <li key={i} className="flex items-start gap-3 text-sm text-gray-700">
                <span className="mt-1.5 w-1 h-1 rounded-full bg-brand-sage flex-shrink-0"></span>
                {item}
              </li>
            ))}
          </ul>
        </section>

        {/* Success Markers */}
        <section className="mb-12">
          <h2 className="font-display text-2xl text-brand-charcoal mb-4">Success in This Role Looks Like</h2>
          <ul className="space-y-2">
            {successMarkers.map((item, i) => (
              <li key={i} className="flex items-start gap-3 text-sm text-gray-700">
                <span className="mt-1.5 w-1 h-1 rounded-full bg-brand-sage flex-shrink-0"></span>
                {item}
              </li>
            ))}
          </ul>
        </section>

        {/* Application Process */}
        <section className="mb-12">
          <h2 className="font-display text-2xl text-brand-charcoal mb-4">Application Process</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { step: "01", label: "Application", desc: "Basic info, background, and short answers" },
              { step: "02", label: "Trial Task", desc: "A short practical exercise (5-10 minutes)" },
              { step: "03", label: "Personality Assessment", desc: "A workplace style inventory — no right answers" },
            ].map(({ step, label, desc }) => (
              <div key={step} className="border border-brand-border p-5">
                <p className="text-xs font-medium text-brand-sage mb-2">{step}</p>
                <p className="font-medium text-brand-charcoal text-sm mb-1">{label}</p>
                <p className="text-xs text-gray-500">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <div className="border-t border-brand-border pt-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <p className="font-display text-xl text-brand-charcoal">Ready to apply?</p>
            <p className="text-sm text-gray-500 mt-1">The full application takes approximately 20-30 minutes.</p>
          </div>
          <Link to="/apply" className="btn-primary whitespace-nowrap">
            Start Application
          </Link>
        </div>

        <p className="text-xs text-gray-400 mt-8 text-center">
          Insight Assist · insight-assist.net · Client: Dr. Beth's Team
        </p>
      </main>
    </div>
  )
}
