import { routeDefinitions } from '../data/routes'
import type { Bus, BusStatus, DemoState, Stop } from '../types'
import { notificationsForAdvance, initialNotifications } from './notifications'

const STORAGE_KEY = 'keepmovin-demo-state-v1'

function makeInitialBuses(): Bus[] {
  return routeDefinitions.map((route) => {
    const stops = route.stops.map((stop) => ({ ...stop }))
    const routeChanged = route.id === 'UN-102'
    if (routeChanged && stops.length > 3) {
      stops[2] = { name: 'Chowk', lat: 25.4384419, lng: 81.8340224 }
    }
    return { ...route, stops, currentStopIndex: 0, routeChanged }
  })
}

function isValidBus(bus: Bus): boolean {
  return Array.isArray(bus.stops)
    && bus.stops.length > 0
    && Number.isInteger(bus.currentStopIndex)
    && bus.currentStopIndex >= 0
    && bus.currentStopIndex < bus.stops.length
    && Number.isInteger(bus.totalSeats)
    && Number.isInteger(bus.occupiedSeats)
    && bus.totalSeats >= bus.occupiedSeats
    && bus.occupiedSeats >= 0
}

function readSavedState(): DemoState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed: DemoState = JSON.parse(raw)
    if (!Array.isArray(parsed.buses) || !parsed.buses.every(isValidBus) || !Array.isArray(parsed.notifications)) {
      return null
    }
    return {
      buses: parsed.buses.map((bus) => ({
        ...bus,
        id: bus.id.replace(/^KM-/, 'UN-'),
      })),
      notifications: parsed.notifications.map((notification) => ({
        ...notification,
        busId: notification.busId.replace(/^KM-/, 'UN-'),
        message: notification.message.replace(/\bKM-(10[1-5])\b/g, 'UN-$1'),
      })),
    }
  } catch (error) {
    console.error('Could not read KeepMovin demo state from localStorage.', error)
    return null
  }
}

function moveBus(bus: Bus): Bus {
  if (bus.currentStopIndex >= bus.stops.length - 1) return bus
  return { ...bus, currentStopIndex: bus.currentStopIndex + 1 }
}

function saveState(state: DemoState): DemoState {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch (error) {
    console.error('Could not save KeepMovin demo state to localStorage.', error)
  }
  return state
}

function advanceSavedState(saved: DemoState): DemoState {
  const buses = saved.buses.map(moveBus)
  const generated = notificationsForAdvance(saved.buses, buses)
  return saveState({
    buses,
    notifications: [...generated, ...saved.notifications].slice(0, 100),
  })
}

export function initializeDemo(): DemoState {
  const saved = readSavedState()
  if (saved) return advanceSavedState(saved)
  const buses = makeInitialBuses()
  return saveState({ buses, notifications: initialNotifications(buses) })
}

export function resetDemo(): DemoState {
  const buses = makeInitialBuses()
  return saveState({ buses, notifications: initialNotifications(buses) })
}

export function updateNotifications(
  state: DemoState,
  update: (notifications: DemoState['notifications']) => DemoState['notifications'],
): DemoState {
  return saveState({ ...state, notifications: update(state.notifications) })
}

export function currentLocation(bus: Bus): Stop {
  return bus.stops[bus.currentStopIndex]
}

export function nextLocation(bus: Bus): Stop | null {
  return bus.stops[bus.currentStopIndex + 1] ?? null
}

export function statusOf(bus: Bus): BusStatus {
  if (bus.currentStopIndex >= bus.stops.length - 1) return 'Arrived'
  return bus.delayMinutes > 0 ? 'Delayed' : 'Running'
}

export function availableSeats(bus: Bus): number {
  return bus.totalSeats - bus.occupiedSeats
}
