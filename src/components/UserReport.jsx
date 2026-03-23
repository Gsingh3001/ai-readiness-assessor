/**
 * UserReport.jsx — User Summary Report
 * AI Readiness Assessment Platform
 * Author:  Gagandeep Singh | AI Practice
 * Version: 1.0.0
 *
 * Accessible to all users after completing ≥10 questions.
 * Includes: overall AI maturity score, 6-dimension radar (SVG),
 * function heatmap, top opportunities, gaps, 3-phase roadmap.
 * Full print CSS for browser-to-PDF saving.
 */

import { useState, useEffect, useRef, useMemo } from 'react'

// ─── Constants ────────────────────────────────────────────────────────────────
const DIMS = {
  DQ: { label: 'Data Quality',       color: '#6366F1', weight: 0.25 },
  TR: { label: 'Tech Readiness',      color: '#0EA5E9', weight: 0.20 },
  TS: { label: 'Talent & Skills',     color: '#F59E0B', weight: 0.20 },
  GE: { label: 'Governance & Ethics', color: '#EF4444', weight: 0.15 },
  CR: { label: 'Change Readiness',    color: '#F97316', weight: 0.10 },
  VR: { label: 'Value & ROI',         color: '#10B981', weight: 0.10 },
}
const DIM_KEYS = Object.keys(DIMS)

const PRACTICES = [
  { id:'finance',         name:'Finance & Accounting',        domain:'Business' },
  { id:'hr',              name:'Human Resources',             domain:'Business' },
  { id:'sales',           name:'Sales & Revenue',             domain:'Business' },
  { id:'marketing',       name:'Marketing & CX',              domain:'Business' },
  { id:'legal',           name:'Legal & Compliance',          domain:'Business' },
  { id:'procurement',     name:'Procurement & Sourcing',      domain:'Business' },
  { id:'strategy',        name:'Strategy & Planning',         domain:'Business' },
  { id:'risk',            name:'Risk Management',             domain:'Business' },
  { id:'customerservice', name:'Customer Service',            domain:'Business' },
  { id:'corpgovernance',  name:'Corporate Governance',        domain:'Business' },
  { id:'it',              name:'IT & Infrastructure',         domain:'Technology' },
  { id:'softwaredev',     name:'Software Development',        domain:'Technology' },
  { id:'data',            name:'Data & Analytics',            domain:'Technology' },
  { id:'cybersecurity',   name:'Cybersecurity',               domain:'Technology' },
  { id:'itsm',            name:'IT Service Management',       domain:'Technology' },
  { id:'cloud',           name:'Cloud & Platform',            domain:'Technology' },
  { id:'network',         name:'Network & Communications',    domain:'Technology' },
  { id:'digitalworkplace',name:'Digital Workplace',           domain:'Technology' },
  { id:'supplychain',     name:'Supply Chain & Logistics',    domain:'Operations' },
  { id:'manufacturing',   name:'Manufacturing & Production',  domain:'Operations' },
  { id:'qualityassurance',name:'Quality Assurance',           domain:'Operations' },
  { id:'facilities',      name:'Facilities & Property',       domain:'Operations' },
  { id:'healthsafety',    name:'Health & Safety',             domain:'Operations' },
  { id:'environmental',   name:'Environmental & Sustainability', domain:'Operations' },
  { id:'fieldservice',    name:'Field Service',               domain:'Operations' },
]

const MATURITY = [
  { min: 1.0, max: 1.8, label: 'AI Unaware',  color: '#DC2626', bg: '#FEF2F2' },
  { min: 1.8, max: 2.6, label: 'AI Exploring', color: '#EA580C', bg: '#FFF7ED' },
  { min: 2.6, max: 3.4, label: 'AI Piloting',  color: '#D97706', bg: '#FFFBEB' },
  { min: 3.4, max: 4.2, label: 'AI Scaling',   color: '#2563EB', bg: '#EFF6FF' },
  { min: 4.2, max: 5.1, label: 'AI-Native',    color: '#059669', bg: '#F0FDF4' },
]

function getMaturity(score) {
  return MATURITY.find(m => score >= m.min && score < m.max) || MATURITY[0]
}

// ─── Animated Counter ─────────────────────────────────────────────────────────
function AnimatedScore({ target, duration = 1200 }) {
  const [val, setVal] = useState(1.0)
  useEffect(() => {
    let start = null
    const from = 1.0
    function step(ts) {
      if (!start) start = ts
      const progress = Math.min((ts - start) / duration, 1)
      const ease = 1 - Math.pow(1 - progress, 3)
      setVal(from + (target - from) * ease)
      if (progress < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [target])
  return <>{val.toFixed(2)}</>
}

// ─── SVG Radar Chart ──────────────────────────────────────────────────────────
function RadarSVG({ dimScores, size = 280 }) {
  const cx = size / 2, cy = size / 2, r = size * 0.36
  const n = DIM_KEYS.length
  const angle = i => (i / n) * 2 * Math.PI - Math.PI / 2

  const pt = (i, frac) => ({
    x: cx + Math.cos(angle(i)) * r * frac,
    y: cy + Math.sin(angle(i)) * r * frac,
  })

  const scorePts = DIM_KEYS.map((k, i) => {
    const s = Math.max(0, Math.min(1, ((dimScores[k] || 1) - 1) / 4))
    return pt(i, Math.max(0.05, s))
  })

  const [animated, setAnimated] = useState(false)
  useEffect(() => { setTimeout(() => setAnimated(true), 100) }, [])

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {[0.25, 0.5, 0.75, 1.0].map(frac => (
        <polygon key={frac}
          points={DIM_KEYS.map((_, i) => { const p = pt(i, frac); return `${p.x},${p.y}` }).join(' ')}
          fill="none" stroke="#E2E8F0" strokeWidth="0.8" />
      ))}
      {DIM_KEYS.map((_, i) => {
        const p = pt(i, 1)
        return <line key={i} x1={cx} y1={cy} x2={p.x} y2={p.y} stroke="#E2E8F0" strokeWidth="0.8" />
      })}
      <polygon
        points={scorePts.map(p => `${p.x},${p.y}`).join(' ')}
        fill="rgba(99,102,241,0.15)"
        stroke="#6366F1"
        strokeWidth="2"
        style={{ strokeDasharray: animated ? 'none' : 1000, strokeDashoffset: animated ? 0 : 1000, transition: 'stroke-dashoffset 1.5s ease-out' }}
      />
      {DIM_KEYS.map((k, i) => {
        const p = scorePts[i]
        return <circle key={k} cx={p.x} cy={p.y} r={5} fill={DIMS[k].color} stroke="#fff" strokeWidth={1.5} />
      })}
      {DIM_KEYS.map((k, i) => {
        const lp = pt(i, 1.28)
        return (
          <text key={k} x={lp.x} y={lp.y} textAnchor="middle" dominantBaseline="central"
            fontSize="10" fontFamily="'Segoe UI',system-ui,sans-serif" fill={DIMS[k].color} fontWeight="700">
            {k}
          </text>
        )
      })}
    </svg>
  )
}

// ─── Function Heatmap ─────────────────────────────────────────────────────────
function FunctionHeatmap({ fnScores }) {
  const domains = ['Business', 'Technology', 'Operations']
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
      {domains.map(domain => (
        <div key={domain}>
          <div style={{ fontSize: 10, fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 8 }}>{domain}</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {PRACTICES.filter(p => p.domain === domain).map((p, idx) => {
              const data = fnScores[p.id]
              const s = data?.overall
              const m = s ? getMaturity(s) : null
              const delay = idx * 50
              return (
                <div key={p.id} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  background: m ? `${m.color}12` : '#F1F5F9',
                  border: `1px solid ${m ? m.color + '30' : '#E2E8F0'}`,
                  borderRadius: 7, padding: '6px 10px',
                  animation: `fadeIn 0.3s ease ${delay}ms both`,
                }}>
                  <span style={{ fontSize: 11, color: '#374151', flex: 1, marginRight: 8, lineHeight: 1.3 }}>{p.name}</span>
                  <span style={{ fontSize: 12, fontWeight: 800, color: m ? m.color : '#94A3B8', flexShrink: 0, minWidth: 32, textAlign: 'right' }}>
                    {s ? s.toFixed(1) : '—'}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}

// ─── Score Progress Bar ───────────────────────────────────────────────────────
function ScoreBar({ score, color, animate = true }) {
  const pct = score ? Math.round(((score - 1) / 4) * 100) : 0
  return (
    <div style={{ height: 6, background: '#E2E8F0', borderRadius: 100, overflow: 'hidden' }}>
      <div style={{ height: '100%', width: animate ? `${pct}%` : 0, background: color, borderRadius: 100, transition: 'width 0.8s ease' }} />
    </div>
  )
}

// ─── Generate Insights from Scores ───────────────────────────────────────────
function generateInsights(fnScores, orgDimScores, orgOverall) {
  const sorted = PRACTICES
    .map(p => ({ ...p, score: fnScores[p.id]?.overall }))
    .filter(p => p.score != null)
    .sort((a, b) => b.score - a.score)

  const opportunities = sorted
    .filter(p => p.score >= 3.0)
    .slice(0, 3)
    .map(p => ({
      function: p.name,
      action: `Deploy AI in ${p.name} — strong data and tech readiness support quick activation`,
      impact: 'High',
    }))

  const gaps = sorted
    .filter(p => p.score < 2.6)
    .slice(-3)
    .reverse()
    .map(p => ({
      function: p.name,
      action: `Build AI foundations in ${p.name} — address data quality and skills gaps before deployment`,
      severity: 'Critical',
    }))

  const weakestDim = DIM_KEYS.reduce((a, b) => (orgDimScores[a] || 1) < (orgDimScores[b] || 1) ? a : b)
  const strongestDim = DIM_KEYS.reduce((a, b) => (orgDimScores[a] || 1) > (orgDimScores[b] || 1) ? a : b)

  return { opportunities, gaps, weakestDim, strongestDim }
}

// ─── Phase Roadmap ────────────────────────────────────────────────────────────
function Roadmap({ fnScores, orgSize }) {
  const sorted = PRACTICES
    .map(p => ({ ...p, score: fnScores[p.id]?.overall }))
    .filter(p => p.score != null)
    .sort((a, b) => b.score - a.score)

  const quickWins = sorted.filter(p => p.score >= 3.4).slice(0, 4)
  const foundation = sorted.filter(p => p.score >= 2.0 && p.score < 3.4).slice(0, 4)
  const scale = sorted.filter(p => p.score < 2.0).slice(0, 4)

  const investBand = {
    startup: ['£20k–£80k', '£80k–£250k', '£250k–£600k'],
    sme: ['£50k–£150k', '£150k–£500k', '£500k–£1.5M'],
    midmarket: ['£100k–£400k', '£400k–£1.2M', '£1.2M–£4M'],
    enterprise: ['£300k–£1M', '£1M–£4M', '£4M–£12M'],
    global: ['£600k–£2M', '£2M–£8M', '£8M–£25M'],
  }
  const band = investBand[orgSize] || investBand['midmarket']

  const phases = [
    { label: 'Phase 1', title: 'Quick Wins', timeframe: '0–3 months', color: '#10B981', bg: '#F0FDF4', functions: quickWins, invest: band[0] },
    { label: 'Phase 2', title: 'Foundation Build', timeframe: '3–12 months', color: '#6366F1', bg: '#EEF2FF', functions: foundation, invest: band[1] },
    { label: 'Phase 3', title: 'Scale & Differentiate', timeframe: '12–24 months', color: '#0EA5E9', bg: '#F0F9FF', functions: scale, invest: band[2] },
  ]

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
      {phases.map(ph => (
        <div key={ph.label} style={{ border: `1.5px solid ${ph.color}40`, borderRadius: 12, overflow: 'hidden' }}>
          <div style={{ background: ph.bg, padding: '12px 16px', borderBottom: `1px solid ${ph.color}25` }}>
            <div style={{ fontSize: 10, color: ph.color, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 2 }}>{ph.label}</div>
            <div style={{ fontSize: 14, fontWeight: 800, color: '#0F172A' }}>{ph.title}</div>
            <div style={{ fontSize: 11, color: '#64748B', marginTop: 1 }}>{ph.timeframe}</div>
          </div>
          <div style={{ padding: '12px 14px' }}>
            {ph.functions.length === 0 ? (
              <div style={{ fontSize: 11, color: '#94A3B8', fontStyle: 'italic' }}>No functions in this phase</div>
            ) : (
              ph.functions.map(f => (
                <div key={f.id} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 5 }}>
                  <div style={{ width: 5, height: 5, borderRadius: '50%', background: ph.color, flexShrink: 0 }} />
                  <span style={{ fontSize: 11, color: '#374151' }}>{f.name}</span>
                </div>
              ))
            )}
            <div style={{ marginTop: 10, paddingTop: 8, borderTop: '1px solid #F1F5F9', fontSize: 11, color: ph.color, fontWeight: 700 }}>
              Est. Investment: {ph.invest}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

// ─── Main User Report ─────────────────────────────────────────────────────────
export default function UserReport({ config, fnScores, orgDimScores, orgOverall, onBack, session, onDownloadPDF, isAdmin }) {
  const m = getMaturity(orgOverall || 1)
  const { opportunities, gaps, weakestDim, strongestDim } = useMemo(
    () => generateInsights(fnScores, orgDimScores, orgOverall),
    [fnScores, orgDimScores, orgOverall]
  )

  const [barsVisible, setBarsVisible] = useState(false)
  useEffect(() => { setTimeout(() => setBarsVisible(true), 400) }, [])

  // Org size from config
  const sizeMap = { 'Startup (< 50)': 'startup', 'SME (50 – 250)': 'sme', 'Mid-Market (250 – 2,000)': 'midmarket', 'Enterprise (2,000 – 10,000)': 'enterprise', 'Global (10,000+)': 'global' }
  const orgSize = sizeMap[config.size] || 'midmarket'
  const dateStr = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        @keyframes fadeIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes countUp { from { opacity: 0; } to { opacity: 1; } }

        @media print {
          * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          body { background: white !important; }
          .no-print { display: none !important; }
          .report-page { page-break-after: always; }
          .report-section { break-inside: avoid; }
        }
      `}</style>

      <div id="user-report-root" style={{ background: '#F8FAFC', fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif", minHeight: '100vh' }}>

        {/* ── Print header (visible only on print) ── */}
        <div className="print-only" style={{ display: 'none' }}>
          <div style={{ padding: '20px 40px', borderBottom: '2px solid #6366F1', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontWeight: 800, fontSize: 16, color: '#0F172A' }}>AI Readiness Assessment Report</div>
            <div style={{ fontSize: 11, color: '#64748B' }}>{config.org} · {dateStr}</div>
          </div>
        </div>

        {/* ── Screen header ── */}
        <div className="no-print" style={{ background: '#fff', borderBottom: '1px solid #E2E8F0', padding: '0 24px', display: 'flex', alignItems: 'center', height: 56, gap: 14, position: 'sticky', top: 0, zIndex: 10 }}>
          <button onClick={onBack} style={{ fontSize: 12, color: '#64748B', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>← Back</button>
          <div style={{ flex: 1 }} />
          <span style={{ fontSize: 11, color: '#94A3B8' }}>AI Readiness Report · {config.org}</span>
          <button onClick={() => window.print()}
            style={{ padding: '7px 16px', background: '#F1F5F9', border: '1px solid #E2E8F0', borderRadius: 8, fontSize: 12, color: '#475569', cursor: 'pointer', fontWeight: 600 }}>
            🖨 Print / Save PDF
          </button>
          {isAdmin && onDownloadPDF && (
            <button onClick={onDownloadPDF}
              style={{ padding: '7px 16px', background: 'linear-gradient(135deg, #6366F1, #4F46E5)', border: 'none', borderRadius: 8, fontSize: 12, color: '#fff', cursor: 'pointer', fontWeight: 700 }}>
              ⬇ Full PDF Report
            </button>
          )}
        </div>

        <div style={{ maxWidth: 1080, margin: '0 auto', padding: '32px 24px' }}>

          {/* ── SECTION 1: HERO SCORE ── */}
          <div className="report-page" style={{ background: '#fff', borderRadius: 16, padding: '36px 40px', marginBottom: 20, boxShadow: '0 2px 12px rgba(0,0,0,0.05)', display: 'flex', gap: 40, alignItems: 'center', flexWrap: 'wrap' }}>
            {/* Score circle */}
            <div style={{ textAlign: 'center', flexShrink: 0 }}>
              <svg width={150} height={150} viewBox="0 0 150 150">
                <circle cx="75" cy="75" r="60" fill="none" stroke="#E2E8F0" strokeWidth="12" />
                <circle cx="75" cy="75" r="60" fill="none" stroke={m.color} strokeWidth="12"
                  strokeDasharray={`${((orgOverall - 1) / 4) * 376.8} 376.8`}
                  strokeLinecap="round"
                  transform="rotate(-90 75 75)"
                  style={{ transition: 'stroke-dasharray 1.2s ease-out' }}
                />
                <text x="75" y="68" textAnchor="middle" fontSize="28" fontWeight="800" fill={m.color} fontFamily="Inter,sans-serif">
                  <AnimatedScore target={orgOverall || 1} />
                </text>
                <text x="75" y="88" textAnchor="middle" fontSize="11" fill="#94A3B8" fontFamily="Inter,sans-serif">/5.0</text>
              </svg>
              <div style={{ marginTop: 8 }}>
                <span style={{ background: m.bg, color: m.color, border: `1px solid ${m.color}40`, borderRadius: 100, padding: '5px 16px', fontSize: 13, fontWeight: 700 }}>
                  {m.label}
                </span>
              </div>
            </div>

            {/* Summary text */}
            <div style={{ flex: 1, minWidth: 240 }}>
              <div style={{ fontSize: 11, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 6 }}>AI Readiness Assessment</div>
              <h1 style={{ fontSize: 28, fontWeight: 800, color: '#0F172A', margin: '0 0 8px', lineHeight: 1.2 }}>{config.org}</h1>
              <p style={{ fontSize: 14, color: '#475569', margin: '0 0 16px', lineHeight: 1.7 }}>
                {config.industry} · {config.size} · {dateStr}
              </p>
              <p style={{ fontSize: 14, color: '#374151', margin: 0, lineHeight: 1.75 }}>
                {m.label === 'AI Unaware' && 'No meaningful AI capability exists. Foundational investment in data, infrastructure, and skills is required before any AI adoption can be considered.'}
                {m.label === 'AI Exploring' && 'Early awareness and isolated AI experiments are underway. No coordinated strategy exists. Prioritise a data foundation and executive sponsorship.'}
                {m.label === 'AI Piloting' && 'Targeted AI pilots are underway across select functions. Foundations are being built. Ready to scale in high-readiness areas with governance guardrails.'}
                {m.label === 'AI Scaling' && 'Multiple AI deployments are delivering measurable value. Focus now on scaling governance, cross-function integration, and competitive differentiation.'}
                {m.label === 'AI-Native' && 'AI is embedded across functions with proprietary data advantages. Focus on responsible AI leadership, ecosystem partnerships, and innovation at the frontier.'}
              </p>
            </div>

            {/* Radar */}
            <div style={{ flexShrink: 0 }}>
              <RadarSVG dimScores={orgDimScores} size={200} />
            </div>
          </div>

          {/* ── SECTION 2: DIMENSION SCORES ── */}
          <div className="report-section" style={{ background: '#fff', borderRadius: 16, padding: '28px 32px', marginBottom: 20, boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
            <h2 style={{ fontSize: 16, fontWeight: 800, color: '#0F172A', margin: '0 0 20px' }}>6-Dimension AI Readiness Profile</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14 }}>
              {DIM_KEYS.map(k => {
                const s = orgDimScores[k]
                const m2 = s ? getMaturity(s) : null
                const pct = s ? Math.round(((s - 1) / 4) * 100) : 0
                return (
                  <div key={k} style={{ padding: '14px 16px', background: '#F8FAFC', borderRadius: 10, border: '1px solid #E2E8F0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                      <div>
                        <span style={{ fontSize: 11, fontWeight: 700, color: '#0F172A' }}>{DIMS[k].label}</span>
                        <span style={{ fontSize: 9, color: '#94A3B8', marginLeft: 6, textTransform: 'uppercase', letterSpacing: 1 }}>{k}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        {m2 && <span style={{ fontSize: 10, color: m2.color, fontWeight: 600 }}>{m2.label}</span>}
                        <span style={{ fontSize: 14, fontWeight: 800, color: DIMS[k].color }}>{s ? s.toFixed(2) : '—'}</span>
                      </div>
                    </div>
                    <div style={{ height: 6, background: '#E2E8F0', borderRadius: 100, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: barsVisible ? `${pct}%` : 0, background: DIMS[k].color, borderRadius: 100, transition: 'width 0.8s ease' }} />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* ── SECTION 3: FUNCTION HEATMAP ── */}
          <div className="report-section" style={{ background: '#fff', borderRadius: 16, padding: '28px 32px', marginBottom: 20, boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
            <h2 style={{ fontSize: 16, fontWeight: 800, color: '#0F172A', margin: '0 0 6px' }}>Function Readiness Heatmap</h2>
            <p style={{ fontSize: 12, color: '#64748B', margin: '0 0 20px' }}>Scores across all 25 organisational functions, colour-coded by AI maturity tier.</p>
            <FunctionHeatmap fnScores={fnScores} />
            {/* Legend */}
            <div style={{ display: 'flex', gap: 14, marginTop: 16, flexWrap: 'wrap' }}>
              {MATURITY.map(m3 => (
                <div key={m3.label} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <div style={{ width: 10, height: 10, borderRadius: 2, background: m3.color }} />
                  <span style={{ fontSize: 10, color: '#64748B' }}>{m3.label} ({m3.min.toFixed(1)}–{m3.max.toFixed(1)})</span>
                </div>
              ))}
            </div>
          </div>

          {/* ── SECTION 4: OPPORTUNITIES & GAPS ── */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
            {/* Opportunities */}
            <div className="report-section" style={{ background: '#fff', borderRadius: 16, padding: '24px 26px', boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
              <h3 style={{ fontSize: 14, fontWeight: 800, color: '#0F172A', margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ color: '#10B981', fontSize: 16 }}>↑</span> Top 3 AI Opportunities
              </h3>
              {opportunities.length === 0 ? (
                <p style={{ fontSize: 12, color: '#94A3B8', fontStyle: 'italic' }}>Complete more function assessments to reveal opportunities.</p>
              ) : (
                opportunities.map((o, i) => (
                  <div key={i} style={{ marginBottom: 12, paddingBottom: 12, borderBottom: i < opportunities.length - 1 ? '1px solid #F1F5F9' : 'none' }}>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                      <div style={{ background: '#DCFCE7', color: '#059669', width: 20, height: 20, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, flexShrink: 0 }}>{i + 1}</div>
                      <div>
                        <div style={{ fontSize: 12, fontWeight: 700, color: '#0F172A', marginBottom: 2 }}>{o.function}</div>
                        <div style={{ fontSize: 11, color: '#475569', lineHeight: 1.5 }}>{o.action}</div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Gaps */}
            <div className="report-section" style={{ background: '#fff', borderRadius: 16, padding: '24px 26px', boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
              <h3 style={{ fontSize: 14, fontWeight: 800, color: '#0F172A', margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ color: '#EF4444', fontSize: 16 }}>↓</span> Top 3 Critical Gaps
              </h3>
              {gaps.length === 0 ? (
                <p style={{ fontSize: 12, color: '#94A3B8', fontStyle: 'italic' }}>
                  {Object.keys(fnScores).length === 0 ? 'Complete your assessment to see gaps.' : 'No critical gaps identified — strong overall readiness!'}
                </p>
              ) : (
                gaps.map((g, i) => (
                  <div key={i} style={{ marginBottom: 12, paddingBottom: 12, borderBottom: i < gaps.length - 1 ? '1px solid #F1F5F9' : 'none' }}>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                      <div style={{ background: '#FEE2E2', color: '#DC2626', width: 20, height: 20, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, flexShrink: 0 }}>{i + 1}</div>
                      <div>
                        <div style={{ fontSize: 12, fontWeight: 700, color: '#0F172A', marginBottom: 2 }}>{g.function}</div>
                        <div style={{ fontSize: 11, color: '#475569', lineHeight: 1.5 }}>{g.action}</div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* ── SECTION 5: ROADMAP ── */}
          <div className="report-section" style={{ background: '#fff', borderRadius: 16, padding: '28px 32px', marginBottom: 20, boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
            <h2 style={{ fontSize: 16, fontWeight: 800, color: '#0F172A', margin: '0 0 6px' }}>3-Phase Investment Roadmap</h2>
            <p style={{ fontSize: 12, color: '#64748B', margin: '0 0 20px' }}>Functions ranked by readiness score, sequenced into a 24-month AI transformation programme.</p>
            <Roadmap fnScores={fnScores} orgSize={orgSize} />
          </div>

          {/* ── FOOTER ── */}
          <div style={{ textAlign: 'center', fontSize: 11, color: '#94A3B8', padding: '8px 0 24px', lineHeight: 1.8 }}>
            Generated by AI Readiness Assessment Platform v1.0 · Gagandeep Singh | AI Practice · March 2026<br />
            All data is held locally in your browser. No data was transmitted to any server.
          </div>
        </div>
      </div>
    </>
  )
}
