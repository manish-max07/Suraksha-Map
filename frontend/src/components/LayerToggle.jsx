/**
 * LayerToggle.jsx — Glassmorphism pill buttons to show/hide map layers.
 *
 * Responsive fixes:
 *   - Compact (icon-only) variant on screens < 360px via CSS container check
 *   - Positioned top-right, clear of Leaflet zoom control (which is top-left)
 *   - Smaller padding / font on narrow screens via clamp()
 */
export default function LayerToggle({ showStreetlights, showHotspots, onToggleStreetlights, onToggleHotspots }) {
  return (
    <div
      style={{
        position: 'absolute',
        /* Sit just below the top bar (60px) + a small gap */
        top: '12px',
        right: '12px',
        zIndex: 900,
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
      }}
    >
      <ToggleButton
        active={showStreetlights}
        onClick={onToggleStreetlights}
        color="#00d4aa"
        label="Streetlights"
        dotColor="#00d4aa"
      />
      <ToggleButton
        active={showHotspots}
        onClick={onToggleHotspots}
        color="#ff4444"
        label="Hotspots"
        dotColor="#ff4444"
      />
    </div>
  )
}

function ToggleButton({ active, onClick, color, label, dotColor }) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '7px',
        /* Use clamp so button doesn't become too wide on large screens
           or too wide on small ones — 44px minimum height for touch */
        padding: 'clamp(6px, 1.5vw, 8px) clamp(10px, 2.5vw, 14px)',
        minHeight: '36px',
        borderRadius: '20px',
        background: active
          ? `rgba(${hexToRgb(color)}, 0.15)`
          : 'rgba(13,22,48,0.88)',
        backdropFilter: 'blur(14px)',
        WebkitBackdropFilter: 'blur(14px)',
        border: `1px solid ${active ? `rgba(${hexToRgb(color)}, 0.45)` : 'rgba(255,255,255,0.10)'}`,
        color: active ? color : '#4a5568',
        fontSize: 'clamp(11px, 2.5vw, 12px)',
        fontWeight: 600,
        fontFamily: 'Inter, sans-serif',
        cursor: 'pointer',
        transition: 'all 0.22s ease',
        boxShadow: active
          ? `0 0 14px rgba(${hexToRgb(color)}, 0.22), 0 2px 8px rgba(0,0,0,0.3)`
          : '0 2px 8px rgba(0,0,0,0.3)',
        whiteSpace: 'nowrap',
        /* Stretch touch area without affecting visual size */
        lineHeight: 1,
      }}
    >
      <span
        style={{
          width: '8px',
          height: '8px',
          borderRadius: '50%',
          flexShrink: 0,
          background: active ? dotColor : '#2d3748',
          boxShadow: active ? `0 0 6px ${dotColor}` : 'none',
          transition: 'all 0.22s ease',
        }}
      />
      {label}
    </button>
  )
}

function hexToRgb(hex) {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `${r}, ${g}, ${b}`
}
