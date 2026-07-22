/**
 * ReportForm.jsx — Streetlight report submission form.
 *
 * Responsive fixes:
 *   - Fluid horizontal padding via clamp — never too cramped at 320px
 *   - Coordinate inputs stack vertically below 440px using flex-wrap
 *   - Status option layout uses min-width: 0 to prevent flex overflow
 *   - All inputs have explicit min-height 44px for touch accessibility
 *   - Submit button has active:scale-[0.98] press feedback
 *   - Max content width caps at 520px, centered on desktop
 */
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createStreetlight } from '../api/client'
import { useGeolocation } from '../hooks/useGeolocation'

const STATUS_OPTIONS = [
  {
    value: 'working',
    label: 'Working',
    color: '#00d4aa',
    rgbStr: '0,212,170',
    desc: 'Light is on and functioning normally',
  },
  {
    value: 'flickering',
    label: 'Flickering',
    color: '#ffb300',
    rgbStr: '255,179,0',
    desc: 'Light is unstable / blinking intermittently',
  },
  {
    value: 'not_working',
    label: 'Not Working',
    color: '#ff4444',
    rgbStr: '255,68,68',
    desc: 'Light is completely off or damaged',
  },
]

const inputBase = {
  width: '100%',
  padding: '12px 14px',
  minHeight: '44px',
  borderRadius: '10px',
  fontSize: '14px',
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.10)',
  color: '#f0f4ff',
  outline: 'none',
  fontFamily: 'Inter, sans-serif',
  transition: 'border-color 0.2s, box-shadow 0.2s',
  boxSizing: 'border-box',
}

const labelBase = {
  display: 'block',
  fontSize: '11px',
  fontWeight: 600,
  color: '#8892a4',
  marginBottom: '6px',
  letterSpacing: '0.4px',
  textTransform: 'uppercase',
}

export default function ReportForm() {
  const navigate = useNavigate()
  const { position, loading: geoLoading } = useGeolocation()

  const [form, setForm] = useState({
    latitude: '', longitude: '', address: '', nearest_landmark: '', status: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess]       = useState(false)
  const [error, setError]           = useState(null)
  const [focused, setFocused]       = useState(null)

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }))

  const autofillLocation = () => {
    if (position) {
      set('latitude',  position.lat.toFixed(6))
      set('longitude', position.lng.toFixed(6))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.status) { setError('Please select a streetlight status.'); return }
    if (!form.latitude || !form.longitude) { setError('Please enter or capture coordinates.'); return }

    setSubmitting(true)
    setError(null)
    try {
      await createStreetlight({
        latitude:         parseFloat(form.latitude),
        longitude:        parseFloat(form.longitude),
        address:          form.address || null,
        nearest_landmark: form.nearest_landmark || null,
        status:           form.status,
      })
      setSuccess(true)
      setTimeout(() => navigate('/'), 2000)
    } catch (err) {
      setError(err.response?.data?.detail || 'Submission failed. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center text-center px-6"
        style={{ minHeight: 'calc(100dvh - 124px)' }}>
        <div style={{ fontSize: '52px', marginBottom: '16px' }}>✅</div>
        <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#00d4aa', marginBottom: '8px' }}>
          Report Submitted!
        </h2>
        <p style={{ color: '#8892a4', fontSize: '14px', maxWidth: '300px', lineHeight: 1.6 }}>
          Thank you for helping keep Delhi safer. Redirecting to map…
        </p>
      </div>
    )
  }

  return (
    /*
      fluid horizontal padding: 16px at 320px → 24px at wider screens.
      paddingBottom clears mobile bottom nav (60px nav + 16px gap).
    */
    <div
      className="w-full mx-auto"
      style={{
        maxWidth: '520px',
        padding: 'clamp(16px, 5vw, 24px)',
        paddingBottom: 'calc(60px + 24px)',
      }}
    >
      {/* Page header */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: 'clamp(20px, 5vw, 24px)', fontWeight: 800, color: '#f0f4ff', marginBottom: '6px' }}>
          Report a Streetlight
        </h1>
        <p style={{ fontSize: '13px', color: '#8892a4', lineHeight: 1.6 }}>
          Help track non-functional streetlights across Delhi. Every report improves community safety.
        </p>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }} noValidate>

        {/* ── Status selector ─────────────────────────────────────────────── */}
        <div>
          <label style={labelBase}>Streetlight Status *</label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {STATUS_OPTIONS.map((opt) => {
              const active = form.status === opt.value
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => set('status', opt.value)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px 14px',
                    minHeight: '56px',     /* comfortable tap target */
                    borderRadius: '10px',
                    cursor: 'pointer',
                    background: active
                      ? `rgba(${opt.rgbStr}, 0.10)`
                      : 'rgba(255,255,255,0.03)',
                    border: `1px solid ${active ? `rgba(${opt.rgbStr}, 0.55)` : 'rgba(255,255,255,0.08)'}`,
                    transition: 'all 0.2s',
                    textAlign: 'left',
                    width: '100%',
                    boxSizing: 'border-box',
                  }}
                  aria-pressed={active}
                >
                  {/* Status dot */}
                  <div
                    style={{
                      width: '12px', height: '12px',
                      borderRadius: '50%', flexShrink: 0,
                      background: opt.color,
                      boxShadow: active ? `0 0 8px ${opt.color}` : 'none',
                      transition: 'box-shadow 0.2s',
                    }}
                  />
                  {/* Labels — min-width:0 allows text to truncate in flex */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: active ? opt.color : '#f0f4ff', whiteSpace: 'nowrap' }}>
                      {opt.label}
                    </div>
                    <div style={{ fontSize: '11px', color: '#4a5568', marginTop: '1px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {opt.desc}
                    </div>
                  </div>
                  {/* Check mark */}
                  {active && (
                    <span style={{ color: opt.color, fontSize: '16px', flexShrink: 0 }}>✓</span>
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* ── Coordinates ─────────────────────────────────────────────────── */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', marginBottom: '8px' }}>
            <label style={{ ...labelBase, margin: 0 }}>Coordinates *</label>
            <button
              type="button"
              onClick={autofillLocation}
              disabled={geoLoading || !position}
              style={{
                fontSize: '11px', fontWeight: 600,
                padding: '5px 10px', minHeight: '30px',
                borderRadius: '6px',
                background: position ? 'rgba(0,212,170,0.10)' : 'rgba(255,255,255,0.04)',
                border: `1px solid ${position ? 'rgba(0,212,170,0.35)' : 'rgba(255,255,255,0.08)'}`,
                color: position ? '#00d4aa' : '#4a5568',
                cursor: position ? 'pointer' : 'not-allowed',
                fontFamily: 'Inter, sans-serif',
                whiteSpace: 'nowrap',
                transition: 'all 0.2s',
              }}
            >
              {geoLoading ? '⌛ Locating…' : position ? '📍 Use My Location' : '📍 No GPS Signal'}
            </button>
          </div>

          {/*
            Stack vertically on very narrow screens (< ~440px) via flex-wrap.
            Both inputs are min-width: 120px so they never become unreadably thin.
          */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <input
              type="number" step="any" placeholder="Latitude (e.g. 28.6139)" required
              value={form.latitude}
              onChange={(e) => set('latitude', e.target.value)}
              onFocus={() => setFocused('lat')}
              onBlur={() => setFocused(null)}
              style={{
                ...inputBase,
                flex: '1 1 120px',
                boxShadow: focused === 'lat' ? '0 0 0 2px rgba(0,212,170,0.3)' : 'none',
                borderColor: focused === 'lat' ? 'rgba(0,212,170,0.5)' : 'rgba(255,255,255,0.10)',
              }}
              aria-label="Latitude"
            />
            <input
              type="number" step="any" placeholder="Longitude (e.g. 77.209)" required
              value={form.longitude}
              onChange={(e) => set('longitude', e.target.value)}
              onFocus={() => setFocused('lng')}
              onBlur={() => setFocused(null)}
              style={{
                ...inputBase,
                flex: '1 1 120px',
                boxShadow: focused === 'lng' ? '0 0 0 2px rgba(0,212,170,0.3)' : 'none',
                borderColor: focused === 'lng' ? 'rgba(0,212,170,0.5)' : 'rgba(255,255,255,0.10)',
              }}
              aria-label="Longitude"
            />
          </div>
        </div>

        {/* ── Address ─────────────────────────────────────────────────────── */}
        <div>
          <label style={labelBase} htmlFor="rpt-address">Street Address</label>
          <input
            id="rpt-address"
            type="text"
            placeholder="e.g. Connaught Place, Block A, New Delhi"
            value={form.address}
            onChange={(e) => set('address', e.target.value)}
            onFocus={() => setFocused('addr')}
            onBlur={() => setFocused(null)}
            maxLength={300}
            style={{
              ...inputBase,
              boxShadow: focused === 'addr' ? '0 0 0 2px rgba(0,212,170,0.3)' : 'none',
              borderColor: focused === 'addr' ? 'rgba(0,212,170,0.5)' : 'rgba(255,255,255,0.10)',
            }}
          />
        </div>

        {/* ── Nearest Landmark ────────────────────────────────────────────── */}
        <div>
          <label style={labelBase} htmlFor="rpt-landmark">Nearest Landmark (optional)</label>
          <input
            id="rpt-landmark"
            type="text"
            placeholder="e.g. Janpath Metro Station"
            value={form.nearest_landmark}
            onChange={(e) => set('nearest_landmark', e.target.value)}
            onFocus={() => setFocused('lmk')}
            onBlur={() => setFocused(null)}
            maxLength={300}
            style={{
              ...inputBase,
              boxShadow: focused === 'lmk' ? '0 0 0 2px rgba(0,212,170,0.3)' : 'none',
              borderColor: focused === 'lmk' ? 'rgba(0,212,170,0.5)' : 'rgba(255,255,255,0.10)',
            }}
          />
        </div>

        {/* ── Error ───────────────────────────────────────────────────────── */}
        {error && (
          <div
            className="animate-fade-in"
            style={{
              background: 'rgba(255,68,68,0.10)',
              border: '1px solid rgba(255,68,68,0.35)',
              borderRadius: '8px',
              padding: '10px 14px',
              fontSize: '13px',
              color: '#ff6b6b',
              lineHeight: 1.5,
            }}
            role="alert"
          >
            ⚠️ {error}
          </div>
        )}

        {/* ── Submit ──────────────────────────────────────────────────────── */}
        <button
          type="submit"
          disabled={submitting}
          style={{
            padding: '14px',
            minHeight: '52px',
            borderRadius: '12px',
            fontSize: '15px',
            fontWeight: 700,
            background: submitting
              ? 'rgba(0,212,170,0.30)'
              : 'linear-gradient(135deg, #00d4aa, #00b894)',
            border: 'none',
            color: '#070d1a',
            cursor: submitting ? 'not-allowed' : 'pointer',
            fontFamily: 'Inter, sans-serif',
            boxShadow: submitting ? 'none' : '0 4px 20px rgba(0,212,170,0.35)',
            transition: 'all 0.2s',
            transform: 'scale(1)',
            letterSpacing: '0.2px',
          }}
          onMouseDown={(e) => { if (!submitting) e.currentTarget.style.transform = 'scale(0.98)' }}
          onMouseUp={(e) => { e.currentTarget.style.transform = 'scale(1)' }}
          onTouchStart={(e) => { if (!submitting) e.currentTarget.style.transform = 'scale(0.98)' }}
          onTouchEnd={(e) => { e.currentTarget.style.transform = 'scale(1)' }}
        >
          {submitting ? 'Submitting…' : 'Submit Report →'}
        </button>
      </form>
    </div>
  )
}
