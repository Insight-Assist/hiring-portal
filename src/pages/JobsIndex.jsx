import { Link } from 'react-router-dom'

const jobs = [
  {
    to: '/jobs/scribe',
    client: 'Dr. Beth\'s Team',
    title: 'Remote Medical Scribe',
    subtitle: 'Optometry',
    type: 'Full Time · Remote',
    comp: '$8–$11 USD/hour',
    tag: 'Remote',
  },
  {
    to: '/jobs/optical',
    client: 'Newport Vision Source',
    title: 'Float — Optical & Paraoptometric Technician',
    subtitle: 'Newport, WA',
    type: 'Part Time · In Person',
    comp: '$19.00/hour',
    tag: 'In Person',
  },
]

export default function JobsIndex() {
  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-brand-border px-6 py-4">
        <div className="max-w-4xl mx-auto">
          <span className="font-body text-sm font-black tracking-widest uppercase">
            <span className="text-brand-charcoal">INSIGHT</span><span className="text-brand-sage font-normal">ASSIST</span>
          </span>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12">
        <p className="text-xs uppercase tracking-widest text-brand-sage font-medium mb-3">Open Positions</p>
        <h1 className="font-display text-4xl text-brand-charcoal mb-10">Current Openings</h1>

        <div className="space-y-4">
          {jobs.map((job) => (
            <Link
              key={job.to}
              to={job.to}
              className="block border border-brand-border p-6 hover:border-brand-sage transition-colors group"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs text-brand-sage font-medium mb-1">{job.client}</p>
                  <h2 className="font-display text-2xl text-brand-charcoal group-hover:text-brand-forest transition-colors">{job.title}</h2>
                  <p className="text-sm text-gray-500 mt-1 italic">{job.subtitle}</p>
                  <div className="flex gap-3 mt-3 flex-wrap">
                    <span className="text-xs text-gray-500 bg-brand-cream px-3 py-1">{job.type}</span>
                    <span className="text-xs text-white bg-brand-sage px-3 py-1 font-medium">{job.comp}</span>
                  </div>
                </div>
                <span className="text-brand-sage group-hover:text-brand-forest transition-colors text-lg flex-shrink-0 mt-1">→</span>
              </div>
            </Link>
          ))}
        </div>

        <p className="text-xs text-gray-400 mt-12 text-center">Insight Assist · insight-assist.net</p>
      </main>
    </div>
  )
}
