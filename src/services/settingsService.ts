import { CompanySettings } from '../types'
import { supabase } from '../lib/supabase'
import { fail } from './db'

const DEFAULTS: CompanySettings = {
  name: 'Casa do Gesso',
  phone: '',
  address: '',
  logo: undefined,
}

// A sidebar, o cabeçalho e as telas usam as configurações ao mesmo tempo:
// guardamos a consulta em andamento para não repetir a mesma leitura.
let cache: Promise<CompanySettings> | null = null

export function clearSettingsCache(): void {
  cache = null
}

async function fetchSettings(): Promise<CompanySettings> {
  const { data, error } = await supabase.from('settings').select('*').eq('id', 1).maybeSingle()
  fail(error)
  if (!data) return DEFAULTS
  return {
    name: data.name ?? DEFAULTS.name,
    phone: data.phone ?? '',
    address: data.address ?? '',
    logo: data.logo ?? undefined,
  }
}

export function getSettings(): Promise<CompanySettings> {
  if (!cache) {
    cache = fetchSettings().catch((err) => {
      cache = null
      throw err
    })
  }
  return cache
}

export async function saveSettings(settings: CompanySettings): Promise<void> {
  const { error } = await supabase.from('settings').upsert(
    {
      id: 1,
      name: settings.name,
      phone: settings.phone,
      address: settings.address,
      logo: settings.logo ?? null,
    },
    { onConflict: 'id' }
  )
  fail(error)
  clearSettingsCache()
}
