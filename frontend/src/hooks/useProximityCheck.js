/**
 * useProximityCheck.js — Periodically checks if the user is within the
 * danger buffer of any red/yellow crime hotspot zone.
 *
 * Strategy:
 *  - Runs immediately when position changes by >50m (significant move)
 *  - Also runs on a 20-second interval as a background sweep
 *  - Only warns for red and yellow zones (green zones are informational)
 *  - Buffer: radius_meters + 200m
 */
import { useState, useEffect, useRef, useCallback } from 'react'
import { haversineDistance } from '../utils/haversine'

const PROXIMITY_BUFFER_M = 200 // extra metres added to zone radius
const CHECK_INTERVAL_MS = 20_000 // 20 seconds
const SIGNIFICANT_MOVE_M = 50 // minimum movement to trigger re-check

export function useProximityCheck(position, hotspots) {
  const [nearbyZones, setNearbyZones] = useState([])
  const lastCheckedPosition = useRef(null)

  const runCheck = useCallback(
    (pos) => {
      if (!pos || !hotspots || hotspots.length === 0) return

      const alertZones = hotspots
        .filter((h) => h.risk_level === 'red' || h.risk_level === 'yellow')
        .map((h) => ({
          ...h,
          distance: haversineDistance(pos.lat, pos.lng, h.latitude, h.longitude),
        }))
        .filter((h) => h.distance <= h.radius_meters + PROXIMITY_BUFFER_M)
        .sort((a, b) => a.distance - b.distance) // closest first

      setNearbyZones(alertZones)
    },
    [hotspots],
  )

  // Run check on significant position change
  useEffect(() => {
    if (!position) return

    const last = lastCheckedPosition.current
    const movedFar =
      !last ||
      haversineDistance(last.lat, last.lng, position.lat, position.lng) >= SIGNIFICANT_MOVE_M

    if (movedFar) {
      lastCheckedPosition.current = position
      runCheck(position)
    }
  }, [position, runCheck])

  // Periodic sweep — uses the most recent position ref
  useEffect(() => {
    const interval = setInterval(() => {
      runCheck(lastCheckedPosition.current)
    }, CHECK_INTERVAL_MS)

    return () => clearInterval(interval)
  }, [runCheck])

  return nearbyZones
}
