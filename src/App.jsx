// ============================================================
// AI Readiness Assessment Platform — App.jsx
// Fork of: itil4-assessor (github.com/Gsingh3001/itil4-assessor)
// Author:  Gagandeep Singh | AI Practice
// Version: 2.0.0
//
// What changed from ITSM assessor:
//  - PRACTICES array: 34 ITIL 4 practices → 25 org functions
//  - DIM_KEYS: PE/PC/MM/CI/TI → DQ/TR/TS/GE/CR/VR
//  - Auth system: mirrors itil4-assessor exactly (localStorage, roles, 8h session)
//  - Admin portal: dashboard, user mgmt, assessment history
//  - User report: radar, heatmap, roadmap, print CSS
//  - PDF report: 15-section dark theme (admin only)
//  - Session expiry: 8 hours with toast notification
// ============================================================

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import * as XLSX from 'xlsx'
import LoginScreen  from './components/LoginScreen.jsx'
import LandingPage  from './components/LandingPage.jsx'
import AdminPortal from './components/AdminPortal.jsx'
import UserReport  from './components/UserReport.jsx'
import {
  initUsers, authenticate, getSession, clearSession, saveAssessment,
  generateAssessmentId, timeUntilExpiry, ls,
} from './auth.js'

// ─── CONFIGURATION ─────────────────────────────────────────────────────────
const APP_VERSION = '2.0.0'
const QB_PATH = '/ai-question-bank.xlsx'

// ─── STORAGE KEYS ──────────────────────────────────────────────────────────
const progressKey = (u) => `arap_progress_v2_${u}`  // per-user progress isolation
const submitKey   = (u) => `arap_submitted_${u}`     // per-user lock flag

// ─── 25 Organisational Functions ───────────────────────────────────────────
const PRACTICES = [
  { id:'finance',          name:'Finance & Accounting',           domain:'Business',    icon:'₤' },
  { id:'hr',               name:'Human Resources',                domain:'Business',    icon:'◎' },
  { id:'sales',            name:'Sales & Revenue',                domain:'Business',    icon:'↗' },
  { id:'marketing',        name:'Marketing & CX',                 domain:'Business',    icon:'✦' },
  { id:'legal',            name:'Legal & Compliance',             domain:'Business',    icon:'⚖' },
  { id:'procurement',      name:'Procurement & Sourcing',         domain:'Business',    icon:'◈' },
  { id:'strategy',         name:'Strategy & Planning',            domain:'Business',    icon:'♟' },
  { id:'risk',             name:'Risk Management',                domain:'Business',    icon:'⬡' },
  { id:'customerservice',  name:'Customer Service',               domain:'Business',    icon:'◉' },
  { id:'corpgovernance',   name:'Corporate Governance',           domain:'Business',    icon:'▲' },
  { id:'it',               name:'IT & Infrastructure',            domain:'Technology',  icon:'⬡' },
  { id:'softwaredev',      name:'Software Development',           domain:'Technology',  icon:'{}' },
  { id:'data',             name:'Data & Analytics',               domain:'Technology',  icon:'◈' },
  { id:'cybersecurity',    name:'Cybersecurity',                  domain:'Technology',  icon:'⬡' },
  { id:'itsm',             name:'IT Service Management',          domain:'Technology',  icon:'⚙' },
  { id:'cloud',            name:'Cloud & Platform',               domain:'Technology',  icon:'☁' },
  { id:'network',          name:'Network & Communications',       domain:'Technology',  icon:'⬡' },
  { id:'digitalworkplace', name:'Digital Workplace',              domain:'Technology',  icon:'◆' },
  { id:'supplychain',      name:'Supply Chain & Logistics',       domain:'Operations',  icon:'⬡' },
  { id:'manufacturing',    name:'Manufacturing & Production',     domain:'Operations',  icon:'⚙' },
  { id:'qualityassurance', name:'Quality Assurance',              domain:'Operations',  icon:'✓' },
  { id:'facilities',       name:'Facilities & Property',          domain:'Operations',  icon:'⬡' },
  { id:'healthsafety',     name:'Health & Safety',                domain:'Operations',  icon:'⬡' },
  { id:'environmental',    name:'Environmental & Sustainability', domain:'Operations',  icon:'◎' },
  { id:'fieldservice',     name:'Field Service',                  domain:'Operations',  icon:'⬡' },
  { id:'data_readiness',  name:'Data Readiness',                 domain:'Technology',  icon:'◈' },
  { id:'ai_literacy',     name:'AI Literacy & Training',         domain:'Business',    icon:'◎' },
]

// ─── 6 AI Readiness Dimensions ─────────────────────────────────────────────
const DIM_KEYS = ['DQ','TR','TS','GE','CR','VR']
const DIMS = {
  DQ: { label:'Data Quality',         weight:0.30, color:'#6366F1', desc:'Data availability, accuracy, lineage & governance' },
  TR: { label:'Tech Readiness',        weight:0.18, color:'#0EA5E9', desc:'Infrastructure, APIs, AI tooling & integration' },
  TS: { label:'Talent & Skills',       weight:0.22, color:'#F59E0B', desc:'AI literacy, data skills & upskilling maturity' },
  GE: { label:'Governance & Ethics',   weight:0.15, color:'#EF4444', desc:'AI policy, ethics, bias monitoring & regulatory' },
  CR: { label:'Change Readiness',      weight:0.08, color:'#F97316', desc:'Culture, leadership sponsorship & change mgmt' },
  VR: { label:'Value & ROI',           weight:0.07, color:'#10B981', desc:'Use case clarity, business cases & benefit tracking' },
}

const LEVELS = ['Exploring','Piloting','Scaling']

const MATURITY = [
  { min:1.0, max:1.8, label:'AI Unaware',   color:'#DC2626', bg:'#FEF2F2' },
  { min:1.8, max:2.6, label:'AI Exploring', color:'#EA580C', bg:'#FFF7ED' },
  { min:2.6, max:3.4, label:'AI Piloting',  color:'#D97706', bg:'#FFFBEB' },
  { min:3.4, max:4.2, label:'AI Scaling',   color:'#2563EB', bg:'#EFF6FF' },
  { min:4.2, max:5.1, label:'AI-Native',    color:'#059669', bg:'#F0FDF4' },
]

const getMaturity = score => MATURITY.find(m => score >= m.min && score < m.max) || MATURITY[0]
const calcDimScore = (earned, max) => max === 0 ? 1.0 : 1 + (earned / max) * 4

const INDUSTRIES = [
  'Financial Services & Banking','Healthcare & Life Sciences','Retail & E-Commerce',
  'Manufacturing & Engineering','Government & Public Sector','Telecommunications & Media',
  'Energy & Utilities','Professional & Legal Services','Technology & Software',
  'Education & Research','Logistics & Supply Chain','Real Estate & Construction',
  'Insurance','Food & Consumer Goods','Other',
]
const REGIONS = [
  { id:'uk',    label:'🇬🇧 United Kingdom' },
  { id:'eu',    label:'🇪🇺 European Union' },
  { id:'us',    label:'🇺🇸 United States' },
  { id:'apac',  label:'🌏 Asia Pacific' },
  { id:'global',label:'🌍 Global / Multi-Region' },
]
const ORG_SIZES = [
  { id:'startup',    label:'Startup (< 50)' },
  { id:'sme',        label:'SME (50 – 250)' },
  { id:'midmarket',  label:'Mid-Market (250 – 2,000)' },
  { id:'enterprise', label:'Enterprise (2,000 – 10,000)' },
  { id:'global',     label:'Global (10,000+)' },
]

const AI_GOALS = [
  { id:'automation',  icon:'⚙', label:'Process Automation',      desc:'Automate repetitive tasks at scale',     color:'#6366F1' },
  { id:'revenue',     icon:'↗', label:'Revenue Growth',           desc:'AI-driven sales & marketing uplift',     color:'#10B981' },
  { id:'cx',          icon:'◉', label:'Customer Experience',      desc:'Personalise customer journeys',          color:'#F59E0B' },
  { id:'efficiency',  icon:'⚡', label:'Operational Efficiency',   desc:'Reduce costs, boost throughput',         color:'#0EA5E9' },
  { id:'risk',        icon:'⬡', label:'Risk & Compliance',        desc:'AI governance & regulatory excellence',  color:'#EF4444' },
  { id:'innovation',  icon:'◈', label:'Innovation & R&D',         desc:'Accelerate product innovation',          color:'#8B5CF6' },
  { id:'workforce',   icon:'◎', label:'Workforce Transformation', desc:'Build AI-first culture & capability',    color:'#F97316' },
  { id:'data',        icon:'▲', label:'Data Intelligence',        desc:'Insight-led decision making',            color:'#06B6D4' },
]

// ─── QUESTION BANK LOADER ──────────────────────────────────────────────────
async function loadQuestionBank() {
  try {
    const resp = await fetch(QB_PATH)
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`)
    const ab = await resp.arrayBuffer()
    const wb = XLSX.read(ab, { type:'array' })
    const ws = wb.Sheets[wb.SheetNames[0]]
    const rows = XLSX.utils.sheet_to_json(ws, { defval:'' })
    return rows.map(r => ({
      functionId:    String(r.function_id || ''),
      functionName:  String(r.function_name || ''),
      domain:        String(r.domain || ''),
      level:         String(r.competency_level || ''),
      questionId:    String(r.question_id || ''),
      text:          String(r.question_text || ''),
      answerType:    String(r.answer_type || 'YPN'),
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
      aiUseCaseHint: String(r.ai_use_case_hint || ''),
      regulatoryRef: String(r.regulatory_ref || ''),
    }))
  } catch(e) {
    console.error('Failed to load question bank:', e)
    return []
  }
}

// ─── SCORE CALCULATOR ──────────────────────────────────────────────────────
function computeScores(questions, answers) {
  const fnScores = {}
  PRACTICES.forEach(p => {
    const fnQs = questions.filter(q => q.functionId === p.id)
    const dimEarned = {}; const dimMax = {}
    DIM_KEYS.forEach(k => { dimEarned[k] = 0; dimMax[k] = 0 })
    fnQs.forEach(q => {
      const ans = answers[q.questionId]
      const pts = ans === 'Yes' ? q.pointsYes : ans === 'Partial' ? q.pointsPartial : 0
      DIM_KEYS.forEach(k => { if (q.dims[k]) { dimEarned[k] += pts; dimMax[k] += q.pointsYes } })
    })
    const dimScores = {}
    DIM_KEYS.forEach(k => { dimScores[k] = dimMax[k] > 0 ? calcDimScore(dimEarned[k], dimMax[k]) : null })
    const answeredDims = DIM_KEYS.filter(k => dimScores[k] !== null)
    const overallFn = answeredDims.length > 0
      ? answeredDims.reduce((s,k) => s + dimScores[k] * DIMS[k].weight, 0) / answeredDims.reduce((s,k) => s + DIMS[k].weight, 0)
      : null
    fnScores[p.id] = { dimScores, overall: overallFn, answeredCount: fnQs.filter(q => answers[q.questionId]).length, totalCount: fnQs.length }
  })

  const orgDimEarned = {}; const orgDimMax = {}
  DIM_KEYS.forEach(k => { orgDimEarned[k] = 0; orgDimMax[k] = 0 })
  questions.forEach(q => {
    const ans = answers[q.questionId]
    if (!ans) return
    const pts = ans === 'Yes' ? q.pointsYes : ans === 'Partial' ? q.pointsPartial : 0
    DIM_KEYS.forEach(k => { if (q.dims[k]) { orgDimEarned[k] += pts; orgDimMax[k] += q.pointsYes } })
  })
  const orgDimScores = {}
  DIM_KEYS.forEach(k => { orgDimScores[k] = orgDimMax[k] > 0 ? calcDimScore(orgDimEarned[k], orgDimMax[k]) : null })
  const validDims = DIM_KEYS.filter(k => orgDimScores[k] !== null)
  const orgOverall = validDims.length > 0
    ? validDims.reduce((s,k) => s + orgDimScores[k] * DIMS[k].weight, 0) / validDims.reduce((s,k) => s + DIMS[k].weight, 0)
    : 1.0

  return { fnScores, orgDimScores, orgOverall }
}

// ─── COLOUR TOKENS ──────────────────────────────────────────────────────────
const COLORS = {
  navy:   '#0F172A',
  indigo: '#6366F1',
  surface:'#F8FAFC',
  border: '#E2E8F0',
  text:   '#0F172A',
  muted:  '#64748B',
}

// ─── MICRO COMPONENTS ───────────────────────────────────────────────────────
function ScoreBar({ score, color, height=6 }) {
  const pct = score ? Math.round(((score-1)/4)*100) : 0
  return (
    <div style={{ height, background:'#E2E8F0', borderRadius:100, overflow:'hidden' }}>
      <div style={{ height:'100%', width:`${pct}%`, background:color, borderRadius:100, transition:'width 0.6s ease' }}/>
    </div>
  )
}

function MaturityBadge({ score, size='sm' }) {
  const m = getMaturity(score || 1)
  return (
    <span style={{ background:m.bg, color:m.color, border:`1px solid ${m.color}40`, borderRadius:100, padding: size==='lg' ? '6px 16px' : '3px 10px', fontSize: size==='lg' ? 13 : 11, fontWeight:700 }}>
      {m.label}
    </span>
  )
}

function Toast({ msg, type }) {
  const bg = type==='success' ? '#059669' : type==='error' ? '#DC2626' : '#6366F1'
  return (
    <div style={{ position:'fixed', bottom:24, right:24, zIndex:9999, background:bg, color:'#fff', borderRadius:10, padding:'12px 20px', fontSize:13, fontWeight:600, boxShadow:'0 8px 24px rgba(0,0,0,0.2)', maxWidth:340, lineHeight:1.4 }}>
      {msg}
    </div>
  )
}

// ─── MAIN APP ───────────────────────────────────────────────────────────────
export default function App() {
  const [page,        setPage]        = useState('home')    // home|welcome|setup|assess|report
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [session,     setSession]     = useState(null)
  const [questions,   setQuestions]   = useState([])
  const [qbLoading,   setQbLoading]   = useState(false)
  const [qbError,     setQbError]     = useState(null)
  const [config,      setConfig]      = useState({ org:'', role:'', industry:'', region:'', size:'', level:'Exploring', goals:[] })
  const [answers,     setAnswers]     = useState({})
  const [activePractice, setActivePractice] = useState(PRACTICES[0].id)
  const [toast,       setToast]       = useState(null)
  const [pdfProgress, setPdfProgress] = useState(null)
  const [showAdmin,   setShowAdmin]   = useState(false)
  const [assessmentSaved, setAssessmentSaved] = useState(false)

  const showToast = useCallback((msg, type='info') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3800)
  }, [])

  // ── Bootstrap ──
  useEffect(() => {
    initUsers()
    const ses = getSession()
    if (ses) {
      setSession(ses)
      // Restore per-user progress (never bleeds between users)
      const saved = ls.get(progressKey(ses.username))
      if (saved?.answers) setAnswers(saved.answers)
      if (saved?.config)  setConfig(saved.config)
      // Restore lock state — if this user already submitted, re-lock immediately
      if (ls.get(submitKey(ses.username))) setAssessmentSaved(true)
      setPage('welcome')
    }
    // Load QB
    setQbLoading(true)
    loadQuestionBank().then(qs => {
      setQuestions(qs)
      setQbLoading(false)
      if (qs.length === 0) setQbError('Could not load ai-question-bank.xlsx. Place the file in /public and restart.')
    })
  }, [])

  // ── Session expiry check ──
  useEffect(() => {
    if (!session) return
    const remaining = timeUntilExpiry(session)
    if (remaining <= 0) { handleLogout(); return }
    const timer = setTimeout(() => {
      showToast('Your session has expired. Please sign in again.', 'error')
      handleLogout()
    }, remaining)
    return () => clearTimeout(timer)
  }, [session])

  // ── Auto-save progress (per-user, stops once submitted) ──
  useEffect(() => {
    if (Object.keys(answers).length > 0 && session && !assessmentSaved) {
      ls.set(progressKey(session.username), { answers, config, savedAt: Date.now() })
    }
  }, [answers, config, session, assessmentSaved])

  // ── Scores (memoised) ──
  const { fnScores, orgDimScores, orgOverall } = useMemo(
    () => computeScores(questions, answers),
    [questions, answers]
  )
  const totalAnswered  = Object.keys(answers).length
  const totalQuestions = questions.length
  const pctComplete    = totalQuestions > 0 ? Math.round((totalAnswered / totalQuestions) * 100) : 0

  const practiceQs = useMemo(() =>
    questions.filter(q => q.functionId === activePractice &&
      (config.level === 'All' || LEVELS.indexOf(q.level) <= LEVELS.indexOf(config.level))),
    [questions, activePractice, config.level]
  )

  function handleLogin(ses) {
    setSession(ses)
    setShowLoginModal(false)
    // Load THIS user's progress — never another user's data
    const saved = ls.get(progressKey(ses.username))
    if (saved?.answers) setAnswers(saved.answers)
    else setAnswers({})
    if (saved?.config)  setConfig(saved.config)
    else setConfig({ org:'', role:'', industry:'', region:'', size:'', level:'Exploring', goals:[] })
    // Restore lock state
    const alreadySubmitted = !!ls.get(submitKey(ses.username))
    setAssessmentSaved(alreadySubmitted)
    setPage('welcome')
    showToast(`Welcome back, ${ses.name}!`, 'success')
  }

  function handleLogout() {
    clearSession()
    setSession(null)
    setAnswers({})
    setConfig({ org:'', role:'', industry:'', region:'', size:'', level:'Exploring', goals:[] })
    setAssessmentSaved(false)
    setPage('home')
    setShowAdmin(false)
    setShowLoginModal(false)
  }

  const handleAnswer = useCallback((qId, value) => {
    if (assessmentSaved) return   // 🔒 locked after submission
    setAnswers(prev => ({ ...prev, [qId]: value }))
  }, [assessmentSaved])

  function handleSaveAssessment() {
    if (assessmentSaved) return   // already locked — ignore duplicate calls
    const assessmentId = generateAssessmentId()
    const record = saveAssessment({
      orgName:     config.org,
      industry:    config.industry,
      region:      config.region,
      size:        config.size,
      username:    session?.username || 'unknown',
      orgOverall,
      orgDimScores,
      fnScores,
      answers,
      config,
      assessmentId,
    })
    // Persist lock flag for this user — survives page refresh and re-login
    ls.set(submitKey(session.username), { lockedAt: Date.now(), assessmentId: record.id })
    setAssessmentSaved(true)
    showToast(`Assessment submitted & locked — ID: ${record.id}`, 'success')
    // Auto-upload report to Vercel Blob in background — no user action required
    autoSaveToCloud()
    return record
  }

  // autoSaveToCloud — fire-and-forget background upload, no UI blocking
  async function autoSaveToCloud() {
    try {
      const { generateAIReadinessPDFHTML } = await import('./components/PDFGeneratorHTML.js')
      const html = generateAIReadinessPDFHTML({
        orgName:        config.org || 'Organisation',
        industry:       config.industry,
        region:         REGIONS.find(r => r.id === config.region)?.label || config.region,
        orgSize:        config.size || 'medium',
        overallScore:   orgOverall,
        dimScores:      orgDimScores,
        functionScores: flattenFnScores(fnScores),
        assessedBy:     session?.name || session?.username,
        completedAt:    Date.now(),
        goals:          config.goals || [],
      })
      const res = await fetch('/api/reports', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          htmlContent: html,
          username:    session?.username || 'unknown',
          orgName:     config.org || 'Organisation',
          timestamp:   Date.now(),
        }),
      })
      if (res.ok) showToast('Report saved to cloud ☁', 'info')
    } catch(e) {
      console.warn('Auto cloud save failed (non-critical):', e)
    }
  }

  // Flatten fnScores { id: { overall, dimScores } } → { id: score } for PDF
  function flattenFnScores(raw) {
    const out = {}
    Object.entries(raw || {}).forEach(([id, val]) => {
      if (val && typeof val === 'object' && val.overall != null) out[id] = val.overall
      else if (typeof val === 'number') out[id] = val
    })
    return out
  }

  // handleDownloadPDF — HTML-to-print approach (same as itil4-assessor)
  // window.open MUST be called synchronously (before any await) to avoid popup blockers
  async function handleDownloadPDF(overrideData = null) {
    if (!session || session.role !== 'admin') return

    // Open window synchronously within user gesture — popup blockers require this
    const win = window.open('', '_blank', 'width=1100,height=900,scrollbars=yes,resizable=yes')
    if (!win) {
      showToast('Enable pop-ups for this site, then try again.', 'error')
      return
    }
    win.document.write(`<html><body style="background:#0A0E1A;color:#fff;font-family:system-ui;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;flex-direction:column;gap:16px;">
      <div style="font-size:32px;">◈</div>
      <div style="font-size:18px;font-weight:700;">Generating AI Readiness Report…</div>
      <div style="font-size:13px;color:#94a3b8;">This will take a moment</div>
    </body></html>`)

    try {
      const { generateAIReadinessPDFHTML } = await import('./components/PDFGeneratorHTML.js')

      const assessmentData = overrideData || {
        orgName:        config.org || 'Organisation',
        industry:       config.industry,
        region:         REGIONS.find(r => r.id === config.region)?.label || config.region,
        orgSize:        config.size || 'medium',
        overallScore:   orgOverall,
        dimScores:      orgDimScores,
        functionScores: flattenFnScores(fnScores),
        assessedBy:     session.name || session.username,
        completedAt:    Date.now(),
        assessmentId:   '',
        goals:          config.goals || [],
      }

      const html = generateAIReadinessPDFHTML(assessmentData)
      win.document.open()
      win.document.write(html)
      win.document.close()
      showToast('Report ready — press Ctrl+P to save as PDF', 'success')

      // Auto-upload to Vercel Blob in background — no user action required
      fetch('/api/reports', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          htmlContent: html,
          username:    session?.username || 'admin',
          orgName:     assessmentData.orgName,
          timestamp:   Date.now(),
        }),
      }).then(r => { if (r.ok) showToast('Report auto-saved to cloud ☁', 'info') })
        .catch(e => console.warn('Auto cloud save (PDF):', e))

    } catch(e) {
      console.error('PDF error:', e)
      win.close()
      showToast('Report generation failed. Check console.', 'error')
    }
  }

  // handleSaveToCloud — generates HTML report and uploads to Vercel Blob
  async function handleSaveToCloud(overrideData = null) {
    if (!session || session.role !== 'admin') return null
    try {
      const { generateAIReadinessPDFHTML } = await import('./components/PDFGeneratorHTML.js')
      const assessmentData = overrideData || {
        orgName:        config.org || 'Organisation',
        industry:       config.industry,
        region:         REGIONS.find(r => r.id === config.region)?.label || config.region,
        orgSize:        config.size || 'medium',
        overallScore:   orgOverall,
        dimScores:      orgDimScores,
        functionScores: flattenFnScores(fnScores),
        assessedBy:     session.name || session.username,
        completedAt:    Date.now(),
        assessmentId:   '',
        goals:          config.goals || [],
      }
      const html = generateAIReadinessPDFHTML(assessmentData)
      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          htmlContent: html,
          username:    session.username || 'admin',
          orgName:     assessmentData.orgName,
          timestamp:   Date.now(),
        }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.detail || err.error || `HTTP ${res.status}`)
      }
      const data = await res.json()
      showToast('Report saved to cloud!', 'success')
      return data
    } catch(e) {
      console.error('Cloud save error:', e)
      showToast(`Cloud save failed: ${e.message}`, 'error')
      return null
    }
  }

  // ── ADMIN PORTAL overlay ──
  if (showAdmin && session?.role === 'admin') {
    return <AdminPortal session={session} onClose={() => setShowAdmin(false)} onDownloadPDF={handleDownloadPDF} onSaveToCloud={handleSaveToCloud} />
  }

  // ── LOGIN ──
  // ── Landing page (public) ──
  if (!session || page === 'home') {
    return (
      <>
        <LandingPage onShowLogin={() => setShowLoginModal(true)} />
        {showLoginModal && (
          <LoginScreen onLogin={handleLogin} onClose={() => setShowLoginModal(false)} />
        )}
      </>
    )
  }

  // ── TOP NAV ──
  const TopNav = () => (
    <div style={{ background:COLORS.navy, position:'sticky', top:0, zIndex:100, borderBottom:'1px solid rgba(255,255,255,0.05)' }}>
      <div style={{ maxWidth:1400, margin:'0 auto', display:'flex', alignItems:'center', padding:'0 16px', height:52, gap:16 }}>
        <div style={{ display:'flex', alignItems:'center', gap:6 }}>
          <div style={{ width:22, height:22, borderRadius:6, background:'linear-gradient(135deg, #6366F1, #0EA5E9)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:10 }}>⬡</div>
          <span style={{ fontSize:12, fontWeight:700, color:'rgba(255,255,255,0.6)' }}>AI Readiness</span>
        </div>
        <div style={{ flex:1, height:3, background:'rgba(255,255,255,0.06)', borderRadius:100, overflow:'hidden' }}>
          <div style={{ height:'100%', width:`${pctComplete}%`, background:'#6366F1', borderRadius:100, transition:'width 0.5s' }}/>
        </div>
        <span style={{ fontSize:11, color:'rgba(255,255,255,0.3)', flexShrink:0 }}>{pctComplete}% complete</span>
        {totalAnswered >= 10 && page !== 'report' && (
          <button onClick={() => setPage('report')} style={{ fontSize:11, padding:'5px 14px', border:'1px solid rgba(99,102,241,0.4)', borderRadius:100, background:'rgba(99,102,241,0.12)', color:'#818CF8', cursor:'pointer', fontWeight:700, flexShrink:0 }}>
            View Report →
          </button>
        )}
        {session?.role === 'admin' && (
          <button onClick={() => setShowAdmin(true)} style={{ fontSize:11, padding:'5px 12px', border:'1px solid rgba(255,255,255,0.1)', borderRadius:8, background:'rgba(255,255,255,0.05)', color:'rgba(255,255,255,0.5)', cursor:'pointer', flexShrink:0 }}>
            Admin
          </button>
        )}
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          <div style={{ width:28, height:28, borderRadius:'50%', background:'linear-gradient(135deg, #6366F1, #0EA5E9)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:700, color:'#fff', flexShrink:0 }}>
            {session.name?.[0]?.toUpperCase() || 'U'}
          </div>
          <button onClick={handleLogout} style={{ fontSize:11, color:'rgba(255,255,255,0.3)', background:'none', border:'none', cursor:'pointer', padding:0 }}>Sign out</button>
        </div>
      </div>
    </div>
  )

  // ── WELCOME PAGE ──────────────────────────────────────────────────────────
  if (page === 'welcome') return (
    <div style={{ minHeight:'100vh', background:COLORS.navy, fontFamily:"'Segoe UI', Inter, system-ui, sans-serif" }}>
      <TopNav/>
      <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'60px 24px', minHeight:'calc(100vh - 52px)' }}>
        <div style={{ maxWidth:720, width:'100%', textAlign:'center' }}>
          <div style={{ display:'inline-flex', alignItems:'center', gap:8, border:'1px solid rgba(99,102,241,0.4)', borderRadius:100, padding:'5px 18px', marginBottom:40, fontSize:11, color:'rgba(99,102,241,0.9)', letterSpacing:3, textTransform:'uppercase', background:'rgba(99,102,241,0.08)' }}>
            <span style={{ width:5, height:5, borderRadius:'50%', background:'#6366F1', display:'inline-block', boxShadow:'0 0 6px #6366F1' }}/>
            AI Readiness Assessment Platform · v{APP_VERSION}
          </div>
          <h1 style={{ fontSize:'clamp(36px,6vw,64px)', fontWeight:800, color:'#F8FAFC', lineHeight:1.1, margin:'0 0 20px', letterSpacing:'-1.5px' }}>
            Where is AI ready<br/>
            <span style={{ color:'rgba(255,255,255,0.2)', fontStyle:'italic', fontWeight:400 }}>in your organisation?</span>
          </h1>
          <p style={{ fontSize:17, color:'rgba(255,255,255,0.4)', lineHeight:1.75, maxWidth:540, margin:'0 auto 44px' }}>
            Welcome back, <strong style={{ color:'rgba(255,255,255,0.7)' }}>{session.name}</strong>. A function-by-function AI maturity assessment, scored across 6 dimensions and benchmarked by industry.
          </p>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:14, maxWidth:620, margin:'0 auto 44px' }}>
            {[
              { icon:'◈', title:'25 Functions', sub:'Finance · HR · IT · Sales · Operations' },
              { icon:'⬡', title:'6 Dimensions', sub:'Data · Tech · Talent · Governance' },
              { icon:'🔒', title:'100% Private', sub:'All data stays in your browser.' },
            ].map(c => (
              <div key={c.title} style={{ border:'1px solid rgba(255,255,255,0.07)', borderRadius:14, padding:'20px 16px' }}>
                <div style={{ fontSize:22, marginBottom:8, color:'rgba(255,255,255,0.25)' }}>{c.icon}</div>
                <div style={{ fontSize:13, fontWeight:700, color:'#F8FAFC', marginBottom:4 }}>{c.title}</div>
                <div style={{ fontSize:11, color:'rgba(255,255,255,0.22)', lineHeight:1.5 }}>{c.sub}</div>
              </div>
            ))}
          </div>
          {assessmentSaved && (
            <div style={{ background:'rgba(5,150,105,0.15)', border:'1px solid rgba(5,150,105,0.4)', borderRadius:12, padding:'16px 24px', marginBottom:20, textAlign:'center' }}>
              <div style={{ fontSize:22, marginBottom:4 }}>🔒</div>
              <div style={{ fontSize:15, fontWeight:700, color:'#34D399', marginBottom:4 }}>Assessment Submitted & Locked</div>
              <div style={{ fontSize:12, color:'rgba(255,255,255,0.5)' }}>Your responses are final. Contact your admin to re-open.</div>
            </div>
          )}
          <div style={{ display:'flex', gap:12, justifyContent:'center', flexWrap:'wrap' }}>
            {assessmentSaved ? (
              <button onClick={() => setPage('report')} style={{ background:'linear-gradient(135deg,#059669,#047857)', border:'none', borderRadius:12, padding:'14px 44px', fontSize:15, fontWeight:700, color:'#fff', cursor:'pointer', letterSpacing:'-0.3px', boxShadow:'0 4px 20px rgba(5,150,105,0.4)' }}>
                View Submitted Report →
              </button>
            ) : config.org ? (
              <button onClick={() => setPage('assess')} style={{ background:'#6366F1', border:'none', borderRadius:12, padding:'14px 44px', fontSize:15, fontWeight:700, color:'#fff', cursor:'pointer', letterSpacing:'-0.3px', boxShadow:'0 4px 20px rgba(99,102,241,0.4)' }}>
                {totalAnswered > 0 ? `Continue Assessment (${pctComplete}% done)` : 'Start Assessment →'}
              </button>
            ) : (
              <button onClick={() => setPage('setup')} style={{ background:'#6366F1', border:'none', borderRadius:12, padding:'14px 44px', fontSize:15, fontWeight:700, color:'#fff', cursor:'pointer', letterSpacing:'-0.3px', boxShadow:'0 4px 20px rgba(99,102,241,0.4)' }}>
                Setup Organisation →
              </button>
            )}
            {!assessmentSaved && totalAnswered >= 10 && (
              <button onClick={() => setPage('report')} style={{ background:'transparent', border:'1px solid rgba(255,255,255,0.15)', borderRadius:12, padding:'14px 28px', fontSize:14, fontWeight:600, color:'rgba(255,255,255,0.6)', cursor:'pointer' }}>
                Preview Report →
              </button>
            )}
          </div>
          {qbError && <div style={{ marginTop:24, fontSize:12, color:'#EF4444', background:'rgba(239,68,68,0.1)', padding:'8px 16px', borderRadius:8 }}>{qbError}</div>}
          {qbLoading && <div style={{ marginTop:20, fontSize:12, color:'rgba(255,255,255,0.25)' }}>Loading question bank…</div>}
        </div>
      </div>
      {toast && <Toast {...toast}/>}
    </div>
  )

  // ── SETUP PAGE ────────────────────────────────────────────────────────────
  if (page === 'setup') return (
    <div style={{ minHeight:'100vh', background:COLORS.surface, fontFamily:"'Segoe UI', Inter, system-ui, sans-serif" }}>
      <TopNav/>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'center', padding:'40px 20px', minHeight:'calc(100vh - 52px)' }}>
        <div style={{ maxWidth:540, width:'100%', background:'#fff', borderRadius:20, boxShadow:'0 20px 60px rgba(0,0,0,0.08)', padding:'40px' }}>
          <button onClick={() => setPage('welcome')} style={{ fontSize:12, color:COLORS.muted, background:'none', border:'none', cursor:'pointer', padding:'0 0 20px', letterSpacing:1 }}>← Back</button>
          <h2 style={{ fontSize:26, fontWeight:800, color:COLORS.text, margin:'0 0 8px', letterSpacing:'-0.5px' }}>Organisation Profile</h2>
          <p style={{ fontSize:13, color:COLORS.muted, margin:'0 0 28px', lineHeight:1.6 }}>Calibrates industry benchmarks, regulatory overlays and function-specific questions. All data stays local.</p>

          {[{ k:'org', l:'Organisation Name', ph:'e.g. Acme Corporation' }, { k:'role', l:'Your Role', ph:'e.g. Chief Information Officer' }].map(f => (
            <div key={f.k} style={{ marginBottom:16 }}>
              <label style={{ display:'block', fontSize:11, fontWeight:700, color:COLORS.text, marginBottom:6, textTransform:'uppercase', letterSpacing:1 }}>{f.l}</label>
              <input value={config[f.k]||''} onChange={e => setConfig(c => ({...c, [f.k]:e.target.value}))} placeholder={f.ph}
                style={{ width:'100%', padding:'11px 14px', border:`1.5px solid ${COLORS.border}`, borderRadius:10, fontSize:14, fontFamily:'inherit', outline:'none', boxSizing:'border-box', color:COLORS.text }}/>
            </div>
          ))}

          {[{ k:'industry', l:'Industry Sector', opts:INDUSTRIES }, { k:'size', l:'Organisation Size', opts:ORG_SIZES.map(s=>s.label) }].map(f => (
            <div key={f.k} style={{ marginBottom:16 }}>
              <label style={{ display:'block', fontSize:11, fontWeight:700, color:COLORS.text, marginBottom:6, textTransform:'uppercase', letterSpacing:1 }}>{f.l}</label>
              <select value={config[f.k]||''} onChange={e => setConfig(c => ({...c, [f.k]:e.target.value}))}
                style={{ width:'100%', padding:'11px 14px', border:`1.5px solid ${COLORS.border}`, borderRadius:10, fontSize:14, fontFamily:'inherit', outline:'none', background:'#fff', color:COLORS.text }}>
                <option value="">Select…</option>
                {f.opts.map(o => <option key={o}>{o}</option>)}
              </select>
            </div>
          ))}

          <div style={{ marginBottom:16 }}>
            <label style={{ display:'block', fontSize:11, fontWeight:700, color:COLORS.text, marginBottom:6, textTransform:'uppercase', letterSpacing:1 }}>Primary Region</label>
            <select value={config.region||''} onChange={e => setConfig(c => ({...c, region:e.target.value}))}
              style={{ width:'100%', padding:'11px 14px', border:`1.5px solid ${COLORS.border}`, borderRadius:10, fontSize:14, fontFamily:'inherit', outline:'none', background:'#fff', color:COLORS.text }}>
              <option value="">Select…</option>
              {REGIONS.map(r => <option key={r.id} value={r.id}>{r.label}</option>)}
            </select>
          </div>

          <div style={{ marginBottom:20 }}>
            <label style={{ display:'block', fontSize:11, fontWeight:700, color:COLORS.text, marginBottom:10, textTransform:'uppercase', letterSpacing:1 }}>Assessment Level</label>
            <div style={{ display:'flex', gap:10 }}>
              {LEVELS.map(l => (
                <button key={l} onClick={() => setConfig(c => ({...c, level:l}))}
                  style={{ flex:1, padding:'10px 8px', borderRadius:10, border:`2px solid ${config.level===l ? COLORS.indigo : COLORS.border}`, background:config.level===l ? '#EEF2FF' : '#fff', fontSize:13, fontWeight:700, color:config.level===l ? COLORS.indigo : COLORS.muted, cursor:'pointer' }}>
                  {l}
                </button>
              ))}
            </div>
            <div style={{ fontSize:11, color:COLORS.muted, marginTop:6 }}>Exploring = awareness · Piloting = capability · Scaling = optimisation</div>
          </div>

          <div style={{ marginBottom:28 }}>
            <label style={{ display:'block', fontSize:11, fontWeight:700, color:COLORS.text, marginBottom:4, textTransform:'uppercase', letterSpacing:1 }}>
              Key AI Goals
              <span style={{ textTransform:'none', letterSpacing:0, fontWeight:500, color:COLORS.muted }}> — Select your priorities</span>
            </label>
            <p style={{ fontSize:11, color:COLORS.muted, marginBottom:10, lineHeight:1.5 }}>Drives a personalised, goal-driven roadmap in your assessment report.</p>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
              {AI_GOALS.map(g => {
                const sel = (config.goals || []).includes(g.id)
                return (
                  <button key={g.id} onClick={() => setConfig(c => {
                    const gs = c.goals || []
                    return { ...c, goals: sel ? gs.filter(x => x !== g.id) : [...gs, g.id] }
                  })}
                  style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 12px', border:`2px solid ${sel ? g.color : COLORS.border}`, borderRadius:12, background: sel ? `${g.color}10` : '#fff', cursor:'pointer', textAlign:'left', transition:'all 0.15s' }}>
                    <span style={{ fontSize:15, flexShrink:0, opacity: sel ? 1 : 0.45 }}>{g.icon}</span>
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:12, fontWeight:700, color: sel ? g.color : COLORS.text }}>{g.label}</div>
                      <div style={{ fontSize:10, color:COLORS.muted, lineHeight:1.3 }}>{g.desc}</div>
                    </div>
                    {sel && <span style={{ fontSize:10, color:g.color, fontWeight:900, flexShrink:0, background:`${g.color}22`, borderRadius:4, padding:'1px 5px' }}>✓</span>}
                  </button>
                )
              })}
            </div>
          </div>

          {(() => {
            const canProceed = config.org && config.industry && config.region && config.size
            return (
              <button onClick={() => { if (canProceed) setPage('assess') }}
                style={{ width:'100%', padding:'14px', border:'none', borderRadius:12, fontSize:15, fontWeight:700, cursor:canProceed ? 'pointer' : 'default', background:canProceed ? 'linear-gradient(135deg, #6366F1, #4F46E5)' : COLORS.border, color:canProceed ? '#fff' : COLORS.muted, boxShadow:canProceed ? '0 4px 14px rgba(99,102,241,0.35)' : 'none' }}>
                Begin Assessment →
              </button>
            )
          })()}
        </div>
      </div>
      {toast && <Toast {...toast}/>}
    </div>
  )

  // ── ASSESS PAGE ───────────────────────────────────────────────────────────
  if (page === 'assess') {
    const practice = PRACTICES.find(p => p.id === activePractice)
    const practiceScore = fnScores[activePractice]
    const domainGroups = ['Business','Technology','Operations']

    return (
      <div style={{ minHeight:'100vh', background:COLORS.surface, fontFamily:"'Segoe UI', Inter, system-ui, sans-serif" }}>
        <TopNav/>
        <div style={{ display:'flex', maxWidth:1400, margin:'0 auto' }}>
          {/* Sidebar */}
          <div style={{ width:252, flexShrink:0, borderRight:`1px solid ${COLORS.border}`, background:'#fff', minHeight:'calc(100vh - 52px)', overflowY:'auto', position:'sticky', top:52, maxHeight:'calc(100vh - 52px)' }}>
            <div style={{ padding:'12px 12px 4px', borderBottom:`1px solid ${COLORS.border}` }}>
              <button onClick={() => setPage('welcome')} style={{ fontSize:11, color:COLORS.muted, background:'none', border:'none', cursor:'pointer', padding:'4px 0' }}>← Home</button>
            </div>
            {domainGroups.map(domain => (
              <div key={domain}>
                <div style={{ padding:'10px 14px 3px', fontSize:9, fontWeight:700, color:COLORS.muted, textTransform:'uppercase', letterSpacing:1.5 }}>{domain}</div>
                {PRACTICES.filter(p => p.domain === domain).map(p => {
                  const ps = fnScores[p.id]
                  const score = ps?.overall
                  const m = score ? getMaturity(score) : null
                  const isActive = activePractice === p.id
                  const answeredCount = ps?.answeredCount || 0
                  const totalCount = ps?.totalCount || 0
                  return (
                    <button key={p.id} onClick={() => setActivePractice(p.id)}
                      style={{ width:'100%', textAlign:'left', padding:'7px 14px', background:isActive ? '#EEF2FF' : 'transparent', border:'none', borderLeft:`2px solid ${isActive ? COLORS.indigo : 'transparent'}`, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'space-between', gap:6 }}>
                      <span style={{ fontSize:12, color:isActive ? COLORS.indigo : COLORS.text, fontWeight:isActive ? 700 : 400, lineHeight:1.3, flex:1 }}>{p.name}</span>
                      {score ? (
                        <span style={{ fontSize:11, fontWeight:700, color:m?.color, flexShrink:0 }}>{score.toFixed(1)}</span>
                      ) : answeredCount > 0 ? (
                        <span style={{ fontSize:9, color:COLORS.muted, flexShrink:0 }}>{answeredCount}/{totalCount}</span>
                      ) : null}
                    </button>
                  )
                })}
              </div>
            ))}
            {/* Save / Lock button */}
            <div style={{ padding:'12px 14px', borderTop:`1px solid ${COLORS.border}`, marginTop:8 }}>
              {assessmentSaved ? (
                <div style={{ background:'rgba(5,150,105,0.12)', border:'1px solid rgba(5,150,105,0.35)', borderRadius:8, padding:'9px 10px', textAlign:'center' }}>
                  <div style={{ fontSize:11, fontWeight:700, color:'#34D399' }}>🔒 Submitted & Locked</div>
                  <div style={{ fontSize:9, color:'rgba(255,255,255,0.35)', marginTop:2 }}>Read-only mode</div>
                </div>
              ) : (
                <>
                  {totalAnswered >= 10 && (
                    <button onClick={() => { handleSaveAssessment(); setPage('report') }}
                      style={{ width:'100%', padding:'9px', background:'linear-gradient(135deg, #6366F1, #4F46E5)', border:'none', borderRadius:8, fontSize:12, fontWeight:700, color:'#fff', cursor:'pointer', marginBottom:6 }}>
                      Submit & View Report
                    </button>
                  )}
                  <button onClick={() => setPage('report')} disabled={totalAnswered < 10}
                    style={{ width:'100%', padding:'7px', background:'none', border:`1px solid ${COLORS.border}`, borderRadius:8, fontSize:11, color:totalAnswered >= 10 ? COLORS.indigo : COLORS.muted, cursor:totalAnswered >= 10 ? 'pointer' : 'default' }}>
                    Preview Report {totalAnswered >= 10 ? '→' : `(need ${10 - totalAnswered} more)`}
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Main question area */}
          <div style={{ flex:1, padding:'24px 28px', overflowY:'auto' }}>
            {/* Function header */}
            <div style={{ marginBottom:20, paddingBottom:16, borderBottom:`1px solid ${COLORS.border}` }}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:10 }}>
                <div>
                  <div style={{ fontSize:10, color:COLORS.muted, textTransform:'uppercase', letterSpacing:2, marginBottom:4 }}>{practice?.domain}</div>
                  <h2 style={{ fontSize:22, fontWeight:800, color:COLORS.text, margin:0, letterSpacing:'-0.4px' }}>{practice?.name}</h2>
                </div>
                {practiceScore?.overall && (
                  <div style={{ textAlign:'right' }}>
                    <div style={{ fontSize:24, fontWeight:800, color:getMaturity(practiceScore.overall).color }}>{practiceScore.overall.toFixed(2)}</div>
                    <MaturityBadge score={practiceScore.overall}/>
                  </div>
                )}
              </div>
              {/* Dim scores mini-bars */}
              {practiceScore?.overall && (
                <div style={{ display:'flex', gap:10, marginTop:12, flexWrap:'wrap' }}>
                  {DIM_KEYS.map(k => {
                    const s = practiceScore.dimScores?.[k]
                    if (!s) return null
                    return (
                      <div key={k} style={{ flex:1, minWidth:80 }}>
                        <div style={{ display:'flex', justifyContent:'space-between', fontSize:9, color:COLORS.muted, marginBottom:3 }}>
                          <span style={{ fontWeight:700, color:DIMS[k].color }}>{k}</span>
                          <span>{s.toFixed(1)}</span>
                        </div>
                        <ScoreBar score={s} color={DIMS[k].color}/>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Locked banner */}
            {assessmentSaved && (
              <div style={{ display:'flex', alignItems:'center', gap:12, background:'rgba(5,150,105,0.12)', border:'1px solid rgba(5,150,105,0.35)', borderRadius:10, padding:'12px 16px', marginBottom:20 }}>
                <span style={{ fontSize:20 }}>🔒</span>
                <div>
                  <div style={{ fontSize:13, fontWeight:700, color:'#34D399' }}>Assessment Submitted & Locked</div>
                  <div style={{ fontSize:11, color:'rgba(255,255,255,0.45)' }}>Your answers are read-only. Contact your admin to re-open.</div>
                </div>
              </div>
            )}

            {/* Questions */}
            {qbLoading ? (
              <div style={{ textAlign:'center', padding:'60px 20px', color:COLORS.muted, fontSize:14 }}>Loading question bank…</div>
            ) : qbError ? (
              <div style={{ padding:'20px', background:'#FEF2F2', border:'1px solid #FCA5A5', borderRadius:10, fontSize:13, color:'#DC2626' }}>{qbError}</div>
            ) : practiceQs.length === 0 ? (
              <div style={{ textAlign:'center', padding:'60px 20px', color:COLORS.muted }}>
                <div style={{ fontSize:32, marginBottom:12 }}>📋</div>
                <div style={{ fontSize:14, fontWeight:600, marginBottom:4 }}>No questions loaded</div>
                <div style={{ fontSize:12 }}>Place ai-question-bank.xlsx in /public and restart, or check the level filter.</div>
              </div>
            ) : (
              <div>
                {practiceQs.map((q, idx) => {
                  const ans = answers[q.questionId]
                  return (
                    <div key={q.questionId} style={{ marginBottom:12, padding:'16px 18px', background:'#fff', border:`1.5px solid ${ans ? COLORS.indigo + '40' : COLORS.border}`, borderRadius:12, transition:'border-color 0.15s' }}>
                      <div style={{ display:'flex', gap:12, alignItems:'flex-start' }}>
                        <span style={{ fontSize:11, color:COLORS.muted, fontFamily:'monospace', flexShrink:0, marginTop:1 }}>{String(idx+1).padStart(2,'0')}</span>
                        <div style={{ flex:1 }}>
                          <div style={{ fontSize:13, color:COLORS.text, lineHeight:1.6, marginBottom:10 }}>{q.text}</div>
                          <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
                            {(['Yes','Partial','No']).map(opt => (
                              <button key={opt}
                                onClick={() => handleAnswer(q.questionId, opt)}
                                disabled={assessmentSaved}
                                style={{
                                  padding:'6px 16px', borderRadius:8, border:`1.5px solid ${ans===opt ? (opt==='Yes'?'#059669':opt==='Partial'?'#D97706':'#DC2626') : COLORS.border}`,
                                  background: ans===opt ? (opt==='Yes'?'#DCFCE7':opt==='Partial'?'#FEF3C7':'#FEE2E2') : '#fff',
                                  color: ans===opt ? (opt==='Yes'?'#059669':opt==='Partial'?'#D97706':'#DC2626') : COLORS.muted,
                                  fontSize:12, fontWeight:600,
                                  cursor: assessmentSaved ? 'default' : 'pointer',
                                  opacity: assessmentSaved && !ans ? 0.4 : 1,
                                  transition:'all 0.12s',
                                }}>
                                {opt}
                              </button>
                            ))}
                          </div>
                        </div>
                        {/* Dimension tags */}
                        <div style={{ display:'flex', flexWrap:'wrap', gap:3, maxWidth:90, flexShrink:0 }}>
                          {DIM_KEYS.filter(k => q.dims[k] > 0).map(k => (
                            <span key={k} style={{ fontSize:8, background:`${DIMS[k].color}20`, color:DIMS[k].color, borderRadius:4, padding:'1px 5px', fontWeight:700 }}>{k}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
        {toast && <Toast {...toast}/>}
      </div>
    )
  }

  // ── REPORT PAGE ───────────────────────────────────────────────────────────
  if (page === 'report') {
    return (
      <>
        {pdfProgress && (
          <div style={{ position:'fixed', inset:0, background:'rgba(8,9,12,0.85)', zIndex:9999, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center' }}>
            <div style={{ background:'#16181F', border:'1px solid rgba(255,255,255,0.08)', borderRadius:16, padding:'32px 40px', textAlign:'center', maxWidth:380 }}>
              <div style={{ width:44, height:44, border:'3px solid #6366F1', borderTopColor:'transparent', borderRadius:'50%', margin:'0 auto 16px', animation:'spin 0.9s linear infinite' }}/>
              <div style={{ fontSize:14, fontWeight:700, color:'#F8FAFC', marginBottom:6 }}>Generating Report</div>
              <div style={{ fontSize:12, color:'#94A3B8', lineHeight:1.6 }}>{pdfProgress}</div>
            </div>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        )}
        <UserReport
          config={config}
          fnScores={fnScores}
          orgDimScores={orgDimScores}
          orgOverall={orgOverall}
          session={session}
          isAdmin={session?.role === 'admin'}
          onBack={() => setPage(config.org ? 'assess' : 'welcome')}
          onDownloadPDF={session?.role === 'admin' ? handleDownloadPDF : null}
        />
        {toast && <Toast {...toast}/>}
      </>
    )
  }

  return null
}
