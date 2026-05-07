import { useState, FormEvent } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase'
import { toast } from '@/hooks/useToast'
import { useNavigate } from 'react-router-dom'
import { Copy, Check } from 'lucide-react'

type Tab = 'profile' | 'event' | 'partner'

export default function SettingsPage() {
  const { user, profile, couple, event, refreshProfile } = useAuth()
  const navigate = useNavigate()
  const [tab, setTab] = useState<Tab>('profile')
  const [copied, setCopied] = useState(false)

  // Profile
  const [displayName, setDisplayName] = useState(profile?.display_name ?? '')
  const [lowSleep, setLowSleep] = useState(profile?.low_sleep_mode ?? false)
  const [savingProfile, setSavingProfile] = useState(false)

  // Event
  const [eventName, setEventName] = useState(event?.name ?? '')
  const [eventDate, setEventDate] = useState(event?.event_date ?? '')
  const [distanceKm, setDistanceKm] = useState(event?.distance_km?.toString() ?? '')
  const [elevationM, setElevationM] = useState(event?.elevation_m?.toString() ?? '')
  const [savingEvent, setSavingEvent] = useState(false)

  // Invite
  const [inviteEmail, setInviteEmail] = useState('')
  const [sendingInvite, setSendingInvite] = useState(false)
  const [inviteLink, setInviteLink] = useState('')

  const partner = couple?.user1_id === user?.id ? (couple as any)?.user2 : (couple as any)?.user1

  async function saveProfile(e: FormEvent) {
    e.preventDefault()
    if (!user) return
    setSavingProfile(true)
    await supabase.from('profiles').update({ display_name: displayName, low_sleep_mode: lowSleep }).eq('id', user.id)
    await refreshProfile()
    toast({ title: 'Profile saved' })
    setSavingProfile(false)
  }

  async function saveEvent(e: FormEvent) {
    e.preventDefault()
    if (!user || !profile?.couple_id) return
    setSavingEvent(true)

    if (event) {
      await supabase.from('training_events').update({
        name: eventName, event_date: eventDate,
        distance_km: parseFloat(distanceKm), elevation_m: parseFloat(elevationM) || 0,
      }).eq('id', event.id)
    } else {
      const { data: newEvent } = await supabase.from('training_events').insert({
        couple_id: profile.couple_id,
        name: eventName, event_date: eventDate,
        distance_km: parseFloat(distanceKm), elevation_m: parseFloat(elevationM) || 0,
        is_active: true,
      }).select().single()
      if (newEvent) {
        await supabase.from('couples').update({ active_event_id: newEvent.id }).eq('id', profile.couple_id)
      }
    }

    await refreshProfile()
    toast({ title: 'Event saved 🏔️' })
    setSavingEvent(false)
  }

  async function sendInvite(e: FormEvent) {
    e.preventDefault()
    if (!user || !profile?.couple_id) return
    setSendingInvite(true)

    // Generate invite token
    const token = Math.random().toString(36).slice(2) + Date.now().toString(36)
    await supabase.from('couples').update({ invite_token: token, invite_email: inviteEmail }).eq('id', profile.couple_id)

    const link = `${window.location.origin}${import.meta.env.BASE_URL}invite?token=${token}`
    setInviteLink(link)
    toast({ title: 'Invite link generated!', description: 'Share this link with your partner.' })
    setSendingInvite(false)
  }

  function copyLink() {
    navigator.clipboard.writeText(inviteLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  async function signOut() {
    await supabase.auth.signOut()
    navigate('/')
  }

  const TABS: { id: Tab; label: string }[] = [
    { id: 'profile', label: 'Profile' },
    { id: 'event', label: 'Event' },
    { id: 'partner', label: 'Partner' },
  ]

  return (
    <div className="px-4 py-4">
      {/* Tabs */}
      <div className="flex gap-1 bg-stone-100 rounded-xl p-1 mb-5">
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
              tab === t.id ? 'bg-white text-stone-800 shadow-sm' : 'text-stone-500'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'profile' && (
        <form onSubmit={saveProfile} className="space-y-4">
          <div>
            <label className="label">Display name</label>
            <input className="input" value={displayName} onChange={e => setDisplayName(e.target.value)} required />
          </div>
          <div>
            <label className="label">Email</label>
            <input className="input" value={user?.email ?? ''} disabled className="input opacity-60 cursor-not-allowed" />
          </div>
          <div className="flex items-center justify-between p-4 bg-blue-50 rounded-xl border border-blue-100">
            <div>
              <p className="text-sm font-medium text-blue-800">Low sleep mode</p>
              <p className="text-xs text-blue-600 mt-0.5">Softens training targets during hard weeks</p>
            </div>
            <button
              type="button"
              onClick={() => setLowSleep(!lowSleep)}
              className={`w-10 h-6 rounded-full transition-colors ${lowSleep ? 'bg-blue-500' : 'bg-stone-200'}`}
            >
              <div className={`w-4 h-4 bg-white rounded-full shadow transition-transform mx-1 ${lowSleep ? 'translate-x-4' : ''}`} />
            </button>
          </div>
          <button type="submit" disabled={savingProfile} className="btn-primary w-full">
            {savingProfile ? 'Saving…' : 'Save profile'}
          </button>
          <button type="button" onClick={signOut} className="w-full py-3 text-sm font-medium text-red-500 hover:text-red-600 transition-colors">
            Sign out
          </button>
        </form>
      )}

      {tab === 'event' && (
        <form onSubmit={saveEvent} className="space-y-4">
          <p className="text-sm text-stone-500">
            {event ? 'Update your shared training goal.' : 'Set up a shared event goal with your partner.'}
          </p>
          <div>
            <label className="label">Event name</label>
            <input className="input" value={eventName} onChange={e => setEventName(e.target.value)} required placeholder="North Downs Way 50" />
          </div>
          <div>
            <label className="label">Event date</label>
            <input type="date" className="input" value={eventDate} onChange={e => setEventDate(e.target.value)} required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Distance (km)</label>
              <input type="number" className="input" value={distanceKm} onChange={e => setDistanceKm(e.target.value)} required placeholder="50" />
            </div>
            <div>
              <label className="label">Elevation (m)</label>
              <input type="number" className="input" value={elevationM} onChange={e => setElevationM(e.target.value)} placeholder="1500" />
            </div>
          </div>
          <button type="submit" disabled={savingEvent} className="btn-primary w-full">
            {savingEvent ? 'Saving…' : event ? 'Update event' : 'Create event'}
          </button>
        </form>
      )}

      {tab === 'partner' && (
        <div className="space-y-5">
          {partner ? (
            <div className="stat-card flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-earth-100 flex items-center justify-center text-xl font-bold text-earth-600">
                {partner.display_name?.charAt(0)?.toUpperCase()}
              </div>
              <div>
                <p className="font-semibold text-stone-800">{partner.display_name}</p>
                <p className="text-sm text-stone-400">{partner.email}</p>
                <p className="text-xs text-trail-600 mt-0.5">✓ Connected</p>
              </div>
            </div>
          ) : (
            <>
              <p className="text-sm text-stone-500">Invite your partner — they'll get a link to join your training group.</p>
              <form onSubmit={sendInvite} className="space-y-4">
                <div>
                  <label className="label">Partner's email</label>
                  <input type="email" className="input" value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} placeholder="partner@example.com" />
                </div>
                <button type="submit" disabled={sendingInvite} className="btn-primary w-full">
                  {sendingInvite ? 'Generating…' : 'Generate invite link'}
                </button>
              </form>

              {inviteLink && (
                <div className="stat-card">
                  <p className="text-sm font-medium text-stone-700 mb-2">Share this link:</p>
                  <div className="flex items-center gap-2">
                    <p className="text-xs text-stone-500 flex-1 truncate font-mono bg-stone-50 rounded-lg px-3 py-2">{inviteLink}</p>
                    <button onClick={copyLink} className={`shrink-0 p-2 rounded-lg transition-colors ${copied ? 'bg-trail-100 text-trail-600' : 'bg-stone-100 text-stone-500 hover:bg-stone-200'}`}>
                      {copied ? <Check size={16} /> : <Copy size={16} />}
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}
