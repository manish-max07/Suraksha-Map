/**
 * HotspotWarning.jsx — Safety proximity alert banner.
 *
 * Responsive fixes:
 *   - Uses `.bottom-safe` CSS class (index.css): clears mobile bottom nav (64px)
 *     on mobile, falls back to 16px on desktop.
 *   - Zone name truncates to one line with ellipsis at narrow widths
 *   - Left/right margin uses clamp for fluid breathing room
 *   - Dismiss button has proper 36px touch target
 */
import { useState, useEffect } from 'react'
import { formatDistance } from '../utils/haversine'

const RISK_CONFIG = {
  red: {
    bg: 'rgba(255,68,68,0.12)',
    border: 'rgba(255,68,68,0.42)',
    color: '#ff4444',
    rgbStr: '255,68,68',
    badge: 'HIGH RISK ZONE',
    icon: '🚨',
  },
  yellow: {
    bg: 'rgba(255,179,0,0.10)',
    border: 'rgba(255,179,0,0.38)',
    color: '#ffb300',
    rgbStr: '255,179,0',
    badge: 'CAUTION ZONE',
    icon: '⚠️',
  },
}

export default function HotspotWarning({ zones }) {
  const [dismissed, setDismissed] = useState(false)

  // Re-show if the set of nearby zones changes
  useEffect(() => {
    setDismissed(false)
  }, [zones.map((z) => z.id).join(',')])  // eslint-disable-line

  if (dismissed || !zones.length) return null

  const topZone = zones[0]
  const cfg     = RISK_CONFIG[topZone.risk_level] || RISK_CONFIG.yellow
  const others  = zones.length - 1

  return (
    /* bottom-safe class: 76px above bottom on mobile (clears nav bar),
       16px on desktop. Left/right use clamp to breathe on any width.  */
    <div
      className="absolute left-3 right-3 z-[880] animate-slide-up bottom-safe md:left-4 md:right-4 md:max-w-sm md:mx-auto"
      style={{
        borderRadius: '16px',
        background: cfg.bg,
        border: `1px solid ${cfg.border}`,
        boxShadow: `0 0 28px rgba(${cfg.rgbStr}, 0.22), 0 8px 32px rgba(0,0,0,0.5)`,
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        padding: 'clamp(12px, 3.5vw, 16px)',
      }}
      role="alert"
      aria-live="assertive"
    >
      <div className="flex items-start gap-3">
        {/* Pulse icon */}
        <div
          className="warning-pulse flex-shrink-0"
          style={{
            width: '36px', height: '36px', borderRadius: '50%',
            background: `rgba(${cfg.rgbStr}, 0.15)`,
            border: `2px solid ${cfg.color}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '16px',
            marginTop: '1px',
          }}
          aria-hidden="true"
        >
          {cfg.icon}
        </div>

        {/* Text block */}
        <div className="flex-1 min-w-0">
          <div style={{ fontSize: '10px', fontWeight: 700, color: cfg.color, letterSpacing: '0.8px', marginBottom: '2px' }}>
            {cfg.badge}
          </div>
          {/* Truncate long zone names at 1 line */}
          <div
            style={{
              fontSize: 'clamp(13px, 3.5vw, 14px)', fontWeight: 600, color: '#f0f4ff',
              lineHeight: 1.3, marginBottom: '3px',
              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
            }}
            title={topZone.label}
          >
            {topZone.label}
          </div>
          <div style={{ fontSize: '12px', color: '#8892a4', lineHeight: 1.4 }}>
            Approx.{' '}
            <span style={{ color: cfg.color, fontWeight: 600 }}>
              {formatDistance(topZone.distance)}
            </span>{' '}
            away
            {others > 0 && (
              <span style={{ color: '#4a5568' }}> · {others} more nearby</span>
            )}
          </div>
        </div>

        {/* Dismiss — 36px touch target */}
        <button
          onClick={() => setDismissed(true)}
          aria-label="Dismiss warning"
          style={{
            flexShrink: 0,
            width: '32px', height: '32px',
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.07)',
            border: '1px solid rgba(255,255,255,0.12)',
            color: '#8892a4', fontSize: '18px',
            cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            lineHeight: 1,
            marginTop: '1px',
          }}
        >
          ×
        </button>
      </div>

      {/* Safety tip */}
      <div
        style={{
          marginTop: '10px',
          paddingTop: '10px',
          borderTop: '1px solid rgba(255,255,255,0.06)',
          fontSize: '11px',
          color: '#4a5568',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '6px',
          lineHeight: 1.4,
        }}
      >
        <span aria-hidden="true">💡</span>
        <span>Stay in well-lit areas and keep someone informed of your location.</span>
      </div>
    </div>
  )
}
