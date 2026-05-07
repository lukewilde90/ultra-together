import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import type { Milestone } from '@/types'

export function useMilestones(coupleId: string | null | undefined) {
  const [milestones, setMilestones] = useState<Milestone[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    if (!coupleId) { setMilestones([]); setLoading(false); return }
    setLoading(true)
    const { data } = await supabase
      .from('milestones')
      .select('*')
      .eq('couple_id', coupleId)
      .order('distance_km', { ascending: true })
    setMilestones((data ?? []) as Milestone[])
    setLoading(false)
  }, [coupleId])

  useEffect(() => { load() }, [load])

  return { milestones, loading, reload: load }
}
