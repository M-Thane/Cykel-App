export function fmtKm(km: number): string {
  return `${Math.round(km).toLocaleString('da-DK')} km`
}

export function fmtDate(iso: string): string {
  if (!iso) return ''
  const d = new Date(iso)
  return d.toLocaleDateString('da-DK', { day: '2-digit', month: 'short', year: 'numeric' })
}

export function todayIso(): string {
  return new Date().toISOString().slice(0, 10)
}
