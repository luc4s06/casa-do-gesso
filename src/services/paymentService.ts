import { Payment, PaymentMethod } from '../types'
import { supabase } from '../lib/supabase'
import { fail, fetchAll, round2, toPayment } from './db'
import { getClientBalance } from './reportService'

export async function getPayments(): Promise<Payment[]> {
  const rows = await fetchAll<any>('payments')
  return rows.map(toPayment).sort((a, b) => (a.date < b.date ? 1 : -1))
}

export async function getPaymentsByClient(clientId: string): Promise<Payment[]> {
  const rows = await fetchAll<any>('payments', '*', (q) => q.eq('client_id', clientId))
  return rows.map(toPayment).sort((a, b) => (a.date < b.date ? 1 : -1))
}

export async function createPayment(input: {
  clientId: string
  amount: number
  method: PaymentMethod
  note?: string
  allowOverpay?: boolean
}): Promise<Payment> {
  if (!input.clientId) throw new Error('Selecione um cliente.')
  if (!(input.amount > 0)) throw new Error('O valor do pagamento deve ser maior que zero.')

  const balanceBefore = await getClientBalance(input.clientId)
  if (input.amount > balanceBefore && !input.allowOverpay) {
    throw new Error('OVERPAY')
  }
  const amount = round2(input.amount)
  const balanceAfter = round2(balanceBefore - amount)

  const { data, error } = await supabase
    .from('payments')
    .insert({
      client_id: input.clientId,
      date: new Date().toISOString(),
      amount,
      method: input.method,
      note: input.note?.trim() || null,
      balance_before: balanceBefore,
      balance_after: balanceAfter,
    })
    .select('*')
    .single()
  fail(error)
  return toPayment(data)
}
