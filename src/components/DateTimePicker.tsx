import { useEffect, useId, useMemo, useRef, useState } from 'react'

const weekdays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

function formatDate(value: string) {
  const [year, month, day] = value.split('-').map(Number)
  return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short' }).format(new Date(year, month - 1, day))
}

function getCalendarMonth(value: string) {
  if (!value) return new Date(new Date().getFullYear(), new Date().getMonth(), 1)
  const [year, month] = value.split('-').map(Number)
  return new Date(year, month - 1, 1)
}

type DatePickerProps = {
  label: string
  value: string
  onChange: (value: string) => void
  min?: string
  clearable?: boolean
}

export function DatePicker({ label, value, onChange, min, clearable = false }: DatePickerProps) {
  const id = useId()
  const dialogRef = useRef<HTMLDialogElement>(null)
  const [open, setOpen] = useState(false)
  const [calendarMonth, setCalendarMonth] = useState(() => getCalendarMonth(value))
  const calendarDays = useMemo(() => {
    const firstWeekday = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), 1).getDay()
    const dayCount = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 0).getDate()
    return [
      ...Array.from({ length: firstWeekday }, () => null),
      ...Array.from({ length: dayCount }, (_, index) => index + 1),
    ]
  }, [calendarMonth])

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (open && !dialog.open) dialog.showModal()
    else if (!open && dialog.open) dialog.close()
  }, [open])

  return (
    <label>{label}
      <button
        className="date-picker-trigger"
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => {
          setCalendarMonth(getCalendarMonth(value))
          setOpen(true)
        }}
      >
        {value ? formatDate(value) : 'Selecionar data'}<span aria-hidden="true">▾</span>
      </button>
      {open && (
        <dialog
          className="date-picker-dialog"
          ref={dialogRef}
          aria-labelledby={`${id}-title`}
          onClose={() => setOpen(false)}
        >
          <div className="date-picker-heading">
            <button type="button" aria-label="Mês anterior" onClick={() => setCalendarMonth((month) => new Date(month.getFullYear(), month.getMonth() - 1, 1))}>‹</button>
            <h2 id={`${id}-title`}>{new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' }).format(calendarMonth)}</h2>
            <button type="button" aria-label="Próximo mês" onClick={() => setCalendarMonth((month) => new Date(month.getFullYear(), month.getMonth() + 1, 1))}>›</button>
          </div>
          <div className="date-picker-grid" role="group" aria-label="Escolher data">
            {weekdays.map((weekday) => <span className="date-picker-weekday" key={weekday}>{weekday}</span>)}
            {calendarDays.map((day, index) => {
              if (day === null) return <span className="date-picker-empty" key={`empty-${index}`} aria-hidden="true" />
              const year = calendarMonth.getFullYear()
              const month = String(calendarMonth.getMonth() + 1).padStart(2, '0')
              const selectedDate = `${year}-${month}-${String(day).padStart(2, '0')}`
              const selected = selectedDate === value
              const disabled = Boolean(min && selectedDate < min)
              return (
                <button
                  className={`date-picker-day${selected ? ' date-picker-day--selected' : ''}`}
                  type="button"
                  aria-label={new Intl.DateTimeFormat('pt-BR', { dateStyle: 'full' }).format(new Date(year, calendarMonth.getMonth(), day))}
                  aria-pressed={selected}
                  disabled={disabled}
                  key={selectedDate}
                  onClick={() => {
                    onChange(selectedDate)
                    dialogRef.current?.close()
                  }}
                >
                  {day}
                </button>
              )
            })}
          </div>
          <div className="date-picker-actions">
            {clearable && <button className="secondary-button" type="button" onClick={() => {
              onChange('')
              dialogRef.current?.close()
            }}>Limpar data</button>}
            <button className="secondary-button" type="button" onClick={() => dialogRef.current?.close()}>Cancelar</button>
          </div>
        </dialog>
      )}
    </label>
  )
}

type TimePickerProps = {
  label: string
  value: string
  onChange: (value: string) => void
  options: readonly string[]
}

export function TimePicker({ label, value, onChange, options }: TimePickerProps) {
  const id = useId()
  const dialogRef = useRef<HTMLDialogElement>(null)
  const [open, setOpen] = useState(false)
  const [draftTime, setDraftTime] = useState(value)
  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (open && !dialog.open) dialog.showModal()
    else if (!open && dialog.open) dialog.close()
  }, [open])

  return (
    <label>{label}
      <button
        className="date-picker-trigger"
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => {
          setDraftTime(value)
          setOpen(true)
        }}
      >
        {value}<span aria-hidden="true">▾</span>
      </button>
      {open && (
        <dialog
          className="date-picker-dialog time-picker-dialog"
          ref={dialogRef}
          aria-labelledby={`${id}-title`}
          onClose={() => setOpen(false)}
        >
          <div className="date-picker-heading">
            <h2 id={`${id}-title`}>Escolher horário</h2>
          </div>
          <div className="time-picker-options time-picker-options--choices" role="group" aria-label="Horários disponíveis">
            {options.map((time) => (
              <button
                className={`time-picker-option${draftTime === time ? ' time-picker-option--selected' : ''}`}
                type="button"
                aria-pressed={draftTime === time}
                key={time}
                onClick={() => setDraftTime(time)}
              >
                {time}
              </button>
            ))}
          </div>
          <div className="date-picker-actions">
            <button className="secondary-button" type="button" onClick={() => dialogRef.current?.close()}>Cancelar</button>
            <button className="primary-button" type="button" onClick={() => {
              onChange(draftTime)
              dialogRef.current?.close()
            }}>Usar horário</button>
          </div>
        </dialog>
      )}
    </label>
  )
}
