import { Withdrawal, Payment, Transaction, Client } from '../types'
import { readAll } from './storage'
import { getMaterials } from './materialService'

// Nunca ler saldo de um campo solto: ele é sempre derivado das movimentações.
export function getClientBalance(clientId: string): number {
  const withdrawals = readAll<Withdrawal>('withdrawals').filter((w) => w.clientId === clientId)
  const payments = readAll<Payment>('payments').filter((p) => p.clientId === clientId)
  const totalWithdrawn = withdrawals.reduce((s, w) => s + w.subtotal, 0)
  const totalPaid = payments.reduce((s, p) => s + p.amount, 0)
  return round2(totalWithdrawn - totalPaid)
}

export function getClientTotals(clientId: string) {
  const withdrawals = readAll<Withdrawal>('withdrawals').filter((w) => w.clientId === clientId)
  const payments = readAll<Payment>('payments').filter((p) => p.clientId === clientId)
  const totalWithdrawn = round2(withdrawals.reduce((s, w) => s + w.subtotal, 0))
  const totalPaid = round2(payments.reduce((s, p) => s + p.amount, 0))
  return { totalWithdrawn, totalPaid, balance: round2(totalWithdrawn - totalPaid) }
}

export function getClientTransactions(clientId: string): Transaction[] {
  const withdrawals = readAll<Withdrawal>('withdrawals').filter((w) => w.clientId === clientId)
  const payments = readAll<Payment>('payments').filter((p) => p.clientId === clientId)
  const txs: Transaction[] = [
    ...withdrawals.map((w) => ({
      id: w.id,
      clientId: w.clientId,
      type: 'withdrawal' as const,
      date: w.date,
      amount: w.subtotal,
      refId: w.id,
      label: `Retirada #${String(w.number).padStart(6, '0')}`,
    })),
    ...payments.map((p) => ({
      id: p.id,
      clientId: p.clientId,
      type: 'payment' as const,
      date: p.date,
      amount: -p.amount,
      refId: p.id,
      label: `Pagamento #${String(p.number).padStart(6, '0')}`,
    })),
  ]
  return txs.sort((a, b) => (a.date < b.date ? 1 : -1))
}

export function getAllTransactions(limit?: number): Transaction[] {
  const withdrawals = readAll<Withdrawal>('withdrawals')
  const payments = readAll<Payment>('payments')
  const txs: Transaction[] = [
    ...withdrawals.map((w) => ({
      id: w.id,
      clientId: w.clientId,
      type: 'withdrawal' as const,
      date: w.date,
      amount: w.subtotal,
      refId: w.id,
      label: `Retirada #${String(w.number).padStart(6, '0')}`,
    })),
    ...payments.map((p) => ({
      id: p.id,
      clientId: p.clientId,
      type: 'payment' as const,
      date: p.date,
      amount: -p.amount,
      refId: p.id,
      label: `Pagamento #${String(p.number).padStart(6, '0')}`,
    })),
  ].sort((a, b) => (a.date < b.date ? 1 : -1))
  return limit ? txs.slice(0, limit) : txs
}

export function getTotalReceivable(): number {
  const clients = readAll<Client>('clients')
  return round2(clients.reduce((s, c) => s + getClientBalance(c.id), 0))
}

export function getClientsWithDebtCount(): number {
  const clients = readAll<Client>('clients')
  return clients.filter((c) => getClientBalance(c.id) > 0).length
}

// --- Semana (segunda a domingo) ---
export function getWeekRange(offsetWeeks = 0): { start: Date; end: Date } {
  const now = new Date()
  now.setDate(now.getDate() + offsetWeeks * 7)
  const day = now.getDay() // 0 = domingo
  const diffToMonday = day === 0 ? -6 : 1 - day
  const start = new Date(now)
  start.setDate(now.getDate() + diffToMonday)
  start.setHours(0, 0, 0, 0)
  const end = new Date(start)
  end.setDate(start.getDate() + 6)
  end.setHours(23, 59, 59, 999)
  return { start, end }
}

export function getWithdrawalsInRange(start: Date, end: Date): Withdrawal[] {
  return readAll<Withdrawal>('withdrawals').filter((w) => {
    const d = new Date(w.date)
    return d >= start && d <= end
  })
}

export function getPaymentsInRange(start: Date, end: Date): Payment[] {
  return readAll<Payment>('payments').filter((p) => {
    const d = new Date(p.date)
    return d >= start && d <= end
  })
}

export function getWeeklySummary(offsetWeeks = 0) {
  const { start, end } = getWeekRange(offsetWeeks)
  const withdrawals = getWithdrawalsInRange(start, end)
  const payments = getPaymentsInRange(start, end)
  const totalWithdrawn = round2(withdrawals.reduce((s, w) => s + w.subtotal, 0))
  const totalPaid = round2(payments.reduce((s, p) => s + p.amount, 0))
  return {
    start,
    end,
    totalWithdrawn,
    totalPaid,
    balanceGenerated: round2(totalWithdrawn - totalPaid),
    withdrawalsCount: withdrawals.length,
    paymentsCount: payments.length,
    withdrawals,
    payments,
  }
}

export function getWeeklyMaterialsReport(offsetWeeks = 0) {
  const { withdrawals } = getWeeklySummary(offsetWeeks)
  const materials = getMaterials()
  return materials.map((m) => {
    const items = withdrawals.flatMap((w) => w.items.filter((it) => it.materialId === m.id))
    const quantity = round2(items.reduce((s, it) => s + it.quantity, 0))
    const total = round2(items.reduce((s, it) => s + it.total, 0))
    return { material: m, quantity, total }
  })
}

export function getWeeklyClientsReport(offsetWeeks = 0) {
  const { withdrawals, payments } = getWeeklySummary(offsetWeeks)
  const clients = readAll<Client>('clients')
  const ids = new Set([...withdrawals.map((w) => w.clientId), ...payments.map((p) => p.clientId)])
  return Array.from(ids).map((id) => {
    const client = clients.find((c) => c.id === id)
    const withdrawn = round2(withdrawals.filter((w) => w.clientId === id).reduce((s, w) => s + w.subtotal, 0))
    const paid = round2(payments.filter((p) => p.clientId === id).reduce((s, p) => s + p.amount, 0))
    return { client, withdrawn, paid, balance: getClientBalance(id) }
  })
}

export function getLast7DaysSeries() {
  const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
  const result: { label: string; retiradas: number; pagamentos: number }[] = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const dayStart = new Date(d); dayStart.setHours(0, 0, 0, 0)
    const dayEnd = new Date(d); dayEnd.setHours(23, 59, 59, 999)
    const w = getWithdrawalsInRange(dayStart, dayEnd).reduce((s, x) => s + x.subtotal, 0)
    const p = getPaymentsInRange(dayStart, dayEnd).reduce((s, x) => s + x.amount, 0)
    result.push({ label: days[d.getDay()], retiradas: round2(w), pagamentos: round2(p) })
  }
  return result
}

function round2(n: number): number {
  return Math.round(n * 100) / 100
}
