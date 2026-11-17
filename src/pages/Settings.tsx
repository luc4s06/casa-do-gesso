import { useEffect, useRef, useState } from 'react'
import { Upload } from 'lucide-react'
import { getSettings, saveSettings } from '../services/settingsService'
import { useToast } from '../hooks/useToast'
import LegacyImport from '../components/LegacyImport'
import { CompanySettings } from '../types'

export default function Settings() {
  const { showToast } = useToast()
  const fileRef = useRef<HTMLInputElement>(null)
  const [settings, setSettings] = useState<CompanySettings>({ name: '', phone: '', address: '' })
  const [loaded, setLoaded] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    getSettings()
      .then((s) => { setSettings(s); setLoaded(true) })
      .catch((err) => showToast(err instanceof Error ? err.message : 'Não foi possível carregar as configurações.', 'error'))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function handleLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => setSettings((prev) => ({ ...prev, logo: reader.result as string }))
    reader.readAsDataURL(file)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!loaded || saving) return
    setSaving(true)
    try {
      await saveSettings(settings)
      showToast('Configurações salvas com sucesso.')
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Não foi possível salvar as configurações.', 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="mx-auto max-w-lg">
      <h1 className="mb-1 text-2xl font-extrabold tracking-tight text-graphite-900">Configurações</h1>
      <p className="mb-6 text-sm text-graphite-600">Dados da empresa usados em toda a aplicação e nos comprovantes.</p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5 rounded-xl2 border border-gray-200 bg-white p-6 shadow-soft">
        <div>
          <label className="mb-1 block text-sm font-medium text-graphite-900">Logo</label>
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-xl border border-gray-200 bg-gray-50">
              {settings.logo ? (
                <img src={settings.logo} alt="Logo" className="h-full w-full object-cover" />
              ) : (
                <span className="text-xs font-bold text-graphite-600">CG</span>
              )}
            </div>
            <button type="button" onClick={() => fileRef.current?.click()} className="flex items-center gap-2 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-graphite-900 hover:bg-gray-50">
              <Upload size={15} /> Enviar logo
            </button>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleLogoChange} />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-graphite-900">Nome da empresa</label>
          <input
            value={settings.name}
            onChange={(e) => setSettings((p) => ({ ...p, name: e.target.value }))}
            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-graphite-900 focus:outline-none"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-graphite-900">Telefone</label>
          <input
            value={settings.phone}
            onChange={(e) => setSettings((p) => ({ ...p, phone: e.target.value }))}
            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-graphite-900 focus:outline-none"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-graphite-900">Endereço</label>
          <input
            value={settings.address}
            onChange={(e) => setSettings((p) => ({ ...p, address: e.target.value }))}
            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-graphite-900 focus:outline-none"
          />
        </div>

        <button type="submit" disabled={!loaded || saving} className="mt-1 rounded-lg bg-graphite-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-graphite-800 disabled:opacity-60">
          Salvar configurações
        </button>
      </form>

      <LegacyImport />
    </div>
  )
}
