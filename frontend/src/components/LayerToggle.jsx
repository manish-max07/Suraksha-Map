/**
 * LayerToggle.jsx — Glassmorphism pill buttons to show/hide map layers.
 * Floats top-right on the map canvas.
 */
export default function LayerToggle({ showStreetlights, showHotspots, onToggleStreetlights, onToggleHotspots }) {
  return (
    <div
      style={{
        position: 'absolute', top: '16px', right: '16px', zIndex: 900,
        display: 'flex', flexDirection: 'column', gap: '8px',
      }}
    >
      <ToggleButton
        active={showStreetlights}
        onClick={onToggleStreetlights}
        color="#00d4aa"
        label="Streetlights"
        dot="#00d4aa"
      />
      <ToggleButton
        active={showHotspots}
        onClick={onToggleHotspots}
        color="#ff4444"
        label="Hotspots"
        dot="#ff4444"
      />
    </div>
  )
}

function ToggleButton({ active, onClick, color, label, dot }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', gap: '8px',
        padding: '8px 14px', borderRadius: '20px',
        background: active ? `rgba(${hexToRgb(color)}, 0.15)` : 'rgba(13,22,48,0.85)',
        backdropFilter: 'blur(12px)',
        border: `1px solid ${active ? `rgba(${hexToRgb(color)}, 0.4)` : 'rgba(255,255,255,0.1)'}`,
        color: active ? color : '#4a5568',
        fontSize: '12px', fontWeight: 600, fontFamily: 'Inter, sans-serif',
        cursor: 'pointer', transition: 'all 0.25s ease',
        boxShadow: active ? `0 0 12px rgba(${hexToRgb(color)}, 0.2)` : 'none',
        whiteSpace: 'nowrap',
      }}
    >
      <span
        style={{
          width: '8px', height: '8px', borderRadius: '50%',
          background: active ? dot : '#2d3748',
          boxShadow: active ? `0 0 6px ${dot}` : 'none',
          transition: 'all 0.25s',
          flexShrink: 0,
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
