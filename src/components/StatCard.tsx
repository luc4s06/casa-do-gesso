import { motion } from 'framer-motion'
import { LucideIcon } from 'lucide-react'

interface StatCardProps {
  label: string
  value: string
  icon: LucideIcon
  tone?: 'default' | 'positive' | 'negative'
  delay?: number
}

export default function StatCard({ label, value, icon: Icon, tone = 'default', delay = 0 }: StatCardProps) {
  const toneClass =
    tone === 'positive' ? 'text-green-600' : tone === 'negative' ? 'text-red-600' : 'text-graphite-900'

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay }}
      whileHover={{ y: -3 }}
      className="rounded-xl2 border border-gray-200 bg-white p-5 shadow-soft"
    >
      <div className="mb-3 flex items-center justify-between">
        <span className="text-sm font-medium text-graphite-600">{label}</span>
        <div className="rounded-lg bg-gray-100 p-2 text-graphite-700">
          <Icon size={16} />
        </div>
      </div>
      <p className={`text-2xl font-extrabold tracking-tight ${toneClass}`}>{value}</p>
    </motion.div>
  )
}
