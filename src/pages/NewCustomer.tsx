import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { createClient } from '../services/clientService'
import { useToast } from '../hooks/useToast'

export default function NewCustomer() {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (busy) return
    setError('')
    setBusy(true)
    try {
      const client = await createClient({ name, phone, address })
      showToast('Cliente cadastrado com sucesso.')
      navigate(`/clientes/${client.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao cadastrar cliente.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="mx-auto max-w-lg">
      <Link to="/clientes" className="mb-4 flex items-center gap-1 text-sm text-graphite-600 hover:text-graphite-900">
        <ArrowLeft size={15} /> Voltar
      </Link>
      <h1 className="mb-1 text-2xl font-extrabold tracking-tight text-graphite-900">Novo cliente</h1>
      <p className="mb-6 text-sm text-graphite-600">Cadastre um novo cliente da Casa do Gesso.</p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4 rounded-xl2 border border-gray-200 bg-white p-6 shadow-soft">
        {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}

        <div>
          <label className="mb-1 block text-sm font-medium text-graphite-900">Nome completo *</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-graphite-900 focus:outline-none"
            placeholder="Ex: João da Silva"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-graphite-900">Número de telefone *</label>
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-graphite-900 focus:outline-none"
            placeholder="(XX) XXXXX-XXXX"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-graphite-900">Endereço</label>
          <input
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-graphite-900 focus:outline-none"
            placeholder="Opcional"
          />
        </div>

        <button type="submit" disabled={busy} className="mt-2 rounded-lg bg-graphite-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-graphite-800 disabled:opacity-60">
          Cadastrar cliente
        </button>
      </form>
    </div>
  )
}
