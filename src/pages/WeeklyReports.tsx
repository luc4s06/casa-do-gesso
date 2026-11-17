import { useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight, Download, FileSpreadsheet } from 'lucide-react'
import StatCard from '../components/StatCard'
import { Wallet, TrendingUp, PackageMinus, Receipt as ReceiptIcon, CreditCard } from 'lucide-react'
import { getWeeklySummary, getWeeklyMaterialsReport, getWeeklyClientsReport } from '../services/reportService'
import { getSettings } from '../services/settingsService'
import { formatCurrency, formatRangeLabel } from '../utils/format'
import { generateWeeklyReportPdf } from '../utils/pdf'

export default function WeeklyReports() {
  const [offset, setOffset] = useState(0)
  const settings = useMemo(() => getSettings(), [])
  const summary = useMemo(() => getWeeklySummary(offset), [offset])
  const materialsReport = useMemo(() => getWeeklyMaterialsReport(offset), [offset])
  const clientsReport = useMemo(() => getWeeklyClientsReport(offset), [offset])

  function handlePdf() {
    generateWeeklyReportPdf({
      settings,
      rangeStart: summary.start,
      rangeEnd: summary.end,
      totalWithdrawn: summary.totalWithdrawn,
      totalPaid: summary.totalPaid,
      balanceGenerated: summary.balanceGenerated,
      withdrawalsCount: summary.withdrawalsCount,
      paymentsCount: summary.paymentsCount,
      materials: materialsReport.map((m) => ({ name: m.material.name, quantity: m.quantity, unit: m.material.unit, total: m.total })),
      clients: clientsReport.map((c) => ({ name: c.client?.name ?? '—', withdrawn: c.withdrawn, paid: c.paid, balance: c.balance })),
    })
  }

  function handleCsv() {
    const lines: string[] = []
    lines.push('Casa do Gesso — Relatório Semanal')
    lines.push(`Período;${formatRangeLabel(summary.start, summary.end)}`)
    lines.push('')
    lines.push('Materiais;Quantidade;Unidade;Total')
    materialsReport.forEach((m) => lines.push(`${m.material.name};${m.quantity};${m.material.unit};${m.total}`))
    lines.push('')
    lines.push('Cliente;Total retirado;Total pago;Saldo')
    clientsReport.forEach((c) => lines.push(`${c.client?.name ?? '—'};${c.withdrawn};${c.paid};${c.balance}`))
    const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `relatorio-semanal-${summary.start.toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-graphite-900">Relatório semanal</h1>
        <p className="text-sm text-graphite-600">Acompanhe o desempenho semana a semana.</p>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl2 border border-gray-200 bg-white p-4 shadow-soft">
        <div className="flex items-center gap-2">
          <button onClick={() => setOffset((v) => v - 1)} className="rounded-lg p-2 hover:bg-gray-100"><ChevronLeft size={18} /></button>
          <div className="text-center">
            <p className="text-sm font-bold text-graphite-900">{formatRangeLabel(summary.start, summary.end)}</p>
            <p className="text-xs text-graphite-600">{offset === 0 ? 'Semana atual' : offset < 0 ? `${-offset} semana(s) atrás` : `${offset} semana(s) à frente`}</p>
          </div>
          <button onClick={() => setOffset((v) => v + 1)} className="rounded-lg p-2 hover:bg-gray-100"><ChevronRight size={18} /></button>
        </div>
        <div className="flex gap-2">
          <button onClick={handlePdf} className="flex items-center gap-2 rounded-lg bg-graphite-900 px-3 py-2 text-sm font-medium text-white hover:bg-graphite-800">
            <Download size={15} /> PDF
          </button>
          <button onClick={handleCsv} className="flex items-center gap-2 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-graphite-900 hover:bg-gray-50">
            <FileSpreadsheet size={15} /> CSV
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard label="Total retirado" value={formatCurrency(summary.totalWithdrawn)} icon={PackageMinus} />
        <StatCard label="Total recebido" value={formatCurrency(summary.totalPaid)} icon={TrendingUp} tone="positive" />
        <StatCard label="Saldo gerado" value={formatCurrency(summary.balanceGenerated)} icon={Wallet} tone={summary.balanceGenerated > 0 ? 'negative' : 'positive'} />
        <StatCard label="Qtd. retiradas" value={String(summary.withdrawalsCount)} icon={ReceiptIcon} />
        <StatCard label="Qtd. pagamentos" value={String(summary.paymentsCount)} icon={CreditCard} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-xl2 border border-gray-200 bg-white p-5 shadow-soft">
          <h2 className="mb-3 text-sm font-bold text-graphite-900">Materiais retirados na semana</h2>
          <div className="flex flex-col gap-2">
            {materialsReport.map((m) => (
              <div key={m.material.id} className="flex items-center justify-between border-b border-gray-100 py-2 last:border-0">
                <div>
                  <p className="text-sm font-medium text-graphite-900">{m.material.name}</p>
                  <p className="text-xs text-graphite-600">{m.quantity} {m.material.unit}</p>
                </div>
                <p className="text-sm font-bold text-graphite-900">{formatCurrency(m.total)}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl2 border border-gray-200 bg-white p-5 shadow-soft">
          <h2 className="mb-3 text-sm font-bold text-graphite-900">Clientes na semana</h2>
          {clientsReport.length === 0 ? (
            <p className="text-sm text-graphite-600">Nenhuma movimentação nesta semana.</p>
          ) : (
            <div className="flex flex-col gap-2">
              {clientsReport.map((c) => (
                <div key={c.client?.id} className="flex items-center justify-between border-b border-gray-100 py-2 last:border-0">
                  <p className="text-sm font-medium text-graphite-900">{c.client?.name ?? '—'}</p>
                  <div className="text-right text-xs text-graphite-600">
                    <p>Retirado {formatCurrency(c.withdrawn)} · Pago {formatCurrency(c.paid)}</p>
                    <p className={`font-bold ${c.balance > 0 ? 'text-red-600' : 'text-green-600'}`}>Saldo {formatCurrency(c.balance)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
