import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import type { TrainingSession } from '@/types'
import { getWeekStart } from '@/lib/utils'

export function useSessions(coupleId: string | null | undefined) {
  const [sessions, setSessions] = useState<TrainingSession[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    if (!coupleId) { setSessions([]); setLoading(false); return }
    setLoading(true)
    const { data } = await supabase
      .from('training_sessions')
      .select('*')
      .eq('couple_id', coupleId)
      .order('session_date', { ascending: false })
    setSessions((data ?? []) as TrainingSession[])
    setLoading(false)
  }, [coupleId])

  useEffect(() => { load() }, [load])

  return { sessions, loading, reload: load }
}

export function useWeeklySessions(sessions: TrainingSession[], userId: string | undefined) {
  const weekStart = getWeekStart()
  const weekEnd = new Date(weekStart)
  weekEnd.setDate(weekEnd.getDate() + 7)

  const mySessions = sessions.filter(s =>
    s.user_id === userId &&
    new Date(s.session_date) >= weekStart &&
    new Date(s.session_date) < weekEnd
  )

  const totalKm = mySessions.reduce((a, s) => a + (s.distance_km ?? 0), 0)
  const sessionCount = mySessions.length

  return { mySessions, totalKm, sessionCount }
}

export async function logSession(
  userId: string,
  coupleId: string,
  data: Partial<TrainingSession>
): Promise<{ error: string | null }> {
  const { error } = await supabase.from('training_sessions').insert({
    user_id: userId,
    couple_id: coupleId,
    completed: true,
    ...data,
  })
  return { error: error?.message ?? null }
}

export async function deleteSession(id: string): Promise<{ error: string | null }> {
  const { error } = await supabase.from('training_sessions').delete().eq('id', id)
  return { error: error?.message ?? null }
}
