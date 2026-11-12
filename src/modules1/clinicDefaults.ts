export type CatalogItem = {
  id: number
  name: string
  description: string
  price: number
}

export type QuoteLine = CatalogItem & { quantity: number }
export type ProposalStatus = 'Rascunho' | 'Enviada' | 'Aprovada' | 'Recusada'
export type Proposal = {
  id: number
  client: string
  pet: string
  createdAt: string
  lines: QuoteLine[]
  total: number
  status: ProposalStatus
}

export const proposalCatalog: CatalogItem[] = [
  { id: 1, name: 'Consulta veterinária', description: 'Atendimento clínico', price: 150 },
  { id: 2, name: 'Vacina V10', description: 'Dose com aplicação', price: 95 },
  { id: 3, name: 'Exame de sangue', description: 'Hemograma completo', price: 120 },
  { id: 4, name: 'Banho e tosa', description: 'Porte pequeno', price: 85 },
  { id: 5, name: 'Retorno', description: 'Reavaliação clínica', price: 70 },
]

export const initialProposals: Proposal[] = [
  { id: 1001, client: 'Camila Oliveira', pet: 'Luna', createdAt: '15 out. 2026', lines: [{ ...proposalCatalog[0], quantity: 1 }, { ...proposalCatalog[1], quantity: 1 }], total: 245, status: 'Enviada' },
  { id: 1002, client: 'Rafael Mendes', pet: 'Thor', createdAt: '14 out. 2026', lines: [{ ...proposalCatalog[2], quantity: 1 }], total: 120, status: 'Aprovada' },
]

export type ServiceStatus = 'Agendado' | 'Em Atendimento' | 'Concluído'
export type Appointment = {
  id: number
  pet: string
  service: string
  professional: string
  resource: string
  startsAt: string
  status: ServiceStatus
}

export const clinicProfessionals = ['Dra. Marina Costa', 'Dr. Lucas Almeida', 'Dra. Bianca Santos']

export const initialAppointments: Appointment[] = [
  { id: 1, pet: 'Luna · Camila Oliveira', service: 'Consulta veterinária', professional: 'Dra. Marina Costa', resource: 'Consultório 1', startsAt: '2026-10-15T09:00', status: 'Em Atendimento' },
  { id: 2, pet: 'Thor · Rafael Mendes', service: 'Vacinação V10', professional: 'Dr. Lucas Almeida', resource: 'Consultório 2', startsAt: '2026-10-15T09:30', status: 'Agendado' },
  { id: 3, pet: 'Mel · Fernanda Costa', service: 'Banho e tosa', professional: 'Dra. Bia Santos', resource: 'Sala de estética', startsAt: '2026-10-15T10:15', status: 'Agendado' },
]

export type StockItem = {
  id: number
  name: string
  category: string
  quantity: number
  unit: string
  minimum: number
}

export type StockMovement = {
  id: number
  itemName: string
  kind: 'Entrada' | 'Saída'
  quantity: number
  happenedAt: string
}

export const initialItems: StockItem[] = [
  { id: 1, name: 'Vacina V10', category: 'Medicamentos', quantity: 8, unit: 'doses', minimum: 10 },
  { id: 2, name: 'Antipulgas NexGard', category: 'Medicamentos', quantity: 24, unit: 'unidades', minimum: 8 },
  { id: 3, name: 'Shampoo hipoalergênico', category: 'Higiene e estética', quantity: 5, unit: 'frascos', minimum: 6 },
  { id: 4, name: 'Ração Recovery', category: 'Alimentação', quantity: 3, unit: 'latas', minimum: 5 },
  { id: 5, name: 'Seringas 3 ml', category: 'Materiais clínicos', quantity: 42, unit: 'unidades', minimum: 15 },
]
