import { ReactNode } from 'react'

export interface Column<T> {
  key: string
  header: string
  render: (row: T) => ReactNode
  className?: string
}

export default function DataTable<T extends { id: string }>({
  columns,
  rows,
}: {
  columns: Column<T>[]
  rows: T[]
}) {
  return (
    <>
      {/* Desktop */}
      <div className="hidden overflow-x-auto rounded-xl2 border border-gray-200 bg-white shadow-soft md:block">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-graphite-600">
              {columns.map((c) => (
                <th key={c.key} className={`px-4 py-3 ${c.className ?? ''}`}>
                  {c.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
                {columns.map((c) => (
                  <td key={c.key} className={`px-4 py-3 ${c.className ?? ''}`}>
                    {c.render(row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="flex flex-col gap-3 md:hidden">
        {rows.map((row) => (
          <div key={row.id} className="rounded-xl2 border border-gray-200 bg-white p-4 shadow-soft">
            {columns.map((c) => (
              <div key={c.key} className="flex items-center justify-between border-b border-gray-100 py-2 last:border-0">
                <span className="text-xs font-semibold uppercase tracking-wide text-graphite-600">{c.header}</span>
                <span className="text-right text-sm">{c.render(row)}</span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </>
  )
}
