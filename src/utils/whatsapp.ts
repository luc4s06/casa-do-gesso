import { Client, CompanySettings, Withdrawal } from '../types'
import { formatCurrency, formatDateTime } from './format'

// Telefone brasileiro -> formato internacional sem símbolos (ex.: 5585999998888).
// Devolve null se não der para saber o número; aí o WhatsApp abre para escolher o contato.
export function toWhatsAppNumber(phone: string): string | null {
  let digits = phone.replace(/\D/g, '').replace(/^0+/, '')
  if (digits.length === 10 || digits.length === 11) digits = '55' + digits
  if ((digits.length === 12 || digits.length === 13) && digits.startsWith('55')) return digits
  return null
}

export function buildWithdrawalMessage(withdrawal: Withdrawal, client: Client, settings: CompanySettings): string {
  const lines: string[] = []
  lines.push(`*${settings.name || 'Casa do Gesso'}*`)
  lines.push(`Comprovante de retirada #${String(withdrawal.number).padStart(6, '0')}`)
  lines.push(formatDateTime(withdrawal.date))
  lines.push('')
  lines.push(`Cliente: ${client.name}`)
  lines.push('')
  lines.push('*Materiais retirados*')
  withdrawal.items.forEach((it) => {
    lines.push(`• ${it.materialName}`)
    lines.push(`   ${it.quantity.toLocaleString('pt-BR')} ${it.unit} × ${formatCurrency(it.unitPrice)} = *${formatCurrency(it.total)}*`)
  })
  lines.push('')
  lines.push(`*Total da retirada: ${formatCurrency(withdrawal.subtotal)}*`)
  lines.push(`Saldo anterior: ${formatCurrency(withdrawal.balanceBefore)}`)
  lines.push(`Novo saldo: ${formatCurrency(withdrawal.balanceAfter)}`)
  if (settings.phone) {
    lines.push('')
    lines.push(`Dúvidas: ${settings.phone}`)
  }
  return lines.join('\n')
}

export function openWithdrawalOnWhatsApp(withdrawal: Withdrawal, client: Client, settings: CompanySettings): void {
  const number = toWhatsAppNumber(client.phone)
  const text = encodeURIComponent(buildWithdrawalMessage(withdrawal, client, settings))
  const url = number ? `https://wa.me/${number}?text=${text}` : `https://wa.me/?text=${text}`
  window.open(url, '_blank', 'noopener,noreferrer')
}
