/**
 * auth.js — Authentication & Session Management
 * AI Readiness Assessment Platform
 * Author:  Gagandeep Singh | AI Practice
 * Version: 2.0.0
 *
 * Architecture:
 *   - localStorage is the instant cache (always read from for speed)
 *   - Vercel Blob (via /api/users) is the source of truth
 *   - On app start: pull from cloud → overwrite local cache
 *   - On create/update/delete: update cloud first, then sync local cache
 *   - Falls back to localStorage silently if API is unavailable (local dev)
 */

// ─── Storage Keys ────────────────────────────────────────────────────────────
export const USERS_KEY       = 'arap_users_v1'
export const SESSION_KEY     = 'arap_session_v1'
export const ASSESSMENTS_KEY = 'arap_assessments_v1'

const SESSION_DURATION_MS = 8 * 60 * 60 * 1000

// ─── Storage Helpers ─────────────────────────────────────────────────────────
export const ls = {
  get: (k, def = null) => {
    try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : def } catch { return def }
  },
  set: (k, v) => {
    try { localStorage.setItem(k, JSON.stringify(v)) } catch {}
  },
  del: (k) => {
    try { localStorage.removeItem(k) } catch {}
  },
}

// ─── Seed Default Users (localStorage only — used as fallback) ────────────────
export function initUsers() {
  const existing = ls.get(USERS_KEY, null)
  if (!existing) {
    ls.set(USERS_KEY, [
      {
        id:        'admin-001',
        username:  'Admin',
        password:  'Admin',
        role:      'admin',
        name:      'Administrator',
        email:     'admin@aipractice.ai',
        createdAt: Date.now(),
      },
    ])
  }
}

// ─── Cloud Sync ───────────────────────────────────────────────────────────────

/**
 * Pull users from /api/users and overwrite local cache.
 * Called once on app startup. Silent on failure (falls back to localStorage).
 * Returns { ok, users, fromCloud }
 */
export async function syncUsersFromCloud() {
  try {
    const res = await fetch('/api/users')
    if (!res.ok) return { ok: false, fromCloud: false }
    const users = await res.json()
    if (Array.isArray(users) && users.length > 0) {
      ls.set(USERS_KEY, users)
      return { ok: true, users, fromCloud: true }
    }
    return { ok: false, fromCloud: false }
  } catch {
    return { ok: false, fromCloud: false }   // offline / local dev without vercel dev
  }
}

// ─── Auth Functions ───────────────────────────────────────────────────────────
export function authenticate(username, password) {
  const users = ls.get(USERS_KEY, [])
  const user  = users.find(u => u.username === username && u.password === password)
  if (!user) return null

  const session = {
    userId:    user.id,
    username:  user.username,
    name:      user.name,
    role:      user.role,
    email:     user.email,
    loginAt:   Date.now(),
    expiresAt: Date.now() + SESSION_DURATION_MS,
  }
  ls.set(SESSION_KEY, session)
  return session
}

export function getSession() {
  const session = ls.get(SESSION_KEY, null)
  if (!session) return null
  if (Date.now() > session.expiresAt) { ls.del(SESSION_KEY); return null }
  return session
}

export function clearSession() { ls.del(SESSION_KEY) }

export function isSessionExpired() {
  const s = ls.get(SESSION_KEY, null)
  return !s || Date.now() > s.expiresAt
}

// ─── User Management — cloud-first, localStorage cache ───────────────────────
export function getUsers() {
  return ls.get(USERS_KEY, [])
}

/**
 * Create user — POSTs to /api/users then refreshes local cache.
 * Falls back to localStorage-only if API unavailable.
 */
export async function createUser(userData) {
  const users = getUsers()
  if (users.find(u => u.username.toLowerCase() === userData.username.toLowerCase()))
    return { ok: false, error: 'Username already exists' }

  // ── Try cloud first ──
  try {
    const res = await fetch('/api/users', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(userData),
    })
    if (res.ok) {
      const newUser = await res.json()
      ls.set(USERS_KEY, [...users, newUser])
      return { ok: true, user: newUser }
    }
    const err = await res.json().catch(() => ({}))
    if (res.status === 409) return { ok: false, error: err.error || 'Username already exists' }
    // Non-409 error: fall through to local
  } catch { /* API unavailable — use localStorage */ }

  // ── Fallback: localStorage only ──
  const newUser = {
    id:        `user-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    username:  userData.username,
    password:  userData.password,
    role:      userData.role || 'user',
    name:      userData.name || userData.username,
    email:     userData.email || '',
    createdAt: Date.now(),
  }
  ls.set(USERS_KEY, [...users, newUser])
  return { ok: true, user: newUser }
}

/**
 * Update user — PUTs to /api/users?id=X then updates local cache.
 */
export async function updateUser(userId, updates) {
  const users = getUsers()
  const idx   = users.findIndex(u => u.id === userId)
  if (idx === -1) return { ok: false, error: 'User not found' }

  // ── Try cloud first ──
  try {
    const res = await fetch(`/api/users?id=${encodeURIComponent(userId)}`, {
      method:  'PUT',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(updates),
    })
    if (res.ok) {
      const updated = await res.json()
      users[idx] = updated
      ls.set(USERS_KEY, users)
      return { ok: true, user: updated }
    }
  } catch { /* fall through */ }

  // ── Fallback: localStorage only ──
  users[idx] = { ...users[idx], ...updates, id: userId }
  ls.set(USERS_KEY, users)
  return { ok: true, user: users[idx] }
}

/**
 * Delete user — DELETEs from /api/users?id=X then updates local cache.
 */
export async function deleteUser(userId) {
  if (userId === 'admin-001') return { ok: false, error: 'Cannot delete primary admin' }

  // ── Try cloud first ──
  try {
    const res = await fetch(`/api/users?id=${encodeURIComponent(userId)}`, { method: 'DELETE' })
    if (res.ok || res.status === 404) {
      ls.set(USERS_KEY, getUsers().filter(u => u.id !== userId))
      return { ok: true }
    }
  } catch { /* fall through */ }

  // ── Fallback: localStorage only ──
  ls.set(USERS_KEY, getUsers().filter(u => u.id !== userId))
  return { ok: true }
}

// ─── Assessment Store ─────────────────────────────────────────────────────────
export function saveAssessment(assessmentData) {
  const assessments = ls.get(ASSESSMENTS_KEY, [])
  const id = `ARAP-${new Date().getFullYear()}-${Math.random().toString(16).slice(2, 8).toUpperCase()}`
  const record = { id, ...assessmentData, savedAt: Date.now() }
  ls.set(ASSESSMENTS_KEY, [record, ...assessments])
  return record
}

export function getAssessments()        { return ls.get(ASSESSMENTS_KEY, []) }
export function getAssessmentById(id)   { return getAssessments().find(a => a.id === id) || null }

// ─── Utility ─────────────────────────────────────────────────────────────────
export function generateAssessmentId() {
  return `ARAP-${new Date().getFullYear()}-${Math.random().toString(16).slice(2, 8).toUpperCase()}`
}

export function timeUntilExpiry(session) {
  return session ? Math.max(0, session.expiresAt - Date.now()) : 0
}
