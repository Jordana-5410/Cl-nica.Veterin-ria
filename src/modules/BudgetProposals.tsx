import { useMemo, useState, type FormEvent } from 'react'
import { demoDataKeys, useDemoData } from '../lib/demoPersistence'

type CatalogItem = {
  id: number
  name: string
  description: string
  price: number
}

type QuoteLine = CatalogItem & { quantity: number }
type ProposalStatus = 'Rascunho' | 'Enviada' | 'Aprovada' | 'Recusada'
type Proposal = {
  id: number
  client: string
  pet: string
  createdAt: string
  lines: QuoteLine[]
  total: number
  status: ProposalStatus
}

const catalog: CatalogItem[] = [
  { id: 1, name: 'Consulta veterinária', description: 'Atendimento clínico', price: 150 },
  { id: 2, name: 'Vacina V10', description: 'Dose com aplicação', price: 95 },
  { id: 3, name: 'Exame de sangue', description: 'Hemograma completo', price: 120 },
  { id: 4, name: 'Banho e tosa', description: 'Porte pequeno', price: 85 },
  { id: 5, name: 'Retorno', description: 'Reavaliação clínica', price: 70 },
]

const initialProposals: Proposal[] = [
  { id: 1001, client: 'Camila Oliveira', pet: 'Luna', createdAt: '15 out. 2026', lines: [{ ...catalog[0], quantity: 1 }, { ...catalog[1], quantity: 1 }], total: 245, status: 'Enviada' },
  { id: 1002, client: 'Rafael Mendes', pet: 'Thor', createdAt: '14 out. 2026', lines: [{ ...catalog[2], quantity: 1 }], total: 120, status: 'Aprovada' },
]

const currency = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isQuoteLine(value: unknown): value is QuoteLine {
  return isRecord(value)
    && typeof value.id === 'number'
    && Number.isFinite(value.id)
    && typeof value.name === 'string'
    && typeof value.description === 'string'
    && typeof value.price === 'number'
    && Number.isFinite(value.price)
    && typeof value.quantity === 'number'
    && Number.isInteger(value.quantity)
    && value.quantity > 0
}

function isProposal(value: unknown): value is Proposal {
  return isRecord(value)
    && typeof value.id === 'number'
    && Number.isFinite(value.id)
    && typeof value.client === 'string'
    && typeof value.pet === 'string'
    && typeof value.createdAt === 'string'
    && Array.isArray(value.lines)
    && value.lines.every(isQuoteLine)
    && typeof value.total === 'number'
    && Number.isFinite(value.total)
    && ['Rascunho', 'Enviada', 'Aprovada', 'Recusada'].includes(String(value.status))
}

function isProposalList(value: unknown): value is Proposal[] {
  return Array.isArray(value) && value.every(isProposal)
}

export default function BudgetProposals() {
  const [proposals, setProposals, persistenceError] = useDemoData(
    demoDataKeys.budgets,
    initialProposals,
    isProposalList,
  )
  const [selection, setSelection] = useState<QuoteLine[]>([])
  const [selectedItemId, setSelectedItemId] = useState(String(catalog[0].id))
  const [itemQuantity, setItemQuantity] = useState('1')
  const [client, setClient] = useState('')
  const [pet, setPet] = useState('')
  const subtotal = useMemo(() => selection.reduce((sum, item) => sum + item.price * item.quantity, 0), [selection])

  function addSelectedItem() {
    const item = catalog.find((entry) => entry.id === Number(selectedItemId))
    const quantity = Number(itemQuantity)
    if (!item || !Number.isInteger(quantity) || quantity < 1) return
    setSelection((current) => {
      const existing = current.find((line) => line.id === item.id)
      return existing
        ? current.map((line) => line.id === item.id ? { ...line, quantity: line.quantity + quantity } : line)
        : [...current, { ...item, quantity }]
    })
    setItemQuantity('1')
  }

  function removeSelection(itemId: number) {
    setSelection((current) => current.filter((item) => item.id !== itemId))
  }

  function createProposal(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!selection.length) return
    const newProposal: Proposal = {
      id: Date.now(),
      client: client.trim(),
      pet: pet.trim(),
      createdAt: new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date()),
      lines: selection.map((line) => ({ ...line })),
      total: subtotal,
      status: 'Rascunho',
    }
    setProposals((current) => [newProposal, ...current])
    setSelection([])
    setClient('')
    setPet('')
  }

  function updateStatus(id: number, status: ProposalStatus) {
    setProposals((current) => current.map((proposal) => proposal.id === id ? { ...proposal, status } : proposal))
  }

  return (
    <div className="module-layout">
      {persistenceError && <p className="persistence-notice" role="alert">{persistenceError}</p>}
      <section className="module-card">
        <div className="module-card-heading">
          <div><h2>Montar orçamento</h2><p>Adicione serviços e itens para calcular o subtotal automaticamente.</p></div>
        </div>
        <form className="module-form" onSubmit={createProposal}>
          <div className="module-form-grid">
            <label>Nome do tutor<input required value={client} onChange={(event) => setClient(event.target.value)} placeholder="Ex.: Ana Souza" /></label>
            <label>Nome do pet<input required value={pet} onChange={(event) => setPet(event.target.value)} placeholder="Ex.: Bento" /></label>
          </div>
          <div className="catalog-add-row">
            <label className="catalog-select">Item ou serviço
              <select value={selectedItemId} onChange={(event) => setSelectedItemId(event.target.value)}>
                {catalog.map((item) => <option key={item.id} value={item.id}>{item.name} — {currency.format(item.price)}</option>)}
              </select>
            </label>
            <label className="quantity-select">Qtd.
              <input type="number" min="1" step="1" required value={itemQuantity} onChange={(event) => setItemQuantity(event.target.value)} />
            </label>
            <button className="module-button module-button--secondary" type="button" onClick={addSelectedItem}><span aria-hidden="true">+</span>Adicionar item</button>
          </div>
          <div className="quote-lines">
            <div className="quote-line quote-line--header"><span>Descrição</span><span>Qtd.</span><span>Valor</span><span /></div>
            {selection.map((item) => (
              <div className="quote-line" key={item.id}>
                <span className="quote-item-name"><strong>{item.name}</strong><small>{item.description}</small></span>
                <span>{item.quantity}</span>
                <strong>{currency.format(item.price * item.quantity)}</strong>
                <button className="icon-action" type="button" aria-label={`Remover ${item.name}`} onClick={() => removeSelection(item.id)}>×</button>
              </div>
            ))}
            {!selection.length && <p className="module-empty-inline">Adicione itens do catálogo para compor o orçamento.</p>}
          </div>
          <div className="quote-total"><span>Subtotal</span><strong>{currency.format(subtotal)}</strong></div>
          <div className="module-form-footer"><button className="module-button module-button--primary" type="submit" disabled={!selection.length}>Criar proposta</button></div>
          <p className="module-form-hint">A proposta será criada com situação “Rascunho”.</p>
        </form>
      </section>

      <section className="module-card">
        <div className="module-card-heading">
          <div><h2>Propostas recentes</h2><p>Acompanhe o andamento dos orçamentos enviados.</p></div>
          <span className="module-count">{proposals.length} propostas</span>
        </div>
        <div className="module-table-wrap">
          <table className="module-table">
            <thead><tr><th>Proposta</th><th>Pet / Tutor</th><th>Subtotal</th><th>Situação</th></tr></thead>
            <tbody>
              {proposals.map((proposal) => (
                <tr key={proposal.id}>
                  <td><strong>#{proposal.id}</strong><small className="table-secondary">{proposal.createdAt} · {proposal.lines.length} itens</small></td>
                  <td><strong>{proposal.pet}</strong><small className="table-secondary">{proposal.client}</small></td>
                  <td><strong>{currency.format(proposal.total)}</strong></td>
                  <td><select className={`status-select status-select--${proposal.status.toLowerCase()}`} aria-label={`Situação da proposta ${proposal.id}`} value={proposal.status} onChange={(event) => updateStatus(proposal.id, event.target.value as ProposalStatus)}><option>Rascunho</option><option>Enviada</option><option>Aprovada</option><option>Recusada</option></select></td>
                </tr>
              ))}
            </tbody>
          </table>
          {!proposals.length && <div className="module-empty">Ainda não há propostas cadastradas.</div>}
        </div>
      </section>
    </div>
  )
}
