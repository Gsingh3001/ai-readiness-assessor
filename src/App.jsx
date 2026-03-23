// ============================================================
// AI Readiness Assessment Platform — App.jsx
// Fork of: itil4-assessor (github.com/Gsingh3001/itil4-assessor)
// Author:  Gagandeep Singh | AI Practice
// Version: 1.0.0
//
// What changed from ITSM assessor:
//  - PRACTICES array: 34 ITIL 4 practices → 25 org functions
//  - DIM_KEYS: PE/PC/MM/CI/TI → DQ/TR/TS/GE/CR/VR
//  - DIMS weights: updated for AI readiness model
//  - Level labels: Beginner/Practitioner/Expert → Exploring/Piloting/Scaling
//  - Maturity labels: updated for AI maturity scale
//  - Question bank: question-bank.xlsx → ai-question-bank.xlsx
//  - Report sections: ITIL-specific → AI-specific (use cases, ROI, regulatory)
//  - Branding: ITSM Practice → AI Practice
// ============================================================

import { useState, useEffect, useMemo, useCallback } from 'react'
import * as XLSX from 'xlsx'

// ─── CONFIGURATION ─────────────────────────────────────────────────────────

const APP_VERSION = '1.0.0'
const QB_PATH = '/ai-question-bank.xlsx'

// 25 Organisational Functions (replaces 34 ITIL 4 practices)
const PRACTICES = [
  // Business Domain
  { id: 'finance',          name: 'Finance & Accounting',            domain: 'Business',    icon: '₤' },
  { id: 'hr',               name: 'Human Resources',                 domain: 'Business',    icon: '◎' },
  { id: 'sales',            name: 'Sales & Revenue',                 domain: 'Business',    icon: '↗' },
  { id: 'marketing',        name: 'Marketing & CX',                  domain: 'Business',    icon: '✦' },
  { id: 'legal',            name: 'Legal & Compliance',              domain: 'Business',    icon: '⚖' },
  { id: 'procurement',      name: 'Procurement & Sourcing',          domain: 'Business',    icon: '◈' },
  { id: 'strategy',         name: 'Strategy & Planning',             domain: 'Business',    icon: '♟' },
  { id: 'risk',             name: 'Risk Management',                 domain: 'Business',    icon: '⬡' },
  { id: 'customerservice',  name: 'Customer Service',                domain: 'Business',    icon: '◉' },
  { id: 'corpgovernance',   name: 'Corporate Governance',            domain: 'Business',    icon: '▲' },
  // Technology Domain
  { id: 'it',               name: 'IT & Infrastructure',             domain: 'Technology',  icon: '⬡' },
  { id: 'softwaredev',      name: 'Software Development',            domain: 'Technology',  icon: '{}' },
  { id: 'data',             name: 'Data & Analytics',                domain: 'Technology',  icon: '◈' },
  { id: 'cybersecurity',    name: 'Cybersecurity',                   domain: 'Technology',  icon: '⬡' },
  { id: 'itsm',             name: 'IT Service Management',           domain: 'Technology',  icon: '⚙' },
  { id: 'cloud',            name: 'Cloud & Platform',                domain: 'Technology',  icon: '☁' },
  { id: 'network',          name: 'Network & Communications',        domain: 'Technology',  icon: '⬡' },
  { id: 'digitalworkplace', name: 'Digital Workplace',               domain: 'Technology',  icon: '◆' },
  // Operations Domain
  { id: 'supplychain',      name: 'Supply Chain & Logistics',        domain: 'Operations',  icon: '⬡' },
  { id: 'manufacturing',    name: 'Manufacturing & Production',      domain: 'Operations',  icon: '⚙' },
  { id: 'qualityassurance', name: 'Quality Assurance',               domain: 'Operations',  icon: '✓' },
  { id: 'facilities',       name: 'Facilities & Property',           domain: 'Operations',  icon: '⬡' },
  { id: 'healthsafety',     name: 'Health & Safety',                 domain: 'Operations',  icon: '⬡' },
  { id: 'environmental',    name: 'Environmental & Sustainability',  domain: 'Operations',  icon: '◎' },
  { id: 'fieldservice',     name: 'Field Service',                   domain: 'Operations',  icon: '⬡' },
]

// 6 AI Readiness Dimensions (replaces PE/PC/MM/CI/TI)
const DIM_KEYS = ['DQ', 'TR', 'TS', 'GE', 'CR', 'VR']

const DIMS = {
  DQ: { label: 'Data Quality',          weight: 0.25, color: '#6366F1', desc: 'Data availability, accuracy, lineage & governance' },
  TR: { label: 'Tech Readiness',         weight: 0.20, color: '#0EA5E9', desc: 'Infrastructure, APIs, AI tooling & integration' },
  TS: { label: 'Talent & Skills',        weight: 0.20, color: '#F59E0B', desc: 'AI literacy, data skills & upskilling maturity' },
  GE: { label: 'Governance & Ethics',    weight: 0.15, color: '#EF4444', desc: 'AI policy, ethics, bias monitoring & regulatory' },
  CR: { label: 'Change Readiness',       weight: 0.10, color: '#F97316', desc: 'Culture, leadership sponsorship & change mgmt' },
  VR: { label: 'Value & ROI',            weight: 0.10, color: '#10B981', desc: 'Use case clarity, business cases & benefit tracking' },
}

// Competency levels (replaces Beginner/Practitioner/Expert)
const LEVELS = ['Exploring', 'Piloting', 'Scaling']

// Maturity thresholds (same formula as ITSM, new labels)
const MATURITY = [
  { min: 1.0, max: 1.8, label: 'AI Unaware',   color: '#DC2626', bg: '#FEF2F2', desc: 'No meaningful AI capability or awareness. Foundational investment required before any AI adoption.' },
  { min: 1.8, max: 2.6, label: 'AI Exploring',  color: '#EA580C', bg: '#FFF7ED', desc: 'Early awareness and isolated experiments. No coordinated strategy. High execution risk.' },
  { min: 2.6, max: 3.4, label: 'AI Piloting',   color: '#D97706', bg: '#FFFBEB', desc: 'Targeted pilots underway. Foundations being built. Ready to scale in high-readiness functions.' },
  { min: 3.4, max: 4.2, label: 'AI Scaling',    color: '#2563EB', bg: '#EFF6FF', desc: 'Multiple AI deployments delivering value. Focus on governance, scaling and competitive differentiation.' },
  { min: 4.2, max: 5.1, label: 'AI-Native',     color: '#059669', bg: '#F0FDF4', desc: 'AI embedded across functions. Proprietary data advantages. Responsible AI governance mature.' },
]

const getMaturity = (score) => MATURITY.find(m => score >= m.min && score < m.max) || MATURITY[0]

// Scoring formula — identical to ITSM assessor
// dimScore = 1 + (earnedPoints / maxPoints) * 4  → [1.0 – 5.0]
const calcDimScore = (earned, max) => max === 0 ? 1.0 : 1 + (earned / max) * 4

const calcOverall = (dimScores) =>
  DIM_KEYS.reduce((sum, k) => sum + (dimScores[k] || 1.0) * DIMS[k].weight, 0)

// Industry profiles
const INDUSTRIES = [
  'Financial Services & Banking', 'Healthcare & Life Sciences', 'Retail & E-Commerce',
  'Manufacturing & Engineering', 'Government & Public Sector', 'Telecommunications & Media',
  'Energy & Utilities', 'Professional & Legal Services', 'Technology & Software',
  'Education & Research', 'Logistics & Supply Chain', 'Real Estate & Construction',
  'Insurance', 'Food & Consumer Goods', 'Other',
]

const REGIONS = [
  { id: 'uk',     label: '🇬🇧 United Kingdom' },
  { id: 'eu',     label: '🇪🇺 European Union' },
  { id: 'us',     label: '🇺🇸 United States' },
  { id: 'apac',   label: '🌏 Asia Pacific' },
  { id: 'global', label: '🌍 Global / Multi-Region' },
]

const ORG_SIZES = [
  { id: 'startup',   label: 'Startup (< 50)' },
  { id: 'sme',       label: 'SME (50 – 250)' },
  { id: 'midmarket', label: 'Mid-Market (250 – 2,000)' },
  { id: 'enterprise',label: 'Enterprise (2,000 – 10,000)' },
  { id: 'global',    label: 'Global (10,000+)' },
]

// ─── QUESTION BANK LOADER ──────────────────────────────────────────────────

async function loadQuestionBank() {
  try {
    const resp = await fetch(QB_PATH)
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`)
    const ab = await resp.arrayBuffer()
    const wb = XLSX.read(ab, { type: 'array' })
    const ws = wb.Sheets[wb.SheetNames[0]]
    const rows = XLSX.utils.sheet_to_json(ws, { defval: '' })

    return rows.map(r => ({
      functionId:       String(r.function_id || ''),
      functionName:     String(r.function_name || ''),
      domain:           String(r.domain || ''),
      level:            String(r.competency_level || ''),
      questionId:       String(r.question_id || ''),
      text:             String(r.question_text || ''),
      answerType:       String(r.answer_type || 'YPN'),
      branchTrigger:    String(r.branch_trigger || ''),
      followUp:         String(r.follow_up_text || ''),
      dims: {
        DQ: Number(r.dim_DQ || 0),
        TR: Number(r.dim_TR || 0),
        TS: Number(r.dim_TS || 0),
        GE: Number(r.dim_GE || 0),
        CR: Number(r.dim_CR || 0),
        VR: Number(r.dim_VR || 0),
      },
      pointsYes:     Number(r.points_yes || 2),
      pointsPartial: Number(r.points_partial || 1),
      pointsNo:      Number(r.points_no || 0),
      industryOverlay: String(r.industry_overlay || 'ALL'),
      aiUseCaseHint:   String(r.ai_use_case_hint || ''),
      regulatoryRef:   String(r.regulatory_ref || ''),
    }))
  } catch (e) {
    console.error('Failed to load question bank:', e)
    return []
  }
}

// ─── SCORE CALCULATOR ──────────────────────────────────────────────────────

function computeScores(questions, answers) {
  // Per-function per-dimension scoring
  const fnScores = {}

  PRACTICES.forEach(p => {
    const fnQs = questions.filter(q => q.functionId === p.id)
    const dimEarned = {}
    const dimMax    = {}
    DIM_KEYS.forEach(k => { dimEarned[k] = 0; dimMax[k] = 0 })

    fnQs.forEach(q => {
      const ans = answers[q.questionId]
      const pts = ans === 'Yes' ? q.pointsYes : ans === 'Partial' ? q.pointsPartial : 0
      DIM_KEYS.forEach(k => {
        if (q.dims[k]) {
          dimEarned[k] += pts
          dimMax[k]    += q.pointsYes
        }
      })
    })

    const dimScores = {}
    DIM_KEYS.forEach(k => {
      dimScores[k] = dimMax[k] > 0 ? calcDimScore(dimEarned[k], dimMax[k]) : null
    })
    const answeredDims = DIM_KEYS.filter(k => dimScores[k] !== null)
    const overallFn = answeredDims.length > 0
      ? answeredDims.reduce((s, k) => s + dimScores[k] * DIMS[k].weight, 0) /
        answeredDims.reduce((s, k) => s + DIMS[k].weight, 0)
      : null

    fnScores[p.id] = { dimScores, overall: overallFn, answeredCount: fnQs.filter(q => answers[q.questionId]).length, totalCount: fnQs.length }
  })

  // Organisation-wide dimension scores
  const orgDimEarned = {}
  const orgDimMax    = {}
  DIM_KEYS.forEach(k => { orgDimEarned[k] = 0; orgDimMax[k] = 0 })

  questions.forEach(q => {
    const ans = answers[q.questionId]
    if (!ans) return
    const pts = ans === 'Yes' ? q.pointsYes : ans === 'Partial' ? q.pointsPartial : 0
    DIM_KEYS.forEach(k => {
      if (q.dims[k]) {
        orgDimEarned[k] += pts
        orgDimMax[k]    += q.pointsYes
      }
    })
  })

  const orgDimScores = {}
  DIM_KEYS.forEach(k => {
    orgDimScores[k] = orgDimMax[k] > 0 ? calcDimScore(orgDimEarned[k], orgDimMax[k]) : null
  })

  const validDims = DIM_KEYS.filter(k => orgDimScores[k] !== null)
  const orgOverall = validDims.length > 0
    ? validDims.reduce((s, k) => s + orgDimScores[k] * DIMS[k].weight, 0) /
      validDims.reduce((s, k) => s + DIMS[k].weight, 0)
    : 1.0

  return { fnScores, orgDimScores, orgOverall }
}

// ─── PERSISTENCE (localStorage) ────────────────────────────────────────────

const STORAGE_KEY = 'arap_session_v1'

function saveSession(data) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)) } catch {}
}

function loadSession() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null') } catch { return null }
}

// ─── COMPONENTS ────────────────────────────────────────────────────────────

const COLORS = {
  navy: '#0F172A',
  blue: '#3B82F6',
  indigo: '#6366F1',
  surface: '#F8FAFC',
  border: '#E2E8F0',
  text: '#0F172A',
  muted: '#64748B',
}

function ScoreBar({ score, color, height = 8 }) {
  const pct = score ? Math.round(((score - 1) / 4) * 100) : 0
  return (
    <div style={{ height, background: '#E2E8F0', borderRadius: 100, overflow: 'hidden' }}>
      <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 100, transition: 'width 0.6s ease' }} />
    </div>
  )
}

function MaturityBadge({ score, size = 'sm' }) {
  const m = getMaturity(score || 1)
  const pad = size === 'lg' ? '6px 16px' : '3px 10px'
  const fs  = size === 'lg' ? 13 : 11
  return (
    <span style={{ background: m.bg, color: m.color, border: `1px solid ${m.color}40`, borderRadius: 100, padding: pad, fontSize: fs, fontWeight: 700 }}>
      {m.label}
    </span>
  )
}

// Radar chart SVG
function RadarChart({ dimScores, size = 260 }) {
  const valid = DIM_KEYS.filter(k => dimScores[k] !== null)
  if (valid.length < 3) return null
  const cx = size / 2, cy = size / 2, r = size * 0.35
  const n = valid.length
  const angle = i => (i / n) * 2 * Math.PI - Math.PI / 2
  const pt = (i, frac) => ({
    x: cx + Math.cos(angle(i)) * r * frac,
    y: cy + Math.sin(angle(i)) * r * frac,
  })
  const gridLevels = [0.25, 0.5, 0.75, 1.0]
  const scorePts = valid.map((k, i) => {
    const s = Math.max(0, Math.min(1, ((dimScores[k] || 1) - 1) / 4))
    return pt(i, s)
  })
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {gridLevels.map(frac => (
        <polygon key={frac}
          points={valid.map((_, i) => { const p = pt(i, frac); return `${p.x},${p.y}` }).join(' ')}
          fill="none" stroke="#E2E8F0" strokeWidth="0.8" />
      ))}
      {valid.map((_, i) => { const p = pt(i, 1); return <line key={i} x1={cx} y1={cy} x2={p.x} y2={p.y} stroke="#E2E8F0" strokeWidth="0.8" /> })}
      <polygon points={scorePts.map(p => `${p.x},${p.y}`).join(' ')} fill="rgba(99,102,241,0.15)" stroke="#6366F1" strokeWidth="2" />
      {valid.map((k, i) => {
        const p = scorePts[i]
        return <circle key={k} cx={p.x} cy={p.y} r={4} fill={DIMS[k].color} />
      })}
      {valid.map((k, i) => {
        const lp = pt(i, 1.28)
        return (
          <text key={k} x={lp.x} y={lp.y} textAnchor="middle" dominantBaseline="central"
            fontSize="9" fontFamily="system-ui" fill={DIMS[k].color} fontWeight="700">
            {k}
          </text>
        )
      })}
    </svg>
  )
}

// ─── MAIN APP ──────────────────────────────────────────────────────────────

export default function App() {
  const [page, setPage]             = useState('welcome')   // welcome|setup|assess|report
  const [questions, setQuestions]   = useState([])
  const [qbLoading, setQbLoading]   = useState(false)
  const [qbError, setQbError]       = useState(null)
  const [config, setConfig]         = useState({ org: '', role: '', industry: '', region: '', size: '', level: 'Exploring' })
  const [answers, setAnswers]       = useState({})          // { questionId: 'Yes'|'Partial'|'No' }
  const [activePractice, setActivePractice] = useState(PRACTICES[0].id)
  const [expandedQ, setExpandedQ]   = useState(null)
  const [reportTab, setReportTab]   = useState('summary')

  // Load QB on mount
  useEffect(() => {
    setQbLoading(true)
    loadQuestionBank().then(qs => {
      setQuestions(qs)
      setQbLoading(false)
      if (qs.length === 0) setQbError('Could not load ai-question-bank.xlsx. Place the file in /public and restart.')
    })
    // Restore session
    const session = loadSession()
    if (session?.answers && session?.config) {
      setAnswers(session.answers)
      setConfig(session.config)
    }
  }, [])

  // Auto-save session
  useEffect(() => {
    if (Object.keys(answers).length > 0) saveSession({ answers, config, savedAt: Date.now() })
  }, [answers, config])

  const scores = useMemo(() => computeScores(questions, answers), [questions, answers])
  const { fnScores, orgDimScores, orgOverall } = scores

  const totalAnswered = Object.keys(answers).length
  const totalQuestions = questions.length
  const pctComplete = totalQuestions > 0 ? Math.round((totalAnswered / totalQuestions) * 100) : 0

  const practiceQs = useMemo(() =>
    questions.filter(q => q.functionId === activePractice && (config.level === 'All' || LEVELS.indexOf(q.level) <= LEVELS.indexOf(config.level))),
    [questions, activePractice, config.level]
  )

  const handleAnswer = useCallback((qId, value) => {
    setAnswers(prev => ({ ...prev, [qId]: value }))
  }, [])

  const canProceed = config.org && config.industry && config.region && config.size

  // ── WELCOME PAGE ─────────────────────────────────────────────────────────
  if (page === 'welcome') return (
    <div style={{ minHeight: '100vh', background: COLORS.navy, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 24px', fontFamily: "'Segoe UI', system-ui, sans-serif" }}>
      <div style={{ maxWidth: 720, width: '100%', textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, border: '1px solid rgba(99,102,241,0.4)', borderRadius: 100, padding: '5px 18px', marginBottom: 40, fontSize: 11, color: 'rgba(99,102,241,0.9)', letterSpacing: 3, textTransform: 'uppercase' }}>
          <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#6366F1', display: 'inline-block' }} />
          AI Readiness Assessment Platform · v{APP_VERSION}
        </div>
        <h1 style={{ fontSize: 'clamp(36px,6vw,64px)', fontWeight: 800, color: '#F8FAFC', lineHeight: 1.1, margin: '0 0 20px', letterSpacing: '-1.5px' }}>
          Where is AI ready<br />
          <span style={{ color: 'rgba(255,255,255,0.25)', fontStyle: 'italic', fontWeight: 400 }}>in your organisation?</span>
        </h1>
        <p style={{ fontSize: 17, color: 'rgba(255,255,255,0.45)', lineHeight: 1.75, maxWidth: 540, margin: '0 auto 44px' }}>
          A function-by-function AI maturity assessment for business leaders. Scored across 6 dimensions. Benchmarked by industry. Delivered as a boardroom-ready report.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14, maxWidth: 620, margin: '0 auto 44px' }}>
          {[
            { icon: '◈', title: '25 Functions', sub: 'Finance · HR · IT · Sales · Operations + more' },
            { icon: '⬡', title: '6 Dimensions', sub: 'Data · Tech · Talent · Governance · Change · ROI' },
            { icon: '🔒', title: '100% Private', sub: 'All data stays in your browser. Zero cloud.' },
          ].map(c => (
            <div key={c.title} style={{ border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, padding: '20px 16px' }}>
              <div style={{ fontSize: 22, marginBottom: 8, color: 'rgba(255,255,255,0.3)' }}>{c.icon}</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#F8FAFC', marginBottom: 4 }}>{c.title}</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', lineHeight: 1.5 }}>{c.sub}</div>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button onClick={() => setPage('setup')} style={{ background: '#6366F1', border: 'none', borderRadius: 12, padding: '14px 44px', fontSize: 15, fontWeight: 700, color: '#fff', cursor: 'pointer', letterSpacing: '-0.3px' }}>
            Start Assessment →
          </button>
          {totalAnswered > 0 && (
            <button onClick={() => setPage('assess')} style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 12, padding: '14px 28px', fontSize: 14, fontWeight: 600, color: 'rgba(255,255,255,0.6)', cursor: 'pointer' }}>
              Continue ({pctComplete}% done)
            </button>
          )}
        </div>
        {qbLoading && <div style={{ marginTop: 24, fontSize: 12, color: 'rgba(255,255,255,0.3)' }}>Loading question bank…</div>}
        {qbError && <div style={{ marginTop: 24, fontSize: 12, color: '#EF4444', background: 'rgba(239,68,68,0.1)', padding: '8px 16px', borderRadius: 8 }}>{qbError}</div>}
      </div>
    </div>
  )

  // ── SETUP PAGE ───────────────────────────────────────────────────────────
  if (page === 'setup') return (
    <div style={{ minHeight: '100vh', background: COLORS.surface, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px', fontFamily: "'Segoe UI', system-ui, sans-serif" }}>
      <div style={{ maxWidth: 540, width: '100%', background: '#fff', borderRadius: 20, boxShadow: '0 20px 60px rgba(0,0,0,0.08)', padding: '40px' }}>
        <button onClick={() => setPage('welcome')} style={{ fontSize: 12, color: COLORS.muted, background: 'none', border: 'none', cursor: 'pointer', padding: '0 0 20px', letterSpacing: 1 }}>← Back</button>
        <h2 style={{ fontSize: 26, fontWeight: 800, color: COLORS.text, margin: '0 0 8px', letterSpacing: '-0.5px' }}>Organisation Profile</h2>
        <p style={{ fontSize: 13, color: COLORS.muted, margin: '0 0 30px', lineHeight: 1.6 }}>Calibrates industry benchmarks, regulatory overlays and function-specific questions. All data stays local.</p>

        {[
          { k: 'org',  l: 'Organisation Name', ph: 'e.g. Acme Corporation' },
          { k: 'role', l: 'Your Role',          ph: 'e.g. Chief Information Officer' },
        ].map(f => (
          <div key={f.k} style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: COLORS.text, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1 }}>{f.l}</label>
            <input value={config[f.k] || ''} onChange={e => setConfig(c => ({ ...c, [f.k]: e.target.value }))} placeholder={f.ph}
              style={{ width: '100%', padding: '11px 14px', border: `1.5px solid ${COLORS.border}`, borderRadius: 10, fontSize: 14, fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box', color: COLORS.text }} />
          </div>
        ))}

        {[
          { k: 'industry', l: 'Industry Sector', opts: INDUSTRIES },
          { k: 'size',     l: 'Organisation Size', opts: ORG_SIZES.map(s => s.label) },
        ].map(f => (
          <div key={f.k} style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: COLORS.text, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1 }}>{f.l}</label>
            <select value={config[f.k] || ''} onChange={e => setConfig(c => ({ ...c, [f.k]: e.target.value }))}
              style={{ width: '100%', padding: '11px 14px', border: `1.5px solid ${COLORS.border}`, borderRadius: 10, fontSize: 14, fontFamily: 'inherit', outline: 'none', background: '#fff', color: COLORS.text }}>
              <option value="">Select…</option>
              {f.opts.map(o => <option key={o}>{o}</option>)}
            </select>
          </div>
        ))}

        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: COLORS.text, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1 }}>Primary Region</label>
          <select value={config.region || ''} onChange={e => setConfig(c => ({ ...c, region: e.target.value }))}
            style={{ width: '100%', padding: '11px 14px', border: `1.5px solid ${COLORS.border}`, borderRadius: 10, fontSize: 14, fontFamily: 'inherit', outline: 'none', background: '#fff', color: COLORS.text }}>
            <option value="">Select…</option>
            {REGIONS.map(r => <option key={r.id} value={r.id}>{r.label}</option>)}
          </select>
        </div>

        <div style={{ marginBottom: 28 }}>
          <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: COLORS.text, marginBottom: 10, textTransform: 'uppercase', letterSpacing: 1 }}>Assessment Level</label>
          <div style={{ display: 'flex', gap: 10 }}>
            {LEVELS.map(l => (
              <button key={l} onClick={() => setConfig(c => ({ ...c, level: l }))}
                style={{ flex: 1, padding: '10px 8px', borderRadius: 10, border: `2px solid ${config.level === l ? COLORS.indigo : COLORS.border}`, background: config.level === l ? '#EEF2FF' : '#fff', fontSize: 13, fontWeight: 700, color: config.level === l ? COLORS.indigo : COLORS.muted, cursor: 'pointer' }}>
                {l}
              </button>
            ))}
          </div>
          <div style={{ fontSize: 11, color: COLORS.muted, marginTop: 6 }}>Exploring = awareness questions. Piloting = capability questions. Scaling = optimisation questions.</div>
        </div>

        <button onClick={() => { if (canProceed) setPage('assess') }}
          style={{ width: '100%', padding: '14px', border: 'none', borderRadius: 12, fontSize: 15, fontWeight: 700, cursor: canProceed ? 'pointer' : 'default', background: canProceed ? `linear-gradient(135deg, ${COLORS.indigo}, #7C3AED)` : COLORS.border, color: canProceed ? '#fff' : COLORS.muted }}>
          Begin Assessment →
        </button>
      </div>
    </div>
  )

  // ── ASSESS PAGE ──────────────────────────────────────────────────────────
  if (page === 'assess') {
    const practice = PRACTICES.find(p => p.id === activePractice)
    const practiceScore = fnScores[activePractice]
    const domainGroups = ['Business', 'Technology', 'Operations']

    return (
      <div style={{ minHeight: '100vh', background: COLORS.surface, fontFamily: "'Segoe UI', system-ui, sans-serif" }}>
        {/* Top bar */}
        <div style={{ background: COLORS.navy, position: 'sticky', top: 0, zIndex: 100, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ maxWidth: 1400, margin: '0 auto', display: 'flex', alignItems: 'center', padding: '0 16px', height: 52, gap: 16 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.5)', flexShrink: 0 }}>AI Readiness</span>
            <div style={{ flex: 1, height: 3, background: 'rgba(255,255,255,0.06)', borderRadius: 100, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${pctComplete}%`, background: COLORS.indigo, borderRadius: 100, transition: 'width 0.5s' }} />
            </div>
            <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', flexShrink: 0 }}>{pctComplete}% complete</span>
            {totalAnswered >= 10 && (
              <button onClick={() => setPage('report')} style={{ fontSize: 11, padding: '5px 14px', border: '1px solid rgba(99,102,241,0.4)', borderRadius: 100, background: 'rgba(99,102,241,0.12)', color: '#818CF8', cursor: 'pointer', fontWeight: 700, flexShrink: 0 }}>
                View Report →
              </button>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', maxWidth: 1400, margin: '0 auto' }}>
          {/* Left sidebar — practice list */}
          <div style={{ width: 260, flexShrink: 0, borderRight: `1px solid ${COLORS.border}`, background: '#fff', minHeight: 'calc(100vh - 52px)', overflowY: 'auto', position: 'sticky', top: 52 }}>
            {domainGroups.map(domain => (
              <div key={domain}>
                <div style={{ padding: '12px 16px 4px', fontSize: 10, fontWeight: 700, color: COLORS.muted, textTransform: 'uppercase', letterSpacing: 1 }}>{domain}</div>
                {PRACTICES.filter(p => p.domain === domain).map(p => {
                  const ps = fnScores[p.id]
                  const active = activePractice === p.id
                  const answered = ps?.answeredCount || 0
                  const total = ps?.totalCount || 0
                  const complete = total > 0 && answered === total
                  return (
                    <button key={p.id} onClick={() => { setActivePractice(p.id); setExpandedQ(null) }}
                      style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '9px 16px', border: 'none', background: active ? '#EEF2FF' : 'transparent', cursor: 'pointer', borderLeft: `3px solid ${active ? COLORS.indigo : 'transparent'}`, textAlign: 'left', borderBottom: `1px solid ${COLORS.border}` }}>
                      <span style={{ fontSize: 13, color: active ? COLORS.indigo : COLORS.muted }}>{p.icon}</span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 12, fontWeight: active ? 700 : 500, color: active ? COLORS.indigo : COLORS.text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</div>
                        {total > 0 && <div style={{ fontSize: 10, color: COLORS.muted }}>{answered}/{total} answered</div>}
                      </div>
                      {complete && <span style={{ fontSize: 10, color: '#10B981', fontWeight: 800 }}>✓</span>}
                      {ps?.overall && <span style={{ fontSize: 11, fontWeight: 800, color: getMaturity(ps.overall).color }}>{ps.overall.toFixed(1)}</span>}
                    </button>
                  )
                })}
              </div>
            ))}
          </div>

          {/* Main content */}
          <div style={{ flex: 1, padding: '24px', minWidth: 0 }}>
            {/* Practice header */}
            <div style={{ marginBottom: 20, display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 11, color: COLORS.muted, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>{practice?.domain} · {config.level} Level</div>
                <h2 style={{ fontSize: 22, fontWeight: 800, color: COLORS.text, margin: 0, letterSpacing: '-0.5px' }}>{practice?.name}</h2>
              </div>
              {practiceScore?.overall && (
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 32, fontWeight: 900, color: getMaturity(practiceScore.overall).color, lineHeight: 1 }}>{practiceScore.overall.toFixed(1)}</div>
                  <MaturityBadge score={practiceScore.overall} />
                </div>
              )}
            </div>

            {/* Progress bar for this practice */}
            <div style={{ height: 4, background: COLORS.border, borderRadius: 100, marginBottom: 20 }}>
              <div style={{ height: '100%', width: `${practiceScore?.totalCount ? (practiceScore.answeredCount / practiceScore.totalCount) * 100 : 0}%`, background: COLORS.indigo, borderRadius: 100, transition: 'width 0.4s' }} />
            </div>

            {/* Questions */}
            {practiceQs.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 60, color: COLORS.muted, fontSize: 14 }}>
                No questions found for {practice?.name} at {config.level} level.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {practiceQs.map((q, qi) => {
                  const ans = answers[q.questionId]
                  const isExpanded = expandedQ === q.questionId
                  const showBranch = q.branchTrigger && ans && q.branchTrigger.split(',').map(s => s.trim()).includes(ans)

                  return (
                    <div key={q.questionId} style={{ background: '#fff', border: `1.5px solid ${isExpanded ? COLORS.indigo : COLORS.border}`, borderRadius: 14, overflow: 'hidden', boxShadow: isExpanded ? '0 4px 20px rgba(0,0,0,0.06)' : 'none' }}>
                      {/* Question header */}
                      <div onClick={() => setExpandedQ(isExpanded ? null : q.questionId)}
                        style={{ padding: '14px 18px', cursor: 'pointer', display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                        <div style={{ width: 26, height: 26, borderRadius: '50%', border: `2px solid ${ans ? COLORS.indigo : COLORS.border}`, background: ans ? COLORS.indigo : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 800, color: ans ? '#fff' : COLORS.muted, flexShrink: 0, marginTop: 1 }}>
                          {ans ? '✓' : qi + 1}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                            <span style={{ fontSize: 10, color: COLORS.muted, textTransform: 'uppercase', letterSpacing: 0.5 }}>{q.level}</span>
                            <span style={{ fontSize: 10, color: COLORS.muted }}>·</span>
                            <span style={{ fontSize: 10, color: COLORS.muted }}>{q.questionId}</span>
                            {DIM_KEYS.filter(k => q.dims[k]).map(k => (
                              <span key={k} style={{ fontSize: 9, fontWeight: 700, color: DIMS[k].color, background: `${DIMS[k].color}15`, padding: '1px 6px', borderRadius: 100 }}>{k}</span>
                            ))}
                          </div>
                          <div style={{ fontSize: 14, fontWeight: 500, color: COLORS.text, lineHeight: 1.55 }}>{q.text}</div>
                          {ans && !isExpanded && (
                            <div style={{ marginTop: 6, display: 'inline-flex', alignItems: 'center', gap: 6, background: ans === 'Yes' ? '#F0FDF4' : ans === 'Partial' ? '#FFFBEB' : '#FFF1F2', padding: '3px 10px', borderRadius: 100, fontSize: 12, fontWeight: 600, color: ans === 'Yes' ? '#16A34A' : ans === 'Partial' ? '#D97706' : '#E11D48' }}>
                              {ans === 'Yes' ? '✓ Yes' : ans === 'Partial' ? '~ Partial' : '✗ No'}
                            </div>
                          )}
                        </div>
                        <span style={{ color: COLORS.border, fontSize: 18, flexShrink: 0 }}>{isExpanded ? '−' : '+'}</span>
                      </div>

                      {/* Expanded answer buttons */}
                      {isExpanded && (
                        <div style={{ borderTop: `1px solid ${COLORS.border}` }}>
                          {q.aiUseCaseHint && (
                            <div style={{ padding: '8px 18px 10px', background: '#F8FAFC', borderBottom: `1px solid ${COLORS.border}`, fontSize: 12, color: COLORS.muted }}>
                              <span style={{ fontWeight: 600, color: COLORS.indigo }}>AI Use Case: </span>{q.aiUseCaseHint}
                              {q.regulatoryRef && <span style={{ marginLeft: 12, color: '#DC2626', fontSize: 11 }}>📋 {q.regulatoryRef}</span>}
                            </div>
                          )}
                          <div style={{ display: 'flex', gap: 0, padding: '12px 18px' }}>
                            {[
                              { val: 'Yes',     label: 'Yes',     color: '#16A34A', bg: '#F0FDF4', border: '#BBF7D0', pts: q.pointsYes },
                              { val: 'Partial', label: 'Partial', color: '#D97706', bg: '#FFFBEB', border: '#FDE68A', pts: q.pointsPartial },
                              { val: 'No',      label: 'No',      color: '#E11D48', bg: '#FFF1F2', border: '#FECDD3', pts: q.pointsNo },
                            ].map(opt => (
                              <button key={opt.val} onClick={() => handleAnswer(q.questionId, opt.val)}
                                style={{ flex: 1, padding: '12px 8px', margin: '0 4px', borderRadius: 10, border: `2px solid ${ans === opt.val ? opt.color : opt.border}`, background: ans === opt.val ? opt.bg : '#fff', color: opt.color, fontSize: 14, fontWeight: 700, cursor: 'pointer', transition: 'all 0.15s' }}>
                                {opt.val === 'Yes' ? '✓ ' : opt.val === 'No' ? '✗ ' : '~ '}{opt.label}
                                <div style={{ fontSize: 10, fontWeight: 500, color: COLORS.muted, marginTop: 2 }}>{opt.pts} pt{opt.pts !== 1 ? 's' : ''}</div>
                              </button>
                            ))}
                          </div>

                          {/* Follow-up question */}
                          {showBranch && q.followUp && (
                            <div style={{ margin: '0 18px 14px', padding: '12px 14px', background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: 10 }}>
                              <div style={{ fontSize: 11, fontWeight: 700, color: '#D97706', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>Follow-up</div>
                              <div style={{ fontSize: 13, color: COLORS.text, lineHeight: 1.55 }}>{q.followUp}</div>
                              <div style={{ fontSize: 11, color: COLORS.muted, marginTop: 6 }}>Note this information — it will be captured in your assessment notes.</div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}

            {/* Practice navigation */}
            <div style={{ marginTop: 28, display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 20, borderTop: `1px solid ${COLORS.border}`, flexWrap: 'wrap', gap: 12 }}>
              <div style={{ fontSize: 12, color: COLORS.muted }}>
                {practiceScore?.answeredCount || 0}/{practiceScore?.totalCount || 0} answered in {practice?.name}
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                {(() => {
                  const idx = PRACTICES.findIndex(p => p.id === activePractice)
                  return (
                    <>
                      {idx > 0 && <button onClick={() => { setActivePractice(PRACTICES[idx-1].id); setExpandedQ(null) }} style={{ fontSize: 12, padding: '8px 14px', border: `1px solid ${COLORS.border}`, borderRadius: 8, background: '#fff', cursor: 'pointer', color: COLORS.text }}>← {PRACTICES[idx-1].name}</button>}
                      {idx < PRACTICES.length - 1 && <button onClick={() => { setActivePractice(PRACTICES[idx+1].id); setExpandedQ(null) }} style={{ fontSize: 12, padding: '8px 14px', border: `1px solid ${COLORS.border}`, borderRadius: 8, background: '#fff', cursor: 'pointer', color: COLORS.text }}>{PRACTICES[idx+1].name} →</button>}
                    </>
                  )
                })()}
                {totalAnswered >= 10 && <button onClick={() => setPage('report')} style={{ fontSize: 12, padding: '8px 18px', border: 'none', background: COLORS.navy, borderRadius: 8, cursor: 'pointer', color: '#fff', fontWeight: 700 }}>View Report →</button>}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ── REPORT PAGE ──────────────────────────────────────────────────────────
  if (page === 'report') {
    const maturity = getMaturity(orgOverall)
    const RTABS = [
      { id: 'summary',    l: 'Executive Summary' },
      { id: 'functions',  l: 'Function Heatmap' },
      { id: 'dimensions', l: 'Dimension Scores' },
      { id: 'gaps',       l: 'Gap Analysis' },
      { id: 'roadmap',    l: 'Investment Roadmap' },
    ]

    const sortedFunctions = [...PRACTICES].sort((a, b) => {
      const sa = fnScores[a.id]?.overall || 0
      const sb = fnScores[b.id]?.overall || 0
      return sb - sa
    })

    const topGaps = PRACTICES.flatMap(p => {
      const ps = fnScores[p.id]
      if (!ps?.overall) return []
      return DIM_KEYS.filter(k => ps.dimScores[k] && ps.dimScores[k] < 2.5)
        .map(k => ({ fn: p, dim: k, score: ps.dimScores[k] }))
    }).sort((a, b) => a.score - b.score).slice(0, 8)

    return (
      <div style={{ background: COLORS.surface, minHeight: '100vh', fontFamily: "'Segoe UI', system-ui, sans-serif" }}>
        {/* Header */}
        <div style={{ background: COLORS.navy }}>
          <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px 24px 0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16, marginBottom: 20 }}>
              <div>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 8 }}>
                  AI Readiness Assessment · {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                </div>
                <h1 style={{ fontSize: 26, fontWeight: 800, color: '#F8FAFC', margin: '0 0 4px', letterSpacing: '-0.5px' }}>{config.org || 'Your Organisation'}</h1>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)' }}>{config.industry} · {ORG_SIZES.find(s => s.label === config.size)?.label || config.size} · {REGIONS.find(r => r.id === config.region)?.label}</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
                <div style={{ fontSize: 52, fontWeight: 900, color: maturity.color, lineHeight: 1 }}>{orgOverall.toFixed(1)}</div>
                <div>
                  <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)' }}>/5.0 overall</div>
                  <MaturityBadge score={orgOverall} size="lg" />
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 2, overflowX: 'auto' }}>
              {RTABS.map(tab => (
                <button key={tab.id} onClick={() => setReportTab(tab.id)} style={{ padding: '11px 16px', border: 'none', background: 'none', cursor: 'pointer', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: reportTab === tab.id ? '#fff' : 'rgba(255,255,255,0.3)', borderBottom: `2px solid ${reportTab === tab.id ? COLORS.indigo : 'transparent'}`, whiteSpace: 'nowrap' }}>
                  {tab.l}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '28px 24px 60px' }}>

          {/* EXECUTIVE SUMMARY */}
          {reportTab === 'summary' && (
            <div>
              <div style={{ background: maturity.bg, border: `1px solid ${maturity.color}30`, borderRadius: 14, padding: '18px 22px', marginBottom: 22 }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: maturity.color, marginBottom: 4 }}>{maturity.label} — {orgOverall.toFixed(2)} / 5.0</div>
                <div style={{ fontSize: 13, color: COLORS.text, lineHeight: 1.7 }}>{maturity.desc}</div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 14, marginBottom: 24 }}>
                {[
                  { l: 'Overall Score',      v: orgOverall.toFixed(2), s: 'out of 5.0',                 c: maturity.color },
                  { l: 'Functions Assessed', v: PRACTICES.filter(p => fnScores[p.id]?.answeredCount > 0).length, s: `of ${PRACTICES.length} functions`, c: COLORS.indigo },
                  { l: 'Questions Answered', v: totalAnswered,          s: `of ${totalQuestions} total`, c: COLORS.blue },
                  { l: 'Critical Gaps',      v: topGaps.length,         s: 'scoring below 2.5',          c: '#DC2626' },
                ].map(m => (
                  <div key={m.l} style={{ background: '#fff', border: `1px solid ${COLORS.border}`, borderRadius: 12, padding: '16px' }}>
                    <div style={{ fontSize: 11, color: COLORS.muted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 }}>{m.l}</div>
                    <div style={{ fontSize: 28, fontWeight: 900, color: m.c, lineHeight: 1 }}>{m.v}</div>
                    <div style={{ fontSize: 11, color: COLORS.muted, marginTop: 3 }}>{m.s}</div>
                  </div>
                ))}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
                {/* Dimension overview */}
                <div style={{ background: '#fff', border: `1px solid ${COLORS.border}`, borderRadius: 14, padding: '20px' }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: COLORS.muted, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 16 }}>Dimension Scores</div>
                  {DIM_KEYS.map(k => {
                    const s = orgDimScores[k]
                    return (
                      <div key={k} style={{ marginBottom: 14 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                          <span style={{ fontSize: 13, fontWeight: 600, color: COLORS.text }}>{DIMS[k].label}</span>
                          <span style={{ fontSize: 14, fontWeight: 800, color: s ? getMaturity(s).color : COLORS.muted }}>{s ? s.toFixed(1) : '—'}</span>
                        </div>
                        <ScoreBar score={s || 1} color={DIMS[k].color} />
                      </div>
                    )
                  })}
                </div>
                {/* Radar */}
                <div style={{ background: '#fff', border: `1px solid ${COLORS.border}`, borderRadius: 14, padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: COLORS.muted, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12, alignSelf: 'flex-start' }}>Readiness Radar</div>
                  <RadarChart dimScores={orgDimScores} size={250} />
                </div>
              </div>
            </div>
          )}

          {/* FUNCTION HEATMAP */}
          {reportTab === 'functions' && (
            <div>
              <div style={{ background: '#fff', border: `1px solid ${COLORS.border}`, borderRadius: 14, padding: '24px', marginBottom: 16 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: COLORS.muted, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 20 }}>Function Readiness Heatmap</div>
                {['Business', 'Technology', 'Operations'].map(domain => (
                  <div key={domain} style={{ marginBottom: 24 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: COLORS.muted, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 12 }}>{domain}</div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(140px,1fr))', gap: 10 }}>
                      {PRACTICES.filter(p => p.domain === domain).map(p => {
                        const ps = fnScores[p.id]
                        const s = ps?.overall
                        const m = s ? getMaturity(s) : null
                        return (
                          <button key={p.id} onClick={() => { setActivePractice(p.id); setPage('assess') }}
                            style={{ background: m ? m.bg : '#F8FAFC', border: `1px solid ${m ? m.color + '40' : COLORS.border}`, borderRadius: 10, padding: '12px 10px', textAlign: 'center', cursor: 'pointer' }}>
                            <div style={{ fontSize: 18, marginBottom: 4 }}>{p.icon}</div>
                            <div style={{ fontSize: 11, fontWeight: 700, color: m ? m.color : COLORS.muted, lineHeight: 1.3, marginBottom: 4 }}>{p.name}</div>
                            <div style={{ fontSize: 16, fontWeight: 900, color: m ? m.color : COLORS.muted }}>{s ? s.toFixed(1) : '—'}</div>
                            {ps && <div style={{ fontSize: 9, color: COLORS.muted, marginTop: 2 }}>{ps.answeredCount}/{ps.totalCount}</div>}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                ))}
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 8, fontSize: 11, color: COLORS.muted }}>
                  {MATURITY.map(m => (
                    <div key={m.label} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <div style={{ width: 10, height: 10, borderRadius: 2, background: m.bg, border: `1px solid ${m.color}40` }} />
                      {m.label}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* DIMENSION SCORES */}
          {reportTab === 'dimensions' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 16 }}>
              {DIM_KEYS.map(k => {
                const s = orgDimScores[k]
                const m = s ? getMaturity(s) : null
                return (
                  <div key={k} style={{ background: '#fff', border: `1px solid ${COLORS.border}`, borderRadius: 14, padding: '20px', borderLeft: `5px solid ${DIMS[k].color}` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                      <div>
                        <div style={{ fontSize: 15, fontWeight: 700, color: COLORS.text, marginBottom: 2 }}>{DIMS[k].label}</div>
                        <div style={{ fontSize: 11, color: COLORS.muted }}>{DIMS[k].desc}</div>
                        <div style={{ fontSize: 11, color: COLORS.muted, marginTop: 2 }}>Weight: {Math.round(DIMS[k].weight * 100)}%</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: 36, fontWeight: 900, color: m ? m.color : COLORS.muted, lineHeight: 1 }}>{s ? s.toFixed(1) : '—'}</div>
                        {m && <MaturityBadge score={s} />}
                      </div>
                    </div>
                    <ScoreBar score={s || 1} color={DIMS[k].color} height={6} />
                  </div>
                )
              })}
            </div>
          )}

          {/* GAP ANALYSIS */}
          {reportTab === 'gaps' && (
            <div>
              {topGaps.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 60, color: COLORS.muted, fontSize: 14 }}>No critical gaps identified yet. Complete more of the assessment to see your gap analysis.</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {topGaps.map((gap, i) => (
                    <div key={i} style={{ background: '#fff', border: `1px solid ${COLORS.border}`, borderRadius: 14, padding: '18px 20px', borderLeft: `4px solid ${DIMS[gap.dim].color}` }}>
                      <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 10, flexWrap: 'wrap' }}>
                        <span style={{ fontSize: 11, fontWeight: 700, color: DIMS[gap.dim].color, background: `${DIMS[gap.dim].color}15`, padding: '3px 8px', borderRadius: 6 }}>{gap.dim} — {DIMS[gap.dim].label}</span>
                        <span style={{ fontSize: 11, fontWeight: 700, color: '#DC2626', background: '#FEF2F2', padding: '3px 8px', borderRadius: 6 }}>Score: {gap.score.toFixed(1)}</span>
                        <span style={{ fontSize: 11, color: COLORS.muted }}>{gap.fn.name}</span>
                      </div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: COLORS.text, marginBottom: 6 }}>{gap.fn.name} — {DIMS[gap.dim].label} gap</div>
                      <div style={{ fontSize: 12, color: COLORS.muted, lineHeight: 1.6 }}>
                        Current score of {gap.score.toFixed(1)} indicates: {getMaturity(gap.score).desc}
                      </div>
                      <button onClick={() => { setActivePractice(gap.fn.id); setPage('assess') }}
                        style={{ marginTop: 10, fontSize: 12, color: COLORS.indigo, background: 'none', border: `1px solid ${COLORS.indigo}40`, borderRadius: 8, padding: '5px 12px', cursor: 'pointer', fontWeight: 600 }}>
                        Assess {gap.fn.name} →
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ROADMAP */}
          {reportTab === 'roadmap' && (
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 18, marginBottom: 24 }}>
                {[
                  { phase: 'Phase 1', period: '0–3 months', label: 'Quick Wins', color: '#10B981', bg: '#F0FDF4',
                    items: sortedFunctions.filter(p => fnScores[p.id]?.overall >= 3.4).slice(0,4).map(p => `Activate AI tools in ${p.name} — highest readiness`) },
                  { phase: 'Phase 2', period: '3–12 months', label: 'Foundation Build', color: COLORS.indigo, bg: '#EEF2FF',
                    items: ['Build enterprise data platform & governance', 'Launch AI literacy programme organisation-wide', 'Establish AI governance committee & responsible AI policy', 'Deploy top 3 AI use cases with ROI tracking'] },
                  { phase: 'Phase 3', period: '12–24 months', label: 'Scale & Differentiate', color: '#7C3AED', bg: '#F5F3FF',
                    items: ['AI-native workflows across all functions', 'Proprietary data advantage programme', 'EU AI Act compliance programme completion', 'AI value reporting to board & investors'] },
                ].map(p => (
                  <div key={p.phase} style={{ background: p.bg, border: `1px solid ${p.color}25`, borderRadius: 16, padding: '20px' }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: p.color, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>{p.period}</div>
                    <div style={{ fontSize: 15, fontWeight: 800, color: COLORS.text, marginBottom: 14 }}>{p.phase}: {p.label}</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {(p.items.length > 0 ? p.items : ['Complete the assessment to unlock specific recommendations.']).map((item, i) => (
                        <div key={i} style={{ display: 'flex', gap: 8, fontSize: 12, color: COLORS.text }}>
                          <div style={{ width: 18, height: 18, borderRadius: '50%', background: p.color, color: '#fff', fontSize: 9, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>{i+1}</div>
                          {item}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Footer */}
          <div style={{ marginTop: 32, paddingTop: 20, borderTop: `1px solid ${COLORS.border}`, display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
            <div style={{ fontSize: 11, color: COLORS.muted }}>AI Readiness Assessment Platform v{APP_VERSION} · {config.org} · All data processed locally. Zero external transmission.</div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => setPage('assess')} style={{ fontSize: 11, color: COLORS.muted, background: 'none', border: `1px solid ${COLORS.border}`, borderRadius: 7, padding: '6px 12px', cursor: 'pointer' }}>← Continue Assessment</button>
              <button onClick={() => { setPage('welcome'); setAnswers({}); setConfig({ org: '', role: '', industry: '', region: '', size: '', level: 'Exploring' }); localStorage.removeItem(STORAGE_KEY) }}
                style={{ fontSize: 11, color: COLORS.indigo, background: 'none', border: `1px solid ${COLORS.indigo}40`, borderRadius: 7, padding: '6px 12px', cursor: 'pointer' }}>New Assessment</button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return null
}
