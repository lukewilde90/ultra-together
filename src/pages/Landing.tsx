import { Link } from 'react-router-dom'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-stone-50 flex flex-col">
      {/* Hero */}
      <div className="flex-1 flex flex-col px-6 pt-16 pb-8">
        {/* Logo mark */}
        <div className="mb-8">
          <div className="w-14 h-14 bg-trail-600 rounded-2xl flex items-center justify-center text-2xl shadow-lg mb-5">
            🥾
          </div>
          <h1 className="font-display text-4xl text-stone-900 leading-tight mb-3">
            Train for the trail.<br />
            <span className="text-trail-600">Together.</span>
          </h1>
          <p className="text-stone-500 text-base leading-relaxed max-w-xs">
            A training app for couples preparing for their first ultra hike — built around real life with kids.
          </p>
        </div>

        {/* Feature list */}
        <div className="space-y-3 mb-10">
          {[
            { icon: '⛰️', title: 'Shared event goal', desc: 'One target, two training logs' },
            { icon: '📋', title: 'Built-in training plan', desc: 'Gym + walking programme included' },
            { icon: '📅', title: 'Childcare-aware calendar', desc: 'Plan around who covers the kids' },
            { icon: '😴', title: 'Low sleep mode', desc: 'Softens targets on hard weeks' },
          ].map(f => (
            <div key={f.title} className="flex items-center gap-3">
              <div className="w-9 h-9 bg-white rounded-xl border border-stone-100 shadow-sm flex items-center justify-center text-lg shrink-0">
                {f.icon}
              </div>
              <div>
                <p className="text-sm font-semibold text-stone-800 leading-tight">{f.title}</p>
                <p className="text-xs text-stone-400">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* CTAs */}
        <div className="flex flex-col gap-3 mt-auto">
          <Link to="/signup" className="btn-primary text-center text-base py-4">
            Get started — it's free
          </Link>
          <Link to="/login" className="btn-secondary text-center">
            Log in
          </Link>
        </div>
      </div>

      <p className="text-center text-xs text-stone-400 pb-6 px-6">
        No subscription. No adverts. Just the app.
      </p>
    </div>
  )
}
