// Importa para o Supabase os dados que a versão antiga guardava só no navegador (localStorage).
import { supabase } from '../lib/supabase'
import { Client, CompanySettings, MaterialPrice, Payment, Withdrawal } from '../types'
import { fail } from './db'
import { clearSettingsCache } from './settingsService'

const PREFIX = 'cdg_'

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(PREFIX + key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

function legacy() {
  return {
    clients: read<Client[]>('clients', []),
    withdrawals: read<Withdrawal[]>('withdrawals', []),
    payments: read<Payment[]>('payments', []),
    prices: read<Record<string, MaterialPrice>>('material_prices', {}),
    settings: read<CompanySettings | null>('settings', null),
  }
}

export function getLegacyCounts() {
  const d = legacy()
  return {
    clients: d.clients.length,
    withdrawals: d.withdrawals.length,
    payments: d.payments.length,
    total: d.clients.length + d.withdrawals.length + d.payments.length,
  }
}

async function upsertInChunks(table: string, rows: object[], onConflict: string) {
  const size = 500
  for (let i = 0; i < rows.length; i += size) {
    const { error } = await supabase.from(table).upsert(rows.slice(i, i + size), { onConflict })
    fail(error)
  }
}

// Seguro para rodar mais de uma vez: os registros são identificados pelo id e não duplicam.
export async function importLegacyData() {
  const d = legacy()

  await upsertInChunks(
    'clients',
    d.clients.map((c) => ({
      id: c.id,
      name: c.name,
      phone: c.phone,
      address: c.address ?? null,
      created_at: c.createdAt,
    })),
    'id'
  )

  await upsertInChunks(
    'withdrawals',
    d.withdrawals.map((w) => ({
      id: w.id,
      number: w.number,
      client_id: w.clientId,
      date: w.date,
      items: w.items,
      subtotal: w.subtotal,
      balance_before: w.balanceBefore,
      balance_after: w.balanceAfter,
    })),
    'id'
  )

  await upsertInChunks(
    'payments',
    d.payments.map((p) => ({
      id: p.id,
      number: p.number,
      client_id: p.clientId,
      date: p.date,
      amount: p.amount,
      method: p.method,
      note: p.note ?? null,
      balance_before: p.balanceBefore,
      balance_after: p.balanceAfter,
    })),
    'id'
  )

  const priceRows = Object.values(d.prices).map((p) => ({
    material_id: p.materialId,
    price: p.price,
    updated_at: p.updatedAt || new Date().toISOString(),
  }))
  if (priceRows.length > 0) await upsertInChunks('material_prices', priceRows, 'material_id')

  if (d.settings) {
    const { error } = await supabase.from('settings').upsert(
      {
        id: 1,
        name: d.settings.name,
        phone: d.settings.phone ?? '',
        address: d.settings.address ?? '',
        logo: d.settings.logo ?? null,
      },
      { onConflict: 'id' }
    )
    fail(error)
    clearSettingsCache()
  }

  // Depois de inserir com números próprios, avança a contagem para os próximos não repetirem.
  const { error: seqError } = await supabase.rpc('sync_number_sequences')
  fail(seqError)

  return { clients: d.clients.length, withdrawals: d.withdrawals.length, payments: d.payments.length }
}
