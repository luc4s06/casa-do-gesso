import { Link } from 'react-router-dom'
import { ChevronRight, MapPin, Phone } from 'lucide-react'
import { Client } from '../types'
import { formatCurrency } from '../utils/format'

export default function CustomerCard({ client, balance }: { client: Client; balance: number }) {
  return (
    <Link
      to={`/clientes/${client.id}`}
      className="flex items-center justify-between rounded-xl2 border border-gray-200 bg-white p-4 shadow-soft transition-transform active:scale-[0.99]"
    >
      <div className="min-w-0 flex-1">
        <p className="truncate font-semibold text-graphite-900">{client.name}</p>
        <p className="mt-1 flex items-center gap-1 text-xs text-graphite-600">
          <Phone size={12} /> {client.phone}
        </p>
        {client.address && (
          <p className="mt-0.5 flex items-center gap-1 truncate text-xs text-graphite-600">
            <MapPin size={12} /> {client.address}
          </p>
        )}
        <p className={`mt-2 text-sm font-bold ${balance > 0 ? 'text-red-600' : 'text-green-600'}`}>
          {formatCurrency(balance)}
        </p>
      </div>
      <ChevronRight size={18} className="text-graphite-600" />
    </Link>
  )
}
