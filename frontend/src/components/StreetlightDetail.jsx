/**
 * StreetlightDetail.jsx — Bottom sheet on mobile, centered card on desktop.
 *
 * Responsive fixes:
 *   - Max-height 80vh + overflow-y: auto so long content scrolls inside sheet
 *   - On md+ (≥768px): renders as a centered floating card, not full-width sheet
 *   - Info grid uses minmax(0, 1fr) to prevent text overflow at 320px
 *   - Address text clamps to 2 lines instead of overflowing
 *   - Drag handle only shown on mobile (irrelevant on desktop card)
 */
import { haversineDistance, formatDistance } from '../utils/haversine'

const STATUS_CONFIG = {
  working:     { label: 'Working',     color: '#00d4aa', bg: 'rgba(0,212,170,0.12)',  icon: '✓' },
  not_working: { label: 'Not Working', color: '#ff4444', bg: 'rgba(255,68,68,0.12)',  icon: '✕' },
  flickering:  { label: 'Flickering',  color: '#ffb300', bg: 'rgba(255,179,0,0.12)', icon: '⚡' },
}

function formatDate(iso) {
  if (!iso) return 'Unknown'
  try {
    return new Date(iso).toLocaleString('en-IN', {
      day: 'numeric', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    })
  } catch {
    return iso
  }
}

export default function StreetlightDetail({ light, userPosition, onClose }) {
  const cfg = STATUS_CONFIG[light.status] || STATUS_CONFIG.working

  const distance = userPosition
    ? formatDistance(haversineDistance(userPosition.lat, userPosition.lng, light.latitude, light.longitude))
    : null

  return (
    <>
      {/* ── Backdrop ──────────────────────────────────────────────────────── */}
      <div
        onClick={onClose}
        className="absolute inset-0 z-[800]"
        style={{ background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(2px)' }}
        aria-label="Close detail panel"
      />

      {/* ── Sheet/Card ────────────────────────────────────────────────────── */}
      {/*
        Mobile  (<768px): full-width sheet anchored to bottom of map container
        Desktop (≥768px): centered card floating in the map container
      */}
      <div
        className="animate-slide-up absolute z-[850]
          /* mobile: full-width bottom sheet */
          bottom-0 left-0 right-0
          /* desktop: centered card with auto margins */
          md:bottom-6 md:left-1/2 md:-translate-x-1/2 md:right-auto md:w-full md:max-w-md"
        style={{
          background: '#0d1630',
          border: '1px solid rgba(255,255,255,0.10)',
          borderBottom: 'none',
          /* mobile rounded top / desktop rounded all */
          borderRadius: '20px 20px 0 0',
          boxShadow: '0 -8px 40px rgba(0,0,0,0.6)',
          /* prevent overflow beyond 80% of map height */
          maxHeight: '80vh',
          overflowY: 'auto',
          overscrollBehavior: 'contain',
        }}
      >
        {/* Drag handle — visual cue on mobile, hidden on desktop */}
        <div className="flex justify-center pt-3 pb-1 md:hidden">
          <div style={{ width: '36px', height: '4px', background: 'rgba(255,255,255,0.15)', borderRadius: '2px' }} />
        </div>

        <div style={{ padding: 'clamp(12px, 4vw, 20px)', paddingTop: '10px' }}>
          {/* ── Header row ──────────────────────────────────────────────── */}
          <div className="flex items-start justify-between gap-3 mb-4">
            <div className="flex-1 min-w-0">
              {/* Status badge */}
              <div className="flex items-center gap-2 flex-wrap mb-1.5">
                <span
                  style={{
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    width: '26px', height: '26px', borderRadius: '50%',
                    background: cfg.bg, color: cfg.color,
                    fontSize: '13px', fontWeight: 700,
                    border: `1px solid ${cfg.color}40`, flexShrink: 0,
                  }}
                >
                  {cfg.icon}
                </span>
                <span
                  style={{
                    padding: '3px 10px', borderRadius: '20px',
                    fontSize: '12px', fontWeight: 600,
                    background: cfg.bg, color: cfg.color,
                    border: `1px solid ${cfg.color}30`,
                    whiteSpace: 'nowrap',
                  }}
                >
                  {cfg.label}
                </span>
                <span style={{ fontSize: '11px', color: '#4a5568', whiteSpace: 'nowrap' }}>
                  #{light.id}
                </span>
              </div>

              {/* Address — clamp to 2 lines to prevent giant overflow */}
              <h2
                style={{
                  fontSize: 'clamp(14px, 3.5vw, 16px)', fontWeight: 700,
                  color: '#f0f4ff', lineHeight: 1.35,
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                }}
              >
                {light.address || 'Unnamed Streetlight'}
              </h2>
            </div>

            {/* Close button — 40px touch target */}
            <button
              onClick={onClose}
              aria-label="Close details"
              style={{
                flexShrink: 0,
                width: '36px', height: '36px',
                minWidth: '36px', /* prevent squish */
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.10)',
                color: '#8892a4', fontSize: '20px',
                cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                lineHeight: 1,
              }}
            >
              ×
            </button>
          </div>

          {/* ── Info cards grid ─────────────────────────────────────────── */}
          <div
            style={{
              display: 'grid',
              /* minmax(0,1fr) prevents content overflow at 320px */
              gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
              gap: '8px',
              marginBottom: '16px',
            }}
          >
            <InfoCard label="Nearest Landmark" value={light.nearest_landmark || '—'} icon="📍" />
            <InfoCard label="Reported At"      value={formatDate(light.reported_at)} icon="🕐" />
            <InfoCard
              label="Coordinates"
              value={`${light.latitude.toFixed(4)}, ${light.longitude.toFixed(4)}`}
              icon="🌐"
            />
            {distance && (
              <InfoCard label="Distance from You" value={distance} icon="📏" highlight />
            )}
          </div>
        </div>
      </div>
    </>
  )
}

function InfoCard({ label, value, icon, highlight }) {
  return (
    <div
      style={{
        background: highlight ? 'rgba(0,212,170,0.07)' : 'rgba(255,255,255,0.03)',
        border: `1px solid ${highlight ? 'rgba(0,212,170,0.22)' : 'rgba(255,255,255,0.06)'}`,
        borderRadius: '10px',
        padding: 'clamp(8px, 2.5vw, 11px)',
        minWidth: 0, /* allow grid cell to shrink */
      }}
    >
      <div style={{ fontSize: '10px', color: '#4a5568', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '3px' }}>
        <span>{icon}</span> {label}
      </div>
      {/* Truncate value if very long */}
      <div
        style={{
          fontSize: 'clamp(11px, 2.5vw, 13px)', fontWeight: 600,
          color: highlight ? '#00d4aa' : '#d0d8f0',
          lineHeight: 1.35,
          overflow: 'hidden',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
        }}
      >
        {value}
      </div>
    </div>
  )
}
