import { Material, MaterialPrice } from '../types'
import { readAll, readOne, writeOne } from './storage'

const MATERIALS: Material[] = [
  { id: 'placa', name: 'Placa de Gesso', unit: 'metro' },
  { id: 'sinzal', name: 'Sinzal', unit: 'kg' },
  { id: 'saco', name: 'Saco de Gesso', unit: 'kg' },
  { id: 'bloco', name: 'Bloco', unit: 'metro' },
]

const DEFAULT_PRICES: Record<string, number> = {
  placa: 35,
  sinzal: 8,
  saco: 6,
  bloco: 12,
}

export function getMaterials(): Material[] {
  return MATERIALS
}

export function getMaterialById(id: string): Material | undefined {
  return MATERIALS.find((m) => m.id === id)
}

function getPricesMap(): Record<string, MaterialPrice> {
  const stored = readOne<Record<string, MaterialPrice>>('material_prices')
  if (stored) return stored
  const initial: Record<string, MaterialPrice> = {}
  MATERIALS.forEach((m) => {
    initial[m.id] = { materialId: m.id, price: DEFAULT_PRICES[m.id] ?? 0, updatedAt: new Date().toISOString() }
  })
  writeOne('material_prices', initial)
  return initial
}

export function getCurrentPrice(materialId: string): number {
  const prices = getPricesMap()
  return prices[materialId]?.price ?? 0
}

export function getAllCurrentPrices(): MaterialPrice[] {
  const prices = getPricesMap()
  return MATERIALS.map((m) => prices[m.id] ?? { materialId: m.id, price: 0, updatedAt: '' })
}

export function updatePrice(materialId: string, price: number): void {
  const prices = getPricesMap()
  prices[materialId] = { materialId, price, updatedAt: new Date().toISOString() }
  writeOne('material_prices', prices)
}

export function updatePrices(updates: { materialId: string; price: number }[]): void {
  const prices = getPricesMap()
  updates.forEach((u) => {
    prices[u.materialId] = { materialId: u.materialId, price: u.price, updatedAt: new Date().toISOString() }
  })
  writeOne('material_prices', prices)
}

// mantido para simetria de API, caso o app precise listar registros crus
export function getAllPriceRecords(): MaterialPrice[] {
  return readAll<MaterialPrice>('material_prices_history')
}
