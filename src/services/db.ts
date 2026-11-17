// Camada de acesso ao Supabase: leitura paginada e conversão linha do banco <-> tipos do app.
import { supabase } from '../lib/supabase'
import { Client, Payment, PaymentMethod, Withdrawal, WithdrawalItem } from '../types'

export function fail(error: { message: string } | null | undefined): void {
  if (error) throw new Error(error.message)
}

// O PostgREST devolve no máximo 1000 linhas por consulta. Para o saldo nunca ficar errado,
// toda leitura de lista passa por aqui e busca em páginas até acabar.
export async function fetchAll<T>(
  table: string,
  columns = '*',
  filter?: (query: any) => any
): Promise<T[]> {
  const pageSize = 1000
  const out: T[] = []
  for (let from = 0; ; from += pageSize) {
    let query: any = supabase.from(table).select(columns)
    if (filter) query = filter(query)
    const { data, error } = await query.order('id').range(from, from + pageSize - 1)
    fail(error)
    const rows = (data ?? []) as T[]
    out.push(...rows)
    if (rows.length < pageSize) break
  }
  return out
}

export function round2(n: number): number {
  return Math.round(n * 100) / 100
}

// --- conversões ---

export function toClient(r: any): Client {
  return {
    id: r.id,
    name: r.name,
    phone: r.phone,
    address: r.address ?? undefined,
    createdAt: r.created_at,
  }
}

export function toWithdrawal(r: any): Withdrawal {
  return {
    id: r.id,
    number: Number(r.number),
    clientId: r.client_id,
    date: r.date,
    items: (r.items ?? []) as WithdrawalItem[],
    subtotal: Number(r.subtotal),
    balanceBefore: Number(r.balance_before),
    balanceAfter: Number(r.balance_after),
  }
}

export function toPayment(r: any): Payment {
  return {
    id: r.id,
    number: Number(r.number),
    clientId: r.client_id,
    date: r.date,
    amount: Number(r.amount),
    method: r.method as PaymentMethod,
    note: r.note ?? undefined,
    balanceBefore: Number(r.balance_before),
    balanceAfter: Number(r.balance_after),
  }
}
