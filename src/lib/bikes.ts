import type { Discipline } from '../types'

export type BikeMakeBrand =
  | 'giant'
  | 'trek'
  | 'specialized'
  | 'merida'
  | 'cannondale'
  | 'scott'
  | 'cervelo'
  | 'cube'
  | 'canyon'
  | 'bianchi'

export const BIKE_BRAND_LABELS: Record<BikeMakeBrand, string> = {
  giant: 'Giant',
  trek: 'Trek',
  specialized: 'Specialized',
  merida: 'Merida',
  cannondale: 'Cannondale',
  scott: 'Scott',
  cervelo: 'Cervélo',
  cube: 'Cube',
  canyon: 'Canyon',
  bianchi: 'Bianchi',
}

export interface BikeSizeRow {
  /** Size label as the manufacturer states it, e.g. 'M', 'M/L', or '54cm'. */
  size: string
  heightMinCm: number
  heightMaxCm: number
}

/** Bike discipline is a subset of the app's general Discipline type (no pendling/tur models here). */
export type BikeModelDiscipline = Extract<Discipline, 'landevej' | 'gravel' | 'mtb'>

export interface BikeModelPreset {
  id: string
  brand: BikeMakeBrand
  model: string
  discipline: BikeModelDiscipline
  sizes: BikeSizeRow[]
  note?: string
}

export const BIKE_MODEL_PRESETS: BikeModelPreset[] = []

export function bikeModelLabel(p: BikeModelPreset): string {
  return `${BIKE_BRAND_LABELS[p.brand]} ${p.model}`
}

export function recommendedSize(preset: BikeModelPreset, heightCm: number): BikeSizeRow | undefined {
  return (
    preset.sizes.find((s) => heightCm >= s.heightMinCm && heightCm <= s.heightMaxCm) ??
    preset.sizes.find((s) => heightCm < s.heightMinCm) ??
    preset.sizes[preset.sizes.length - 1]
  )
}
