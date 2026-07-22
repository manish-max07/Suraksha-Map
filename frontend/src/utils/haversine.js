/**
 * haversine.js — Computes great-circle distance between two lat/lng points.
 * Returns distance in metres.
 */
export function haversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6_371_000 // Earth radius in metres
  const toRad = (deg) => (deg * Math.PI) / 180

  const φ1 = toRad(lat1)
  const φ2 = toRad(lat2)
  const Δφ = toRad(lat2 - lat1)
  const Δλ = toRad(lon2 - lon1)

  const a =
    Math.sin(Δφ / 2) ** 2 +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

  return R * c // metres
}

/** Format metres into a human-readable string */
export function formatDistance(metres) {
  if (metres < 1000) return `${Math.round(metres)}m`
  return `${(metres / 1000).toFixed(1)}km`
}
