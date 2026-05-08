import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

if (!supabaseUrl || !supabaseAnonKey) {
  document.body.innerHTML = `
    <div style="font-family:sans-serif;padding:2rem;max-width:500px;margin:2rem auto">
      <h2 style="color:#c00">Missing Supabase environment variables</h2>
      <p>The app could not start because <code>VITE_SUPABASE_URL</code> or
      <code>VITE_SUPABASE_ANON_KEY</code> is not set.</p>
      <p>Go to your GitHub repo → <strong>Settings → Secrets and variables → Actions</strong>
      and make sure both secrets are set, then re-run the deployment workflow.</p>
    </div>`
  throw new Error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
