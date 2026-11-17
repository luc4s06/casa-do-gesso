import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, Image as ImageIcon, Loader2, MessageCircle, Printer, X } from 'lucide-react'
import { Withdrawal, Client, CompanySettings } from '../types'
import { WithdrawalReceipt } from './Receipt'
import { openWithdrawalOnWhatsApp } from '../utils/whatsapp'
import { renderToPngBlob, sharePngOrDownload } from '../utils/receiptImage'
import { useToast } from '../hooks/useToast'

export default function WithdrawalModal({
  withdrawal,
  client,
  settings,
  onClose,
}: {
  withdrawal: Withdrawal | null
  client: Client | null
  settings: CompanySettings
  onClose: () => void
}) {
  const { showToast } = useToast()
  const captureRef = useRef<HTMLDivElement>(null)
  const [image, setImage] = useState<Blob | null>(null)
  const [imageFailed, setImageFailed] = useState(false)

  const withdrawalId = withdrawal?.id
  const clientId = client?.id

  // A imagem é preparada assim que o comprovante abre, para o botão responder na hora
  // (o celular só libera o compartilhamento logo após o toque).
  useEffect(() => {
    setImage(null)
    setImageFailed(false)
    if (!withdrawalId || !clientId) return
    let cancelled = false
    const timer = setTimeout(async () => {
      if (!captureRef.current) return
      try {
        const blob = await renderToPngBlob(captureRef.current)
        if (!cancelled) setImage(blob)
      } catch {
        if (!cancelled) setImageFailed(true)
      }
    }, 400)
    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [withdrawalId, clientId, settings.name, settings.phone, settings.address, settings.logo])

  async function handleSendImage() {
    if (!image || !withdrawal) return
    const filename = `retirada-${String(withdrawal.number).padStart(6, '0')}.png`
    const result = await sharePngOrDownload(image, filename, `Comprovante de retirada — ${settings.name}`)
    if (result === 'downloaded') showToast('Imagem salva. Anexe no WhatsApp para enviar ao cliente.')
  }

  return (
    <>
      {withdrawal && client && (
        // Cópia fora da tela, em largura fixa, só para gerar a imagem sempre com o mesmo tamanho.
        <div
          ref={captureRef}
          aria-hidden="true"
          style={{ position: 'fixed', left: -10000, top: 0, width: 448, padding: 16, background: '#ffffff' }}
        >
          <WithdrawalReceipt withdrawal={withdrawal} client={client} settings={settings} />
        </div>
      )}

      <AnimatePresence>
        {withdrawal && client && (
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
                  <span className="text-sm font-semibold text-graphite-900">Retirada registrada com sucesso.</span>
                </div>
                <button onClick={onClose} className="rounded-lg p-1.5 text-graphite-600 hover:bg-gray-100">
                  <X size={18} />
                </button>
              </div>

              <div id="print-area">
                <WithdrawalReceipt withdrawal={withdrawal} client={client} settings={settings} />
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  onClick={handleSendImage}
                  disabled={!image}
                  className="flex min-w-[9rem] flex-1 items-center justify-center gap-2 rounded-lg bg-green-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-60"
                >
                  {image || imageFailed ? <ImageIcon size={16} /> : <Loader2 size={16} className="animate-spin" />}
                  {image || imageFailed ? 'Enviar imagem' : 'Preparando imagem...'}
                </button>
                <button
                  onClick={() => openWithdrawalOnWhatsApp(withdrawal, client, settings)}
                  className="flex min-w-[9rem] flex-1 items-center justify-center gap-2 rounded-lg border border-green-600 px-4 py-2.5 text-sm font-medium text-green-700 hover:bg-green-50"
                >
                  <MessageCircle size={16} /> Enviar texto
                </button>
                <button
                  onClick={() => window.print()}
                  className="flex min-w-[9rem] flex-1 items-center justify-center gap-2 rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-graphite-900 hover:bg-gray-50"
                >
                  <Printer size={16} /> Imprimir
                </button>
              </div>
              {imageFailed && (
                <p className="mt-2 text-xs text-red-600">Não foi possível gerar a imagem. Use “Enviar texto”.</p>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
