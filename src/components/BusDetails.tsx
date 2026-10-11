import { ArrowLeft, BusFront, Clock3, MapPin, Navigation, Users } from 'lucide-react'
import type { Bus } from '../types'
import { formatEta, getEtaMinutes } from '../lib/eta'
import { availableSeats, currentLocation, nextLocation, statusOf } from '../lib/simulation'

export default function BusDetails({ bus, onBack, onTrack }: { bus: Bus; onBack: () => void; onTrack: () => void }) {
  const status = statusOf(bus)
  return (
    <section className="details-page">
      <button className="back-link" onClick={onBack}><ArrowLeft size={16} /> Back to buses</button>
      <div className="details-header">
        <div className="details-bus-icon"><BusFront size={23} /></div>
        <div><span className="eyebrow">BUS DETAILS · SIMULATED DATA</span><h2>{bus.id}</h2><p>{bus.routeName}</p></div>
        <span className={`status-pill status-${status.toLowerCase()}`}><i />{status}</span>
      </div>
      <div className="details-main-grid">
        <div className="details-card">
          <div className="section-title"><Navigation size={17} /> Route information</div>
          <div className="detail-list">
            <Detail label="Current location" value={currentLocation(bus).name} accent />
            <Detail label="Starting point" value={bus.stops[0].name} />
            <Detail label="Next stop" value={nextLocation(bus)?.name ?? 'No next stop — arrived'} />
            <Detail label="Final destination" value="United College destination area, Naini" />
            <Detail label="Estimated arrival" value={formatEta(getEtaMinutes(bus))} />
            <Detail label="Route type" value="Fictional demo route · not an official college route" />
          </div>
          <button className="button button-primary details-track" onClick={onTrack}><MapPin size={16} /> View on route map</button>
        </div>
        <div className="details-card seats-card">
          <div className="section-title"><Users size={17} /> Seat availability</div>
          <div className="seat-total"><span>Total seats</span><strong>{bus.totalSeats}</strong></div>
          <div className="seat-meter" aria-label={`${bus.occupiedSeats} of ${bus.totalSeats} seats occupied`}><i style={{ width: `${(bus.occupiedSeats / bus.totalSeats) * 100}%` }} /></div>
          <div className="seat-counts">
            <div><i className="seat-key occupied" /><span>Occupied</span><strong>{bus.occupiedSeats}</strong></div>
            <div><i className="seat-key available" /><span>Available</span><strong>{availableSeats(bus)}</strong></div>
          </div>
          <div className="seat-formula">{bus.totalSeats} total − {bus.occupiedSeats} occupied = {availableSeats(bus)} available</div>
        </div>
      </div>
      <div className="details-card timeline-card">
        <div className="section-title"><Clock3 size={17} /> Route stops <span className="timeline-note">Simulated Location</span></div>
        <div className="stop-timeline">
          {bus.stops.map((stop, index) => {
            const current = index === bus.currentStopIndex
            const visited = index < bus.currentStopIndex
            return <div className={`timeline-stop ${current ? 'is-current' : ''} ${visited ? 'is-visited' : ''}`} key={`${index}-${stop.name}`}>
              <div className="timeline-marker">{current ? <MapPin size={14} /> : visited ? '✓' : ''}</div>
              <div><strong>{stop.name}</strong><span>{current ? 'Current stop' : visited ? 'Visited' : index === bus.stops.length - 1 ? 'Destination' : 'Upcoming'}</span></div>
              {current && <span className="current-tag">CURRENT</span>}
            </div>
          })}
        </div>
      </div>
    </section>
  )
}

function Detail({ label, value, accent = false }: { label: string; value: string; accent?: boolean }) {
  return <div className="detail-row"><span>{label}</span><strong className={accent ? 'detail-accent' : ''}>{value}</strong></div>
}
