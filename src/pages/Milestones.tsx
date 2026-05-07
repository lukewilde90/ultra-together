import { useAuth } from '@/hooks/useAuth'
import { useSessions } from '@/hooks/useSessions'
import { useMilestones } from '@/hooks/useMilestones'
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts'
import { formatKm, getWeekStart } from '@/lib/utils'
import { format, subWeeks, addDays, startOfWeek } from 'date-fns'

const MILESTONE_DISTANCES = [10, 20, 30, 40, 50]

export default function MilestonesPage() {
  const { user, profile, event } = useAuth()
  const { sessions } = useSessions(profile?.couple_id)
  const { milestones } = useMilestones(profile?.couple_id)

  const mySessions = sessions.filter(s => s.user_id === user?.id)
  const myMilestones = milestones.filter(m => m.user_id === user?.id)
  const partnerMilestones = milestones.filter(m => m.user_id !== user?.id)

  const totalKm = mySessions.reduce((a, s) => a + (s.distance_km ?? 0), 0)
  const longestKm = Math.max(0, ...mySessions.map(s => s.distance_km ?? 0))

  // Build last 8 weeks of data
  const chartData = Array.from({ length: 8 }, (_, i) => {
    const wStart = startOfWeek(subWeeks(new Date(), 7 - i), { weekStartsOn: 1 })
    const wEnd = addDays(wStart, 7)
    const weekKm = mySessions
      .filter(s => { const d = new Date(s.session_date); return d >= wStart && d < wEnd })
      .reduce((a, s) => a + (s.distance_km ?? 0), 0)
    return { week: format(wStart, 'MMM d'), km: parseFloat(weekKm.toFixed(1)) }
  })

  return (
    <div className="px-4 py-4 space-y-5">
      {/* Summary stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="stat-card text-center">
          <p className="text-2xl font-bold text-trail-700">{formatKm(totalKm)}</p>
          <p className="text-xs text-stone-400 mt-0.5">Total distance</p>
        </div>
        <div className="stat-card text-center">
          <p className="text-2xl font-bold text-trail-700">{formatKm(longestKm)}</p>
          <p className="text-xs text-stone-400 mt-0.5">Longest walk</p>
        </div>
        <div className="stat-card text-center">
          <p className="text-2xl font-bold text-trail-700">{mySessions.length}</p>
          <p className="text-xs text-stone-400 mt-0.5">Total sessions</p>
        </div>
        <div className="stat-card text-center">
          <p className="text-2xl font-bold text-trail-700">{myMilestones.length}</p>
          <p className="text-xs text-stone-400 mt-0.5">Milestones hit</p>
        </div>
      </div>

      {/* Milestone badges */}
      <div>
        <p className="text-xs font-semibold text-stone-400 uppercase tracking-wide mb-3">Milestones</p>
        <div className="grid grid-cols-5 gap-2">
          {MILESTONE_DISTANCES.map(dist => {
            const myAchieved = myMilestones.some(m => m.distance_km === dist)
            const partnerAchieved = partnerMilestones.some(m => m.distance_km === dist)
            const isEvent = event && dist === event.distance_km
            return (
              <div key={dist} className="flex flex-col items-center gap-1.5">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold border-2 transition-all ${
                  myAchieved
                    ? 'bg-trail-500 border-trail-400 text-white shadow-md'
                    : 'bg-stone-100 border-stone-200 text-stone-300'
                }`}>
                  {myAchieved ? '🏅' : ''}
                </div>
                <span className="text-[10px] font-medium text-stone-500">{dist}km</span>
                {partnerAchieved && (
                  <span className="text-[9px] text-earth-500">Partner ✓</span>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Weekly km chart */}
      <div>
        <p className="text-xs font-semibold text-stone-400 uppercase tracking-wide mb-3">Weekly distance (last 8 weeks)</p>
        <div className="stat-card p-3">
          <ResponsiveContainer width="100%" height={140}>
            <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <XAxis dataKey="week" tick={{ fontSize: 9, fill: '#a8a29e' }} />
              <YAxis tick={{ fontSize: 9, fill: '#a8a29e' }} />
              <Tooltip
                contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e7e5e4' }}
                formatter={(v: number) => [`${v}km`, 'Distance']}
              />
              <Bar dataKey="km" fill="#3f7f43" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {mySessions.length === 0 && (
        <div className="text-center py-8 text-stone-400">
          <p className="text-3xl mb-2">🏅</p>
          <p className="text-sm">Log some sessions to earn milestones!</p>
        </div>
      )}
    </div>
  )
}
