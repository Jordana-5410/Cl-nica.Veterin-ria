import { useMemo, useState, type FormEvent } from 'react'
import { demoDataKeys, useDemoData } from '../Data saving/demoPersistence'
import {
  clinicSourceLabels,
  findRelatedActivities,
  readClinicActivities,
  type ClinicActivity,
  type ClinicSource,
} from './clinicData'

type Participant = {
  id: number
  name: string
  contact: string
  pet: string
  interests: string[]
  createdAt: string
}

type ParticipantDestination = ClinicSource

type ParticipantRegistryProps = {
  onNavigate: (module: ParticipantDestination) => void
}

const interestOptions = [
  'Consultas e exames',
  'Vacinação e prevenção',
  'Banho e tosa',
  'Orientações clínicas',
]
const interestDestinations: Record<string, ClinicSource> = {
  'Consultas e exames': 'schedule',
  'Vacinação e prevenção': 'vaccinations',
  'Banho e tosa': 'grooming',
  'Orientações clínicas': 'prescriptions',
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isParticipant(value: unknown): value is Participant {
  return isRecord(value)
    && typeof value.id === 'number'
    && Number.isFinite(value.id)
    && typeof value.name === 'string'
    && typeof value.contact === 'string'
    && typeof value.pet === 'string'
    && Array.isArray(value.interests)
    && value.interests.every((interest) => typeof interest === 'string')
    && typeof value.createdAt === 'string'
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Não foi possível carregar as atividades da clínica.'
}

function formatDate(value: string) {
  if (!value) return 'Sem data'
  return new Date(`${value}T12:00:00`).toLocaleDateString('pt-BR')
}

export default function ParticipantRegistry({ onNavigate }: ParticipantRegistryProps) {
  const [participants, setParticipants, persistenceError] = useDemoData(
    demoDataKeys.participants,
    [] as Participant[],
    (value): value is Participant[] => Array.isArray(value) && value.every(isParticipant),
  )
  const [activityState, setActivityState] = useState(() => {
    try {
      return { activities: readClinicActivities(), error: null as string | null }
    } catch (error) {
      return { activities: [] as ClinicActivity[], error: getErrorMessage(error) }
    }
  })
  const { activities, error: activityError } = activityState
  const [name, setName] = useState('')
  const [contact, setContact] = useState('')
  const [pet, setPet] = useState('')
  const [interests, setInterests] = useState<string[]>([])
  const [search, setSearch] = useState('')
  const [editingId, setEditingId] = useState<number | null>(null)
  const [formError, setFormError] = useState('')

  function refreshActivities() {
    try {
      setActivityState({ activities: readClinicActivities(), error: null })
    } catch (error) {
      setActivityState((current) => ({ ...current, error: getErrorMessage(error) }))
    }
  }

  const filteredParticipants = useMemo(() => participants
    .filter((participant) => `${participant.name} ${participant.contact} ${participant.pet} ${participant.interests.join(' ')}`
      .toLocaleLowerCase('pt-BR')
      .includes(search.trim().toLocaleLowerCase('pt-BR')))
    .sort((first, second) => second.createdAt.localeCompare(first.createdAt)),
  [participants, search])

  function resetForm() {
    setEditingId(null)
    setName('')
    setContact('')
    setPet('')
    setInterests([])
    setFormError('')
  }

  function toggleInterest(interest: string, checked: boolean) {
    setInterests((current) => checked
      ? [...current, interest]
      : current.filter((value) => value !== interest))
  }

  function saveParticipant(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (interests.length === 0) {
      setFormError('Selecione pelo menos um interesse para relacionar atividades ao participante.')
      return
    }

    const participantData = {
      name: name.trim(),
      contact: contact.trim(),
      pet: pet.trim(),
      interests,
    }
    if (editingId !== null) {
      setParticipants((current) => current.map((participant) => participant.id === editingId
        ? { ...participant, ...participantData }
        : participant))
    } else {
      const id = Math.max(Date.now(), ...participants.map((participant) => participant.id + 1))
      setParticipants((current) => [{
        id,
        ...participantData,
        createdAt: new Date().toISOString(),
      }, ...current])
    }
    resetForm()
  }

  function startEditing(participant: Participant) {
    setEditingId(participant.id)
    setName(participant.name)
    setContact(participant.contact)
    setPet(participant.pet)
    setInterests(participant.interests)
    setFormError('')
  }

  function removeParticipant(id: number) {
    setParticipants((current) => current.filter((participant) => participant.id !== id))
    if (editingId === id) resetForm()
  }

  function relatedActivities(participant: Participant) {
    return findRelatedActivities(activities, participant)
  }

  return (
    <div className="module-layout">
      {persistenceError && <p className="persistence-notice" role="alert">{persistenceError}</p>}
      {activityError && <p className="persistence-notice" role="alert">{activityError}</p>}
      <section className="module-card">
        <div className="module-card-heading">
          <div><h2>Cadastrar participante</h2><p>Registre o tutor e seus interesses para consultar atividades relacionadas nos módulos da clínica.</p></div>
          <button className="module-button module-button--secondary" type="button" onClick={refreshActivities}>Atualizar atividades</button>
        </div>
        <form className="module-form" onSubmit={saveParticipant}>
          <div className="module-form-grid">
            <label>Nome do tutor<input required value={name} onChange={(event) => setName(event.target.value)} placeholder="Nome completo" /></label>
            <label>Contato<input required value={contact} onChange={(event) => setContact(event.target.value)} placeholder="Telefone ou e-mail" /></label>
            <label>Animal relacionado<input value={pet} onChange={(event) => setPet(event.target.value)} placeholder="Nome do pet (opcional)" /></label>
            <fieldset className="participant-interests field-full">
              <legend>Interesses</legend>
              <div>
                {interestOptions.map((interest) => (
                  <label key={interest}>
                    <input type="checkbox" checked={interests.includes(interest)} onChange={(event) => toggleInterest(interest, event.target.checked)} />
                    <span>{interest}</span>
                  </label>
                ))}
              </div>
            </fieldset>
          </div>
          {formError && <p className="module-error" role="alert">{formError}</p>}
          <div className="module-form-footer">
            {editingId !== null && <button className="module-button module-button--secondary" type="button" onClick={resetForm}>Cancelar edição</button>}
            <button className="module-button module-button--primary" type="submit">{editingId !== null ? 'Salvar alterações' : 'Cadastrar participante'}</button>
          </div>
        </form>
      </section>

      <section className="module-card">
        <div className="module-card-heading">
          <div><h2>Participantes e atividades</h2><p>As atividades são associadas pelo tutor ou animal e filtradas pelos interesses selecionados.</p></div>
          <span className="module-count">{participants.length} participantes</span>
        </div>
        <div className="module-toolbar">
          <label className="module-search">Buscar participante, contato ou interesse
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Digite para buscar" />
          </label>
        </div>
        {filteredParticipants.length ? (
          <div className="participant-list">
            {filteredParticipants.map((participant) => {
              const matches = relatedActivities(participant)
              return (
                <article className="participant-card" key={participant.id}>
                  <div className="participant-card-heading">
                    <div>
                      <h3>{participant.name}</h3>
                      <p>{participant.contact} · {participant.pet || 'Animal não informado'}</p>
                    </div>
                    <div className="version-record-actions">
                      <button className="module-button module-button--secondary" type="button" onClick={() => startEditing(participant)}>Editar</button>
                      <button className="module-button module-button--secondary" type="button" onClick={() => removeParticipant(participant.id)}>Excluir</button>
                    </div>
                  </div>
                  <div className="participant-interests-list">
                    {participant.interests.map((interest) => <span key={interest}>{interest}</span>)}
                  </div>
                  <div className="participant-activities">
                    <h4>Atividades relacionadas <span>{matches.length}</span></h4>
                    {matches.length ? (
                      <ul>
                        {matches.map((activity) => (
                          <li key={activity.id}>
                            <span><strong>{activity.title}</strong><small>{clinicSourceLabels[activity.source]} · {formatDate(activity.date)} · {activity.status}</small></span>
                            <button className="module-button module-button--secondary" type="button" onClick={() => onNavigate(activity.source)}>Abrir</button>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div className="participant-no-activities">
                        <p>Nenhuma atividade relacionada encontrada. Abra um módulo de interesse e registre uma atividade para este tutor ou animal.</p>
                        <div>
                          {[...new Set(participant.interests.map((interest) => interestDestinations[interest]).filter((destination): destination is ClinicSource => Boolean(destination)))]
                            .map((destination) => (
                              <button className="module-button module-button--secondary" type="button" key={destination} onClick={() => onNavigate(destination)}>
                                Abrir {clinicSourceLabels[destination]}
                              </button>
                            ))}
                        </div>
                      </div>
                    )}
                  </div>
                </article>
              )
            })}
          </div>
        ) : <div className="module-empty">{participants.length ? 'Nenhum participante corresponde à busca.' : 'Nenhum participante cadastrado. Preencha o formulário para começar.'}</div>}
      </section>
    </div>
  )
}
