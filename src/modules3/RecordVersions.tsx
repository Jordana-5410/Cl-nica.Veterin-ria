import { useMemo, useState, type FormEvent } from 'react'
import { demoDataKeys, useDemoData } from '../Data saving/demoPersistence'
import SelectMenu, { type SelectOption } from '../components/SelectMenu'
import {
  readClinicActivities,
  type ClinicActivity,
} from './clinicData'

type VersionSource = 'vaccinations' | 'prescriptions' | 'general'

type RecordRevision = {
  revision: number
  title: string
  content: string
  createdAt: string
}

type VersionedRecord = {
  id: number
  sourceId: string | null
  source: VersionSource
  sourceLabel: string
  pet: string
  guardian: string
  revisions: RecordRevision[]
}

type RecordVersionsProps = {
  onNavigate: (module: 'vaccinations' | 'prescriptions') => void
}

const sourceNames: Record<VersionSource, string> = {
  vaccinations: 'Registro de vacinação',
  prescriptions: 'Registro de receita',
  general: 'Registro clínico geral',
}
const sourceTypeOptions: SelectOption<VersionSource>[] = [
  { value: 'general', label: sourceNames.general },
  { value: 'vaccinations', label: 'Nova versão de vacinação' },
  { value: 'prescriptions', label: 'Nova versão de receita' },
]
const titleOptions: SelectOption<string>[] = [
  { value: 'Evolução clínica', label: 'Evolução clínica' },
  { value: 'Acompanhamento de retorno', label: 'Acompanhamento de retorno' },
  { value: 'Observação clínica', label: 'Observação clínica' },
  { value: 'Atualização de vacinação', label: 'Atualização de vacinação' },
  { value: 'Atualização de receita', label: 'Atualização de receita' },
  { value: 'Orientação ao tutor', label: 'Orientação ao tutor' },
  { value: 'Plano de cuidados', label: 'Plano de cuidados' },
  { value: '__custom__', label: 'Outro título…' },
]

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isRevision(value: unknown): value is RecordRevision {
  return isRecord(value)
    && typeof value.revision === 'number'
    && Number.isInteger(value.revision)
    && value.revision > 0
    && typeof value.title === 'string'
    && typeof value.content === 'string'
    && typeof value.createdAt === 'string'
}

function isVersionedRecord(value: unknown): value is VersionedRecord {
  return isRecord(value)
    && typeof value.id === 'number'
    && Number.isFinite(value.id)
    && (typeof value.sourceId === 'string' || value.sourceId === null)
    && (value.source === 'vaccinations' || value.source === 'prescriptions' || value.source === 'general')
    && typeof value.sourceLabel === 'string'
    && typeof value.pet === 'string'
    && typeof value.guardian === 'string'
    && Array.isArray(value.revisions)
    && value.revisions.length > 0
    && value.revisions.every(isRevision)
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Não foi possível carregar os registros clínicos.'
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value))
}

export default function RecordVersions({ onNavigate }: RecordVersionsProps) {
  const [records, setRecords, persistenceError] = useDemoData(
    demoDataKeys.versions,
    [] as VersionedRecord[],
    (value): value is VersionedRecord[] => Array.isArray(value) && value.every(isVersionedRecord),
  )
  const [activityState, setActivityState] = useState(() => {
    try {
      return { activities: readClinicActivities(), error: null as string | null }
    } catch (error) {
      return { activities: [] as ClinicActivity[], error: getErrorMessage(error) }
    }
  })
  const { activities, error: activityError } = activityState
  const [selectedRecordId, setSelectedRecordId] = useState<number | null>(null)
  const [expandedRecordId, setExpandedRecordId] = useState<number | null>(null)
  const [sourceSelection, setSourceSelection] = useState('general')
  const [recordType, setRecordType] = useState<VersionSource>('general')
  const [pet, setPet] = useState('')
  const [guardian, setGuardian] = useState('')
  const [titleSelection, setTitleSelection] = useState(titleOptions[0].value)
  const [customTitle, setCustomTitle] = useState('')
  const [content, setContent] = useState('')
  const [formError, setFormError] = useState('')

  function refreshActivities() {
    try {
      setActivityState({ activities: readClinicActivities(), error: null })
    } catch (error) {
      setActivityState((current) => ({ ...current, error: getErrorMessage(error) }))
    }
  }

  const clinicalActivities = useMemo(
    () => activities.filter((activity) => activity.source === 'vaccinations' || activity.source === 'prescriptions'),
    [activities],
  )
  const sourceActivity = clinicalActivities.find((activity) => activity.id === sourceSelection)
  const editingRecord = records.find((record) => record.id === selectedRecordId)
  const linkOptions = useMemo<SelectOption<string>[]>(() => [
    ...sourceTypeOptions,
    ...clinicalActivities.map((activity) => ({
      value: activity.id,
      label: `${activity.source === 'vaccinations' ? 'Vacinação' : 'Receita'} · ${activity.pet} · ${activity.title}`,
    })),
    ...(editingRecord && editingRecord.sourceId && !clinicalActivities.some((activity) => activity.id === editingRecord.sourceId)
      ? [{ value: editingRecord.sourceId, label: `${editingRecord.sourceLabel} (registro anterior)` }]
      : []),
  ], [clinicalActivities, editingRecord])

  function resetForm() {
    setSelectedRecordId(null)
    setSourceSelection('general')
    setRecordType('general')
    setPet('')
    setGuardian('')
    setTitleSelection(titleOptions[0].value)
    setCustomTitle('')
    setContent('')
    setFormError('')
  }

  function selectSource(sourceId: string) {
    setSourceSelection(sourceId)
    const activity = clinicalActivities.find((item) => item.id === sourceId)
    if (!activity) {
      setPet('')
      setGuardian('')
      return
    }
    setPet(activity.pet)
    setGuardian(activity.guardian)
    setRecordType(activity.source === 'vaccinations' ? 'vaccinations' : 'prescriptions')
    setTitleSelection(activity.source === 'vaccinations' ? 'Atualização de vacinação' : 'Atualização de receita')
  }

  function setTitleValue(value: string) {
    const preset = titleOptions.find((option) => option.value === value)
    if (preset) {
      setTitleSelection(value)
      setCustomTitle('')
    } else {
      setTitleSelection('__custom__')
      setCustomTitle(value)
    }
  }

  function startEditing(record: VersionedRecord) {
    const latestRevision = record.revisions[record.revisions.length - 1]
    setSelectedRecordId(record.id)
    setSourceSelection(record.sourceId ?? record.source)
    setRecordType(record.source)
    setPet(record.pet)
    setGuardian(record.guardian)
    setTitleValue(latestRevision.title)
    setContent(latestRevision.content)
    setFormError('')
  }

  function saveRevision(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const trimmedTitle = (titleSelection === '__custom__' ? customTitle : titleSelection).trim()
    const trimmedContent = content.trim()
    if (!trimmedTitle || !trimmedContent) {
      setFormError('Informe um título e o conteúdo da revisão.')
      return
    }

    const relatedActivity = selectedRecordId === null ? sourceActivity : undefined
    const selectedSource = relatedActivity?.source ?? recordType
    const source: VersionSource = selectedSource === 'vaccinations' || selectedSource === 'prescriptions'
      ? selectedSource
      : selectedRecordId === null ? 'general' : editingRecord?.source ?? 'general'
    const sourceId = selectedRecordId === null
      ? relatedActivity?.id ?? null
      : editingRecord?.sourceId ?? null
    const sourceLabel = selectedRecordId === null
      ? relatedActivity
        ? `${sourceNames[source]} · ${relatedActivity.title}`
        : sourceNames[source]
      : editingRecord?.sourceLabel ?? sourceNames.general
    const nextRevision = {
      revision: editingRecord ? editingRecord.revisions[editingRecord.revisions.length - 1].revision + 1 : 1,
      title: trimmedTitle,
      content: trimmedContent,
      createdAt: new Date().toISOString(),
    }

    if (editingRecord) {
      setRecords((current) => current.map((record) => record.id === editingRecord.id
        ? {
          ...record,
          pet: pet.trim(),
          guardian: guardian.trim(),
          revisions: [...record.revisions, nextRevision],
        }
        : record))
    } else {
      const id = Math.max(Date.now(), ...records.map((record) => record.id + 1))
      setRecords((current) => [{
        id,
        sourceId,
        source,
        sourceLabel,
        pet: pet.trim() || relatedActivity?.pet || '',
        guardian: guardian.trim() || relatedActivity?.guardian || '',
        revisions: [nextRevision],
      }, ...current])
    }

    setExpandedRecordId(editingRecord?.id ?? null)
    resetForm()
  }

  function removeRecord(id: number) {
    setRecords((current) => current.filter((record) => record.id !== id))
    if (selectedRecordId === id) resetForm()
    if (expandedRecordId === id) setExpandedRecordId(null)
  }

  return (
    <div className="module-layout">
      {persistenceError && <p className="persistence-notice" role="alert">{persistenceError}</p>}
      {activityError && <p className="persistence-notice" role="alert">{activityError}</p>}
      <section className="module-card">
        <div className="module-card-heading">
          <div><h2>Versionar um registro</h2><p>Crie revisões numeradas e mantenha o conteúdo anterior para consulta.</p></div>
          <button className="module-button module-button--secondary" type="button" onClick={refreshActivities}>Atualizar registros clínicos</button>
        </div>
        <form className="module-form version-form" onSubmit={saveRevision}>
          <div className="module-form-grid">
            <label>Vincular a
              <SelectMenu
                ariaLabel="Vincular a"
                value={sourceSelection}
                options={linkOptions}
                disabled={selectedRecordId !== null}
                onChange={(value) => {
                  if (value === 'general' || value === 'vaccinations' || value === 'prescriptions') {
                    setSourceSelection(value)
                    setRecordType(value)
                    setPet('')
                    setGuardian('')
                  } else {
                    selectSource(value)
                  }
                }}
              />
              {selectedRecordId !== null && <small className="version-field-hint">O vínculo deste registro não pode ser alterado.</small>}
            </label>
            <label>Animal<input value={pet} onChange={(event) => setPet(event.target.value)} placeholder="Nome do animal" /></label>
            <label>Tutor<input value={guardian} onChange={(event) => setGuardian(event.target.value)} placeholder="Nome do tutor" /></label>
            <label>Título
              <SelectMenu
                ariaLabel="Título da revisão"
                value={titleSelection}
                options={titleOptions}
                onChange={setTitleSelection}
              />
            </label>
            {titleSelection === '__custom__' && (
              <label>Título personalizado<input required value={customTitle} onChange={(event) => setCustomTitle(event.target.value)} placeholder="Digite o título da revisão" /></label>
            )}
            <label className="field-full">Conteúdo da revisão<textarea required value={content} onChange={(event) => setContent(event.target.value)} rows={4} placeholder="Descreva as informações registradas nesta versão" /></label>
          </div>
          {formError && <p className="module-error" role="alert">{formError}</p>}
          <p className="version-form-hint">O vínculo permite consultar a vacinação ou receita relacionada; revisões anteriores não são substituídas.</p>
          <div className="module-form-footer">
            {editingRecord && <button className="module-button module-button--secondary" type="button" onClick={resetForm}>Cancelar edição</button>}
            <button className="module-button module-button--primary" type="submit">{editingRecord ? 'Salvar nova revisão' : 'Criar registro · revisão 1'}</button>
          </div>
        </form>
        <div className="version-source-actions">
          <span>Abrir módulo relacionado:</span>
          <button className="module-button module-button--secondary" type="button" onClick={() => onNavigate('vaccinations')}>Vacinação</button>
          <button className="module-button module-button--secondary" type="button" onClick={() => onNavigate('prescriptions')}>Receitas</button>
        </div>
      </section>

      <section className="module-card">
        <div className="module-card-heading">
          <div><h2>Histórico de versões</h2><p>Consulte cada revisão e atualize registros ligados à vacinação e às receitas.</p></div>
          <span className="module-count">{records.length} registros</span>
        </div>
        {records.length ? (
          <div className="version-record-list">
            {records.map((record) => {
              const latestRevision = record.revisions[record.revisions.length - 1]
              const expanded = expandedRecordId === record.id
              return (
                <article className="version-record" key={record.id}>
                  <div className="version-record-heading">
                    <div>
                      <span className="version-record-source">{record.sourceLabel}</span>
                      <h3>{latestRevision.title}</h3>
                      <p>{record.pet || 'Animal não informado'} · {record.guardian || 'Tutor não informado'} · revisão {latestRevision.revision}</p>
                    </div>
                    <div className="version-record-actions">
                      <button className="module-button module-button--secondary" type="button" aria-expanded={expanded} onClick={() => setExpandedRecordId(expanded ? null : record.id)}>
                        {expanded ? 'Ocultar histórico' : `Ver ${record.revisions.length} versão${record.revisions.length === 1 ? '' : 'ões'}`}
                      </button>
                      <button className="module-button module-button--secondary" type="button" onClick={() => startEditing(record)}>Criar revisão</button>
                      <button className="module-button module-button--secondary" type="button" onClick={() => removeRecord(record.id)}>Excluir histórico</button>
                    </div>
                  </div>
                  {expanded && (
                    <ol className="version-history">
                      {[...record.revisions].reverse().map((revision) => (
                        <li key={revision.revision}>
                          <div><strong>Revisão {revision.revision}</strong><time dateTime={revision.createdAt}>{formatDate(revision.createdAt)}</time></div>
                          <h4>{revision.title}</h4>
                          <p>{revision.content}</p>
                        </li>
                      ))}
                    </ol>
                  )}
                </article>
              )
            })}
          </div>
        ) : <div className="module-empty">Nenhum registro versionado. Vincule uma vacinação ou receita existente, ou crie um registro clínico geral.</div>}
      </section>
    </div>
  )
}
