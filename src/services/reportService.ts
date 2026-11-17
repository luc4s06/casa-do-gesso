import { Withdrawal, Payment, Transaction, Client } from '../types'
import { fetchAll, round2, toClient, toPayment, toWithdrawal } from './db'
import { getMaterials } from './materialService'

// Nunca ler saldo de um campo solto: ele é sempre derivado das movimentações.

// Saldo de todos os clientes de uma vez: retiradas - pagamentos.
export async function getBalancesMap(): Promise<Map<string, number>> {
  const [withdrawals, payments] = await Promise.all([
    fetchAll<{ id: string; client_id: string; subtotal: number }>('withdrawals', 'id, client_id, subtotal'),
    fetchAll<{ id: string; client_id: string; amount: number }>('payments', 'id, client_id, amount'),
  ])
  const map = new Map<string, number>()
  withdrawals.forEach((w) => map.set(w.client_id, (map.get(w.client_id) ?? 0) + Number(w.subtotal)))
  payments.forEach((p) => map.set(p.client_id, (map.get(p.client_id) ?? 0) - Number(p.amount)))
  map.forEach((value, key) => map.set(key, round2(value)))
  return map
}

export async function getClientTotals(clientId: string) {
  const [withdrawals, payments] = await Promise.all([
    fetchAll<{ id: string; subtotal: number }>('withdrawals', 'id, subtotal', (q) => q.eq('client_id', clientId)),
    fetchAll<{ id: string; amount: number }>('payments', 'id, amount', (q) => q.eq('client_id', clientId)),
  ])
  const totalWithdrawn = round2(withdrawals.reduce((s, w) => s + Number(w.subtotal), 0))
  const totalPaid = round2(payments.reduce((s, p) => s + Number(p.amount), 0))
  return { totalWithdrawn, totalPaid, balance: round2(totalWithdrawn - totalPaid) }
}

export async function getClientBalance(clientId: string): Promise<number> {
  return (await getClientTotals(clientId)).balance
}

function buildTransactions(withdrawals: Withdrawal[], payments: Payment[]): Transaction[] {
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

export async function getClientTransactions(clientId: string): Promise<Transaction[]> {
  const [w, p] = await Promise.all([
    fetchAll<any>('withdrawals', '*', (q) => q.eq('client_id', clientId)),
    fetchAll<any>('payments', '*', (q) => q.eq('client_id', clientId)),
  ])
  return buildTransactions(w.map(toWithdrawal), p.map(toPayment))
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

function inRange<T extends { date: string }>(rows: T[], start: Date, end: Date): T[] {
  return rows.filter((r) => {
    const d = new Date(r.date)
    return d >= start && d <= end
  })
}

function summarize(allW: Withdrawal[], allP: Payment[], offsetWeeks: number) {
  const { start, end } = getWeekRange(offsetWeeks)
  const withdrawals = inRange(allW, start, end)
  const payments = inRange(allP, start, end)
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

async function loadEverything() {
  const [w, p, c] = await Promise.all([
    fetchAll<any>('withdrawals'),
    fetchAll<any>('payments'),
    fetchAll<any>('clients'),
  ])
  return { withdrawals: w.map(toWithdrawal), payments: p.map(toPayment), clients: c.map(toClient) }
}

function balancesFrom(withdrawals: Withdrawal[], payments: Payment[]): Map<string, number> {
  const map = new Map<string, number>()
  withdrawals.forEach((w) => map.set(w.clientId, (map.get(w.clientId) ?? 0) + w.subtotal))
  payments.forEach((p) => map.set(p.clientId, (map.get(p.clientId) ?? 0) - p.amount))
  map.forEach((value, key) => map.set(key, round2(value)))
  return map
}

// Tudo o que o Dashboard mostra, numa única leitura.
export async function getDashboardData() {
  const { withdrawals, payments, clients } = await loadEverything()
  const balances = balancesFrom(withdrawals, payments)

  const totalReceivable = round2(clients.reduce((s, c) => s + (balances.get(c.id) ?? 0), 0))
  const clientsWithDebt = clients.filter((c) => (balances.get(c.id) ?? 0) > 0).length
  const weekly = summarize(withdrawals, payments, 0)
  const recentTx = buildTransactions(withdrawals, payments).slice(0, 6)

  const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
  const series: { label: string; retiradas: number; pagamentos: number }[] = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const dayStart = new Date(d); dayStart.setHours(0, 0, 0, 0)
    const dayEnd = new Date(d); dayEnd.setHours(23, 59, 59, 999)
    const w = inRange(withdrawals, dayStart, dayEnd).reduce((s, x) => s + x.subtotal, 0)
    const p = inRange(payments, dayStart, dayEnd).reduce((s, x) => s + x.amount, 0)
    series.push({ label: days[d.getDay()], retiradas: round2(w), pagamentos: round2(p) })
  }

  const clientNames: Record<string, string> = {}
  clients.forEach((c) => { clientNames[c.id] = c.name })

  return { totalReceivable, clientsWithDebt, weekly, recentTx, series, clientNames }
}

// Tudo o que a página de relatórios semanais mostra, numa única leitura.
export async function getWeeklyReport(offsetWeeks = 0) {
  const { withdrawals: allW, payments: allP, clients } = await loadEverything()
  const balances = balancesFrom(allW, allP)
  const summary = summarize(allW, allP, offsetWeeks)

  const materials = getMaterials().map((m) => {
    const items = summary.withdrawals.flatMap((w) => w.items.filter((it) => it.materialId === m.id))
    return {
      material: m,
      quantity: round2(items.reduce((s, it) => s + it.quantity, 0)),
      total: round2(items.reduce((s, it) => s + it.total, 0)),
    }
  })

  const ids = new Set([...summary.withdrawals.map((w) => w.clientId), ...summary.payments.map((p) => p.clientId)])
  const clientsReport = Array.from(ids).map((id) => {
    const client: Client | undefined = clients.find((c) => c.id === id)
    return {
      client,
      withdrawn: round2(summary.withdrawals.filter((w) => w.clientId === id).reduce((s, w) => s + w.subtotal, 0)),
      paid: round2(summary.payments.filter((p) => p.clientId === id).reduce((s, p) => s + p.amount, 0)),
      balance: balances.get(id) ?? 0,
    }
  })

  return { summary, materials, clientsReport }
}
