import { demoDataKeys } from '../Data saving/demoPersistence'
import { initialProposals, initialAppointments, initialItems } from '../modules1/clinicDefaults'

export type ClinicSource = 'budgets' | 'schedule' | 'inventory' | 'vaccinations' | 'grooming' | 'prescriptions'

export type ClinicActivity = {
  id: string
  source: ClinicSource
  date: string
  pet: string
  guardian: string
  title: string
  status: string
  details: string
  amount: number | null
}

export const clinicSourceLabels: Record<ClinicSource, string> = {
  budgets: 'Orçamentos',
  schedule: 'Consultas e serviços',
  inventory: 'Estoque',
  vaccinations: 'Vacinação',
  grooming: 'Banho e tosa',
  prescriptions: 'Receitas',
}

type Proposal = {
  id: number
  client: string
  pet: string
  createdAt: string
  lines: Array<{ name: string; quantity: number; price: number }>
  total: number
  status: string
}

type Appointment = {
  id: number
  pet: string
  service: string
  professional: string
  resource: string
  startsAt: string
  status: string
}

type StockItem = {
  id: number
  name: string
  category: string
  quantity: number
  unit: string
  minimum: number
}

type StockMovement = {
  id: number
  itemName: string
  kind: 'Entrada' | 'Saída'
  quantity: number
  happenedAt: string
}

type Inventory = { items: StockItem[]; movements: StockMovement[] }

type Vaccination = {
  id: number
  pet: string
  guardian: string
  vaccine: string
  appliedAt: string
  returnAt: string
  veterinarian: string
  batch: string
  notes: string
}

type GroomingAppointment = {
  id: number
  pet: string
  guardian: string
  service: string
  professional: string
  size: string
  date: string
  time: string
  status: string
}

type Prescription = {
  id: number
  pet: string
  guardian: string
  veterinarian: string
  date: string
  diagnosis: string
  medication: string
  dosage: string
  route: string
  frequency: string
  duration: string
  instructions: string
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isProposal(value: unknown): value is Proposal {
  return isRecord(value)
    && typeof value.id === 'number'
    && typeof value.client === 'string'
    && typeof value.pet === 'string'
    && typeof value.createdAt === 'string'
    && Array.isArray(value.lines)
    && value.lines.every((line) => isRecord(line)
      && typeof line.name === 'string'
      && typeof line.quantity === 'number'
      && typeof line.price === 'number')
    && typeof value.total === 'number'
    && typeof value.status === 'string'
}

function isAppointment(value: unknown): value is Appointment {
  return isRecord(value)
    && typeof value.id === 'number'
    && typeof value.pet === 'string'
    && typeof value.service === 'string'
    && typeof value.professional === 'string'
    && typeof value.resource === 'string'
    && typeof value.startsAt === 'string'
    && typeof value.status === 'string'
}

function isStockItem(value: unknown): value is StockItem {
  return isRecord(value)
    && typeof value.id === 'number'
    && typeof value.name === 'string'
    && typeof value.category === 'string'
    && typeof value.quantity === 'number'
    && typeof value.unit === 'string'
    && typeof value.minimum === 'number'
}

function isStockMovement(value: unknown): value is StockMovement {
  return isRecord(value)
    && typeof value.id === 'number'
    && typeof value.itemName === 'string'
    && (value.kind === 'Entrada' || value.kind === 'Saída')
    && typeof value.quantity === 'number'
    && typeof value.happenedAt === 'string'
}

function isInventory(value: unknown): value is Inventory {
  return isRecord(value)
    && Array.isArray(value.items)
    && value.items.every(isStockItem)
    && Array.isArray(value.movements)
    && value.movements.every(isStockMovement)
}

function isVaccination(value: unknown): value is Vaccination {
  return isRecord(value)
    && typeof value.id === 'number'
    && typeof value.pet === 'string'
    && typeof value.guardian === 'string'
    && typeof value.vaccine === 'string'
    && typeof value.appliedAt === 'string'
    && typeof value.returnAt === 'string'
    && typeof value.veterinarian === 'string'
    && typeof value.batch === 'string'
    && typeof value.notes === 'string'
}

function isGroomingAppointment(value: unknown): value is GroomingAppointment {
  return isRecord(value)
    && typeof value.id === 'number'
    && typeof value.pet === 'string'
    && typeof value.guardian === 'string'
    && typeof value.service === 'string'
    && typeof value.professional === 'string'
    && typeof value.size === 'string'
    && typeof value.date === 'string'
    && typeof value.time === 'string'
    && typeof value.status === 'string'
}

function isPrescription(value: unknown): value is Prescription {
  return isRecord(value)
    && typeof value.id === 'number'
    && typeof value.pet === 'string'
    && typeof value.guardian === 'string'
    && typeof value.veterinarian === 'string'
    && typeof value.date === 'string'
    && typeof value.diagnosis === 'string'
    && typeof value.medication === 'string'
    && typeof value.dosage === 'string'
    && typeof value.route === 'string'
    && typeof value.frequency === 'string'
    && typeof value.duration === 'string'
    && typeof value.instructions === 'string'
}

function readStoredData<T>(
  key: string,
  label: string,
  fallback: T,
  isValid: (value: unknown) => value is T,
): T {
  let storedValue: string | null
  try {
    storedValue = window.localStorage.getItem(key)
  } catch {
    throw new Error(`Não foi possível acessar os dados de ${label} neste navegador.`)
  }

  if (storedValue === null) return fallback

  let parsedValue: unknown
  try {
    parsedValue = JSON.parse(storedValue)
  } catch {
    throw new Error(`Os dados salvos de ${label} não puderam ser lidos. Limpe os dados de demonstração para reiniciar o armazenamento.`)
  }

  if (!isValid(parsedValue)) {
    throw new Error(`Os dados salvos de ${label} têm um formato inválido. Eles foram preservados; limpe os dados de demonstração para reiniciar o armazenamento.`)
  }
  return parsedValue
}

function isList<T>(isValid: (value: unknown) => value is T) {
  return (value: unknown): value is T[] => Array.isArray(value) && value.every(isValid)
}

function normalizeText(value: string) {
  return value.trim().toLocaleLowerCase('pt-BR')
}

function extractPetAndGuardian(value: string) {
  const [pet = '', ...guardianParts] = value.split('·').map((part) => part.trim())
  return { pet, guardian: guardianParts.join(' · ') }
}

function normalizeDate(value: string) {
  if (/^\d{4}-\d{2}-\d{2}/.test(value)) return value.slice(0, 10)

  const numericDate = value.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/)
  if (numericDate) {
    return `${numericDate[3]}-${numericDate[2].padStart(2, '0')}-${numericDate[1].padStart(2, '0')}`
  }

  const normalized = value.toLocaleLowerCase('pt-BR').normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  const localizedDate = normalized.match(/(\d{1,2})\s+(?:de\s+)?([a-z]{3})\.?(?:\s+de)?\s+(\d{4})/)
  if (!localizedDate) return ''

  const months: Record<string, string> = {
    jan: '01', fev: '02', mar: '03', abr: '04', mai: '05', jun: '06',
    jul: '07', ago: '08', set: '09', out: '10', nov: '11', dez: '12',
  }
  const month = months[localizedDate[2]]
  return month ? `${localizedDate[3]}-${month}-${localizedDate[1].padStart(2, '0')}` : ''
}

export function readClinicActivities(): ClinicActivity[] {
  const proposals = readStoredData(
    demoDataKeys.budgets,
    clinicSourceLabels.budgets,
    initialProposals,
    isList(isProposal),
  )
  const appointments = readStoredData(
    demoDataKeys.schedule,
    clinicSourceLabels.schedule,
    initialAppointments,
    isList(isAppointment),
  )
  const inventory = readStoredData(
    demoDataKeys.inventory,
    clinicSourceLabels.inventory,
    { items: initialItems, movements: [] },
    isInventory,
  )
  const vaccinations = readStoredData(
    demoDataKeys.vaccinations,
    clinicSourceLabels.vaccinations,
    [] as Vaccination[],
    isList(isVaccination),
  )
  const groomingAppointments = readStoredData(
    demoDataKeys.grooming,
    clinicSourceLabels.grooming,
    [] as GroomingAppointment[],
    isList(isGroomingAppointment),
  )
  const prescriptions = readStoredData(
    demoDataKeys.prescriptions,
    clinicSourceLabels.prescriptions,
    [] as Prescription[],
    isList(isPrescription),
  )

  return [
    ...proposals.map((proposal): ClinicActivity => ({
      id: `budgets:${proposal.id}`,
      source: 'budgets',
      date: normalizeDate(proposal.createdAt),
      pet: proposal.pet,
      guardian: proposal.client,
      title: `Orçamento para ${proposal.pet}`,
      status: proposal.status,
      details: proposal.lines.map((line) => `${line.name} (${line.quantity} × ${line.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })})`).join(', '),
      amount: proposal.total,
    })),
    ...appointments.map((appointment): ClinicActivity => {
      const { pet, guardian } = extractPetAndGuardian(appointment.pet)
      return {
        id: `schedule:${appointment.id}`,
        source: 'schedule',
        date: normalizeDate(appointment.startsAt),
        pet,
        guardian,
        title: appointment.service,
        status: appointment.status,
        details: `${appointment.professional} · ${appointment.resource}`,
        amount: null,
      }
    }),
    ...inventory.movements.map((movement): ClinicActivity => ({
      id: `inventory-movement:${movement.id}`,
      source: 'inventory',
      date: normalizeDate(movement.happenedAt),
      pet: '',
      guardian: '',
      title: movement.itemName,
      status: movement.kind,
      details: `${movement.kind} de ${movement.quantity}`,
      amount: null,
    })),
    ...inventory.items.map((item): ClinicActivity => ({
      id: `inventory-item:${item.id}`,
      source: 'inventory',
      date: '',
      pet: '',
      guardian: '',
      title: item.name,
      status: item.quantity <= item.minimum ? 'Abaixo do mínimo' : 'Normal',
      details: `${item.category} · ${item.quantity} ${item.unit} · mínimo ${item.minimum}`,
      amount: null,
    })),
    ...vaccinations.map((record): ClinicActivity => ({
      id: `vaccinations:${record.id}`,
      source: 'vaccinations',
      date: normalizeDate(record.appliedAt),
      pet: record.pet,
      guardian: record.guardian,
      title: record.vaccine,
      status: record.returnAt && record.returnAt < new Date().toISOString().slice(0, 10) ? 'Retorno pendente' : 'Em dia',
      details: `${record.veterinarian}${record.batch ? ` · Lote ${record.batch}` : ''}${record.notes ? ` · ${record.notes}` : ''}`,
      amount: null,
    })),
    ...groomingAppointments.map((appointment): ClinicActivity => ({
      id: `grooming:${appointment.id}`,
      source: 'grooming',
      date: normalizeDate(appointment.date),
      pet: appointment.pet,
      guardian: appointment.guardian,
      title: appointment.service,
      status: appointment.status,
      details: `${appointment.time} · ${appointment.professional} · porte ${appointment.size}`,
      amount: null,
    })),
    ...prescriptions.map((prescription): ClinicActivity => ({
      id: `prescriptions:${prescription.id}`,
      source: 'prescriptions',
      date: normalizeDate(prescription.date),
      pet: prescription.pet,
      guardian: prescription.guardian,
      title: `Receita: ${prescription.medication}`,
      status: 'Registrada',
      details: `${prescription.diagnosis} · ${prescription.veterinarian}`,
      amount: null,
    })),
  ]
}

export function findRelatedActivities(
  activities: ClinicActivity[],
  participant: { name: string; pet: string; interests?: string[] },
) {
  const guardian = normalizeText(participant.name)
  const pet = normalizeText(participant.pet)
  if (!guardian && !pet) return []

  const interestSources: Record<string, ClinicSource[]> = {
    'Consultas e exames': ['budgets', 'schedule'],
    'Vacinação e prevenção': ['vaccinations'],
    'Banho e tosa': ['grooming'],
    'Orientações clínicas': ['schedule', 'vaccinations', 'prescriptions'],
  }
  const relevantSources = new Set((participant.interests ?? []).flatMap((interest) => interestSources[interest] ?? []))

  return activities
    .filter((activity) => (guardian && normalizeText(activity.guardian) === guardian)
      || (pet && normalizeText(activity.pet) === pet))
    .filter((activity) => relevantSources.has(activity.source))
    .sort((first, second) => second.date.localeCompare(first.date))
}
