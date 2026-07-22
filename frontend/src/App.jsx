/**
 * App.jsx — Root application component.
 *
 * Layout:
 *   - `<main>` has paddingTop=60px (top navbar height)
 *   - On mobile the bottom 64px is reserved for the bottom tab bar;
 *     individual pages (ReportForm, Dashboard) apply their own paddingBottom.
 *   - MapView handles its own full-bleed height via .map-height CSS class
 *     and does NOT inherit scroll from main.
 */
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import MapView from './components/MapView'
import ReportForm from './components/ReportForm'
import Dashboard from './components/Dashboard'

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />

      {/*
        paddingTop = top navbar height.
        No paddingBottom here — each page sets its own clearance
        so that the map is flush while form/dashboard scroll properly.
      */}
      <main style={{ paddingTop: '60px', minHeight: '100dvh', boxSizing: 'border-box' }}>
        <Routes>
          <Route path="/"          element={<MapView />} />
          <Route path="/report"    element={<ReportForm />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </main>
    </BrowserRouter>
  )
}
