/**
 * auth.js — Authentication & Session Management
 * AI Readiness Assessment Platform
 * Author:  Gagandeep Singh | AI Practice
 * Version: 1.0.0
 *
 * Mirrors the itil4-assessor auth architecture exactly:
 *   - Hardcoded Admin/User seed accounts
 *   - localStorage user store (arap_users_v1)
 *   - localStorage session (arap_session_v1)
 *   - 8-hour session expiry
 *   - Role tiers: admin | user
 */

// ─── Storage Keys ────────────────────────────────────────────────────────────
export const USERS_KEY       = 'arap_users_v1'
export const SESSION_KEY     = 'arap_session_v1'
export const ASSESSMENTS_KEY = 'arap_assessments_v1'

// Session duration: 8 hours in ms
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

// ─── Seed Default Users ───────────────────────────────────────────────────────
export function initUsers() {
  const existing = ls.get(USERS_KEY, null)
  if (!existing) {
    ls.set(USERS_KEY, [
      {
        id:       'admin-001',
        username: 'Admin',
        password: 'Admin',
        role:     'admin',
        name:     'Administrator',
        email:    'admin@aipractice.ai',
        createdAt: Date.now(),
      },
      {
        id:       'user-001',
        username: 'User',
        password: 'User',
        role:     'user',
        name:     'Standard User',
        email:    'user@aipractice.ai',
        createdAt: Date.now(),
      },
    ])
  }
}

// ─── Auth Functions ───────────────────────────────────────────────────────────
export function authenticate(username, password) {
  const users = ls.get(USERS_KEY, [])
  const user = users.find(u => u.username === username && u.password === password)
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
  if (Date.now() > session.expiresAt) {
    ls.del(SESSION_KEY)
    return null
  }
  return session
}

export function clearSession() {
  ls.del(SESSION_KEY)
}

export function isSessionExpired() {
  const session = ls.get(SESSION_KEY, null)
  if (!session) return true
  return Date.now() > session.expiresAt
}

// ─── User Management (Admin only) ────────────────────────────────────────────
export function getUsers() {
  return ls.get(USERS_KEY, [])
}

export function createUser(userData) {
  const users = getUsers()
  if (users.find(u => u.username === userData.username)) {
    return { ok: false, error: 'Username already exists' }
  }
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

export function updateUser(userId, updates) {
  const users = getUsers()
  const idx = users.findIndex(u => u.id === userId)
  if (idx === -1) return { ok: false, error: 'User not found' }
  users[idx] = { ...users[idx], ...updates, id: userId }
  ls.set(USERS_KEY, users)
  return { ok: true, user: users[idx] }
}

export function deleteUser(userId) {
  const users = getUsers()
  const filtered = users.filter(u => u.id !== userId)
  ls.set(USERS_KEY, filtered)
  return { ok: true }
}

// ─── Assessment Store ─────────────────────────────────────────────────────────
export function saveAssessment(assessmentData) {
  const assessments = ls.get(ASSESSMENTS_KEY, [])
  const id = `ARAP-${new Date().getFullYear()}-${Math.random().toString(16).slice(2, 8).toUpperCase()}`
  const record = {
    id,
    ...assessmentData,
    savedAt: Date.now(),
  }
  ls.set(ASSESSMENTS_KEY, [record, ...assessments])
  return record
}

export function getAssessments() {
  return ls.get(ASSESSMENTS_KEY, [])
}

export function getAssessmentById(id) {
  return getAssessments().find(a => a.id === id) || null
}

// ─── Utility ─────────────────────────────────────────────────────────────────
export function generateAssessmentId() {
  return `ARAP-${new Date().getFullYear()}-${Math.random().toString(16).slice(2, 8).toUpperCase()}`
}

export function timeUntilExpiry(session) {
  if (!session) return 0
  return Math.max(0, session.expiresAt - Date.now())
}
