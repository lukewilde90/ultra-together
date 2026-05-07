import { useState, FormEvent } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useGear, addGear, retireGear } from '@/hooks/useGear'
import { getGearHealthPercent, getGearHealthColor } from '@/lib/utils'
import { toast } from '@/hooks/useToast'
import { Plus, X } from 'lucide-react'
import type { GearCategory } from '@/types'

const CATEGORIES: GearCategory[] = ['shoes', 'socks', 'pack', 'poles', 'other']
const CATEGORY_ICONS: Record<GearCategory, string> = {
  shoes: '👟', socks: '🧦', pack: '🎒', poles: '🥢', other: '📦'
}
const RETIRE_KM: Record<GearCategory, number | null> = {
  shoes: 800, socks: 500, pack: null, poles: null, other: null
}

export default function GearPage() {
  const { user, profile } = useAuth()
  const { gear, loading, reload } = useGear(profile?.couple_id)
  const [showAdd, setShowAdd] = useState(false)
  const [name, setName] = useState('')
  const [brand, setBrand] = useState('')
  const [category, setCategory] = useState<GearCategory>('shoes')
  const [saving, setSaving] = useState(false)

  const myGear = gear.filter(g => g.user_id === user?.id && !g.is_retired)
  const partnerGear = gear.filter(g => g.user_id !== user?.id && !g.is_retired)

  async function handleAdd(e: FormEvent) {
    e.preventDefault()
    if (!user || !profile?.couple_id) return
    setSaving(true)
    const { error } = await addGear(user.id, profile.couple_id, {
      name, brand: brand || undefined, category,
      retire_at_km: RETIRE_KM[category],
      current_km: 0,
    } as any)
    setSaving(false)
    if (error) toast({ title: 'Error', description: error, variant: 'destructive' })
    else { toast({ title: 'Gear added!' }); setShowAdd(false); setName(''); setBrand(''); reload() }
  }

  async function handleRetire(id: string) {
    if (!confirm('Retire this gear?')) return
    const { error } = await retireGear(id)
    if (error) toast({ title: 'Error', description: error, variant: 'destructive' })
    else { toast({ title: 'Gear retired' }); reload() }
  }

  const GearCard = ({ g }: { g: any }) => {
    const health = getGearHealthPercent(g.current_km, g.retire_at_km)
    const healthColor = getGearHealthColor(health)
    return (
      <div className="stat-card">
        <div className="flex items-start gap-3">
          <span className="text-2xl">{CATEGORY_ICONS[g.category as GearCategory]}</span>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-stone-800">{g.name}</p>
            {g.brand && <p className="text-xs text-stone-400">{g.brand}</p>}
            <p className="text-xs text-stone-500 mt-1">{g.current_km}km used</p>
            {g.retire_at_km && (
              <div className="mt-2">
                <div className="flex justify-between text-xs text-stone-400 mb-1">
                  <span>Health</span>
                  <span className={healthColor}>{health}%</span>
                </div>
                <div className="h-1.5 rounded-full bg-stone-100 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${health >= 60 ? 'bg-trail-400' : health >= 30 ? 'bg-earth-400' : 'bg-red-400'}`}
                    style={{ width: `${health}%` }}
                  />
                </div>
                {health < 20 && <p className="text-xs text-red-500 mt-1 font-medium">⚠️ Time to replace</p>}
              </div>
            )}
          </div>
          <button onClick={() => handleRetire(g.id)} className="text-stone-300 hover:text-stone-500 text-xs mt-0.5">Retire</button>
        </div>
      </div>
    )
  }

  return (
    <div className="px-4 py-4 space-y-5">
      {/* My gear */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-semibold text-stone-400 uppercase tracking-wide">Your gear</p>
          <button onClick={() => setShowAdd(true)} className="flex items-center gap-1 text-xs text-trail-600 font-medium">
            <Plus size={14} /> Add
          </button>
        </div>
        {loading && <p className="text-stone-400 text-sm py-4">Loading…</p>}
        {!loading && myGear.length === 0 && (
          <div className="stat-card text-center py-6">
            <p className="text-3xl mb-2">🎒</p>
            <p className="text-stone-400 text-sm mb-3">No gear tracked yet</p>
            <button onClick={() => setShowAdd(true)} className="btn-primary text-sm px-4 py-2">Add gear</button>
          </div>
        )}
        <div className="space-y-2">{myGear.map(g => <GearCard key={g.id} g={g} />)}</div>
      </div>

      {/* Partner gear */}
      {partnerGear.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-stone-400 uppercase tracking-wide mb-3">Partner's gear</p>
          <div className="space-y-2">{partnerGear.map(g => <GearCard key={g.id} g={g} />)}</div>
        </div>
      )}

      {/* Add gear modal */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowAdd(false)} />
          <div className="relative bg-white rounded-t-3xl w-full max-w-lg px-5 pt-4 pb-10 shadow-2xl">
            <div className="flex justify-center mb-3"><div className="w-10 h-1 rounded-full bg-stone-200" /></div>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold">Add gear</h2>
              <button onClick={() => setShowAdd(false)}><X size={20} className="text-stone-400" /></button>
            </div>
            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <label className="label">Category</label>
                <div className="grid grid-cols-5 gap-2">
                  {CATEGORIES.map(cat => (
                    <button key={cat} type="button" onClick={() => setCategory(cat)}
                      className={`py-2 rounded-xl border text-center text-xs transition-all ${category === cat ? 'border-trail-500 bg-trail-50 text-trail-700' : 'border-stone-200 text-stone-500'}`}>
                      <span className="block text-lg mb-0.5">{CATEGORY_ICONS[cat]}</span>
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="label">Name</label>
                <input className="input" value={name} onChange={e => setName(e.target.value)} required placeholder="Hoka Speedgoat 5" />
              </div>
              <div>
                <label className="label">Brand (optional)</label>
                <input className="input" value={brand} onChange={e => setBrand(e.target.value)} placeholder="Hoka" />
              </div>
              <button type="submit" disabled={saving} className="btn-primary w-full">
                {saving ? 'Adding…' : 'Add gear'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
