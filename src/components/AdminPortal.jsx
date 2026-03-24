/**
 * AdminPortal.jsx — Admin Dashboard, User Management & Assessment History
 * AI Readiness Assessment Platform
 * Author:  Gagandeep Singh | AI Practice
 * Version: 1.0.0
 *
 * Accessible only to role="admin". Mirrors itil4-assessor AdminDashboard.
 * Tabs: Dashboard | Users | Assessments
 */

import { useState, useEffect } from 'react'
import {
  getUsers, createUser, updateUser, deleteUser, getAssessments,
} from '../auth.js'

const C = {
  bg:      '#08090C',
  surface: '#111318',
  card:    '#16181F',
  border:  'rgba(255,255,255,0.07)',
  accent:  '#6366F1',
  blue:    '#0EA5E9',
  green:   '#10B981',
  red:     '#EF4444',
  amber:   '#F59E0B',
  text:    '#F8FAFC',
  muted:   '#94A3B8',
}

function StatCard({ label, value, sub, color }) {
  return (
    <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: '20px 22px', flex: 1, minWidth: 140 }}>
      <div style={{ fontSize: 28, fontWeight: 800, color: color || C.text, lineHeight: 1, marginBottom: 4 }}>{value}</div>
      <div style={{ fontSize: 12, fontWeight: 700, color: C.text, marginBottom: 2 }}>{label}</div>
      {sub && <div style={{ fontSize: 11, color: C.muted }}>{sub}</div>}
    </div>
  )
}

function MaturityBadgeDark({ score }) {
  const color = score >= 4.2 ? C.green : score >= 3.4 ? C.blue : score >= 2.6 ? C.amber : score >= 1.8 ? '#F97316' : C.red
  const label = score >= 4.2 ? 'AI-Native' : score >= 3.4 ? 'AI Scaling' : score >= 2.6 ? 'AI Piloting' : score >= 1.8 ? 'AI Exploring' : 'AI Unaware'
  return (
    <span style={{ background: `${color}22`, color, border: `1px solid ${color}44`, borderRadius: 100, padding: '3px 10px', fontSize: 11, fontWeight: 700 }}>
      {label}
    </span>
  )
}

// ─── USER MODAL ───────────────────────────────────────────────────────────────
function UserModal({ user, onSave, onClose }) {
  const [form, setForm] = useState({
    name: user?.name || '',
    username: user?.username || '',
    password: user?.password || '',
    email: user?.email || '',
    role: user?.role || 'user',
  })
  const [err, setErr] = useState('')

  function submit(e) {
    e.preventDefault()
    if (!form.username.trim() || !form.password.trim() || !form.name.trim()) {
      setErr('Name, username, and password are required.')
      return
    }
    onSave(form)
  }

  const F = { labelStyle: { display: 'block', fontSize: 10, fontWeight: 700, color: C.muted, marginBottom: 5, textTransform: 'uppercase', letterSpacing: 1 }, inputStyle: { width: '100%', padding: '9px 12px', background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 13, color: C.text, fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' } }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 16 }}>
      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: 28, width: '100%', maxWidth: 440 }}>
        <h3 style={{ margin: '0 0 20px', color: C.text, fontSize: 17, fontWeight: 700 }}>{user ? 'Edit User' : 'Create User'}</h3>
        {err && <div style={{ background: '#EF444420', border: `1px solid #EF444440`, borderRadius: 8, padding: '8px 12px', fontSize: 12, color: C.red, marginBottom: 14 }}>{err}</div>}
        <form onSubmit={submit}>
          {[{ k: 'name', l: 'Full Name', ph: 'Jane Smith' }, { k: 'username', l: 'Username', ph: 'jsmith' }, { k: 'password', l: 'Password', ph: '••••••••' }, { k: 'email', l: 'Email', ph: 'jane@company.com' }].map(f => (
            <div key={f.k} style={{ marginBottom: 12 }}>
              <label style={F.labelStyle}>{f.l}</label>
              <input type={f.k === 'password' ? 'password' : 'text'} value={form[f.k]} onChange={e => setForm(v => ({ ...v, [f.k]: e.target.value }))} placeholder={f.ph} style={F.inputStyle} />
            </div>
          ))}
          <div style={{ marginBottom: 20 }}>
            <label style={F.labelStyle}>Role</label>
            <select value={form.role} onChange={e => setForm(v => ({ ...v, role: e.target.value }))} style={{ ...F.inputStyle, background: C.surface }}>
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <button type="button" onClick={onClose} style={{ padding: '9px 18px', background: 'none', border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 13, color: C.muted, cursor: 'pointer' }}>Cancel</button>
            <button type="submit" style={{ padding: '9px 18px', background: C.accent, border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 700, color: '#fff', cursor: 'pointer' }}>{user ? 'Save Changes' : 'Create User'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── ASSESSMENT DETAIL MODAL ─────────────────────────────────────────────────
function AssessmentModal({ assessment, onClose, onDownloadPDF }) {
  const [tab, setTab] = useState('summary')
  if (!assessment) return null

  const fnScores  = assessment.fnScores  || {}
  const dimScores = assessment.orgDimScores || {}
  const DIMS_LABELS = { DQ: 'Data Quality', TR: 'Tech Readiness', TS: 'Talent & Skills', GE: 'Governance & Ethics', CR: 'Change Readiness', VR: 'Value & ROI' }

  // Flatten fnScores for PDF: { id: { overall } } → { id: score }
  function flatFn(raw) {
    const out = {}
    Object.entries(raw).forEach(([id, val]) => {
      if (val && typeof val === 'object' && val.overall != null) out[id] = val.overall
      else if (typeof val === 'number') out[id] = val
    })
    return out
  }

  function handlePDFDownload() {
    if (!onDownloadPDF) return
    onDownloadPDF({
      orgName:        assessment.orgName || 'Organisation',
      industry:       assessment.industry,
      region:         assessment.region,
      orgSize:        assessment.size || 'medium',
      overallScore:   assessment.orgOverall || 1.0,
      dimScores:      dimScores,
      functionScores: flatFn(fnScores),
      assessedBy:     assessment.username,
      completedAt:    assessment.savedAt || Date.now(),
      assessmentId:   assessment.id || '',
    })
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 16 }}>
      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, width: '100%', maxWidth: 700, maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ padding: '20px 24px', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 11, color: C.muted, fontFamily: 'monospace', marginBottom: 2 }}>{assessment.id}</div>
            <h3 style={{ margin: 0, color: C.text, fontSize: 17, fontWeight: 700 }}>{assessment.orgName || 'Unknown Org'}</h3>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {onDownloadPDF && (
              <button
                onClick={handlePDFDownload}
                style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', background: C.accent, border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 700, color: '#fff', cursor: 'pointer' }}>
                ⬇ Download PDF
              </button>
            )}
            <button onClick={onClose} style={{ background: 'none', border: 'none', color: C.muted, fontSize: 20, cursor: 'pointer' }}>×</button>
          </div>
        </div>
        <div style={{ padding: '16px 24px', borderBottom: `1px solid ${C.border}`, display: 'flex', gap: 8 }}>
          {['summary', 'dimensions', 'functions'].map(t => (
            <button key={t} onClick={() => setTab(t)}
              style={{ padding: '6px 14px', borderRadius: 8, border: tab === t ? `1px solid ${C.accent}` : `1px solid ${C.border}`, background: tab === t ? `${C.accent}22` : 'none', color: tab === t ? C.accent : C.muted, fontSize: 12, fontWeight: tab === t ? 700 : 400, cursor: 'pointer' }}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>
        <div style={{ padding: 24 }}>
          {tab === 'summary' && (
            <div>
              <div style={{ display: 'flex', gap: 16, marginBottom: 20, flexWrap: 'wrap' }}>
                <StatCard label="Overall Score" value={(assessment.orgOverall || 1).toFixed(2)} color={C.accent} />
                <StatCard label="Maturity Level" value={<MaturityBadgeDark score={assessment.orgOverall || 1} />} />
                <StatCard label="Functions Assessed" value={Object.keys(fnScores).filter(k => fnScores[k]?.overall).length} />
              </div>
              <div style={{ fontSize: 12, color: C.muted, lineHeight: 1.8 }}>
                <div><span style={{ color: C.text }}>Organisation:</span> {assessment.orgName}</div>
                <div><span style={{ color: C.text }}>Industry:</span> {assessment.industry}</div>
                <div><span style={{ color: C.text }}>Region:</span> {assessment.region}</div>
                <div><span style={{ color: C.text }}>Size:</span> {assessment.size}</div>
                <div><span style={{ color: C.text }}>Assessed by:</span> {assessment.username}</div>
                <div><span style={{ color: C.text }}>Date:</span> {new Date(assessment.savedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
              </div>
            </div>
          )}
          {tab === 'dimensions' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {Object.entries(DIMS_LABELS).map(([k, lbl]) => {
                const s = dimScores[k] || 1
                const pct = Math.round(((s - 1) / 4) * 100)
                return (
                  <div key={k}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: 12 }}>
                      <span style={{ color: C.text }}>{lbl}</span>
                      <span style={{ color: C.accent, fontWeight: 700 }}>{s.toFixed(2)}</span>
                    </div>
                    <div style={{ height: 6, background: `${C.border}`, borderRadius: 100, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${pct}%`, background: C.accent, borderRadius: 100 }} />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
          {tab === 'functions' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 8 }}>
              {Object.entries(fnScores).map(([fn, data]) => {
                if (!data?.overall) return null
                const s = data.overall
                const color = s >= 4.2 ? C.green : s >= 3.4 ? C.blue : s >= 2.6 ? C.amber : s >= 1.8 ? '#F97316' : C.red
                return (
                  <div key={fn} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, padding: '10px 12px' }}>
                    <div style={{ fontSize: 11, color: C.muted, marginBottom: 3 }}>{fn}</div>
                    <div style={{ fontSize: 16, fontWeight: 800, color }}>{s.toFixed(2)}</div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── MAIN ADMIN PORTAL ───────────────────────────────────────────────────────
export default function AdminPortal({ session, onClose, onDownloadPDF }) {
  const [tab, setTab] = useState('dashboard')
  const [users, setUsers] = useState([])
  const [assessments, setAssessments] = useState([])
  const [modal, setModal] = useState(null)        // null | 'create' | user object
  const [viewAssessment, setViewAssessment] = useState(null)
  const [confirmDelete, setConfirmDelete] = useState(null)
  const [toast, setToast] = useState(null)

  useEffect(() => {
    refresh()
  }, [])

  function refresh() {
    setUsers(getUsers())
    setAssessments(getAssessments())
  }

  function showToast(msg, type = 'success') {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  function handleCreateUser(form) {
    const result = createUser(form)
    if (!result.ok) { showToast(result.error, 'error'); return }
    refresh()
    setModal(null)
    showToast('User created successfully.')
  }

  function handleEditUser(form) {
    updateUser(modal.id, form)
    refresh()
    setModal(null)
    showToast('User updated.')
  }

  function handleDelete(userId) {
    if (userId === session.userId) { showToast('Cannot delete your own account.', 'error'); return }
    deleteUser(userId)
    refresh()
    setConfirmDelete(null)
    showToast('User deleted.')
  }

  // ── Stats ──
  const totalUsers = users.length
  const totalAssessments = assessments.length
  const avgScore = assessments.length > 0
    ? (assessments.reduce((s, a) => s + (a.orgOverall || 1), 0) / assessments.length).toFixed(2)
    : '—'
  const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000
  const thisWeek = assessments.filter(a => a.savedAt > weekAgo).length

  const TABS = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'users',     label: `Users (${totalUsers})` },
    { id: 'history',   label: `Assessments (${totalAssessments})` },
  ]

  return (
    <div style={{ position: 'fixed', inset: 0, background: C.bg, overflowY: 'auto', zIndex: 900, fontFamily: "'Segoe UI', Inter, system-ui, sans-serif" }}>
      {/* Toast */}
      {toast && (
        <div style={{ position: 'fixed', top: 20, right: 20, zIndex: 1100, background: toast.type === 'error' ? C.red : C.green, color: '#fff', borderRadius: 10, padding: '10px 18px', fontSize: 13, fontWeight: 600, boxShadow: '0 8px 24px rgba(0,0,0,0.3)' }}>
          {toast.msg}
        </div>
      )}

      {/* Modals */}
      {modal && (
        <UserModal
          user={modal === 'create' ? null : modal}
          onSave={modal === 'create' ? handleCreateUser : handleEditUser}
          onClose={() => setModal(null)}
        />
      )}
      {viewAssessment && <AssessmentModal assessment={viewAssessment} onClose={() => setViewAssessment(null)} onDownloadPDF={onDownloadPDF} />}
      {confirmDelete && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: 28, maxWidth: 360, width: '100%' }}>
            <h4 style={{ margin: '0 0 10px', color: C.text }}>Delete User?</h4>
            <p style={{ margin: '0 0 20px', fontSize: 13, color: C.muted }}>This cannot be undone. The user will lose access immediately.</p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button onClick={() => setConfirmDelete(null)} style={{ padding: '8px 16px', background: 'none', border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 13, color: C.muted, cursor: 'pointer' }}>Cancel</button>
              <button onClick={() => handleDelete(confirmDelete)} style={{ padding: '8px 16px', background: C.red, border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 700, color: '#fff', cursor: 'pointer' }}>Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div style={{ background: C.surface, borderBottom: `1px solid ${C.border}`, padding: '0 24px', display: 'flex', alignItems: 'center', height: 56, gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 28, height: 28, borderRadius: 8, background: 'linear-gradient(135deg, #6366F1, #0EA5E9)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12 }}>⬡</div>
          <span style={{ fontSize: 13, fontWeight: 700, color: C.text }}>Admin Portal</span>
        </div>
        <div style={{ flex: 1 }} />
        <span style={{ fontSize: 11, color: C.muted }}>Signed in as <strong style={{ color: C.text }}>{session.username}</strong></span>
        <button onClick={onClose} style={{ padding: '6px 14px', background: 'none', border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 12, color: C.muted, cursor: 'pointer' }}>← Back to App</button>
      </div>

      {/* Tabs */}
      <div style={{ background: C.surface, borderBottom: `1px solid ${C.border}`, padding: '0 24px', display: 'flex', gap: 0 }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            style={{ padding: '14px 20px', background: 'none', border: 'none', borderBottom: tab === t.id ? `2px solid ${C.accent}` : '2px solid transparent', fontSize: 13, fontWeight: tab === t.id ? 700 : 400, color: tab === t.id ? C.accent : C.muted, cursor: 'pointer' }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '28px 24px' }}>

        {/* ── DASHBOARD TAB ── */}
        {tab === 'dashboard' && (
          <div>
            <h2 style={{ margin: '0 0 20px', color: C.text, fontSize: 20, fontWeight: 700 }}>Platform Overview</h2>
            <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginBottom: 28 }}>
              <StatCard label="Total Users" value={totalUsers} color={C.accent} sub="Registered accounts" />
              <StatCard label="Assessments" value={totalAssessments} color={C.blue} sub="All time" />
              <StatCard label="Avg Score" value={avgScore} color={C.green} sub="Organisation average" />
              <StatCard label="This Week" value={thisWeek} color={C.amber} sub="Assessments completed" />
            </div>

            {assessments.length > 0 && (
              <div>
                <h3 style={{ margin: '0 0 14px', color: C.text, fontSize: 15, fontWeight: 700 }}>Recent Assessments</h3>
                <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, overflow: 'hidden' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ borderBottom: `1px solid ${C.border}` }}>
                        {['Organisation', 'Date', 'Score', 'Maturity', 'Action'].map(h => (
                          <th key={h} style={{ padding: '10px 16px', fontSize: 10, fontWeight: 700, color: C.muted, textAlign: 'left', textTransform: 'uppercase', letterSpacing: 1 }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {assessments.slice(0, 5).map(a => (
                        <tr key={a.id} style={{ borderBottom: `1px solid ${C.border}` }}>
                          <td style={{ padding: '12px 16px', fontSize: 13, color: C.text, fontWeight: 600 }}>{a.orgName || '—'}</td>
                          <td style={{ padding: '12px 16px', fontSize: 12, color: C.muted }}>{new Date(a.savedAt).toLocaleDateString('en-GB')}</td>
                          <td style={{ padding: '12px 16px', fontSize: 13, color: C.accent, fontWeight: 700 }}>{(a.orgOverall || 1).toFixed(2)}</td>
                          <td style={{ padding: '12px 16px' }}><MaturityBadgeDark score={a.orgOverall || 1} /></td>
                          <td style={{ padding: '12px 16px' }}>
                            <button onClick={() => setViewAssessment(a)} style={{ fontSize: 11, padding: '4px 10px', background: `${C.accent}22`, border: `1px solid ${C.accent}44`, borderRadius: 6, color: C.accent, cursor: 'pointer' }}>View Report</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── USERS TAB ── */}
        {tab === 'users' && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <h2 style={{ margin: 0, color: C.text, fontSize: 20, fontWeight: 700 }}>User Management</h2>
              <button onClick={() => setModal('create')} style={{ padding: '9px 18px', background: C.accent, border: 'none', borderRadius: 9, fontSize: 13, fontWeight: 700, color: '#fff', cursor: 'pointer' }}>
                + Create User
              </button>
            </div>
            <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: `1px solid ${C.border}` }}>
                    {['Name', 'Username', 'Email', 'Role', 'Created', 'Actions'].map(h => (
                      <th key={h} style={{ padding: '10px 16px', fontSize: 10, fontWeight: 700, color: C.muted, textAlign: 'left', textTransform: 'uppercase', letterSpacing: 1 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u.id} style={{ borderBottom: `1px solid ${C.border}` }}>
                      <td style={{ padding: '12px 16px', fontSize: 13, color: C.text, fontWeight: 600 }}>{u.name}</td>
                      <td style={{ padding: '12px 16px', fontSize: 12, color: C.muted, fontFamily: 'monospace' }}>{u.username}</td>
                      <td style={{ padding: '12px 16px', fontSize: 12, color: C.muted }}>{u.email || '—'}</td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{ background: u.role === 'admin' ? `${C.accent}22` : `${C.green}22`, color: u.role === 'admin' ? C.accent : C.green, border: `1px solid ${u.role === 'admin' ? C.accent : C.green}44`, borderRadius: 100, padding: '2px 9px', fontSize: 11, fontWeight: 700 }}>
                          {u.role}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: 12, color: C.muted }}>{new Date(u.createdAt).toLocaleDateString('en-GB')}</td>
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button onClick={() => setModal(u)} style={{ fontSize: 11, padding: '4px 10px', background: `${C.blue}22`, border: `1px solid ${C.blue}44`, borderRadius: 6, color: C.blue, cursor: 'pointer' }}>Edit</button>
                          {u.id !== 'admin-001' && (
                            <button onClick={() => setConfirmDelete(u.id)} style={{ fontSize: 11, padding: '4px 10px', background: `${C.red}22`, border: `1px solid ${C.red}44`, borderRadius: 6, color: C.red, cursor: 'pointer' }}>Delete</button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── ASSESSMENTS TAB ── */}
        {tab === 'history' && (
          <div>
            <h2 style={{ margin: '0 0 20px', color: C.text, fontSize: 20, fontWeight: 700 }}>Assessment History</h2>
            {assessments.length === 0 ? (
              <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: '40px', textAlign: 'center', color: C.muted, fontSize: 14 }}>
                No assessments completed yet. Users will appear here after completing their assessment.
              </div>
            ) : (
              <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: `1px solid ${C.border}` }}>
                      {['Assessment ID', 'Organisation', 'Industry', 'Date', 'Score', 'Maturity', 'Action'].map(h => (
                        <th key={h} style={{ padding: '10px 16px', fontSize: 10, fontWeight: 700, color: C.muted, textAlign: 'left', textTransform: 'uppercase', letterSpacing: 1 }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {assessments.map(a => (
                      <tr key={a.id} style={{ borderBottom: `1px solid ${C.border}` }}>
                        <td style={{ padding: '12px 16px', fontSize: 11, color: C.muted, fontFamily: 'monospace' }}>{a.id}</td>
                        <td style={{ padding: '12px 16px', fontSize: 13, color: C.text, fontWeight: 600 }}>{a.orgName || '—'}</td>
                        <td style={{ padding: '12px 16px', fontSize: 12, color: C.muted }}>{a.industry || '—'}</td>
                        <td style={{ padding: '12px 16px', fontSize: 12, color: C.muted }}>{new Date(a.savedAt).toLocaleDateString('en-GB')}</td>
                        <td style={{ padding: '12px 16px', fontSize: 14, color: C.accent, fontWeight: 800 }}>{(a.orgOverall || 1).toFixed(2)}</td>
                        <td style={{ padding: '12px 16px' }}><MaturityBadgeDark score={a.orgOverall || 1} /></td>
                        <td style={{ padding: '12px 16px' }}>
                          <button onClick={() => setViewAssessment(a)} style={{ fontSize: 11, padding: '4px 10px', background: `${C.accent}22`, border: `1px solid ${C.accent}44`, borderRadius: 6, color: C.accent, cursor: 'pointer' }}>View Full Report</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
