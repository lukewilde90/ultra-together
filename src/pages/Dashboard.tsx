import { useAuth } from '@/hooks/useAuth'
import { useSessions, useWeeklySessions } from '@/hooks/useSessions'
import { useMilestones } from '@/hooks/useMilestones'
import { Link } from 'react-router-dom'
import {
  formatKm, formatCountdown, calculateReadinessScore,
  getReadinessLabel, getReadinessColor, SESSION_TYPE_ICONS,
  SESSION_TYPE_LABELS, formatDate, daysUntil, getWeekStart
} from '@/lib/utils'
import LogSessionModal from '@/components/sessions/LogSessionModal'
import { useState } from 'react'
import { Plus } from 'lucide-react'

export default function DashboardPage() {
  const { user, profile, couple, event } = useAuth()
  const { sessions, reload } = useSessions(profile?.couple_id)
  const { mySessions, totalKm } = useWeeklySessions(sessions, user?.id)
  const { milestones } = useMilestones(profile?.couple_id)
  const [showLog, setShowLog] = useState(false)

  const partnerId = couple?.user1_id === user?.id ? couple?.user2_id : couple?.user1_id
  const partner = couple?.user1_id === user?.id ? (couple as any)?.user2 : (couple as any)?.user1

  const myAllSessions = sessions.filter(s => s.user_id === user?.id)
  const partnerSessions = sessions.filter(s => s.user_id === partnerId)

  const weekStart = getWeekStart()
  const partnerWeeklySessions = partnerSessions.filter(s => new Date(s.session_date) >= weekStart)
  const partnerWeeklyKm = partnerWeeklySessions.reduce((a, s) => a + (s.distance_km ?? 0), 0)

  const longestKm = Math.max(0, ...myAllSessions.map(s => s.distance_km ?? 0))
  const avgWeeklyKm = myAllSessions.length > 0 ? (myAllSessions.reduce((a, s) => a + (s.distance_km ?? 0), 0) / Math.max(1, Math.ceil(myAllSessions.length / 3))) : 0

  const readiness = event ? calculateReadinessScore({
    longestWalkKm: longestKm,
    weeklyAverageKm: avgWeeklyKm,
    consecutiveWeeks: Math.min(myAllSessions.length, 12),
    weeksToEvent: Math.max(0, Math.ceil(daysUntil(event.event_date) / 7)),
    targetDistanceKm: event.distance_km,
  }) : 0

  const myMilestones = milestones.filter(m => m.user_id === user?.id)
  const recentSessions = myAllSessions.slice(0, 5)

  const daysLeft = event ? daysUntil(event.event_date) : null
  const countdown = daysLeft != null ? formatCountdown(daysLeft) : null

  const isSetup = !couple || !event

  return (
    <div className="px-4 py-4 space-y-4">
      {/* Setup prompt */}
      {isSetup && (
        <div className="stat-card border-trail-200 bg-trail-50">
          <p className="text-sm font-semibold text-trail-800 mb-2">Let's get started 👋</p>
          <div className="space-y-2 text-sm text-trail-700">
            {!couple && <Link to="/settings" className="flex items-center gap-2">✓ <span className="underline">Add an event goal</span></Link>}
            {couple && !partner && <Link to="/settings" className="flex items-center gap-2">✓ <span className="underline">Invite your partner</span></Link>}
          </div>
        </div>
      )}

      {/* Event countdown */}
      {event && countdown && (
        <div className="bg-gradient-to-br from-trail-600 to-trail-800 rounded-2xl p-5 text-white">
          <p className="text-trail-200 text-sm font-medium mb-1">{event.name}</p>
          <div className="flex items-end gap-2 mb-3">
            <span className="font-display text-5xl">{countdown.value}</span>
            {countdown.unit && <span className="text-trail-200 text-lg mb-1">{countdown.unit}</span>}
          </div>
          <div className="flex gap-4 text-sm text-trail-100">
            <span>{event.distance_km}km</span>
            {event.elevation_m > 0 && <span>+{event.elevation_m}m</span>}
            <span>{formatDate(event.event_date)}</span>
          </div>
        </div>
      )}

      {/* This week */}
      <div className="stat-card">
        <p className="text-xs text-stone-500 font-medium uppercase tracking-wide mb-3">This week</p>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-2xl font-bold text-trail-700">{formatKm(totalKm)}</p>
            <p className="text-xs text-stone-400 mt-0.5">Your km</p>
          </div>
          {partner && (
            <div>
              <p className="text-2xl font-bold text-earth-600">{formatKm(partnerWeeklyKm)}</p>
              <p className="text-xs text-stone-400 mt-0.5">{partner?.display_name?.split(' ')[0]}'s km</p>
            </div>
          )}
          <div>
            <p className="text-2xl font-bold text-stone-700">{mySessions.length}</p>
            <p className="text-xs text-stone-400 mt-0.5">Sessions</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-stone-700">{formatKm(longestKm)}</p>
            <p className="text-xs text-stone-400 mt-0.5">Longest walk</p>
          </div>
        </div>
      </div>

      {/* Readiness score */}
      {event && (
        <div className="stat-card flex items-center gap-4">
          <div className="relative w-16 h-16 shrink-0">
            <svg viewBox="0 0 64 64" className="w-full h-full -rotate-90">
              <circle cx="32" cy="32" r="26" fill="none" stroke="#e7e5e4" strokeWidth="6" />
              <circle
                cx="32" cy="32" r="26" fill="none"
                stroke="#2e6332" strokeWidth="6"
                strokeLinecap="round"
                strokeDasharray={`${(readiness / 100) * 163} 163`}
              />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-trail-700">
              {readiness}
            </span>
          </div>
          <div>
            <p className={`text-base font-semibold ${getReadinessColor(readiness)}`}>
              {getReadinessLabel(readiness)}
            </p>
            <p className="text-xs text-stone-400 mt-0.5">Event readiness score</p>
          </div>
        </div>
      )}

      {/* Milestones */}
      {event && (
        <div className="stat-card">
          <p className="text-xs text-stone-500 font-medium uppercase tracking-wide mb-3">Milestones</p>
          <div className="flex gap-2">
            {[10, 20, 30, 40, event.distance_km].map((dist, i) => {
              const achieved = myMilestones.some(m => m.distance_km === dist)
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${achieved ? 'bg-trail-500 text-white' : 'bg-stone-100 text-stone-300'}`}>
                    {achieved ? '✓' : ''}
                  </div>
                  <span className="text-[10px] text-stone-400">{dist}k</span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Recent sessions */}
      {recentSessions.length > 0 && (
        <div>
          <p className="text-xs text-stone-500 font-medium uppercase tracking-wide mb-2 px-1">Recent sessions</p>
          <div className="space-y-2">
            {recentSessions.map(s => (
              <div key={s.id} className="stat-card flex items-center gap-3">
                <span className="text-2xl">{SESSION_TYPE_ICONS[s.session_type]}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-stone-800">{SESSION_TYPE_LABELS[s.session_type]}</p>
                  <p className="text-xs text-stone-400">{formatDate(s.session_date)}</p>
                </div>
                {s.distance_km && <span className="text-sm font-semibold text-trail-600">{formatKm(s.distance_km)}</span>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* FAB */}
      <button
        onClick={() => setShowLog(true)}
        className="fixed bottom-20 right-4 w-14 h-14 bg-trail-600 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-trail-700 transition-colors z-30"
      >
        <Plus size={24} />
      </button>

      {showLog && (
        <LogSessionModal
          onClose={() => setShowLog(false)}
          onSaved={() => { setShowLog(false); reload() }}
        />
      )}
    </div>
  )
}
