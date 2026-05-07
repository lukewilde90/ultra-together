import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useSessions, deleteSession } from '@/hooks/useSessions'
import { formatDate, formatKm, formatDuration, SESSION_TYPE_ICONS, SESSION_TYPE_LABELS, ENERGY_EMOJIS } from '@/lib/utils'
import LogSessionModal from '@/components/sessions/LogSessionModal'
import { Plus, Trash2 } from 'lucide-react'
import { toast } from '@/hooks/useToast'
import { format } from 'date-fns'

export default function SessionsPage() {
  const { user, profile } = useAuth()
  const { sessions, loading, reload } = useSessions(profile?.couple_id)
  const [showLog, setShowLog] = useState(false)

  const mySessions = sessions.filter(s => s.user_id === user?.id)

  // Group by month
  const grouped: Record<string, typeof mySessions> = {}
  for (const s of mySessions) {
    const key = format(new Date(s.session_date), 'MMMM yyyy')
    if (!grouped[key]) grouped[key] = []
    grouped[key].push(s)
  }

  const totalKm = mySessions.reduce((a, s) => a + (s.distance_km ?? 0), 0)
  const longestKm = Math.max(0, ...mySessions.map(s => s.distance_km ?? 0))

  async function handleDelete(id: string) {
    if (!confirm('Delete this session?')) return
    const { error } = await deleteSession(id)
    if (error) toast({ title: 'Error', description: error, variant: 'destructive' })
    else { toast({ title: 'Session deleted' }); reload() }
  }

  return (
    <div className="px-4 py-4 pb-8">
      {/* Summary */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        <div className="stat-card text-center">
          <p className="text-xl font-bold text-trail-700">{mySessions.length}</p>
          <p className="text-xs text-stone-400 mt-0.5">Total</p>
        </div>
        <div className="stat-card text-center">
          <p className="text-xl font-bold text-trail-700">{formatKm(totalKm)}</p>
          <p className="text-xs text-stone-400 mt-0.5">Total km</p>
        </div>
        <div className="stat-card text-center">
          <p className="text-xl font-bold text-trail-700">{formatKm(longestKm)}</p>
          <p className="text-xs text-stone-400 mt-0.5">Longest</p>
        </div>
      </div>

      {loading && <p className="text-center text-stone-400 text-sm py-8">Loading…</p>}

      {!loading && mySessions.length === 0 && (
        <div className="text-center py-16">
          <p className="text-4xl mb-3">🥾</p>
          <p className="text-stone-500 text-sm">No sessions yet. Log your first one!</p>
        </div>
      )}

      {/* Sessions by month */}
      {Object.entries(grouped).map(([month, monthSessions]) => (
        <div key={month} className="mb-5">
          <p className="text-xs font-semibold text-stone-400 uppercase tracking-wide mb-2 px-1">{month}</p>
          <div className="space-y-2">
            {monthSessions.map(s => (
              <div key={s.id} className="stat-card flex items-center gap-3">
                <span className="text-2xl">{SESSION_TYPE_ICONS[s.session_type]}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-stone-800">{SESSION_TYPE_LABELS[s.session_type]}</p>
                  <p className="text-xs text-stone-400">
                    {formatDate(s.session_date)}
                    {s.duration_minutes ? ` · ${formatDuration(s.duration_minutes)}` : ''}
                    {s.energy_level ? ` · ${ENERGY_EMOJIS[s.energy_level]}` : ''}
                  </p>
                </div>
                {s.distance_km && (
                  <span className="text-sm font-semibold text-trail-600 shrink-0">{formatKm(s.distance_km)}</span>
                )}
                <button
                  onClick={() => handleDelete(s.id)}
                  className="text-stone-300 hover:text-red-400 transition-colors shrink-0 ml-1"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* FAB */}
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
