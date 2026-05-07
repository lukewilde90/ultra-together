import { useAuth } from '@/hooks/useAuth'
import { useSessions } from '@/hooks/useSessions'
import { formatKm, formatDate, SESSION_TYPE_ICONS, SESSION_TYPE_LABELS } from '@/lib/utils'
import { Link } from 'react-router-dom'

export default function PartnerPage() {
  const { user, profile, couple } = useAuth()
  const { sessions } = useSessions(profile?.couple_id)

  const partnerId = couple?.user1_id === user?.id ? couple?.user2_id : couple?.user1_id
  const partner = couple?.user1_id === user?.id ? (couple as any)?.user2 : (couple as any)?.user1

  if (!couple) return (
    <div className="px-4 py-16 text-center">
      <p className="text-5xl mb-4">🤝</p>
      <h2 className="text-xl font-semibold text-stone-800 mb-2">No partner yet</h2>
      <p className="text-stone-500 text-sm mb-6">Invite your training partner in settings.</p>
      <Link to="/settings" className="btn-primary inline-block">Invite partner →</Link>
    </div>
  )

  if (!partner) return (
    <div className="px-4 py-16 text-center">
      <p className="text-5xl mb-4">⏳</p>
      <h2 className="text-xl font-semibold text-stone-800 mb-2">Invite pending</h2>
      <p className="text-stone-500 text-sm">Waiting for your partner to accept.</p>
    </div>
  )

  const mySessions = sessions.filter(s => s.user_id === user?.id)
  const partnerSessions = sessions.filter(s => s.user_id === partnerId).slice(0, 8)
  const myKm = mySessions.reduce((a, s) => a + (s.distance_km ?? 0), 0)
  const partnerKm = sessions.filter(s => s.user_id === partnerId).reduce((a, s) => a + (s.distance_km ?? 0), 0)
  const myLongest = Math.max(0, ...mySessions.map(s => s.distance_km ?? 0))
  const partnerLongest = Math.max(0, ...sessions.filter(s => s.user_id === partnerId).map(s => s.distance_km ?? 0))

  const partnerName = partner?.display_name?.split(' ')[0] ?? 'Partner'

  return (
    <div className="px-4 py-4 space-y-4">
      {/* Partner card */}
      <div className="stat-card flex items-center gap-4">
        <div className="w-14 h-14 rounded-full bg-earth-100 flex items-center justify-center text-2xl font-bold text-earth-600">
          {partner.display_name?.charAt(0)?.toUpperCase() ?? '?'}
        </div>
        <div>
          <h2 className="text-lg font-semibold text-stone-800">{partner.display_name}</h2>
          <p className="text-sm text-stone-400">{partner.email}</p>
        </div>
      </div>

      {/* Side-by-side stats */}
      <p className="text-xs font-semibold text-stone-400 uppercase tracking-wide px-1">Training comparison</p>
      <div className="grid grid-cols-2 gap-3">
        {[
          { label: 'Total km', mine: formatKm(myKm), theirs: formatKm(partnerKm) },
          { label: 'Sessions', mine: mySessions.length, theirs: sessions.filter(s => s.user_id === partnerId).length },
          { label: 'Longest', mine: formatKm(myLongest), theirs: formatKm(partnerLongest) },
        ].map(row => (
          <>
            <div key={`my-${row.label}`} className="stat-card text-center">
              <p className="text-2xl font-bold text-trail-700">{row.mine}</p>
              <p className="text-xs text-stone-400 mt-0.5">Your {row.label.toLowerCase()}</p>
            </div>
            <div key={`their-${row.label}`} className="stat-card text-center">
              <p className="text-2xl font-bold text-earth-600">{row.theirs}</p>
              <p className="text-xs text-stone-400 mt-0.5">{partnerName}'s {row.label.toLowerCase()}</p>
            </div>
          </>
        ))}
      </div>

      {/* Partner sessions */}
      {partnerSessions.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-stone-400 uppercase tracking-wide mb-3">{partnerName}'s recent sessions</p>
          <div className="space-y-2">
            {partnerSessions.map(s => (
              <div key={s.id} className="stat-card flex items-center gap-3">
                <span className="text-2xl">{SESSION_TYPE_ICONS[s.session_type]}</span>
                <div className="flex-1">
                  <p className="text-sm font-medium text-stone-800">{SESSION_TYPE_LABELS[s.session_type]}</p>
                  <p className="text-xs text-stone-400">{formatDate(s.session_date)}</p>
                </div>
                {s.distance_km && <span className="text-sm font-semibold text-earth-600">{formatKm(s.distance_km)}</span>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
