export type HolidayType = 'National' | 'Regional' | 'Optional'

export interface Holiday {
  id: string
  name: string
  date: string
  type: HolidayType
  locations: string[]
  year: number
  isOptional: boolean
}
