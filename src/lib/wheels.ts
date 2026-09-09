export type WheelBrand = 'dtswiss' | 'zipp' | 'mavic' | 'fulcrum' | 'roval' | 'miche'
export type WheelDiscipline = 'landevej' | 'gravel' | 'mtb'

export const WHEEL_BRAND_LABELS: Record<WheelBrand, string> = {
  dtswiss: 'DT Swiss',
  zipp: 'Zipp',
  mavic: 'Mavic',
  fulcrum: 'Fulcrum',
  roval: 'Roval',
  miche: 'Miche',
}

export interface WheelPreset {
  id: string
  brand: WheelBrand
  model: string
  discipline: WheelDiscipline
  /** Internal rim width in mm. If a model comes in multiple widths, each is a separate preset. */
  internalWidthMm: number
  hookless?: boolean
  tubelessReady?: boolean
  note?: string
}

export const WHEEL_PRESETS: WheelPreset[] = [
  // ---------------------------------------------------------------------
  // DT Swiss
  // ---------------------------------------------------------------------
  { id: 'dtswiss-arc1100-landevej', brand: 'dtswiss', model: 'ARC 1100 DICUT', discipline: 'landevej', internalWidthMm: 22, hookless: false, tubelessReady: true, note: 'Aero' },
  { id: 'dtswiss-erc1100-landevej', brand: 'dtswiss', model: 'ERC 1100 DICUT', discipline: 'landevej', internalWidthMm: 22, hookless: false, tubelessReady: true, note: 'Endurance/granfondo' },
  { id: 'dtswiss-p1800-landevej', brand: 'dtswiss', model: 'P 1800 SPLINE', discipline: 'landevej', internalWidthMm: 18, hookless: false, tubelessReady: true, note: 'Alu/budget' },
  { id: 'dtswiss-grc1100-gravel', brand: 'dtswiss', model: 'GRC 1100 DICUT', discipline: 'gravel', internalWidthMm: 24, hookless: false, tubelessReady: true, note: 'Karbon' },
  { id: 'dtswiss-gr1600-gravel', brand: 'dtswiss', model: 'GR 1600 SPLINE', discipline: 'gravel', internalWidthMm: 24, hookless: false, tubelessReady: true, note: 'Alu/budget' },
  { id: 'dtswiss-xmc1200-mtb', brand: 'dtswiss', model: 'XMC 1200 SPLINE', discipline: 'mtb', internalWidthMm: 30, hookless: true, tubelessReady: true, note: 'Trail/enduro, karbon' },
  { id: 'dtswiss-xrc1200-mtb', brand: 'dtswiss', model: 'XRC 1200 SPLINE', discipline: 'mtb', internalWidthMm: 25, hookless: true, tubelessReady: true, note: 'XC, karbon — fås også i 30mm' },
  { id: 'dtswiss-m1900-mtb', brand: 'dtswiss', model: 'M 1900 SPLINE', discipline: 'mtb', internalWidthMm: 30, tubelessReady: true, note: 'Alu/budget all-mountain' },

  // ---------------------------------------------------------------------
  // Zipp
  // ---------------------------------------------------------------------
  { id: 'zipp-303firecrest-landevej', brand: 'zipp', model: '303 Firecrest', discipline: 'landevej', internalWidthMm: 25, hookless: true, tubelessReady: true, note: 'Alsidigt' },
  { id: 'zipp-404firecrest-landevej', brand: 'zipp', model: '404 Firecrest', discipline: 'landevej', internalWidthMm: 23, hookless: true, tubelessReady: true, note: 'Aero' },
  { id: 'zipp-30course-landevej', brand: 'zipp', model: '30 Course', discipline: 'landevej', internalWidthMm: 21, hookless: false, tubelessReady: true, note: 'Alu/budget' },
  { id: 'zipp-101xplr-gravel', brand: 'zipp', model: '101 XPLR', discipline: 'gravel', internalWidthMm: 27, hookless: true, tubelessReady: true, note: 'Let/klatring' },
  { id: 'zipp-303xplr-gravel', brand: 'zipp', model: '303 XPLR', discipline: 'gravel', internalWidthMm: 32, hookless: true, tubelessReady: true, note: 'Bred/aggressiv' },
  { id: 'zipp-3zeromoto-mtb', brand: 'zipp', model: '3ZERO Moto', discipline: 'mtb', internalWidthMm: 30, hookless: true, tubelessReady: true, note: 'Trail/enduro, karbon' },

  // ---------------------------------------------------------------------
  // Mavic
  // ---------------------------------------------------------------------
  { id: 'mavic-cosmicultimate45-landevej', brand: 'mavic', model: 'Cosmic Ultimate 45', discipline: 'landevej', internalWidthMm: 19, hookless: false, tubelessReady: true, note: 'Aero-flagskib' },
  { id: 'mavic-ksyriumpro-landevej', brand: 'mavic', model: 'Ksyrium Pro', discipline: 'landevej', internalWidthMm: 19, hookless: false, tubelessReady: true, note: 'Let/alsidigt' },
  { id: 'mavic-allroadsl-gravel', brand: 'mavic', model: 'Allroad SL', discipline: 'gravel', internalWidthMm: 25, hookless: true, tubelessReady: true, note: 'Karbon' },
  { id: 'mavic-allroadelite-gravel', brand: 'mavic', model: 'Allroad Elite', discipline: 'gravel', internalWidthMm: 22, tubelessReady: true, note: 'Alu/budget' },
  { id: 'mavic-crossmaxslultimate-mtb', brand: 'mavic', model: 'Crossmax SL Ultimate', discipline: 'mtb', internalWidthMm: 25, hookless: true, tubelessReady: true, note: 'XC, karbon — fås også i 30mm' },
  { id: 'mavic-crossmaxxl29-mtb', brand: 'mavic', model: 'Crossmax XL 29', discipline: 'mtb', internalWidthMm: 30, hookless: true, tubelessReady: true, note: 'Trail, alu' },

  // ---------------------------------------------------------------------
  // Fulcrum
  // ---------------------------------------------------------------------
  { id: 'fulcrum-wind40db-landevej', brand: 'fulcrum', model: 'Wind 40/55 DB', discipline: 'landevej', internalWidthMm: 19, hookless: false, tubelessReady: true, note: 'Aero, karbon' },
  { id: 'fulcrum-speed40db-landevej', brand: 'fulcrum', model: 'Speed 40 DB', discipline: 'landevej', internalWidthMm: 19, hookless: false, tubelessReady: true, note: 'Let, karbon' },
  { id: 'fulcrum-racingzerocompetizione-landevej', brand: 'fulcrum', model: 'Racing Zero Competizione', discipline: 'landevej', internalWidthMm: 17, hookless: false, tubelessReady: true, note: 'Alu, klatring/klassisk' },
  { id: 'fulcrum-rapidredcarbon3-gravel', brand: 'fulcrum', model: 'Rapid Red Carbon 3', discipline: 'gravel', internalWidthMm: 25, tubelessReady: true, note: '"Mini-hook"-design — hverken fuld hook eller ren hookless' },
  { id: 'fulcrum-redzonecarbon-mtb', brand: 'fulcrum', model: 'Red Zone Carbon', discipline: 'mtb', internalWidthMm: 28, hookless: true, tubelessReady: true, note: 'XC/downcountry' },
  { id: 'fulcrum-redzone3-mtb', brand: 'fulcrum', model: 'Red Zone 3', discipline: 'mtb', internalWidthMm: 25, hookless: false, tubelessReady: true, note: 'Alu/budget' },

  // ---------------------------------------------------------------------
  // Roval (Specialized)
  // ---------------------------------------------------------------------
  { id: 'roval-rapideclxii-landevej', brand: 'roval', model: 'Rapide CLX II', discipline: 'landevej', internalWidthMm: 21, hookless: false, tubelessReady: true, note: 'Aero' },
  { id: 'roval-alpinistclxii-landevej', brand: 'roval', model: 'Alpinist CLX II', discipline: 'landevej', internalWidthMm: 21, hookless: false, tubelessReady: true, note: 'Klatring/let' },
  { id: 'roval-terraclx-gravel', brand: 'roval', model: 'Terra CLX', discipline: 'gravel', internalWidthMm: 25, hookless: false, tubelessReady: true, note: 'Standard' },
  { id: 'roval-terraclxevo-gravel', brand: 'roval', model: 'Terra CLX Evo', discipline: 'gravel', internalWidthMm: 30, hookless: true, tubelessReady: true, note: 'Bred/aggressiv' },
  { id: 'roval-controlsl-mtb', brand: 'roval', model: 'Control SL', discipline: 'mtb', internalWidthMm: 29, hookless: true, tubelessReady: true, note: 'XC, karbon' },
  { id: 'roval-traversesl-mtb', brand: 'roval', model: 'Traverse SL', discipline: 'mtb', internalWidthMm: 30, hookless: true, tubelessReady: true, note: 'Trail/enduro, karbon' },

  // ---------------------------------------------------------------------
  // Miche
  // ---------------------------------------------------------------------
  { id: 'miche-kleosrd3650-landevej', brand: 'miche', model: 'Kleos RD 36/50', discipline: 'landevej', internalWidthMm: 21, hookless: false, tubelessReady: true, note: 'Karbon, valgte bevidst hook frem for hookless' },
  { id: 'miche-kleosrd62-landevej', brand: 'miche', model: 'Kleos RD 62', discipline: 'landevej', internalWidthMm: 23, hookless: false, tubelessReady: true, note: 'Dybere/bredere variant af Kleos' },
  { id: 'miche-swrevo50-landevej', brand: 'miche', model: 'SWR Evo 50 DX', discipline: 'landevej', internalWidthMm: 22, hookless: false, tubelessReady: true, note: 'Ældre generation kan have 17mm — tjek modelår' },
  { id: 'miche-devard-landevej', brand: 'miche', model: 'Deva RD 52/62', discipline: 'landevej', internalWidthMm: 23, hookless: false, tubelessReady: true, note: 'Flagskib, aero' },
  { id: 'miche-graffaero48-gravel', brand: 'miche', model: 'Graff Aero 48', discipline: 'gravel', internalWidthMm: 27, hookless: true, tubelessReady: true, note: 'Karbon race-grus' },
  { id: 'miche-graffallroad-gravel', brand: 'miche', model: 'Graff Allroad TLR', discipline: 'gravel', internalWidthMm: 23, hookless: false, tubelessReady: true, note: 'Karbon all-road/grus' },
  { id: 'miche-graffxl-gravel', brand: 'miche', model: 'Graff XL TLR', discipline: 'gravel', internalWidthMm: 24, hookless: false, tubelessReady: true, note: 'Alu, adventure-grus' },
  { id: 'miche-k1rd-mtb', brand: 'miche', model: 'K1 RD', discipline: 'mtb', internalWidthMm: 30, hookless: true, tubelessReady: true, note: 'Karbon XC/marathon race' },
  { id: 'miche-k4-mtb', brand: 'miche', model: 'K4', discipline: 'mtb', internalWidthMm: 25, hookless: true, tubelessReady: true, note: 'Karbon trail/all-mountain' },
  { id: 'miche-966spr-mtb', brand: 'miche', model: '966 SPR', discipline: 'mtb', internalWidthMm: 25, hookless: true, tubelessReady: true, note: 'Alu XC/trail' },
]

export function wheelPresetLabel(p: WheelPreset): string {
  return `${WHEEL_BRAND_LABELS[p.brand]} ${p.model}`
}
