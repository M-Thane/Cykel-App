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

export const GROUPSET_PRESETS: GroupsetPreset[] = []

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
