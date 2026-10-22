import { useMemo, useState, type FormEvent } from 'react'
import SelectMenu, { type SelectOption } from '../components/SelectMenu'
import { DatePicker } from '../components/DateTimePicker'
import { demoDataKeys, useDemoData } from '../Data saving/demoPersistence'

type VaccinationRecord = {
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

const vaccineOptions: SelectOption<string>[] = [
  { value: 'Antirrábica', label: 'Antirrábica' },
  { value: 'Polivalente (V8/V10)', label: 'Polivalente (V8/V10)' },
  { value: 'Giárdia', label: 'Giárdia' },
  { value: 'Tosse dos canis', label: 'Tosse dos canis' },
  { value: 'Outra', label: 'Outra' },
]
const veterinarianOptions: SelectOption<string>[] = [
  { value: 'Dra. Marina Costa', label: 'Dra. Marina Costa' },
  { value: 'Dr. Lucas Almeida', label: 'Dr. Lucas Almeida' },
  { value: 'Dra. Bianca Santos', label: 'Dra. Bianca Santos' },
]

const vaccinationFilters: SelectOption<string>[] = [
  { value: 'Todos', label: 'Todos' },
  { value: 'Em dia', label: 'Em dia' },
  { value: 'Retorno pendente', label: 'Retorno pendente' },
]

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function isVaccinationRecord(value: unknown): value is VaccinationRecord {
  return isRecord(value)
    && typeof value.id === 'number'
    && Number.isFinite(value.id)
    && typeof value.pet === 'string'
    && typeof value.guardian === 'string'
    && typeof value.vaccine === 'string'
    && typeof value.appliedAt === 'string'
    && typeof value.returnAt === 'string'
    && typeof value.veterinarian === 'string'
    && typeof value.batch === 'string'
    && typeof value.notes === 'string'
}

function localDateInputValue(date: Date) {
  const offset = date.getTimezoneOffset()
  return new Date(date.getTime() - offset * 60_000).toISOString().slice(0, 10)
}

function formatDate(value: string) {
  if (!value) return 'Não informado'
  return new Date(`${value}T12:00:00`).toLocaleDateString('pt-BR')
}

export default function VaccinationControl() {
  const [records, setRecords, persistenceError] = useDemoData(
    demoDataKeys.vaccinations,
    [] as VaccinationRecord[],
    (value): value is VaccinationRecord[] => Array.isArray(value) && value.every(isVaccinationRecord),
  )
  const [pet, setPet] = useState('')
  const [guardian, setGuardian] = useState('')
  const [vaccine, setVaccine] = useState(vaccineOptions[0].value)
  const [appliedAt, setAppliedAt] = useState(() => localDateInputValue(new Date()))
  const [returnAt, setReturnAt] = useState('')
  const [veterinarian, setVeterinarian] = useState(veterinarianOptions[0].value)
  const [batch, setBatch] = useState('')
  const [notes, setNotes] = useState('')
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('Todos')
  const [today] = useState(() => localDateInputValue(new Date()))

  const filteredRecords = useMemo(() => records
    .filter((record) => `${record.pet} ${record.guardian}`.toLocaleLowerCase().includes(search.toLocaleLowerCase()))
    .filter((record) => filter === 'Todos'
      || (filter === 'Retorno pendente' ? Boolean(record.returnAt && record.returnAt < today) : !record.returnAt || record.returnAt >= today))
    .sort((first, second) => second.appliedAt.localeCompare(first.appliedAt)),
  [filter, records, search, today])

  function addRecord(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setRecords((current) => [{
      id: Date.now(),
      pet: pet.trim(),
      guardian: guardian.trim(),
      vaccine,
      appliedAt,
      returnAt,
      veterinarian: veterinarian.trim(),
      batch: batch.trim(),
      notes: notes.trim(),
    }, ...current])
    setPet('')
    setGuardian('')
    setVaccine(vaccineOptions[0].value)
    setAppliedAt(localDateInputValue(new Date()))
    setReturnAt('')
    setVeterinarian(veterinarianOptions[0].value)
    setBatch('')
    setNotes('')
  }

  function removeRecord(id: number) {
    setRecords((current) => current.filter((record) => record.id !== id))
  }

  return (
    <div className="module-layout">
      {persistenceError && <p className="persistence-notice" role="alert">{persistenceError}</p>}
      <section className="module-card">
        <div className="module-card-heading">
          <div><h2>Registrar imunização</h2><p>Documente a aplicação e, quando indicado pelo médico-veterinário, a data de retorno.</p></div>
        </div>
        <form className="module-form" onSubmit={addRecord}>
          <div className="module-form-grid">
            <label>Animal<input required value={pet} onChange={(event) => setPet(event.target.value)} placeholder="Nome do animal" /></label>
            <label>Tutor<input value={guardian} onChange={(event) => setGuardian(event.target.value)} placeholder="Nome do tutor" /></label>
            <label>Vacina<SelectMenu ariaLabel="Vacina aplicada" value={vaccine} options={vaccineOptions} onChange={setVaccine} /></label>
            <DatePicker label="Data da aplicação" value={appliedAt} onChange={(value) => {
              setAppliedAt(value)
              if (returnAt && returnAt < value) setReturnAt('')
            }} />
            <DatePicker label="Retorno recomendado" value={returnAt} min={appliedAt} clearable onChange={setReturnAt} />
            <label>Médico-veterinário<SelectMenu ariaLabel="Médico-veterinário responsável pela vacinação" value={veterinarian} options={veterinarianOptions} onChange={setVeterinarian} /></label>
            <label>Lote<input value={batch} onChange={(event) => setBatch(event.target.value)} placeholder="Identificação do lote" /></label>
            <label>Observações<input value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Informações adicionais" /></label>
          </div>
          <div className="module-form-footer"><button className="module-button module-button--primary" type="submit">Salvar imunização</button></div>
        </form>
      </section>

      <section className="module-card">
        <div className="module-card-heading">
          <div><h2>Histórico sanitário</h2><p>Consulte aplicações anteriores e acompanhe retornos registrados.</p></div>
          <span className="module-count">{records.length} registros</span>
        </div>
        <div className="module-toolbar">
          <label className="module-search">Buscar animal ou tutor<input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Digite para buscar" /></label>
          <label className="compact-filter"><span>Retorno</span><SelectMenu ariaLabel="Filtrar imunizações por retorno" value={filter} options={vaccinationFilters} onChange={setFilter} /></label>
        </div>
        {filteredRecords.length ? (
          <div className="module-table-wrap">
            <table className="module-table">
              <thead><tr><th>Animal / tutor</th><th>Imunização</th><th>Aplicada em</th><th>Retorno</th><th>Profissional / lote</th><th>Ações</th></tr></thead>
              <tbody>
                {filteredRecords.map((record) => (
                  <tr key={record.id}>
                    <td data-label="Animal / tutor"><strong>{record.pet}</strong><small className="table-secondary">{record.guardian || 'Tutor não informado'}</small></td>
                    <td data-label="Imunização">{record.vaccine}<small className="table-secondary">{record.notes}</small></td>
                    <td data-label="Aplicada em">{formatDate(record.appliedAt)}</td>
                    <td data-label="Retorno">{record.returnAt ? formatDate(record.returnAt) : 'Não definido'}</td>
                    <td data-label="Profissional / lote">{record.veterinarian}<small className="table-secondary">Lote: {record.batch || 'não informado'}</small></td>
                    <td data-label="Ações"><button className="module-button module-button--secondary" type="button" onClick={() => removeRecord(record.id)} aria-label={`Excluir registro de ${record.pet}`}>Excluir</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : <div className="module-empty">{records.length ? 'Nenhum registro corresponde a essa busca ou filtro.' : 'Nenhuma imunização registrada. Use o formulário para iniciar o histórico.'}</div>}
        <p className="module-form-hint">O calendário vacinal e a necessidade de reforços devem ser definidos pelo médico-veterinário responsável.</p>
      </section>
    </div>
  )
}
