import { useEffect, useMemo, useState } from 'react'
import { Pencil, Save } from 'lucide-react'
import MaterialCard from '../components/MaterialCard'
import { getMaterials, getPricesMap, updatePrices } from '../services/materialService'
import { LoadingState, ErrorState } from '../components/AsyncState'
import { useAsync } from '../hooks/useAsync'
import { useToast } from '../hooks/useToast'

export default function Prices() {
  const { showToast } = useToast()
  const materials = useMemo(() => getMaterials(), [])
  const { data: loaded, error, reload } = useAsync(() => getPricesMap(), [])
  const [prices, setPrices] = useState<Record<string, number>>({})
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (loaded) setPrices(loaded)
  }, [loaded])

  async function handleSave() {
    if (saving) return
    setSaving(true)
    try {
      await updatePrices(Object.entries(prices).map(([materialId, price]) => ({ materialId, price })))
      setEditing(false)
      showToast('Preços atualizados com sucesso.')
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Não foi possível salvar os preços.', 'error')
    } finally {
      setSaving(false)
    }
  }

  if (!loaded) return error ? <ErrorState message={error} onRetry={reload} /> : <LoadingState />

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-graphite-900">Preços dos materiais</h1>
          <p className="text-sm text-graphite-600">O preço atual é usado apenas em novas retiradas — retiradas antigas não mudam.</p>
        </div>
        {editing ? (
          <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 rounded-lg bg-graphite-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-graphite-800 disabled:opacity-60">
            <Save size={16} /> Salvar preços
          </button>
        ) : (
          <button onClick={() => setEditing(true)} className="flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-graphite-900 hover:bg-gray-50">
            <Pencil size={16} /> Editar preços
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {materials.map((m) => (
          <MaterialCard
            key={m.id}
            material={m}
            price={prices[m.id] ?? 0}
            editing={editing}
            onChange={(value) => setPrices((prev) => ({ ...prev, [m.id]: value }))}
          />
        ))}
      </div>
    </div>
  )
}
