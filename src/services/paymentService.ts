import { Payment, PaymentMethod } from '../types'
import { readAll, writeAll, uid, nextSequence } from './storage'
import { getClientBalance } from './reportService'

const KEY = 'payments'

export function getPayments(): Payment[] {
  return readAll<Payment>(KEY).sort((a, b) => (a.date < b.date ? 1 : -1))
}

export function getPaymentsByClient(clientId: string): Payment[] {
  return getPayments().filter((p) => p.clientId === clientId)
}

export function createPayment(input: {
  clientId: string
  amount: number
  method: PaymentMethod
  note?: string
  allowOverpay?: boolean
}): Payment {
  if (!input.clientId) throw new Error('Selecione um cliente.')
  if (input.amount <= 0) throw new Error('O valor do pagamento deve ser maior que zero.')

  const balanceBefore = getClientBalance(input.clientId)
  if (input.amount > balanceBefore && !input.allowOverpay) {
    throw new Error('OVERPAY')
  }
  const balanceAfter = round2(balanceBefore - input.amount)

  const payment: Payment = {
    id: uid(),
    number: nextSequence('payment'),
    clientId: input.clientId,
    date: new Date().toISOString(),
    amount: round2(input.amount),
    method: input.method,
    note: input.note?.trim() || undefined,
    balanceBefore,
    balanceAfter,
  }

  const all = readAll<Payment>(KEY)
  all.push(payment)
  writeAll(KEY, all)
  return payment
}

function round2(n: number): number {
  return Math.round(n * 100) / 100
}
