import { useState, FormEvent } from 'react'
import { X } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { logSession } from '@/hooks/useSessions'
import { toast } from '@/hooks/useToast'
import { SESSION_TYPE_LABELS, SESSION_TYPE_ICONS, ENERGY_EMOJIS, ENERGY_LABELS } from '@/lib/utils'
import type { SessionType, EnergyLevel } from '@/types'

const SESSION_TYPES: SessionType[] = ['solo_walk', 'long_walk', 'family_walk', 'recovery', 'strength', 'rest']
const ENERGY_LEVELS: EnergyLevel[] = [1, 2, 3, 4, 5]

interface Props {
  onClose: () => void
  onSaved: () => void
}

export default function LogSessionModal({ onClose, onSaved }: Props) {
  const { user, profile } = useAuth()
  const [step, setStep] = useState(1)
  const [saving, setSaving] = useState(false)

  const [sessionType, setSessionType] = useState<SessionType>('solo_walk')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [distanceKm, setDistanceKm] = useState('')
  const [durationMins, setDurationMins] = useState('')
  const [energyLevel, setEnergyLevel] = useState<EnergyLevel>(3)
  const [notes, setNotes] = useState('')
  const [elevationM, setElevationM] = useState('')
  const [blisterNotes, setBlisterNotes] = useState('')
  const [fuellingNotes, setFuellingNotes] = useState('')

  async function handleSave(e: FormEvent) {
    e.preventDefault()
    if (!user || !profile?.couple_id) return
    setSaving(true)
    const { error } = await logSession(user.id, profile.couple_id, {
      session_type: sessionType,
      session_date: date,
      distance_km: distanceKm ? parseFloat(distanceKm) : null,
      duration_minutes: durationMins ? parseInt(durationMins) : null,
      elevation_m: elevationM ? parseInt(elevationM) : null,
      energy_level: energyLevel,
      notes: notes || null,
      blister_notes: blisterNotes || null,
      fuelling_notes: fuellingNotes || null,
    })
    setSaving(false)
    if (error) {
      toast({ title: 'Could not save', description: error, variant: 'destructive' })
    } else {
      toast({ title: 'Session logged! 🥾' })
      onSaved()
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-t-3xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-stone-200" />
        </div>

        <div className="px-5 pb-8">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-semibold text-stone-800">
              {step === 1 ? 'Log session' : 'More details'}
            </h2>
            <button onClick={onClose} className="text-stone-400 hover:text-stone-600">
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSave}>
            {step === 1 && (
              <div className="space-y-5">
                {/* Session type */}
                <div>
                  <label className="label">Type</label>
                  <div className="grid grid-cols-3 gap-2">
                    {SESSION_TYPES.map(type => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setSessionType(type)}
                        className={`py-3 px-2 rounded-xl border text-center text-xs font-medium transition-all ${
                          sessionType === type
                            ? 'border-trail-500 bg-trail-50 text-trail-700'
                            : 'border-stone-200 text-stone-600 hover:border-stone-300'
                        }`}
                      >
                        <span className="block text-xl mb-0.5">{SESSION_TYPE_ICONS[type]}</span>
                        {SESSION_TYPE_LABELS[type]}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Date */}
                <div>
                  <label className="label">Date</label>
                  <input type="date" className="input" value={date} onChange={e => setDate(e.target.value)} required />
                </div>

                {/* Distance & Duration */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="label">Distance (km)</label>
                    <input type="number" className="input" step="0.1" min="0" placeholder="12.5" value={distanceKm} onChange={e => setDistanceKm(e.target.value)} />
                  </div>
                  <div>
                    <label className="label">Duration (mins)</label>
                    <input type="number" className="input" min="0" placeholder="90" value={durationMins} onChange={e => setDurationMins(e.target.value)} />
                  </div>
                </div>

                {/* Energy */}
                <div>
                  <label className="label">How did you feel?</label>
                  <div className="flex gap-2">
                    {ENERGY_LEVELS.map(level => (
                      <button
                        key={level}
                        type="button"
                        onClick={() => setEnergyLevel(level)}
                        className={`flex-1 py-2.5 rounded-xl border text-center text-sm transition-all ${
                          energyLevel === level
                            ? 'border-trail-500 bg-trail-50'
                            : 'border-stone-200 hover:border-stone-300'
                        }`}
                      >
                        <span className="block text-lg">{ENERGY_EMOJIS[level]}</span>
                        <span className="text-[10px] text-stone-500">{ENERGY_LABELS[level]}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className="label">Notes (optional)</label>
                  <textarea className="input resize-none" rows={2} placeholder="How did it go?" value={notes} onChange={e => setNotes(e.target.value)} />
                </div>

                <div className="flex gap-3">
                  <button type="button" onClick={() => setStep(2)} className="btn-secondary flex-1">
                    More details
                  </button>
                  <button type="submit" disabled={saving} className="btn-primary flex-1">
                    {saving ? 'Saving…' : 'Save session'}
                  </button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-5">
                <div>
                  <label className="label">Elevation gain (m)</label>
                  <input type="number" className="input" min="0" placeholder="250" value={elevationM} onChange={e => setElevationM(e.target.value)} />
                </div>
                <div>
                  <label className="label">Blister / pain notes</label>
                  <textarea className="input resize-none" rows={2} placeholder="Left heel hotspot…" value={blisterNotes} onChange={e => setBlisterNotes(e.target.value)} />
                </div>
                <div>
                  <label className="label">Fuelling notes</label>
                  <textarea className="input resize-none" rows={2} placeholder="Gels every 45 mins worked well…" value={fuellingNotes} onChange={e => setFuellingNotes(e.target.value)} />
                </div>
                <div className="flex gap-3">
                  <button type="button" onClick={() => setStep(1)} className="btn-secondary flex-1">
                    ← Back
                  </button>
                  <button type="submit" disabled={saving} className="btn-primary flex-1">
                    {saving ? 'Saving…' : 'Save session'}
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  )
}
