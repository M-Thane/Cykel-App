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
  | 'wilier'

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
  wilier: 'Wilier',
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

function model(
  id: string,
  brand: BikeMakeBrand,
  modelName: string,
  discipline: BikeModelDiscipline,
  note?: string,
): BikeModelPreset {
  return { id, brand, model: modelName, discipline, sizes: [], note }
}

// Canyon's shared "PPS" height/inseam sizing system, reused across its model lines.
// Third-party aggregated approximation, not fetched directly from canyon.com — kept
// only on the two models where it was corroborated closely enough to be useful.
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
  // ===========================================================================
  // Giant
  // ===========================================================================
  {
    id: 'giant-tcr-landevej',
    brand: 'giant',
    model: 'TCR Advanced',
    discipline: 'landevej',
    sizes: sizes(['XS', 157, 169], ['S', 165, 175], ['M', 171, 181], ['M/L', 177, 187], ['L', 183, 193], ['XL', 189, 199]),
    note: 'Klatring/race',
  },
  model('giant-propel-landevej', 'giant', 'Propel Advanced', 'landevej', 'Aero race'),
  model('giant-defy-landevej', 'giant', 'Defy Advanced', 'landevej', 'Endurance/komfort'),
  model('giant-contend-landevej', 'giant', 'Contend', 'landevej', 'Alu entry-level'),
  model('giant-revolt-gravel', 'giant', 'Revolt Advanced', 'gravel', 'Alsidig grus'),
  model('giant-revoltx-gravel', 'giant', 'Revolt X', 'gravel', 'Affjedret adventure-grus'),
  model('giant-anthem-mtb', 'giant', 'Anthem', 'mtb', 'XC fuldaffjedret'),
  model('giant-xtcadvanced-mtb', 'giant', 'XTC Advanced', 'mtb', 'XC hardtail'),
  model('giant-trance-mtb', 'giant', 'Trance', 'mtb', 'Alsidig trail, 120mm'),
  model('giant-trancex-mtb', 'giant', 'Trance X', 'mtb', 'Mere aggressiv trail-søster til Trance'),
  model('giant-stance-mtb', 'giant', 'Stance', 'mtb', 'Budget fuldaffjedret trail'),
  model('giant-reign-mtb', 'giant', 'Reign', 'mtb', 'Enduro'),
  model('giant-glory-mtb', 'giant', 'Glory Advanced', 'mtb', 'Downhill'),
  model('giant-talon-mtb', 'giant', 'Talon', 'mtb', 'Entry-level hardtail'),
  model('giant-fathom-mtb', 'giant', 'Fathom', 'mtb', 'Alu trail-hardtail'),
  model('giant-trancee-mtb', 'giant', 'Trance E+', 'mtb', 'El-trail'),
  model('giant-trancexe-mtb', 'giant', 'Trance X E+', 'mtb', 'El-trail, mere aggressiv'),
  model('giant-reigne-mtb', 'giant', 'Reign E+', 'mtb', 'El-enduro'),
  model('giant-stancee-mtb', 'giant', 'Stance E+', 'mtb', 'Budget el-trail'),
  model('giant-talone-mtb', 'giant', 'Talon E+', 'mtb', 'El-hardtail'),

  // ===========================================================================
  // Trek
  // ===========================================================================
  model('trek-madone-landevej', 'trek', 'Madone', 'landevej', 'Aero race — dækker nu også let klatring efter Émonda blev udfaset'),
  { id: 'trek-domane-landevej', brand: 'trek', model: 'Domane SL', discipline: 'landevej', sizes: [], note: 'Endurance/komfort' },
  model('trek-speedconcept-landevej', 'trek', 'Speed Concept', 'landevej', 'Tempo/triatlon'),
  { id: 'trek-checkpoint-gravel', brand: 'trek', model: 'Checkpoint SL', discipline: 'gravel', sizes: [], note: 'Alsidig adventure-grus' },
  model('trek-checkmate-gravel', 'trek', 'Checkmate', 'gravel', 'Race-grus'),
  model('trek-boone-gravel', 'trek', 'Boone', 'gravel', 'Cyclocross'),
  model('trek-supercaliber-mtb', 'trek', 'Supercaliber', 'mtb', 'XC race, fuldaffjedret'),
  model('trek-topfuel-mtb', 'trek', 'Top Fuel', 'mtb', 'XC/trail downcountry'),
  model('trek-procaliber-mtb', 'trek', 'Procaliber', 'mtb', 'XC hardtail'),
  model('trek-marlin-mtb', 'trek', 'Marlin', 'mtb', 'Entry-level hardtail'),
  { id: 'trek-fuelex-mtb', brand: 'trek', model: 'Fuel EX', discipline: 'mtb', sizes: [], note: 'Alsidig trail' },
  model('trek-roscoe-mtb', 'trek', 'Roscoe', 'mtb', 'Legesyg trail-hardtail'),
  model('trek-slash-mtb', 'trek', 'Slash', 'mtb', 'Enduro'),
  model('trek-session-mtb', 'trek', 'Session', 'mtb', 'Downhill'),
  model('trek-farley-mtb', 'trek', 'Farley', 'mtb', 'Fatbike'),
  model('trek-fuelexe-mtb', 'trek', 'Fuel EXe', 'mtb', 'Let el-trail (TQ-motor)'),
  model('trek-rail-mtb', 'trek', 'Rail', 'mtb', 'Fuld-kraft el-trail/enduro (Bosch)'),
  model('trek-powerfly-mtb', 'trek', 'Powerfly', 'mtb', 'El-MTB, hardtail og fuldaffjedret'),

  // ===========================================================================
  // Specialized
  // ===========================================================================
  {
    id: 'specialized-tarmacsl8-landevej',
    brand: 'specialized',
    model: 'Tarmac SL8',
    discipline: 'landevej',
    sizes: sizes(['44', 142, 155], ['49', 155, 163], ['52', 163, 170], ['54', 170, 175], ['56', 175, 180], ['58', 180, 188], ['61', 188, 196]),
  },
  model('specialized-tarmacsl9-landevej', 'specialized', 'Tarmac SL9', 'landevej', 'Nyeste generation aero/all-round race'),
  model('specialized-aethos-landevej', 'specialized', 'Aethos', 'landevej', 'Let, ikke-aero "ren" race'),
  model('specialized-roubaix-landevej', 'specialized', 'Roubaix SL8', 'landevej', 'Endurance/komfort, Future Shock'),
  model('specialized-allez-landevej', 'specialized', 'Allez', 'landevej', 'Alu entry-level race'),
  model('specialized-allezsprint-landevej', 'specialized', 'Allez Sprint', 'landevej', 'Aero alu sprint/kriterium'),
  model('specialized-shiv-landevej', 'specialized', 'Shiv', 'landevej', 'Tempo/triatlon'),
  {
    id: 'specialized-diverge4-gravel',
    brand: 'specialized',
    model: 'Diverge 4',
    discipline: 'gravel',
    sizes: sizes(['49', 152, 163], ['52', 163, 170], ['54', 170, 178], ['56', 175, 180], ['58', 180, 188], ['61', 188, 196]),
    note: 'Producentens tabel har et lille overlap mellem 54 og 56 — dobbelttjek ved grænsehøjder',
  },
  model('specialized-crux-gravel', 'specialized', 'Crux', 'gravel', 'Let race-grus'),
  model('specialized-turbocreosl-gravel', 'specialized', 'Turbo Creo SL EVO', 'gravel', 'Let el-grus'),
  model('specialized-epic-mtb', 'specialized', 'Epic', 'mtb', 'XC race, fuldaffjedret'),
  model('specialized-epicht-mtb', 'specialized', 'Epic Hardtail', 'mtb', 'XC race hardtail'),
  {
    id: 'specialized-stumpjumper15-mtb',
    brand: 'specialized',
    model: 'Stumpjumper 15',
    discipline: 'mtb',
    sizes: sizes(['S1', 150, 160], ['S2', 157, 173], ['S3', 165, 180], ['S4', 173, 188], ['S5', 178, 193], ['S6', 188, 203]),
    note: 'S-Sizing er ikke skridtmål-baseret — vælg efter både højde og foretrukken kørestil',
  },
  model('specialized-enduro-mtb', 'specialized', 'Enduro', 'mtb', 'Langt slag enduro'),
  model('specialized-chisel-mtb', 'specialized', 'Chisel', 'mtb', 'Budget alu XC, fuldaffjedret'),
  model('specialized-chiselht-mtb', 'specialized', 'Chisel Hardtail', 'mtb', 'Budget alu XC hardtail'),
  model('specialized-status-mtb', 'specialized', 'Status', 'mtb', 'Budget gravity/park'),
  model('specialized-demo-mtb', 'specialized', 'Demo', 'mtb', 'Downhill'),
  model('specialized-rockhopper-mtb', 'specialized', 'Rockhopper', 'mtb', 'Alu trail-hardtail'),
  model('specialized-fuse-mtb', 'specialized', 'Fuse', 'mtb', 'Trail/dirt-hardtail, brede dæk'),
  model('specialized-turbolevo-mtb', 'specialized', 'Turbo Levo', 'mtb', 'Fuld-kraft el-trail'),
  model('specialized-turbolevosl-mtb', 'specialized', 'Turbo Levo SL', 'mtb', 'Let el-trail'),
  model('specialized-turbokenevosl-mtb', 'specialized', 'Turbo Kenevo SL', 'mtb', 'Let el-gravity'),

  // ===========================================================================
  // Merida
  // ===========================================================================
  model('merida-reacto-landevej', 'merida', 'Reacto', 'landevej', 'Aero race'),
  { id: 'merida-scultura-landevej', brand: 'merida', model: 'Scultura', discipline: 'landevej', sizes: [], note: 'Alsidig race' },
  model('merida-sculturaendurance-landevej', 'merida', 'Scultura Endurance', 'landevej', 'Endurance/komfort'),
  model('merida-timewarp-landevej', 'merida', 'Time Warp', 'landevej', 'Tempo/triatlon'),
  { id: 'merida-silex-gravel', brand: 'merida', model: 'Silex', discipline: 'gravel', sizes: [], note: 'Adventure/bikepacking-grus' },
  model('merida-mission-gravel', 'merida', 'Mission', 'gravel', 'Race-grus/all-road'),
  model('merida-bignine-mtb', 'merida', 'Big.Nine', 'mtb', '29" XC hardtail'),
  model('merida-bigseven-mtb', 'merida', 'Big.Seven', 'mtb', '27.5" XC hardtail'),
  model('merida-bigtrail-mtb', 'merida', 'Big.Trail', 'mtb', '29" trail-hardtail'),
  { id: 'merida-ninetysix-mtb', brand: 'merida', model: 'Ninety-Six', discipline: 'mtb', sizes: [], note: 'XC/maraton, fuldaffjedret' },
  model('merida-onetwenty-mtb', 'merida', 'One-Twenty', 'mtb', 'Kort trail, fuldaffjedret'),
  model('merida-oneforty-mtb', 'merida', 'One-Forty', 'mtb', 'Mellemlangt trail, fuldaffjedret'),
  model('merida-onesixty-mtb', 'merida', 'One-Sixty', 'mtb', 'Enduro'),
  model('merida-ebignine-mtb', 'merida', 'eBig.Nine', 'mtb', 'El-hardtail XC/trail'),
  model('merida-eoneforty-mtb', 'merida', 'eONE-FORTY', 'mtb', 'El-trail, fuldaffjedret'),
  model('merida-eonesixty-mtb', 'merida', 'eONE-SIXTY', 'mtb', 'El-enduro'),
  model('merida-eoneeighty-mtb', 'merida', 'eONE-EIGHTY', 'mtb', 'El-gravity/freeride'),

  // ===========================================================================
  // Cannondale
  // ===========================================================================
  {
    id: 'cannondale-supersixevo-landevej',
    brand: 'cannondale',
    model: 'SuperSix EVO',
    discipline: 'landevej',
    sizes: sizes(['44', 154, 165], ['48', 160, 170], ['51', 165, 175], ['54', 170, 180], ['56', 177, 185], ['58', 182, 193], ['61', 190, 200]),
  },
  model('cannondale-synapse-landevej', 'cannondale', 'Synapse', 'landevej', 'Endurance/komfort'),
  model('cannondale-caad13-landevej', 'cannondale', 'CAAD13', 'landevej', 'Alu race'),
  model('cannondale-caadoptimo-landevej', 'cannondale', 'CAAD Optimo', 'landevej', 'Alu entry-level'),
  { id: 'cannondale-topstone-gravel', brand: 'cannondale', model: 'Topstone', discipline: 'gravel', sizes: [], note: 'Adventure-grus, Kingpin-affjedring' },
  model('cannondale-superx-gravel', 'cannondale', 'SuperX', 'gravel', 'Race-grus/cyclocross'),
  model('cannondale-scalpel-mtb', 'cannondale', 'Scalpel', 'mtb', 'XC race, fuldaffjedret'),
  model('cannondale-scalpelht-mtb', 'cannondale', 'Scalpel HT', 'mtb', 'XC/maraton hardtail'),
  model('cannondale-habit-mtb', 'cannondale', 'Habit', 'mtb', 'Alsidig trail'),
  model('cannondale-jekyll-mtb', 'cannondale', 'Jekyll', 'mtb', 'Enduro, high-pivot'),
  model('cannondale-badhabit-mtb', 'cannondale', 'Bad Habit', 'mtb', 'Aggressiv all-mountain'),
  model('cannondale-trail-mtb', 'cannondale', 'Trail', 'mtb', 'Entry-level alu hardtail'),
  model('cannondale-moterra-mtb', 'cannondale', 'Moterra', 'mtb', 'Fuld-kraft el-trail (Bosch)'),
  model('cannondale-moterrasl-mtb', 'cannondale', 'Moterra SL', 'mtb', 'Let el-trail'),

  // ===========================================================================
  // Scott
  // ===========================================================================
  model('scott-addictrc-landevej', 'scott', 'Addict RC', 'landevej', 'Let race-flagskib'),
  model('scott-addict-landevej', 'scott', 'Addict', 'landevej', 'All-road/endurance'),
  model('scott-foilrc-landevej', 'scott', 'Foil RC', 'landevej', 'Aero race'),
  model('scott-speedster-landevej', 'scott', 'Speedster', 'landevej', 'Alu entry-level'),
  model('scott-addictgravel-gravel', 'scott', 'Addict Gravel', 'gravel', 'Flagskib adventure-grus'),
  model('scott-speedstergravel-gravel', 'scott', 'Speedster Gravel', 'gravel', 'Alu entry-level grus'),
  model('scott-scalegravel-gravel', 'scott', 'Scale Gravel', 'gravel', 'Flatbar, MTB-afledt grus-race'),
  model('scott-solacegravel-gravel', 'scott', 'Solace Gravel', 'gravel', 'Sælges pt. kun som el-cykel (eRIDE)'),
  model('scott-spark-mtb', 'scott', 'Spark', 'mtb', 'XC/downcountry, fuldaffjedret'),
  model('scott-scale-mtb', 'scott', 'Scale', 'mtb', 'XC race hardtail'),
  model('scott-genius-mtb', 'scott', 'Genius', 'mtb', 'Alsidig trail'),
  model('scott-ransom-mtb', 'scott', 'Ransom', 'mtb', 'Enduro'),
  model('scott-gambler-mtb', 'scott', 'Gambler', 'mtb', 'Downhill'),
  model('scott-aspect-mtb', 'scott', 'Aspect', 'mtb', 'Entry-level alu hardtail'),
  model('scott-voltage-mtb', 'scott', 'Voltage eRIDE', 'mtb', 'Let el-enduro/all-mountain'),
  model('scott-patron-mtb', 'scott', 'Patron eRIDE', 'mtb', 'Fuld-kraft el-MTB (Bosch)'),
  model('scott-lumen-mtb', 'scott', 'Lumen eRIDE', 'mtb', 'Let el-downcountry'),

  // ===========================================================================
  // Cervélo
  // ===========================================================================
  model('cervelo-s5-landevej', 'cervelo', 'S5', 'landevej', 'Aero race'),
  model('cervelo-r5-landevej', 'cervelo', 'R5', 'landevej', 'Let klatring/all-round race'),
  model('cervelo-soloist-landevej', 'cervelo', 'Soloist', 'landevej', 'All-rounder mellem S5 og R5'),
  model('cervelo-caledonia-landevej', 'cervelo', 'Caledonia', 'landevej', 'Endurance/all-road'),
  model('cervelo-caledonia5-landevej', 'cervelo', 'Caledonia-5', 'landevej', 'Race-udgave af Caledonia'),
  model('cervelo-r5cx-gravel', 'cervelo', 'R5-CX', 'gravel', 'Cyclocross'),
  model('cervelo-p5-landevej', 'cervelo', 'P5', 'landevej', 'Tempo/triatlon, flagskib'),
  model('cervelo-pseries-landevej', 'cervelo', 'P-Series', 'landevej', 'Tempo/triatlon, mellemklasse'),
  { id: 'cervelo-aspero-gravel', brand: 'cervelo', model: 'Áspero', discipline: 'gravel', sizes: [], note: 'Race-grus' },
  model('cervelo-aspero5-gravel', 'cervelo', 'Áspero-5', 'gravel', 'Aero-fokuseret race-grus'),
  { id: 'cervelo-zht5-mtb', brand: 'cervelo', model: 'ZHT-5', discipline: 'mtb', sizes: [], note: 'Cervélos eneste MTB (siden 2022), karbon XC-hardtail' },

  // ===========================================================================
  // Cube
  // ===========================================================================
  model('cube-litening-landevej', 'cube', 'Litening', 'landevej', 'Race/aero'),
  model('cube-agree-landevej', 'cube', 'Agree', 'landevej', 'Endurance'),
  { id: 'cube-attain-landevej', brand: 'cube', model: 'Attain', discipline: 'landevej', sizes: [], note: 'Entry-level' },
  { id: 'cube-nuroad-gravel', brand: 'cube', model: 'Nuroad', discipline: 'gravel', sizes: [], note: 'Landevej-til-grus bro-cykel' },
  model('cube-reaction-mtb', 'cube', 'Reaction', 'mtb', 'Alsidig trail-hardtail'),
  model('cube-analog-mtb', 'cube', 'Analog', 'mtb', 'Robust all-round hardtail'),
  model('cube-accessws-mtb', 'cube', 'Access WS', 'mtb', 'Hardtail, dame-geometri'),
  model('cube-acid-mtb', 'cube', 'Acid', 'mtb', 'Entry-level hardtail'),
  model('cube-attention-mtb', 'cube', 'Attention', 'mtb', 'Entry-level hardtail'),
  model('cube-aim-mtb', 'cube', 'Aim', 'mtb', 'Entry-level hardtail'),
  model('cube-ams-mtb', 'cube', 'AMS', 'mtb', 'Let maraton/XC, fuldaffjedret'),
  model('cube-stereo-mtb', 'cube', 'Stereo', 'mtb', 'Trail/all-mountain, fuldaffjedret'),
  model('cube-fritzz-mtb', 'cube', 'Fritzz', 'mtb', 'Enduro, high-pivot'),
  model('cube-two15-mtb', 'cube', 'Two15', 'mtb', 'Downhill'),
  model('cube-stingws-mtb', 'cube', 'Sting WS', 'mtb', 'Trail, dame-geometri'),
  model('cube-reactionhybrid-mtb', 'cube', 'Reaction Hybrid', 'mtb', 'El-hardtail'),
  model('cube-stereohybrid-mtb', 'cube', 'Stereo Hybrid', 'mtb', 'El-trail, fuldaffjedret'),
  model('cube-amshybrid-mtb', 'cube', 'AMS Hybrid', 'mtb', 'Let el-fuldaffjedret'),

  // ===========================================================================
  // Canyon
  // ===========================================================================
  {
    id: 'canyon-ultimate-landevej',
    brand: 'canyon',
    model: 'Ultimate',
    discipline: 'landevej',
    sizes: CANYON_PPS,
    note: 'Canyons fælles PPS-størrelsessystem (højde + skridtmål)',
  },
  model('canyon-aeroad-landevej', 'canyon', 'Aeroad', 'landevej', 'Aero race'),
  model('canyon-endurace-landevej', 'canyon', 'Endurace', 'landevej', 'Endurance/komfort'),
  model('canyon-speedmax-landevej', 'canyon', 'Speedmax', 'landevej', 'Tempo/triatlon'),
  {
    id: 'canyon-grail-gravel',
    brand: 'canyon',
    model: 'Grail',
    discipline: 'gravel',
    sizes: CANYON_PPS,
    note: 'Canyons fælles PPS-størrelsessystem (højde + skridtmål)',
  },
  model('canyon-grizl-gravel', 'canyon', 'Grizl', 'gravel', 'Bikepacking/adventure-grus'),
  model('canyon-grailon-gravel', 'canyon', 'Grail:ON', 'gravel', 'El-grus'),
  {
    id: 'canyon-neuron-mtb',
    brand: 'canyon',
    model: 'Neuron',
    discipline: 'mtb',
    sizes: sizes(['S', 167, 175], ['M', 173, 181], ['L', 179, 187]),
    note: 'Kun S/M/L bekræftet for denne model — evt. XS/XL findes muligvis også',
  },
  model('canyon-spectral-mtb', 'canyon', 'Spectral', 'mtb', 'Alsidig trail'),
  model('canyon-lux-mtb', 'canyon', 'Lux', 'mtb', 'XC race, fuldaffjedret'),
  model('canyon-grandcanyon-mtb', 'canyon', 'Grand Canyon', 'mtb', 'Entry-level alu hardtail'),
  model('canyon-exceed-mtb', 'canyon', 'Exceed', 'mtb', 'Let XC hardtail'),
  model('canyon-stoic-mtb', 'canyon', 'Stoic', 'mtb', 'Robust alu hardtail'),
  model('canyon-torque-mtb', 'canyon', 'Torque', 'mtb', 'Enduro/freeride, flagskib gravity'),
  model('canyon-sender-mtb', 'canyon', 'Sender', 'mtb', 'Downhill'),
  model('canyon-spectralon-mtb', 'canyon', 'Spectral:ON', 'mtb', 'Fuld-kraft el-trail'),
  model('canyon-torqueon-mtb', 'canyon', 'Torque:ON', 'mtb', 'El-enduro/freeride'),
  model('canyon-neuronon-mtb', 'canyon', 'Neuron:ON', 'mtb', 'El-trail'),
  model('canyon-grandcanyonon-mtb', 'canyon', 'Grand Canyon:ON', 'mtb', 'El-hardtail'),
  model('canyon-striveon-mtb', 'canyon', 'Strive:ON', 'mtb', 'El-enduro'),

  // ===========================================================================
  // Bianchi
  // ===========================================================================
  model('bianchi-oltre-landevej', 'bianchi', 'Oltre', 'landevej', 'Aero race-flagskib'),
  model('bianchi-specialissima-landevej', 'bianchi', 'Specialissima', 'landevej', 'Let klatring'),
  { id: 'bianchi-infinito-landevej', brand: 'bianchi', model: 'Infinito', discipline: 'landevej', sizes: [], note: 'Endurance/all-road, nyredesignet 2026' },
  model('bianchi-sprint-landevej', 'bianchi', 'Sprint', 'landevej', 'Mellemklasse all-rounder'),
  model('bianchi-aquilarc-landevej', 'bianchi', 'Aquila RC', 'landevej', 'Tempo/triatlon'),
  { id: 'bianchi-impulso-gravel', brand: 'bianchi', model: 'Impulso', discipline: 'gravel', sizes: [], note: 'Race-orienteret grus' },
  model('bianchi-arcadex-gravel', 'bianchi', 'Arcadex', 'gravel', 'Adventure/all-road, karbon'),
  model('bianchi-arcadexal-gravel', 'bianchi', 'Arcadex AL', 'gravel', 'Alu-udgave af Arcadex'),
  model('bianchi-vianirone7-gravel', 'bianchi', 'Via Nirone 7', 'gravel', 'Entry-level — er ved at blive flyttet fra landevej til grus i sortimentet'),
  { id: 'bianchi-methanolcv-mtb', brand: 'bianchi', model: 'Methanol CV', discipline: 'mtb', sizes: [], note: 'XC-flagskib, hardtail og fuldaffjedret' },
  model('bianchi-magma-mtb', 'bianchi', 'Magma', 'mtb', 'Alu XC hardtail'),
  model('bianchi-nitron-mtb', 'bianchi', 'Nitron', 'mtb', 'Karbon XC hardtail, budgetorienteret'),
  model('bianchi-grizzly-mtb', 'bianchi', 'Grizzly', 'mtb', 'Alu XC hardtail'),

  // ===========================================================================
  // Wilier
  // ===========================================================================
  model('wilier-filanteslr-landevej', 'wilier', 'Filante SLR', 'landevej', 'Aero race-flagskib'),
  model('wilier-verticaleslr-landevej', 'wilier', 'Verticale SLR', 'landevej', 'Let klatring'),
  model('wilier-granturismoslr-landevej', 'wilier', 'Granturismo SLR', 'landevej', 'Endurance/komfort'),
  model('wilier-cento10sl-landevej', 'wilier', 'Cento10 SL', 'landevej', 'Aero race, mellemklasse'),
  model('wilier-garda-landevej', 'wilier', 'Garda', 'landevej', 'Entry-level karbon'),
  model('wilier-raveslr-gravel', 'wilier', 'Rave SLR', 'gravel', 'Aero race-grus'),
  model('wilier-jena-gravel', 'wilier', 'Jena', 'gravel', 'All-road/alsidig, 700c og 650b'),
  model('wilier-jareen-gravel', 'wilier', 'Jareen', 'gravel', 'Entry-level alu'),
  model('wilier-jaroon-gravel', 'wilier', 'Jaroon', 'gravel', 'All-road/adventure, alu'),
  model('wilier-adlar-gravel', 'wilier', 'Adlar', 'gravel', 'Bikepacking/adventure, MTB-inspireret geometri'),
  model('wilier-urtaslr-mtb', 'wilier', 'Urta SLR', 'mtb', 'XC race, fuldaffjedret'),
  model('wilier-urtamaxslr-mtb', 'wilier', 'Urta Max SLR', 'mtb', 'Maraton/teknisk XC, fuldaffjedret'),
  model('wilier-usmaslr-mtb', 'wilier', 'Usma SLR', 'mtb', 'XC race hardtail'),
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
