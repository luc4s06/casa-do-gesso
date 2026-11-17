import { NavLink } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard,
  Users,
  PackageMinus,
  Wallet,
  Tags,
  FileBarChart2,
  Settings as SettingsIcon,
  X,
} from 'lucide-react'
import Logo from './Logo'

const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/clientes', label: 'Clientes', icon: Users },
  { to: '/retiradas', label: 'Retiradas', icon: PackageMinus },
  { to: '/pagamentos', label: 'Pagamentos', icon: Wallet },
  { to: '/precos', label: 'Materiais', icon: Tags },
  { to: '/relatorios', label: 'Relatórios', icon: FileBarChart2 },
  { to: '/configuracoes', label: 'Configurações', icon: SettingsIcon },
]

function NavItems({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <nav className="flex flex-1 flex-col gap-1 px-3">
      {NAV_ITEMS.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.end}
          onClick={onNavigate}
          className={({ isActive }) =>
            `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
              isActive ? 'bg-graphite-900 text-white' : 'text-graphite-600 hover:bg-gray-100'
            }`
          }
        >
          <item.icon size={18} />
          {item.label}
        </NavLink>
      ))}
    </nav>
  )
}

export default function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <>
      {/* Desktop */}
      <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:border-r lg:border-gray-200 lg:bg-white lg:py-5">
        <div className="px-5 pb-6">
          <Logo />
        </div>
        <NavItems />
        <div className="px-5 pt-6 text-xs text-graphite-600">
          <p className="font-semibold text-graphite-900">Casa do Gesso</p>
          <p>Sistema de gestão</p>
        </div>
      </aside>

      {/* Mobile drawer */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              className="fixed inset-0 z-40 bg-black/40 lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
            />
            <motion.aside
              className="fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-white py-5 shadow-soft lg:hidden"
              initial={{ x: -288 }}
              animate={{ x: 0 }}
              exit={{ x: -288 }}
              transition={{ type: 'tween', duration: 0.25 }}
            >
              <div className="flex items-center justify-between px-5 pb-6">
                <Logo />
                <button onClick={onClose} className="rounded-lg p-1.5 text-graphite-600 hover:bg-gray-100">
                  <X size={20} />
                </button>
              </div>
              <NavItems onNavigate={onClose} />
              <div className="px-5 pt-6 text-xs text-graphite-600">
                <p className="font-semibold text-graphite-900">Casa do Gesso</p>
                <p>Sistema de gestão</p>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
