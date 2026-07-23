/**
 * api/client.js — Centralised Axios API client for Suraksha Map backend.
 * All requests proxy through Vite's /api → http://localhost:8000.
 */
import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 10_000,
  headers: { 'Content-Type': 'application/json' },
})

// ── Streetlights ──────────────────────────────────────────────────────────────

/** Fetch all streetlights. Pass `status` to filter ('working'|'not_working'|'flickering') */
export const fetchStreetlights = (status) =>
  api.get('/streetlights', { params: status ? { status } : {} }).then((r) => r.data)

/** Fetch a single streetlight by ID */
export const fetchStreetlight = (id) =>
  api.get(`/streetlights/${id}`).then((r) => r.data)

/** Fetch aggregated stats: total + by_status breakdown */
export const fetchStreetlightStats = () =>
  api.get('/streetlights/stats').then((r) => r.data)

/** Create a new streetlight report */
export const createStreetlight = (payload) =>
  api.post('/streetlights/', payload).then((r) => r.data)

// ── Crime Hotspots ────────────────────────────────────────────────────────────

/** Fetch all crime hotspot zones */
export const fetchHotspots = () =>
  api.get('/hotspots').then((r) => r.data)
