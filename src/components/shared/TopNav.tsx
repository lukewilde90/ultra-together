import { useLocation, Link } from 'react-router-dom'
import { Settings } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'

const TITLES: Record<string, string> = {
  '/dashboard':  'Home',
  '/calendar':   'Calendar',
  '/sessions':   'Sessions',
  '/programme':  'Training Plan',
  '/gear':       'Gear',
  '/milestones': 'Progress',
  '/partner':    'Partner',
  '/settings':   'Settings',
}

export default function TopNav() {
  const { pathname } = useLocation()
  const { profile } = useAuth()
  const title = TITLES[pathname] ?? 'Ultra Together'

  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-sm border-b border-stone-100">
      <div className="page-container flex items-center justify-between px-4 h-14">
        <div className="flex items-center gap-2">
          <span className="text-xl">🥾</span>
          <span className="font-display text-lg text-stone-800">{title}</span>
        </div>
        <div className="flex items-center gap-3">
          {profile?.low_sleep_mode && (
            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">
              😴 Low sleep
            </span>
          )}
          <Link
            to="/settings"
            className="w-8 h-8 flex items-center justify-center rounded-full text-stone-400 hover:text-stone-600 hover:bg-stone-100 transition-colors"
          >
            <Settings size={18} />
          </Link>
        </div>
      </div>
    </header>
  )
}
