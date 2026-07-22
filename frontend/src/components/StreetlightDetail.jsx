/**
 * StreetlightDetail.jsx — Bottom-sheet panel that slides up when a
 * streetlight dot is clicked on the map. Shows full detail + status badge.
 */
import { haversineDistance, formatDistance } from '../utils/haversine'

const STATUS_CONFIG = {
  working: { label: 'Working', color: '#00d4aa', bg: 'rgba(0,212,170,0.12)', icon: '✓' },
  not_working: { label: 'Not Working', color: '#ff4444', bg: 'rgba(255,68,68,0.12)', icon: '✕' },
  flickering: { label: 'Flickering', color: '#ffb300', bg: 'rgba(255,179,0,0.12)', icon: '⚡' },
}

function formatDate(iso) {
  if (!iso) return 'Unknown'
  return new Date(iso).toLocaleString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

export default function StreetlightDetail({ light, userPosition, onClose }) {
  const cfg = STATUS_CONFIG[light.status] || STATUS_CONFIG.working

  const distance = userPosition
    ? formatDistance(haversineDistance(userPosition.lat, userPosition.lng, light.latitude, light.longitude))
    : null

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'absolute', inset: 0, zIndex: 800,
          background: 'rgba(0,0,0,0.4)',
          backdropFilter: 'blur(2px)',
        }}
      />

      {/* Sheet */}
      <div
        className="animate-slide-up"
        style={{
          position: 'absolute', bottom: 0, left: 0, right: 0,
          zIndex: 850,
          background: '#0d1630',
          border: '1px solid rgba(255,255,255,0.1)',
          borderBottom: 'none',
          borderRadius: '20px 20px 0 0',
          padding: '0 0 env(safe-area-inset-bottom)',
          boxShadow: '0 -8px 40px rgba(0,0,0,0.6)',
        }}
      >
        {/* Drag handle */}
        <div style={{ display: 'flex', justifyContent: 'center', paddingTop: '12px', paddingBottom: '4px' }}>
          <div style={{ width: '36px', height: '4px', background: 'rgba(255,255,255,0.15)', borderRadius: '2px' }} />
        </div>

        <div style={{ padding: '12px 20px 24px' }}>
          {/* Header row */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
            <div style={{ flex: 1, marginRight: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                {/* Status dot */}
                <span style={{
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  width: '28px', height: '28px', borderRadius: '50%',
                  background: cfg.bg, color: cfg.color, fontSize: '13px', fontWeight: 700,
                  border: `1px solid ${cfg.color}40`,
                }}>
                  {cfg.icon}
                </span>
                <span style={{
                  padding: '3px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 600,
                  background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.color}30`,
                }}>
                  {cfg.label}
                </span>
              </div>
              <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#f0f4ff', lineHeight: 1.3 }}>
                {light.address || 'Unnamed Streetlight'}
              </h2>
            </div>

            <button
              onClick={onClose}
              style={{
                width: '32px', height: '32px', borderRadius: '50%',
                background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
                color: '#8892a4', fontSize: '18px', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              ×
            </button>
          </div>

          {/* Info grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '16px' }}>
            <InfoCard label="Nearest Landmark" value={light.nearest_landmark || '—'} icon="📍" />
            <InfoCard label="Reported At" value={formatDate(light.reported_at)} icon="🕐" />
            <InfoCard label="Coordinates" value={`${light.latitude.toFixed(5)}, ${light.longitude.toFixed(5)}`} icon="🌐" />
            {distance && <InfoCard label="Distance from You" value={distance} icon="📏" highlight />}
          </div>

          {/* ID */}
          <div style={{ fontSize: '11px', color: '#4a5568' }}>
            Streetlight ID: #{light.id}
          </div>
        </div>
      </div>
    </>
  )
}

function InfoCard({ label, value, icon, highlight }) {
  return (
    <div style={{
      background: highlight ? 'rgba(0,212,170,0.06)' : 'rgba(255,255,255,0.03)',
      border: `1px solid ${highlight ? 'rgba(0,212,170,0.2)' : 'rgba(255,255,255,0.06)'}`,
      borderRadius: '10px', padding: '10px 12px',
    }}>
      <div style={{ fontSize: '10px', color: '#4a5568', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
        <span>{icon}</span> {label}
      </div>
      <div style={{ fontSize: '13px', fontWeight: 600, color: highlight ? '#00d4aa' : '#d0d8f0', lineHeight: 1.3 }}>
        {value}
      </div>
    </div>
  )
}
