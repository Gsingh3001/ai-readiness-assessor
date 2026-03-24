/**
 * /api/reports.js — AI Readiness Assessment report storage via Vercel Blob
 *
 * Setup (Vercel Dashboard):
 *   1. Storage → Create Blob Store → link to project
 *   2. BLOB_READ_WRITE_TOKEN is auto-injected as environment variable
 *
 * Endpoints:
 *   POST   /api/reports  — upload HTML report → { url, pathname, savedAt }
 *   GET    /api/reports  — list all reports (?username=X filters by user)
 *   DELETE /api/reports?pathname=X — delete a specific report
 *
 * Blob naming: reports/<username>/<YYYY-MM-DD>_<orgSlug>_<ts>.html
 */

import { put, list, del } from '@vercel/blob'

function cors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,DELETE,OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization')
}

function slugify(str = '') {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40)
}

function formatDate(ts) {
  return new Date(ts).toISOString().slice(0, 10)
}

export default async function handler(req, res) {
  cors(res)
  if (req.method === 'OPTIONS') return res.status(200).end()

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return res.status(503).json({
      error: 'Blob storage not configured',
      detail: 'Link a Vercel Blob store to this project in the Vercel Dashboard (Storage → Blob).',
    })
  }

  try {

    /* ── POST: save HTML report to Blob ──────────────────────────── */
    if (req.method === 'POST') {
      const { htmlContent, username, orgName, timestamp } = req.body || {}

      if (!htmlContent || typeof htmlContent !== 'string') {
        return res.status(400).json({ error: 'htmlContent (string) is required' })
      }

      const ts = timestamp || Date.now()
      const user = slugify(username || 'unknown')
      const org  = slugify(orgName || 'report')
      const date = formatDate(ts)
      const pathname = `reports/${user}/${date}_${org}_${ts}.html`

      const blob = await put(pathname, htmlContent, {
        access: 'public',
        contentType: 'text/html; charset=utf-8',
        addRandomSuffix: false,
      })

      return res.status(201).json({
        url:      blob.url,
        pathname: blob.pathname,
        username: user,
        orgName:  orgName || '',
        savedAt:  new Date(ts).toISOString(),
      })
    }

    /* ── GET: list reports ───────────────────────────────────────── */
    if (req.method === 'GET') {
      const { username } = req.query
      const prefix = username ? `reports/${slugify(username)}/` : 'reports/'
      const { blobs } = await list({ prefix })

      const reports = blobs.map(b => {
        const parts    = b.pathname.split('/')
        const fileUser = parts[1] || 'unknown'
        const filename = parts[2] || ''
        const segments = filename.replace('.html', '').split('_')
        const savedTs  = parseInt(segments[segments.length - 1], 10) || 0
        // Extract orgName from filename: YYYY-MM-DD_orgslug_ts → segments[1..n-1]
        const orgSlug  = segments.slice(1, segments.length - 1).join(' ')
        return {
          url:        b.url,
          pathname:   b.pathname,
          username:   fileUser,
          orgName:    orgSlug,
          size:       b.size,
          uploadedAt: b.uploadedAt,
          savedAt:    savedTs ? new Date(savedTs).toISOString() : b.uploadedAt,
          filename,
        }
      })

      reports.sort((a, b) => new Date(b.savedAt) - new Date(a.savedAt))
      return res.status(200).json(reports)
    }

    /* ── DELETE: remove a report ─────────────────────────────────── */
    if (req.method === 'DELETE') {
      const { pathname } = req.query
      if (!pathname) return res.status(400).json({ error: 'pathname query param required' })
      await del(pathname)
      return res.status(200).json({ success: true, deleted: pathname })
    }

    return res.status(405).json({ error: 'Method not allowed' })

  } catch (err) {
    console.error('[/api/reports] error:', err)
    return res.status(500).json({ error: 'Internal server error', detail: err.message })
  }
}
