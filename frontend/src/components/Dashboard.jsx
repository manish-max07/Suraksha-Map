/**
 * Dashboard.jsx — Stats overview page.
 * Shows: total streetlights by status, hotspot zone counts by risk level.
 * Uses Recharts for bar + pie charts.
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

// Custom Recharts tooltip
function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div style={{
      background: '#131d3a', border: '1px solid rgba(255,255,255,0.1)',
      borderRadius: '10px', padding: '10px 14px', fontSize: '13px', color: '#f0f4ff',
    }}>
      <div style={{ fontWeight: 600, marginBottom: '4px' }}>{label}</div>
      {payload.map((p) => (
        <div key={p.dataKey} style={{ color: p.fill || p.color }}>
          {p.name || p.dataKey}: <strong>{p.value}</strong>
        </div>
      ))}
    </div>
  )
}

// Stat card
function StatCard({ label, value, sublabel, color, icon, loading }) {
  return (
    <div style={{
      background: loading ? undefined : 'rgba(13,22,48,0.8)',
      border: `1px solid ${color}25`,
      borderRadius: '14px', padding: '18px 20px',
      position: 'relative', overflow: 'hidden',
    }}
    className={loading ? 'shimmer' : ''}
    >
      {!loading && (
        <>
          {/* Glow blob */}
          <div style={{
            position: 'absolute', top: '-20px', right: '-20px',
            width: '80px', height: '80px', borderRadius: '50%',
            background: `radial-gradient(circle, ${color}30 0%, transparent 70%)`,
            pointerEvents: 'none',
          }} />
          <div style={{ fontSize: '24px', marginBottom: '10px' }}>{icon}</div>
          <div style={{ fontSize: '32px', fontWeight: 800, color, lineHeight: 1, marginBottom: '4px' }}>
            {value}
          </div>
          <div style={{ fontSize: '13px', fontWeight: 600, color: '#f0f4ff', marginBottom: '2px' }}>
            {label}
          </div>
          {sublabel && <div style={{ fontSize: '11px', color: '#4a5568' }}>{sublabel}</div>}
        </>
      )}
    </div>
  )
}

export default function Dashboard() {
  const [stats, setStats] = useState(null)
  const [hotspots, setHotspots] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    Promise.all([fetchStreetlightStats(), fetchHotspots()])
      .then(([s, h]) => { setStats(s); setHotspots(h) })
      .catch(() => setError('Could not load dashboard data.'))
      .finally(() => setLoading(false))
  }, [])

  // Derive chart data
  const barData = stats
    ? stats.by_status.map((s) => ({
        name: STATUS_LABELS[s.status] || s.status,
        count: s.count,
        fill: STATUS_COLORS[s.status] || '#8892a4',
      }))
    : []

  const hotspotByRisk = ['red', 'yellow', 'green'].map((r) => ({
    name: RISK_LABELS[r],
    value: hotspots.filter((h) => h.risk_level === r).length,
    fill: RISK_COLORS[r],
  })).filter((d) => d.value > 0)

  const working    = stats?.by_status.find((s) => s.status === 'working')?.count ?? 0
  const broken     = stats?.by_status.find((s) => s.status === 'not_working')?.count ?? 0
  const flickering = stats?.by_status.find((s) => s.status === 'flickering')?.count ?? 0
  const redZones   = hotspots.filter((h) => h.risk_level === 'red').length

  return (
    <div style={{ maxWidth: '640px', margin: '0 auto', padding: '24px 16px', paddingBottom: '88px' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#f0f4ff', marginBottom: '4px' }}>
          Safety Dashboard
        </h1>
        <p style={{ fontSize: '13px', color: '#8892a4' }}>
          Real-time overview of streetlight statuses and crime hotspot distribution in Delhi.
        </p>
      </div>

      {error && (
        <div style={{ background: 'rgba(255,68,68,0.1)', border: '1px solid rgba(255,68,68,0.3)', borderRadius: '10px', padding: '12px 16px', color: '#ff6b6b', fontSize: '13px', marginBottom: '20px' }}>
          ⚠️ {error}
        </div>
      )}

      {/* ── Top stat cards ──────────────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '28px' }}>
        <StatCard loading={loading} label="Total Streetlights" value={stats?.total ?? '—'} icon="💡" color="#00d4aa" sublabel="across Delhi" />
        <StatCard loading={loading} label="Not Working" value={broken} icon="🔴" color="#ff4444" sublabel="need attention" />
        <StatCard loading={loading} label="Flickering" value={flickering} icon="⚡" color="#ffb300" sublabel="unstable lights" />
        <StatCard loading={loading} label="High Risk Zones" value={redZones} icon="🚨" color="#ff4444" sublabel="crime hotspots" />
      </div>

      {/* ── Streetlights bar chart ──────────────────────────────────────────── */}
      <SectionCard title="Streetlights by Status" subtitle={`${stats?.total ?? 0} total reports`} loading={loading}>
        {barData.length > 0 && (
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={barData} margin={{ top: 8, right: 8, left: -16, bottom: 0 }} barSize={36}>
              <XAxis dataKey="name" tick={{ fill: '#8892a4', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis allowDecimals={false} tick={{ fill: '#8892a4', fontSize: 11 }} axisLine={false} tickLine={false} />
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

      {/* ── Hotspot pie chart ───────────────────────────────────────────────── */}
      <SectionCard title="Crime Hotspots by Risk Level" subtitle={`${hotspots.length} zones across Delhi`} loading={loading}>
        {hotspotByRisk.length > 0 && (
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={hotspotByRisk}
                cx="50%"
                cy="45%"
                innerRadius={55}
                outerRadius={85}
                paddingAngle={3}
                dataKey="value"
                label={({ name, value }) => `${name}: ${value}`}
                labelLine={{ stroke: 'rgba(255,255,255,0.2)' }}
              >
                {hotspotByRisk.map((entry, i) => (
                  <Cell key={i} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend
                formatter={(value) => <span style={{ color: '#8892a4', fontSize: '12px' }}>{value}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        )}
      </SectionCard>

      {/* ── Hotspot zone list ───────────────────────────────────────────────── */}
      <SectionCard title="All Hotspot Zones" subtitle="Seeded data — Delhi" loading={loading}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {hotspots.map((h) => (
            <div key={h.id} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '10px 12px', borderRadius: '10px',
              background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: RISK_COLORS[h.risk_level], flexShrink: 0 }} />
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: '#d0d8f0' }}>{h.label}</div>
                  <div style={{ fontSize: '11px', color: '#4a5568' }}>Radius: {h.radius_meters}m</div>
                </div>
              </div>
              <span style={{
                padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 700,
                background: `${RISK_COLORS[h.risk_level]}15`,
                color: RISK_COLORS[h.risk_level],
                border: `1px solid ${RISK_COLORS[h.risk_level]}30`,
                textTransform: 'uppercase', letterSpacing: '0.5px',
              }}>
                {h.risk_level}
              </span>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  )
}

function SectionCard({ title, subtitle, loading, children }) {
  return (
    <div style={{
      background: 'rgba(13,22,48,0.7)', border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: '16px', padding: '20px', marginBottom: '16px',
    }}>
      <div style={{ marginBottom: '16px' }}>
        <div style={{ fontSize: '15px', fontWeight: 700, color: '#f0f4ff' }}>{title}</div>
        <div style={{ fontSize: '11px', color: '#4a5568', marginTop: '2px' }}>{subtitle}</div>
      </div>
      {loading
        ? <div className="shimmer" style={{ height: '160px', borderRadius: '8px' }} />
        : children
      }
    </div>
  )
}
