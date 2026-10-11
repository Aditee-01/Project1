import type { Bus } from '../types'

export function getEtaMinutes(bus: Bus): number {
  if (bus.currentStopIndex >= bus.stops.length - 1) return 0
  const remainingStops = bus.stops.length - 1 - bus.currentStopIndex
  return Math.max(5, remainingStops * 8 + bus.delayMinutes)
}

export function formatEta(minutes: number): string {
  if (minutes <= 0) return 'Arrived'
  return `${minutes} min`
}
