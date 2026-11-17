import { useState } from 'react'
import { DatabaseBackup, Loader2 } from 'lucide-react'
import { getLegacyCounts, importLegacyData } from '../services/legacyImport'
import { useToast } from '../hooks/useToast'

// Só aparece se este navegador ainda tem dados da versão antiga (guardados localmente).
export default function LegacyImport() {
  const { showToast } = useToast()
  const [counts, setCounts] = useState(() => getLegacyCounts())
  const [busy, setBusy] = useState(false)

  if (counts.total === 0) return null

  async function handleImport() {
    if (busy) return
    setBusy(true)
    try {
      const done = await importLegacyData()
      showToast(`Importado: ${done.clients} cliente(s), ${done.withdrawals} retirada(s), ${done.payments} pagamento(s).`)
      setCounts(getLegacyCounts())
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Não foi possível importar os dados.', 'error')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="mt-6 rounded-xl2 border border-amber-200 bg-amber-50 p-5">
      <div className="mb-2 flex items-center gap-2 text-sm font-bold text-amber-900">
        <DatabaseBackup size={16} /> Dados salvos só neste navegador
      </div>
      <p className="text-sm text-amber-900">
        Encontrei {counts.clients} cliente(s), {counts.withdrawals} retirada(s) e {counts.payments} pagamento(s) da versão
        antiga, guardados apenas aqui. Envie para o banco para acessá-los de qualquer aparelho. Pode importar mais de uma
        vez: nada é duplicado. Seus dados locais não são apagados.
      </p>
      <button
        onClick={handleImport}
        disabled={busy}
        className="mt-3 flex items-center gap-2 rounded-lg bg-graphite-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-graphite-800 disabled:opacity-60"
      >
        {busy && <Loader2 size={15} className="animate-spin" />} Enviar dados para o banco
      </button>
    </div>
  )
}
