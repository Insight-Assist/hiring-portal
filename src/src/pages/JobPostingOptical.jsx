import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { getJobStatus } from '../lib/jobStatus'

const responsibilities = [
  "Help patients select frames for fit, style, and prescription needs",
  "Explain and recommend lens options tailored to each patient's lifestyle",
  "Look up and interpret vision plan and insurance benefits",
  "Help patients maximize their benefits for the best possible vision outcome",
  "Prescreen patients and assist with special testing for the doctor",
  "Collect patient information and update records accurately",
  "Assist with contact lens fittings",
  "Support the doctor and clinical team in a variety of tasks",
  "Provide backup coverage in both optical and patient care areas",
]

const qualifications = [
  "Warm, outgoing personality — you genuinely enjoy working with people",
  "Comfortable learning new things and wearing different hats day to day",
  "Eye for detail — accuracy matters in this role",
  "No optical or medical experience required — full on-the-job training provided",
  "Reliable and punctual for scheduled clinic hours",
  "Bonus: interest in earning your Certified Paraoptometric (CPO) credential",
]

const benefits = [
  { label: "Wage", detail: "$19.00 per hour" },
  { label: "Advancement", detail: "+$2.00/hr after 6 months + CPO exam completion" },
  { label: "Training", detail: "Full on-the-job training provided" },
]

export default function JobPostingOptical() {
  const [isOpen, setIsOpen] = useState(true)
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    getJobStatus('optical-technician').then(open => {
      setIsOpen(open)
      setChecking(false)
    })
  }, [])

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-brand-border px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <span className="font-body text-sm font-black tracking-widest uppercase">
            <span className="text-brand-charcoal">INSIGHT</span><span className="text-brand-sage font-normal">ASSIST</span>
          </span>
          {!checking && (isOpen
            ? <Link to="/apply/optical" className="btn-primary">Apply Now</Link>
            : <span className="px-4 py-2 text-sm border border-brand-border text-gray-400 bg-brand-cream">Position Filled</span>
          )}
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12">
        {/* Role Header */}
        <div className="mb-10">
          <p className="text-xs uppercase tracking-widest text-brand-sage font-medium mb-3">Now Hiring · Newport Vision Source</p>
          <h1 className="font-display text-5xl text-brand-charcoal mb-6 leading-tight">
            Float — Optical &<br />
            <span className="italic font-light">Paraoptometric Technician</span>
          </h1>

          {/* Key details */}
          <div className="flex flex-col sm:flex-row flex-wrap gap-3 mt-2">
            <div className="flex items-center gap-2 bg-brand-cream px-4 py-2.5">
              <span className="w-2 h-2 rounded-full bg-brand-sage flex-shrink-0"></span>
              <span className="text-base font-medium text-brand-charcoal">Part-Time Employee</span>
            </div>
            <div className="flex items-center gap-2 bg-brand-cream px-4 py-2.5">
              <span className="w-2 h-2 rounded-full bg-brand-sage flex-shrink-0"></span>
              <span className="text-base font-medium text-brand-charcoal">Newport, WA — In Person</span>
            </div>
            <div className="flex items-center gap-2 bg-brand-sage px-4 py-2.5">
              <span className="w-2 h-2 rounded-full bg-white flex-shrink-0"></span>
              <span className="text-base font-medium text-white">$19.00/hour · Growth to $21.00+</span>
            </div>
          </div>
        </div>

        <div className="section-divider" />

        {/* Benefits */}
        <section className="mb-10">
          <h2 className="font-display text-2xl text-brand-charcoal mb-4">Compensation & Perks</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {benefits.map(({ label, detail }) => (
              <div key={label} className="bg-brand-cream p-5">
                <p className="text-xs uppercase tracking-widest text-brand-sage font-medium mb-2">{label}</p>
                <p className="text-sm text-brand-charcoal">{detail}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Schedule */}
        <section className="mb-10">
          <h2 className="font-display text-2xl text-brand-charcoal mb-4">Schedule</h2>
          <div className="bg-brand-cream p-6 text-sm text-brand-charcoal space-y-1.5">
            <p><strong>Tuesday – Thursday:</strong> 8:00 AM – 5:00 PM</p>
            <p><strong>Monday:</strong> Occasional coverage when staff are out</p>
            <p><strong>Friday:</strong> 1–2 Fridays per month, 8:00 AM – 2:00 PM</p>
            <p className="text-gray-500 mt-3 text-xs">205 S Washington Ave, Newport, WA 99156</p>
          </div>
        </section>

        {/* About the Role */}
        <section className="mb-10">
          <h2 className="font-display text-2xl text-brand-charcoal mb-4">About the Role</h2>
          <div className="space-y-4 text-sm text-gray-700 leading-relaxed">
            <p>
              Join Newport Vision Source in a floating position that covers both the Optical Department and patient care. You'll be a key part of a team dedicated to personalized care, innovative technology, and a lifetime of visual health for every patient.
            </p>
            <p>
              This role is perfect for someone who <strong>loves variety</strong> — no two days are exactly alike. You'll start by learning everything optical: helping patients find the right frames, explaining lens options, and navigating vision insurance benefits.
            </p>
            <p>
              As you grow, you'll also take on paraoptometric duties — prescreening patients, assisting with special testing, and supporting the doctor in whatever the day requires.
            </p>
            <p className="text-xs text-gray-500 italic">
              No optical or medical background required. Full training is provided. Candidates with a passion for people and a willingness to learn are encouraged to apply.
            </p>
          </div>
        </section>

        {/* Responsibilities */}
        <section className="mb-10">
          <h2 className="font-display text-2xl text-brand-charcoal mb-4">What You'll Do</h2>
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
        <section className="mb-12">
          <h2 className="font-display text-2xl text-brand-charcoal mb-4">Who We're Looking For</h2>
          <ul className="space-y-2">
            {qualifications.map((item, i) => (
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
          {isOpen
            ? <Link to="/apply/optical" className="btn-primary whitespace-nowrap">Start Application</Link>
            : <span className="px-6 py-3 text-sm border border-brand-border text-gray-400 bg-brand-cream">Position Filled</span>
          }
        </div>

        <p className="text-xs text-gray-400 mt-8 text-center">
          Newport Vision Source · 205 S Washington Ave, Newport, WA 99156
        </p>
      </main>
    </div>
  )
}
