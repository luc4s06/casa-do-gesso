import jsPDF from 'jspdf'
import { Withdrawal, Payment, Client, CompanySettings } from '../types'
import { formatCurrency, formatDate, formatDateTime, formatRangeLabel } from './format'

const METHOD_LABEL: Record<string, string> = { pix: 'PIX', dinheiro: 'Dinheiro', cartao: 'Cartão', outro: 'Outro' }

function drawHeader(doc: jsPDF, settings: CompanySettings, title: string) {
  doc.setFillColor(28, 31, 35)
  doc.rect(0, 0, 210, 28, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(16)
  doc.text(settings.name || 'Casa do Gesso', 14, 17)
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  const sub = [settings.phone, settings.address].filter(Boolean).join(' · ')
  if (sub) doc.text(sub, 14, 23)

  doc.setTextColor(30, 30, 30)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(13)
  doc.text(title, 14, 40)
  doc.setDrawColor(220, 220, 220)
  doc.line(14, 44, 196, 44)
}

function drawFooter(doc: jsPDF) {
  doc.setDrawColor(220, 220, 220)
  doc.line(14, 265, 196, 265)
  doc.setFontSize(9)
  doc.setTextColor(120, 120, 120)
  doc.text('Casa do Gesso — documento gerado pelo sistema de gestão interna.', 14, 271)

  doc.setDrawColor(150, 150, 150)
  doc.line(120, 285, 196, 285)
  doc.setFontSize(8)
  doc.text('Assinatura do cliente', 120, 290)
}

export function generateWithdrawalPdf(withdrawal: Withdrawal, client: Client, settings: CompanySettings) {
  const doc = new jsPDF()
  drawHeader(doc, settings, 'COMPROVANTE DE RETIRADA DE MATERIAL')

  let y = 54
  doc.setFontSize(10)
  doc.setTextColor(60, 60, 60)
  doc.text(`Número: #${String(withdrawal.number).padStart(6, '0')}`, 14, y)
  doc.text(`Data: ${formatDateTime(withdrawal.date)}`, 130, y)
  y += 10

  doc.setFont('helvetica', 'bold')
  doc.setTextColor(30, 30, 30)
  doc.text('CLIENTE', 14, y)
  y += 6
  doc.setFont('helvetica', 'normal')
  doc.text(`Nome: ${client.name}`, 14, y); y += 6
  doc.text(`Telefone: ${client.phone}`, 14, y); y += 6
  if (client.address) { doc.text(`Endereço: ${client.address}`, 14, y); y += 6 }
  y += 4

  doc.setDrawColor(220, 220, 220)
  doc.line(14, y, 196, y); y += 8

  doc.setFont('helvetica', 'bold')
  doc.text('MATERIAIS', 14, y); y += 6

  const cols = [14, 90, 115, 140, 168]
  doc.setFontSize(9)
  doc.text('Material', cols[0], y)
  doc.text('Qtd', cols[1], y)
  doc.text('Unid.', cols[2], y)
  doc.text('Preço', cols[3], y)
  doc.text('Total', cols[4], y)
  y += 3
  doc.line(14, y, 196, y); y += 6

  doc.setFont('helvetica', 'normal')
  withdrawal.items.forEach((item) => {
    doc.text(item.materialName, cols[0], y)
    doc.text(String(item.quantity), cols[1], y)
    doc.text(item.unit, cols[2], y)
    doc.text(formatCurrency(item.unitPrice), cols[3], y)
    doc.text(formatCurrency(item.total), cols[4], y)
    y += 7
  })

  y += 3
  doc.line(14, y, 196, y); y += 10

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.text('TOTAL DA RETIRADA:', 14, y)
  doc.text(formatCurrency(withdrawal.subtotal), 168, y)
  y += 12

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.text(`Saldo anterior: ${formatCurrency(withdrawal.balanceBefore)}`, 14, y); y += 6
  doc.text(`Retirada: + ${formatCurrency(withdrawal.subtotal)}`, 14, y); y += 8

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(12)
  doc.text('SALDO ATUAL:', 14, y)
  doc.text(formatCurrency(withdrawal.balanceAfter), 168, y)

  drawFooter(doc)
  doc.save(`retirada-${String(withdrawal.number).padStart(6, '0')}.pdf`)
}

export function generatePaymentPdf(payment: Payment, client: Client, settings: CompanySettings) {
  const doc = new jsPDF()
  drawHeader(doc, settings, 'COMPROVANTE DE PAGAMENTO')

  let y = 54
  doc.setFontSize(10)
  doc.setTextColor(60, 60, 60)
  doc.text(`Número: #${String(payment.number).padStart(6, '0')}`, 14, y)
  doc.text(`Data: ${formatDateTime(payment.date)}`, 130, y)
  y += 10

  doc.setFont('helvetica', 'bold')
  doc.setTextColor(30, 30, 30)
  doc.text('CLIENTE', 14, y); y += 6
  doc.setFont('helvetica', 'normal')
  doc.text(`Nome: ${client.name}`, 14, y); y += 6
  doc.text(`Telefone: ${client.phone}`, 14, y); y += 10

  doc.line(14, y, 196, y); y += 10

  doc.text(`Valor pago: ${formatCurrency(payment.amount)}`, 14, y); y += 7
  doc.text(`Forma de pagamento: ${METHOD_LABEL[payment.method]}`, 14, y); y += 7
  if (payment.note) { doc.text(`Observação: ${payment.note}`, 14, y); y += 7 }
  y += 3

  doc.text(`Saldo anterior: ${formatCurrency(payment.balanceBefore)}`, 14, y); y += 7
  doc.setFont('helvetica', 'bold')
  doc.text('Saldo após pagamento:', 14, y)
  doc.text(formatCurrency(payment.balanceAfter), 168, y)

  drawFooter(doc)
  doc.save(`pagamento-${String(payment.number).padStart(6, '0')}.pdf`)
}

interface WeeklyPdfInput {
  settings: CompanySettings
  rangeStart: Date
  rangeEnd: Date
  totalWithdrawn: number
  totalPaid: number
  balanceGenerated: number
  withdrawalsCount: number
  paymentsCount: number
  materials: { name: string; quantity: number; unit: string; total: number }[]
  clients: { name: string; withdrawn: number; paid: number; balance: number }[]
}

export function generateWeeklyReportPdf(input: WeeklyPdfInput) {
  const doc = new jsPDF()
  drawHeader(doc, input.settings, 'RELATÓRIO SEMANAL')

  let y = 54
  doc.setFontSize(10)
  doc.text(`Período: ${formatRangeLabel(input.rangeStart, input.rangeEnd)}`, 14, y); y += 10

  doc.setFont('helvetica', 'bold')
  doc.text('RESUMO FINANCEIRO', 14, y); y += 7
  doc.setFont('helvetica', 'normal')
  doc.text(`Total retirado: ${formatCurrency(input.totalWithdrawn)}`, 14, y); y += 6
  doc.text(`Total recebido: ${formatCurrency(input.totalPaid)}`, 14, y); y += 6
  doc.text(`Saldo gerado: ${formatCurrency(input.balanceGenerated)}`, 14, y); y += 6
  doc.text(`Retiradas: ${input.withdrawalsCount}   Pagamentos: ${input.paymentsCount}`, 14, y); y += 10

  doc.setFont('helvetica', 'bold')
  doc.text('MATERIAIS', 14, y); y += 7
  doc.setFont('helvetica', 'normal')
  input.materials.forEach((m) => {
    doc.text(`${m.name}: ${m.quantity} ${m.unit} — ${formatCurrency(m.total)}`, 14, y)
    y += 6
  })
  y += 4

  doc.setFont('helvetica', 'bold')
  doc.text('CLIENTES', 14, y); y += 7
  doc.setFont('helvetica', 'normal')
  input.clients.forEach((c) => {
    if (y > 255) { doc.addPage(); y = 20 }
    doc.text(`${c.name} — retirado ${formatCurrency(c.withdrawn)}, pago ${formatCurrency(c.paid)}, saldo ${formatCurrency(c.balance)}`, 14, y)
    y += 6
  })

  drawFooter(doc)
  doc.save(`relatorio-semanal-${formatDate(input.rangeStart.toISOString()).replaceAll('/', '-')}.pdf`)
}
