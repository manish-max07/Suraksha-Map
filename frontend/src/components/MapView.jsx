/**
 * MapView.jsx — Main Leaflet map with full responsive layout.
 *
 * Responsive fixes applied:
 *   - Map height uses `.map-height` CSS class (subtracts bottom nav on mobile)
 *   - Error banner wraps text, never overflows narrow screens
 *   - Legend collapses to a toggle button on very small screens (<360px)
 *   - Leaflet zoom control forced to bottom-right so it doesn't clash with top-right LayerToggle
 *   - LayerToggle positioned at top-right (clear of top-left zoom)
 *   - Bottom sheet / HotspotWarning clear mobile bottom nav via `.bottom-safe` CSS class
 */
import { useState, useEffect } from 'react'
import { MapContainer, TileLayer, CircleMarker, Circle, Popup } from 'react-leaflet'
import L from 'leaflet'
import { fetchStreetlights, fetchHotspots } from '../api/client'
import { useGeolocation } from '../hooks/useGeolocation'
import { useProximityCheck } from '../hooks/useProximityCheck'
import LayerToggle from './LayerToggle'
import StreetlightDetail from './StreetlightDetail'
import HotspotWarning from './HotspotWarning'

const DELHI_CENTER = [28.6139, 77.2090]
const DEFAULT_ZOOM = 12

const STATUS_STYLE = {
  working:     { color: '#00d4aa', fillColor: '#00d4aa', fillOpacity: 0.88, weight: 2, opacity: 1 },
  not_working: { color: '#ff4444', fillColor: '#ff4444', fillOpacity: 0.88, weight: 2, opacity: 1 },
  flickering:  { color: '#ffb300', fillColor: '#ffb300', fillOpacity: 0.88, weight: 2, opacity: 1 },
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

// ── Loading overlay ───────────────────────────────────────────────────────────
function LoadingOverlay() {
  return (
    <div
      className="absolute inset-0 z-[700] flex items-center justify-center"
      style={{ background: 'rgba(7,13,26,0.72)', backdropFilter: 'blur(4px)' }}
    >
      <div className="flex flex-col items-center gap-3">
        <div className="spinner" />
        <span className="text-sm" style={{ color: '#8892a4' }}>Loading map data…</span>
      </div>
    </div>
  )
}

// ── Map Legend ────────────────────────────────────────────────────────────────
function MapLegend() {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div
      className="absolute left-3 z-[700] bottom-safe"
      style={{
        background: 'rgba(13,22,48,0.90)',
        border: '1px solid rgba(255,255,255,0.10)',
        borderRadius: '12px',
        backdropFilter: 'blur(14px)',
        WebkitBackdropFilter: 'blur(14px)',
        overflow: 'hidden',
        /* cap width so it never exceeds 45% of screen on small phones */
        maxWidth: 'min(180px, 45vw)',
      }}
    >
      {/* Header row — always visible */}
      <button
        onClick={() => setCollapsed((c) => !c)}
        className="flex items-center justify-between w-full gap-2"
        style={{
          padding: '8px 12px',
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          fontFamily: 'Inter, sans-serif',
        }}
        aria-expanded={!collapsed}
        aria-controls="map-legend-body"
      >
        <span style={{ fontSize: '10px', fontWeight: 700, color: '#8892a4', letterSpacing: '0.5px' }}>
          LEGEND
        </span>
        <span style={{ fontSize: '10px', color: '#4a5568', lineHeight: 1 }}>
          {collapsed ? '▲' : '▼'}
        </span>
      </button>

      {/* Collapsible body */}
      {!collapsed && (
        <div id="map-legend-body" style={{ padding: '0 12px 10px', fontSize: '11px' }}>
          <LegendRow color="#00d4aa" label="Working" />
          <LegendRow color="#ffb300" label="Flickering" />
          <LegendRow color="#ff4444" label="Not Working" />
          <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)', margin: '6px 0' }} />
          <LegendRow color="#ff4444" label="High Risk" circle />
          <LegendRow color="#ffb300" label="Caution" circle />
          <LegendRow color="#00c853" label="Safe Zone" circle />
        </div>
      )}
    </div>
  )
}

function LegendRow({ color, label, circle }) {
  return (
    <div className="flex items-center gap-2 mb-[5px]">
      {circle
        ? <div style={{ width: '11px', height: '11px', borderRadius: '50%', flexShrink: 0, background: color, opacity: 0.5, border: `2px solid ${color}` }} />
        : <div style={{ width: '9px', height: '9px', borderRadius: '50%', flexShrink: 0, background: color, boxShadow: `0 0 4px ${color}` }} />
      }
      <span style={{ color: '#8892a4', whiteSpace: 'nowrap' }}>{label}</span>
    </div>
  )
}

// ── Main MapView ──────────────────────────────────────────────────────────────
export default function MapView() {
  const [streetlights, setStreetlights] = useState([])
  const [hotspots, setHotspots]         = useState([])
  const [showStreetlights, setShowStreetlights] = useState(true)
  const [showHotspots, setShowHotspots]         = useState(true)
  const [selectedLight, setSelectedLight]       = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)

  const { position } = useGeolocation()
  const nearbyZones  = useProximityCheck(position, hotspots)

  useEffect(() => {
    Promise.all([fetchStreetlights(), fetchHotspots()])
      .then(([lights, zones]) => {
        setStreetlights(lights)
        setHotspots(zones)
      })
      .catch(() => setError('Could not load map data. Is the backend running?'))
      .finally(() => setLoading(false))
  }, [])

  return (
    /* map-height class: 100dvh - 60px top - 64px bottom nav on mobile;
       100dvh - 60px on desktop. Defined in index.css. */
    <div className="map-height relative w-full">
      {/* ── Error banner ──────────────────────────────────────────────────── */}
      {error && (
        <div
          className="absolute top-3 left-3 right-3 z-[900] animate-fade-in"
          style={{
            background: 'rgba(255,68,68,0.14)',
            border: '1px solid rgba(255,68,68,0.4)',
            borderRadius: '10px',
            padding: '10px 14px',
            fontSize: '13px',
            color: '#ff6b6b',
            backdropFilter: 'blur(12px)',
            /* text wraps on narrow screens instead of overflowing */
            wordBreak: 'break-word',
          }}
        >
          ⚠️ {error}
        </div>
      )}

      {loading && <LoadingOverlay />}

      {/* Layer toggle — top-right, clear of Leaflet zoom (top-left) */}
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
        /* Force Leaflet zoom control to bottom-right to avoid
           colliding with top-right LayerToggle */
        zoomControl={false}
        whenCreated={(map) => {
          L.control.zoom({ position: 'bottomright' }).addTo(map)
        }}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>'
          subdomains="abcd"
          maxZoom={20}
        />

        {/* Hotspot circles */}
        {showHotspots && hotspots.map((h) => (
          <Circle
            key={h.id}
            center={[h.latitude, h.longitude]}
            radius={h.radius_meters}
            pathOptions={HOTSPOT_STYLE[h.risk_level] || HOTSPOT_STYLE.yellow}
          >
            <Popup>
              <div style={{ fontWeight: 700, marginBottom: '3px' }}>{h.label}</div>
              <div style={{ fontSize: '12px', color: '#8892a4' }}>
                Risk:{' '}
                <span style={{ color: HOTSPOT_STYLE[h.risk_level]?.color, fontWeight: 600 }}>
                  {h.risk_level.toUpperCase()}
                </span>
              </div>
              <div style={{ fontSize: '12px', color: '#8892a4' }}>Radius: {h.radius_meters}m</div>
            </Popup>
          </Circle>
        ))}

        {/* Streetlight dots */}
        {showStreetlights && streetlights.map((light) => (
          <CircleMarker
            key={light.id}
            center={[light.latitude, light.longitude]}
            radius={7}
            pathOptions={STATUS_STYLE[light.status] || STATUS_STYLE.working}
            eventHandlers={{ click: () => setSelectedLight(light) }}
          >
            <Popup>
              <div style={{ fontWeight: 600, marginBottom: '3px' }}>
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

        {/* User location */}
        {position && (
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
        )}
      </MapContainer>

      {/* Legend — bottom-left, uses .bottom-safe class to clear mobile nav */}
      <MapLegend />

      {/* Streetlight detail bottom sheet */}
      {selectedLight && (
        <StreetlightDetail
          light={selectedLight}
          userPosition={position}
          onClose={() => setSelectedLight(null)}
        />
      )}

      {/* Proximity alert — uses .bottom-safe class to clear mobile nav */}
      {nearbyZones.length > 0 && !selectedLight && (
        <HotspotWarning zones={nearbyZones} />
      )}
    </div>
  )
}
