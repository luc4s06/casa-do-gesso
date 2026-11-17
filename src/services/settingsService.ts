import { CompanySettings } from '../types'
import { readOne, writeOne } from './storage'

const KEY = 'settings'

const DEFAULTS: CompanySettings = {
  name: 'Casa do Gesso',
  phone: '',
  address: '',
  logo: undefined,
}

export function getSettings(): CompanySettings {
  return readOne<CompanySettings>(KEY) ?? DEFAULTS
}

export function saveSettings(settings: CompanySettings): void {
  writeOne(KEY, settings)
}
