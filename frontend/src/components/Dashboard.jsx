/**
 * Dashboard.jsx — Safety overview dashboard.
 *
 * Responsive fixes:
 *   - Stat cards: 1 col on <sm, 2 col on sm, 4 col on lg
 *   - Charts: min-height 180px so they're readable; ResponsiveContainer handles width
 *   - Zone list rows have hover feedback and truncated labels
 *   - Fluid horizontal padding, bottom clearance for mobile nav
 *   - SectionCard shimmer has explicit height so it looks intentional
 */
import { useState, useEffect } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
  PieChart, Pie, Legend,
} from 'recharts'
import { fetchStreetlightStats, fetchHotspots } from '../api/client'

const STATUS_COLORS = { working: '#00d4aa', flickering: '#ffb300', not_working: '#ff4444' }
const RISK_COLORS   = { red: '#ff4444', yellow: '#ffb300', green: '#00c853' }
const STATUS_LABELS = { working: 'Working', not_working: 'Not Working', flickering: 'Flickering' }
const RISK_LABELS   = { red: 'High Risk', yellow: 'Caution', green: 'Safe' }

// ── Custom Recharts tooltip ────────────────────────────────────────────────────
function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div style={{
      background: '#131d3a',
      border: '1px solid rgba(255,255,255,0.10)',
      borderRadius: '10px',
      padding: '10px 14px',
      fontSize: '13px',
      color: '#f0f4ff',
      boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
    }}>
      <div style={{ fontWeight: 600, marginBottom: '4px' }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ color: p.fill || p.color }}>
          {p.name || p.dataKey}: <strong>{p.value}</strong>
        </div>
      ))}
    </div>
  )
}

// ── Stat card ──────────────────────────────────────────────────────────────────
function StatCard({ label, value, sublabel, color, icon, loading }) {
  if (loading) {
    return (
      <div className="shimmer" style={{ borderRadius: '14px', minHeight: '110px' }} />
    )
  }
  return (
    <div
      style={{
        background: 'rgba(13,22,48,0.80)',
        border: `1px solid ${color}22`,
        borderRadius: '14px',
        padding: 'clamp(14px, 3.5vw, 20px)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Subtle glow blob */}
      <div style={{
        position: 'absolute', top: '-16px', right: '-16px',
        width: '72px', height: '72px', borderRadius: '50%',
        background: `radial-gradient(circle, ${color}28 0%, transparent 70%)`,
        pointerEvents: 'none',
      }} />
      <div style={{ fontSize: 'clamp(20px, 5vw, 22px)', marginBottom: '8px' }}>{icon}</div>
      <div style={{
        fontSize: 'clamp(26px, 7vw, 32px)',
        fontWeight: 800,
        color,
        lineHeight: 1,
        marginBottom: '4px',
      }}>
        {value}
      </div>
      <div style={{ fontSize: 'clamp(12px, 3vw, 13px)', fontWeight: 600, color: '#f0f4ff', marginBottom: '2px' }}>
        {label}
      </div>
      {sublabel && (
        <div style={{ fontSize: '11px', color: '#4a5568' }}>{sublabel}</div>
      )}
    </div>
  )
}

// ── Section card container ─────────────────────────────────────────────────────
function SectionCard({ title, subtitle, loading, minChartHeight = 200, children }) {
  return (
    <div style={{
      background: 'rgba(13,22,48,0.72)',
      border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: '16px',
      padding: 'clamp(14px, 4vw, 20px)',
      marginBottom: '16px',
    }}>
      <div style={{ marginBottom: '16px' }}>
        <div style={{ fontSize: 'clamp(14px, 3.5vw, 15px)', fontWeight: 700, color: '#f0f4ff' }}>
          {title}
        </div>
        <div style={{ fontSize: '11px', color: '#4a5568', marginTop: '2px' }}>
          {subtitle}
        </div>
      </div>
      {loading
        ? <div className="shimmer" style={{ height: minChartHeight, borderRadius: '8px' }} />
        : children
      }
    </div>
  )
}

// ── Dashboard ─────────────────────────────────────────────────────────────────
export default function Dashboard() {
  const [stats,    setStats]    = useState(null)
  const [hotspots, setHotspots] = useState([])
  const [loading,  setLoading]  = useState(true)
  const [error,    setError]    = useState(null)

  useEffect(() => {
    Promise.all([fetchStreetlightStats(), fetchHotspots()])
      .then(([s, h]) => { setStats(s); setHotspots(h) })
      .catch(() => setError('Could not load dashboard data.'))
      .finally(() => setLoading(false))
  }, [])

  const barData = stats
    ? stats.by_status.map((s) => ({
        name: STATUS_LABELS[s.status] || s.status,
        count: s.count,
        fill: STATUS_COLORS[s.status] || '#8892a4',
      }))
    : []

  const pieData = ['red', 'yellow', 'green']
    .map((r) => ({
      name: RISK_LABELS[r],
      value: hotspots.filter((h) => h.risk_level === r).length,
      fill: RISK_COLORS[r],
    }))
    .filter((d) => d.value > 0)

  const broken     = stats?.by_status.find((s) => s.status === 'not_working')?.count ?? 0
  const flickering = stats?.by_status.find((s) => s.status === 'flickering')?.count ?? 0
  const redZones   = hotspots.filter((h) => h.risk_level === 'red').length

  return (
    <div
      className="w-full mx-auto"
      style={{
        maxWidth: '720px',
        padding: 'clamp(16px, 5vw, 24px)',
        /* clear mobile nav */
        paddingBottom: 'calc(60px + 24px)',
      }}
    >
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: 'clamp(20px, 5vw, 24px)', fontWeight: 800, color: '#f0f4ff', marginBottom: '4px' }}>
          Safety Dashboard
        </h1>
        <p style={{ fontSize: '13px', color: '#8892a4', lineHeight: 1.6 }}>
          Real-time streetlight status and crime hotspot distribution across Delhi.
        </p>
      </div>

      {/* Error */}
      {error && (
        <div
          className="animate-fade-in"
          style={{
            background: 'rgba(255,68,68,0.10)', border: '1px solid rgba(255,68,68,0.30)',
            borderRadius: '10px', padding: '12px 16px',
            color: '#ff6b6b', fontSize: '13px', marginBottom: '20px',
          }}
          role="alert"
        >
          ⚠️ {error}
        </div>
      )}

      {/* ── Stat cards grid ───────────────────────────────────────────────────
          Mobile (<640px):  1 col (avoids cramped 2-col at 320px)
          Tablet (≥640px):  2 col
          Desktop (≥1024px): 4 col
      */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <StatCard loading={loading} label="Total Lights"  value={stats?.total ?? '—'} icon="💡" color="#00d4aa" sublabel="monitored across Delhi" />
        <StatCard loading={loading} label="Not Working"   value={broken}              icon="🔴" color="#ff4444" sublabel="need urgent attention" />
        <StatCard loading={loading} label="Flickering"    value={flickering}          icon="⚡" color="#ffb300" sublabel="unstable / intermittent" />
        <StatCard loading={loading} label="High Risk Zones" value={redZones}          icon="🚨" color="#ff4444" sublabel="crime hotspots" />
      </div>

      {/* ── Charts grid ───────────────────────────────────────────────────────
          Mobile: stacked. Desktop (≥768px): side by side.
      */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <SectionCard
          title="Streetlights by Status"
          subtitle={`${stats?.total ?? 0} total reports`}
          loading={loading}
          minChartHeight={200}
        >
          {barData.length > 0 && (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={barData} margin={{ top: 8, right: 4, left: -20, bottom: 0 }} barSize={32}>
                <XAxis
                  dataKey="name"
                  tick={{ fill: '#8892a4', fontSize: 11 }}
                  axisLine={false} tickLine={false}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fill: '#8892a4', fontSize: 10 }}
                  axisLine={false} tickLine={false}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {barData.map((entry, i) => (
                    <Cell key={i} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </SectionCard>

        <SectionCard
          title="Hotspot Risk Distribution"
          subtitle={`${hotspots.length} zones across Delhi`}
          loading={loading}
          minChartHeight={200}
        >
          {pieData.length > 0 && (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%" cy="42%"
                  innerRadius={48} outerRadius={76}
                  paddingAngle={3}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                  labelLine={{ stroke: 'rgba(255,255,255,0.15)' }}
                >
                  {pieData.map((entry, i) => (
                    <Cell key={i} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  formatter={(val) => <span style={{ color: '#8892a4', fontSize: '11px' }}>{val}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </SectionCard>
      </div>

      {/* ── Hotspot zone list ──────────────────────────────────────────────── */}
      <SectionCard
        title="All Crime Hotspot Zones"
        subtitle="Seeded data — Delhi"
        loading={loading}
        minChartHeight={120}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {hotspots.map((h) => (
            <div
              key={h.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '10px',
                padding: '10px 12px',
                borderRadius: '10px',
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.06)',
                transition: 'background 0.18s, border-color 0.18s',
                cursor: 'default',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.05)'
                e.currentTarget.style.borderColor = `${RISK_COLORS[h.risk_level]}35`
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.02)'
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'
              }}
            >
              {/* Left — dot + label */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                <div style={{
                  width: '10px', height: '10px', borderRadius: '50%', flexShrink: 0,
                  background: RISK_COLORS[h.risk_level],
                  boxShadow: `0 0 5px ${RISK_COLORS[h.risk_level]}`,
                }} />
                <div style={{ minWidth: 0 }}>
                  <div style={{
                    fontSize: '13px', fontWeight: 600, color: '#d0d8f0',
                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                  }}>
                    {h.label}
                  </div>
                  <div style={{ fontSize: '11px', color: '#4a5568' }}>
                    Radius: {h.radius_meters}m
                  </div>
                </div>
              </div>

              {/* Right — risk badge */}
              <span style={{
                flexShrink: 0,
                padding: '3px 10px',
                borderRadius: '20px',
                fontSize: '11px',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                background: `${RISK_COLORS[h.risk_level]}15`,
                color: RISK_COLORS[h.risk_level],
                border: `1px solid ${RISK_COLORS[h.risk_level]}30`,
                whiteSpace: 'nowrap',
              }}>
                {h.risk_level}
              </span>
            </div>
          ))}

          {/* Empty state */}
          {!loading && hotspots.length === 0 && (
            <div style={{ textAlign: 'center', padding: '32px 16px', color: '#4a5568', fontSize: '13px' }}>
              No hotspot zones loaded yet. Check backend connection.
            </div>
          )}
        </div>
      </SectionCard>
    </div>
  )
}
