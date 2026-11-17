import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, Download, Printer, X } from 'lucide-react'
import { Payment, Client, CompanySettings } from '../types'
import { PaymentReceipt } from './Receipt'
import { generatePaymentPdf } from '../utils/pdf'

export default function PaymentModal({
  payment,
  client,
  settings,
  onClose,
}: {
  payment: Payment | null
  client: Client | null
  settings: CompanySettings
  onClose: () => void
}) {
  return (
    <AnimatePresence>
      {payment && client && (
        <motion.div
          className="fixed inset-0 z-[90] flex items-center justify-center overflow-y-auto bg-black/40 px-4 py-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 10 }}
            className="w-full max-w-md"
          >
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle2 size={20} />
                <span className="text-sm font-semibold text-graphite-900">Pagamento registrado com sucesso.</span>
              </div>
              <button onClick={onClose} className="rounded-lg p-1.5 text-graphite-600 hover:bg-gray-100">
                <X size={18} />
              </button>
            </div>

            <div id="print-area">
              <PaymentReceipt payment={payment} client={client} settings={settings} />
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <button
                onClick={() => generatePaymentPdf(payment, client, settings)}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-graphite-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-graphite-800"
              >
                <Download size={16} /> Baixar PDF
              </button>
              <button
                onClick={() => window.print()}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-graphite-900 hover:bg-gray-50"
              >
                <Printer size={16} /> Imprimir
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
