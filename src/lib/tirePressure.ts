export type Surface = 'asfalt_glat' | 'asfalt_normal' | 'asfalt_ru' | 'grus_fast' | 'grus_los' | 'mtb_hardpack' | 'mtb_teknisk'
export type RideStyle = 'race' | 'endurance' | 'komfort'
export type TubeType = 'slange' | 'tubeless' | 'tubular'

export const SURFACES: { value: Surface; label: string; factor: number }[] = [
  { value: 'asfalt_glat', label: 'Asfalt, meget glat', factor: 1.05 },
  { value: 'asfalt_normal', label: 'Asfalt, normal', factor: 1.0 },
  { value: 'asfalt_ru', label: 'Asfalt, ru/flængesplit', factor: 0.93 },
  { value: 'grus_fast', label: 'Grus, fast underlag', factor: 0.87 },
  { value: 'grus_los', label: 'Grus, løst/hullet', factor: 0.78 },
  { value: 'mtb_hardpack', label: 'MTB sti, hardpack', factor: 0.72 },
  { value: 'mtb_teknisk', label: 'MTB, teknisk/rødder/sten', factor: 0.62 },
]

export const RIDE_STYLES: { value: RideStyle; label: string; factor: number; hint: string }[] = [
  { value: 'race', label: 'Race/performance', factor: 1.06, hint: 'Prioriterer lav rullemodstand' },
  { value: 'endurance', label: 'Endurance/alsidig', factor: 1.0, hint: 'Balance mellem komfort og fart' },
  { value: 'komfort', label: 'Komfort/tur', factor: 0.94, hint: 'Prioriterer komfort og grip' },
]

export const TUBE_TYPES: { value: TubeType; label: string; factor: number }[] = [
  { value: 'slange', label: 'Slange (butyl)', factor: 1.0 },
  { value: 'tubeless', label: 'Tubeless', factor: 0.92 },
  { value: 'tubular', label: 'Tubular', factor: 0.95 },
]

export interface TirePressureInput {
  riderWeightKg: number
  bikeWeightKg: number
  tireWidthMm: number
  surface: Surface
  style: RideStyle
  tube: TubeType
  /** Internal rim width in mm, if known — adjusts the effective mounted tire width. */
  rimInternalWidthMm?: number
}

export interface TirePressureResult {
  frontBar: number
  rearBar: number
  frontPsi: number
  rearPsi: number
  clampedLow: boolean
  clampedHigh: boolean
  /** The tire width actually used in the calculation, after any rim-width adjustment. */
  effectiveWidthMm: number
}

const BAR_TO_PSI = 14.5038
const MIN_BAR = 1.0
const MAX_BAR = 8.5

// Rule of thumb widely used in the industry (Silca/ETRTO-derived): mounted tire width
// changes by roughly 0.4mm for every 1mm the rim's internal width differs from the
// ~19mm reference rim most tire widths are specified against. Adjustment is capped
// to keep implausible rim inputs from swinging the result too far.
const RIM_REFERENCE_WIDTH_MM = 19
const RIM_WIDTH_EFFECT_PER_MM = 0.4
const MAX_RIM_ADJUSTMENT_MM = 4

export function effectiveTireWidthMm(nominalWidthMm: number, rimInternalWidthMm?: number): number {
  if (!rimInternalWidthMm) return nominalWidthMm
  const raw = (rimInternalWidthMm - RIM_REFERENCE_WIDTH_MM) * RIM_WIDTH_EFFECT_PER_MM
  const adjustment = Math.min(MAX_RIM_ADJUSTMENT_MM, Math.max(-MAX_RIM_ADJUSTMENT_MM, raw))
  return nominalWidthMm + adjustment
}

export function calcTirePressure(input: TirePressureInput): TirePressureResult {
  const systemWeight = Math.max(0, input.riderWeightKg + input.bikeWeightKg)
  const width = Math.max(18, effectiveTireWidthMm(input.tireWidthMm, input.rimInternalWidthMm))

  const surfaceFactor = SURFACES.find((s) => s.value === input.surface)?.factor ?? 1
  const styleFactor = RIDE_STYLES.find((s) => s.value === input.style)?.factor ?? 1
  const tubeFactor = TUBE_TYPES.find((t) => t.value === input.tube)?.factor ?? 1

  const baseBar = (systemWeight * 0.91) / (width - 9)
  const rearRaw = baseBar * surfaceFactor * styleFactor * tubeFactor
  const frontRaw = rearRaw * 0.93

  const clampedLow = frontRaw < MIN_BAR || rearRaw < MIN_BAR
  const clampedHigh = frontRaw > MAX_BAR || rearRaw > MAX_BAR

  const rearBar = Math.min(MAX_BAR, Math.max(MIN_BAR, rearRaw))
  const frontBar = Math.min(MAX_BAR, Math.max(MIN_BAR, frontRaw))

  return {
    frontBar: Math.round(frontBar * 10) / 10,
    rearBar: Math.round(rearBar * 10) / 10,
    frontPsi: Math.round(frontBar * BAR_TO_PSI),
    rearPsi: Math.round(rearBar * BAR_TO_PSI),
    clampedLow,
    clampedHigh,
    effectiveWidthMm: Math.round(width * 10) / 10,
  }
}
