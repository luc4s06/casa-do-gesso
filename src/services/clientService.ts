import { Client } from '../types'
import { supabase } from '../lib/supabase'
import { fail, fetchAll, toClient } from './db'
import { getBalancesMap } from './reportService'

export async function getClients(): Promise<Client[]> {
  const rows = await fetchAll<any>('clients')
  return rows.map(toClient).sort((a, b) => a.name.localeCompare(b.name))
}

export async function getClientById(id: string): Promise<Client | undefined> {
  const { data, error } = await supabase.from('clients').select('*').eq('id', id).maybeSingle()
  fail(error)
  return data ? toClient(data) : undefined
}

export async function createClient(input: { name: string; phone: string; address?: string }): Promise<Client> {
  if (!input.name.trim()) throw new Error('Nome é obrigatório.')
  if (!input.phone.trim()) throw new Error('Telefone é obrigatório.')
  const { data, error } = await supabase
    .from('clients')
    .insert({
      name: input.name.trim(),
      phone: input.phone.trim(),
      address: input.address?.trim() || null,
    })
    .select('*')
    .single()
  fail(error)
  return toClient(data)
}

export async function updateClient(id: string, input: { name: string; phone: string; address?: string }): Promise<void> {
  const { data, error } = await supabase
    .from('clients')
    .update({ name: input.name.trim(), phone: input.phone.trim(), address: input.address?.trim() || null })
    .eq('id', id)
    .select('id')
  fail(error)
  if (!data || data.length === 0) throw new Error('Cliente não encontrado.')
}

export async function getClientsWithBalance() {
  const [clients, balances] = await Promise.all([getClients(), getBalancesMap()])
  return clients.map((c) => ({ ...c, balance: balances.get(c.id) ?? 0 }))
}
