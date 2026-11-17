import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Download, PackageMinus, Plus } from 'lucide-react'
import EmptyState from '../components/EmptyState'
import WithdrawalModal from '../components/WithdrawalModal'
import { getWithdrawals } from '../services/withdrawalService'
import { getClientById } from '../services/clientService'
import { getSettings } from '../services/settingsService'
import { formatCurrency, formatDateTime } from '../utils/format'
import { generateWithdrawalPdf } from '../utils/pdf'
import { Withdrawal } from '../types'

export default function Withdrawals() {
  const withdrawals = useMemo(() => getWithdrawals(), [])
  const settings = useMemo(() => getSettings(), [])
  const [viewing, setViewing] = useState<Withdrawal | null>(null)

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-graphite-900">Retiradas</h1>
          <p className="text-sm text-graphite-600">Histórico de retiradas de material.</p>
        </div>
        <Link to="/retiradas/nova" className="flex items-center gap-2 rounded-lg bg-graphite-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-graphite-800">
          <Plus size={16} /> Nova retirada
        </Link>
      </div>

      {withdrawals.length === 0 ? (
        <EmptyState
          icon={PackageMinus}
          title="Nenhuma retirada registrada."
          action={<Link to="/retiradas/nova" className="rounded-lg bg-graphite-900 px-4 py-2 text-sm font-medium text-white hover:bg-graphite-800">+ Nova retirada</Link>}
        />
      ) : (
        <div className="overflow-x-auto rounded-xl2 border border-gray-200 bg-white shadow-soft">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-graphite-600">
                <th className="px-4 py-3">Número</th>
                <th className="px-4 py-3">Cliente</th>
                <th className="px-4 py-3">Data</th>
                <th className="px-4 py-3">Materiais</th>
                <th className="px-4 py-3">Total</th>
                <th className="px-4 py-3">Saldo após</th>
                <th className="px-4 py-3">Ações</th>
              </tr>
            </thead>
            <tbody>
              {withdrawals.map((w) => {
                const client = getClientById(w.clientId)
                return (
                  <tr key={w.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
                    <td className="px-4 py-3 text-graphite-700">#{String(w.number).padStart(6, '0')}</td>
                    <td className="px-4 py-3 font-medium text-graphite-900">{client?.name ?? '—'}</td>
                    <td className="px-4 py-3 text-graphite-700">{formatDateTime(w.date)}</td>
                    <td className="px-4 py-3 text-graphite-700">{w.items.map((i) => i.materialName).join(', ')}</td>
                    <td className="px-4 py-3 font-bold text-graphite-900">{formatCurrency(w.subtotal)}</td>
                    <td className="px-4 py-3 text-graphite-700">{formatCurrency(w.balanceAfter)}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-3">
                        <button onClick={() => setViewing(w)} className="text-sm font-medium text-graphite-900 underline underline-offset-2">
                          Visualizar
                        </button>
                        {client && (
                          <button onClick={() => generateWithdrawalPdf(w, client, settings)} className="flex items-center gap-1 text-sm font-medium text-graphite-600 hover:text-graphite-900">
                            <Download size={14} /> PDF
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      <WithdrawalModal
        withdrawal={viewing}
        client={viewing ? getClientById(viewing.clientId) ?? null : null}
        settings={settings}
        onClose={() => setViewing(null)}
      />
    </div>
  )
}
