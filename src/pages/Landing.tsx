import { Link } from 'react-router-dom'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-trail-50 to-stone-50 flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-16 text-center">
        <div className="text-6xl mb-4">🥾</div>
        <h1 className="font-display text-4xl text-stone-800 mb-3">Ultra Together</h1>
        <p className="text-stone-500 text-lg max-w-xs mb-10 leading-relaxed">
          Train for your first ultra hike — together, without the guilt.
        </p>

        <div className="grid grid-cols-2 gap-3 max-w-xs w-full mb-10">
          {[
            { icon: '⛰️', text: 'Shared event goal' },
            { icon: '📅', text: 'Childcare-aware calendar' },
            { icon: '🤝', text: 'Partner progress' },
            { icon: '😴', text: 'Low sleep mode' },
          ].map(f => (
            <div key={f.text} className="stat-card text-left">
              <span className="text-2xl block mb-1">{f.icon}</span>
              <span className="text-xs font-medium text-stone-600">{f.text}</span>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-3 w-full max-w-xs">
          <Link to="/signup" className="btn-primary text-center">
            Get started
          </Link>
          <Link to="/login" className="btn-secondary text-center">
            Log in
          </Link>
        </div>
      </div>
      <p className="text-center text-xs text-stone-400 pb-6">
        For exhausted parents who love big hills 💚
      </p>
    </div>
  )
}
