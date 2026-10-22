import { useMemo, useState, type FormEvent } from 'react'
import SelectMenu, { type SelectOption } from '../components/SelectMenu'
import { demoDataKeys, useDemoData } from '../Data saving/demoPersistence'

type StockItem = {
  id: number
  name: string
  category: string
  quantity: number
  unit: string
  minimum: number
}

type StockMovement = {
  id: number
  itemName: string
  kind: 'Entrada' | 'Saída'
  quantity: number
  happenedAt: string
}

const initialItems: StockItem[] = [
  { id: 1, name: 'Vacina V10', category: 'Medicamentos', quantity: 8, unit: 'doses', minimum: 10 },
  { id: 2, name: 'Antipulgas NexGard', category: 'Medicamentos', quantity: 24, unit: 'unidades', minimum: 8 },
  { id: 3, name: 'Shampoo hipoalergênico', category: 'Higiene e estética', quantity: 5, unit: 'frascos', minimum: 6 },
  { id: 4, name: 'Ração Recovery', category: 'Alimentação', quantity: 3, unit: 'latas', minimum: 5 },
  { id: 5, name: 'Seringas 3 ml', category: 'Materiais clínicos', quantity: 42, unit: 'unidades', minimum: 15 },
]

const categories = ['Medicamentos', 'Higiene e estética', 'Alimentação', 'Materiais clínicos']
const categoryOptions: SelectOption<string>[] = categories.map((category) => ({ value: category, label: category }))
const categoryFilterOptions: SelectOption<string>[] = [{ value: 'Todas', label: 'Todas' }, ...categoryOptions]

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isStockItem(value: unknown): value is StockItem {
  return isRecord(value)
    && typeof value.id === 'number'
    && Number.isFinite(value.id)
    && typeof value.name === 'string'
    && typeof value.category === 'string'
    && typeof value.quantity === 'number'
    && Number.isFinite(value.quantity)
    && value.quantity >= 0
    && typeof value.unit === 'string'
    && typeof value.minimum === 'number'
    && Number.isFinite(value.minimum)
    && value.minimum >= 0
}

function isStockMovement(value: unknown): value is StockMovement {
  return isRecord(value)
    && typeof value.id === 'number'
    && Number.isFinite(value.id)
    && typeof value.itemName === 'string'
    && (value.kind === 'Entrada' || value.kind === 'Saída')
    && typeof value.quantity === 'number'
    && Number.isInteger(value.quantity)
    && value.quantity > 0
    && typeof value.happenedAt === 'string'
}

function isInventoryData(value: unknown): value is { items: StockItem[]; movements: StockMovement[] } {
  return isRecord(value)
    && Array.isArray(value.items)
    && value.items.every(isStockItem)
    && Array.isArray(value.movements)
    && value.movements.every(isStockMovement)
}

export default function InventoryControl() {
  const [inventory, setInventory, persistenceError] = useDemoData(
    demoDataKeys.inventory,
    { items: initialItems, movements: [] },
    isInventoryData,
  )
  const { items, movements } = inventory
  const [categoryFilter, setCategoryFilter] = useState('Todas')
  const [itemName, setItemName] = useState('')
  const [itemCategory, setItemCategory] = useState(categories[0])
  const [itemUnit, setItemUnit] = useState('unidades')
  const [itemQuantity, setItemQuantity] = useState('0')
  const [itemMinimum, setItemMinimum] = useState('5')
  const [movementQuantities, setMovementQuantities] = useState<Record<number, string>>({})
  const [errorMessage, setErrorMessage] = useState('')
  const lowStockCount = items.filter((item) => item.quantity <= item.minimum).length
  const filteredItems = useMemo(
    () => items.filter((item) => categoryFilter === 'Todas' || item.category === categoryFilter),
    [categoryFilter, items],
  )

  function updateInventory(update: (current: typeof inventory) => typeof inventory) {
    setInventory(update)
  }

  function addItem(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const quantity = Number(itemQuantity)
    const minimum = Number(itemMinimum)
    if (!Number.isInteger(quantity) || quantity < 0 || !Number.isInteger(minimum) || minimum < 0) {
      setErrorMessage('Informe quantidades inteiras iguais ou maiores que zero.')
      return
    }
    updateInventory((current) => ({
      ...current,
      items: [{ id: Date.now(), name: itemName.trim(), category: itemCategory, quantity, unit: itemUnit.trim(), minimum }, ...current.items],
    }))
    setItemName('')
    setItemUnit('unidades')
    setItemQuantity('0')
    setItemMinimum('5')
    setErrorMessage('')
  }

  function moveStock(item: StockItem, kind: StockMovement['kind']) {
    const quantity = Number(movementQuantities[item.id] ?? '1')
    if (!Number.isInteger(quantity) || quantity < 1) {
      setErrorMessage('A quantidade da movimentação deve ser um número inteiro maior que zero.')
      return
    }
    if (kind === 'Saída' && quantity > item.quantity) {
      setErrorMessage(`Não há saldo suficiente de ${item.name} para essa saída.`)
      return
    }
    updateInventory((current) => ({
      items: current.items.map((entry) => entry.id === item.id
        ? { ...entry, quantity: entry.quantity + (kind === 'Entrada' ? quantity : -quantity) }
        : entry),
      movements: [{ id: Date.now(), itemName: item.name, kind, quantity, happenedAt: new Date().toLocaleString('pt-BR') }, ...current.movements].slice(0, 8),
    }))
    setMovementQuantities((current) => ({ ...current, [item.id]: '1' }))
    setErrorMessage('')
  }

  return (
    <div className="module-layout">
      {persistenceError && <p className="persistence-notice" role="alert">{persistenceError}</p>}
      <section className="module-card">
        <div className="module-card-heading"><div><h2>Cadastrar insumo</h2><p>Defina a categoria, quantidade inicial e o nível mínimo.</p></div></div>
        <form className="module-form" onSubmit={addItem}>
          <div className="module-form-grid">
            <label>Nome do item<input required value={itemName} onChange={(event) => setItemName(event.target.value)} placeholder="Ex.: Luvas descartáveis" /></label>
            <label>Categoria<SelectMenu ariaLabel="Categoria do item" value={itemCategory} options={categoryOptions} onChange={setItemCategory} /></label>
            <label>Unidade de medida<input required value={itemUnit} onChange={(event) => setItemUnit(event.target.value)} placeholder="unidades" /></label>
            <label>Quantidade inicial<input required type="number" min="0" step="1" value={itemQuantity} onChange={(event) => setItemQuantity(event.target.value)} /></label>
            <label>Nível mínimo<input required type="number" min="0" step="1" value={itemMinimum} onChange={(event) => setItemMinimum(event.target.value)} /></label>
          </div>
          <div className="module-form-footer"><button className="module-button module-button--primary" type="submit">Cadastrar item</button></div>
        </form>
      </section>

      <section className="module-card">
        <div className="module-card-heading">
          <div><h2>Itens em estoque</h2><p>Registre entradas e saídas para manter o saldo atualizado.</p></div>
          <span className={`module-count ${lowStockCount ? 'module-count--warning' : ''}`}>{lowStockCount} abaixo do mínimo</span>
        </div>
        <div className="inventory-toolbar">
          <label className="compact-filter"><span>Categoria</span><SelectMenu ariaLabel="Filtrar por categoria" value={categoryFilter} options={categoryFilterOptions} onChange={setCategoryFilter} /></label>
          <span className="inventory-toolbar-count">{filteredItems.length} itens</span>
        </div>
        {errorMessage && <p className="module-error" role="alert">{errorMessage}</p>}
        <div className="module-table-wrap">
          <table className="module-table inventory-table">
            <thead><tr><th>Insumo</th><th>Categoria</th><th>Saldo / mínimo</th><th>Movimentar</th></tr></thead>
            <tbody>
              {filteredItems.map((item) => {
                const isLow = item.quantity <= item.minimum
                return (
                  <tr key={item.id}>
                    <td data-label="Insumo"><strong>{item.name}</strong><small className="table-secondary">{item.unit}</small></td>
                    <td data-label="Categoria">{item.category}</td>
                    <td data-label="Saldo / mínimo"><strong className={isLow ? 'stock-balance stock-balance--low' : 'stock-balance'}>{item.quantity} {item.unit}</strong><small className="table-secondary">Mínimo: {item.minimum}</small>{isLow && <span className="low-stock-badge">Repor</span>}</td>
                    <td data-label="Movimentar"><div className="stock-movement-controls"><input aria-label={`Quantidade para movimentar de ${item.name}`} type="number" min="1" step="1" value={movementQuantities[item.id] ?? '1'} onChange={(event) => setMovementQuantities((current) => ({ ...current, [item.id]: event.target.value }))} /><button type="button" className="movement-button movement-button--in" onClick={() => moveStock(item, 'Entrada')}>+ Entrada</button><button type="button" className="movement-button movement-button--out" onClick={() => moveStock(item, 'Saída')}>− Saída</button></div></td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          {!filteredItems.length && <div className="module-empty">Não há itens nessa categoria.</div>}
        </div>
      </section>

      <section className="module-card">
        <div className="module-card-heading"><div><h2>Movimentações recentes</h2><p>Últimas entradas e saídas registradas.</p></div></div>
        {movements.length ? (
          <div className="movement-history">
            {movements.map((movement) => <div className="movement-history-row" key={movement.id}><span className={`movement-history-icon movement-history-icon--${movement.kind === 'Entrada' ? 'in' : 'out'}`}>{movement.kind === 'Entrada' ? '+' : '−'}</span><div><strong>{movement.itemName}</strong><small>{movement.kind} de {movement.quantity} · {movement.happenedAt}</small></div><span className={`movement-history-type movement-history-type--${movement.kind === 'Entrada' ? 'in' : 'out'}`}>{movement.kind}</span></div>)}
          </div>
        ) : <div className="module-empty">As movimentações registradas aparecerão aqui.</div>}
      </section>
    </div>
  )
}
