import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Search, UserPlus, Users } from 'lucide-react'
import EmptyState from '../components/EmptyState'
import CustomerCard from '../components/CustomerCard'
import { LoadingState, ErrorState } from '../components/AsyncState'
import { useAsync } from '../hooks/useAsync'
import { getClientsWithBalance } from '../services/clientService'
import { formatCurrency } from '../utils/format'

export default function Customers() {
  const [query, setQuery] = useState('')
  const { data: clients, error, reload } = useAsync(() => getClientsWithBalance(), [])
  if (!clients) return error ? <ErrorState message={error} onRetry={reload} /> : <LoadingState />

  const filtered = clients.filter(
    (c) => c.name.toLowerCase().includes(query.toLowerCase()) || c.phone.includes(query)
  )

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-graphite-900">Clientes</h1>
          <p className="text-sm text-graphite-600">Gerencie os clientes da Casa do Gesso.</p>
        </div>
        <Link
          to="/clientes/novo"
          className="flex items-center gap-2 rounded-lg bg-graphite-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-graphite-800"
        >
          <UserPlus size={16} /> Novo cliente
        </Link>
      </div>

      {clients.length > 0 && (
        <div className="relative max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-graphite-600" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por nome ou telefone"
            className="w-full rounded-lg border border-gray-300 py-2.5 pl-9 pr-3 text-sm focus:border-graphite-900 focus:outline-none"
          />
        </div>
      )}

      {clients.length === 0 ? (
        <EmptyState
          icon={Users}
          title="Você ainda não possui clientes cadastrados."
          action={
            <Link to="/clientes/novo" className="rounded-lg bg-graphite-900 px-4 py-2 text-sm font-medium text-white hover:bg-graphite-800">
              + Cadastrar cliente
            </Link>
          }
        />
      ) : (
        <>
          {/* Desktop */}
          <div className="hidden overflow-x-auto rounded-xl2 border border-gray-200 bg-white shadow-soft md:block">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-graphite-600">
                  <th className="px-4 py-3">Cliente</th>
                  <th className="px-4 py-3">Telefone</th>
                  <th className="px-4 py-3">Endereço</th>
                  <th className="px-4 py-3">Saldo</th>
                  <th className="px-4 py-3">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c) => (
                  <tr key={c.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-graphite-900">{c.name}</td>
                    <td className="px-4 py-3 text-graphite-700">{c.phone}</td>
                    <td className="px-4 py-3 text-graphite-700">{c.address || '—'}</td>
                    <td className={`px-4 py-3 font-bold ${c.balance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                      {formatCurrency(c.balance)}
                    </td>
                    <td className="px-4 py-3">
                      <Link to={`/clientes/${c.id}`} className="text-sm font-medium text-graphite-900 underline underline-offset-2">
                        Ver detalhes
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile */}
          <div className="flex flex-col gap-3 md:hidden">
            {filtered.map((c) => (
              <CustomerCard key={c.id} client={c} balance={c.balance} />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
