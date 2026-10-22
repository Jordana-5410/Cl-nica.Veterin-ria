import { useMemo, useState, type FormEvent } from 'react'
import SelectMenu, { type SelectOption } from '../components/SelectMenu'
import { DatePicker, TimePicker } from '../components/DateTimePicker'
import { demoDataKeys, useDemoData } from '../Data saving/demoPersistence'

type GroomingStatus = 'Agendado' | 'Concluído' | 'Cancelado'
type GroomingAppointment = {
  id: number
  pet: string
  guardian: string
  service: string
  professional: string
  size: string
  date: string
  time: string
  status: GroomingStatus
}

const services = ['Banho', 'Tosa', 'Banho e tosa', 'Hidratação']
const professionals = ['Ana Souza', 'Bruno Lima', 'Carla Mendes']
const petSizes = ['Pequeno', 'Médio', 'Grande']
const statuses: GroomingStatus[] = ['Agendado', 'Concluído', 'Cancelado']
const statusOptions: SelectOption<GroomingStatus>[] = statuses.map((status) => ({ value: status, label: status }))
const professionalFilters: SelectOption<string>[] = [
  { value: 'Todos', label: 'Todos os profissionais' },
  ...professionals.map((professional) => ({ value: professional, label: professional })),
]
const timeSlots = Array.from({ length: 21 }, (_, index) => {
  const minutes = 8 * 60 + index * 30
  return `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`
})

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function isGroomingAppointment(value: unknown): value is GroomingAppointment {
  return isRecord(value)
    && typeof value.id === 'number'
    && Number.isFinite(value.id)
    && typeof value.pet === 'string'
    && typeof value.guardian === 'string'
    && typeof value.service === 'string'
    && typeof value.professional === 'string'
    && typeof value.size === 'string'
    && typeof value.date === 'string'
    && typeof value.time === 'string'
    && typeof value.status === 'string'
    && statuses.some((status) => status === value.status)
}

function localDateInputValue(date: Date) {
  const offset = date.getTimezoneOffset()
  return new Date(date.getTime() - offset * 60_000).toISOString().slice(0, 10)
}

export default function GroomingSchedule() {
  const [appointments, setAppointments, persistenceError] = useDemoData(
    demoDataKeys.grooming,
    [] as GroomingAppointment[],
    (value): value is GroomingAppointment[] => Array.isArray(value) && value.every(isGroomingAppointment),
  )
  const [pet, setPet] = useState('')
  const [guardian, setGuardian] = useState('')
  const [service, setService] = useState(services[0])
  const [professional, setProfessional] = useState(professionals[0])
  const [size, setSize] = useState(petSizes[0])
  const [date, setDate] = useState(() => localDateInputValue(new Date()))
  const [today] = useState(() => localDateInputValue(new Date()))
  const [time, setTime] = useState(timeSlots[0])
  const [selectedDay, setSelectedDay] = useState(() => localDateInputValue(new Date()))
  const [professionalFilter, setProfessionalFilter] = useState('Todos')
  const [error, setError] = useState('')

  const dayAppointments = useMemo(() => appointments
    .filter((appointment) => appointment.date === selectedDay)
    .filter((appointment) => professionalFilter === 'Todos' || appointment.professional === professionalFilter)
    .sort((first, second) => first.time.localeCompare(second.time)),
  [appointments, professionalFilter, selectedDay])

  function addAppointment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (appointments.some((appointment) => appointment.date === date && appointment.time === time
      && appointment.professional === professional && appointment.status !== 'Cancelado')) {
      setError('Esse profissional já tem um serviço nesse horário. Escolha outro horário ou profissional.')
      return
    }
    setAppointments((current) => [{
      id: Date.now(),
      pet: pet.trim(),
      guardian: guardian.trim(),
      service,
      professional,
      size,
      date,
      time,
      status: 'Agendado',
    }, ...current])
    setSelectedDay(date)
    setProfessionalFilter('Todos')
    setPet('')
    setGuardian('')
    setService(services[0])
    setProfessional(professionals[0])
    setSize(petSizes[0])
    setTime(timeSlots[0])
    setError('')
  }

  function updateStatus(id: number, status: GroomingStatus) {
    setAppointments((current) => current.map((appointment) => appointment.id === id ? { ...appointment, status } : appointment))
  }

  function removeAppointment(id: number) {
    setAppointments((current) => current.filter((appointment) => appointment.id !== id))
  }

  return (
    <div className="module-layout">
      {persistenceError && <p className="persistence-notice" role="alert">{persistenceError}</p>}
      <section className="module-card">
        <div className="module-card-heading"><div><h2>Agendar banho ou tosa</h2><p>Escolha o horário, profissional e porte do animal.</p></div></div>
        <form className="module-form" onSubmit={addAppointment}>
          <div className="module-form-grid">
            <label>Animal<input required value={pet} onChange={(event) => setPet(event.target.value)} placeholder="Nome do animal" /></label>
            <label>Tutor<input value={guardian} onChange={(event) => setGuardian(event.target.value)} placeholder="Nome do tutor" /></label>
            <label>Serviço<SelectMenu ariaLabel="Serviço estético" value={service} options={services.map((option) => ({ value: option, label: option }))} onChange={setService} /></label>
            <label>Profissional<SelectMenu ariaLabel="Profissional do serviço estético" value={professional} options={professionals.map((option) => ({ value: option, label: option }))} onChange={setProfessional} /></label>
            <label>Porte do pet<SelectMenu ariaLabel="Porte do animal" value={size} options={petSizes.map((option) => ({ value: option, label: option }))} onChange={setSize} /></label>
            <DatePicker label="Data" value={date} min={today} onChange={setDate} />
            <TimePicker label="Horário" value={time} options={timeSlots} onChange={setTime} />
          </div>
          {error && <p className="module-error" role="alert">{error}</p>}
          <div className="module-form-footer"><button className="module-button module-button--primary" type="submit">Agendar serviço</button></div>
        </form>
      </section>

      <section className="module-card">
        <div className="module-card-heading"><div><h2>Grade de horários</h2><p>Serviços estéticos organizados em intervalos de 30 minutos.</p></div><span className="module-count">{dayAppointments.length} agendamentos</span></div>
        <div className="module-toolbar">
          <DatePicker label="Dia" value={selectedDay} onChange={setSelectedDay} />
          <label className="compact-filter"><span>Profissional</span><SelectMenu ariaLabel="Filtrar grade por profissional" value={professionalFilter} options={professionalFilters} onChange={setProfessionalFilter} /></label>
        </div>
        <div className="grooming-grid-wrap">
          <table className="grooming-grid">
            <thead><tr><th>Horário</th><th>Serviços e situação</th></tr></thead>
            <tbody>
              {timeSlots.map((slot) => {
                const slotAppointments = dayAppointments.filter((appointment) => appointment.time === slot)
                return (
                  <tr key={slot}>
                    <th scope="row">{slot}</th>
                    <td>
                      {slotAppointments.length ? slotAppointments.map((appointment) => (
                        <div className="grooming-slot" key={appointment.id}>
                          <span><strong>{appointment.pet}</strong><small>{appointment.service} · porte {appointment.size} · {appointment.professional}{appointment.guardian ? ` · tutor ${appointment.guardian}` : ''}</small></span>
                          <SelectMenu className={`status-select status-select--${appointment.status.toLowerCase()}`} ariaLabel={`Situação do serviço de ${appointment.pet}`} value={appointment.status} options={statusOptions} onChange={(status) => updateStatus(appointment.id, status)} />
                          <button className="module-button module-button--secondary" type="button" onClick={() => removeAppointment(appointment.id)} aria-label={`Excluir agendamento de ${appointment.pet}`}>Excluir</button>
                        </div>
                      )) : <span className="grooming-slot-empty">Disponível</span>}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
