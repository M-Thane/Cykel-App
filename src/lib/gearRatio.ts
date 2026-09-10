export interface WheelPreset {
  value: string
  label: string
  circumferenceMm: number
}

// ISO bead seat diameters (mm). 29" MTB shares 700c's 622mm BSD; 27.5" MTB shares
// 650b's 584mm BSD — only the tire, not the rim, differs between those pairs.
const BSD_700C_MM = 622
const BSD_650B_MM = 584
const BSD_26_MM = 559
const MM_PER_INCH = 25.4

/**
 * Wheel circumference from bead seat diameter + tire width, via circumference ≈
 * π × (BSD + 2 × tire height). Tire height is approximated as width × an aspect-ratio
 * factor that varies a bit by tire category (narrower/road-ish tires run closer to a
 * 1:1 height:width profile than wide, knobby ones) — a standard simplification, and
 * the same one implicit in most published tire-circumference reference charts.
 */
function circumferenceMm(bsdMm: number, widthMm: number, aspect: number): number {
  return Math.round(Math.PI * (bsdMm + 2 * widthMm * aspect))
}

// Same tire widths offered in the dæktryksberegner's dækvælger (see lib/tires.ts),
// so every width choosable there is also choosable here.
const LANDEVEJ_WIDTHS_MM = [23, 24, 25, 26, 28, 30, 32, 34, 35, 38, 42]
const GRAVEL_WIDTHS_MM = [35, 40, 45, 50, 55]
const MTB_WIDTHS_IN = [2.0, 2.2, 2.25, 2.3, 2.35, 2.4, 2.6]

export const WHEEL_PRESETS: WheelPreset[] = [
  ...LANDEVEJ_WIDTHS_MM.map((w) => ({
    value: `700x${w}-landevej`,
    label: `700x${w}c (landevej)`,
    circumferenceMm: circumferenceMm(BSD_700C_MM, w, 0.97),
  })),
  ...GRAVEL_WIDTHS_MM.map((w) => ({
    value: `700x${w}-gravel`,
    label: `700x${w}c (gravel)`,
    circumferenceMm: circumferenceMm(BSD_700C_MM, w, 0.97),
  })),
  ...GRAVEL_WIDTHS_MM.map((w) => ({
    value: `650bx${w}`,
    label: `650b x ${w}mm (gravel)`,
    circumferenceMm: circumferenceMm(BSD_650B_MM, w, 0.87),
  })),
  ...MTB_WIDTHS_IN.map((w) => ({
    value: `29x${w}`,
    label: `29" x ${w}" (MTB)`,
    circumferenceMm: circumferenceMm(BSD_700C_MM, w * MM_PER_INCH, 0.96),
  })),
  ...MTB_WIDTHS_IN.map((w) => ({
    value: `27.5x${w}`,
    label: `27.5" x ${w}" (MTB)`,
    circumferenceMm: circumferenceMm(BSD_650B_MM, w * MM_PER_INCH, 0.9),
  })),
  ...MTB_WIDTHS_IN.map((w) => ({
    value: `26x${w}`,
    label: `26" x ${w}" (MTB, legacy)`,
    circumferenceMm: circumferenceMm(BSD_26_MM, w * MM_PER_INCH, 0.81),
  })),
  { value: 'custom', label: 'Brugerdefineret (indtast mm)', circumferenceMm: 2105 },
]

export function parseTeethList(raw: string): number[] {
  return raw
    .split(/[,\s]+/)
    .map((s) => parseInt(s.trim(), 10))
    .filter((n) => Number.isFinite(n) && n > 0)
}

export interface GearCell {
  chainring: number
  cog: number
  ratio: number
  developmentM: number
  gainRatio: number
  speedKmh: number
}

export function calcGearMatrix(
  chainrings: number[],
  cogs: number[],
  wheelCircumferenceMm: number,
  crankLengthMm: number,
  cadenceRpm: number,
): GearCell[][] {
  const wheelRadiusMm = wheelCircumferenceMm / (2 * Math.PI)
  return chainrings.map((chainring) =>
    cogs.map((cog) => {
      const ratio = chainring / cog
      const developmentM = (wheelCircumferenceMm / 1000) * ratio
      const gainRatio = (wheelRadiusMm / crankLengthMm) * ratio
      const speedKmh = (developmentM * cadenceRpm * 60) / 1000
      return { chainring, cog, ratio, developmentM, gainRatio, speedKmh }
    }),
  )
}

/** RPM needed to hold a given speed in this gear. */
export function requiredCadenceRpm(speedKmh: number, developmentM: number): number {
  if (developmentM <= 0) return 0
  return (speedKmh * 1000) / (developmentM * 60)
}

/** Speed reached in this gear at a given cadence. */
export function speedAtCadenceKmh(developmentM: number, cadenceRpm: number): number {
  return (developmentM * cadenceRpm * 60) / 1000
}

export interface GearRangeSummary {
  easiest: GearCell
  hardest: GearCell
}

/** The lowest and highest gear in a matrix, by meters of development (easiest = least, hardest = most). */
export function gearRangeSummary(matrix: GearCell[][]): GearRangeSummary | null {
  const flat = matrix.flat()
  if (flat.length === 0) return null
  let easiest = flat[0]
  let hardest = flat[0]
  for (const cell of flat) {
    if (cell.developmentM < easiest.developmentM) easiest = cell
    if (cell.developmentM > hardest.developmentM) hardest = cell
  }
  return { easiest, hardest }
}

export interface CassetteStep {
  fromCog: number
  toCog: number
  percentJump: number
}

/** Percentage jump in tooth count between each pair of adjacent cogs (smallest to largest). */
export function calcCassetteSteps(cogs: number[]): CassetteStep[] {
  const sorted = [...cogs].sort((a, b) => a - b)
  const steps: CassetteStep[] = []
  for (let i = 1; i < sorted.length; i++) {
    const fromCog = sorted[i - 1]
    const toCog = sorted[i]
    steps.push({ fromCog, toCog, percentJump: ((toCog - fromCog) / fromCog) * 100 })
  }
  return steps
}
