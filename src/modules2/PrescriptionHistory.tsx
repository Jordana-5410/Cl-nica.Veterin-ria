import { useMemo, useState, type FormEvent } from 'react'
import { DatePicker } from '../components/DateTimePicker'
import SelectMenu, { type SelectOption } from '../components/SelectMenu'
import { demoDataKeys, useDemoData } from '../Data saving/demoPersistence'
import { clinicProfessionals } from '../modules1/clinicDefaults'

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

const otherMedicationValue = '__other_medication__'
const otherDiagnosisValue = '__other_diagnosis__'
const otherRouteValue = '__other_route__'
const diagnosisOptions: SelectOption<string>[] = [
  { value: 'Consulta e avaliação clínica', label: 'Consulta e avaliação clínica' },
  { value: 'Prevenção', label: 'Prevenção' },
  { value: 'Acompanhamento veterinário', label: 'Acompanhamento veterinário' },
  { value: 'Tratamento', label: 'Tratamento' },
  { value: 'Pós-operatório', label: 'Pós-operatório' },
  { value: 'Controle de parasitas', label: 'Controle de parasitas' },
  { value: otherDiagnosisValue, label: 'Outro…' },
]
const medicationOptions: SelectOption<string>[] = [
  { value: '', label: 'Selecione um medicamento' },
  { value: 'Amoxicilina + Clavulanato', label: 'Antibióticos · Amoxicilina + Clavulanato' },
  { value: 'Cefalexina', label: 'Antibióticos · Cefalexina' },
  { value: 'Meloxicam', label: 'Anti-inflamatórios e analgésicos · Meloxicam' },
  { value: 'Carprofeno', label: 'Anti-inflamatórios e analgésicos · Carprofeno' },
  { value: 'Fenbendazol', label: 'Antiparasitários · Fenbendazol' },
  { value: 'Praziquantel', label: 'Antiparasitários · Praziquantel' },
  { value: 'Fipronil', label: 'Antiparasitários · Fipronil' },
  { value: 'Clorexidina', label: 'Medicamentos dermatológicos · Clorexidina' },
  { value: 'Miconazol', label: 'Medicamentos dermatológicos · Miconazol' },
  { value: otherMedicationValue, label: 'Outro medicamento…' },
]
const routeOptions: SelectOption<string>[] = [
  { value: 'Oral', label: 'Oral' },
  { value: 'Tópica', label: 'Tópica' },
  { value: 'Outra via', label: 'Outra via…' },
]

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function isPrescription(value: unknown): value is Prescription {
  return isRecord(value)
    && typeof value.id === 'number'
    && Number.isFinite(value.id)
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

function localDateInputValue(date: Date) {
  const offset = date.getTimezoneOffset()
  return new Date(date.getTime() - offset * 60_000).toISOString().slice(0, 10)
}

function formatDate(value: string) {
  return new Date(`${value}T12:00:00`).toLocaleDateString('pt-BR')
}

export default function PrescriptionHistory() {
  const [prescriptions, setPrescriptions, persistenceError] = useDemoData(
    demoDataKeys.prescriptions,
    [] as Prescription[],
    (value): value is Prescription[] => Array.isArray(value) && value.every(isPrescription),
  )
  const [pet, setPet] = useState('')
  const [guardian, setGuardian] = useState('')
  const [veterinarian, setVeterinarian] = useState(clinicProfessionals[0])
  const [date, setDate] = useState(() => localDateInputValue(new Date()))
  const [diagnosis, setDiagnosis] = useState('')
  const [customDiagnosis, setCustomDiagnosis] = useState('')
  const [medication, setMedication] = useState('')
  const [customMedication, setCustomMedication] = useState('')
  const [dosage, setDosage] = useState('')
  const [route, setRoute] = useState('')
  const [customRoute, setCustomRoute] = useState('')
  const [frequency, setFrequency] = useState('')
  const [duration, setDuration] = useState('')
  const [instructions, setInstructions] = useState('')
  const [search, setSearch] = useState('')
  const [expandedId, setExpandedId] = useState<number | null>(null)
  const [formError, setFormError] = useState('')

  const filteredPrescriptions = useMemo(() => prescriptions
    .filter((prescription) => `${prescription.pet} ${prescription.guardian} ${prescription.medication}`.toLocaleLowerCase().includes(search.toLocaleLowerCase()))
    .sort((first, second) => second.date.localeCompare(first.date)),
  [prescriptions, search])

  function addPrescription(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const medicationName = medication === otherMedicationValue ? customMedication.trim() : medication
    const diagnosisValue = diagnosis === otherDiagnosisValue ? customDiagnosis.trim() : diagnosis
    const routeValue = route === otherRouteValue ? customRoute.trim() : route
    if (!medicationName) {
      setFormError(medication === otherMedicationValue
        ? 'Informe o nome do medicamento.'
        : 'Selecione um medicamento.')
      return
    }
    if (!diagnosisValue || !routeValue) {
      setFormError('Informe o diagnóstico/finalidade e a via de administração.')
      return
    }
    setPrescriptions((current) => [{
      id: Date.now(),
      pet: pet.trim(),
      guardian: guardian.trim(),
      veterinarian: veterinarian.trim(),
      date,
      diagnosis: diagnosisValue,
      medication: medicationName,
      dosage: dosage.trim(),
      route: routeValue,
      frequency: frequency.trim(),
      duration: duration.trim(),
      instructions: instructions.trim(),
    }, ...current])
    setPet('')
    setGuardian('')
    setVeterinarian(clinicProfessionals[0])
    setDate(localDateInputValue(new Date()))
    setDiagnosis('')
    setCustomDiagnosis('')
    setMedication('')
    setCustomMedication('')
    setDosage('')
    setRoute('')
    setCustomRoute('')
    setFrequency('')
    setDuration('')
    setInstructions('')
    setFormError('')
  }

  function removePrescription(id: number) {
    setPrescriptions((current) => current.filter((prescription) => prescription.id !== id))
    if (expandedId === id) setExpandedId(null)
  }

  return (
    <div className="module-layout">
      {persistenceError && <p className="persistence-notice" role="alert">{persistenceError}</p>}
      <section className="module-card">
        <div className="module-card-heading"><div><h2>Emitir receita veterinária</h2><p>Registre as orientações prescritas pelo profissional para consulta no histórico.</p></div></div>
        <form className="module-form" onSubmit={addPrescription}>
          <div className="module-form-grid">
            <label>Animal<input required value={pet} onChange={(event) => setPet(event.target.value)} placeholder="Nome do animal" /></label>
            <label>Tutor<input value={guardian} onChange={(event) => setGuardian(event.target.value)} placeholder="Nome do tutor" /></label>
            <label>Médico-veterinário<SelectMenu ariaLabel="Médico-veterinário" value={veterinarian} options={clinicProfessionals.map((professional) => ({ value: professional, label: professional }))} onChange={setVeterinarian} /></label>
            <DatePicker label="Data da receita" value={date} onChange={setDate} />
            <label>Diagnóstico / finalidade<SelectMenu ariaLabel="Diagnóstico ou finalidade" value={diagnosis} options={[
              { value: '', label: 'Selecione uma finalidade' },
              ...diagnosisOptions,
            ]} onChange={(value) => {
              setDiagnosis(value)
              if (value !== otherDiagnosisValue) setCustomDiagnosis('')
              setFormError('')
            }} /></label>
            {diagnosis === otherDiagnosisValue && <label>Outra finalidade<input required value={customDiagnosis} onChange={(event) => {
              setCustomDiagnosis(event.target.value)
              setFormError('')
            }} placeholder="Descreva a finalidade" /></label>}
            <label>Medicamento<SelectMenu ariaLabel="Medicamento prescrito" value={medication} options={medicationOptions} onChange={(value) => {
              setMedication(value)
              if (value !== otherMedicationValue) setCustomMedication('')
              setFormError('')
            }} /></label>
            {medication === otherMedicationValue && <label>Nome do medicamento<input required value={customMedication} onChange={(event) => {
              setCustomMedication(event.target.value)
              setFormError('')
            }} placeholder="Digite o nome do medicamento" /></label>}
            <label>Dosagem prescrita<input required value={dosage} onChange={(event) => setDosage(event.target.value)} placeholder="Conforme prescrição profissional" /></label>
            <label>Via de administração<SelectMenu ariaLabel="Via de administração" value={route} options={[
              { value: '', label: 'Selecione uma via' },
              ...routeOptions,
            ]} onChange={(value) => {
              setRoute(value === 'Outra via' ? otherRouteValue : value)
              if (value !== 'Outra via') setCustomRoute('')
              setFormError('')
            }} /></label>
            {route === otherRouteValue && <label>Outra via de administração<input required value={customRoute} onChange={(event) => {
              setCustomRoute(event.target.value)
              setFormError('')
            }} placeholder="Informe a via prescrita" /></label>}
            <label>Frequência<input required value={frequency} onChange={(event) => setFrequency(event.target.value)} placeholder="Conforme prescrição profissional" /></label>
            <label>Duração<input required value={duration} onChange={(event) => setDuration(event.target.value)} placeholder="Período indicado" /></label>
            <label className="field-full">Orientações adicionais<textarea value={instructions} onChange={(event) => setInstructions(event.target.value)} rows={3} placeholder="Cuidados e orientações registrados pelo profissional" /></label>
          </div>
          {formError && <p className="module-error" role="alert">{formError}</p>}
          <div className="module-form-footer"><button className="module-button module-button--primary" type="submit">Salvar receita</button></div>
        </form>
      </section>

      <section className="module-card">
        <div className="module-card-heading"><div><h2>Receitas registradas</h2><p>Consulte receitas associadas ao animal ou tutor.</p></div><span className="module-count">{prescriptions.length} receitas</span></div>
        <div className="module-toolbar">
          <label className="module-search">Buscar animal, tutor ou medicamento<input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Digite para buscar" /></label>
        </div>
        {filteredPrescriptions.length ? (
          <div className="prescription-list">
            {filteredPrescriptions.map((prescription) => (
              <article className="prescription-entry" key={prescription.id}>
                <div className="prescription-entry-heading">
                  <div><h3>{prescription.pet}</h3><p>{prescription.diagnosis} · {formatDate(prescription.date)}</p></div>
                  <button className="module-button module-button--secondary" type="button" aria-expanded={expandedId === prescription.id} onClick={() => setExpandedId((current) => current === prescription.id ? null : prescription.id)}>
                    {expandedId === prescription.id ? 'Ocultar receita' : 'Ver receita'}
                  </button>
                </div>
                {expandedId === prescription.id && (
                  <div className="prescription-details">
                    <p><strong>Medicamento:</strong> {prescription.medication}</p>
                    <p><strong>Dosagem:</strong> {prescription.dosage} · <strong>Via:</strong> {prescription.route}</p>
                    <p><strong>Frequência:</strong> {prescription.frequency} · <strong>Duração:</strong> {prescription.duration}</p>
                    {prescription.instructions && <p><strong>Orientações:</strong> {prescription.instructions}</p>}
                    <p><strong>Tutor:</strong> {prescription.guardian || 'Não informado'} · <strong>Prescritor:</strong> {prescription.veterinarian}</p>
                    <button className="module-button module-button--secondary" type="button" onClick={() => removePrescription(prescription.id)}>Excluir registro</button>
                  </div>
                )}
              </article>
            ))}
          </div>
        ) : <div className="module-empty">{prescriptions.length ? 'Nenhuma receita corresponde à busca.' : 'Nenhuma receita registrada. Use o formulário para começar o histórico.'}</div>}
        <p className="module-form-hint">Este módulo organiza registros demonstrativos; diagnóstico, medicamento e posologia devem ser definidos pelo médico-veterinário responsável.</p>
      </section>
    </div>
  )
}
