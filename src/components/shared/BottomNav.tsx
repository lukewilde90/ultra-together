import { NavLink } from 'react-router-dom'
import { Home, Calendar, Activity, Package, TrendingUp } from 'lucide-react'

const NAV = [
  { to: '/dashboard', icon: Home, label: 'Home' },
  { to: '/calendar', icon: Calendar, label: 'Calendar' },
  { to: '/sessions', icon: Activity, label: 'Sessions' },
  { to: '/gear', icon: Package, label: 'Gear' },
  { to: '/milestones', icon: TrendingUp, label: 'Progress' },
]

export default function BottomNav() {
  return (
    <nav className="bottom-nav safe-area-pb">
      {NAV.map(({ to, icon: Icon, label }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) =>
            `flex flex-col items-center gap-0.5 py-2 px-3 rounded-xl transition-colors ${
              isActive
                ? 'text-trail-600'
                : 'text-stone-400 hover:text-stone-600'
            }`
          }
        >
          <Icon size={22} strokeWidth={2} />
          <span className="text-[10px] font-medium">{label}</span>
        </NavLink>
      ))}
    </nav>
  )
}
