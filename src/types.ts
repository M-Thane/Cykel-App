export type Discipline = 'landevej' | 'gravel' | 'mtb' | 'pendling' | 'tur'

export const DISCIPLINES: { value: Discipline; label: string }[] = [
  { value: 'landevej', label: 'Landevej' },
  { value: 'gravel', label: 'Gravel' },
  { value: 'mtb', label: 'MTB' },
  { value: 'pendling', label: 'Pendling' },
  { value: 'tur', label: 'Tur/motion' },
]

export interface Bike {
  id: string
  name: string
  discipline: Discipline
  createdAt: string
  archived?: boolean
}

export type ComponentType =
  | 'kaede'
  | 'kassette'
  | 'klinger'
  | 'daek_for'
  | 'daek_bag'
  | 'slange_for'
  | 'slange_bag'
  | 'bremseklodser_for'
  | 'bremseklodser_bag'
  | 'bremsekabler'
  | 'gearkabler'
  | 'styrbaand'
  | 'kaedehjulskraense'
  | 'pedaler'
  | 'krank_lejer'
  | 'styrleje'
  | 'baghjulsleje'
  | 'andet'

export interface WearComponent {
  id: string
  bikeId: string
  type: ComponentType
  customLabel?: string
  installedAtKm: number
  installedAtDate: string
  lifespanKm: number
  active: boolean
  replacedAtKm?: number
  replacedAtDate?: string
  notes?: string
}

export interface RideLog {
  id: string
  bikeId: string
  date: string
  km: number
  note?: string
}
