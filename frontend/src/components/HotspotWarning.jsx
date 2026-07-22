/**
 * HotspotWarning.jsx — Danger proximity alert banner.
 * Slides up from bottom when user enters a red/yellow zone buffer.
 * Dismissable — auto-re-shows if still nearby after 60s.
 */
import { useState, useEffect } from 'react'
import { formatDistance } from '../utils/haversine'

const RISK_CONFIG = {
  red: {
    bg: 'rgba(255,68,68,0.12)',
    border: 'rgba(255,68,68,0.4)',
    color: '#ff4444',
    glow: 'rgba(255,68,68,0.3)',
    label: 'HIGH RISK ZONE',
    icon: '🚨',
  },
  yellow: {
    bg: 'rgba(255,179,0,0.10)',
    border: 'rgba(255,179,0,0.35)',
    color: '#ffb300',
    glow: 'rgba(255,179,0,0.2)',
    label: 'CAUTION ZONE',
    icon: '⚠️',
  },
}

export default function HotspotWarning({ zones }) {
  const [dismissed, setDismissed] = useState(false)

  // Reset dismissed state whenever zones list changes (new check cycle)
  useEffect(() => {
    setDismissed(false)
  }, [zones.map((z) => z.id).join(',')])

  if (dismissed || !zones.length) return null

  const topZone = zones[0] // show closest zone first
  const cfg = RISK_CONFIG[topZone.risk_level] || RISK_CONFIG.yellow
  const others = zones.length - 1

  return (
    <div
      className="animate-slide-up"
      style={{
        position: 'absolute',
        bottom: 'calc(env(safe-area-inset-bottom) + 0px)',
        left: '12px', right: '12px',
        zIndex: 880,
        borderRadius: '16px',
        background: cfg.bg,
        border: `1px solid ${cfg.border}`,
        boxShadow: `0 0 24px ${cfg.glow}, 0 8px 32px rgba(0,0,0,0.5)`,
        padding: '14px 16px',
        backdropFilter: 'blur(16px)',
      }}
    >
      {/* Pulsing ring indicator */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
        {/* Icon with pulse */}
        <div style={{ position: 'relative', flexShrink: 0, marginTop: '2px' }}>
          <div
            style={{
              width: '36px', height: '36px', borderRadius: '50%',
              background: `rgba(${cfg.color === '#ff4444' ? '255,68,68' : '255,179,0'}, 0.15)`,
              border: `2px solid ${cfg.color}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '18px',
            }}
            className="warning-pulse"
          >
            {cfg.icon}
          </div>
        </div>

        {/* Text */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: '11px', fontWeight: 700, color: cfg.color, letterSpacing: '0.8px', marginBottom: '3px' }}>
            {cfg.label}
          </div>
          <div style={{ fontSize: '14px', fontWeight: 600, color: '#f0f4ff', marginBottom: '4px', lineHeight: 1.3 }}>
            {topZone.label}
          </div>
          <div style={{ fontSize: '12px', color: '#8892a4' }}>
            You are approximately{' '}
            <span style={{ color: cfg.color, fontWeight: 600 }}>
              {formatDistance(topZone.distance)}
            </span>{' '}
            away from this flagged zone
            {others > 0 && ` · ${others} more zone${others > 1 ? 's' : ''} nearby`}
          </div>
        </div>

        {/* Dismiss */}
        <button
          onClick={() => setDismissed(true)}
          style={{
            flexShrink: 0, width: '28px', height: '28px', borderRadius: '50%',
            background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)',
            color: '#8892a4', fontSize: '16px', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            marginTop: '2px',
          }}
          aria-label="Dismiss warning"
        >
          ×
        </button>
      </div>

      {/* Bottom bar: Stay Safe tip */}
      <div style={{
        marginTop: '10px', paddingTop: '10px',
        borderTop: '1px solid rgba(255,255,255,0.06)',
        fontSize: '11px', color: '#4a5568', display: 'flex', alignItems: 'center', gap: '6px',
      }}>
        <span style={{ fontSize: '14px' }}>💡</span>
        Stay in well-lit areas and keep someone informed of your location.
      </div>
    </div>
  )
}
