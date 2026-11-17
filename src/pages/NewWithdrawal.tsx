import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, Trash2, Plus } from 'lucide-react'
import { getClients } from '../services/clientService'
import { getMaterials, getCurrentPrice } from '../services/materialService'
import { getClientBalance } from '../services/reportService'
import { createWithdrawal } from '../services/withdrawalService'
import { getSettings } from '../services/settingsService'
import { formatCurrency } from '../utils/format'
import { useToast } from '../hooks/useToast'
import WithdrawalModal from '../components/WithdrawalModal'
import { Withdrawal } from '../types'

interface Row {
  materialId: string
  quantity: number
}

export default function NewWithdrawal() {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const clients = useMemo(() => getClients(), [])
  const materials = useMemo(() => getMaterials(), [])
  const settings = useMemo(() => getSettings(), [])

  const [clientId, setClientId] = useState('')
  const [rows, setRows] = useState<Row[]>([{ materialId: materials[0]?.id ?? '', quantity: 1 }])
  const [error, setError] = useState('')
  const [result, setResult] = useState<Withdrawal | null>(null)

  const balanceBefore = clientId ? getClientBalance(clientId) : 0

  const detailedRows = rows.map((r) => {
    const material = materials.find((m) => m.id === r.materialId)
    const unitPrice = r.materialId ? getCurrentPrice(r.materialId) : 0
    const total = round2((r.quantity || 0) * unitPrice)
    return { ...r, material, unitPrice, total }
  })
  const subtotal = round2(detailedRows.reduce((s, r) => s + r.total, 0))
  const balanceAfter = round2(balanceBefore + subtotal)

  function addRow() {
    setRows((prev) => [...prev, { materialId: materials[0]?.id ?? '', quantity: 1 }])
  }
  function removeRow(idx: number) {
    setRows((prev) => prev.filter((_, i) => i !== idx))
  }
  function updateRow(idx: number, patch: Partial<Row>) {
    setRows((prev) => prev.map((r, i) => (i === idx ? { ...r, ...patch } : r)))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    try {
      const withdrawal = createWithdrawal(
        clientId,
        detailedRows.map((r) => ({
          materialId: r.materialId,
          materialName: r.material?.name ?? '',
          unit: r.material?.unit ?? 'metro',
          quantity: Number(r.quantity),
          unitPrice: r.unitPrice,
        }))
      )
      showToast('Retirada registrada com sucesso.')
      setResult(withdrawal)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao registrar retirada.')
    }
  }

  const client = clientId ? clients.find((c) => c.id === clientId) : undefined

  return (
    <div className="mx-auto max-w-2xl">
      <Link to="/retiradas" className="mb-4 flex items-center gap-1 text-sm text-graphite-600 hover:text-graphite-900">
        <ArrowLeft size={15} /> Voltar
      </Link>
      <h1 className="mb-1 text-2xl font-extrabold tracking-tight text-graphite-900">Nova retirada</h1>
      <p className="mb-6 text-sm text-graphite-600">Registre uma retirada de material para um cliente.</p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}

        <div className="rounded-xl2 border border-gray-200 bg-white p-5 shadow-soft">
          <label className="mb-1 block text-sm font-medium text-graphite-900">Cliente</label>
          <select
            value={clientId}
            onChange={(e) => setClientId(e.target.value)}
            required
            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-graphite-900 focus:outline-none"
          >
            <option value="">Selecione um cliente</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          {clientId && (
            <p className="mt-3 text-sm text-graphite-700">
              Saldo atual do cliente: <span className="font-bold text-graphite-900">{formatCurrency(balanceBefore)}</span>
            </p>
          )}
        </div>

        <div className="rounded-xl2 border border-gray-200 bg-white p-5 shadow-soft">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-bold text-graphite-900">Materiais</h2>
            <button type="button" onClick={addRow} className="flex items-center gap-1 text-sm font-medium text-graphite-900 hover:underline">
              <Plus size={15} /> Adicionar material
            </button>
          </div>

          <div className="flex flex-col gap-4">
            {detailedRows.map((row, idx) => (
              <div key={idx} className="grid grid-cols-1 gap-3 rounded-lg border border-gray-200 p-3 sm:grid-cols-[2fr_1fr_1fr_1fr_auto]">
                <div>
                  <label className="mb-1 block text-xs font-medium text-graphite-600">Material</label>
                  <select
                    value={row.materialId}
                    onChange={(e) => updateRow(idx, { materialId: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 px-2 py-2 text-sm focus:border-graphite-900 focus:outline-none"
                  >
                    {materials.map((m) => (
                      <option key={m.id} value={m.id}>{m.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-graphite-600">Quantidade</label>
                  <input
                    type="number" min={0.01} step="0.01"
                    value={row.quantity}
                    onChange={(e) => updateRow(idx, { quantity: Number(e.target.value) })}
                    className="w-full rounded-lg border border-gray-300 px-2 py-2 text-sm focus:border-graphite-900 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-graphite-600">Unidade</label>
                  <p className="rounded-lg bg-gray-50 px-2 py-2 text-sm text-graphite-700">{row.material?.unit}</p>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-graphite-600">Preço unit.</label>
                  <p className="rounded-lg bg-gray-50 px-2 py-2 text-sm text-graphite-700">{formatCurrency(row.unitPrice)}</p>
                </div>
                <div className="flex items-end justify-between gap-2 sm:flex-col sm:items-end">
                  <p className="text-sm font-bold text-graphite-900">{formatCurrency(row.total)}</p>
                  {rows.length > 1 && (
                    <button type="button" onClick={() => removeRow(idx)} className="rounded-lg p-1.5 text-red-500 hover:bg-red-50">
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl2 border border-gray-200 bg-white p-5 shadow-soft">
          <div className="flex justify-between py-1 text-sm text-graphite-700">
            <span>Subtotal dos materiais</span><span className="font-semibold">{formatCurrency(subtotal)}</span>
          </div>
          <div className="flex justify-between py-1 text-sm text-graphite-700">
            <span>Saldo anterior</span><span>{formatCurrency(balanceBefore)}</span>
          </div>
          <div className="flex justify-between py-1 text-sm text-graphite-700">
            <span>Nova retirada</span><span>+ {formatCurrency(subtotal)}</span>
          </div>
          <div className="mt-2 flex justify-between border-t border-gray-200 pt-2 text-base font-extrabold text-graphite-900">
            <span>Novo saldo</span><span>{formatCurrency(balanceAfter)}</span>
          </div>
        </div>

        <button type="submit" className="rounded-lg bg-graphite-900 px-4 py-3 text-sm font-semibold text-white hover:bg-graphite-800">
          Registrar retirada
        </button>
      </form>

      <WithdrawalModal
        withdrawal={result}
        client={client ?? null}
        settings={settings}
        onClose={() => { setResult(null); navigate('/retiradas') }}
      />
    </div>
  )
}

function round2(n: number): number {
  return Math.round(n * 100) / 100
}
