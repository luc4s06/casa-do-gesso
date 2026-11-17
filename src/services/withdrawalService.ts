import { Withdrawal, WithdrawalItem } from '../types'
import { readAll, writeAll, uid, nextSequence } from './storage'
import { getClientBalance } from './reportService'

const KEY = 'withdrawals'

export function getWithdrawals(): Withdrawal[] {
  return readAll<Withdrawal>(KEY).sort((a, b) => (a.date < b.date ? 1 : -1))
}

export function getWithdrawalsByClient(clientId: string): Withdrawal[] {
  return getWithdrawals().filter((w) => w.clientId === clientId)
}

export function getWithdrawalById(id: string): Withdrawal | undefined {
  return readAll<Withdrawal>(KEY).find((w) => w.id === id)
}

export function createWithdrawal(clientId: string, items: Omit<WithdrawalItem, 'total'>[]): Withdrawal {
  if (!clientId) throw new Error('Selecione um cliente.')
  if (!items.length) throw new Error('Adicione ao menos um material.')
  for (const it of items) {
    if (it.quantity <= 0) throw new Error('Quantidade deve ser maior que zero.')
    if (it.unitPrice < 0) throw new Error('Preço não pode ser negativo.')
  }
  const fullItems: WithdrawalItem[] = items.map((it) => ({ ...it, total: round2(it.quantity * it.unitPrice) }))
  const subtotal = round2(fullItems.reduce((s, it) => s + it.total, 0))
  const balanceBefore = getClientBalance(clientId)
  const balanceAfter = round2(balanceBefore + subtotal)

  const withdrawal: Withdrawal = {
    id: uid(),
    number: nextSequence('withdrawal'),
    clientId,
    date: new Date().toISOString(),
    items: fullItems,
    subtotal,
    balanceBefore,
    balanceAfter,
  }

  const all = readAll<Withdrawal>(KEY)
  all.push(withdrawal)
  writeAll(KEY, all)
  return withdrawal
}

function round2(n: number): number {
  return Math.round(n * 100) / 100
}
