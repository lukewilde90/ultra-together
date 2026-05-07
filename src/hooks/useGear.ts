import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import type { GearItem } from '@/types'

export function useGear(coupleId: string | null | undefined) {
  const [gear, setGear] = useState<GearItem[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    if (!coupleId) { setGear([]); setLoading(false); return }
    setLoading(true)
    const { data } = await supabase
      .from('gear_items')
      .select('*')
      .eq('couple_id', coupleId)
      .order('created_at', { ascending: false })
    setGear((data ?? []) as GearItem[])
    setLoading(false)
  }, [coupleId])

  useEffect(() => { load() }, [load])

  return { gear, loading, reload: load }
}

export async function addGear(
  userId: string,
  coupleId: string,
  data: Partial<GearItem>
): Promise<{ error: string | null }> {
  const { error } = await supabase.from('gear_items').insert({
    user_id: userId,
    couple_id: coupleId,
    total_km: 0,
    is_retired: false,
    ...data,
  })
  return { error: error?.message ?? null }
}

export async function retireGear(id: string): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from('gear_items')
    .update({ is_retired: true })
    .eq('id', id)
  return { error: error?.message ?? null }
}
