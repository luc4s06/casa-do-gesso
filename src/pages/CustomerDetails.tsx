import { useMemo } from 'react'
import { useParams, Link, Navigate } from 'react-router-dom'
import { ArrowLeft, Phone, MapPin, PackageMinus, Wallet, History } from 'lucide-react'
import { motion } from 'framer-motion'
import { getClientById } from '../services/clientService'
import { getClientTotals, getClientTransactions } from '../services/reportService'
import { formatCurrency, formatDateTime } from '../utils/format'
import EmptyState from '../components/EmptyState'

export default function CustomerDetails() {
  const { id } = useParams<{ id: string }>()
  const client = id ? getClientById(id) : undefined
  const totals = useMemo(() => (id ? getClientTotals(id) : null), [id])
  const transactions = useMemo(() => (id ? getClientTransactions(id) : []), [id])

  if (!client || !totals) return <Navigate to="/clientes" replace />

  return (
    <div className="flex flex-col gap-6">
      <Link to="/clientes" className="flex items-center gap-1 text-sm text-graphite-600 hover:text-graphite-900">
        <ArrowLeft size={15} /> Voltar para clientes
      </Link>

      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-graphite-900">{client.name}</h1>
        <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-graphite-600">
          <span className="flex items-center gap-1"><Phone size={14} /> {client.phone}</span>
          {client.address && <span className="flex items-center gap-1"><MapPin size={14} /> {client.address}</span>}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          className="rounded-xl2 border border-gray-200 bg-graphite-900 p-6 text-white shadow-soft sm:col-span-1"
        >
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-300">Saldo atual</p>
          <p className={`text-3xl font-extrabold ${totals.balance > 0 ? 'text-red-400' : 'text-green-400'}`}>
            {formatCurrency(totals.balance)}
          </p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="rounded-xl2 border border-gray-200 bg-white p-6 shadow-soft">
          <p className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-graphite-600"><PackageMinus size={14} /> Total retirado</p>
          <p className="text-2xl font-extrabold text-graphite-900">{formatCurrency(totals.totalWithdrawn)}</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="rounded-xl2 border border-gray-200 bg-white p-6 shadow-soft">
          <p className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-graphite-600"><Wallet size={14} /> Total pago</p>
          <p className="text-2xl font-extrabold text-graphite-900">{formatCurrency(totals.totalPaid)}</p>
        </motion.div>
      </div>

      <div>
        <h2 className="mb-3 text-sm font-bold text-graphite-900">Histórico do cliente</h2>
        {transactions.length === 0 ? (
          <EmptyState icon={History} title="Nenhuma movimentação registrada para este cliente." />
        ) : (
          <div className="flex flex-col gap-3 border-l-2 border-gray-200 pl-5">
            {(() => {
              let running = totals.balance
              return transactions.map((tx) => {
                const balanceAtPoint = running
                running = tx.type === 'withdrawal' ? running - tx.amount : running + Math.abs(tx.amount)
                const isWithdrawal = tx.type === 'withdrawal'
                return (
                  <div key={tx.id} className="relative rounded-xl2 border border-gray-200 bg-white p-4 shadow-soft">
                    <div className="absolute -left-[27px] top-5 h-3 w-3 rounded-full border-2 border-white bg-graphite-900" />
                    <p className="text-xs text-graphite-600">{formatDateTime(tx.date)}</p>
                    <div className="mt-1 flex items-center justify-between">
                      <span className="text-sm font-semibold text-graphite-900">
                        {isWithdrawal ? '📦 ' : '💰 '}{tx.label}
                      </span>
                      <span className={`text-sm font-bold ${isWithdrawal ? 'text-red-600' : 'text-green-600'}`}>
                        {isWithdrawal ? '+ ' : '- '}{formatCurrency(Math.abs(tx.amount))}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-graphite-600">Saldo: {formatCurrency(balanceAtPoint)}</p>
                  </div>
                )
              })
            })()}
          </div>
        )}
      </div>
    </div>
  )
}
