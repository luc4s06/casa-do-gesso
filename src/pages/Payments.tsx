import { useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Download, Plus, Wallet, X } from 'lucide-react'
import EmptyState from '../components/EmptyState'
import ConfirmDialog from '../components/ConfirmDialog'
import PaymentModal from '../components/PaymentModal'
import { getClients } from '../services/clientService'
import { getPayments, createPayment } from '../services/paymentService'
import { getClientBalance } from '../services/reportService'
import { getClientById } from '../services/clientService'
import { getSettings } from '../services/settingsService'
import { formatCurrency, formatDateTime } from '../utils/format'
import { generatePaymentPdf } from '../utils/pdf'
import { useToast } from '../hooks/useToast'
import { Payment, PaymentMethod } from '../types'

const METHOD_LABEL: Record<PaymentMethod, string> = { pix: 'PIX', dinheiro: 'Dinheiro', cartao: 'Cartão', outro: 'Outro' }

export default function Payments() {
  const { showToast } = useToast()
  const clients = useMemo(() => getClients(), [])
  const settings = useMemo(() => getSettings(), [])
  const [payments, setPayments] = useState(() => getPayments())
  const [open, setOpen] = useState(false)
  const [clientId, setClientId] = useState('')
  const [amount, setAmount] = useState('')
  const [method, setMethod] = useState<PaymentMethod>('pix')
  const [note, setNote] = useState('')
  const [error, setError] = useState('')
  const [confirmOverpay, setConfirmOverpay] = useState(false)
  const [result, setResult] = useState<Payment | null>(null)

  const balance = clientId ? getClientBalance(clientId) : 0

  function reset() {
    setClientId(''); setAmount(''); setMethod('pix'); setNote(''); setError('')
  }

  function submit(allowOverpay = false) {
    setError('')
    try {
      const payment = createPayment({ clientId, amount: Number(amount), method, note, allowOverpay })
      setPayments(getPayments())
      showToast('Pagamento registrado com sucesso.')
      setResult(payment)
      setOpen(false)
      setConfirmOverpay(false)
      reset()
    } catch (err) {
      if (err instanceof Error && err.message === 'OVERPAY') {
        setConfirmOverpay(true)
      } else {
        setError(err instanceof Error ? err.message : 'Erro ao registrar pagamento.')
      }
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!clientId) { setError('Selecione um cliente.'); return }
    if (Number(amount) <= 0) { setError('O valor do pagamento deve ser maior que zero.'); return }
    submit(false)
  }

  const client = clientId ? clients.find((c) => c.id === clientId) : undefined

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-graphite-900">Pagamentos</h1>
          <p className="text-sm text-graphite-600">Registre e consulte os pagamentos recebidos.</p>
        </div>
        <button onClick={() => setOpen((v) => !v)} className="flex items-center gap-2 rounded-lg bg-graphite-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-graphite-800">
          {open ? <X size={16} /> : <Plus size={16} />} {open ? 'Cancelar' : 'Registrar pagamento'}
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.form
            onSubmit={handleSubmit}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="flex flex-col gap-4 rounded-xl2 border border-gray-200 bg-white p-5 shadow-soft">
              {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}

              <div>
                <label className="mb-1 block text-sm font-medium text-graphite-900">Cliente</label>
                <select value={clientId} onChange={(e) => setClientId(e.target.value)} required className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-graphite-900 focus:outline-none">
                  <option value="">Selecione um cliente</option>
                  {clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                {clientId && <p className="mt-2 text-sm text-graphite-700">Saldo atual: <span className="font-bold text-graphite-900">{formatCurrency(balance)}</span></p>}
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-graphite-900">Valor do pagamento</label>
                  <input type="number" min={0.01} step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} required className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-graphite-900 focus:outline-none" placeholder="R$ 0,00" />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-graphite-900">Forma de pagamento</label>
                  <select value={method} onChange={(e) => setMethod(e.target.value as PaymentMethod)} className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-graphite-900 focus:outline-none">
                    <option value="pix">PIX</option>
                    <option value="dinheiro">Dinheiro</option>
                    <option value="cartao">Cartão</option>
                    <option value="outro">Outro</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-graphite-900">Observação</label>
                <input value={note} onChange={(e) => setNote(e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-graphite-900 focus:outline-none" placeholder="Opcional" />
              </div>

              <button type="submit" className="mt-1 rounded-lg bg-graphite-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-graphite-800">
                Registrar pagamento
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {payments.length === 0 ? (
        <EmptyState icon={Wallet} title="Nenhum pagamento registrado." />
      ) : (
        <div className="overflow-x-auto rounded-xl2 border border-gray-200 bg-white shadow-soft">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-graphite-600">
                <th className="px-4 py-3">Número</th>
                <th className="px-4 py-3">Cliente</th>
                <th className="px-4 py-3">Data</th>
                <th className="px-4 py-3">Forma</th>
                <th className="px-4 py-3">Valor</th>
                <th className="px-4 py-3">Saldo após</th>
                <th className="px-4 py-3">Ações</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((p) => {
                const c = getClientById(p.clientId)
                return (
                  <tr key={p.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
                    <td className="px-4 py-3 text-graphite-700">#{String(p.number).padStart(6, '0')}</td>
                    <td className="px-4 py-3 font-medium text-graphite-900">{c?.name ?? '—'}</td>
                    <td className="px-4 py-3 text-graphite-700">{formatDateTime(p.date)}</td>
                    <td className="px-4 py-3 text-graphite-700">{METHOD_LABEL[p.method]}</td>
                    <td className="px-4 py-3 font-bold text-green-600">{formatCurrency(p.amount)}</td>
                    <td className="px-4 py-3 text-graphite-700">{formatCurrency(p.balanceAfter)}</td>
                    <td className="px-4 py-3">
                      {c && (
                        <button onClick={() => generatePaymentPdf(p, c, settings)} className="flex items-center gap-1 text-sm font-medium text-graphite-600 hover:text-graphite-900">
                          <Download size={14} /> PDF
                        </button>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmDialog
        open={confirmOverpay}
        title="Pagamento maior que o saldo"
        description={`O valor informado (${formatCurrency(Number(amount))}) é maior que o saldo atual do cliente (${formatCurrency(balance)}). Deseja continuar mesmo assim?`}
        confirmLabel="Registrar mesmo assim"
        onConfirm={() => submit(true)}
        onCancel={() => setConfirmOverpay(false)}
      />

      <PaymentModal payment={result} client={client ?? null} settings={settings} onClose={() => setResult(null)} />
    </div>
  )
}
