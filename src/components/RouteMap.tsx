import { Fragment, useEffect, useMemo, useState } from 'react'
import {
  CircleMarker,
  MapContainer,
  Marker,
  Polyline,
  Popup,
  TileLayer,
  Tooltip,
  useMap,
} from 'react-leaflet'
import L from 'leaflet'
import { BusFront, ExternalLink, MapPin } from 'lucide-react'
import type { Bus } from '../types'
import { getEtaMinutes, formatEta } from '../lib/eta'
import { currentLocation, nextLocation, statusOf } from '../lib/simulation'
import { CAMPUS_ENDPOINT } from '../data/routes'

type LatLng = [number, number]

const routeColors = ['#2563eb', '#8b5cf6', '#0f9b72', '#f59e0b', '#ec4899']
const focus: LatLng = [25.409, 81.865]

function makeIcon(kind: 'bus' | 'start' | 'end', color: string) {
  const content = kind === 'bus'
    ? '<span class="bus-map-glyph">B</span>'
    : kind === 'start'
      ? '<span class="stop-map-glyph">S</span>'
      : '<span class="stop-map-glyph">U</span>'
  return L.divIcon({
    className: `map-marker map-marker-${kind}`,
    html: `<span style="--marker-color:${color}">${content}</span>`,
    iconSize: kind === 'bus' ? [34, 34] : [23, 23],
    iconAnchor: kind === 'bus' ? [17, 17] : [11, 11],
  })
}

function FitRoutes({ buses, routeGeometries }: { buses: Bus[]; routeGeometries: Record<string, LatLng[]> }) {
  const map = useMap()
  useEffect(() => {
    const allPoints = buses.flatMap((bus) => routeGeometries[bus.id] ?? bus.stops.map((stop) => [stop.lat, stop.lng] as LatLng))
    if (allPoints.length) map.fitBounds(L.latLngBounds(allPoints), { padding: [28, 28], maxZoom: 13 })
  }, [buses, map, routeGeometries])
  return null
}

export default function RouteMap({
  buses,
  selectedBusId,
  onSelectBus,
  onViewDetails,
}: {
  buses: Bus[]
  selectedBusId: string | null
  onSelectBus: (id: string) => void
  onViewDetails: (id: string) => void
}) {
  const [routeGeometries, setRouteGeometries] = useState<Record<string, LatLng[]>>({})
  const [routingFallback, setRoutingFallback] = useState(false)
  const [tilesFailed, setTilesFailed] = useState(false)
  const [tileProvider, setTileProvider] = useState<'osm' | 'esri'>(
    window.location.protocol === 'file:' ? 'esri' : 'osm',
  )

  useEffect(() => {
    const controller = new AbortController()
    async function loadRoadRoutes() {
      if (window.location.protocol === 'file:') {
        setRouteGeometries(Object.fromEntries(
          buses.map((bus) => [bus.id, bus.stops.map((stop) => [stop.lat, stop.lng] as LatLng)]),
        ))
        setRoutingFallback(true)
        return
      }
      const results = await Promise.all(buses.map(async (bus): Promise<{ id: string; points: LatLng[]; roadFollowed: boolean }> => {
        const coordinates = bus.stops.map((stop) => `${stop.lng},${stop.lat}`).join(';')
        try {
          const response = await fetch(
            `https://router.project-osrm.org/route/v1/driving/${coordinates}?overview=full&geometries=geojson&steps=false`,
            { signal: controller.signal },
          )
          if (!response.ok) throw new Error(`OSRM returned HTTP ${response.status}`)
          const data = await response.json() as {
            code?: string
            routes?: Array<{ geometry?: { coordinates?: [number, number][] } }>
          }
          const points = data.routes?.[0]?.geometry?.coordinates
          if (data.code !== 'Ok' || !points?.length) throw new Error('No road route was returned')
          return { id: bus.id, points: points.map(([lng, lat]) => [lat, lng] as LatLng), roadFollowed: true }
        } catch (error) {
          if (!controller.signal.aborted) {
            console.warn(`Road routing unavailable for ${bus.id}; showing stop-to-stop demo line.`, error)
          }
          return { id: bus.id, points: bus.stops.map((stop) => [stop.lat, stop.lng] as LatLng), roadFollowed: false }
        }
      }))
      if (!controller.signal.aborted) {
        setRouteGeometries(Object.fromEntries(results.map(({ id, points }) => [id, points])))
        setRoutingFallback(results.some((result) => !result.roadFollowed))
      }
    }
    void loadRoadRoutes()
    return () => controller.abort()
  }, [buses])

  const campusIcon = useMemo(() => makeIcon('end', '#145e4a'), [])

  return (
    <div className="map-frame">
      {routingFallback && (
        <div className="map-note" role="status">
          Road routing is unavailable for one or more routes. Dashed stop-to-stop demo lines are shown instead.
        </div>
      )}
      {tilesFailed && (
        <div className="map-note map-note-error" role="status">
          Map tiles could not be loaded. Route lines and stop markers remain available.
        </div>
      )}
      <MapContainer center={focus} zoom={12} scrollWheelZoom className="route-map">
        <TileLayer
          key={tileProvider}
          attribution={tileProvider === 'osm'
            ? '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            : 'Tiles &copy; Esri — Sources: Esri, TomTom, Garmin, FAO, NOAA, USGS, &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, and the GIS User Community'}
          url={tileProvider === 'osm'
            ? 'https://tile.openstreetmap.org/{z}/{x}/{y}.png'
            : 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}'}
          updateWhenIdle
          updateWhenZooming={false}
          keepBuffer={2}
          eventHandlers={{
            tileerror: () => {
              if (tileProvider === 'osm') {
                setTileProvider('esri')
              } else {
                setTilesFailed(true)
              }
            },
          }}
        />
        <FitRoutes buses={buses} routeGeometries={routeGeometries} />
        {buses.map((bus, busIndex) => {
          const color = routeColors[busIndex % routeColors.length]
          const position = currentLocation(bus)
          const next = nextLocation(bus)
          const isSelected = selectedBusId === bus.id
          return (
            <Fragment key={`route-${bus.id}`}>
              <Polyline
                positions={routeGeometries[bus.id] ?? bus.stops.map((stop) => [stop.lat, stop.lng] as LatLng)}
                pathOptions={{
                  color,
                  weight: isSelected ? 5 : 3,
                  opacity: isSelected ? 0.88 : 0.42,
                  dashArray: routeGeometries[bus.id] ? undefined : '8 9',
                }}
                eventHandlers={{ click: () => onSelectBus(bus.id) }}
              />
              <Marker
                position={[bus.stops[0].lat, bus.stops[0].lng]}
                icon={makeIcon('start', color)}
                eventHandlers={{ click: () => onSelectBus(bus.id) }}
                title={`Starting point · ${bus.id} · ${bus.stops[0].name}`}
              >
                <Tooltip direction="top">Starting point · {bus.id} · {bus.stops[0].name}</Tooltip>
              </Marker>
              {bus.stops.map((stop, index) => {
                const isCurrent = index === bus.currentStopIndex
                const isVisited = index < bus.currentStopIndex
                const isStart = index === 0
                const isDestination = index === bus.stops.length - 1
                const stopColor = isCurrent ? '#2563eb' : isVisited ? '#15956d' : isStart ? color : '#b9c2cf'
                if (isStart) return null
                return (
                  <CircleMarker
                    key={`${bus.id}-stop-${index}-${stop.name}`}
                    center={[stop.lat, stop.lng]}
                    radius={isCurrent ? 8 : isStart || isDestination ? 6 : 4}
                    pathOptions={{
                      color: '#fff',
                      weight: 2,
                      fillColor: stopColor,
                      fillOpacity: 1,
                    }}
                    eventHandlers={{ click: () => onSelectBus(bus.id) }}
                  >
                    <Tooltip direction="top">
                      <span>Simulated Location · {isCurrent ? 'Current stop · ' : isVisited ? 'Visited · ' : isDestination ? 'Destination · ' : 'Upcoming · '}{stop.name}</span>
                    </Tooltip>
                  </CircleMarker>
                )
              })}
              <Marker
                position={[position.lat, position.lng]}
                icon={makeIcon('bus', color)}
                eventHandlers={{ click: () => onSelectBus(bus.id) }}
                title={`Simulated Location · ${bus.id}`}
              >
                <Tooltip direction="top" permanent={isSelected} offset={[0, -17]}>
                  Simulated Location · {bus.id}
                </Tooltip>
                <Popup>
                  <div className="map-popup">
                    <div className="map-popup-title"><BusFront size={16} /> {bus.id}</div>
                    <span className="simulated-label"><MapPin size={12} /> Simulated Location</span>
                    <p><b>Current:</b> {position.name}</p>
                    <p><b>Next:</b> {next?.name ?? 'United College destination area'}</p>
                    <p><b>ETA:</b> {formatEta(getEtaMinutes(bus))} <span className={`status-text status-${statusOf(bus).toLowerCase()}`}>· {statusOf(bus)}</span></p>
                    <button className="popup-link" onClick={() => onViewDetails(bus.id)}>
                      View bus details <ExternalLink size={13} />
                    </button>
                  </div>
                </Popup>
              </Marker>
            </Fragment>
          )
        })}
        <Marker position={[CAMPUS_ENDPOINT.lat, CAMPUS_ENDPOINT.lng]} icon={campusIcon} title="United College destination area · Naini">
          <Tooltip direction="top" permanent>Simulated Location · United College destination area</Tooltip>
          <Popup>
            <b>United College destination area · Naini</b>
            <p>Nearby mapped campus endpoint for this fictional demo route. Not an exact UCER pin.</p>
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  )
}
