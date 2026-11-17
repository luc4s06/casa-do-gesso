import { Withdrawal, WithdrawalItem } from '../types'
import { supabase } from '../lib/supabase'
import { fail, fetchAll, round2, toWithdrawal } from './db'
import { getClientBalance } from './reportService'

export async function getWithdrawals(): Promise<Withdrawal[]> {
  const rows = await fetchAll<any>('withdrawals')
  return rows.map(toWithdrawal).sort((a, b) => (a.date < b.date ? 1 : -1))
}

export async function getWithdrawalById(id: string): Promise<Withdrawal | undefined> {
  const { data, error } = await supabase.from('withdrawals').select('*').eq('id', id).maybeSingle()
  fail(error)
  return data ? toWithdrawal(data) : undefined
}

export async function createWithdrawal(clientId: string, items: Omit<WithdrawalItem, 'total'>[]): Promise<Withdrawal> {
  if (!clientId) throw new Error('Selecione um cliente.')
  if (!items.length) throw new Error('Adicione ao menos um material.')
  for (const it of items) {
    if (!(it.quantity > 0)) throw new Error('Quantidade deve ser maior que zero.')
    if (it.unitPrice < 0) throw new Error('Preço não pode ser negativo.')
  }
  const fullItems: WithdrawalItem[] = items.map((it) => ({ ...it, total: round2(it.quantity * it.unitPrice) }))
  const subtotal = round2(fullItems.reduce((s, it) => s + it.total, 0))
  const balanceBefore = await getClientBalance(clientId)
  const balanceAfter = round2(balanceBefore + subtotal)

  const { data, error } = await supabase
    .from('withdrawals')
    .insert({
      client_id: clientId,
      date: new Date().toISOString(),
      items: fullItems,
      subtotal,
      balance_before: balanceBefore,
      balance_after: balanceAfter,
    })
    .select('*')
    .single()
  fail(error)
  return toWithdrawal(data)
}
