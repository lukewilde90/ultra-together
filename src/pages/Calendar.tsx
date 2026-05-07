import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useSessions } from '@/hooks/useSessions'
import { addDays, format, isSameDay, isToday, startOfWeek, subWeeks, addWeeks } from 'date-fns'
import { SESSION_TYPE_ICONS } from '@/lib/utils'
import LogSessionModal from '@/components/sessions/LogSessionModal'
import { Plus, ChevronLeft, ChevronRight } from 'lucide-react'

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

export default function CalendarPage() {
  const { user, profile, couple } = useAuth()
  const { sessions, reload } = useSessions(profile?.couple_id)
  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date(), { weekStartsOn: 1 }))
  const [showLog, setShowLog] = useState(false)

  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))
  const partnerId = couple?.user1_id === user?.id ? couple?.user2_id : couple?.user1_id

  const weekSessions = sessions.filter(s => {
    const d = new Date(s.session_date)
    return d >= weekStart && d < addDays(weekStart, 7)
  })

  const myKm = weekSessions.filter(s => s.user_id === user?.id).reduce((a, s) => a + (s.distance_km ?? 0), 0)
  const partnerKm = weekSessions.filter(s => s.user_id === partnerId).reduce((a, s) => a + (s.distance_km ?? 0), 0)

  return (
    <div className="px-4 py-4">
      {/* Week navigation */}
      <div className="flex items-center justify-between mb-4">
        <button onClick={() => setWeekStart(d => subWeeks(d, 1))} className="w-9 h-9 flex items-center justify-center rounded-full bg-stone-100 text-stone-600">
          <ChevronLeft size={18} />
        </button>
        <div className="text-center">
          <p className="text-sm font-semibold text-stone-800">
            {format(weekStart, 'MMM d')} – {format(addDays(weekStart, 6), 'MMM d, yyyy')}
          </p>
        </div>
        <button onClick={() => setWeekStart(d => addWeeks(d, 1))} className="w-9 h-9 flex items-center justify-center rounded-full bg-stone-100 text-stone-600">
          <ChevronRight size={18} />
        </button>
      </div>

      {/* Calendar grid */}
      <div className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden mb-4">
        <div className="grid grid-cols-7 border-b border-stone-100">
          {DAY_LABELS.map((label, i) => {
            const day = days[i]
            const today = isToday(day)
            return (
              <div key={label} className={`py-2 text-center ${today ? 'bg-trail-50' : ''}`}>
                <p className={`text-[10px] font-medium ${today ? 'text-trail-600' : 'text-stone-400'}`}>{label}</p>
                <p className={`text-sm font-bold mt-0.5 ${today ? 'text-trail-700' : 'text-stone-700'}`}>{format(day, 'd')}</p>
              </div>
            )
          })}
        </div>

        <div className="grid grid-cols-7 min-h-[120px] divide-x divide-stone-50">
          {days.map((day, i) => {
            const daySessions = weekSessions.filter(s => isSameDay(new Date(s.session_date), day))
            return (
              <div key={i} className={`p-1 flex flex-col gap-1 min-h-[120px] ${isToday(day) ? 'bg-trail-50/40' : ''}`}>
                {daySessions.map(s => {
                  const isMe = s.user_id === user?.id
                  return (
                    <div key={s.id} className={`rounded-lg px-0.5 py-1 text-center ${isMe ? 'bg-trail-100 border border-trail-200' : 'bg-earth-50 border border-earth-200'}`}>
                      <span className="text-base block">{SESSION_TYPE_ICONS[s.session_type]}</span>
                      {s.distance_km && (
                        <p className={`text-[9px] font-semibold ${isMe ? 'text-trail-700' : 'text-earth-700'}`}>{s.distance_km}k</p>
                      )}
                    </div>
                  )
                })}
                {daySessions.length === 0 && (
                  <div className="flex-1 flex items-center justify-center">
                    <div className="w-4 h-4 rounded-full border-2 border-dashed border-stone-200" />
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {couple && (
          <div className="flex items-center gap-4 px-3 py-2 border-t border-stone-100 bg-stone-50/50">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-sm bg-trail-200 border border-trail-300" />
              <span className="text-xs text-stone-500">You</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-sm bg-earth-100 border border-earth-200" />
              <span className="text-xs text-stone-500">Partner</span>
            </div>
          </div>
        )}
      </div>

      {/* Weekly summary */}
      {weekSessions.length > 0 && (
        <div className="stat-card">
          <p className="text-xs text-stone-500 font-medium uppercase tracking-wide mb-3">This week</p>
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center">
              <p className="text-xl font-bold text-trail-700">{myKm.toFixed(1)}km</p>
              <p className="text-xs text-stone-400 mt-0.5">Your km</p>
            </div>
            {couple && (
              <div className="text-center">
                <p className="text-xl font-bold text-earth-600">{partnerKm.toFixed(1)}km</p>
                <p className="text-xs text-stone-400 mt-0.5">Partner km</p>
              </div>
            )}
            <div className="text-center">
              <p className="text-xl font-bold text-stone-700">{weekSessions.length}</p>
              <p className="text-xs text-stone-400 mt-0.5">Sessions</p>
            </div>
          </div>
        </div>
      )}

      <button
        onClick={() => setShowLog(true)}
        className="fixed bottom-20 right-4 w-14 h-14 bg-trail-600 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-trail-700 transition-colors z-30"
      >
        <Plus size={24} />
      </button>

      {showLog && (
        <LogSessionModal onClose={() => setShowLog(false)} onSaved={() => { setShowLog(false); reload() }} />
      )}
    </div>
  )
}
