import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { supabaseConfigured } from '../lib/supabase'

export default function Login() {
  const { signIn } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      await signIn(email, password)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível entrar.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex flex-col items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-graphite-900 text-sm font-extrabold text-white">CG</div>
          <h1 className="text-xl font-extrabold tracking-tight text-graphite-900">CASA DO GESSO</h1>
          <p className="text-sm text-graphite-600">Entre para acessar o sistema.</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 rounded-xl2 border border-gray-200 bg-white p-6 shadow-soft">
          {!supabaseConfigured && (
            <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">
              O Supabase ainda não foi configurado. Defina VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY (veja o README).
            </p>
          )}
          {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}

          <div>
            <label className="mb-1 block text-sm font-medium text-graphite-900">E-mail</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-graphite-900 focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-graphite-900">Senha</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-graphite-900 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={busy}
            className="mt-1 flex items-center justify-center gap-2 rounded-lg bg-graphite-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-graphite-800 disabled:opacity-60"
          >
            {busy && <Loader2 size={15} className="animate-spin" />} Entrar
          </button>
        </form>
      </div>
    </div>
  )
}
