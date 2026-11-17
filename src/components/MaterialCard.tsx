import { motion } from 'framer-motion'
import { Material } from '../types'
import { formatCurrency } from '../utils/format'

interface MaterialCardProps {
  material: Material
  price: number
  editing: boolean
  onChange: (value: number) => void
}

export default function MaterialCard({ material, price, editing, onChange }: MaterialCardProps) {
  return (
    <motion.div
      whileHover={{ y: -2 }}
      className="rounded-xl2 border border-gray-200 bg-white p-5 shadow-soft"
    >
      <p className="text-sm font-semibold text-graphite-900">{material.name}</p>
      <p className="mb-3 text-xs text-graphite-600">Unidade: {material.unit}</p>
      {editing ? (
        <div className="flex items-center gap-1">
          <span className="text-sm text-graphite-600">R$</span>
          <input
            type="number"
            min={0}
            step="0.01"
            value={price}
            onChange={(e) => onChange(Number(e.target.value))}
            className="w-full rounded-lg border border-gray-300 px-2 py-1.5 text-lg font-bold text-graphite-900 focus:border-graphite-900 focus:outline-none"
          />
          <span className="text-sm text-graphite-600">/{material.unit}</span>
        </div>
      ) : (
        <p className="text-2xl font-extrabold text-graphite-900">
          {formatCurrency(price)} <span className="text-sm font-medium text-graphite-600">/{material.unit}</span>
        </p>
      )}
    </motion.div>
  )
}
