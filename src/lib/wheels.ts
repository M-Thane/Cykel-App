export type WheelBrand = 'dtswiss' | 'zipp' | 'mavic' | 'fulcrum' | 'roval'
export type WheelDiscipline = 'landevej' | 'gravel' | 'mtb'

export const WHEEL_BRAND_LABELS: Record<WheelBrand, string> = {
  dtswiss: 'DT Swiss',
  zipp: 'Zipp',
  mavic: 'Mavic',
  fulcrum: 'Fulcrum',
  roval: 'Roval',
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

export const WHEEL_PRESETS: WheelPreset[] = []

export function wheelPresetLabel(p: WheelPreset): string {
  return `${WHEEL_BRAND_LABELS[p.brand]} ${p.model}`
}
