/**
 * Navbar.jsx — Top navigation bar with Shield For She branding.
 * Mobile: icon + label row. Desktop: logo left, links right.
 */
import { NavLink } from 'react-router-dom'

const ShieldIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" fill="rgba(0,212,170,0.15)" stroke="#00d4aa" />
  </svg>
)

const MapIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21" />
    <line x1="9" y1="3" x2="9" y2="18" /><line x1="15" y1="6" x2="15" y2="21" />
  </svg>
)

const PlusIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="16" /><line x1="8" y1="12" x2="16" y2="12" />
  </svg>
)

const ChartIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" />
    <line x1="2" y1="20" x2="22" y2="20" />
  </svg>
)

const navLinks = [
  { to: '/', label: 'Map', icon: <MapIcon />, exact: true },
  { to: '/report', label: 'Report', icon: <PlusIcon /> },
  { to: '/dashboard', label: 'Dashboard', icon: <ChartIcon /> },
]

export default function Navbar() {
  return (
    <>
      {/* ── Top bar ────────────────────────────────────────────────────────── */}
      <header
        style={{
          position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000,
          height: '60px',
          background: 'rgba(7,13,26,0.92)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 20px',
        }}
      >
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <ShieldIcon />
          <div>
            <div style={{ fontWeight: 700, fontSize: '16px', letterSpacing: '-0.3px', color: '#f0f4ff' }}>
              Suraksha Map
            </div>
            <div style={{ fontSize: '10px', color: '#8892a4', letterSpacing: '0.5px', marginTop: '-2px' }}>
              SHIELD FOR SHE
            </div>
          </div>
        </div>

        {/* Desktop nav links */}
        <nav style={{ display: 'flex', gap: '4px' }} className="hidden md:flex">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.exact}
              style={({ isActive }) => ({
                display: 'flex', alignItems: 'center', gap: '6px',
                padding: '6px 14px', borderRadius: '8px',
                fontSize: '13px', fontWeight: 500,
                textDecoration: 'none',
                transition: 'all 0.2s',
                color: isActive ? '#00d4aa' : '#8892a4',
                background: isActive ? 'rgba(0,212,170,0.1)' : 'transparent',
              })}
            >
              {link.icon}
              {link.label}
            </NavLink>
          ))}
        </nav>
      </header>

      {/* ── Mobile bottom nav ───────────────────────────────────────────────── */}
      <nav
        className="md:hidden"
        style={{
          position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 1000,
          height: '64px',
          background: 'rgba(7,13,26,0.95)',
          backdropFilter: 'blur(20px)',
          borderTop: '1px solid rgba(255,255,255,0.08)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-around',
          padding: '0 8px',
          paddingBottom: 'env(safe-area-inset-bottom)',
        }}
      >
        {navLinks.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.exact}
            style={({ isActive }) => ({
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px',
              padding: '8px 20px', borderRadius: '12px',
              textDecoration: 'none',
              transition: 'all 0.2s',
              color: isActive ? '#00d4aa' : '#4a5568',
              background: isActive ? 'rgba(0,212,170,0.08)' : 'transparent',
              flex: 1,
            })}
          >
            {link.icon}
            <span style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '0.3px' }}>
              {link.label}
            </span>
          </NavLink>
        ))}
      </nav>
    </>
  )
}
