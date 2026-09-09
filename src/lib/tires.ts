export type TireBrand = 'continental' | 'schwalbe' | 'pirelli' | 'vittoria' | 'specialized'
export type TireDiscipline = 'landevej' | 'gravel' | 'mtb'

export const TIRE_BRAND_LABELS: Record<TireBrand, string> = {
  continental: 'Continental',
  schwalbe: 'Schwalbe',
  pirelli: 'Pirelli',
  vittoria: 'Vittoria',
  specialized: 'Specialized',
}

export interface TireWidthOption {
  /** Width in millimeters, used to drive the pressure calculation. */
  mm: number
  /** Display label as the manufacturer states it, e.g. '28mm' or '2.3" (~58mm)'. */
  label: string
}

export interface TirePreset {
  id: string
  brand: TireBrand
  model: string
  discipline: TireDiscipline
  widths: TireWidthOption[]
  tubelessReady?: boolean
  note?: string
}

export const TIRE_PRESETS: TirePreset[] = []

export function tirePresetLabel(p: TirePreset): string {
  return `${TIRE_BRAND_LABELS[p.brand]} ${p.model}`
}
