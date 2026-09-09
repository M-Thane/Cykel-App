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
  /** Empty when no size-vs-height chart could be verified with confidence — never fabricated. */
  sizes: BikeSizeRow[]
  note?: string
}

function sizes(...rows: [string, number, number][]): BikeSizeRow[] {
  return rows.map(([size, heightMinCm, heightMaxCm]) => ({ size, heightMinCm, heightMaxCm }))
}

// Canyon's shared "PPS" height/inseam sizing system, reused across its model lines.
const CANYON_PPS = sizes(
  ['2XS', 155, 163],
  ['XS', 161, 169],
  ['S', 167, 175],
  ['M', 173, 181],
  ['L', 179, 187],
  ['XL', 185, 193],
  ['2XL', 191, 200],
)

export const BIKE_MODEL_PRESETS: BikeModelPreset[] = [
  // ---------------------------------------------------------------------
  // Giant
  // ---------------------------------------------------------------------
  {
    id: 'giant-tcr-landevej',
    brand: 'giant',
    model: 'TCR Advanced',
    discipline: 'landevej',
    sizes: sizes(['XS', 157, 169], ['S', 165, 175], ['M', 171, 181], ['M/L', 177, 187], ['L', 183, 193], ['XL', 189, 199]),
  },
  { id: 'giant-revolt-gravel', brand: 'giant', model: 'Revolt Advanced', discipline: 'gravel', sizes: [] },
  { id: 'giant-trancex-mtb', brand: 'giant', model: 'Trance X', discipline: 'mtb', sizes: [] },

  // ---------------------------------------------------------------------
  // Trek
  // ---------------------------------------------------------------------
  { id: 'trek-domane-landevej', brand: 'trek', model: 'Domane SL', discipline: 'landevej', sizes: [] },
  { id: 'trek-checkpoint-gravel', brand: 'trek', model: 'Checkpoint SL', discipline: 'gravel', sizes: [] },
  { id: 'trek-fuelex-mtb', brand: 'trek', model: 'Fuel EX', discipline: 'mtb', sizes: [] },

  // ---------------------------------------------------------------------
  // Specialized
  // ---------------------------------------------------------------------
  {
    id: 'specialized-tarmacsl8-landevej',
    brand: 'specialized',
    model: 'Tarmac SL8',
    discipline: 'landevej',
    sizes: sizes(['44', 142, 155], ['49', 155, 163], ['52', 163, 170], ['54', 170, 175], ['56', 175, 180], ['58', 180, 188], ['61', 188, 196]),
  },
  {
    id: 'specialized-diverge4-gravel',
    brand: 'specialized',
    model: 'Diverge 4',
    discipline: 'gravel',
    sizes: sizes(['49', 152, 163], ['52', 163, 170], ['54', 170, 178], ['56', 175, 180], ['58', 180, 188], ['61', 188, 196]),
    note: 'Producentens tabel har et lille overlap mellem 54 og 56 — dobbelttjek ved grænsehøjder',
  },
  {
    id: 'specialized-stumpjumper15-mtb',
    brand: 'specialized',
    model: 'Stumpjumper 15',
    discipline: 'mtb',
    sizes: sizes(['S1', 150, 160], ['S2', 157, 173], ['S3', 165, 180], ['S4', 173, 188], ['S5', 178, 193], ['S6', 188, 203]),
    note: 'S-Sizing er ikke skridtmål-baseret — vælg efter både højde og foretrukken kørestil',
  },

  // ---------------------------------------------------------------------
  // Merida
  // ---------------------------------------------------------------------
  { id: 'merida-scultura-landevej', brand: 'merida', model: 'Scultura', discipline: 'landevej', sizes: [] },
  { id: 'merida-silex-gravel', brand: 'merida', model: 'Silex', discipline: 'gravel', sizes: [] },
  { id: 'merida-ninetysix-mtb', brand: 'merida', model: 'Ninety-Six', discipline: 'mtb', sizes: [] },

  // ---------------------------------------------------------------------
  // Cannondale
  // ---------------------------------------------------------------------
  {
    id: 'cannondale-supersixevo-landevej',
    brand: 'cannondale',
    model: 'SuperSix EVO',
    discipline: 'landevej',
    sizes: sizes(['44', 154, 165], ['48', 160, 170], ['51', 165, 175], ['54', 170, 180], ['56', 177, 185], ['58', 182, 193], ['61', 190, 200]),
  },
  { id: 'cannondale-topstone-gravel', brand: 'cannondale', model: 'Topstone Carbon', discipline: 'gravel', sizes: [] },
  { id: 'cannondale-scalpel-mtb', brand: 'cannondale', model: 'Scalpel', discipline: 'mtb', sizes: [] },

  // ---------------------------------------------------------------------
  // Scott
  // ---------------------------------------------------------------------
  { id: 'scott-addictrc-landevej', brand: 'scott', model: 'Addict RC', discipline: 'landevej', sizes: [] },
  { id: 'scott-addictgravel-gravel', brand: 'scott', model: 'Addict Gravel', discipline: 'gravel', sizes: [] },
  { id: 'scott-spark-mtb', brand: 'scott', model: 'Spark', discipline: 'mtb', sizes: [] },

  // ---------------------------------------------------------------------
  // Cervélo
  // ---------------------------------------------------------------------
  { id: 'cervelo-r5-landevej', brand: 'cervelo', model: 'R5', discipline: 'landevej', sizes: [] },
  { id: 'cervelo-aspero-gravel', brand: 'cervelo', model: 'Áspero', discipline: 'gravel', sizes: [] },
  { id: 'cervelo-zht5-mtb', brand: 'cervelo', model: 'ZHT-5', discipline: 'mtb', sizes: [], note: 'Cervélos første MTB (lanceret 2022), karbon XC-hardtail' },

  // ---------------------------------------------------------------------
  // Cube
  // ---------------------------------------------------------------------
  { id: 'cube-attain-landevej', brand: 'cube', model: 'Attain', discipline: 'landevej', sizes: [] },
  { id: 'cube-nuroad-gravel', brand: 'cube', model: 'Nuroad', discipline: 'gravel', sizes: [] },
  { id: 'cube-reaction-mtb', brand: 'cube', model: 'Reaction', discipline: 'mtb', sizes: [] },

  // ---------------------------------------------------------------------
  // Canyon
  // ---------------------------------------------------------------------
  {
    id: 'canyon-ultimate-landevej',
    brand: 'canyon',
    model: 'Ultimate',
    discipline: 'landevej',
    sizes: CANYON_PPS,
    note: 'Canyons fælles PPS-størrelsessystem (højde + skridtmål)',
  },
  {
    id: 'canyon-grail-gravel',
    brand: 'canyon',
    model: 'Grail',
    discipline: 'gravel',
    sizes: CANYON_PPS,
    note: 'Canyons fælles PPS-størrelsessystem (højde + skridtmål)',
  },
  {
    id: 'canyon-neuron-mtb',
    brand: 'canyon',
    model: 'Neuron',
    discipline: 'mtb',
    sizes: sizes(['S', 167, 175], ['M', 173, 181], ['L', 179, 187]),
    note: 'Kun S/M/L bekræftet for denne model — evt. XS/XL findes muligvis også',
  },

  // ---------------------------------------------------------------------
  // Bianchi
  // ---------------------------------------------------------------------
  { id: 'bianchi-infinito-landevej', brand: 'bianchi', model: 'Infinito', discipline: 'landevej', sizes: [] },
  { id: 'bianchi-impulso-gravel', brand: 'bianchi', model: 'Impulso', discipline: 'gravel', sizes: [] },
  { id: 'bianchi-methanolcv-mtb', brand: 'bianchi', model: 'Methanol CV', discipline: 'mtb', sizes: [] },
]

export function bikeModelLabel(p: BikeModelPreset): string {
  return `${BIKE_BRAND_LABELS[p.brand]} ${p.model}`
}

export function recommendedSize(preset: BikeModelPreset, heightCm: number): BikeSizeRow | undefined {
  if (preset.sizes.length === 0) return undefined
  return (
    preset.sizes.find((s) => heightCm >= s.heightMinCm && heightCm <= s.heightMaxCm) ??
    preset.sizes.find((s) => heightCm < s.heightMinCm) ??
    preset.sizes[preset.sizes.length - 1]
  )
}
