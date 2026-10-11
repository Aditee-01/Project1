import type { Stop } from '../types'

// Coordinates are OpenStreetMap/Nominatim results. The final point is the mapped
// United Institute of Technology campus in Naini, used only as a nearby demo
// endpoint because an exact UCER pin was not available in the map data.
export const CAMPUS_ENDPOINT: Stop = {
  name: 'United College destination area · Naini',
  lat: 25.3439404,
  lng: 81.8988357,
}

const places = {
  prayagrajJunction: { name: 'Prayagraj Junction', lat: 25.4454322, lng: 81.825958 },
  civilLines: { name: 'Civil Lines', lat: 25.4523026, lng: 81.8329887 },
  university: { name: 'University of Allahabad · Arts Faculty', lat: 25.4657874, lng: 81.8576436 },
  anandBhavan: { name: 'Anand Bhavan', lat: 25.4590488, lng: 81.8602275 },
  sangam: { name: 'Triveni Sangam', lat: 25.4222299, lng: 81.8923259 },
  fort: { name: 'Allahabad Fort', lat: 25.4317475, lng: 81.8751163 },
  nainiBridge: { name: 'Naini Bridge', lat: 25.4269593, lng: 81.8613712 },
  nainiJunction: { name: 'Naini Junction', lat: 25.393729, lng: 81.8602035 },
  chheoki: { name: 'Allahabad Chheoki Junction', lat: 25.3770586, lng: 81.8671292 },
  chowk: { name: 'Chowk', lat: 25.4384419, lng: 81.8340224 },
}

export interface RouteDefinition {
  id: string
  routeName: string
  stops: Stop[]
  totalSeats: number
  occupiedSeats: number
  delayMinutes: number
  delayReason: string
}

export const routeDefinitions: RouteDefinition[] = [
  {
    id: 'UN-101',
    routeName: 'Junction · Civil Lines',
    stops: [places.prayagrajJunction, places.civilLines, places.fort, places.nainiBridge, places.nainiJunction, CAMPUS_ENDPOINT],
    totalSeats: 42,
    occupiedSeats: 28,
    delayMinutes: 10,
    delayReason: 'simulated congestion near Civil Lines',
  },
  {
    id: 'UN-102',
    routeName: 'University · Anand Bhavan',
    stops: [places.university, places.anandBhavan, places.fort, places.nainiBridge, places.nainiJunction, CAMPUS_ENDPOINT],
    totalSeats: 40,
    occupiedSeats: 31,
    delayMinutes: 0,
    delayReason: '',
  },
  {
    id: 'UN-103',
    routeName: 'Triveni Sangam · Naini Bridge',
    stops: [places.sangam, places.nainiBridge, places.nainiJunction, places.chheoki, CAMPUS_ENDPOINT],
    totalSeats: 45,
    occupiedSeats: 20,
    delayMinutes: 0,
    delayReason: '',
  },
  {
    id: 'UN-104',
    routeName: 'Chowk · Naini Junction',
    stops: [places.chowk, places.prayagrajJunction, places.fort, places.nainiBridge, places.nainiJunction, CAMPUS_ENDPOINT],
    totalSeats: 38,
    occupiedSeats: 35,
    delayMinutes: 5,
    delayReason: 'a simulated stop dwell near Naini Bridge',
  },
  {
    id: 'UN-105',
    routeName: 'Chheoki · Naini Junction',
    stops: [places.chheoki, places.nainiJunction, CAMPUS_ENDPOINT],
    totalSeats: 40,
    occupiedSeats: 17,
    delayMinutes: 0,
    delayReason: '',
  },
]
