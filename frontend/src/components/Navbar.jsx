/**
 * Navbar.jsx — Responsive navigation bar.
 *
 * Layout:
 *   Mobile (<768px): fixed top bar (branding only) + fixed bottom tab bar
 *   Desktop (≥768px): fixed top bar with branding on left + nav links on right
 *
 * Responsive fixes:
 *   - Bottom nav uses flex-col so paddingBottom safely expands for home-indicator
 *   - Logo text scales down gracefully to 320px
 *   - Bottom nav items have a 44px min touch target via padding
 *   - Max-width cap on desktop so it doesn't stretch ultra-wide
 */
import { NavLink } from 'react-router-dom'

const ShieldIcon = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" fill="rgba(0,212,170,0.15)" stroke="#00d4aa" />
  </svg>
)

const MapIcon    = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"/><line x1="9" y1="3" x2="9" y2="18"/><line x1="15" y1="6" x2="15" y2="21"/></svg>
const PlusIcon   = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
const ChartIcon  = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/><line x1="2" y1="20" x2="22" y2="20"/></svg>

const navLinks = [
  { to: '/', label: 'Map',       icon: <MapIcon />,   exact: true },
  { to: '/report',    label: 'Report',    icon: <PlusIcon /> },
  { to: '/dashboard', label: 'Dashboard', icon: <ChartIcon /> },
]

export default function Navbar() {
  return (
    <>
      {/* ── Top bar ─────────────────────────────────────────────────────────── */}
      <header
        className="fixed top-0 left-0 right-0 z-[1000] flex items-center justify-between"
        style={{
          height: '60px',
          padding: '0 clamp(12px, 4vw, 24px)',
          background: 'rgba(7,13,26,0.93)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
        }}
      >
        {/* Logo — shrinks gracefully at 320px */}
        <div className="flex items-center gap-2 min-w-0">
          <ShieldIcon />
          <div className="min-w-0">
            <div
              className="font-bold leading-tight text-white truncate"
              style={{ fontSize: 'clamp(13px, 4vw, 16px)', letterSpacing: '-0.3px' }}
            >
              Suraksha Map
            </div>
            <div className="hidden xs:block text-[10px] tracking-widest" style={{ color: '#8892a4', marginTop: '-1px' }}>
              SHIELD FOR SHE
            </div>
          </div>
        </div>

        {/* Desktop nav links (hidden on mobile) */}
        <nav className="hidden md:flex items-center gap-1" role="navigation" aria-label="Main navigation">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.exact}
              className={({ isActive }) =>
                `flex items-center gap-1.5 px-3 py-2 rounded-lg text-[13px] font-medium
                 transition-all duration-200 no-underline
                 ${isActive
                   ? 'text-teal-500 bg-teal-500/10'
                   : 'text-[#8892a4] hover:text-white hover:bg-white/5'
                 }`
              }
            >
              {link.icon}
              <span>{link.label}</span>
            </NavLink>
          ))}
        </nav>
      </header>

      {/* ── Mobile bottom tab bar ─────────────────────────────────────────────
          Uses flex-col with a bottom padding div to handle home-indicator
          safe area — avoids the padding-only approach which squishes icons.
      */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-[1000] flex flex-col"
        style={{
          background: 'rgba(7,13,26,0.96)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          borderTop: '1px solid rgba(255,255,255,0.08)',
        }}
        role="navigation"
        aria-label="Mobile navigation"
      >
        {/* Tab buttons row */}
        <div className="flex items-center justify-around" style={{ height: '60px' }}>
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.exact}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center gap-0.5 flex-1 h-full
                 rounded-xl mx-1 transition-all duration-200 no-underline
                 ${isActive
                   ? 'text-teal-500 bg-teal-500/[0.08]'
                   : 'text-[#4a5568] hover:text-[#8892a4]'
                 }`
              }
              /* Minimum 44px touch target is satisfied by the full-height flex item */
            >
              {link.icon}
              <span className="text-[10px] font-semibold tracking-tight leading-none mt-0.5">
                {link.label}
              </span>
            </NavLink>
          ))}
        </div>

        {/* Safe-area spacer — expands for notched phones, zero on others */}
        <div style={{ height: 'env(safe-area-inset-bottom)' }} />
      </nav>
    </>
  )
}
