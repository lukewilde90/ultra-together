import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import type { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import type { Profile, Couple, TrainingEvent } from '@/types'

interface AuthContextValue {
  user: User | null
  session: Session | null
  profile: Profile | null
  couple: Couple | null
  event: TrainingEvent | null
  loading: boolean
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue>({
  user: null, session: null, profile: null, couple: null, event: null, loading: true,
  refreshProfile: async () => {},
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [couple, setCouple] = useState<Couple | null>(null)
  const [event, setEvent] = useState<TrainingEvent | null>(null)
  const [loading, setLoading] = useState(true)

  async function loadProfile(userId: string) {
    const { data: p } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle()

    setProfile(p ?? null)

    if (p?.couple_id) {
      const { data: c } = await supabase
        .from('couples')
        .select(`*, user1:profiles!couples_user1_id_fkey(*), user2:profiles!couples_user2_id_fkey(*)`)
        .eq('id', p.couple_id)
        .maybeSingle()
      setCouple(c ?? null)

      if (c?.active_event_id) {
        const { data: e } = await supabase
          .from('training_events')
          .select('*')
          .eq('id', c.active_event_id)
          .maybeSingle()
        setEvent(e ?? null)
      }
    }
  }

  async function refreshProfile() {
    if (user) await loadProfile(user.id)
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      if (session?.user) {
        loadProfile(session.user.id).finally(() => setLoading(false))
      } else {
        setLoading(false)
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      if (session?.user) {
        loadProfile(session.user.id)
      } else {
        setProfile(null)
        setCouple(null)
        setEvent(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  return (
    <AuthContext.Provider value={{ user, session, profile, couple, event, loading, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
