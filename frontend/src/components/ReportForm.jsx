/**
 * ReportForm.jsx — Full-page form to submit a new streetlight status report.
 * Supports browser geolocation autofill for lat/lng.
 */
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createStreetlight } from '../api/client'
import { useGeolocation } from '../hooks/useGeolocation'

const STATUS_OPTIONS = [
  { value: 'working',     label: 'Working',     color: '#00d4aa', desc: 'Light is on and functioning normally' },
  { value: 'flickering',  label: 'Flickering',  color: '#ffb300', desc: 'Light is on but unstable / intermittent' },
  { value: 'not_working', label: 'Not Working', color: '#ff4444', desc: 'Light is off or damaged' },
]

const inputStyle = {
  width: '100%', padding: '12px 14px', borderRadius: '10px', fontSize: '14px',
  background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
  color: '#f0f4ff', outline: 'none', fontFamily: 'Inter, sans-serif',
  transition: 'border-color 0.2s',
}

const labelStyle = {
  display: 'block', fontSize: '12px', fontWeight: 600, color: '#8892a4',
  marginBottom: '6px', letterSpacing: '0.3px',
}

export default function ReportForm() {
  const navigate = useNavigate()
  const { position, loading: geoLoading } = useGeolocation()

  const [form, setForm] = useState({
    latitude: '',
    longitude: '',
    address: '',
    nearest_landmark: '',
    status: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState(null)

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }))

  const autofillLocation = () => {
    if (position) {
      set('latitude', position.lat.toFixed(6))
      set('longitude', position.lng.toFixed(6))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.status) { setError('Please select a status.'); return }
    if (!form.latitude || !form.longitude) { setError('Please provide coordinates.'); return }

    setSubmitting(true)
    setError(null)
    try {
      await createStreetlight({
        latitude: parseFloat(form.latitude),
        longitude: parseFloat(form.longitude),
        address: form.address || null,
        nearest_landmark: form.nearest_landmark || null,
        status: form.status,
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
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100dvh - 124px)', padding: '24px', textAlign: 'center' }}>
        <div style={{ fontSize: '56px', marginBottom: '16px' }}>✅</div>
        <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#00d4aa', marginBottom: '8px' }}>Report Submitted!</h2>
        <p style={{ color: '#8892a4', fontSize: '14px' }}>Thank you for helping keep your community safer. Redirecting to map…</p>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: '520px', margin: '0 auto', padding: '24px 20px', paddingBottom: '80px' }}>
      {/* Header */}
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#f0f4ff', marginBottom: '6px' }}>
          Report a Streetlight
        </h1>
        <p style={{ fontSize: '13px', color: '#8892a4', lineHeight: 1.6 }}>
          Help us track non-functional streetlights. Your report improves safety for everyone.
        </p>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
        {/* Status Selector */}
        <div>
          <label style={labelStyle}>STATUS *</label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {STATUS_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => set('status', opt.value)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '12px',
                  padding: '12px 14px', borderRadius: '10px', cursor: 'pointer',
                  background: form.status === opt.value ? `rgba(${opt.value === 'working' ? '0,212,170' : opt.value === 'flickering' ? '255,179,0' : '255,68,68'}, 0.1)` : 'rgba(255,255,255,0.03)',
                  border: `1px solid ${form.status === opt.value ? opt.color + '60' : 'rgba(255,255,255,0.08)'}`,
                  transition: 'all 0.2s', textAlign: 'left',
                }}
              >
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: opt.color, flexShrink: 0, boxShadow: form.status === opt.value ? `0 0 8px ${opt.color}` : 'none' }} />
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: form.status === opt.value ? opt.color : '#f0f4ff' }}>{opt.label}</div>
                  <div style={{ fontSize: '11px', color: '#4a5568', marginTop: '1px' }}>{opt.desc}</div>
                </div>
                {form.status === opt.value && (
                  <div style={{ marginLeft: 'auto', color: opt.color, fontSize: '16px' }}>✓</div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Location row */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <label style={{ ...labelStyle, margin: 0 }}>COORDINATES *</label>
            <button
              type="button"
              onClick={autofillLocation}
              disabled={geoLoading || !position}
              style={{
                fontSize: '11px', fontWeight: 600, padding: '4px 10px', borderRadius: '6px',
                background: position ? 'rgba(0,212,170,0.1)' : 'rgba(255,255,255,0.04)',
                border: `1px solid ${position ? 'rgba(0,212,170,0.3)' : 'rgba(255,255,255,0.08)'}`,
                color: position ? '#00d4aa' : '#4a5568',
                cursor: position ? 'pointer' : 'not-allowed',
                fontFamily: 'Inter, sans-serif',
              }}
            >
              {geoLoading ? '⌛ Locating…' : position ? '📍 Use My Location' : '📍 No GPS Signal'}
            </button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <input style={inputStyle} type="number" step="any" placeholder="Latitude" value={form.latitude} onChange={(e) => set('latitude', e.target.value)} required />
            <input style={inputStyle} type="number" step="any" placeholder="Longitude" value={form.longitude} onChange={(e) => set('longitude', e.target.value)} required />
          </div>
        </div>

        {/* Address */}
        <div>
          <label style={labelStyle}>ADDRESS</label>
          <input
            style={inputStyle}
            type="text"
            placeholder="e.g. Connaught Place, Block A, New Delhi"
            value={form.address}
            onChange={(e) => set('address', e.target.value)}
            maxLength={300}
          />
        </div>

        {/* Nearest Landmark */}
        <div>
          <label style={labelStyle}>NEAREST LANDMARK</label>
          <input
            style={inputStyle}
            type="text"
            placeholder="e.g. Janpath Metro Station"
            value={form.nearest_landmark}
            onChange={(e) => set('nearest_landmark', e.target.value)}
            maxLength={300}
          />
        </div>

        {/* Error */}
        {error && (
          <div style={{ background: 'rgba(255,68,68,0.1)', border: '1px solid rgba(255,68,68,0.3)', borderRadius: '8px', padding: '10px 14px', fontSize: '13px', color: '#ff6b6b' }}>
            ⚠️ {error}
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={submitting}
          style={{
            padding: '14px', borderRadius: '12px', fontSize: '15px', fontWeight: 700,
            background: submitting ? 'rgba(0,212,170,0.3)' : 'linear-gradient(135deg, #00d4aa, #00b894)',
            border: 'none', color: '#070d1a', cursor: submitting ? 'not-allowed' : 'pointer',
            fontFamily: 'Inter, sans-serif',
            boxShadow: submitting ? 'none' : '0 4px 20px rgba(0,212,170,0.35)',
            transition: 'all 0.2s',
          }}
        >
          {submitting ? 'Submitting…' : 'Submit Report →'}
        </button>
      </form>
    </div>
  )
}
