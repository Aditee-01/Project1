import { ArrowUpRight, BusFront, MapPin, Users } from 'lucide-react'
import type { Bus } from '../types'
import { formatEta, getEtaMinutes } from '../lib/eta'
import { availableSeats, currentLocation, nextLocation, statusOf } from '../lib/simulation'

export default function BusCard({
  bus,
  onDetails,
  onTrack,
}: {
  bus: Bus
  onDetails: (id: string) => void
  onTrack: (id: string) => void
}) {
  const status = statusOf(bus)
  return (
    <article className="bus-card">
      <div className="card-heading">
        <span className="bus-icon-box"><BusFront size={19} /></span>
        <div className="bus-heading-copy">
          <strong>{bus.id}</strong>
          <span className="route-caption">{bus.routeName}</span>
        </div>
        <span className={`status-pill status-${status.toLowerCase()}`}><i />{status}</span>
      </div>
      <div className="card-route">
        <div className="route-rail"><i /><span /><i /></div>
        <div className="route-points">
          <div>
            <span className="route-label">CURRENT LOCATION <span className="sim-dot" /></span>
            <strong>{currentLocation(bus).name}</strong>
          </div>
          <div>
            <span className="route-label">NEXT STOP</span>
            <strong>{nextLocation(bus)?.name ?? 'United College destination area'}</strong>
          </div>
        </div>
      </div>
      <div className="card-metrics">
        <div><span>EST. ARRIVAL</span><strong>{formatEta(getEtaMinutes(bus))}</strong></div>
        <div><span>SEATS LEFT</span><strong><Users size={14} /> {availableSeats(bus)}</strong></div>
      </div>
      <div className="card-actions">
        <button className="button button-secondary" onClick={() => onDetails(bus.id)}>View Details <ArrowUpRight size={15} /></button>
        <button className="button button-primary" onClick={() => onTrack(bus.id)}><MapPin size={15} /> Track Bus</button>
      </div>
      {status === 'Delayed' && <div className="card-delay">+{bus.delayMinutes} min · {bus.delayReason}</div>}
      {status === 'Arrived' && <div className="card-arrived">This bus has reached the campus destination.</div>}
    </article>
  )
}
