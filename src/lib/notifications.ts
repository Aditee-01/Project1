import type { Bus, BusNotification, DemoState } from '../types'
import { getEtaMinutes } from './eta'

const now = () => new Date().toISOString()

export function initialNotifications(buses: Bus[]): BusNotification[] {
  const delayed = buses.find((bus) => bus.delayMinutes > 0)!
  const changedRoute = buses.find((bus) => bus.id === 'UN-102')!
  const timingBus = buses.find((bus) => bus.id === 'UN-103')!

  return [
    {
      id: 'seed-delay',
      type: 'Bus Delay',
      busId: delayed.id,
      message: `${delayed.id} is running approximately ${delayed.delayMinutes} minutes late due to ${delayed.delayReason}.`,
      timestamp: now(),
      read: false,
    },
    {
      id: 'seed-route',
      type: 'Route Change',
      busId: changedRoute.id,
      message: `${changedRoute.id}'s demo route was updated: it uses Chowk instead of Allahabad Fort before continuing toward Naini.`,
      timestamp: now(),
      read: false,
    },
    {
      id: 'seed-timing',
      type: 'Timing Change',
      busId: timingBus.id,
      message: `${timingBus.id}'s simulated arrival estimate is ${getEtaMinutes(timingBus)} minutes.`,
      timestamp: now(),
      read: false,
    },
  ]
}

export function notificationsForAdvance(
  previous: Bus[],
  next: Bus[],
): BusNotification[] {
  const notifications: BusNotification[] = []
  const timestamp = now()

  for (const bus of next) {
    const before = previous.find((item) => item.id === bus.id)
    if (!before || before.currentStopIndex === bus.currentStopIndex) continue
    const oldEta = getEtaMinutes(before)
    const newEta = getEtaMinutes(bus)

    notifications.push({
      id: `${bus.id}-timing-${bus.currentStopIndex}-${Date.now()}`,
      type: 'Timing Change',
      busId: bus.id,
      message: newEta === 0
        ? `${bus.id} has arrived at the United College destination area.`
        : `${bus.id}'s estimated arrival time changed from ${oldEta} to ${newEta} minutes after leaving ${before.stops[before.currentStopIndex].name}.`,
      timestamp,
      read: false,
    })

    if (bus.delayMinutes > 0 && bus.currentStopIndex === 1) {
      notifications.push({
        id: `${bus.id}-delay-${bus.currentStopIndex}-${Date.now()}`,
        type: 'Bus Delay',
        busId: bus.id,
        message: `${bus.id} is running approximately ${bus.delayMinutes} minutes late due to ${bus.delayReason}.`,
        timestamp,
        read: false,
      })
    }

  }

  return notifications
}

export function unreadCount(state: DemoState): number {
  return state.notifications.filter((notification) => !notification.read).length
}
