import type { ComponentType } from '../types'

export interface ComponentDef {
  type: ComponentType
  label: string
  defaultLifespanKm: number
  hint?: string
}

export const COMPONENT_DEFS: ComponentDef[] = [
  { type: 'kaede', label: 'Kæde', defaultLifespanKm: 3000, hint: 'Tjek med kædemåler ved ca. 0,5-0,75% slid' },
  { type: 'kassette', label: 'Kassette', defaultLifespanKm: 9000 },
  { type: 'klinger', label: 'Klinger (forreste tandhjul)', defaultLifespanKm: 15000 },
  { type: 'daek_for', label: 'Dæk (for)', defaultLifespanKm: 4000 },
  { type: 'daek_bag', label: 'Dæk (bag)', defaultLifespanKm: 3000, hint: 'Bagdæk slides typisk hurtigere' },
  { type: 'slange_for', label: 'Slange (for)', defaultLifespanKm: 5000 },
  { type: 'slange_bag', label: 'Slange (bag)', defaultLifespanKm: 5000 },
  { type: 'bremseklodser_for', label: 'Bremseklodser (for)', defaultLifespanKm: 2500 },
  { type: 'bremseklodser_bag', label: 'Bremseklodser (bag)', defaultLifespanKm: 2000 },
  { type: 'bremsekabler', label: 'Bremsekabler/-huse', defaultLifespanKm: 6000 },
  { type: 'gearkabler', label: 'Gearkabler/-huse', defaultLifespanKm: 6000 },
  { type: 'styrbaand', label: 'Styrbånd/greb', defaultLifespanKm: 5000 },
  { type: 'kaedehjulskraense', label: 'Kædehjulskranse (chainring bolts mv.)', defaultLifespanKm: 15000 },
  { type: 'pedaler', label: 'Pedaler', defaultLifespanKm: 10000 },
  { type: 'krank_lejer', label: 'Krank-lejer (bottom bracket)', defaultLifespanKm: 8000 },
  { type: 'styrleje', label: 'Styrleje (headset)', defaultLifespanKm: 12000 },
  { type: 'baghjulsleje', label: 'Navlejer', defaultLifespanKm: 10000 },
  { type: 'andet', label: 'Andet', defaultLifespanKm: 5000 },
]

export function componentLabel(type: ComponentType): string {
  return COMPONENT_DEFS.find((c) => c.type === type)?.label ?? type
}

export function defaultLifespan(type: ComponentType): number {
  return COMPONENT_DEFS.find((c) => c.type === type)?.defaultLifespanKm ?? 5000
}
