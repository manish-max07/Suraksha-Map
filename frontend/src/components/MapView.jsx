/**
 * MapView.jsx — Main map component.
 * Renders:
 *  - CARTO dark tile layer
 *  - Streetlight CircleMarkers (coloured by status)
 *  - Crime hotspot Circle overlays (translucent, coloured by risk)
 *  - User position marker (pulsing blue dot)
 *  - LayerToggle controls
 *  - StreetlightDetail bottom sheet on click
 *  - HotspotWarning proximity alert
 */
import { useState, useEffect } from 'react'
import { MapContainer, TileLayer, CircleMarker, Circle, Popup, useMap } from 'react-leaflet'
import { fetchStreetlights, fetchHotspots } from '../api/client'
import { useGeolocation } from '../hooks/useGeolocation'
import { useProximityCheck } from '../hooks/useProximityCheck'
import LayerToggle from './LayerToggle'
import StreetlightDetail from './StreetlightDetail'
import HotspotWarning from './HotspotWarning'

const DELHI_CENTER = [28.6139, 77.2090]
const DEFAULT_ZOOM = 12

const STATUS_STYLE = {
  working:     { color: '#00d4aa', fillColor: '#00d4aa', fillOpacity: 0.85, weight: 2, opacity: 1 },
  not_working: { color: '#ff4444', fillColor: '#ff4444', fillOpacity: 0.85, weight: 2, opacity: 1 },
  flickering:  { color: '#ffb300', fillColor: '#ffb300', fillOpacity: 0.85, weight: 2, opacity: 1 },
}

const HOTSPOT_STYLE = {
  red:    { color: '#ff4444', fillColor: '#ff4444', fillOpacity: 0.18, weight: 1.5, opacity: 0.7 },
  yellow: { color: '#ffb300', fillColor: '#ffb300', fillOpacity: 0.14, weight: 1.5, opacity: 0.7 },
  green:  { color: '#00c853', fillColor: '#00c853', fillOpacity: 0.10, weight: 1.5, opacity: 0.5 },
}

const STATUS_LABEL = {
  working: 'Working',
  not_working: 'Not Working',
  flickering: 'Flickering',
}

// ── Sub-component: user location dot (must live inside MapContainer) ──────────
function UserLocationMarker({ position }) {
  const map = useMap()

  useEffect(() => {
    // Pan to user's location only on first fix
    if (position) {
      // map.setView([position.lat, position.lng], 14)
    }
  }, []) // eslint-disable-line

  if (!position) return null

  return (
    <CircleMarker
      center={[position.lat, position.lng]}
      radius={9}
      pathOptions={{
        fillColor: '#4f8ef7',
        fillOpacity: 0.95,
        color: '#ffffff',
        weight: 2.5,
        opacity: 1,
      }}
    >
      <Popup>
        <div style={{ fontWeight: 600 }}>📍 Your Location</div>
        <div style={{ fontSize: '12px', color: '#8892a4', marginTop: '4px' }}>
          {position.lat.toFixed(5)}, {position.lng.toFixed(5)}
        </div>
      </Popup>
    </CircleMarker>
  )
}

// ── Loading overlay ───────────────────────────────────────────────────────────
function LoadingOverlay() {
  return (
    <div style={{
      position: 'absolute', inset: 0, zIndex: 700,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'rgba(7,13,26,0.7)', backdropFilter: 'blur(4px)',
    }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{
          width: '40px', height: '40px', borderRadius: '50%',
          border: '3px solid rgba(0,212,170,0.2)',
          borderTopColor: '#00d4aa',
          animation: 'spin 0.8s linear infinite',
          margin: '0 auto 12px',
        }} />
        <div style={{ fontSize: '13px', color: '#8892a4' }}>Loading map data…</div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

// ── Map Legend ────────────────────────────────────────────────────────────────
function MapLegend() {
  return (
    <div style={{
      position: 'absolute', bottom: '16px', left: '16px', zIndex: 700,
      background: 'rgba(13,22,48,0.88)',
      border: '1px solid rgba(255,255,255,0.1)',
      borderRadius: '12px',
      padding: '10px 14px',
      backdropFilter: 'blur(12px)',
      fontSize: '11px',
    }}>
      <div style={{ fontWeight: 700, color: '#8892a4', letterSpacing: '0.5px', marginBottom: '8px' }}>LEGEND</div>
      <LegendRow color="#00d4aa" label="Working" />
      <LegendRow color="#ffb300" label="Flickering" />
      <LegendRow color="#ff4444" label="Not Working" />
      <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)', margin: '6px 0' }} />
      <LegendRow color="#ff4444" label="High Risk Zone" circle />
      <LegendRow color="#ffb300" label="Caution Zone" circle />
      <LegendRow color="#00c853" label="Safe Zone" circle />
    </div>
  )
}

function LegendRow({ color, label, circle }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '5px' }}>
      {circle
        ? <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: color, opacity: 0.5, border: `2px solid ${color}`, flexShrink: 0 }} />
        : <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: color, flexShrink: 0, boxShadow: `0 0 4px ${color}` }} />
      }
      <span style={{ color: '#8892a4' }}>{label}</span>
    </div>
  )
}

// ── Main MapView ──────────────────────────────────────────────────────────────
export default function MapView() {
  const [streetlights, setStreetlights] = useState([])
  const [hotspots, setHotspots] = useState([])
  const [showStreetlights, setShowStreetlights] = useState(true)
  const [showHotspots, setShowHotspots] = useState(true)
  const [selectedLight, setSelectedLight] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const { position } = useGeolocation()
  const nearbyZones = useProximityCheck(position, hotspots)

  useEffect(() => {
    Promise.all([fetchStreetlights(), fetchHotspots()])
      .then(([lights, zones]) => {
        setStreetlights(lights)
        setHotspots(zones)
      })
      .catch(() => setError('Could not load map data. Is the backend running?'))
      .finally(() => setLoading(false))
  }, [])

  // Map height: full viewport minus top navbar (60px)
  const mapHeight = 'calc(100dvh - 60px)'

  return (
    <div style={{ position: 'relative', width: '100%', height: mapHeight }}>
      {/* Error banner */}
      {error && (
        <div style={{
          position: 'absolute', top: '12px', left: '50%', transform: 'translateX(-50%)',
          zIndex: 900, background: 'rgba(255,68,68,0.15)', border: '1px solid rgba(255,68,68,0.4)',
          borderRadius: '10px', padding: '10px 16px', fontSize: '13px', color: '#ff4444',
          backdropFilter: 'blur(12px)', whiteSpace: 'nowrap',
        }}>
          ⚠️ {error}
        </div>
      )}

      {loading && <LoadingOverlay />}

      {/* Layer toggle — sits above the map */}
      <LayerToggle
        showStreetlights={showStreetlights}
        showHotspots={showHotspots}
        onToggleStreetlights={() => setShowStreetlights((v) => !v)}
        onToggleHotspots={() => setShowHotspots((v) => !v)}
      />

      <MapContainer
        center={DELHI_CENTER}
        zoom={DEFAULT_ZOOM}
        style={{ height: '100%', width: '100%' }}
        zoomControl={true}
      >
        {/* CARTO Dark Matter tile — no API key needed */}
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>'
          subdomains="abcd"
          maxZoom={20}
        />

        {/* ── Hotspot zone circles ────────────────────────────────────────── */}
        {showHotspots &&
          hotspots.map((h) => (
            <Circle
              key={h.id}
              center={[h.latitude, h.longitude]}
              radius={h.radius_meters}
              pathOptions={HOTSPOT_STYLE[h.risk_level] || HOTSPOT_STYLE.yellow}
            >
              <Popup>
                <div style={{ fontWeight: 700, marginBottom: '4px' }}>{h.label}</div>
                <div style={{ fontSize: '12px', color: '#8892a4' }}>
                  Risk Level:{' '}
                  <span style={{ color: HOTSPOT_STYLE[h.risk_level]?.color, fontWeight: 600 }}>
                    {h.risk_level.toUpperCase()}
                  </span>
                </div>
                <div style={{ fontSize: '12px', color: '#8892a4' }}>Radius: {h.radius_meters}m</div>
              </Popup>
            </Circle>
          ))}

        {/* ── Streetlight dots ────────────────────────────────────────────── */}
        {showStreetlights &&
          streetlights.map((light) => (
            <CircleMarker
              key={light.id}
              center={[light.latitude, light.longitude]}
              radius={7}
              pathOptions={STATUS_STYLE[light.status] || STATUS_STYLE.working}
              eventHandlers={{ click: () => setSelectedLight(light) }}
            >
              <Popup>
                <div style={{ fontWeight: 600, marginBottom: '4px' }}>
                  {light.address || 'Streetlight'}
                </div>
                <div style={{ fontSize: '12px', color: STATUS_STYLE[light.status]?.color }}>
                  ● {STATUS_LABEL[light.status]}
                </div>
                {light.nearest_landmark && (
                  <div style={{ fontSize: '12px', color: '#8892a4', marginTop: '3px' }}>
                    📍 {light.nearest_landmark}
                  </div>
                )}
              </Popup>
            </CircleMarker>
          ))}

        {/* ── User position ───────────────────────────────────────────────── */}
        <UserLocationMarker position={position} />
      </MapContainer>

      {/* Map legend */}
      <MapLegend />

      {/* Streetlight detail bottom sheet */}
      {selectedLight && (
        <StreetlightDetail
          light={selectedLight}
          userPosition={position}
          onClose={() => setSelectedLight(null)}
        />
      )}

      {/* Proximity alert */}
      {nearbyZones.length > 0 && !selectedLight && (
        <HotspotWarning zones={nearbyZones} />
      )}
    </div>
  )
}
