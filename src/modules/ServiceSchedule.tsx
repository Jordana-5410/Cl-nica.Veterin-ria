import { useMemo, useState, type FormEvent } from 'react'
import { demoDataKeys, useDemoData } from '../lib/demoPersistence'

type ServiceStatus = 'Agendado' | 'Em Atendimento' | 'Concluído'
type Appointment = {
  id: number
  pet: string
  service: string
  professional: string
  resource: string
  startsAt: string
  status: ServiceStatus
}

const initialAppointments: Appointment[] = [
  { id: 1, pet: 'Luna · Camila Oliveira', service: 'Consulta veterinária', professional: 'Dra. Marina Costa', resource: 'Consultório 1', startsAt: '2026-10-15T09:00', status: 'Em Atendimento' },
  { id: 2, pet: 'Thor · Rafael Mendes', service: 'Vacinação V10', professional: 'Dr. Lucas Almeida', resource: 'Consultório 2', startsAt: '2026-10-15T09:30', status: 'Agendado' },
  { id: 3, pet: 'Mel · Fernanda Costa', service: 'Banho e tosa', professional: 'Dra. Bia Santos', resource: 'Sala de estética', startsAt: '2026-10-15T10:15', status: 'Agendado' },
]

const statusOptions: ServiceStatus[] = ['Agendado', 'Em Atendimento', 'Concluído']

function isAppointment(value: unknown): value is Appointment {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return false
  const appointment = value as Record<string, unknown>
  return typeof appointment.id === 'number'
    && Number.isFinite(appointment.id)
    && typeof appointment.pet === 'string'
    && typeof appointment.service === 'string'
    && typeof appointment.professional === 'string'
    && typeof appointment.resource === 'string'
    && typeof appointment.startsAt === 'string'
    && typeof appointment.status === 'string'
    && statusOptions.some((status) => status === appointment.status)
}

function isAppointmentList(value: unknown): value is Appointment[] {
  return Array.isArray(value) && value.every(isAppointment)
}

function localDateTime() {
  const date = new Date()
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset())
  return date.toISOString().slice(0, 16)
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value))
}

export default function ServiceSchedule() {
  const [appointments, setAppointments, persistenceError] = useDemoData(
    demoDataKeys.schedule,
    initialAppointments,
    isAppointmentList,
  )
  const [pet, setPet] = useState('')
  const [service, setService] = useState('Consulta veterinária')
  const [professional, setProfessional] = useState('Dra. Marina Costa')
  const [resource, setResource] = useState('Consultório 1')
  const [startsAt, setStartsAt] = useState(localDateTime)
  const [filterStatus, setFilterStatus] = useState('Todos')
  const filteredAppointments = useMemo(
    () => appointments.filter((appointment) => filterStatus === 'Todos' || appointment.status === filterStatus),
    [appointments, filterStatus],
  )

  function addAppointment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const appointment: Appointment = {
      id: Date.now(),
      pet: pet.trim(),
      service,
      professional,
      resource,
      startsAt,
      status: 'Agendado',
    }
    setAppointments((current) => [...current, appointment].sort((a, b) => a.startsAt.localeCompare(b.startsAt)))
    setPet('')
    setStartsAt(localDateTime())
  }

  function updateStatus(id: number, status: ServiceStatus) {
    setAppointments((current) => current.map((appointment) => appointment.id === id ? { ...appointment, status } : appointment))
  }

  return (
    <div className="module-layout">
      {persistenceError && <p className="persistence-notice" role="alert">{persistenceError}</p>}
      <section className="module-card">
        <div className="module-card-heading"><div><h2>Novo agendamento</h2><p>Escolha o serviço, profissional, recurso e horário.</p></div></div>
        <form className="module-form" onSubmit={addAppointment}>
          <div className="module-form-grid">
            <label>Pet e tutor<input required value={pet} onChange={(event) => setPet(event.target.value)} placeholder="Ex.: Bento · Ana Souza" /></label>
            <label>Serviço<select value={service} onChange={(event) => setService(event.target.value)}><option>Consulta veterinária</option><option>Vacinação</option><option>Exame</option><option>Banho e tosa</option><option>Retorno</option></select></label>
            <label>Profissional<select value={professional} onChange={(event) => setProfessional(event.target.value)}><option>Dra. Marina Costa</option><option>Dr. Lucas Almeida</option><option>Dra. Bianca Santos</option></select></label>
            <label>Recurso<select value={resource} onChange={(event) => setResource(event.target.value)}><option>Consultório 1</option><option>Consultório 2</option><option>Sala de estética</option><option>Sala de exames</option></select></label>
            <label className="field-full">Data e horário<input required type="datetime-local" value={startsAt} onChange={(event) => setStartsAt(event.target.value)} /></label>
          </div>
          <div className="module-form-footer"><button className="module-button module-button--primary" type="submit">Criar agendamento</button></div>
        </form>
      </section>

      <section className="module-card">
        <div className="module-card-heading">
          <div><h2>Agenda de serviços</h2><p>Atualize a situação conforme o atendimento avança.</p></div>
          <label className="compact-filter"><span>Filtrar</span><select value={filterStatus} onChange={(event) => setFilterStatus(event.target.value)}><option>Todos</option>{statusOptions.map((status) => <option key={status}>{status}</option>)}</select></label>
        </div>
        <div className="module-table-wrap">
          <table className="module-table">
            <thead><tr><th>Data e horário</th><th>Pet / serviço</th><th>Profissional e recurso</th><th>Situação</th></tr></thead>
            <tbody>
              {filteredAppointments.map((appointment) => (
                <tr key={appointment.id}>
                  <td><strong>{formatDateTime(appointment.startsAt)}</strong></td>
                  <td><strong>{appointment.pet}</strong><small className="table-secondary">{appointment.service}</small></td>
                  <td><strong>{appointment.professional}</strong><small className="table-secondary">{appointment.resource}</small></td>
                  <td><select className={`status-select status-select--${appointment.status.toLowerCase().replaceAll(' ', '-')}`} aria-label={`Situação do agendamento de ${appointment.pet}`} value={appointment.status} onChange={(event) => updateStatus(appointment.id, event.target.value as ServiceStatus)}>{statusOptions.map((status) => <option key={status}>{status}</option>)}</select></td>
                </tr>
              ))}
            </tbody>
          </table>
          {!filteredAppointments.length && <div className="module-empty">Nenhum agendamento nessa situação.</div>}
        </div>
      </section>
    </div>
  )
}
