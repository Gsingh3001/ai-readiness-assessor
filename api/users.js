/**
 * /api/users.js — AI Readiness Assessment user/credentials store via Vercel Blob
 *
 * All user accounts (username, password, role) are stored in Blob at:
 *   arap/credentials/users.json
 *
 * This separates AI-Assessor credentials from itil4-assessor data.
 * The blob is public (Vercel Blob limitation) but the URL is never
 * returned to the client — all access is server-side via this API.
 *
 * Endpoints:
 *   GET    /api/users           → list all users
 *   POST   /api/users           → create user   { name, username, password, email, role }
 *   PUT    /api/users?id=X      → update user   { name, password, email, role }
 *   DELETE /api/users?id=X      → delete user
 */

import { put, list } from '@vercel/blob'

const USERS_PATH = 'arap/credentials/users.json'

const SEED_USERS = [
  {
    id:        'admin-001',
    username:  'Admin',
    password:  'Admin',
    role:      'admin',
    name:      'Administrator',
    email:     'admin@aipractice.ai',
    createdAt: Date.now(),
  },
]

function cors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization')
}

function noBlob(res) {
  return res.status(503).json({
    error: 'Blob storage not configured',
    detail: 'Link a Vercel Blob store to this project in the Vercel Dashboard (Storage → Blob).',
  })
}

// ── Read users.json from Blob ─────────────────────────────────────────────────
async function readUsers() {
  try {
    const { blobs } = await list({ prefix: USERS_PATH })
    if (!blobs.length) return null           // not initialised yet
    const res = await fetch(blobs[0].url)
    if (!res.ok) return null
    return await res.json()
  } catch {
    return null
  }
}

// ── Write users array back to Blob ────────────────────────────────────────────
async function writeUsers(users) {
  await put(USERS_PATH, JSON.stringify(users), {
    access:         'public',
    contentType:    'application/json',
    addRandomSuffix: false,
  })
}

// ── Main handler ──────────────────────────────────────────────────────────────
export default async function handler(req, res) {
  cors(res)
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (!process.env.BLOB_READ_WRITE_TOKEN) return noBlob(res)

  try {

    /* ── GET: list all users ─────────────────────────────────────── */
    if (req.method === 'GET') {
      let users = await readUsers()
      if (!users) {
        // First-time initialisation — seed defaults and persist
        users = SEED_USERS
        await writeUsers(users)
      }
      return res.status(200).json(users)
    }

    /* ── POST: create user ───────────────────────────────────────── */
    if (req.method === 'POST') {
      const { name, username, password, email, role } = req.body || {}
      if (!username || !password || !name)
        return res.status(400).json({ error: 'name, username and password are required' })

      let users = await readUsers() || SEED_USERS
      if (users.find(u => u.username.toLowerCase() === username.toLowerCase()))
        return res.status(409).json({ error: 'Username already exists' })

      const newUser = {
        id:        `user-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        username,
        password,
        role:      role || 'user',
        name:      name || username,
        email:     email || '',
        createdAt: Date.now(),
      }
      users = [...users, newUser]
      await writeUsers(users)
      return res.status(201).json(newUser)
    }

    /* ── PUT: update user ────────────────────────────────────────── */
    if (req.method === 'PUT') {
      const { id } = req.query
      if (!id) return res.status(400).json({ error: 'id query param required' })

      let users = await readUsers() || SEED_USERS
      const idx = users.findIndex(u => u.id === id)
      if (idx === -1) return res.status(404).json({ error: 'User not found' })

      const { name, username, password, email, role } = req.body || {}
      users[idx] = { ...users[idx], ...(name && { name }), ...(username && { username }), ...(password && { password }), ...(email !== undefined && { email }), ...(role && { role }) }
      await writeUsers(users)
      return res.status(200).json(users[idx])
    }

    /* ── DELETE: remove user ─────────────────────────────────────── */
    if (req.method === 'DELETE') {
      const { id } = req.query
      if (!id) return res.status(400).json({ error: 'id query param required' })
      if (id === 'admin-001') return res.status(403).json({ error: 'Cannot delete the primary admin account' })

      let users = await readUsers() || SEED_USERS
      const filtered = users.filter(u => u.id !== id)
      if (filtered.length === users.length) return res.status(404).json({ error: 'User not found' })

      await writeUsers(filtered)
      return res.status(200).json({ success: true, deleted: id })
    }

    return res.status(405).json({ error: 'Method not allowed' })

  } catch (err) {
    console.error('[/api/users] error:', err)
    return res.status(500).json({ error: 'Internal server error', detail: err.message })
  }
}
