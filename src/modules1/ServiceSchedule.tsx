import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react'
import SelectMenu, { type SelectOption } from '../components/SelectMenu'
import { demoDataKeys, useDemoData } from '../Data saving/demoPersistence'

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
const weekdays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
const hours = Array.from({ length: 24 }, (_, hour) => String(hour).padStart(2, '0'))
const minutes = Array.from({ length: 60 }, (_, minute) => String(minute).padStart(2, '0'))
const serviceOptions = ['Consulta veterinária', 'Vacinação', 'Exame', 'Banho e tosa', 'Retorno']
const professionalOptions = ['Dra. Marina Costa', 'Dr. Lucas Almeida', 'Dra. Bianca Santos']
const resourceOptions = ['Consultório 1', 'Consultório 2', 'Sala de estética', 'Sala de exames']
const filterOptions: SelectOption<string>[] = ['Todos', ...statusOptions].map((status) => ({ value: status, label: status }))
const appointmentStatusOptions: SelectOption<ServiceStatus>[] = statusOptions.map((status) => ({ value: status, label: status }))

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

function formatDate(value: string) {
  const [year, month, day] = value.split('-').map(Number)
  return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short' }).format(new Date(year, month - 1, day))
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
  const [datePickerOpen, setDatePickerOpen] = useState(false)
  const [timePickerOpen, setTimePickerOpen] = useState(false)
  const [draftTime, setDraftTime] = useState(startsAt.slice(11, 16))
  const [calendarMonth, setCalendarMonth] = useState(() => {
    const [year, month] = startsAt.slice(0, 7).split('-').map(Number)
    return new Date(year, month - 1, 1)
  })
  const datePickerRef = useRef<HTMLDialogElement>(null)
  const timePickerRef = useRef<HTMLDialogElement>(null)
  const filteredAppointments = useMemo(
    () => appointments.filter((appointment) => filterStatus === 'Todos' || appointment.status === filterStatus),
    [appointments, filterStatus],
  )
  const calendarDays = useMemo(() => {
    const firstWeekday = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), 1).getDay()
    const dayCount = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 0).getDate()
    return [
      ...Array.from({ length: firstWeekday }, () => null),
      ...Array.from({ length: dayCount }, (_, index) => index + 1),
    ]
  }, [calendarMonth])

  useEffect(() => {
    const dialog = datePickerRef.current
    if (!dialog) return
    if (datePickerOpen && !dialog.open) dialog.showModal()
    else if (!datePickerOpen && dialog.open) dialog.close()
  }, [datePickerOpen])

  useEffect(() => {
    const dialog = timePickerRef.current
    if (!dialog) return
    if (timePickerOpen && !dialog.open) dialog.showModal()
    else if (!timePickerOpen && dialog.open) dialog.close()
  }, [timePickerOpen])

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
    <div className="module-layout service-schedule">
      {persistenceError && <p className="persistence-notice" role="alert">{persistenceError}</p>}
      <section className="module-card">
        <div className="module-card-heading"><div><h2>Novo agendamento</h2><p>Escolha o serviço, profissional, recurso e horário.</p></div></div>
        <form className="module-form" onSubmit={addAppointment}>
          <div className="module-form-grid">
            <label>Pet e tutor<input required value={pet} onChange={(event) => setPet(event.target.value)} placeholder="Ex.: Bento · Ana Souza" /></label>
            <label>Serviço<SelectMenu ariaLabel="Serviço" value={service} options={serviceOptions.map((option) => ({ value: option, label: option }))} onChange={setService} /></label>
            <label>Profissional<SelectMenu ariaLabel="Profissional" value={professional} options={professionalOptions.map((option) => ({ value: option, label: option }))} onChange={setProfessional} /></label>
            <label>Recurso<SelectMenu ariaLabel="Recurso" value={resource} options={resourceOptions.map((option) => ({ value: option, label: option }))} onChange={setResource} /></label>
            <div className="field-full date-time-fields">
              <label>Data<button className="date-picker-trigger" type="button" aria-haspopup="dialog" aria-expanded={datePickerOpen} onClick={() => {
                const [year, month] = startsAt.slice(0, 7).split('-').map(Number)
                setCalendarMonth(new Date(year, month - 1, 1))
                setDatePickerOpen(true)
              }}>{formatDate(startsAt.slice(0, 10))}<span aria-hidden="true">▾</span></button></label>
              <label>Horário<button className="date-picker-trigger" type="button" aria-haspopup="dialog" aria-expanded={timePickerOpen} onClick={() => {
                setDraftTime(startsAt.slice(11, 16))
                setTimePickerOpen(true)
              }}>{startsAt.slice(11, 16)}<span aria-hidden="true">▾</span></button></label>
            </div>
          </div>
          <div className="module-form-footer"><button className="module-button module-button--primary" type="submit">Criar agendamento</button></div>
        </form>
      </section>

      {datePickerOpen && (
        <dialog
          className="date-picker-dialog"
          ref={datePickerRef}
          aria-labelledby="schedule-date-picker-title"
          onClose={() => setDatePickerOpen(false)}
        >
          <div className="date-picker-heading">
            <button type="button" aria-label="Mês anterior" onClick={() => setCalendarMonth((month) => new Date(month.getFullYear(), month.getMonth() - 1, 1))}>‹</button>
            <h2 id="schedule-date-picker-title">{new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' }).format(calendarMonth)}</h2>
            <button type="button" aria-label="Próximo mês" onClick={() => setCalendarMonth((month) => new Date(month.getFullYear(), month.getMonth() + 1, 1))}>›</button>
          </div>
          <div className="date-picker-grid" role="group" aria-label="Escolher data">
            {weekdays.map((weekday) => <span className="date-picker-weekday" key={weekday}>{weekday}</span>)}
            {calendarDays.map((day, index) => {
              if (day === null) return <span className="date-picker-empty" key={`empty-${index}`} aria-hidden="true" />
              const year = calendarMonth.getFullYear()
              const month = String(calendarMonth.getMonth() + 1).padStart(2, '0')
              const date = `${year}-${month}-${String(day).padStart(2, '0')}`
              const selected = date === startsAt.slice(0, 10)
              return (
                <button
                  className={`date-picker-day${selected ? ' date-picker-day--selected' : ''}`}
                  type="button"
                  aria-label={new Intl.DateTimeFormat('pt-BR', { dateStyle: 'full' }).format(new Date(year, calendarMonth.getMonth(), day))}
                  aria-pressed={selected}
                  key={date}
                  onClick={() => {
                    setStartsAt(`${date}T${startsAt.slice(11, 16)}`)
                    datePickerRef.current?.close()
                  }}
                >
                  {day}
                </button>
              )
            })}
          </div>
          <div className="date-picker-actions">
            <button className="secondary-button" type="button" onClick={() => datePickerRef.current?.close()}>Cancelar</button>
          </div>
        </dialog>
      )}

      {timePickerOpen && (
        <dialog
          className="date-picker-dialog time-picker-dialog"
          ref={timePickerRef}
          aria-labelledby="schedule-time-picker-title"
          onClose={() => setTimePickerOpen(false)}
        >
          <div className="date-picker-heading">
            <h2 id="schedule-time-picker-title">Escolher horário</h2>
          </div>
          <div className="time-picker-columns">
            <div className="time-picker-column" role="group" aria-label="Hora">
              <span>Hora</span>
              <div className="time-picker-options time-picker-options--hours">
                {hours.map((hour) => (
                  <button
                    className={`time-picker-option${draftTime.slice(0, 2) === hour ? ' time-picker-option--selected' : ''}`}
                    type="button"
                    aria-pressed={draftTime.slice(0, 2) === hour}
                    key={hour}
                    onClick={() => setDraftTime(`${hour}:${draftTime.slice(3, 5)}`)}
                  >
                    {hour}
                  </button>
                ))}
              </div>
            </div>
            <div className="time-picker-column" role="group" aria-label="Minuto">
              <span>Minuto</span>
              <div className="time-picker-options time-picker-options--minutes">
                {minutes.map((minute) => (
                  <button
                    className={`time-picker-option${draftTime.slice(3, 5) === minute ? ' time-picker-option--selected' : ''}`}
                    type="button"
                    aria-pressed={draftTime.slice(3, 5) === minute}
                    key={minute}
                    onClick={() => setDraftTime(`${draftTime.slice(0, 2)}:${minute}`)}
                  >
                    {minute}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="date-picker-actions">
            <button className="secondary-button" type="button" onClick={() => timePickerRef.current?.close()}>Cancelar</button>
            <button className="primary-button" type="button" onClick={() => {
              setStartsAt(`${startsAt.slice(0, 10)}T${draftTime}`)
              timePickerRef.current?.close()
            }}>Usar horário</button>
          </div>
        </dialog>
      )}

      <section className="module-card">
        <div className="module-card-heading">
          <div><h2>Agenda de serviços</h2><p>Atualize a situação conforme o atendimento avança.</p></div>
          <label className="compact-filter"><span>Filtrar</span><SelectMenu ariaLabel="Filtrar por situação" value={filterStatus} options={filterOptions} onChange={setFilterStatus} /></label>
        </div>
        <div className="module-table-wrap">
          <table className="module-table">
            <thead><tr><th>Data e horário</th><th>Pet / serviço</th><th>Profissional e recurso</th><th>Situação</th></tr></thead>
            <tbody>
              {filteredAppointments.map((appointment) => (
                <tr key={appointment.id}>
                  <td data-label="Data e horário"><strong>{formatDateTime(appointment.startsAt)}</strong></td>
                  <td data-label="Pet / serviço"><strong>{appointment.pet}</strong><small className="table-secondary">{appointment.service}</small></td>
                  <td data-label="Profissional e recurso"><strong>{appointment.professional}</strong><small className="table-secondary">{appointment.resource}</small></td>
                  <td data-label="Situação"><SelectMenu className={`status-select status-select--${appointment.status.toLowerCase().replaceAll(' ', '-')}`} ariaLabel={`Situação do agendamento de ${appointment.pet}`} value={appointment.status} options={appointmentStatusOptions} onChange={(status) => updateStatus(appointment.id, status)} /></td>
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
