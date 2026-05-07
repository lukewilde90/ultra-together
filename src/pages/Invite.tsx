import { useEffect, useState } from 'react'
import { useSearchParams, useNavigate, Link } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import { toast } from '@/hooks/useToast'

export default function InvitePage() {
  const [params] = useSearchParams()
  const token = params.get('token')
  const navigate = useNavigate()
  const { user, refreshProfile } = useAuth()
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')
  const [inviterName, setInviterName] = useState('')

  useEffect(() => {
    if (!token) { setStatus('error'); return }
    // Look up the couple by invite token
    supabase
      .from('couples')
      .select('*, user1:profiles!couples_user1_id_fkey(display_name)')
      .eq('invite_token', token)
      .maybeSingle()
      .then(({ data }) => {
        if (!data) { setStatus('error'); return }
        setInviterName((data.user1 as any)?.display_name ?? 'Someone')
        setStatus('ready')
      })
  }, [token])

  async function acceptInvite() {
    if (!user || !token) return
    const { data: couple } = await supabase
      .from('couples')
      .select('id')
      .eq('invite_token', token)
      .maybeSingle()
    if (!couple) { toast({ title: 'Invalid invite', variant: 'destructive' }); return }

    // Link user to couple
    await supabase.from('couples').update({ user2_id: user.id, invite_token: null }).eq('id', couple.id)
    await supabase.from('profiles').update({ couple_id: couple.id }).eq('id', user.id)
    await refreshProfile()
    toast({ title: '🎉 You\'re connected!', description: 'Training together starts now.' })
    navigate('/dashboard')
  }

  if (status === 'loading') return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-stone-400 animate-pulse text-sm">Checking invite…</p>
    </div>
  )

  if (status === 'error') return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
      <span className="text-4xl mb-3">😕</span>
      <h2 className="text-xl font-semibold text-stone-800 mb-2">Invite not found</h2>
      <p className="text-stone-500 text-sm mb-6">This link may have expired or already been used.</p>
      <Link to="/" className="btn-primary">Go home</Link>
    </div>
  )

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
      <span className="text-5xl mb-4">🤝</span>
      <h2 className="font-display text-2xl text-stone-800 mb-2">
        {inviterName} invited you!
      </h2>
      <p className="text-stone-500 text-sm mb-8 max-w-xs">
        Join their training journey — you'll share an event goal and track progress together.
      </p>

      {user ? (
        <button onClick={acceptInvite} className="btn-primary w-full max-w-xs">
          Accept invite
        </button>
      ) : (
        <div className="flex flex-col gap-3 w-full max-w-xs">
          <p className="text-sm text-stone-500">Create an account or log in to accept:</p>
          <Link to={`/signup?invite=${token}`} className="btn-primary text-center">
            Create account
          </Link>
          <Link to={`/login?invite=${token}`} className="btn-secondary text-center">
            Log in
          </Link>
        </div>
      )}
    </div>
  )
}
