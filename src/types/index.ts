export type MaterialUnit = 'metro' | 'kg'

export interface Material {
  id: string
  name: string
  unit: MaterialUnit
}

export interface MaterialPrice {
  materialId: string
  price: number
  updatedAt: string // ISO date
}

export interface Client {
  id: string
  name: string
  phone: string
  address?: string
  createdAt: string
}

export interface WithdrawalItem {
  materialId: string
  materialName: string
  unit: MaterialUnit
  quantity: number
  unitPrice: number // preço travado no momento da retirada
  total: number
}

export interface Withdrawal {
  id: string
  number: number
  clientId: string
  date: string // ISO
  items: WithdrawalItem[]
  subtotal: number
  balanceBefore: number
  balanceAfter: number
}

export type PaymentMethod = 'pix' | 'dinheiro' | 'cartao' | 'outro'

export interface Payment {
  id: string
  number: number
  clientId: string
  date: string // ISO
  amount: number
  method: PaymentMethod
  note?: string
  balanceBefore: number
  balanceAfter: number
}

export interface Transaction {
  id: string
  clientId: string
  type: 'withdrawal' | 'payment'
  date: string
  amount: number // retirada = positivo, pagamento = negativo (efeito no saldo)
  refId: string
  label: string
}

export interface CompanySettings {
  name: string
  phone: string
  address: string
  logo?: string // base64
}
