export interface Stop {
  name: string
  lat: number
  lng: number
}

export type BusStatus = 'Running' | 'Delayed' | 'Arrived'

export interface Bus {
  id: string
  routeName: string
  stops: Stop[]
  currentStopIndex: number
  totalSeats: number
  occupiedSeats: number
  delayMinutes: number
  delayReason: string
  routeChanged: boolean
}

export type NotificationType = 'Bus Delay' | 'Route Change' | 'Timing Change'

export interface BusNotification {
  id: string
  type: NotificationType
  busId: string
  message: string
  timestamp: string
  read: boolean
}

export interface DemoState {
  buses: Bus[]
  notifications: BusNotification[]
}
