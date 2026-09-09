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

function mmWidths(...values: number[]): TireWidthOption[] {
  return values.map((v) => ({ mm: v, label: `${v}mm` }))
}

// MTB widths are marketed in inches — store the mm equivalent (used for the calculation)
// alongside a label showing both, since that's what riders recognize on the tire's sidewall.
function inchWidths(...values: number[]): TireWidthOption[] {
  return values.map((v) => ({ mm: Math.round(v * 25.4), label: `${v}" (~${Math.round(v * 25.4)}mm)` }))
}

export const TIRE_PRESETS: TirePreset[] = [
  // ---------------------------------------------------------------------
  // Continental
  // ---------------------------------------------------------------------
  {
    id: 'continental-gp5000-str-landevej',
    brand: 'continental',
    model: 'Grand Prix 5000 S TR',
    discipline: 'landevej',
    widths: mmWidths(25, 28, 30, 32, 35),
    tubelessReady: true,
    note: 'Flagskib, alsidigt racedæk',
  },
  {
    id: 'continental-gp5000-astr-landevej',
    brand: 'continental',
    model: 'Grand Prix 5000 AS TR',
    discipline: 'landevej',
    widths: mmWidths(25, 28, 32, 35),
    tubelessReady: true,
    note: '"All-Season" — mere greb/holdbarhed i vådt føre',
  },
  {
    id: 'continental-ultrasport3-landevej',
    brand: 'continental',
    model: 'Ultra Sport III',
    discipline: 'landevej',
    widths: mmWidths(23, 25, 28),
    tubelessReady: false,
    note: 'Budget/træningsdæk, ikke tubeless',
  },
  {
    id: 'continental-terraspeed-gravel',
    brand: 'continental',
    model: 'Terra Speed',
    discipline: 'gravel',
    widths: mmWidths(35, 40, 45),
    tubelessReady: true,
    note: 'Hurtigtrullende race-grus',
  },
  {
    id: 'continental-terratrail-gravel',
    brand: 'continental',
    model: 'Terra Trail',
    discipline: 'gravel',
    widths: mmWidths(35, 40, 45),
    tubelessReady: true,
    note: 'Alsidigt blandet terræn',
  },
  {
    id: 'continental-terraadventure-gravel',
    brand: 'continental',
    model: 'Terra Adventure',
    discipline: 'gravel',
    widths: mmWidths(45, 50, 55),
    tubelessReady: true,
    note: 'MTB-inspireret offroad/bikepacking, hookless-kompatibel',
  },
  {
    id: 'continental-raceking-mtb',
    brand: 'continental',
    model: 'Race King',
    discipline: 'mtb',
    widths: inchWidths(2.0, 2.2),
    tubelessReady: true,
    note: 'XC race/maraton (29")',
  },
  {
    id: 'continental-crossking-mtb',
    brand: 'continental',
    model: 'Cross King',
    discipline: 'mtb',
    widths: inchWidths(2.2, 2.3, 2.6),
    tubelessReady: true,
    note: 'XC/trail alsidigt (27.5"/29")',
  },
  {
    id: 'continental-mountainking-mtb',
    brand: 'continental',
    model: 'Mountain King',
    discipline: 'mtb',
    widths: inchWidths(2.3, 2.4, 2.6),
    tubelessReady: true,
    note: 'Trail alsidigt (27.5"/29")',
  },

  // ---------------------------------------------------------------------
  // Schwalbe
  // ---------------------------------------------------------------------
  {
    id: 'schwalbe-proone-landevej',
    brand: 'schwalbe',
    model: 'Pro One TLE',
    discipline: 'landevej',
    widths: mmWidths(25, 28, 30, 32),
    tubelessReady: true,
    note: 'Flagskib racedæk',
  },
  {
    id: 'schwalbe-one-landevej',
    brand: 'schwalbe',
    model: 'One (ADDIX) TLE',
    discipline: 'landevej',
    widths: mmWidths(25, 28, 30),
    tubelessReady: true,
    note: 'Mellemklasse alsidigt racedæk',
  },
  {
    id: 'schwalbe-lugano2-landevej',
    brand: 'schwalbe',
    model: 'Lugano II',
    discipline: 'landevej',
    widths: mmWidths(23, 25, 28, 32),
    tubelessReady: false,
    note: 'Budget/træningsdæk, ikke tubeless',
  },
  {
    id: 'schwalbe-gonrs-gravel',
    brand: 'schwalbe',
    model: 'G-One RS',
    discipline: 'gravel',
    widths: mmWidths(35, 40, 45),
    tubelessReady: true,
    note: 'Hurtigtrullende race-grus',
  },
  {
    id: 'schwalbe-gonebite-gravel',
    brand: 'schwalbe',
    model: 'G-One Bite',
    discipline: 'gravel',
    widths: mmWidths(40, 45, 50),
    tubelessReady: true,
    note: 'Aggressivt mønster til løst/vådt grus',
  },
  {
    id: 'schwalbe-goneoverland-gravel',
    brand: 'schwalbe',
    model: 'G-One Overland',
    discipline: 'gravel',
    widths: mmWidths(40, 45, 50),
    tubelessReady: true,
    note: 'Commuter/adventure, e-bike-godkendt',
  },
  {
    id: 'schwalbe-racingralph-mtb',
    brand: 'schwalbe',
    model: 'Racing Ralph',
    discipline: 'mtb',
    widths: inchWidths(2.25, 2.35),
    tubelessReady: true,
    note: 'Rent XC-racedæk',
  },
  {
    id: 'schwalbe-wickedwill-mtb',
    brand: 'schwalbe',
    model: 'Wicked Will',
    discipline: 'mtb',
    widths: inchWidths(2.25, 2.4, 2.6),
    tubelessReady: true,
    note: 'Downcountry/trail alsidigt',
  },
  {
    id: 'schwalbe-magicmary-mtb',
    brand: 'schwalbe',
    model: 'Magic Mary',
    discipline: 'mtb',
    widths: inchWidths(2.4, 2.6),
    tubelessReady: true,
    note: 'Gravity/enduro/DH-favorit til for',
  },
  {
    id: 'schwalbe-nobbynic-mtb',
    brand: 'schwalbe',
    model: 'Nobby Nic',
    discipline: 'mtb',
    widths: inchWidths(2.25, 2.35, 2.4, 2.6),
    tubelessReady: true,
    note: 'Bredt anvendeligt all-mountain/enduro',
  },

  // ---------------------------------------------------------------------
  // Pirelli
  // ---------------------------------------------------------------------
  {
    id: 'pirelli-pzerorace-landevej',
    brand: 'pirelli',
    model: 'P Zero Race TLR',
    discipline: 'landevej',
    widths: mmWidths(26, 28, 30, 32),
    tubelessReady: true,
    note: 'Flagskib racedæk',
  },
  {
    id: 'pirelli-cinturatovelo-landevej',
    brand: 'pirelli',
    model: 'Cinturato Velo TLR',
    discipline: 'landevej',
    widths: mmWidths(26, 28, 32, 35),
    tubelessReady: true,
    note: 'Endurance/alsidigt dæk',
  },
  {
    id: 'pirelli-cinturatogravelh-gravel',
    brand: 'pirelli',
    model: 'Cinturato Gravel H',
    discipline: 'gravel',
    widths: mmWidths(35, 40, 45),
    tubelessReady: true,
    note: 'Hardpack',
  },
  {
    id: 'pirelli-cinturatogravelm-gravel',
    brand: 'pirelli',
    model: 'Cinturato Gravel M',
    discipline: 'gravel',
    widths: mmWidths(35, 40, 45),
    tubelessReady: true,
    note: 'Blandet terræn',
  },
  {
    id: 'pirelli-cinturatogravelrh-gravel',
    brand: 'pirelli',
    model: 'Cinturato Gravel RH',
    discipline: 'gravel',
    widths: mmWidths(40, 45, 50, 55),
    tubelessReady: true,
    note: 'Race, hardpack',
  },
  {
    id: 'pirelli-scorpionxcrc-mtb',
    brand: 'pirelli',
    model: 'Scorpion XC RC',
    discipline: 'mtb',
    widths: inchWidths(2.2, 2.4),
    tubelessReady: true,
    note: 'XC race (29")',
  },
  {
    id: 'pirelli-scorpiontrail-mtb',
    brand: 'pirelli',
    model: 'Scorpion Trail',
    discipline: 'mtb',
    widths: inchWidths(2.4, 2.6),
    tubelessReady: true,
    note: 'Trail (27.5"/29")',
  },
  {
    id: 'pirelli-scorpionenduro-mtb',
    brand: 'pirelli',
    model: 'Scorpion Enduro',
    discipline: 'mtb',
    widths: inchWidths(2.4, 2.6),
    tubelessReady: true,
    note: 'Enduro (27.5"/29")',
  },

  // ---------------------------------------------------------------------
  // Vittoria
  // ---------------------------------------------------------------------
  {
    id: 'vittoria-corsapro-landevej',
    brand: 'vittoria',
    model: 'Corsa Pro TLR',
    discipline: 'landevej',
    widths: mmWidths(24, 26, 28, 30, 32),
    tubelessReady: true,
    note: 'Flagskib racedæk. 24/26mm kun til hooked fælge',
  },
  {
    id: 'vittoria-corsaprocontrol-landevej',
    brand: 'vittoria',
    model: 'Corsa Pro Control',
    discipline: 'landevej',
    widths: mmWidths(26, 28, 30, 32, 34, 38, 42),
    tubelessReady: true,
    note: 'Bredere, mere holdbar udgave af Corsa Pro',
  },
  {
    id: 'vittoria-rubinopro-landevej',
    brand: 'vittoria',
    model: 'Rubino Pro',
    discipline: 'landevej',
    widths: mmWidths(25, 28, 30, 32),
    tubelessReady: true,
    note: 'Trænings-/alsidigt dæk',
  },
  {
    id: 'vittoria-terrenot30-gravel',
    brand: 'vittoria',
    model: 'Terreno T30',
    discipline: 'gravel',
    widths: mmWidths(40, 45, 50),
    tubelessReady: true,
    note: 'Serien er under omdøbning til Vittorias T-Score-system — dobbelttjek præcis bredde hos forhandler',
  },
  {
    id: 'vittoria-terrenot50-gravel',
    brand: 'vittoria',
    model: 'Terreno T50',
    discipline: 'gravel',
    widths: mmWidths(40, 45, 50, 55),
    tubelessReady: true,
    note: 'Mixed/endurance grus',
  },
  {
    id: 'vittoria-mezcal-mtb',
    brand: 'vittoria',
    model: 'Mezcal',
    discipline: 'mtb',
    widths: inchWidths(2.25, 2.4),
    tubelessReady: true,
    note: 'Populært XC-dæk',
  },
  {
    id: 'vittoria-barzo-mtb',
    brand: 'vittoria',
    model: 'Barzo',
    discipline: 'mtb',
    widths: inchWidths(2.25, 2.6),
    tubelessReady: true,
    note: 'XC/downcountry',
  },
  {
    id: 'vittoria-martello-mtb',
    brand: 'vittoria',
    model: 'Martello',
    discipline: 'mtb',
    widths: inchWidths(2.4, 2.6),
    tubelessReady: true,
    note: 'Enduro race',
  },

  // ---------------------------------------------------------------------
  // Specialized
  // ---------------------------------------------------------------------
  {
    id: 'specialized-sworksturbotlr-landevej',
    brand: 'specialized',
    model: 'S-Works Turbo TLR Race',
    discipline: 'landevej',
    widths: mmWidths(28, 30),
    tubelessReady: true,
    note: 'Flagskib racedæk',
  },
  {
    id: 'specialized-mondotlr-landevej',
    brand: 'specialized',
    model: 'Mondo TLR Endurance',
    discipline: 'landevej',
    widths: mmWidths(28, 32, 35),
    tubelessReady: true,
    note: 'Endurance/alsidigt dæk',
  },
  {
    id: 'specialized-turbopro-landevej',
    brand: 'specialized',
    model: 'Turbo Pro T5',
    discipline: 'landevej',
    widths: mmWidths(24, 26, 28, 30),
    tubelessReady: false,
    note: 'Trænings-/alsidigt dæk, ikke tubeless',
  },
  {
    id: 'specialized-pathfindertlr-gravel',
    brand: 'specialized',
    model: 'Pathfinder TLR',
    discipline: 'gravel',
    widths: mmWidths(35, 40, 45, 50),
    tubelessReady: true,
    note: 'Hurtigtrullende/hardpack',
  },
  {
    id: 'specialized-tracertlr-gravel',
    brand: 'specialized',
    model: 'Tracer TLR',
    discipline: 'gravel',
    widths: mmWidths(40, 45, 50),
    tubelessReady: true,
    note: 'Alsidigt blandet terræn',
  },
  {
    id: 'specialized-terratlr-gravel',
    brand: 'specialized',
    model: 'Terra TLR',
    discipline: 'gravel',
    widths: mmWidths(45, 50),
    tubelessReady: true,
    note: 'Mest aggressive — grus/MTB-krydsning',
  },
  {
    id: 'specialized-groundcontrol-mtb',
    brand: 'specialized',
    model: 'Ground Control GRID T7',
    discipline: 'mtb',
    widths: inchWidths(2.35),
    tubelessReady: true,
    note: 'Trail/all-mountain, front-biased (27.5"/29")',
  },
  {
    id: 'specialized-fasttrak-mtb',
    brand: 'specialized',
    model: 'Fast Trak Control T5',
    discipline: 'mtb',
    widths: inchWidths(2.2, 2.35),
    tubelessReady: true,
    note: 'XC/downcountry (27.5"/29")',
  },
  {
    id: 'specialized-butcher-mtb',
    brand: 'specialized',
    model: 'Butcher GRID TRAIL T7',
    discipline: 'mtb',
    widths: inchWidths(2.3, 2.6),
    tubelessReady: true,
    note: 'Trail/enduro, aggressivt til for (29")',
  },
]

export function tirePresetLabel(p: TirePreset): string {
  return `${TIRE_BRAND_LABELS[p.brand]} ${p.model}`
}
