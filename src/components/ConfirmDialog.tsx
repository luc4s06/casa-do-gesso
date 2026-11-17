import { AnimatePresence, motion } from 'framer-motion'
import { AlertTriangle } from 'lucide-react'

interface ConfirmDialogProps {
  open: boolean
  title: string
  description: string
  confirmLabel?: string
  onConfirm: () => void
  onCancel: () => void
}

export default function ConfirmDialog({ open, title, description, confirmLabel = 'Confirmar', onConfirm, onCancel }: ConfirmDialogProps) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[90] flex items-center justify-center bg-black/40 px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onCancel}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm rounded-xl2 bg-white p-6 shadow-soft"
          >
            <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-amber-100 text-amber-600">
              <AlertTriangle size={20} />
            </div>
            <h3 className="mb-1 text-base font-bold text-graphite-900">{title}</h3>
            <p className="mb-5 text-sm text-graphite-600">{description}</p>
            <div className="flex justify-end gap-2">
              <button onClick={onCancel} className="rounded-lg px-4 py-2 text-sm font-medium text-graphite-600 hover:bg-gray-100">
                Cancelar
              </button>
              <button onClick={onConfirm} className="rounded-lg bg-graphite-900 px-4 py-2 text-sm font-medium text-white hover:bg-graphite-800">
                {confirmLabel}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
