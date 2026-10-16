import { useState, type ReactNode } from 'react'
import BudgetProposals from './modules/BudgetProposals'
import InventoryControl from './modules/InventoryControl'
import ServiceSchedule from './modules/ServiceSchedule'
import './App.css'
import './modules/modules.css'

type Module = 'overview' | 'budgets' | 'schedule' | 'inventory'

const moduleLabels: Record<Module, string> = {
  overview: 'Visão geral',
  budgets: 'Orçamentos e propostas',
  schedule: 'Agendamento de serviços',
  inventory: 'Controle de estoque',
}

type IconName = 'grid' | 'document' | 'calendar' | 'box' | 'paw' | 'chevron' | 'bell' | 'menu'

function Icon({ name, size = 20 }: { name: IconName; size?: number }) {
  const paths: Record<IconName, ReactNode> = {
    grid: <><rect x="3" y="3" width="7" height="7" rx="2" /><rect x="14" y="3" width="7" height="7" rx="2" /><rect x="3" y="14" width="7" height="7" rx="2" /><rect x="14" y="14" width="7" height="7" rx="2" /></>,
    document: <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" /><path d="M14 2v6h6M8 13h8M8 17h8" /></>,
    calendar: <><rect x="3" y="5" width="18" height="16" rx="3" /><path d="M16 3v4M8 3v4M3 10h18" /></>,
    box: <><path d="m12 3 9 5-9 5-9-5 9-5Z" /><path d="M3 8v9l9 5 9-5V8M12 13v9" /></>,
    paw: <><ellipse cx="12" cy="15.5" rx="5.5" ry="4.5" /><ellipse cx="5.5" cy="9" rx="2" ry="2.7" /><ellipse cx="10" cy="6" rx="2" ry="2.7" /><ellipse cx="15" cy="6" rx="2" ry="2.7" /><ellipse cx="18.5" cy="9" rx="2" ry="2.7" /></>,
    chevron: <path d="m9 18 6-6-6-6" />,
    bell: <><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4" /></>,
    menu: <><path d="M4 6h16M4 12h16M4 18h16" /></>,
  }

  return (
    <svg aria-hidden="true" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      {paths[name]}
    </svg>
  )
}

function App() {
  const [activeModule, setActiveModule] = useState<Module>('overview')
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const navigation: { id: Module; icon: IconName }[] = [
    { id: 'overview', icon: 'grid' },
    { id: 'budgets', icon: 'document' },
    { id: 'schedule', icon: 'calendar' },
    { id: 'inventory', icon: 'box' },
  ]

  function navigate(module: Module) {
    setActiveModule(module)
    setMobileNavOpen(false)
  }

  return (
    <div className="app-shell">
      <aside className={`sidebar ${mobileNavOpen ? 'sidebar--open' : ''}`}>
        <a className="brand" href="#inicio" onClick={() => navigate('overview')} aria-label="Zenvet — início">
          <span className="brand-mark"><Icon name="paw" size={23} /></span>
          <span className="brand-copy"><strong>Zenvet</strong><small>TRANQUILIDADE NA GESTÃO + VET</small></span>
        </a>
        <div className="sidebar-label">MENU PRINCIPAL</div>
        <nav className="main-nav" aria-label="Navegação principal">
          {navigation.map(({ id, icon }) => (
            <button key={id} type="button" className={`nav-link ${activeModule === id ? 'nav-link--active' : ''}`} onClick={() => navigate(id)}>
              <Icon name={icon} size={19} />
              <span>{moduleLabels[id]}</span>
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="help-card">
            <span className="help-icon"><Icon name="paw" size={19} /></span>
            <strong>Um cuidado a mais</strong>
            <p>Pequenos cuidados, grandes histórias.</p>
          </div>
          <div className="profile">
            <span className="profile-avatar">JF</span>
            <span className="profile-copy"><strong>Jordana Fernandes</strong><small>Administradora</small></span>
          </div>
        </div>
      </aside>

      {mobileNavOpen && <button className="mobile-scrim" aria-label="Fechar menu" onClick={() => setMobileNavOpen(false)} />}

      <main className="workspace">
        <header className="topbar">
          <button type="button" className="mobile-menu" aria-label="Abrir menu" onClick={() => setMobileNavOpen(true)}><Icon name="menu" /></button>
          <div className="breadcrumb"><span>Zenvet</span><Icon name="chevron" size={15} /><strong>{moduleLabels[activeModule]}</strong></div>
          <div className="topbar-actions">
            <span className="today-label"><span className="live-dot" />Quarta-feira, 15 de outubro</span>
            <button className="icon-button notification-button" type="button" aria-label="Notificações"><Icon name="bell" size={19} /><i /></button>
            <span className="topbar-avatar">JF</span>
          </div>
        </header>

        <div className="page-content">
          <div className="page-heading">
            <div>
              <p className="eyebrow">{activeModule === 'overview' ? 'QUARTA-FEIRA, 15 DE OUTUBRO DE 2026' : 'GESTÃO DA CLÍNICA'}</p>
              <h1>{activeModule === 'overview' ? <>Olá, Jordana <span className="wave">✳</span></> : moduleLabels[activeModule]}</h1>
              <p className="page-subtitle">{getSubtitle(activeModule)}</p>
            </div>
          </div>

          <section className="overview-section" hidden={activeModule !== 'overview'}>
            <div className="overview-intro">
              <span className="overview-paw"><Icon name="paw" size={25} /></span>
              <div><h2>Tranquilidade na gestão. Mais tempo para cuidar.</h2><p>Acesse os módulos da Zenvet para organizar propostas, horários e insumos da sua clínica.</p></div>
            </div>
            <div className="overview-modules">
              <OverviewCard icon="document" title="Orçamentos e propostas" description="Monte propostas com itens e serviços, confira o subtotal e acompanhe a situação." onClick={() => navigate('budgets')} />
              <OverviewCard icon="calendar" title="Agendamento de serviços" description="Organize os horários e recursos da equipe e acompanhe cada atendimento." onClick={() => navigate('schedule')} />
              <OverviewCard icon="box" title="Controle de estoque" description="Monitore insumos, faça movimentações e receba alertas de estoque mínimo." onClick={() => navigate('inventory')} />
            </div>
          </section>

          <div className="module-view" hidden={activeModule !== 'budgets'}><BudgetProposals /></div>
          <div className="module-view" hidden={activeModule !== 'schedule'}><ServiceSchedule /></div>
          <div className="module-view" hidden={activeModule !== 'inventory'}><InventoryControl /></div>
        </div>
      </main>
    </div>
  )
}

function getSubtitle(module: Module) {
  if (module === 'budgets') return 'Crie orçamentos personalizados e acompanhe as propostas enviadas.'
  if (module === 'schedule') return 'Organize os serviços, horários e profissionais da clínica.'
  if (module === 'inventory') return 'Acompanhe os níveis e movimentações dos seus insumos.'
  return 'Sua clínica organizada em um só lugar.'
}

function OverviewCard({ icon, title, description, onClick }: { icon: IconName; title: string; description: string; onClick: () => void }) {
  return (
    <button className="overview-card" type="button" onClick={onClick}>
      <span className="overview-card-icon"><Icon name={icon} size={20} /></span>
      <span className="overview-card-copy"><strong>{title}</strong><small>{description}</small></span>
      <Icon name="chevron" size={17} />
    </button>
  )
}

export default App
