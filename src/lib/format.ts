export function fmtKm(km: number, locale = 'da-DK'): string {
  return `${Math.round(km).toLocaleString(locale)} km`
}

export function fmtDate(iso: string, locale = 'da-DK'): string {
  if (!iso) return ''
  const d = new Date(iso)
  return d.toLocaleDateString(locale, { day: '2-digit', month: 'short', year: 'numeric' })
}

export function todayIso(): string {
  return new Date().toISOString().slice(0, 10)
}
