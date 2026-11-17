import { useEffect, useState } from 'react'
import { getSettings } from '../services/settingsService'

export default function Logo({ compact = false }: { compact?: boolean }) {
  const [logo, setLogo] = useState<string | undefined>(undefined)
  const [name, setName] = useState('Casa do Gesso')

  useEffect(() => {
    let active = true
    getSettings()
      .then((s) => {
        if (!active) return
        setLogo(s.logo)
        setName(s.name || 'Casa do Gesso')
      })
      .catch(() => {})
    return () => { active = false }
  }, [])

  if (logo) {
    return <img src={logo} alt={name} className={compact ? 'h-8 w-8 rounded-lg object-cover' : 'h-9 object-contain'} />
  }

  return (
    <div className="flex items-center gap-2">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-graphite-900 text-white font-extrabold text-xs">
        CG
      </div>
      {!compact && <span className="font-extrabold tracking-tight text-graphite-900 whitespace-nowrap">{name.toUpperCase()}</span>}
    </div>
  )
}
