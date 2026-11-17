import { Client } from '../types'
import { readAll, writeAll, uid } from './storage'
import { getClientBalance } from './reportService'

const KEY = 'clients'

export function getClients(): Client[] {
  return readAll<Client>(KEY).sort((a, b) => a.name.localeCompare(b.name))
}

export function getClientById(id: string): Client | undefined {
  return readAll<Client>(KEY).find((c) => c.id === id)
}

export function createClient(input: { name: string; phone: string; address?: string }): Client {
  if (!input.name.trim()) throw new Error('Nome é obrigatório.')
  if (!input.phone.trim()) throw new Error('Telefone é obrigatório.')
  const client: Client = {
    id: uid(),
    name: input.name.trim(),
    phone: input.phone.trim(),
    address: input.address?.trim() || undefined,
    createdAt: new Date().toISOString(),
  }
  const all = readAll<Client>(KEY)
  all.push(client)
  writeAll(KEY, all)
  return client
}

export function updateClient(id: string, input: { name: string; phone: string; address?: string }): void {
  const all = readAll<Client>(KEY)
  const idx = all.findIndex((c) => c.id === id)
  if (idx === -1) throw new Error('Cliente não encontrado.')
  all[idx] = { ...all[idx], name: input.name.trim(), phone: input.phone.trim(), address: input.address?.trim() || undefined }
  writeAll(KEY, all)
}

export function getClientsWithBalance() {
  return getClients().map((c) => ({ ...c, balance: getClientBalance(c.id) }))
}
