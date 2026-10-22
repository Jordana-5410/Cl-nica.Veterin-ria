import { useEffect, useRef, useState, type ReactNode } from 'react'
import BudgetProposals from './modules1/BudgetProposals'
import InventoryControl from './modules1/InventoryControl'
import ServiceSchedule from './modules1/ServiceSchedule'
import VaccinationControl from './modules2/VaccinationControl'
import GroomingSchedule from './modules2/GroomingSchedule'
import PrescriptionHistory from './modules2/PrescriptionHistory'
import { clearDemoData } from './Data saving/demoPersistence'
import './App.css'
import './modules1/modules.css'

type Module = 'overview' | 'budgets' | 'schedule' | 'inventory' | 'vaccinations' | 'grooming' | 'prescriptions'

const moduleLabels: Record<Module, string> = {
  overview: 'Visão geral',
  budgets: 'Orçamentos e propostas',
  schedule: 'Agendamento de serviços',
  inventory: 'Controle de estoque',
  vaccinations: 'Controle de vacinação e retornos',
  grooming: 'Agendamento de banhos e tosas',
  prescriptions: 'Histórico de receitas e prescrições',
}

type IconName = 'grid' | 'document' | 'calendar' | 'box' | 'paw' | 'chevron' | 'bell' | 'menu' | 'shield' | 'scissors' | 'prescription'

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
    shield: <><path d="M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11Z" /><path d="m9 12 2 2 4-4" /></>,
    scissors: <><circle cx="6" cy="6" r="3" /><circle cx="6" cy="18" r="3" /><path d="m8.2 8.2 12 12M14.5 9.5l5.7-5.7M8.2 15.8l4-4" /></>,
    prescription: <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" /><path d="M14 2v6h6M8 13h8M8 17h5" /><path d="m15 17 2 2 4-4" /></>,
  }

  return (
    <svg aria-hidden="true" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      {paths[name]}
    </svg>
  )
}

function App() {
  const [activeModule, setActiveModule] = useState<Module>('overview')
  const [todayLabel] = useState(() => {
    const dateLabel = new Intl.DateTimeFormat('pt-BR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    }).format(new Date())
    return dateLabel.charAt(0).toLocaleUpperCase('pt-BR') + dateLabel.slice(1)
  })
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [demoDataVersion, setDemoDataVersion] = useState(0)
  const [clearDialogOpen, setClearDialogOpen] = useState(false)
  const [clearDataError, setClearDataError] = useState<string | null>(null)
  const notificationWrapperRef = useRef<HTMLDivElement>(null)
  const notificationButtonRef = useRef<HTMLButtonElement>(null)
  const clearDialogRef = useRef<HTMLDialogElement>(null)
  const navigation: { id: Module; icon: IconName }[] = [
    { id: 'overview', icon: 'grid' },
    { id: 'budgets', icon: 'document' },
    { id: 'schedule', icon: 'calendar' },
    { id: 'inventory', icon: 'box' },
    { id: 'vaccinations', icon: 'shield' },
    { id: 'grooming', icon: 'scissors' },
    { id: 'prescriptions', icon: 'prescription' },
  ]

  function navigate(module: Module) {
    setActiveModule(module)
    setMobileNavOpen(false)
  }

  useEffect(() => {
    if (!notificationsOpen) return

    function handlePointerDown(event: PointerEvent) {
      const wrapper = notificationWrapperRef.current
      if (wrapper && event.target instanceof Node && !wrapper.contains(event.target)) {
        setNotificationsOpen(false)
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setNotificationsOpen(false)
        notificationButtonRef.current?.focus()
      }
    }

    document.addEventListener('pointerdown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [notificationsOpen])

  useEffect(() => {
    const dialog = clearDialogRef.current
    if (!dialog) return
    if (clearDialogOpen && !dialog.open) dialog.showModal()
    else if (!clearDialogOpen && dialog.open) dialog.close()
  }, [clearDialogOpen])

  function confirmClearDemoData() {
    try {
      clearDemoData()
      setDemoDataVersion((version) => version + 1)
      clearDialogRef.current?.close()
    } catch (error) {
      setClearDataError(error instanceof Error ? error.message : 'Não foi possível limpar os dados de demonstração.')
    }
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
          <div className="profile">
            <span className="profile-avatar">JF</span>
            <span className="profile-copy"><strong>Jordana Fernandes</strong><small>Administradora</small></span>
          </div>
          <button
            className="demo-data-clear-button"
            type="button"
            onClick={() => {
              setClearDataError(null)
              setClearDialogOpen(true)
            }}
          >
            Limpar dados de demonstração
          </button>
        </div>
      </aside>

      {mobileNavOpen && <button className="mobile-scrim" aria-label="Fechar menu" onClick={() => setMobileNavOpen(false)} />}

      <main className="workspace">
        <header className="topbar">
          <button type="button" className="mobile-menu" aria-label="Abrir menu" onClick={() => setMobileNavOpen(true)}><Icon name="menu" /></button>
          <div className="breadcrumb"><span>Zenvet</span><Icon name="chevron" size={15} /><strong>{moduleLabels[activeModule]}</strong></div>
          <div className="topbar-actions">
            <span className="today-label"><span className="live-dot" />{todayLabel}</span>
            <div className="notification-wrapper" ref={notificationWrapperRef}>
              <button
                ref={notificationButtonRef}
                className="icon-button notification-button"
                type="button"
                aria-label="Notificações"
                aria-expanded={notificationsOpen}
                aria-controls={notificationsOpen ? 'notification-panel' : undefined}
                onClick={() => setNotificationsOpen((open) => !open)}
              >
                <Icon name="bell" size={19} />
                <i />
              </button>

              {notificationsOpen && (
                <div
                  className="notification-panel"
                  id="notification-panel"
                  role="region"
                  aria-labelledby="notification-panel-title"
                >
                  <div className="notification-panel-header">
                    <strong id="notification-panel-title">Notificações</strong>
                    <button
                      className="notification-close"
                      type="button"
                      onClick={() => setNotificationsOpen(false)}
                      aria-label="Fechar notificações"
                    >
                      ×
                    </button>
                  </div>

                  <div className="notification-empty">
                    <span className="notification-empty-icon">
                      <Icon name="bell" size={22} />
                    </span>
                    <strong>Tudo tranquilo por aqui!</strong>
                    <p>Quando houver novidades na clínica, elas aparecerão aqui.</p>
                  </div>
                </div>
              )}
            </div>
            <span className="topbar-avatar">JF</span>
          </div>
        </header>

        <div className="page-content">
          <section className="overview-section" hidden={activeModule !== 'overview'}>
            <div className="overview-hero">
              <div className="overview-copy">
                <p className="eyebrow">CUIDADO QUE FAZ PARTE DA FAMÍLIA</p>
                <h1>Amor, cuidado e saúde para quem faz parte da sua família.</h1>
                <p>Sabemos que os nossos pets são muito mais do que animais de estimação: são companheiros de todas as horas, fontes de alegria e membros especiais da nossa família. Por isso, eles merecem todo o amor, carinho, respeito e cuidado que podemos oferecer.</p>
                <p>Na nossa clínica veterinária, acreditamos que cuidar da saúde de um animal vai muito além de tratar doenças. Significa compreender suas necessidades, respeitar suas particularidades e garantir que cada momento da sua vida seja vivido com saúde, conforto e qualidade. Nosso propósito é proporcionar um atendimento acolhedor, responsável e dedicado, oferecendo aos pets e aos seus tutores uma experiência baseada na confiança, na atenção e no amor pelos animais.</p>
                <p>Contamos com uma equipe comprometida com o bem-estar animal, preparada para oferecer cuidados veterinários com responsabilidade, dedicação e atenção a cada detalhe. Desde consultas de rotina e orientações preventivas até o acompanhamento da saúde dos nossos pacientes, buscamos proporcionar um ambiente tranquilo e seguro, no qual cada pet seja tratado com o carinho que merece.</p>
                <p>Entendemos que cada animal possui sua própria personalidade, suas necessidades e sua história. Por isso, valorizamos um atendimento individualizado, respeitando o tempo de cada paciente e oferecendo aos tutores informações e orientações importantes para que possam cuidar de seus companheiros também em casa.</p>
                <p>Nosso compromisso é construir uma relação de confiança com cada família que passa por nossas portas, tornando-nos parceiros em todas as etapas da vida dos seus melhores amigos. Queremos estar presentes nos momentos de alegria, acompanhar cada fase do crescimento e contribuir para que cães, gatos e outros companheiros tenham uma vida mais saudável e feliz.</p>
                <p className="overview-highlight"><strong>Aqui, cada patinha deixa uma marca, cada vida tem um valor e cada gesto de carinho faz a diferença.</strong> Mais do que uma clínica veterinária, queremos ser um lugar onde o cuidado encontra o amor e onde você encontra a tranquilidade de saber que seu melhor amigo está recebendo atenção especial.</p>
                <p>Seja muito bem-vindo à nossa clínica! Será um prazer fazer parte da história do seu pet e cuidar de quem torna seus dias mais felizes. <span aria-label="patinhas">🐾</span></p>
              </div>
              <div className="overview-image-wrap">
                <img className="overview-image" src="/Animals.png" alt="Ilustração de vários animais empilhados, incluindo gato, coelho e cachorrinho" />
              </div>
            </div>
          </section>

          {activeModule !== 'overview' && (
            <div className="page-heading">
              <div>
                <p className="eyebrow">GESTÃO DA CLÍNICA</p>
                <h1>{moduleLabels[activeModule]}</h1>
                <p className="page-subtitle">{getSubtitle(activeModule)}</p>
              </div>
            </div>
          )}

          <div className="module-view" key={`budgets-${demoDataVersion}`} hidden={activeModule !== 'budgets'}><BudgetProposals /></div>
          <div className="module-view" key={`schedule-${demoDataVersion}`} hidden={activeModule !== 'schedule'}><ServiceSchedule /></div>
          <div className="module-view" key={`inventory-${demoDataVersion}`} hidden={activeModule !== 'inventory'}><InventoryControl /></div>
          <div className="module-view" key={`vaccinations-${demoDataVersion}`} hidden={activeModule !== 'vaccinations'}><VaccinationControl /></div>
          <div className="module-view" key={`grooming-${demoDataVersion}`} hidden={activeModule !== 'grooming'}><GroomingSchedule /></div>
          <div className="module-view" key={`prescriptions-${demoDataVersion}`} hidden={activeModule !== 'prescriptions'}><PrescriptionHistory /></div>
        </div>
      </main>

      {clearDialogOpen && (
        <dialog
          className="demo-data-dialog"
          ref={clearDialogRef}
          aria-labelledby="demo-data-dialog-title"
          aria-describedby="demo-data-dialog-description"
          onClose={() => {
            setClearDialogOpen(false)
            setClearDataError(null)
          }}
        >
          <h2 id="demo-data-dialog-title">Limpar dados de demonstração?</h2>
          <p id="demo-data-dialog-description">
            Esta ação removerá os registros salvos de orçamentos, agendamentos, estoque, vacinação, banho e tosa e receitas neste navegador. Os dados não poderão ser recuperados.
          </p>
          {clearDataError && <p className="demo-data-dialog-error" role="alert">{clearDataError}</p>}
          <div className="demo-data-dialog-actions">
            <button className="secondary-button" type="button" autoFocus onClick={() => clearDialogRef.current?.close()}>
              Cancelar
            </button>
            <button className="primary-button" type="button" onClick={confirmClearDemoData}>
              Limpar dados
            </button>
          </div>
        </dialog>
      )}
    </div>
  )
}

function getSubtitle(module: Module) {
  if (module === 'budgets') return 'Crie orçamentos personalizados e acompanhe as propostas enviadas.'
  if (module === 'schedule') return 'Organize os serviços, horários e profissionais da clínica.'
  if (module === 'inventory') return 'Acompanhe os níveis e movimentações dos seus insumos.'
  if (module === 'vaccinations') return 'Registre imunizações e acompanhe o histórico sanitário e os retornos.'
  if (module === 'grooming') return 'Organize os horários de banho e tosa, profissionais e porte dos pets.'
  if (module === 'prescriptions') return 'Emita registros e consulte o histórico de receitas veterinárias.'
  return 'Sua clínica organizada em um só lugar.'
}

export default App
