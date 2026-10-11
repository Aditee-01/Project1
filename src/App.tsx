import { useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import {
  Activity,
  ArrowRight,
  Bell,
  BusFront,
  CheckCheck,
  ChevronDown,
  CircleHelp,
  Clock3,
  Home,
  Map,
  MapPin,
  MapPinned,
  Menu,
  RefreshCw,
  Search,
  Settings2,
  ShieldCheck,
  SlidersHorizontal,
  X,
} from 'lucide-react'
import BusCard from './components/BusCard'
import BusDetails from './components/BusDetails'
import RouteMap from './components/RouteMap'
import { formatEta, getEtaMinutes } from './lib/eta'
import { initializeDemo, resetDemo, statusOf, updateNotifications } from './lib/simulation'
import { unreadCount } from './lib/notifications'
import type { Bus, BusNotification, DemoState, NotificationType } from './types'

type Page = 'home' | 'routes' | 'notifications' | 'details'
type StatusFilter = 'All statuses' | 'Running' | 'Delayed' | 'Arrived'

const notificationTypes: NotificationType[] = ['Bus Delay', 'Route Change', 'Timing Change']
const initialState = initializeDemo()

export default function App() {
  const [state, setState] = useState<DemoState>(initialState)
  const [page, setPage] = useState<Page>('home')
  const [selectedBusId, setSelectedBusId] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('All statuses')
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const [showResetConfirm, setShowResetConfirm] = useState(false)

  const buses = state.buses
  const selectedBus = buses.find((bus) => bus.id === selectedBusId) ?? buses[0]
  const unread = unreadCount(state)
  const running = buses.filter((bus) => statusOf(bus) === 'Running').length
  const arriving = buses.filter((bus) => getEtaMinutes(bus) <= 16).length
  const visibleBuses = useMemo(() => {
    const needle = search.trim().toLowerCase()
    return buses.filter((bus) => {
      const matchesSearch = !needle || [
        bus.id,
        bus.routeName,
        bus.stops[bus.currentStopIndex].name,
        bus.stops[bus.currentStopIndex + 1]?.name ?? 'United College destination area',
      ].some((text) => text.toLowerCase().includes(needle))
      const matchesStatus = statusFilter === 'All statuses' || statusOf(bus) === statusFilter
      return matchesSearch && matchesStatus
    })
  }, [buses, search, statusFilter])

  function navigate(next: Page) {
    setPage(next)
    setMobileNavOpen(false)
    if (next === 'details' && !selectedBusId) setSelectedBusId(buses[0]?.id ?? null)
  }

  function openDetails(id: string) {
    setSelectedBusId(id)
    setPage('details')
    setMobileNavOpen(false)
  }

  function trackBus(id: string) {
    setSelectedBusId(id)
    setPage('routes')
    setMobileNavOpen(false)
  }

  function markRead(id: string) {
    setState(updateNotifications(state, (notifications) =>
      notifications.map((notification) => notification.id === id ? { ...notification, read: true } : notification)))
  }

  function markAllRead() {
    setState(updateNotifications(state, (notifications) =>
      notifications.map((notification) => ({ ...notification, read: true }))))
  }

  function clearNotifications() {
    setState(updateNotifications(state, () => []))
  }

  function doReset() {
    setState(resetDemo())
    setSelectedBusId(null)
    setPage('home')
    setSearch('')
    setStatusFilter('All statuses')
    setShowResetConfirm(false)
  }

  return (
    <div className="app-shell">
      <aside className={`sidebar ${mobileNavOpen ? 'sidebar-open' : ''}`}>
        <div className="brand">
          <div className="brand-mark"><BusFront size={20} strokeWidth={2.4} /></div>
          <div className="brand-name">Keep<span>Movin</span><small>CAMPUS TRANSIT</small></div>
          <button className="icon-button mobile-close" onClick={() => setMobileNavOpen(false)} aria-label="Close menu"><X size={19} /></button>
        </div>
        <div className="campus-select">
          <img className="campus-emblem" src="./IMG-20261010-WA0037.jpg" alt="United College" />
          <div><span>CAMPUS NAME</span><strong>United College</strong><small>Naini, Prayagraj</small></div>
          <ChevronDown size={15} />
        </div>
        <div className="nav-group-label">WORKSPACE</div>
        <nav className="sidebar-nav" aria-label="Main navigation">
          <NavButton active={page === 'home'} icon={<Home size={18} />} label="Home" onClick={() => navigate('home')} />
          <NavButton active={page === 'routes' && selectedBusId !== null} icon={<MapPinned size={18} />} label="Track Bus" onClick={() => trackBus(selectedBusId ?? buses[0].id)} />
          <NavButton active={page === 'details'} icon={<BusFront size={18} />} label="Bus Details" onClick={() => navigate('details')} />
          <NavButton active={page === 'routes' && selectedBusId === null} icon={<Map size={18} />} label="Routes" onClick={() => { setSelectedBusId(null); navigate('routes') }} />
          <NavButton active={page === 'notifications'} icon={<Bell size={18} />} label="Notifications" badge={unread > 0 ? unread : undefined} onClick={() => navigate('notifications')} />
        </nav>
        <div className="sidebar-bottom">
          <div className="demo-side-card"><span className="live-indicator" /><div><strong>Demo environment</strong><small>Simulated data only</small></div><ShieldCheck size={16} /></div>
          <button className="side-link" onClick={() => setShowResetConfirm(true)}><RefreshCw size={16} /> Reset demo</button>
          <div className="user-profile"><img className="avatar" src="./11170.webp" alt="Aditi Sharma" /><div><strong>Aditi Sharma</strong><small>Demo account</small></div><Settings2 size={16} /></div>
        </div>
      </aside>
      {mobileNavOpen && <button className="nav-scrim" aria-label="Close navigation menu" onClick={() => setMobileNavOpen(false)} />}

      <main className="main-area">
        <header className="topbar">
          <button className="icon-button mobile-menu" aria-label="Open menu" onClick={() => setMobileNavOpen(true)}><Menu size={21} /></button>
          <div className="breadcrumb"><span>KeepMovin</span><i>/</i><strong>{pageTitle(page)}</strong></div>
          <div className="topbar-right">
            <span className="demo-chip"><i /> DEMO MODE</span>
            <button className="top-icon" aria-label={`${unread} unread notifications`} onClick={() => navigate('notifications')}><Bell size={19} />{unread > 0 && <b>{unread}</b>}</button>
            <img className="top-avatar" src="./11170.webp" alt="Aditi Sharma" />
          </div>
        </header>

        <div className="page-content">
          {page === 'home' && (
            <>
              <div className="page-heading">
                <div><div className="eyebrow">UNITED COLLEGE OF ENGINEERING & RESEARCH</div><h1>Good morning, Admin <span className="wave">✦</span></h1><p>Here’s what’s happening across your campus routes today.</p></div>
                <button className="button button-outline" onClick={() => setShowResetConfirm(true)}><RefreshCw size={15} /> Reset demo</button>
              </div>
              <div className="demo-banner"><div className="demo-banner-icon"><Activity size={18} /></div><div><strong>Demo Mode</strong><span>Refresh the page to advance buses to their next stops.</span></div><span className="banner-sim">SIMULATED DATA</span></div>
              <section className="summary-grid" aria-label="Bus summary">
                <SummaryCard icon={<BusFront size={18} />} label="Total buses" value={buses.length} note="Across all demo routes" color="blue" />
                <SummaryCard icon={<Activity size={18} />} label="Buses running" value={running} note="Currently en route" color="green" />
                <SummaryCard icon={<MapPinned size={18} />} label="Arriving at college" value={arriving} note="ETA within 16 minutes" color="orange" />
              </section>
              <div className="section-heading-row">
                <div><h2>Bus fleet</h2><p>Live overview of your simulated campus routes</p></div>
                <button className="text-action" onClick={() => { setSelectedBusId(null); navigate('routes') }}>View all routes <ArrowRight size={15} /></button>
              </div>
              <div className="filter-row">
                <label className="search-box"><Search size={17} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search buses, stops or routes…" aria-label="Search buses, stops or routes" />{search && <button aria-label="Clear search" onClick={() => setSearch('')}><X size={14} /></button>}</label>
                <label className="filter-select"><SlidersHorizontal size={16} /><select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as StatusFilter)} aria-label="Filter buses by status"><option>All statuses</option><option>Running</option><option>Delayed</option><option>Arrived</option></select><ChevronDown size={14} /></label>
                <span className="results-count">{visibleBuses.length} of {buses.length} buses</span>
              </div>
              {visibleBuses.length > 0 ? <div className="bus-grid">{visibleBuses.map((bus) => <BusCard key={bus.id} bus={bus} onDetails={openDetails} onTrack={trackBus} />)}</div> : <EmptyState title="No buses found" message="Try another search term or clear your status filter." action={() => { setSearch(''); setStatusFilter('All statuses') }} />}
              <div className="data-footnote"><MapPin size={14} /><span>Stops are fictional demo itineraries using mapped Prayagraj landmarks. They are not official college transport stops.</span></div>
            </>
          )}

          {page === 'details' && selectedBus && <BusDetails bus={selectedBus} onBack={() => navigate('home')} onTrack={() => trackBus(selectedBus.id)} />}

          {page === 'routes' && (
            <>
              <div className="page-heading routes-heading"><div><div className="eyebrow">LIVE ROUTE VIEW · SIMULATED LOCATIONS</div><h1>Routes & tracking</h1><p>Follow each demo bus through Prayagraj to the Naini campus area.</p></div><span className="map-service"><span className="map-service-dot" /> OpenStreetMap</span></div>
              <div className="routes-layout">
                <section className="map-panel">
                  <div className="map-panel-heading"><div><h2>Prayagraj service area</h2><span><MapPin size={13} /> Focused on Prayagraj & Naini</span></div><button className="icon-button map-filter" title="Select all route paths" onClick={() => setSelectedBusId(null)}><Map size={17} /></button></div>
                  <RouteMap buses={buses} selectedBusId={selectedBusId} onSelectBus={setSelectedBusId} onViewDetails={openDetails} />
                  <div className="map-legend">
                    <span><i className="legend-current" /> Current stop</span><span><i className="legend-visited" /> Visited</span><span><i className="legend-upcoming" /> Upcoming</span><span><i className="legend-line" /> Demo route</span>
                  </div>
                  <div className="map-disclaimer"><MapPin size={13} /> Simulated Location · Naini destination marker is a nearby mapped campus-area endpoint, not an exact UCER pin.</div>
                </section>
                <aside className="route-sidebar">
                  <div className="route-sidebar-heading"><div><h2>Active routes</h2><p>{buses.length} demo buses</p></div><span className="route-count">{buses.length}</span></div>
                  <div className="route-list">{buses.map((bus, index) => <RouteBusRow key={bus.id} bus={bus} selected={selectedBusId === bus.id} color={['#2563eb', '#8b5cf6', '#0f9b72', '#f59e0b', '#ec4899'][index]} onClick={() => setSelectedBusId(bus.id)} />)}</div>
                  {selectedBus && <SelectedRoute bus={selectedBus} onDetails={() => openDetails(selectedBus.id)} />}
                </aside>
              </div>
              <div className="data-footnote"><MapPin size={14} /><span>Demo stops are based on OpenStreetMap-mapped landmarks. Routes are fictional and do not represent official college transport service.</span></div>
            </>
          )}

          {page === 'notifications' && (
            <>
              <div className="page-heading"><div><div className="eyebrow">SIMULATION UPDATES</div><h1>Notifications</h1><p>Changes and updates across your demo fleet.</p></div><div className="notification-header-actions"><button className="button button-outline" onClick={markAllRead} disabled={unread === 0}><CheckCheck size={15} /> Mark all read</button><button className="button button-outline" onClick={clearNotifications} disabled={state.notifications.length === 0}>Clear all</button></div></div>
              <div className="notification-explainer"><Bell size={17} /><span>Fictional demo notifications are created once on initialization and when a bus advances on refresh. They are saved locally.</span></div>
              <section className="notification-panel">
                <div className="notification-panel-heading"><div><h2>All notifications</h2><span>{state.notifications.length} updates · {unread} unread</span></div><FilterSummary /></div>
                {state.notifications.length === 0 ? <div className="notifications-empty"><div className="empty-icon"><Bell size={20} /></div><h3>You’re all caught up</h3><p>Bus delay, route change, and timing updates will appear here.</p><button className="text-action" onClick={() => navigate('home')}>Back to bus fleet <ArrowRight size={15} /></button></div>
                  : <div className="notifications-list">{state.notifications.map((notification) => <NotificationItem key={notification.id} notification={notification} onRead={() => markRead(notification.id)} onBus={() => openDetails(notification.busId)} />)}</div>}
              </section>
              <div className="notification-type-list">{notificationTypes.map((type) => <span key={type}><i className={`type-dot type-${type.split(' ')[0].toLowerCase()}`} />{type}</span>)}</div>
            </>
          )}
        </div>
        <footer className="app-footer"><span>© 2026 KeepMovin · Prototype for United College of Engineering & Research</span><span><CircleHelp size={14} /> Demo only · No live GPS</span></footer>
      </main>

      {showResetConfirm && <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setShowResetConfirm(false) }}>
        <section className="confirm-modal" role="dialog" aria-modal="true" aria-labelledby="reset-title">
          <div className="confirm-icon"><RefreshCw size={20} /></div><h2 id="reset-title">Reset demo buses?</h2>
          <p>All five buses return to their starting stops. Your demo notifications are also restored.</p>
          <div className="confirm-actions"><button className="button button-outline" onClick={() => setShowResetConfirm(false)}>Cancel</button><button className="button button-primary" onClick={doReset}>Reset demo</button></div>
        </section>
      </div>}
    </div>
  )
}

function pageTitle(page: Page) {
  return ({ home: 'Home', routes: 'Routes & tracking', notifications: 'Notifications', details: 'Bus details' })[page]
}

function NavButton({ active, icon, label, badge, onClick }: { active: boolean; icon: ReactNode; label: string; badge?: number; onClick: () => void }) {
  return <button className={`nav-button ${active ? 'nav-active' : ''}`} onClick={onClick}>{icon}<span>{label}</span>{badge !== undefined && <b>{badge}</b>}</button>
}

function SummaryCard({ icon, label, value, note, color }: { icon: ReactNode; label: string; value: number; note: string; color: string }) {
  return <article className="summary-card"><div className={`summary-icon summary-${color}`}>{icon}</div><div className="summary-data"><span>{label}</span><strong>{value}</strong><small>{note}</small></div><div className={`summary-decoration decoration-${color}`} /></article>
}

function EmptyState({ title, message, action }: { title: string; message: string; action: () => void }) {
  return <div className="empty-state"><div className="empty-icon"><Search size={21} /></div><h3>{title}</h3><p>{message}</p><button className="button button-outline" onClick={action}>Clear filters</button></div>
}

function RouteBusRow({ bus, selected, color, onClick }: { bus: Bus; selected: boolean; color: string; onClick: () => void }) {
  return <button className={`route-bus-row ${selected ? 'route-bus-selected' : ''}`} onClick={onClick}>
    <span className="route-row-color" style={{ background: color }}><BusFront size={16} /></span>
    <span className="route-row-info"><strong>{bus.id}</strong><small>{bus.stops[bus.currentStopIndex].name}</small></span>
    <span className={`mini-status status-${statusOf(bus).toLowerCase()}`}>{statusOf(bus)}</span>
  </button>
}

function SelectedRoute({ bus, onDetails }: { bus: Bus; onDetails: () => void }) {
  return <div className="selected-route-card">
    <div className="selected-route-title"><span><BusFront size={15} /> {bus.id}</span><span className="selected-sim"><i /> SIMULATED</span></div>
    <div className="selected-route-line"><strong>{bus.stops[bus.currentStopIndex].name}</strong><span>Current stop</span></div>
    <div className="selected-route-line"><strong>{bus.stops[bus.currentStopIndex + 1]?.name ?? 'United College destination area'}</strong><span>Next stop</span></div>
    <div className="selected-route-bottom"><span><Clock3 size={14} /> {formatEta(getEtaMinutes(bus))} ETA</span><button onClick={onDetails}>Details <ArrowRight size={13} /></button></div>
  </div>
}

function FilterSummary() {
  return <span className="notification-filter-label">All types</span>
}

function NotificationItem({ notification, onRead, onBus }: { notification: BusNotification; onRead: () => void; onBus: () => void }) {
  const icon = notification.type === 'Bus Delay' ? <Clock3 size={17} /> : notification.type === 'Route Change' ? <MapPinned size={17} /> : <Activity size={17} />
  const kind = notification.type === 'Bus Delay' ? 'delay' : notification.type === 'Route Change' ? 'route' : 'timing'
  const date = new Date(notification.timestamp)
  const timestamp = Number.isNaN(date.getTime()) ? 'Recently' : date.toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })
  return <article className={`notification-item ${notification.read ? '' : 'notification-unread'}`}>
    {!notification.read && <span className="unread-dot" aria-label="Unread" />}
    <div className={`notification-icon notification-${kind}`}>{icon}</div>
    <div className="notification-content"><div className="notification-title-row"><span className={`notification-type type-label-${kind}`}>{notification.type}</span><span className="notification-bus">{notification.busId}</span></div><p>{notification.message}</p><span className="notification-time">{timestamp} · Fictional demo update</span></div>
    <div className="notification-actions">{!notification.read && <button onClick={onRead}>Mark read</button>}<button className="view-bus-link" onClick={onBus}>Bus details <ArrowRight size={13} /></button></div>
  </article>
}
