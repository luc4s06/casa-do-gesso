import { LogOut, Menu, Settings as SettingsIcon } from 'lucide-react'
import { Link } from 'react-router-dom'
import Logo from './Logo'
import { useAuth } from '../hooks/useAuth'

export default function Header({ onMenuClick }: { onMenuClick: () => void }) {
  const { signOut } = useAuth()
  return (
    <header className="sticky top-0 z-30 flex items-center justify-between border-b border-gray-200 bg-white/90 px-4 py-3 backdrop-blur lg:px-6">
      <div className="flex items-center gap-3 lg:hidden">
        <Logo compact />
      </div>
      <div className="hidden lg:block" />
      <div className="flex items-center gap-2">
        <Link to="/configuracoes" className="rounded-lg p-2 text-graphite-600 hover:bg-gray-100" title="Configurações">
          <SettingsIcon size={19} />
        </Link>
        <button onClick={signOut} className="rounded-lg p-2 text-graphite-600 hover:bg-gray-100" title="Sair">
          <LogOut size={19} />
        </button>
        <button onClick={onMenuClick} className="rounded-lg p-2 text-graphite-600 hover:bg-gray-100 lg:hidden" title="Menu">
          <Menu size={20} />
        </button>
      </div>
    </header>
  )
}
