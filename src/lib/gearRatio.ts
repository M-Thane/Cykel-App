export interface WheelPreset {
  value: string
  label: string
  circumferenceMm: number
}

export const WHEEL_PRESETS: WheelPreset[] = [
  { value: '700x23', label: '700x23c (racer)', circumferenceMm: 2096 },
  { value: '700x25', label: '700x25c (racer)', circumferenceMm: 2105 },
  { value: '700x28', label: '700x28c (racer/endurance)', circumferenceMm: 2136 },
  { value: '700x32', label: '700x32c (allroad)', circumferenceMm: 2155 },
  { value: '700x35', label: '700x35c (gravel)', circumferenceMm: 2168 },
  { value: '700x40', label: '700x40c (gravel)', circumferenceMm: 2200 },
  { value: '650bx47', label: '650b x 47mm (gravel)', circumferenceMm: 2090 },
  { value: '29x2.2', label: '29" x 2.2" (MTB)', circumferenceMm: 2288 },
  { value: '29x2.4', label: '29" x 2.4" (MTB)', circumferenceMm: 2326 },
  { value: '27.5x2.3', label: '27.5" x 2.3" (MTB)', circumferenceMm: 2168 },
  { value: '27.5x2.8', label: '27.5"+ x 2.8" (MTB plus)', circumferenceMm: 2232 },
  { value: '26x2.1', label: '26" x 2.1" (MTB)', circumferenceMm: 2026 },
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
