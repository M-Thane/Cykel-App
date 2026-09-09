export type Brand = 'sram' | 'shimano' | 'campagnolo'
export type GroupsetDiscipline = 'landevej' | 'gravel' | 'mtb'

export const BRAND_LABELS: Record<Brand, string> = {
  sram: 'SRAM',
  shimano: 'Shimano',
  campagnolo: 'Campagnolo',
}

export interface GroupsetPreset {
  id: string
  brand: Brand
  tier: string
  discipline: GroupsetDiscipline
  /** Each entry is one officially offered chainring combo, e.g. [50, 37] for 2x or [40] for 1x. */
  chainringOptions: number[][]
  /** Each entry is the full, exact cog-by-cog tooth progression of one officially offered cassette. */
  cassetteOptions: number[][]
  note?: string
}

// ---- Shared cassette tooth progressions (avoid repeating long arrays) ----

// SRAM road/gravel (XDR), 12-speed X-Range — identical progressions across Red/Force/Rival tiers
const SRAM_1028 = [10, 11, 12, 13, 14, 15, 16, 17, 19, 21, 24, 28]
const SRAM_1030 = [10, 11, 12, 13, 14, 15, 17, 19, 21, 24, 27, 30]
const SRAM_1033 = [10, 11, 12, 13, 14, 15, 17, 19, 21, 24, 28, 33]
const SRAM_1036 = [10, 11, 12, 13, 15, 17, 19, 21, 24, 28, 32, 36]
// SRAM XPLR 13-speed, 10-46T — shared across Red/Force/Rival XPLR
const SRAM_XPLR_1046 = [10, 11, 12, 13, 15, 17, 19, 21, 24, 28, 32, 38, 46]
// SRAM Apex XPLR, older 12-speed platform
const SRAM_APEX_XPLR_1044 = [10, 11, 13, 15, 17, 19, 21, 24, 28, 32, 38, 44]
const SRAM_APEX_XPLR_1144 = [11, 12, 13, 15, 17, 19, 21, 24, 28, 32, 38, 44]
// SRAM Eagle Transmission 12-speed, 10-52T — shared across XX SL/XX/X0/GX
const SRAM_EAGLE_1052 = [10, 12, 14, 16, 18, 21, 24, 28, 32, 38, 44, 52]
// SRAM NX Eagle (mechanical, standard driver), 11-50T
const SRAM_NX_1150 = [11, 13, 15, 17, 19, 22, 25, 28, 32, 36, 42, 50]

// Shimano road, 12-speed — shared across Dura-Ace/Ultegra (11-30, 11-34) and 105 (11-34, 11-36)
const SHI_1130 = [11, 12, 13, 14, 15, 16, 17, 19, 21, 24, 27, 30]
const SHI_1134 = [11, 12, 13, 14, 15, 17, 19, 21, 24, 27, 30, 34]
const SHI_1136 = [11, 12, 13, 14, 15, 17, 19, 21, 24, 28, 32, 36]
// Shimano Tiagra, 10-speed
const SHI_TIA_1125 = [11, 12, 13, 14, 15, 17, 19, 21, 23, 25]
const SHI_TIA_1228 = [12, 13, 14, 15, 17, 19, 21, 23, 25, 28]
const SHI_TIA_1132 = [11, 12, 14, 16, 18, 20, 22, 25, 28, 32]
const SHI_TIA_1134 = [11, 13, 15, 17, 19, 21, 23, 26, 30, 34]
// Shimano MTB Micro Spline, 12-speed — shared across XTR/XT/SLX; Deore only offers 10-51T
const SHI_MTB_1045 = [10, 12, 14, 16, 18, 21, 24, 28, 32, 36, 40, 45]
const SHI_MTB_1051 = [10, 12, 14, 16, 18, 21, 24, 28, 33, 39, 45, 51]

// Campagnolo road 13-speed — shared across Super Record 13 / Record 13
const CAM_SR13_1132 = [11, 12, 13, 14, 15, 16, 17, 18, 20, 23, 26, 29, 32]
const CAM_SR13_1033 = [10, 11, 12, 13, 14, 15, 16, 18, 20, 23, 26, 29, 33]
const CAM_SR13_1136 = [11, 12, 13, 14, 15, 16, 18, 20, 23, 26, 29, 32, 36]
// Campagnolo Chorus, 12-speed
const CAM_CHO_1129 = [11, 12, 13, 14, 15, 16, 17, 19, 21, 23, 26, 29]
const CAM_CHO_1132 = [11, 12, 13, 14, 15, 16, 17, 19, 22, 25, 28, 32]
const CAM_CHO_1134 = [11, 12, 13, 14, 15, 16, 17, 19, 22, 25, 29, 34]
// Campagnolo Centaur (discontinued), 11-speed
const CAM_CEN_1129 = [11, 12, 13, 14, 15, 17, 19, 21, 23, 26, 29]
const CAM_CEN_1132 = [11, 12, 13, 14, 15, 17, 19, 22, 25, 28, 32]
// Campagnolo Super Record X / Record X, 13-speed gravel
const CAM_SRX_942 = [9, 10, 11, 12, 13, 14, 16, 18, 21, 25, 30, 36, 42]
const CAM_SRX_1048 = [10, 11, 12, 13, 14, 16, 18, 21, 25, 30, 36, 42, 48]
// Campagnolo Ekar / Ekar GT, 13-speed gravel
const CAM_EKAR_936 = [9, 10, 11, 12, 13, 14, 16, 18, 20, 23, 27, 31, 36]
const CAM_EKAR_942 = [9, 10, 11, 12, 13, 14, 16, 18, 21, 25, 30, 36, 42]
const CAM_EKAR_1044 = [10, 11, 12, 13, 14, 15, 17, 19, 22, 26, 32, 39, 44]

export const GROUPSET_PRESETS: GroupsetPreset[] = [
  // ---------------------------------------------------------------------
  // SRAM — Landevej (2x AXS road)
  // ---------------------------------------------------------------------
  {
    id: 'sram-red-landevej',
    brand: 'sram',
    tier: 'Red AXS',
    discipline: 'landevej',
    chainringOptions: [
      [46, 33],
      [48, 35],
      [50, 37],
    ],
    cassetteOptions: [SRAM_1028, SRAM_1030, SRAM_1033, SRAM_1036],
  },
  {
    id: 'sram-force-landevej',
    brand: 'sram',
    tier: 'Force AXS',
    discipline: 'landevej',
    chainringOptions: [
      [46, 33],
      [48, 35],
      [50, 37],
      [43, 30],
    ],
    cassetteOptions: [SRAM_1028, SRAM_1030, SRAM_1033, SRAM_1036],
    note: '43/30 er "Force Wide" til brede dæk/let grus',
  },
  {
    id: 'sram-rival-landevej',
    brand: 'sram',
    tier: 'Rival AXS',
    discipline: 'landevej',
    chainringOptions: [
      [46, 33],
      [48, 35],
      [43, 30],
    ],
    cassetteOptions: [SRAM_1030, SRAM_1036],
    note: '43/30 er "Rival Wide" til brede dæk/let grus. Apex AXS findes ikke som 2x landevejsgruppe.',
  },

  // ---------------------------------------------------------------------
  // SRAM — Gravel (1x XPLR)
  // ---------------------------------------------------------------------
  {
    id: 'sram-red-gravel',
    brand: 'sram',
    tier: 'Red XPLR AXS',
    discipline: 'gravel',
    chainringOptions: [[38], [40], [42], [44], [46]],
    cassetteOptions: [SRAM_XPLR_1046],
  },
  {
    id: 'sram-force-gravel',
    brand: 'sram',
    tier: 'Force XPLR AXS',
    discipline: 'gravel',
    chainringOptions: [[38], [40], [42], [44], [46]],
    cassetteOptions: [SRAM_XPLR_1046],
  },
  {
    id: 'sram-rival-gravel',
    brand: 'sram',
    tier: 'Rival XPLR AXS',
    discipline: 'gravel',
    chainringOptions: [[38], [40], [42], [44], [46]],
    cassetteOptions: [SRAM_XPLR_1046],
  },
  {
    id: 'sram-apex-gravel',
    brand: 'sram',
    tier: 'Apex XPLR AXS',
    discipline: 'gravel',
    chainringOptions: [[38], [40], [42]],
    cassetteOptions: [SRAM_APEX_XPLR_1044, SRAM_APEX_XPLR_1144, SRAM_1036],
    note: 'Ældre 12-speed platform (ikke opdateret til 13-speed sammen med Red/Force/Rival XPLR)',
  },

  // ---------------------------------------------------------------------
  // SRAM — MTB (1x Eagle)
  // ---------------------------------------------------------------------
  {
    id: 'sram-xxsl-mtb',
    brand: 'sram',
    tier: 'XX SL / XX Eagle Transmission',
    discipline: 'mtb',
    chainringOptions: [[32], [34], [36], [38]],
    cassetteOptions: [SRAM_EAGLE_1052],
  },
  {
    id: 'sram-x0-mtb',
    brand: 'sram',
    tier: 'X0 Eagle Transmission',
    discipline: 'mtb',
    chainringOptions: [[30], [32], [34]],
    cassetteOptions: [SRAM_EAGLE_1052],
  },
  {
    id: 'sram-gx-mtb',
    brand: 'sram',
    tier: 'GX Eagle Transmission',
    discipline: 'mtb',
    chainringOptions: [[30], [32], [34]],
    cassetteOptions: [SRAM_EAGLE_1052],
  },
  {
    id: 'sram-nx-mtb',
    brand: 'sram',
    tier: 'NX Eagle',
    discipline: 'mtb',
    chainringOptions: [[30], [32], [34]],
    cassetteOptions: [SRAM_NX_1150],
    note: 'Mekanisk, almindelig gearhus (ikke trådløs Transmission som XX SL/XX/X0/GX)',
  },

  // ---------------------------------------------------------------------
  // Shimano — Landevej (2x)
  // ---------------------------------------------------------------------
  {
    id: 'shimano-duraace-landevej',
    brand: 'shimano',
    tier: 'Dura-Ace R9200',
    discipline: 'landevej',
    chainringOptions: [
      [50, 34],
      [52, 36],
      [54, 40],
    ],
    cassetteOptions: [SHI_1130, SHI_1134],
  },
  {
    id: 'shimano-ultegra-landevej',
    brand: 'shimano',
    tier: 'Ultegra R8100',
    discipline: 'landevej',
    chainringOptions: [
      [50, 34],
      [52, 36],
    ],
    cassetteOptions: [SHI_1130, SHI_1134],
  },
  {
    id: 'shimano-105-landevej',
    brand: 'shimano',
    tier: '105 R7100',
    discipline: 'landevej',
    chainringOptions: [
      [50, 34],
      [52, 36],
    ],
    cassetteOptions: [SHI_1134, SHI_1136],
  },
  {
    id: 'shimano-tiagra-landevej',
    brand: 'shimano',
    tier: 'Tiagra 4700',
    discipline: 'landevej',
    chainringOptions: [
      [50, 34],
      [52, 36],
      [48, 34],
    ],
    cassetteOptions: [SHI_TIA_1125, SHI_TIA_1228, SHI_TIA_1132, SHI_TIA_1134],
    note: '10-speed (et gear mindre end de øvrige Shimano-niveauer)',
  },

  // ---------------------------------------------------------------------
  // Shimano — Gravel (GRX)
  // ---------------------------------------------------------------------
  {
    id: 'shimano-rx825-gravel-2x',
    brand: 'shimano',
    tier: 'GRX RX825 Di2 (2x)',
    discipline: 'gravel',
    chainringOptions: [[48, 31]],
    cassetteOptions: [SHI_1134, SHI_1136],
  },
  {
    id: 'shimano-rx820-gravel-1x',
    brand: 'shimano',
    tier: 'GRX RX820 (1x)',
    discipline: 'gravel',
    chainringOptions: [[40], [42]],
    cassetteOptions: [SHI_MTB_1045, SHI_MTB_1051],
    note: '1x bruger MTB Micro Spline-kassetter',
  },
  {
    id: 'shimano-rx820-gravel-2x',
    brand: 'shimano',
    tier: 'GRX RX820 (2x)',
    discipline: 'gravel',
    chainringOptions: [[48, 31]],
    cassetteOptions: [SHI_1134, SHI_1136],
  },
  {
    id: 'shimano-rx610-gravel-1x',
    brand: 'shimano',
    tier: 'GRX RX610 (1x)',
    discipline: 'gravel',
    chainringOptions: [[38], [40]],
    cassetteOptions: [SHI_MTB_1045, SHI_MTB_1051],
    note: '1x bruger MTB Micro Spline-kassetter',
  },
  {
    id: 'shimano-rx610-gravel-2x',
    brand: 'shimano',
    tier: 'GRX RX610 (2x)',
    discipline: 'gravel',
    chainringOptions: [[46, 30]],
    cassetteOptions: [SHI_1134, SHI_1136],
  },
  {
    id: 'shimano-rx400-gravel',
    brand: 'shimano',
    tier: 'GRX RX400 (2x)',
    discipline: 'gravel',
    chainringOptions: [[46, 30]],
    cassetteOptions: [SHI_TIA_1132, SHI_TIA_1134],
    note: '10-speed, deler kassetter med Tiagra',
  },

  // ---------------------------------------------------------------------
  // Shimano — MTB
  // ---------------------------------------------------------------------
  {
    id: 'shimano-xtr-mtb',
    brand: 'shimano',
    tier: 'XTR M9100',
    discipline: 'mtb',
    chainringOptions: [[30], [32], [34], [36], [38]],
    cassetteOptions: [SHI_MTB_1045, SHI_MTB_1051],
  },
  {
    id: 'shimano-xt-mtb',
    brand: 'shimano',
    tier: 'XT M8100',
    discipline: 'mtb',
    chainringOptions: [[28], [30], [32], [34], [36]],
    cassetteOptions: [SHI_MTB_1045, SHI_MTB_1051],
  },
  {
    id: 'shimano-slx-mtb',
    brand: 'shimano',
    tier: 'SLX M7100',
    discipline: 'mtb',
    chainringOptions: [[30], [32], [34]],
    cassetteOptions: [SHI_MTB_1045, SHI_MTB_1051],
  },
  {
    id: 'shimano-deore-mtb',
    brand: 'shimano',
    tier: 'Deore M6100',
    discipline: 'mtb',
    chainringOptions: [[30], [32]],
    cassetteOptions: [SHI_MTB_1051],
  },

  // ---------------------------------------------------------------------
  // Campagnolo — Landevej (2x)
  // ---------------------------------------------------------------------
  {
    id: 'campagnolo-superrecord-landevej',
    brand: 'campagnolo',
    tier: 'Super Record 13',
    discipline: 'landevej',
    chainringOptions: [[45, 29], [48, 32], [50, 34], [52, 36], [53, 39], [54, 39], [55, 39]],
    cassetteOptions: [CAM_SR13_1132, CAM_SR13_1033, CAM_SR13_1136],
  },
  {
    id: 'campagnolo-record-landevej',
    brand: 'campagnolo',
    tier: 'Record 13',
    discipline: 'landevej',
    chainringOptions: [[45, 29], [48, 32], [50, 34], [52, 36], [53, 39], [54, 39], [55, 39]],
    cassetteOptions: [CAM_SR13_1132, CAM_SR13_1033, CAM_SR13_1136],
  },
  {
    id: 'campagnolo-chorus-landevej',
    brand: 'campagnolo',
    tier: 'Chorus',
    discipline: 'landevej',
    chainringOptions: [
      [52, 36],
      [50, 34],
      [48, 32],
    ],
    cassetteOptions: [CAM_CHO_1129, CAM_CHO_1132, CAM_CHO_1134],
  },
  {
    id: 'campagnolo-centaur-landevej',
    brand: 'campagnolo',
    tier: 'Centaur',
    discipline: 'landevej',
    chainringOptions: [
      [52, 36],
      [50, 34],
    ],
    cassetteOptions: [CAM_CEN_1129, CAM_CEN_1132],
    note: 'Udgået fra Campagnolos nuværende sortiment — vist som reference for eksisterende cykler',
  },

  // ---------------------------------------------------------------------
  // Campagnolo — Gravel
  // ---------------------------------------------------------------------
  {
    id: 'campagnolo-superrecordx-gravel',
    brand: 'campagnolo',
    tier: 'Super Record X',
    discipline: 'gravel',
    chainringOptions: [[38], [40], [42], [44], [46], [48]],
    cassetteOptions: [CAM_SRX_942, CAM_SRX_1048],
    note: 'Kassette ikke kompatibel med Ekar/Ekar GT trods lignende tandtal',
  },
  {
    id: 'campagnolo-recordx-gravel',
    brand: 'campagnolo',
    tier: 'Record X',
    discipline: 'gravel',
    chainringOptions: [[38], [40], [42], [44], [46], [48]],
    cassetteOptions: [CAM_SRX_942, CAM_SRX_1048],
    note: 'Kassette ikke kompatibel med Ekar/Ekar GT trods lignende tandtal',
  },
  {
    id: 'campagnolo-ekargt-gravel',
    brand: 'campagnolo',
    tier: 'Ekar GT',
    discipline: 'gravel',
    chainringOptions: [[36], [38], [40], [42], [44]],
    cassetteOptions: [CAM_EKAR_936, CAM_EKAR_942, CAM_EKAR_1044, CAM_SRX_1048],
  },
  {
    id: 'campagnolo-ekar-gravel',
    brand: 'campagnolo',
    tier: 'Ekar',
    discipline: 'gravel',
    chainringOptions: [[38], [40], [42], [44]],
    cassetteOptions: [CAM_EKAR_936, CAM_EKAR_942, CAM_EKAR_1044],
  },

  // Campagnolo laver ikke MTB-gruppesæt — ingen presets for 'mtb'.
]

export function presetLabel(p: GroupsetPreset): string {
  return `${BRAND_LABELS[p.brand]} ${p.tier}`
}

export function chainringComboLabel(teeth: number[]): string {
  return teeth.join('/')
}

export function cassetteLabel(teeth: number[]): string {
  if (teeth.length === 0) return ''
  return `${teeth[0]}-${teeth[teeth.length - 1]}T`
}
