import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Wallet, TrendingUp, PackageMinus, Users, PackagePlus, ArrowUpRight, ArrowDownRight } from 'lucide-react'
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts'
import StatCard from '../components/StatCard'
import EmptyState from '../components/EmptyState'
import { LoadingState, ErrorState } from '../components/AsyncState'
import { useAsync } from '../hooks/useAsync'
import { getDashboardData } from '../services/reportService'
import { formatCurrency, formatDateTime } from '../utils/format'

export default function Dashboard() {
  const { data, error, reload } = useAsync(() => getDashboardData(), [])
  if (!data) return error ? <ErrorState message={error} onRetry={reload} /> : <LoadingState />
  const { totalReceivable, weekly, clientsWithDebt, series, recentTx, clientNames } = data

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-graphite-900">Visão geral</h1>
        <p className="text-sm text-graphite-600">Acompanhe as movimentações da Casa do Gesso.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total a receber" value={formatCurrency(totalReceivable)} icon={Wallet} tone="negative" delay={0} />
        <StatCard label="Recebido na semana" value={formatCurrency(weekly.totalPaid)} icon={TrendingUp} tone="positive" delay={0.05} />
        <StatCard label="Retiradas na semana" value={formatCurrency(weekly.totalWithdrawn)} icon={PackageMinus} delay={0.1} />
        <StatCard label="Clientes com saldo" value={String(clientsWithDebt)} icon={Users} delay={0.15} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.15 }}
        className="rounded-xl2 border border-gray-200 bg-white p-5 shadow-soft"
      >
        <h2 className="mb-4 text-sm font-bold text-graphite-900">Movimentação da semana</h2>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={series} margin={{ left: -20, right: 10 }}>
              <CartesianGrid stroke="#eee" strokeDasharray="4 4" />
              <XAxis dataKey="label" tick={{ fontSize: 12 }} stroke="#8a8f98" />
              <YAxis tick={{ fontSize: 12 }} stroke="#8a8f98" />
              <Tooltip formatter={(v: number) => formatCurrency(v)} />
              <Legend />
              <Line type="monotone" dataKey="retiradas" name="Retiradas" stroke="#B5502E" strokeWidth={2} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="pagamentos" name="Pagamentos" stroke="#2E7D46" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.2 }}
      >
        <h2 className="mb-3 text-sm font-bold text-graphite-900">Últimas movimentações</h2>
        {recentTx.length === 0 ? (
          <EmptyState icon={PackagePlus} title="Nenhuma movimentação registrada ainda." />
        ) : (
          <div className="flex flex-col gap-2">
            {recentTx.map((tx) => {
              const isWithdrawal = tx.type === 'withdrawal'
              return (
                <div key={tx.id} className="flex items-center justify-between rounded-xl2 border border-gray-200 bg-white px-4 py-3 shadow-soft">
                  <div className="flex items-center gap-3">
                    <div className={`rounded-lg p-2 ${isWithdrawal ? 'bg-orange-50' : 'bg-green-50'}`}>
                      {isWithdrawal ? <ArrowUpRight size={16} className="text-red-600" /> : <ArrowDownRight size={16} className="text-green-600" />}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-graphite-900">{clientNames[tx.clientId] ?? 'Cliente'}</p>
                      <p className="text-xs text-graphite-600">{tx.label} · {formatDateTime(tx.date)}</p>
                    </div>
                  </div>
                  <span className={`text-sm font-bold ${isWithdrawal ? 'text-red-600' : 'text-green-600'}`}>
                    {isWithdrawal ? '+ ' : '- '}{formatCurrency(Math.abs(tx.amount))}
                  </span>
                </div>
              )
            })}
          </div>
        )}
      </motion.div>

      <div className="flex flex-wrap gap-3">
        <Link to="/retiradas/nova" className="rounded-lg bg-graphite-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-graphite-800">
          + Nova retirada
        </Link>
        <Link to="/pagamentos" className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-graphite-900 hover:bg-gray-50">
          + Registrar pagamento
        </Link>
      </div>
    </div>
  )
}
