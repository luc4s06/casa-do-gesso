import { Withdrawal, Payment, Client, CompanySettings } from '../types'
import { formatCurrency, formatDateTime } from '../utils/format'
import Logo from './Logo'

const METHOD_LABEL: Record<string, string> = { pix: 'PIX', dinheiro: 'Dinheiro', cartao: 'Cartão', outro: 'Outro' }

export function WithdrawalReceipt({ withdrawal, client, settings }: { withdrawal: Withdrawal; client: Client; settings: CompanySettings }) {
  return (
    <div className="rounded-xl2 border border-gray-200 bg-white p-6 text-sm">
      <div className="mb-4 flex items-center justify-between">
        <Logo />
        <span className="text-xs font-semibold text-graphite-600">#{String(withdrawal.number).padStart(6, '0')}</span>
      </div>
      <h3 className="mb-1 text-base font-bold text-graphite-900">Comprovante de retirada de material</h3>
      <p className="mb-4 text-xs text-graphite-600">{formatDateTime(withdrawal.date)}</p>

      <div className="mb-4 rounded-lg bg-gray-50 p-3">
        <p className="font-semibold text-graphite-900">{client.name}</p>
        <p className="text-xs text-graphite-600">{client.phone}</p>
        {client.address && <p className="text-xs text-graphite-600">{client.address}</p>}
      </div>

      <table className="mb-4 w-full text-xs">
        <thead>
          <tr className="border-b border-gray-200 text-left text-graphite-600">
            <th className="py-1.5">Material</th>
            <th className="py-1.5">Qtd</th>
            <th className="py-1.5">Preço</th>
            <th className="py-1.5 text-right">Total</th>
          </tr>
        </thead>
        <tbody>
          {withdrawal.items.map((it) => (
            <tr key={it.materialId} className="border-b border-gray-100">
              <td className="py-1.5">{it.materialName}</td>
              <td className="py-1.5">{it.quantity} {it.unit}</td>
              <td className="py-1.5">{formatCurrency(it.unitPrice)}</td>
              <td className="py-1.5 text-right">{formatCurrency(it.total)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="space-y-1 border-t border-gray-200 pt-3 text-xs text-graphite-700">
        <div className="flex justify-between"><span>Saldo anterior</span><span>{formatCurrency(withdrawal.balanceBefore)}</span></div>
        <div className="flex justify-between"><span>Retirada</span><span>+ {formatCurrency(withdrawal.subtotal)}</span></div>
        <div className="flex justify-between text-sm font-bold text-graphite-900"><span>Novo saldo</span><span>{formatCurrency(withdrawal.balanceAfter)}</span></div>
      </div>
      <p className="mt-4 text-[11px] text-graphite-600">{settings.name} — comprovante de retirada de material.</p>
    </div>
  )
}

export function PaymentReceipt({ payment, client, settings }: { payment: Payment; client: Client; settings: CompanySettings }) {
  return (
    <div className="rounded-xl2 border border-gray-200 bg-white p-6 text-sm">
      <div className="mb-4 flex items-center justify-between">
        <Logo />
        <span className="text-xs font-semibold text-graphite-600">#{String(payment.number).padStart(6, '0')}</span>
      </div>
      <h3 className="mb-1 text-base font-bold text-graphite-900">Comprovante de pagamento</h3>
      <p className="mb-4 text-xs text-graphite-600">{formatDateTime(payment.date)}</p>

      <div className="mb-4 rounded-lg bg-gray-50 p-3">
        <p className="font-semibold text-graphite-900">{client.name}</p>
        <p className="text-xs text-graphite-600">{client.phone}</p>
      </div>

      <div className="space-y-1 text-xs text-graphite-700">
        <div className="flex justify-between"><span>Valor pago</span><span className="font-semibold text-green-600">{formatCurrency(payment.amount)}</span></div>
        <div className="flex justify-between"><span>Forma de pagamento</span><span>{METHOD_LABEL[payment.method]}</span></div>
        {payment.note && <div className="flex justify-between"><span>Observação</span><span>{payment.note}</span></div>}
      </div>

      <div className="mt-3 space-y-1 border-t border-gray-200 pt-3 text-xs text-graphite-700">
        <div className="flex justify-between"><span>Saldo anterior</span><span>{formatCurrency(payment.balanceBefore)}</span></div>
        <div className="flex justify-between text-sm font-bold text-graphite-900"><span>Saldo após pagamento</span><span>{formatCurrency(payment.balanceAfter)}</span></div>
      </div>
      <p className="mt-4 text-[11px] text-graphite-600">{settings.name} — comprovante de pagamento.</p>
    </div>
  )
}
