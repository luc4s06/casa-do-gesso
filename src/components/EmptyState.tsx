import { LucideIcon } from 'lucide-react'
import { ReactNode } from 'react'

export default function EmptyState({
  icon: Icon,
  title,
  action,
}: {
  icon: LucideIcon
  title: string
  action?: ReactNode
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl2 border border-dashed border-gray-300 bg-white px-6 py-16 text-center">
      <div className="mb-4 rounded-full bg-gray-100 p-4 text-graphite-600">
        <Icon size={26} />
      </div>
      <p className="mb-4 max-w-xs text-sm font-medium text-graphite-600">{title}</p>
      {action}
    </div>
  )
}
