export type FitDiscipline = 'landevej' | 'gravel' | 'mtb'
export type Flexibility = 'stiv' | 'normal' | 'fleksibel'

export const FIT_DISCIPLINES: { value: FitDiscipline; label: string }[] = [
  { value: 'landevej', label: 'Landevej' },
  { value: 'gravel', label: 'Gravel' },
  { value: 'mtb', label: 'MTB' },
]

export const FLEXIBILITIES: { value: Flexibility; label: string }[] = [
  { value: 'stiv', label: 'Stiv / lidt smidig' },
  { value: 'normal', label: 'Middel smidighed' },
  { value: 'fleksibel', label: 'Meget smidig' },
]

interface HeightRow {
  maxHeight: number
  letter: string
  frameCm?: string
}

const ROAD_GRAVEL_TABLE: HeightRow[] = [
  { maxHeight: 160, letter: 'XS', frameCm: '47-49' },
  { maxHeight: 168, letter: 'S', frameCm: '49-52' },
  { maxHeight: 175, letter: 'M', frameCm: '52-55' },
  { maxHeight: 183, letter: 'L', frameCm: '55-58' },
  { maxHeight: 191, letter: 'XL', frameCm: '58-61' },
  { maxHeight: Infinity, letter: 'XXL', frameCm: '61+' },
]

const MTB_TABLE: HeightRow[] = [
  { maxHeight: 165, letter: 'S' },
  { maxHeight: 175, letter: 'M' },
  { maxHeight: 185, letter: 'L' },
  { maxHeight: 195, letter: 'XL' },
  { maxHeight: Infinity, letter: 'XXL' },
]

const HANDLEBAR_DROP: Record<FitDiscipline, Record<Flexibility, [number, number]>> = {
  landevej: { stiv: [2, 5], normal: [5, 8], fleksibel: [8, 11] },
  gravel: { stiv: [0, 3], normal: [2, 5], fleksibel: [4, 7] },
  mtb: { stiv: [-3, 0], normal: [-1, 2], fleksibel: [1, 4] },
}

export interface BikeFitInput {
  heightCm: number
  inseamCm: number
  discipline: FitDiscipline
  flexibility: Flexibility
}

export interface BikeFitResult {
  saddleHeightLemondCm: number
  saddleHeightHolmesCm: number
  frameLetter: string
  frameCmRange?: string
  handlebarDrop: [number, number]
}

export function calcBikeFit(input: BikeFitInput): BikeFitResult {
  const table = input.discipline === 'mtb' ? MTB_TABLE : ROAD_GRAVEL_TABLE
  const row = table.find((r) => input.heightCm <= r.maxHeight) ?? table[table.length - 1]

  return {
    saddleHeightLemondCm: Math.round(input.inseamCm * 0.883 * 10) / 10,
    saddleHeightHolmesCm: Math.round(input.inseamCm * 1.09 * 10) / 10,
    frameLetter: row.letter,
    frameCmRange: row.frameCm,
    handlebarDrop: HANDLEBAR_DROP[input.discipline][input.flexibility],
  }
}
