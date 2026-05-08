import { NavLink } from 'react-router-dom'
import { Home, Calendar, BookOpen, Package, TrendingUp } from 'lucide-react'

const NAV = [
  { to: '/dashboard', icon: Home,       label: 'Home' },
  { to: '/calendar',  icon: Calendar,   label: 'Calendar' },
  { to: '/programme', icon: BookOpen,   label: 'Plan' },
  { to: '/gear',      icon: Package,    label: 'Gear' },
  { to: '/milestones',icon: TrendingUp, label: 'Progress' },
]

export default function BottomNav() {
  return (
    <nav className="bottom-nav">
      {NAV.map(({ to, icon: Icon, label }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) =>
            `flex flex-col items-center gap-0.5 py-2 px-3 rounded-xl transition-colors min-w-0 ${
              isActive ? 'text-trail-600' : 'text-stone-400 hover:text-stone-600'
            }`
          }
        >
          <Icon size={22} strokeWidth={2} />
          <span className="text-[10px] font-medium truncate">{label}</span>
        </NavLink>
      ))}
    </nav>
  )
}
