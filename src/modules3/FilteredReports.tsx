import { useMemo, useState } from 'react'
import SelectMenu, { type SelectOption } from '../components/SelectMenu'
import { DatePicker } from '../components/DateTimePicker'
import {
  clinicSourceLabels,
  readClinicActivities,
  type ClinicActivity,
  type ClinicSource,
} from './clinicData'

type ReportSource = ClinicSource | 'all'

type FilteredReportsProps = {
  onNavigate: (module: ClinicSource) => void
}

const sources: ClinicSource[] = ['budgets', 'schedule', 'inventory', 'vaccinations', 'grooming', 'prescriptions']
const sourceOptions: SelectOption<ReportSource>[] = [
  { value: 'all', label: 'Todos os módulos' },
  ...sources.map((source) => ({ value: source, label: clinicSourceLabels[source] })),
]
const currency = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })

function formatDate(value: string) {
  if (!value) return 'Sem data'
  return new Date(`${value}T12:00:00`).toLocaleDateString('pt-BR')
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Não foi possível carregar os dados para o relatório.'
}

function wrapCanvasText(context: CanvasRenderingContext2D, value: string, maxWidth: number, maxLines = 3) {
  const words = value.trim().split(/\s+/).filter(Boolean)
  if (!words.length) return ['—']

  const lines: string[] = []
  let line = ''
  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word
    if (line && context.measureText(candidate).width > maxWidth) {
      lines.push(line)
      line = word
      if (lines.length === maxLines) break
    } else {
      line = candidate
    }
  }
  if (lines.length < maxLines && line) lines.push(line)

  const truncated = words.join(' ') !== lines.join(' ')
  if (truncated && lines.length) {
    let lastLine = lines[lines.length - 1]
    while (lastLine && context.measureText(`${lastLine}…`).width > maxWidth) {
      lastLine = lastLine.slice(0, -1)
    }
    lines[lines.length - 1] = `${lastLine.trimEnd()}…`
  }
  return lines
}

function openPng(rows: ClinicActivity[]) {
  const width = 1440
  const pixelRatio = 2
  const padding = 48
  const columns = [
    { title: 'DATA', width: 110 },
    { title: 'MÓDULO', width: 160 },
    { title: 'ANIMAL / TUTOR', width: 195 },
    { title: 'REGISTRO / DETALHES', width: 440 },
    { title: 'SITUAÇÃO', width: 170 },
    { title: 'VALOR', width: 145 },
  ]
  const tableWidth = columns.reduce((total, column) => total + column.width, 0)
  const contentWidth = Math.min(width - padding * 2, tableWidth)
  const canvas = document.createElement('canvas')
  const context = canvas.getContext('2d')
  if (!context) throw new Error('Não foi possível preparar a imagem do relatório.')

  const rowLayouts = rows.map((row) => {
    const cells = [
      formatDate(row.date),
      clinicSourceLabels[row.source],
      [row.pet, row.guardian].filter(Boolean).join('\n') || '—',
      [row.title, row.details].filter(Boolean).join(' · '),
      row.status,
      row.amount === null ? '—' : currency.format(row.amount),
    ]
    const lines = cells.map((cell, index) => {
      context.font = index === 1 ? '600 16px Arial, sans-serif' : '14px Arial, sans-serif'
      const cellWidth = columns[index].width - 28
      const parts = cell.split('\n').flatMap((part) => wrapCanvasText(context, part, cellWidth, 3))
      return parts.slice(0, 3)
    })
    const height = Math.max(56, ...lines.map((cellLines) => cellLines.length * 19 + 26))
    return { lines, height }
  })

  const headerHeight = 48
  const footerHeight = 56
  const tableTop = 190
  const imageHeight = tableTop + headerHeight + rowLayouts.reduce((total, row) => total + row.height, 0) + footerHeight
  canvas.width = width * pixelRatio
  canvas.height = imageHeight * pixelRatio
  context.scale(pixelRatio, pixelRatio)

  context.fillStyle = '#f6f7f3'
  context.fillRect(0, 0, width, imageHeight)
  context.fillStyle = '#ffffff'
  context.fillRect(padding, 28, width - padding * 2, imageHeight - 56)
  context.fillStyle = '#14736f'
  context.fillRect(padding, 28, 8, 118)
  context.fillStyle = '#6d533f'
  context.font = '700 15px Arial, sans-serif'
  context.fillText('ZENVET · RELATÓRIO DA CLÍNICA', padding + 28, 61)
  context.fillStyle = '#303834'
  context.font = '700 30px Arial, sans-serif'
  context.fillText('Registros filtrados', padding + 28, 102)
  context.fillStyle = '#737a75'
  context.font = '15px Arial, sans-serif'
  context.fillText(
    `${rows.length} registro${rows.length === 1 ? '' : 's'} · ${new Intl.DateTimeFormat('pt-BR', { dateStyle: 'medium' }).format(new Date())}`,
    padding + 28,
    130,
  )

  const tableLeft = padding + 22
  let y = tableTop
  context.fillStyle = '#eaf3f1'
  context.fillRect(tableLeft, y, contentWidth, headerHeight)
  context.font = '700 12px Arial, sans-serif'
  context.fillStyle = '#286761'
  let x = tableLeft
  columns.forEach((column) => {
    context.fillText(column.title, x + 14, y + 29)
    x += column.width
  })
  y += headerHeight

  rowLayouts.forEach((rowLayout, rowIndex) => {
    context.fillStyle = rowIndex % 2 === 0 ? '#ffffff' : '#f8faf8'
    context.fillRect(tableLeft, y, contentWidth, rowLayout.height)
    context.strokeStyle = '#e8ede9'
    context.beginPath()
    context.moveTo(tableLeft, y + rowLayout.height)
    context.lineTo(tableLeft + contentWidth, y + rowLayout.height)
    context.stroke()

    x = tableLeft
    rowLayout.lines.forEach((lines, columnIndex) => {
      context.font = columnIndex === 1 ? '600 14px Arial, sans-serif' : '14px Arial, sans-serif'
      context.fillStyle = columnIndex === 0 ? '#737a75' : '#414944'
      lines.forEach((line, lineIndex) => context.fillText(line, x + 14, y + 25 + lineIndex * 19))
      x += columns[columnIndex].width
    })
    y += rowLayout.height
  })

  context.fillStyle = '#858c87'
  context.font = '12px Arial, sans-serif'
  context.fillText('Gerado a partir dos dados de demonstração da clínica.', tableLeft, y + 34)

  const link = document.createElement('a')
  link.href = canvas.toDataURL('image/png')
  link.download = `relatorio-zenvet-${new Date().toISOString().slice(0, 10)}.png`
  link.click()
}

export default function FilteredReports({ onNavigate }: FilteredReportsProps) {
  const [activityState, setActivityState] = useState(() => {
    try {
      return { activities: readClinicActivities(), error: null as string | null }
    } catch (error) {
      return { activities: [] as ClinicActivity[], error: getErrorMessage(error) }
    }
  })
  const { activities, error: dataError } = activityState
  const [sourceFilter, setSourceFilter] = useState<ReportSource>('all')
  const [statusFilter, setStatusFilter] = useState('Todas')
  const [search, setSearch] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [exportError, setExportError] = useState<string | null>(null)

  function refreshActivities() {
    try {
      setActivityState({ activities: readClinicActivities(), error: null })
      setStatusFilter('Todas')
    } catch (error) {
      setActivityState((current) => ({ ...current, error: getErrorMessage(error) }))
    }
  }

  const statusOptions = useMemo(() => [
    { value: 'Todas', label: 'Todas as situações' },
    ...Array.from(new Set(activities.map((activity) => activity.status)))
      .sort((first, second) => first.localeCompare(second, 'pt-BR'))
      .map((status) => ({ value: status, label: status })),
  ], [activities])

  const dateRangeError = startDate && endDate && startDate > endDate
    ? 'A data inicial não pode ser posterior à data final.'
    : null

  const filteredActivities = useMemo(() => activities
    .filter((activity) => sourceFilter === 'all' || activity.source === sourceFilter)
    .filter((activity) => statusFilter === 'Todas' || activity.status === statusFilter)
    .filter((activity) => !dateRangeError && (!startDate || (activity.date && activity.date >= startDate))
      && (!endDate || (activity.date && activity.date <= endDate)))
    .filter((activity) => `${activity.pet} ${activity.guardian} ${activity.title} ${activity.details} ${activity.status}`
      .toLocaleLowerCase('pt-BR')
      .includes(search.trim().toLocaleLowerCase('pt-BR'))),
  [activities, dateRangeError, endDate, search, sourceFilter, startDate, statusFilter])

  const totalValue = filteredActivities.reduce((total, activity) => total + (activity.amount ?? 0), 0)
  const modulesInReport = new Set(filteredActivities.map((activity) => activity.source)).size

  function exportReportPng() {
    setExportError(null)
    try {
      openPng(filteredActivities)
    } catch (error) {
      setExportError(getErrorMessage(error))
    }
  }

  return (
    <div className="module-layout">
      {dataError && <p className="persistence-notice" role="alert">{dataError}</p>}
      {exportError && <p className="persistence-notice" role="alert">{exportError}</p>}
      <section className="module-card">
        <div className="module-card-heading">
          <div><h2>Relatório da clínica</h2><p>Combine registros dos módulos e baixe a tabela filtrada como imagem PNG.</p></div>
          <button className="module-button module-button--secondary" type="button" onClick={refreshActivities}>
            Atualizar dados
          </button>
        </div>
        <div className="report-summary" aria-live="polite">
          <article><span>Registros encontrados</span><strong>{filteredActivities.length}</strong></article>
          <article><span>Módulos no resultado</span><strong>{modulesInReport}</strong></article>
          <article><span>Valor em orçamentos</span><strong>{currency.format(totalValue)}</strong></article>
        </div>
        <div className="module-toolbar report-toolbar">
          <label className="module-search">Buscar animal, tutor ou registro
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Digite para buscar" />
          </label>
          <label className="compact-filter"><span>Módulo</span>
            <SelectMenu ariaLabel="Filtrar relatório por módulo" value={sourceFilter} options={sourceOptions} onChange={setSourceFilter} />
          </label>
          <label className="compact-filter"><span>Situação</span>
            <SelectMenu ariaLabel="Filtrar relatório por situação" value={statusFilter} options={statusOptions} onChange={setStatusFilter} />
          </label>
          <div className="report-date-filter">
            <DatePicker label="De" value={startDate} max={endDate || undefined} clearable onChange={setStartDate} />
          </div>
          <div className="report-date-filter">
            <DatePicker label="Até" value={endDate} min={startDate || undefined} clearable onChange={setEndDate} />
          </div>
        </div>
        {dateRangeError && <p className="module-error" role="alert">{dateRangeError}</p>}
        <div className="report-actions">
          <p>Os dados exibidos são lidos dos módulos da clínica. Atualize após registrar novas informações.</p>
          <button className="module-button module-button--primary" type="button" onClick={exportReportPng} disabled={!filteredActivities.length}>
            Baixar relatório PNG
          </button>
        </div>
        {filteredActivities.length ? (
          <div className="module-table-wrap">
            <table className="module-table report-table">
              <thead><tr><th>Data</th><th>Módulo / registro</th><th>Animal / tutor</th><th>Situação</th><th>Valor</th><th>Abrir</th></tr></thead>
              <tbody>
                {filteredActivities.map((activity) => (
                  <tr key={activity.id}>
                    <td data-label="Data">{formatDate(activity.date)}</td>
                    <td data-label="Módulo / registro"><strong>{clinicSourceLabels[activity.source]}</strong><small className="table-secondary">{activity.title} · {activity.details}</small></td>
                    <td data-label="Animal / tutor"><strong>{activity.pet || '—'}</strong><small className="table-secondary">{activity.guardian || '—'}</small></td>
                    <td data-label="Situação">{activity.status}</td>
                    <td data-label="Valor">{activity.amount === null ? '—' : currency.format(activity.amount)}</td>
                    <td data-label="Abrir"><button className="module-button module-button--secondary" type="button" onClick={() => onNavigate(activity.source)}>Abrir módulo</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="module-empty">{dataError ? 'Os registros não puderam ser carregados.' : 'Nenhum registro corresponde aos filtros atuais.'}</div>
        )}
      </section>
    </div>
  )
}
