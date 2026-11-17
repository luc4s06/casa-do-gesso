export function formatCurrency(value: number): string {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('pt-BR')
}

export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

export function formatRangeLabel(start: Date, end: Date): string {
  const f = (d: Date) => d.toLocaleDateString('pt-BR')
  return `${f(start)} — ${f(end)}`
}
