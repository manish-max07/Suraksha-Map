/**
 * App.jsx — Root application component.
 * Sets up React Router with three routes: Map, Report, Dashboard.
 * Navbar persists across all pages.
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
        Main content area:
        - Top padding = navbar height (60px)
        - Bottom padding = mobile bottom nav height (64px on small screens)
      */}
      <main style={{ paddingTop: '60px' }}>
        <Routes>
          <Route path="/" element={<MapView />} />
          <Route path="/report" element={<ReportForm />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </main>
    </BrowserRouter>
  )
}
