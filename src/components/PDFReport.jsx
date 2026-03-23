/**
 * PDFReport.jsx — 15-Section Dark Theme Admin PDF Report
 * AI Readiness Assessment Platform
 * Author:  Gagandeep Singh | AI Practice
 * Version: 1.0.0
 *
 * SpaceX mission control × NASA documentation × Apple product reveal.
 * All 15 sections rendered as a printable/capturable React component.
 * Uses Orbitron (Google Font) for headers, Inter for body.
 */

import { useMemo, forwardRef } from 'react'

/* ─── Google Fonts import (lazy — only loaded when this component mounts) ─── */
const FONT_IMPORT = `
  @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Inter:wght@300;400;500;600;700;800&display=swap');
`

/* ─── Colour System ──────────────────────────────────────────────────────── */
const C = {
  bg:       '#08090C',
  surface:  '#111318',
  card:     '#16181F',
  accent:   '#6366F1',
  blue:     '#0EA5E9',
  green:    '#10B981',
  red:      '#EF4444',
  amber:    '#F59E0B',
  text:     '#F8FAFC',
  muted:    '#94A3B8',
  grid:     'rgba(255,255,255,0.06)',
  border:   'rgba(255,255,255,0.08)',
}

/* ─── Domain / Practice data ─────────────────────────────────────────────── */
const PRACTICES = [
  { id:'finance',         name:'Finance & Accounting',         domain:'Business' },
  { id:'hr',              name:'Human Resources',              domain:'Business' },
  { id:'sales',           name:'Sales & Revenue',              domain:'Business' },
  { id:'marketing',       name:'Marketing & CX',               domain:'Business' },
  { id:'legal',           name:'Legal & Compliance',           domain:'Business' },
  { id:'procurement',     name:'Procurement & Sourcing',       domain:'Business' },
  { id:'strategy',        name:'Strategy & Planning',          domain:'Business' },
  { id:'risk',            name:'Risk Management',              domain:'Business' },
  { id:'customerservice', name:'Customer Service',             domain:'Business' },
  { id:'corpgovernance',  name:'Corporate Governance',         domain:'Business' },
  { id:'it',              name:'IT & Infrastructure',          domain:'Technology' },
  { id:'softwaredev',     name:'Software Development',         domain:'Technology' },
  { id:'data',            name:'Data & Analytics',             domain:'Technology' },
  { id:'cybersecurity',   name:'Cybersecurity',                domain:'Technology' },
  { id:'itsm',            name:'IT Service Management',        domain:'Technology' },
  { id:'cloud',           name:'Cloud & Platform',             domain:'Technology' },
  { id:'network',         name:'Network & Communications',     domain:'Technology' },
  { id:'digitalworkplace',name:'Digital Workplace',            domain:'Technology' },
  { id:'supplychain',     name:'Supply Chain & Logistics',     domain:'Operations' },
  { id:'manufacturing',   name:'Manufacturing & Production',   domain:'Operations' },
  { id:'qualityassurance',name:'Quality Assurance',            domain:'Operations' },
  { id:'facilities',      name:'Facilities & Property',        domain:'Operations' },
  { id:'healthsafety',    name:'Health & Safety',              domain:'Operations' },
  { id:'environmental',   name:'Environmental & Sustainability',domain:'Operations' },
  { id:'fieldservice',    name:'Field Service',                domain:'Operations' },
]

const DIMS = {
  DQ: { label:'Data Quality',       color:'#6366F1', weight:0.25 },
  TR: { label:'Tech Readiness',      color:'#0EA5E9', weight:0.20 },
  TS: { label:'Talent & Skills',     color:'#F59E0B', weight:0.20 },
  GE: { label:'Governance & Ethics', color:'#EF4444', weight:0.15 },
  CR: { label:'Change Readiness',    color:'#F97316', weight:0.10 },
  VR: { label:'Value & ROI',         color:'#10B981', weight:0.10 },
}
const DIM_KEYS = Object.keys(DIMS)

const MATURITY = [
  { min:1.0, max:1.8, label:'AI Unaware',  color:'#EF4444' },
  { min:1.8, max:2.6, label:'AI Exploring', color:'#F97316' },
  { min:2.6, max:3.4, label:'AI Piloting',  color:'#F59E0B' },
  { min:3.4, max:4.2, label:'AI Scaling',   color:'#0EA5E9' },
  { min:4.2, max:5.1, label:'AI-Native',    color:'#10B981' },
]

function getMaturity(score) {
  return MATURITY.find(m => score >= m.min && score < m.max) || MATURITY[0]
}

/* ─── Shared Styles ──────────────────────────────────────────────────────── */
const page = { width:'794px', minHeight:'1123px', background:C.bg, position:'relative', overflow:'hidden', padding:'60px 56px', boxSizing:'border-box', breakAfter:'page', pageBreakAfter:'always' }
const sectionLabel = { fontFamily:'monospace', fontSize:10, letterSpacing:4, textTransform:'uppercase', color:C.muted, marginBottom:6 }
const orbitron = { fontFamily:'"Orbitron",monospace' }

/* ─── SVG Helpers ────────────────────────────────────────────────────────── */
function HexBackground() {
  return (
    <svg style={{ position:'absolute', inset:0, opacity:0.04, pointerEvents:'none' }} width="794" height="1123">
      <defs>
        <pattern id="pdf-hex" x="0" y="0" width="56" height="48" patternUnits="userSpaceOnUse">
          <polygon points="28,2 52,14 52,38 28,50 4,38 4,14" fill="none" stroke="#6366F1" strokeWidth="0.8"/>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#pdf-hex)"/>
    </svg>
  )
}

function CircularGauge({ score, size=120, color }) {
  const pct = (score - 1) / 4
  const r = (size - 16) / 2
  const circ = 2 * Math.PI * r
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={C.surface} strokeWidth="8" />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth="8"
        strokeDasharray={`${pct*circ} ${circ}`} strokeLinecap="round"
        transform={`rotate(-90 ${size/2} ${size/2})`}/>
      <text x={size/2} y={size/2} textAnchor="middle" dominantBaseline="middle"
        style={orbitron} fontSize="18" fontWeight="700" fill={color}>
        {score.toFixed(1)}
      </text>
    </svg>
  )
}

function HexRadar({ dimScores, size=280 }) {
  const cx = size/2, cy = size/2, r = size*0.35
  const n = DIM_KEYS.length
  const angle = i => (i/n)*2*Math.PI - Math.PI/2
  const pt = (i, frac) => ({ x: cx + Math.cos(angle(i))*r*frac, y: cy + Math.sin(angle(i))*r*frac })
  const scorePts = DIM_KEYS.map((k,i) => {
    const s = Math.max(0.05, Math.min(1, ((dimScores[k]||1)-1)/4))
    return pt(i, s)
  })
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {[0.25,0.5,0.75,1.0].map(frac => (
        <polygon key={frac} points={DIM_KEYS.map((_,i)=>{const p=pt(i,frac);return`${p.x},${p.y}`}).join(' ')} fill="none" stroke={C.grid} strokeWidth="0.8"/>
      ))}
      {DIM_KEYS.map((_,i)=>{const p=pt(i,1);return <line key={i} x1={cx} y1={cy} x2={p.x} y2={p.y} stroke={C.grid} strokeWidth="0.8"/>})}
      <polygon points={scorePts.map(p=>`${p.x},${p.y}`).join(' ')} fill={`${C.accent}25`} stroke={C.accent} strokeWidth="2"/>
      {DIM_KEYS.map((k,i)=>{const p=scorePts[i];return <circle key={k} cx={p.x} cy={p.y} r={4} fill={DIMS[k].color}/>})}
      {DIM_KEYS.map((k,i)=>{const lp=pt(i,1.25);return (
        <text key={k} x={lp.x} y={lp.y} textAnchor="middle" dominantBaseline="central"
          fontSize="9" fill={DIMS[k].color} fontWeight="700" fontFamily="Inter,sans-serif">{k}</text>
      )})}
    </svg>
  )
}

/* ─── Section Components ─────────────────────────────────────────────────── */

/* S01 — Mission Cover */
function S01Cover({ orgName, orgOverall, industry, region, assessmentId, dateStr }) {
  const m = getMaturity(orgOverall)
  return (
    <div style={{ ...page, display:'flex', flexDirection:'column', justifyContent:'space-between' }}>
      <HexBackground />
      {/* Top: coordinate/grid decorations */}
      <svg style={{ position:'absolute', top:0, right:0, opacity:0.12 }} width="300" height="300">
        <circle cx="300" cy="0" r="200" fill="none" stroke={C.accent} strokeWidth="0.6"/>
        <circle cx="300" cy="0" r="140" fill="none" stroke={C.blue} strokeWidth="0.4"/>
        <circle cx="300" cy="0" r="80" fill="none" stroke={C.green} strokeWidth="0.3"/>
        <line x1="200" y1="0" x2="300" y2="100" stroke={C.accent} strokeWidth="0.3"/>
        <line x1="250" y1="0" x2="300" y2="50" stroke={C.blue} strokeWidth="0.3"/>
      </svg>

      <div style={{ position:'relative', zIndex:1 }}>
        {/* Brand pill */}
        <div style={{ display:'inline-flex', alignItems:'center', gap:8, border:`1px solid ${C.accent}40`, borderRadius:100, padding:'4px 14px', marginBottom:80, background:`${C.accent}10` }}>
          <div style={{ width:5, height:5, borderRadius:'50%', background:C.accent, boxShadow:`0 0 6px ${C.accent}` }}/>
          <span style={{ fontSize:9, color:C.accent, letterSpacing:3, textTransform:'uppercase', fontFamily:'monospace' }}>AI Readiness Assessment · AI Practice</span>
        </div>

        {/* Assessment ID */}
        <div style={{ fontFamily:'monospace', fontSize:11, color:C.muted, letterSpacing:2, marginBottom:16 }}>{assessmentId}</div>

        {/* Org name */}
        <h1 style={{ ...orbitron, fontSize:42, fontWeight:900, color:C.text, lineHeight:1.1, margin:'0 0 8px', letterSpacing:'-1px' }}>{orgName}</h1>
        <h2 style={{ fontSize:18, fontWeight:300, color:C.muted, margin:'0 0 32px', letterSpacing:1 }}>AI Readiness Assessment</h2>

        {/* Maturity badge (large) */}
        <div style={{ display:'inline-flex', alignItems:'center', gap:12, background:`${m.color}18`, border:`2px solid ${m.color}50`, borderRadius:12, padding:'12px 24px' }}>
          <div style={{ width:12, height:12, borderRadius:'50%', background:m.color, boxShadow:`0 0 12px ${m.color}` }}/>
          <span style={{ ...orbitron, fontSize:15, color:m.color, fontWeight:700 }}>{m.label}</span>
          <span style={{ fontSize:22, fontWeight:800, color:m.color, fontFamily:'monospace' }}>{orgOverall.toFixed(2)}/5.0</span>
        </div>

        <div style={{ marginTop:20, fontSize:12, color:C.muted }}>{industry} · {region} · {dateStr}</div>
      </div>

      {/* Bottom branding */}
      <div style={{ position:'relative', zIndex:1, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <div style={{ fontSize:10, color:C.muted, fontFamily:'monospace', letterSpacing:2 }}>CONFIDENTIAL — FOR AUTHORISED RECIPIENTS ONLY</div>
        <div style={{ textAlign:'right' }}>
          <div style={{ fontSize:11, fontWeight:700, color:C.text }}>AI Practice</div>
          <div style={{ fontSize:9, color:C.muted }}>Gagandeep Singh · March 2026</div>
        </div>
      </div>

      {/* Bottom accent line */}
      <div style={{ position:'absolute', bottom:0, left:0, right:0, height:3, background:`linear-gradient(90deg, ${C.accent}, ${C.blue}, ${C.green})` }}/>
    </div>
  )
}

/* S02 — Classified Summary */
function S02ClassifiedSummary({ orgName, orgOverall, industry, orgDimScores, assessmentId }) {
  const m = getMaturity(orgOverall)
  const riskLevel = orgOverall >= 4.0 ? 'LOW' : orgOverall >= 3.0 ? 'MEDIUM' : orgOverall >= 2.0 ? 'HIGH' : 'CRITICAL'
  const riskColor = riskLevel === 'LOW' ? C.green : riskLevel === 'MEDIUM' ? C.amber : riskLevel === 'HIGH' ? '#F97316' : C.red

  const findings = [
    `Organisation operates at ${m.label} (${orgOverall.toFixed(2)}/5.0) — ${orgOverall >= 3.4 ? 'above' : orgOverall >= 2.6 ? 'at' : 'below'} industry median for ${industry}`,
    `Strongest dimension: ${DIM_KEYS.reduce((a,b) => (orgDimScores[a]||1) > (orgDimScores[b]||1) ? a : b)} (${DIMS[DIM_KEYS.reduce((a,b) => (orgDimScores[a]||1) > (orgDimScores[b]||1) ? a : b)].label}) at ${(orgDimScores[DIM_KEYS.reduce((a,b) => (orgDimScores[a]||1) > (orgDimScores[b]||1) ? a : b)]||1).toFixed(2)}`,
    `Critical weakness: ${DIM_KEYS.reduce((a,b) => (orgDimScores[a]||1) < (orgDimScores[b]||1) ? a : b)} (${DIMS[DIM_KEYS.reduce((a,b) => (orgDimScores[a]||1) < (orgDimScores[b]||1) ? a : b)].label}) at ${(orgDimScores[DIM_KEYS.reduce((a,b) => (orgDimScores[a]||1) < (orgDimScores[b]||1) ? a : b)]||1).toFixed(2)} — requires immediate attention`,
    `AI deployment risk is rated ${riskLevel} based on governance maturity and change readiness scores`,
    `Recommended first action: ${orgOverall < 2.6 ? 'Establish AI governance framework and data strategy before any AI pilots' : orgOverall < 3.4 ? 'Accelerate high-readiness function pilots with defined success metrics' : 'Scale proven AI use cases and pursue cross-function integration'}`,
  ]

  return (
    <div style={{ ...page }}>
      <HexBackground/>
      <div style={{ position:'relative', zIndex:1 }}>
        <div style={{ display:'inline-flex', alignItems:'center', gap:12, marginBottom:32, padding:'10px 16px', background:`${C.red}18`, border:`1px solid ${C.red}40`, borderRadius:8 }}>
          <span style={{ fontFamily:'monospace', fontSize:11, color:C.red, letterSpacing:3, fontWeight:700 }}>CLASSIFIED — EXECUTIVE BRIEFING</span>
        </div>

        <div style={{ ...sectionLabel }}>02 / SUMMARY</div>
        <h2 style={{ ...orbitron, fontSize:26, color:C.text, margin:'0 0 28px' }}>Executive Summary</h2>

        {/* Score + Risk side by side */}
        <div style={{ display:'flex', gap:24, marginBottom:32, alignItems:'center' }}>
          <CircularGauge score={orgOverall} size={130} color={m.color}/>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:13, color:C.muted, marginBottom:6 }}>AI Maturity Verdict</div>
            <div style={{ fontSize:18, fontWeight:700, color:m.color, marginBottom:8 }}>{m.label}</div>
            <div style={{ fontSize:12, color:C.muted, lineHeight:1.7, marginBottom:12 }}>
              {m.label === 'AI Unaware' && 'No meaningful AI capability exists. Foundational investment across data, infrastructure and skills is required before any AI activation.'}
              {m.label === 'AI Exploring' && 'Early experiments exist but no coordinated strategy. Risk of wasted investment without a data foundation and governance framework.'}
              {m.label === 'AI Piloting' && 'Targeted pilots underway. Foundations being built. Selected functions are ready to scale. Governance maturity must accelerate.'}
              {m.label === 'AI Scaling' && 'Multiple AI deployments delivering value. Cross-function integration and responsible AI leadership are the next frontier.'}
              {m.label === 'AI-Native' && 'AI is embedded as a core capability. Proprietary data advantages and mature governance position the organisation as an industry leader.'}
            </div>
            {/* Risk indicator */}
            <div style={{ display:'inline-flex', alignItems:'center', gap:8, background:`${riskColor}18`, border:`1px solid ${riskColor}40`, borderRadius:100, padding:'4px 14px' }}>
              <div style={{ width:6, height:6, borderRadius:'50%', background:riskColor, boxShadow:`0 0 8px ${riskColor}` }}/>
              <span style={{ fontFamily:'monospace', fontSize:10, color:riskColor, letterSpacing:2 }}>AI DEPLOYMENT RISK: {riskLevel}</span>
            </div>
          </div>
        </div>

        {/* Strategic findings */}
        <div style={{ marginBottom:24 }}>
          <div style={{ fontSize:10, color:C.muted, letterSpacing:2, textTransform:'uppercase', fontFamily:'monospace', marginBottom:12 }}>Strategic Findings</div>
          {findings.map((f,i) => (
            <div key={i} style={{ display:'flex', gap:10, marginBottom:10, paddingBottom:10, borderBottom:`1px solid ${C.grid}` }}>
              <span style={{ color:C.accent, fontFamily:'monospace', fontSize:11, flexShrink:0, marginTop:1 }}>{String(i+1).padStart(2,'0')}</span>
              <span style={{ fontSize:12, color:C.muted, lineHeight:1.6 }}>{f}</span>
            </div>
          ))}
        </div>

        <div style={{ fontSize:9, color:`${C.muted}80`, fontFamily:'monospace', borderTop:`1px solid ${C.grid}`, paddingTop:10 }}>
          Assessment ID: {assessmentId} · Generated: {new Date().toISOString().slice(0,19)}Z · AI Practice Platform v1.0
        </div>
      </div>
      <div style={{ position:'absolute', bottom:0, left:0, right:0, height:2, background:`linear-gradient(90deg, ${C.accent}, ${C.blue})` }}/>
    </div>
  )
}

/* S03 — CEO Strategic Brief */
function S03CEO({ orgName, industry, orgOverall, orgDimScores, size, region }) {
  const m = getMaturity(orgOverall)
  const INDUSTRY_BENCHMARK = { 'Financial Services & Banking':3.1, 'Healthcare & Life Sciences':2.8, 'Retail & E-Commerce':2.9, 'Manufacturing & Engineering':2.6, 'Government & Public Sector':2.4, 'Telecommunications & Media':3.0, 'Technology & Software':3.4, 'Other':2.7 }
  const benchmark = INDUSTRY_BENCHMARK[industry] || 2.8
  const vs = orgOverall - benchmark
  const imperatives = [
    orgOverall < 2.6 ? 'Establish an AI steering committee and appoint a Chief AI Officer — executive sponsorship is the single largest predictor of AI programme success' : 'Accelerate the AI Centre of Excellence and mandate cross-functional AI integration with clear accountability frameworks',
    orgDimScores.DQ < 2.5 ? 'Declare a Data Excellence Programme — without high-quality, governed data, no AI investment can generate sustained ROI' : 'Leverage your data foundation to unlock predictive and generative AI at scale, prioritising customer-facing and revenue functions',
    orgDimScores.GE < 2.5 ? 'Establish an AI Ethics & Governance Board before any production deployments — regulatory exposure under the EU AI Act is a board-level risk' : 'Formalise responsible AI governance to enable board-level confidence in AI-driven decisions and regulatory compliance',
  ]

  return (
    <div style={{ ...page }}>
      <HexBackground/>
      <div style={{ position:'relative', zIndex:1 }}>
        <div style={{ ...sectionLabel }}>03 / CEO BRIEF</div>
        <h2 style={{ ...orbitron, fontSize:24, color:C.text, margin:'0 0 6px' }}>Strategic Brief — Chief Executive</h2>
        <div style={{ width:40, height:2, background:C.accent, marginBottom:24 }}/>

        <p style={{ fontSize:13, color:C.muted, lineHeight:1.9, marginBottom:20 }}>
          Based on the assessment of <strong style={{ color:C.text }}>{orgName}</strong> in <strong style={{ color:C.text }}>{industry}</strong>, the organisation currently operates at{' '}
          <strong style={{ color:m.color }}>{m.label}</strong> across assessed functions, with an overall AI readiness score of{' '}
          <strong style={{ color:m.color }}>{orgOverall.toFixed(2)}/5.0</strong>.{' '}
          This positions the organisation <strong style={{ color: vs >= 0 ? C.green : C.red }}>{vs >= 0 ? `+${vs.toFixed(1)} above` : `${vs.toFixed(1)} below`}</strong> the {industry} industry benchmark of <strong style={{ color:C.text }}>{benchmark.toFixed(1)}</strong>.
        </p>

        <p style={{ fontSize:13, color:C.muted, lineHeight:1.9, marginBottom:24 }}>
          The <strong style={{ color:C.text }}>{size}</strong> organisation operating across <strong style={{ color:C.text }}>{region}</strong> faces a market where AI adoption is accelerating at a compounding rate. Competitors achieving AI-Native status will command 15–35% productivity advantages within 24 months. The strategic imperative is not whether to invest in AI, but how to sequence that investment for maximum ROI with minimum execution risk.
        </p>

        {/* 3 imperatives */}
        <div style={{ marginBottom:24 }}>
          <div style={{ fontSize:10, color:C.muted, letterSpacing:2, textTransform:'uppercase', fontFamily:'monospace', marginBottom:14 }}>3 Strategic Imperatives</div>
          {imperatives.map((imp, i) => (
            <div key={i} style={{ display:'flex', gap:14, marginBottom:14, padding:14, background:C.surface, borderRadius:10, border:`1px solid ${C.border}` }}>
              <div style={{ width:28, height:28, borderRadius:'50%', background:`${C.accent}20`, border:`1px solid ${C.accent}50`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                <span style={{ ...orbitron, fontSize:10, color:C.accent }}>{i+1}</span>
              </div>
              <p style={{ fontSize:12, color:C.muted, margin:0, lineHeight:1.7 }}>{imp}</p>
            </div>
          ))}
        </div>

        <div style={{ padding:16, background:C.surface, borderRadius:10, border:`1px solid ${C.grid}`, fontSize:12, color:C.muted, lineHeight:1.7 }}>
          <strong style={{ color:C.text }}>Competitive Positioning:</strong> {industry} organisations at {m.label} maturity risk ceding ground to AI-first competitors. The 12-month window to establish foundational AI capability is closing. Early movers in AI governance and data infrastructure will achieve 3–5× the ROI of late adopters.
        </div>
      </div>
      <div style={{ position:'absolute', bottom:0, left:0, right:0, height:2, background:`linear-gradient(90deg, ${C.accent}, ${C.blue})` }}/>
    </div>
  )
}

/* S04 — CIO/CTO Tech Brief */
function S04CTO({ orgName, orgDimScores, fnScores, industry }) {
  const trScore = orgDimScores.TR || 1
  const dqScore = orgDimScores.DQ || 1
  const matrix = [
    { cap:'Cloud Infrastructure',    current: trScore >= 3.5 ? 'Mature' : trScore >= 2.5 ? 'Developing' : 'Nascent',    target:'Production AI Platform',    gap: trScore < 3.0 ? 'High' : 'Medium' },
    { cap:'Data Platform & Lakehouse',current: dqScore >= 3.5 ? 'Mature' : dqScore >= 2.5 ? 'Structured' : 'Siloed',    target:'Governed Data Mesh',         gap: dqScore < 2.5 ? 'Critical' : dqScore < 3.5 ? 'High' : 'Low' },
    { cap:'ML/AI Tooling',           current: trScore >= 3.5 ? 'MLOps Pipeline' : trScore >= 2.5 ? 'Experimental' : 'None', target:'Enterprise AI Platform',  gap: trScore < 2.5 ? 'Critical' : 'High' },
    { cap:'API & Integration Layer',  current: trScore >= 3.0 ? 'Standardised' : 'Fragmented', target:'AI-ready APIs',  gap: trScore < 2.5 ? 'High' : 'Medium' },
    { cap:'AI Security & Monitoring', current: orgDimScores.GE >= 3.0 ? 'Implemented' : 'Planned',  target:'Real-time AI Monitoring', gap: orgDimScores.GE < 2.5 ? 'Critical' : 'High' },
  ]
  const priorities = [
    { n:1, item:'Unified Data Platform', why:`DQ score of ${dqScore.toFixed(1)} indicates data fragmentation is the primary AI blocker`, impact:'High' },
    { n:2, item:'MLOps / AI Engineering Platform', why:'Enables repeatable, governed AI model deployment across functions', impact:'High' },
    { n:3, item:'Vector Database & Embeddings Infrastructure', why:'Foundation for generative AI and retrieval-augmented generation (RAG)', impact:'High' },
    { n:4, item:'AI Observability & Model Monitoring', why:'Regulatory and risk requirement — models must be auditable and monitored', impact:'Medium' },
    { n:5, item:'Edge AI & IoT Integration', why:`${fnScores.manufacturing?.overall ? 'Manufacturing/Operations readiness' : 'Operational'} requires real-time inference capability`, impact:'Medium' },
  ]
  const gapColor = (g) => g === 'Critical' ? C.red : g === 'High' ? '#F97316' : g === 'Medium' ? C.amber : C.green

  return (
    <div style={{ ...page }}>
      <HexBackground/>
      <div style={{ position:'relative', zIndex:1 }}>
        <div style={{ ...sectionLabel }}>04 / CIO · CTO BRIEF</div>
        <h2 style={{ ...orbitron, fontSize:22, color:C.text, margin:'0 0 20px' }}>Technology Readiness Brief</h2>

        <div style={{ marginBottom:20 }}>
          <div style={{ fontSize:10, color:C.muted, letterSpacing:2, textTransform:'uppercase', fontFamily:'monospace', marginBottom:10 }}>Infrastructure Gap Matrix</div>
          <table style={{ width:'100%', borderCollapse:'collapse', fontSize:11 }}>
            <thead>
              <tr style={{ borderBottom:`1px solid ${C.grid}` }}>
                {['Capability','Current State','Target State','Gap Level'].map(h => (
                  <th key={h} style={{ padding:'7px 10px', textAlign:'left', color:C.muted, fontWeight:600, fontSize:9, textTransform:'uppercase', letterSpacing:1 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {matrix.map((row, i) => (
                <tr key={i} style={{ borderBottom:`1px solid ${C.grid}` }}>
                  <td style={{ padding:'8px 10px', color:C.text, fontSize:11 }}>{row.cap}</td>
                  <td style={{ padding:'8px 10px', color:C.muted, fontSize:11 }}>{row.current}</td>
                  <td style={{ padding:'8px 10px', color:C.blue, fontSize:11 }}>{row.target}</td>
                  <td style={{ padding:'8px 10px' }}>
                    <span style={{ background:`${gapColor(row.gap)}20`, color:gapColor(row.gap), border:`1px solid ${gapColor(row.gap)}40`, borderRadius:100, padding:'2px 8px', fontSize:9, fontWeight:700 }}>{row.gap}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div style={{ marginBottom:20 }}>
          <div style={{ fontSize:10, color:C.muted, letterSpacing:2, textTransform:'uppercase', fontFamily:'monospace', marginBottom:10 }}>Top 5 Technology Investment Priorities</div>
          {priorities.map(p => (
            <div key={p.n} style={{ display:'flex', gap:12, marginBottom:10, padding:12, background:C.surface, borderRadius:8, border:`1px solid ${C.border}` }}>
              <span style={{ ...orbitron, fontSize:13, color:C.accent, flexShrink:0, minWidth:20 }}>{p.n}</span>
              <div>
                <div style={{ fontSize:12, color:C.text, fontWeight:600, marginBottom:2 }}>{p.item}</div>
                <div style={{ fontSize:11, color:C.muted, lineHeight:1.5 }}>{p.why}</div>
              </div>
              <span style={{ background:`${p.impact === 'High' ? C.accent : C.amber}20`, color:p.impact === 'High' ? C.accent : C.amber, borderRadius:100, padding:'2px 10px', fontSize:9, fontWeight:700, alignSelf:'flex-start', flexShrink:0 }}>{p.impact}</span>
            </div>
          ))}
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:10 }}>
          {[{l:'Build',c:C.green,desc:'Custom ML models for proprietary data advantage'},{l:'Buy',c:C.blue,desc:'SaaS AI products for standard business processes'},{l:'Partner',c:C.amber,desc:'Co-develop AI with specialist vendors for niche domains'}].map(opt => (
            <div key={opt.l} style={{ padding:12, background:C.surface, borderRadius:8, border:`1px solid ${opt.c}30` }}>
              <div style={{ ...orbitron, fontSize:12, color:opt.c, fontWeight:700, marginBottom:4 }}>{opt.l}</div>
              <div style={{ fontSize:10, color:C.muted, lineHeight:1.5 }}>{opt.desc}</div>
            </div>
          ))}
        </div>
      </div>
      <div style={{ position:'absolute', bottom:0, left:0, right:0, height:2, background:`linear-gradient(90deg, ${C.accent}, ${C.blue})` }}/>
    </div>
  )
}

/* S05 — CHRO People Brief */
function S05CHRO({ orgName, orgDimScores, size }) {
  const ts = orgDimScores.TS || 1
  const cr = orgDimScores.CR || 1
  const INVEST = { startup:['£30k–£90k'], sme:['£60k–£200k'], midmarket:['£150k–£600k'], enterprise:['£400k–£1.5M'], global:['£1M–£4M'] }
  const sizeKey = size?.includes('50') && !size.includes('250') ? 'startup' : size?.includes('250') ? 'sme' : size?.includes('2,000') ? 'midmarket' : size?.includes('10,000') ? 'enterprise' : 'global'
  const invest = INVEST[sizeKey]?.[0] || '£100k–£500k'

  const risks = [
    { risk:'AI Skills Gap', likelihood: ts < 2.5 ? 4 : ts < 3.5 ? 3 : 2, impact: 4, mitigation:'Targeted upskilling programme + AI bootcamps for all function heads' },
    { risk:'Change Resistance', likelihood: cr < 2.5 ? 5 : cr < 3.5 ? 3 : 2, impact: 4, mitigation:'Executive communication programme + AI champions network' },
    { risk:'Talent Attrition', likelihood: 3, impact: 3, mitigation:'AI career pathways + competitive compensation for ML/AI engineers' },
    { risk:'Ethics & Bias Concerns', likelihood: 3, impact: 5, mitigation:'Responsible AI training mandatory for all AI project teams' },
  ]

  return (
    <div style={{ ...page }}>
      <HexBackground/>
      <div style={{ position:'relative', zIndex:1 }}>
        <div style={{ ...sectionLabel }}>05 / CHRO BRIEF</div>
        <h2 style={{ ...orbitron, fontSize:22, color:C.text, margin:'0 0 20px' }}>People, Talent & Change Brief</h2>

        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:20 }}>
          {[
            { dim:'TS', label:'Talent & Skills', score: ts, desc: ts < 2.5 ? 'Critical gap — AI literacy is below threshold for any meaningful deployment' : ts < 3.5 ? 'Developing — upskilling underway but not yet at enterprise scale' : 'Strong — AI-capable workforce with active continuous learning' },
            { dim:'CR', label:'Change Readiness', score: cr, desc: cr < 2.5 ? 'Low change readiness risks derailing AI programmes despite technical capability' : cr < 3.5 ? 'Moderate readiness — leadership buy-in exists but culture lags' : 'High readiness — organisation demonstrates strong AI adoption culture' },
          ].map(d => (
            <div key={d.dim} style={{ padding:16, background:C.surface, borderRadius:10, border:`1px solid ${C.border}` }}>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:8 }}>
                <span style={{ fontSize:12, fontWeight:700, color:C.text }}>{d.label}</span>
                <span style={{ ...orbitron, fontSize:14, color:DIMS[d.dim].color }}>{d.score.toFixed(2)}</span>
              </div>
              <div style={{ height:4, background:C.grid, borderRadius:100, marginBottom:8, overflow:'hidden' }}>
                <div style={{ height:'100%', width:`${((d.score-1)/4)*100}%`, background:DIMS[d.dim].color, borderRadius:100 }}/>
              </div>
              <div style={{ fontSize:11, color:C.muted, lineHeight:1.6 }}>{d.desc}</div>
            </div>
          ))}
        </div>

        <div style={{ marginBottom:20, padding:14, background:C.surface, borderRadius:10, border:`1px solid ${C.amber}30` }}>
          <div style={{ fontSize:10, color:C.amber, letterSpacing:2, textTransform:'uppercase', fontFamily:'monospace', marginBottom:8 }}>Upskilling Investment Estimate</div>
          <div style={{ fontSize:20, fontWeight:800, color:C.amber, marginBottom:4 }}>{invest}</div>
          <div style={{ fontSize:11, color:C.muted }}>Estimated 12-month AI literacy & upskilling programme cost for {orgName} based on organisational size</div>
        </div>

        <div>
          <div style={{ fontSize:10, color:C.muted, letterSpacing:2, textTransform:'uppercase', fontFamily:'monospace', marginBottom:10 }}>Workforce Transition Risk Assessment</div>
          <table style={{ width:'100%', borderCollapse:'collapse', fontSize:11 }}>
            <thead>
              <tr style={{ borderBottom:`1px solid ${C.grid}` }}>
                {['Risk','Likelihood','Impact','Score','Mitigation'].map(h => (
                  <th key={h} style={{ padding:'6px 10px', textAlign:'left', color:C.muted, fontWeight:600, fontSize:9, letterSpacing:1 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {risks.map((r,i) => {
                const score = r.likelihood * r.impact
                const scoreColor = score >= 15 ? C.red : score >= 9 ? '#F97316' : C.amber
                return (
                  <tr key={i} style={{ borderBottom:`1px solid ${C.grid}` }}>
                    <td style={{ padding:'8px 10px', color:C.text }}>{r.risk}</td>
                    <td style={{ padding:'8px 10px', color:C.muted, textAlign:'center' }}>{r.likelihood}</td>
                    <td style={{ padding:'8px 10px', color:C.muted, textAlign:'center' }}>{r.impact}</td>
                    <td style={{ padding:'8px 10px', textAlign:'center' }}>
                      <span style={{ background:`${scoreColor}20`, color:scoreColor, borderRadius:4, padding:'2px 8px', fontWeight:700, fontSize:10 }}>{score}</span>
                    </td>
                    <td style={{ padding:'8px 10px', color:C.muted, fontSize:10 }}>{r.mitigation}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
      <div style={{ position:'absolute', bottom:0, left:0, right:0, height:2, background:`linear-gradient(90deg, ${C.accent}, ${C.blue})` }}/>
    </div>
  )
}

/* S06 — Function Heatmap */
function S06Heatmap({ fnScores }) {
  const domains = ['Business','Technology','Operations']
  return (
    <div style={{ ...page }}>
      <HexBackground/>
      <div style={{ position:'relative', zIndex:1 }}>
        <div style={{ ...sectionLabel }}>06 / FUNCTION HEATMAP</div>
        <h2 style={{ ...orbitron, fontSize:22, color:C.text, margin:'0 0 20px' }}>Function Readiness Heatmap</h2>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:14 }}>
          {domains.map(domain => (
            <div key={domain}>
              <div style={{ fontSize:9, color:C.accent, fontWeight:700, textTransform:'uppercase', letterSpacing:2, marginBottom:8, fontFamily:'monospace' }}>{domain}</div>
              {PRACTICES.filter(p=>p.domain===domain).map(p => {
                const data = fnScores[p.id]
                const s = data?.overall
                const m = s ? getMaturity(s) : null
                const pct = s ? ((s-1)/4)*100 : 0
                return (
                  <div key={p.id} style={{ marginBottom:5, padding:'8px 10px', background:C.surface, border:`1px solid ${m ? m.color+'30' : C.border}`, borderRadius:7 }}>
                    <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
                      <span style={{ fontSize:10, color:C.text, lineHeight:1.3 }}>{p.name}</span>
                      <span style={{ fontSize:11, fontWeight:800, color:m ? m.color : C.muted }}>{s ? s.toFixed(1) : '—'}</span>
                    </div>
                    <div style={{ height:3, background:C.grid, borderRadius:100, overflow:'hidden' }}>
                      <div style={{ height:'100%', width:`${pct}%`, background: m ? m.color : C.muted, borderRadius:100 }}/>
                    </div>
                  </div>
                )
              })}
            </div>
          ))}
        </div>
        {/* Legend */}
        <div style={{ display:'flex', gap:12, marginTop:16, flexWrap:'wrap' }}>
          {MATURITY.map(m => (
            <div key={m.label} style={{ display:'flex', alignItems:'center', gap:4 }}>
              <div style={{ width:8, height:8, borderRadius:2, background:m.color }}/>
              <span style={{ fontSize:9, color:C.muted }}>{m.label} ({m.min.toFixed(1)}–{m.max.toFixed(1)})</span>
            </div>
          ))}
        </div>
      </div>
      <div style={{ position:'absolute', bottom:0, left:0, right:0, height:2, background:`linear-gradient(90deg, ${C.accent}, ${C.blue})` }}/>
    </div>
  )
}

/* S07 — Dimension Radar & Analysis */
function S07Radar({ orgDimScores, orgOverall }) {
  const strongest = DIM_KEYS.reduce((a,b) => (orgDimScores[a]||1) > (orgDimScores[b]||1) ? a : b)
  const weakest   = DIM_KEYS.reduce((a,b) => (orgDimScores[a]||1) < (orgDimScores[b]||1) ? a : b)
  const BENCHMARK = { DQ:2.9, TR:2.8, TS:2.7, GE:2.6, CR:2.7, VR:2.5 }

  return (
    <div style={{ ...page }}>
      <HexBackground/>
      <div style={{ position:'relative', zIndex:1 }}>
        <div style={{ ...sectionLabel }}>07 / DIMENSIONS</div>
        <h2 style={{ ...orbitron, fontSize:22, color:C.text, margin:'0 0 20px' }}>Dimensional Radar Analysis</h2>
        <div style={{ display:'flex', gap:32, alignItems:'flex-start' }}>
          <HexRadar dimScores={orgDimScores} size={260}/>
          <div style={{ flex:1 }}>
            {DIM_KEYS.map(k => {
              const s = orgDimScores[k] || 1
              const benchmark = BENCHMARK[k]
              const vs = s - benchmark
              const m = getMaturity(s)
              return (
                <div key={k} style={{ marginBottom:12, padding:12, background:C.surface, borderRadius:8, border:`1px solid ${C.border}` }}>
                  <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
                    <div>
                      <span style={{ fontSize:11, fontWeight:700, color:DIMS[k].color }}>{k}</span>
                      <span style={{ fontSize:10, color:C.muted, marginLeft:6 }}>{DIMS[k].label}</span>
                      <span style={{ fontSize:9, color:C.muted, marginLeft:8, fontFamily:'monospace' }}>Weight: {(DIMS[k].weight*100).toFixed(0)}%</span>
                    </div>
                    <div style={{ textAlign:'right' }}>
                      <span style={{ ...orbitron, fontSize:14, color:m.color, fontWeight:700 }}>{s.toFixed(2)}</span>
                      <span style={{ fontSize:9, color: vs >= 0 ? C.green : C.red, marginLeft:6 }}>{vs >= 0 ? `+${vs.toFixed(1)}` : vs.toFixed(1)} vs benchmark</span>
                    </div>
                  </div>
                  <div style={{ height:4, background:C.grid, borderRadius:100, overflow:'hidden' }}>
                    <div style={{ height:'100%', width:`${((s-1)/4)*100}%`, background:DIMS[k].color, borderRadius:100 }}/>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14, marginTop:16 }}>
          <div style={{ padding:12, background:C.surface, borderRadius:8, border:`1px solid ${C.green}30` }}>
            <div style={{ fontSize:9, color:C.green, letterSpacing:2, textTransform:'uppercase', fontFamily:'monospace', marginBottom:4 }}>Strongest Dimension</div>
            <div style={{ fontSize:14, fontWeight:700, color:C.green }}>{DIMS[strongest].label}</div>
            <div style={{ fontSize:11, color:C.muted }}>Score: {(orgDimScores[strongest]||1).toFixed(2)}</div>
          </div>
          <div style={{ padding:12, background:C.surface, borderRadius:8, border:`1px solid ${C.red}30` }}>
            <div style={{ fontSize:9, color:C.red, letterSpacing:2, textTransform:'uppercase', fontFamily:'monospace', marginBottom:4 }}>Critical Weakness</div>
            <div style={{ fontSize:14, fontWeight:700, color:C.red }}>{DIMS[weakest].label}</div>
            <div style={{ fontSize:11, color:C.muted }}>Score: {(orgDimScores[weakest]||1).toFixed(2)} — Priority for remediation</div>
          </div>
        </div>
      </div>
      <div style={{ position:'absolute', bottom:0, left:0, right:0, height:2, background:`linear-gradient(90deg, ${C.accent}, ${C.blue})` }}/>
    </div>
  )
}

/* S08 — AI Use Case Register */
function S08UseCases({ fnScores, orgDimScores }) {
  const useCases = useMemo(() => {
    const cases = []
    PRACTICES.forEach(p => {
      const s = fnScores[p.id]?.overall
      if (!s) return
      const dq = orgDimScores.DQ || 1
      const tr = orgDimScores.TR || 1
      const readiness = (s + dq + tr) / 3
      const USE_CASE_MAP = {
        finance:['Automated Financial Close','Intelligent FP&A','Fraud Detection AI'], hr:['AI Talent Matching','Predictive Attrition','Automated Onboarding'],
        sales:['AI Revenue Forecasting','Lead Scoring AI','Dynamic Pricing'], marketing:['Personalisation Engine','AI Content Generation','Churn Prediction'],
        legal:['Contract AI Review','Regulatory Compliance Scanning','eDiscovery AI'], data:['AutoML Pipeline','Anomaly Detection','Data Quality AI'],
        it:['AIOps Platform','Predictive Maintenance IT','Intelligent Alerting'], softwaredev:['AI Code Assistant','Automated Testing AI','Security Scanning AI'],
        customerservice:['Generative AI Chatbot','Sentiment Analysis','Case Routing AI'], supplychain:['Demand Forecasting AI','Supply Chain Optimisation','Route Planning AI'],
        manufacturing:['Predictive Maintenance OT','Computer Vision QC','Process Optimisation AI'],
      }
      const uc = USE_CASE_MAP[p.id]?.[0] || `AI Automation for ${p.name}`
      const euTier = orgDimScores.GE >= 3.0 ? 'Limited' : 'High-Risk'
      cases.push({
        fn: p.name, useCase: uc, effort: readiness > 3.5 ? 'Low' : readiness > 2.5 ? 'Medium' : 'High',
        impact: s > 3.5 ? 'Transformational' : s > 2.5 ? 'Significant' : 'Incremental',
        roi: s > 3.5 ? '150–400%' : s > 2.5 ? '80–200%' : '30–90%',
        ttv: s > 3.5 ? '3–6mo' : s > 2.5 ? '6–12mo' : '12–24mo',
        euTier, priority: Math.round(readiness * s * 10) / 10,
      })
    })
    return cases.sort((a, b) => b.priority - a.priority).slice(0, 12)
  }, [fnScores, orgDimScores])

  const effortColor = e => e === 'Low' ? C.green : e === 'Medium' ? C.amber : C.red
  const impactColor = i => i === 'Transformational' ? C.accent : i === 'Significant' ? C.blue : C.muted

  return (
    <div style={{ ...page, padding:'40px 40px' }}>
      <HexBackground/>
      <div style={{ position:'relative', zIndex:1 }}>
        <div style={{ ...sectionLabel }}>08 / USE CASE REGISTER</div>
        <h2 style={{ ...orbitron, fontSize:20, color:C.text, margin:'0 0 16px' }}>AI Use Case Register — Top {useCases.length} Opportunities</h2>
        <table style={{ width:'100%', borderCollapse:'collapse', fontSize:10 }}>
          <thead>
            <tr style={{ borderBottom:`1px solid ${C.grid}` }}>
              {['#','Function','Use Case','Effort','Impact','Est. ROI','Time-to-Value','EU AI Act Tier'].map(h => (
                <th key={h} style={{ padding:'6px 8px', textAlign:'left', color:C.muted, fontWeight:600, fontSize:8, textTransform:'uppercase', letterSpacing:0.8 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {useCases.map((uc, i) => (
              <tr key={i} style={{ borderBottom:`1px solid ${C.grid}` }}>
                <td style={{ padding:'7px 8px', color:C.muted, fontFamily:'monospace', fontSize:9 }}>{String(i+1).padStart(2,'0')}</td>
                <td style={{ padding:'7px 8px', color:C.muted, fontSize:9 }}>{uc.fn}</td>
                <td style={{ padding:'7px 8px', color:C.text, fontSize:10, fontWeight:600 }}>{uc.useCase}</td>
                <td style={{ padding:'7px 8px' }}><span style={{ background:`${effortColor(uc.effort)}20`, color:effortColor(uc.effort), borderRadius:4, padding:'1px 6px', fontSize:8, fontWeight:700 }}>{uc.effort}</span></td>
                <td style={{ padding:'7px 8px' }}><span style={{ color:impactColor(uc.impact), fontSize:9, fontWeight:600 }}>{uc.impact}</span></td>
                <td style={{ padding:'7px 8px', color:C.green, fontFamily:'monospace', fontSize:9 }}>{uc.roi}</td>
                <td style={{ padding:'7px 8px', color:C.blue, fontSize:9 }}>{uc.ttv}</td>
                <td style={{ padding:'7px 8px' }}><span style={{ background: uc.euTier==='High-Risk' ? `${C.red}20` : `${C.green}20`, color: uc.euTier==='High-Risk' ? C.red : C.green, borderRadius:4, padding:'1px 6px', fontSize:8, fontWeight:700 }}>{uc.euTier}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div style={{ position:'absolute', bottom:0, left:0, right:0, height:2, background:`linear-gradient(90deg, ${C.accent}, ${C.blue})` }}/>
    </div>
  )
}

/* S09 — Regulatory Readiness */
function S09Regulatory({ orgDimScores, region }) {
  const ge = orgDimScores.GE || 1
  const regulations = [
    { name:'EU AI Act — High-Risk AI Systems', req:'Risk assessment, human oversight, data governance', status: ge >= 3.5 ? 'Compliant' : ge >= 2.5 ? 'Partial' : 'Non-compliant', gap: ge < 2.5 ? 'AI governance framework absent' : ge < 3.5 ? 'Risk assessment procedures incomplete' : 'None', risk: ge < 2.5 ? 'Critical' : ge < 3.5 ? 'High' : 'Low' },
    { name:'GDPR / UK GDPR — AI Data Processing', req:'Lawful basis, transparency, data minimisation', status: orgDimScores.DQ >= 3.0 ? 'Compliant' : orgDimScores.DQ >= 2.0 ? 'Partial' : 'Non-compliant', gap: orgDimScores.DQ < 2.0 ? 'No data governance controls' : orgDimScores.DQ < 3.0 ? 'Data lineage documentation gaps' : 'None', risk: orgDimScores.DQ < 2.0 ? 'Critical' : 'Medium' },
    { name:'ISO/IEC 42001 — AI Management Systems', req:'AI management system, accountability, documentation', status: ge >= 4.0 ? 'Compliant' : ge >= 2.5 ? 'Partial' : 'Non-compliant', gap: ge < 4.0 ? 'AI management system not formally established' : 'None', risk: ge < 2.5 ? 'High' : 'Medium' },
    { name:'NIST AI RMF — AI Risk Management', req:'Govern, Map, Measure, Manage risk lifecycle', status: orgDimScores.GE >= 3.0 && orgDimScores.CR >= 2.5 ? 'Partial' : 'Non-compliant', gap: 'AI risk lifecycle management not fully implemented', risk: 'High' },
    { name:'BSI PAS 1885 — AI Trustworthiness', req:'Bias assessment, explainability, monitoring', status: ge >= 3.5 ? 'Partial' : 'Non-compliant', gap: ge < 3.5 ? 'Explainability and bias monitoring absent' : 'Monitoring framework needed', risk: 'High' },
  ]
  const statusColor = s => s === 'Compliant' ? C.green : s === 'Partial' ? C.amber : C.red

  return (
    <div style={{ ...page }}>
      <HexBackground/>
      <div style={{ position:'relative', zIndex:1 }}>
        <div style={{ ...sectionLabel }}>09 / REGULATORY</div>
        <h2 style={{ ...orbitron, fontSize:22, color:C.text, margin:'0 0 8px' }}>Regulatory Readiness Scorecard</h2>
        <div style={{ fontSize:11, color:C.muted, marginBottom:20 }}>Region: {region || 'Global'} · Assessed against applicable AI regulations and standards</div>
        <table style={{ width:'100%', borderCollapse:'collapse', fontSize:11 }}>
          <thead>
            <tr style={{ borderBottom:`1px solid ${C.grid}` }}>
              {['Regulation / Standard','Key Requirement','Status','Key Gap','Risk'].map(h => (
                <th key={h} style={{ padding:'7px 10px', textAlign:'left', color:C.muted, fontWeight:600, fontSize:9, letterSpacing:1 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {regulations.map((reg, i) => (
              <tr key={i} style={{ borderBottom:`1px solid ${C.grid}` }}>
                <td style={{ padding:'10px 10px', color:C.text, fontSize:10, fontWeight:600 }}>{reg.name}</td>
                <td style={{ padding:'10px 10px', color:C.muted, fontSize:10 }}>{reg.req}</td>
                <td style={{ padding:'10px 10px' }}><span style={{ background:`${statusColor(reg.status)}20`, color:statusColor(reg.status), border:`1px solid ${statusColor(reg.status)}40`, borderRadius:100, padding:'2px 10px', fontSize:9, fontWeight:700 }}>{reg.status}</span></td>
                <td style={{ padding:'10px 10px', color:C.muted, fontSize:10 }}>{reg.gap}</td>
                <td style={{ padding:'10px 10px' }}><span style={{ background:`${statusColor(reg.status === 'Compliant' ? 'Compliant' : reg.risk === 'Critical' ? 'Non-compliant' : reg.risk === 'High' ? 'Partial' : 'Compliant')}20`, color:statusColor(reg.status === 'Compliant' ? 'Compliant' : reg.risk === 'Critical' ? 'Non-compliant' : reg.risk === 'High' ? 'Partial' : 'Compliant'), borderRadius:4, padding:'2px 8px', fontSize:9, fontWeight:700 }}>{reg.risk}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
        <div style={{ marginTop:20, padding:12, background:`${C.amber}15`, border:`1px solid ${C.amber}30`, borderRadius:8, fontSize:10, color:C.muted, lineHeight:1.7 }}>
          <strong style={{ color:C.amber }}>Disclaimer:</strong> This regulatory assessment is indicative and based on self-reported assessment data. It does not constitute legal advice. Organisations should engage qualified legal and compliance professionals for binding regulatory opinions. The AI Readiness Assessment Platform v1.0 cannot be held liable for regulatory outcomes.
        </div>
      </div>
      <div style={{ position:'absolute', bottom:0, left:0, right:0, height:2, background:`linear-gradient(90deg, ${C.accent}, ${C.blue})` }}/>
    </div>
  )
}

/* S10 — Critical Gap Analysis */
function S10Gaps({ fnScores, orgDimScores }) {
  const gaps = useMemo(() => {
    return PRACTICES
      .map(p => ({ ...p, score: fnScores[p.id]?.overall }))
      .filter(p => p.score != null && p.score < 3.5)
      .sort((a, b) => a.score - b.score)
      .slice(0, 10)
      .map(p => {
        const target = 3.5
        const severity = p.score < 2.0 ? 'Critical' : p.score < 2.6 ? 'High' : p.score < 3.0 ? 'Medium' : 'Low'
        const effortWks = p.score < 2.0 ? '24–36 wks' : p.score < 2.6 ? '16–24 wks' : '8–16 wks'
        const invest = p.score < 2.0 ? '£50k–£200k' : p.score < 2.6 ? '£30k–£100k' : '£15k–£50k'
        return {
          fn: p.name, domain: p.domain, current: p.score, target,
          action: `Structured ${p.name} AI readiness programme: data foundation, skills, governance`,
          effort: effortWks, invest, severity
        }
      })
  }, [fnScores])

  const sevColor = s => s === 'Critical' ? C.red : s === 'High' ? '#F97316' : s === 'Medium' ? C.amber : C.green

  return (
    <div style={{ ...page, padding:'40px 40px' }}>
      <HexBackground/>
      <div style={{ position:'relative', zIndex:1 }}>
        <div style={{ ...sectionLabel }}>10 / GAP ANALYSIS</div>
        <h2 style={{ ...orbitron, fontSize:20, color:C.text, margin:'0 0 16px' }}>Critical Gap Analysis — Top {gaps.length} Priority Gaps</h2>
        {gaps.length === 0 ? (
          <div style={{ padding:20, background:C.surface, borderRadius:10, color:C.muted, fontSize:12 }}>No critical gaps identified — organisation demonstrates strong AI readiness across all assessed functions.</div>
        ) : (
          <table style={{ width:'100%', borderCollapse:'collapse', fontSize:10 }}>
            <thead>
              <tr style={{ borderBottom:`1px solid ${C.grid}` }}>
                {['Function','Domain','Score','Target','Gap Bar','Severity','Effort','Investment'].map(h => (
                  <th key={h} style={{ padding:'6px 8px', textAlign:'left', color:C.muted, fontWeight:600, fontSize:8, letterSpacing:0.8, textTransform:'uppercase' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {gaps.map((g, i) => {
                const gapPct = Math.max(0, ((g.target - g.current) / (g.target - 1)) * 100)
                const currentPct = Math.max(0, ((g.current - 1) / (g.target - 1)) * 100)
                return (
                  <tr key={i} style={{ borderBottom:`1px solid ${C.grid}` }}>
                    <td style={{ padding:'8px 8px', color:C.text, fontSize:10, fontWeight:600 }}>{g.fn}</td>
                    <td style={{ padding:'8px 8px', color:C.muted, fontSize:9 }}>{g.domain}</td>
                    <td style={{ padding:'8px 8px', color:sevColor(g.severity), fontFamily:'monospace', fontSize:10, fontWeight:700 }}>{g.current.toFixed(1)}</td>
                    <td style={{ padding:'8px 8px', color:C.green, fontFamily:'monospace', fontSize:10 }}>{g.target.toFixed(1)}</td>
                    <td style={{ padding:'8px 16px', minWidth:80 }}>
                      <div style={{ height:6, background:C.grid, borderRadius:100, position:'relative', overflow:'hidden' }}>
                        <div style={{ position:'absolute', left:0, top:0, height:'100%', width:`${currentPct}%`, background:sevColor(g.severity), borderRadius:100 }}/>
                        <div style={{ position:'absolute', left:`${currentPct}%`, top:0, height:'100%', width:`${gapPct}%`, background:`${C.green}40`, borderRadius:100 }}/>
                      </div>
                    </td>
                    <td style={{ padding:'8px 8px' }}><span style={{ background:`${sevColor(g.severity)}20`, color:sevColor(g.severity), borderRadius:4, padding:'1px 6px', fontSize:8, fontWeight:700 }}>{g.severity}</span></td>
                    <td style={{ padding:'8px 8px', color:C.muted, fontSize:9 }}>{g.effort}</td>
                    <td style={{ padding:'8px 8px', color:C.amber, fontFamily:'monospace', fontSize:9 }}>{g.invest}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
      <div style={{ position:'absolute', bottom:0, left:0, right:0, height:2, background:`linear-gradient(90deg, ${C.accent}, ${C.blue})` }}/>
    </div>
  )
}

/* S11 — Investment Roadmap */
function S11Roadmap({ fnScores, size }) {
  const sorted = PRACTICES.map(p => ({ ...p, score: fnScores[p.id]?.overall })).filter(p => p.score != null).sort((a,b) => b.score - a.score)
  const INVEST = { startup:['£20k–£80k','£80k–£250k','£250k–£600k'], sme:['£50k–£150k','£150k–£500k','£500k–£1.5M'], midmarket:['£100k–£400k','£400k–£1.2M','£1.2M–£4M'], enterprise:['£300k–£1M','£1M–£4M','£4M–£12M'], global:['£600k–£2M','£2M–£8M','£8M–£25M'] }
  const sizeKey = size?.includes('50') && !size.includes('250') ? 'startup' : size?.includes('250') ? 'sme' : size?.includes('2,000') ? 'midmarket' : size?.includes('10,000') ? 'enterprise' : 'global'
  const bands = INVEST[sizeKey] || INVEST.midmarket
  const phases = [
    { n:1, label:'PHASE 01', title:'Quick Wins', sub:'Activate high-readiness functions', timeframe:'0–3 months', color:C.green, fns: sorted.filter(p=>p.score>=3.4).slice(0,5), invest:bands[0] },
    { n:2, label:'PHASE 02', title:'Foundation Build', sub:'Data platform, governance, upskilling', timeframe:'3–12 months', color:C.accent, fns: sorted.filter(p=>p.score>=2.0&&p.score<3.4).slice(0,5), invest:bands[1] },
    { n:3, label:'PHASE 03', title:'Scale & Differentiate', sub:'Enterprise AI, proprietary data advantage', timeframe:'12–24 months', color:C.blue, fns: sorted.filter(p=>p.score<2.0).slice(0,5), invest:bands[2] },
  ]

  return (
    <div style={{ ...page }}>
      <HexBackground/>
      <div style={{ position:'relative', zIndex:1 }}>
        <div style={{ ...sectionLabel }}>11 / ROADMAP</div>
        <h2 style={{ ...orbitron, fontSize:22, color:C.text, margin:'0 0 20px' }}>24-Month AI Transformation Roadmap</h2>
        {phases.map(ph => (
          <div key={ph.n} style={{ marginBottom:16, background:C.surface, border:`1px solid ${ph.color}30`, borderRadius:12, overflow:'hidden' }}>
            <div style={{ padding:'14px 20px', background:`${ph.color}12`, borderBottom:`1px solid ${ph.color}25`, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
              <div style={{ display:'flex', alignItems:'center', gap:14 }}>
                <span style={{ ...orbitron, fontSize:10, color:ph.color, fontWeight:700 }}>{ph.label}</span>
                <span style={{ fontSize:15, fontWeight:700, color:C.text }}>{ph.title}</span>
                <span style={{ fontSize:11, color:C.muted }}>{ph.sub}</span>
              </div>
              <div style={{ textAlign:'right' }}>
                <div style={{ fontSize:10, color:ph.color, fontFamily:'monospace' }}>{ph.timeframe}</div>
                <div style={{ fontSize:11, fontWeight:700, color:C.amber }}>{ph.invest}</div>
              </div>
            </div>
            <div style={{ padding:'12px 20px', display:'flex', flexWrap:'wrap', gap:8 }}>
              {ph.fns.length === 0 ? <span style={{ fontSize:11, color:C.muted, fontStyle:'italic' }}>No functions in this phase</span> :
                ph.fns.map(f => (
                  <div key={f.id} style={{ display:'flex', alignItems:'center', gap:5, background:`${ph.color}15`, border:`1px solid ${ph.color}25`, borderRadius:100, padding:'4px 12px' }}>
                    <div style={{ width:4, height:4, borderRadius:'50%', background:ph.color }}/>
                    <span style={{ fontSize:10, color:C.text }}>{f.name}</span>
                    <span style={{ fontSize:9, color:ph.color, fontFamily:'monospace' }}>{f.score.toFixed(1)}</span>
                  </div>
                ))
              }
            </div>
          </div>
        ))}

        {/* Gantt timeline */}
        <div style={{ marginTop:8 }}>
          <div style={{ fontSize:9, color:C.muted, letterSpacing:2, textTransform:'uppercase', fontFamily:'monospace', marginBottom:8 }}>Timeline View</div>
          <div style={{ position:'relative', height:28, background:C.surface, borderRadius:8, overflow:'hidden' }}>
            <div style={{ position:'absolute', left:0, top:0, height:'100%', width:'12.5%', background:`${C.green}60`, borderRight:`1px solid ${C.bg}` }}/>
            <div style={{ position:'absolute', left:'12.5%', top:0, height:'100%', width:'37.5%', background:`${C.accent}40`, borderRight:`1px solid ${C.bg}` }}/>
            <div style={{ position:'absolute', left:'50%', top:0, height:'100%', width:'50%', background:`${C.blue}30` }}/>
            {[['0', '0'], ['3mo', '12.5%'], ['12mo', '50%'], ['24mo', '100%']].map(([l, left]) => (
              <div key={l} style={{ position:'absolute', left, top:'50%', transform:'translateY(-50%)', fontSize:8, color:C.muted, fontFamily:'monospace' }}>{l}</div>
            ))}
          </div>
        </div>
      </div>
      <div style={{ position:'absolute', bottom:0, left:0, right:0, height:2, background:`linear-gradient(90deg, ${C.accent}, ${C.blue})` }}/>
    </div>
  )
}

/* S12 — ROI Projections */
function S12ROI({ orgOverall, orgDimScores, size }) {
  const multiplier = { startup:0.3, sme:0.7, midmarket:1.5, enterprise:4, global:12 }
  const sizeKey = size?.includes('50') && !size.includes('250') ? 'startup' : size?.includes('250') ? 'sme' : size?.includes('2,000') ? 'midmarket' : size?.includes('10,000') ? 'enterprise' : 'global'
  const m = multiplier[sizeKey] || 1.5
  const readinessMult = (orgOverall - 1) / 4

  const rows = [
    { cat:'Productivity Gain', y1: Math.round(m*0.8*readinessMult*100)*1000, y2: Math.round(m*1.8*readinessMult*100)*1000, y3: Math.round(m*3.2*readinessMult*100)*1000 },
    { cat:'Cost Reduction',    y1: Math.round(m*0.5*readinessMult*100)*1000, y2: Math.round(m*1.2*readinessMult*100)*1000, y3: Math.round(m*2.0*readinessMult*100)*1000 },
    { cat:'Revenue Uplift',    y1: Math.round(m*0.3*readinessMult*100)*1000, y2: Math.round(m*0.9*readinessMult*100)*1000, y3: Math.round(m*2.5*readinessMult*100)*1000 },
    { cat:'Risk Avoidance',    y1: Math.round(m*0.4*readinessMult*100)*1000, y2: Math.round(m*0.7*readinessMult*100)*1000, y3: Math.round(m*1.0*readinessMult*100)*1000 },
  ]
  rows.forEach(r => { r.total = r.y1+r.y2+r.y3; r.npv = Math.round(r.y1/1.08 + r.y2/1.08**2 + r.y3/1.08**3) })
  const totals = { y1: rows.reduce((s,r)=>s+r.y1,0), y2: rows.reduce((s,r)=>s+r.y2,0), y3: rows.reduce((s,r)=>s+r.y3,0), total: rows.reduce((s,r)=>s+r.total,0), npv: rows.reduce((s,r)=>s+r.npv,0) }
  const totalInvest = m * 0.8 * 1000000
  const payback = totals.y1 > totalInvest ? 'Year 1' : totals.y1+totals.y2 > totalInvest ? 'Year 2' : 'Year 3'

  const fmt = n => n >= 1000000 ? `£${(n/1000000).toFixed(1)}M` : n >= 1000 ? `£${(n/1000).toFixed(0)}k` : `£${n}`

  return (
    <div style={{ ...page }}>
      <HexBackground/>
      <div style={{ position:'relative', zIndex:1 }}>
        <div style={{ ...sectionLabel }}>12 / ROI PROJECTIONS</div>
        <h2 style={{ ...orbitron, fontSize:22, color:C.text, margin:'0 0 8px' }}>3-Year AI ROI Financial Model</h2>
        <div style={{ fontSize:11, color:C.muted, marginBottom:20 }}>Indicative returns based on organisational size, readiness score, and industry benchmarks. NPV calculated at 8% discount rate.</div>
        <table style={{ width:'100%', borderCollapse:'collapse', fontSize:11, marginBottom:16 }}>
          <thead>
            <tr style={{ borderBottom:`2px solid ${C.accent}40` }}>
              {['Benefit Category','Year 1','Year 2','Year 3','3-Year Total','NPV (8%)'].map(h => (
                <th key={h} style={{ padding:'8px 10px', textAlign: h==='Benefit Category' ? 'left' : 'right', color:C.muted, fontWeight:600, fontSize:9, letterSpacing:1 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map(r => (
              <tr key={r.cat} style={{ borderBottom:`1px solid ${C.grid}` }}>
                <td style={{ padding:'9px 10px', color:C.text, fontSize:11 }}>{r.cat}</td>
                <td style={{ padding:'9px 10px', color:C.muted, textAlign:'right', fontFamily:'monospace', fontSize:10 }}>{fmt(r.y1)}</td>
                <td style={{ padding:'9px 10px', color:C.muted, textAlign:'right', fontFamily:'monospace', fontSize:10 }}>{fmt(r.y2)}</td>
                <td style={{ padding:'9px 10px', color:C.muted, textAlign:'right', fontFamily:'monospace', fontSize:10 }}>{fmt(r.y3)}</td>
                <td style={{ padding:'9px 10px', color:C.text, textAlign:'right', fontFamily:'monospace', fontSize:10, fontWeight:700 }}>{fmt(r.total)}</td>
                <td style={{ padding:'9px 10px', color:C.green, textAlign:'right', fontFamily:'monospace', fontSize:10, fontWeight:700 }}>{fmt(r.npv)}</td>
              </tr>
            ))}
            <tr style={{ borderTop:`2px solid ${C.accent}40`, background:C.surface }}>
              <td style={{ padding:'10px 10px', color:C.accent, fontWeight:700, ...orbitron, fontSize:11 }}>TOTAL AI ROI</td>
              <td style={{ padding:'10px 10px', color:C.accent, textAlign:'right', fontFamily:'monospace', fontWeight:700 }}>{fmt(totals.y1)}</td>
              <td style={{ padding:'10px 10px', color:C.accent, textAlign:'right', fontFamily:'monospace', fontWeight:700 }}>{fmt(totals.y2)}</td>
              <td style={{ padding:'10px 10px', color:C.accent, textAlign:'right', fontFamily:'monospace', fontWeight:700 }}>{fmt(totals.y3)}</td>
              <td style={{ padding:'10px 10px', color:C.text, textAlign:'right', fontFamily:'monospace', fontWeight:800, fontSize:13 }}>{fmt(totals.total)}</td>
              <td style={{ padding:'10px 10px', color:C.green, textAlign:'right', fontFamily:'monospace', fontWeight:800, fontSize:13 }}>{fmt(totals.npv)}</td>
            </tr>
          </tbody>
        </table>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12 }}>
          {[
            { label:'Total Investment (est.)', value:fmt(Math.round(totalInvest)), color:C.amber },
            { label:'Payback Period', value:payback, color:C.green },
            { label:'3-Year NPV', value:fmt(totals.npv), color:C.accent },
          ].map(kpi => (
            <div key={kpi.label} style={{ padding:14, background:C.surface, borderRadius:10, border:`1px solid ${kpi.color}30`, textAlign:'center' }}>
              <div style={{ fontSize:10, color:C.muted, marginBottom:4 }}>{kpi.label}</div>
              <div style={{ ...orbitron, fontSize:16, fontWeight:700, color:kpi.color }}>{kpi.value}</div>
            </div>
          ))}
        </div>
        <div style={{ marginTop:12, fontSize:9, color:`${C.muted}80`, fontStyle:'italic', lineHeight:1.6 }}>
          These projections are indicative estimates based on industry benchmark data and assessment scores. Actual ROI will vary based on implementation quality, change management effectiveness, and market conditions. This model does not constitute financial advice.
        </div>
      </div>
      <div style={{ position:'absolute', bottom:0, left:0, right:0, height:2, background:`linear-gradient(90deg, ${C.accent}, ${C.blue})` }}/>
    </div>
  )
}

/* S13 — AI Risk Register */
function S13Risks({ fnScores, orgDimScores }) {
  const ge = orgDimScores.GE || 1
  const cr = orgDimScores.CR || 1
  const dq = orgDimScores.DQ || 1
  const risks = [
    { name:'Data Quality Failure', l: dq < 2.5 ? 5 : dq < 3.5 ? 3 : 2, i:5, mitigation:'Data governance programme + automated quality monitoring', owner:'CDO', timeline:'0–6 months' },
    { name:'AI Regulatory Non-compliance', l: ge < 2.5 ? 5 : ge < 3.5 ? 3 : 2, i:5, mitigation:'AI governance framework + legal review of high-risk systems', owner:'CRO/Legal', timeline:'0–3 months' },
    { name:'Algorithmic Bias & Discrimination', l: ge < 3.0 ? 4 : 3, i:5, mitigation:'Bias testing, diverse training data, human oversight controls', owner:'Chief AI Officer', timeline:'3–9 months' },
    { name:'Model Drift & Degradation', l: orgDimScores.TR < 3.0 ? 4 : 3, i:4, mitigation:'MLOps monitoring platform with automated retraining triggers', owner:'CTO', timeline:'6–12 months' },
    { name:'AI Skills Gap', l: orgDimScores.TS < 2.5 ? 5 : orgDimScores.TS < 3.5 ? 3 : 2, i:4, mitigation:'Strategic upskilling programme + AI talent acquisition', owner:'CHRO', timeline:'6–18 months' },
    { name:'Change Resistance', l: cr < 2.5 ? 5 : cr < 3.5 ? 4 : 2, i:3, mitigation:'Executive sponsorship programme + AI champions network', owner:'CEO/CHRO', timeline:'0–12 months' },
    { name:'Vendor Lock-in', l: 3, i:3, mitigation:'Multi-vendor strategy + open standards adoption', owner:'CTO', timeline:'12–24 months' },
    { name:'Generative AI Misuse', l: 3, i:4, mitigation:'Acceptable use policy + content monitoring', owner:'CISO', timeline:'0–3 months' },
  ]
  const scoreColor = s => s >= 20 ? C.red : s >= 12 ? '#F97316' : s >= 6 ? C.amber : C.green

  return (
    <div style={{ ...page, padding:'40px 40px' }}>
      <HexBackground/>
      <div style={{ position:'relative', zIndex:1 }}>
        <div style={{ ...sectionLabel }}>13 / RISK REGISTER</div>
        <h2 style={{ ...orbitron, fontSize:20, color:C.text, margin:'0 0 16px' }}>AI Risk Register</h2>
        <table style={{ width:'100%', borderCollapse:'collapse', fontSize:10 }}>
          <thead>
            <tr style={{ borderBottom:`1px solid ${C.grid}` }}>
              {['Risk','Likelihood (1-5)','Impact (1-5)','Score','Mitigation','Owner','Timeline'].map(h => (
                <th key={h} style={{ padding:'6px 8px', textAlign:'left', color:C.muted, fontWeight:600, fontSize:8, letterSpacing:0.8, textTransform:'uppercase' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {risks.map((r, i) => {
              const score = r.l * r.i
              return (
                <tr key={i} style={{ borderBottom:`1px solid ${C.grid}` }}>
                  <td style={{ padding:'8px 8px', color:C.text, fontSize:10, fontWeight:600 }}>{r.name}</td>
                  <td style={{ padding:'8px 8px', color:C.muted, textAlign:'center', fontSize:10 }}>{r.l}</td>
                  <td style={{ padding:'8px 8px', color:C.muted, textAlign:'center', fontSize:10 }}>{r.i}</td>
                  <td style={{ padding:'8px 8px', textAlign:'center' }}>
                    <span style={{ background:`${scoreColor(score)}20`, color:scoreColor(score), borderRadius:4, padding:'2px 8px', fontWeight:700, fontSize:10, fontFamily:'monospace' }}>{score}</span>
                  </td>
                  <td style={{ padding:'8px 8px', color:C.muted, fontSize:9, lineHeight:1.4 }}>{r.mitigation}</td>
                  <td style={{ padding:'8px 8px', color:C.blue, fontSize:9 }}>{r.owner}</td>
                  <td style={{ padding:'8px 8px', color:C.muted, fontSize:9 }}>{r.timeline}</td>
                </tr>
              )
            })}
          </tbody>
        </table>

        {/* 5×5 risk matrix */}
        <div style={{ marginTop:16 }}>
          <div style={{ fontSize:9, color:C.muted, letterSpacing:2, textTransform:'uppercase', fontFamily:'monospace', marginBottom:8 }}>Risk Heat Map (Likelihood × Impact)</div>
          <div style={{ display:'grid', gridTemplateColumns:'20px repeat(5,1fr)', gridTemplateRows:'repeat(6,auto)', gap:2, maxWidth:320 }}>
            {[5,4,3,2,1].map(l => [
              <div key={`y${l}`} style={{ display:'flex', alignItems:'center', justifyContent:'center', fontSize:8, color:C.muted, fontFamily:'monospace' }}>{l}</div>,
              ...[1,2,3,4,5].map(i => {
                const score = l*i
                const bg = score>=20 ? `${C.red}60` : score>=12 ? `${C.amber}50` : score>=6 ? `${C.green}30` : C.grid
                const risksHere = risks.filter(r => r.l===l && r.i===i)
                return (
                  <div key={`${l}${i}`} style={{ height:28, background:bg, borderRadius:3, display:'flex', alignItems:'center', justifyContent:'center', fontSize:7, color:C.text }}>
                    {risksHere.map((r,ri) => <div key={ri} title={r.name} style={{ width:6, height:6, borderRadius:'50%', background:C.text, margin:1 }}/>)}
                  </div>
                )
              })
            ])}
            <div style={{ gridColumn:'1', display:'flex', alignItems:'center', justifyContent:'center' }}/>
            {[1,2,3,4,5].map(i => <div key={i} style={{ textAlign:'center', fontSize:8, color:C.muted, fontFamily:'monospace' }}>{i}</div>)}
          </div>
          <div style={{ display:'flex', gap:12, marginTop:6 }}>
            {[{l:'Critical (≥20)',c:C.red},{l:'High (12–19)',c:C.amber},{l:'Medium (6–11)',c:C.green},{l:'Low (<6)',c:C.grid}].map(x => (
              <div key={x.l} style={{ display:'flex', alignItems:'center', gap:4 }}>
                <div style={{ width:8, height:8, borderRadius:2, background:`${x.c}60` }}/>
                <span style={{ fontSize:8, color:C.muted }}>{x.l}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div style={{ position:'absolute', bottom:0, left:0, right:0, height:2, background:`linear-gradient(90deg, ${C.accent}, ${C.blue})` }}/>
    </div>
  )
}

/* S14 — ITIL 5 / AI-Native ITSM Bridge */
function S14ITSM({ fnScores, orgDimScores }) {
  const itsmScore = fnScores.itsm?.overall
  const mappings = [
    { itil:'Service Desk', aiReady:'Generative AI-powered tier-0 support; NLP ticket classification', readiness: itsmScore > 3.0 ? 'High' : itsmScore > 2.0 ? 'Medium' : 'Low' },
    { itil:'Incident Management', aiReady:'AIOps correlation, automated triage, predictive alerting', readiness: orgDimScores.TR > 3.0 ? 'High' : 'Medium' },
    { itil:'Change Enablement', aiReady:'AI risk scoring, automated CAB, intelligent rollback detection', readiness: orgDimScores.GE > 2.5 ? 'Medium' : 'Low' },
    { itil:'Continual Improvement', aiReady:'AI-driven improvement backlog; automated benchmark tracking', readiness: orgDimScores.DQ > 3.0 ? 'High' : 'Medium' },
    { itil:'Service Configuration Mgmt', aiReady:'AI-powered CMDB auto-discovery; relationship inference', readiness: orgDimScores.TR > 3.0 ? 'Medium' : 'Low' },
    { itil:'Knowledge Management', aiReady:'AI knowledge synthesis, RAG-based knowledge retrieval', readiness: orgDimScores.DQ > 3.0 && orgDimScores.TR > 2.5 ? 'High' : 'Medium' },
  ]
  const rColor = r => r === 'High' ? C.green : r === 'Medium' ? C.amber : C.red

  return (
    <div style={{ ...page }}>
      <HexBackground/>
      <div style={{ position:'relative', zIndex:1 }}>
        <div style={{ ...sectionLabel }}>14 / ITSM BRIDGE</div>
        <h2 style={{ ...orbitron, fontSize:22, color:C.text, margin:'0 0 8px' }}>
          {itsmScore ? 'AI Readiness × ITIL 5 Bridge' : 'AI-Native Operations Maturity'}
        </h2>
        <p style={{ fontSize:12, color:C.muted, lineHeight:1.8, marginBottom:20 }}>
          {itsmScore
            ? `IT Service Management was assessed at ${itsmScore.toFixed(2)}/5.0. The following table maps ITIL 5 emerging practices to AI activation readiness, identifying where AI can accelerate ITSM maturity.`
            : 'This section maps AI readiness dimensions to operational AI maturity, identifying which AI-native operational capabilities are within reach based on current scores.'}
        </p>
        <table style={{ width:'100%', borderCollapse:'collapse', fontSize:11, marginBottom:20 }}>
          <thead>
            <tr style={{ borderBottom:`1px solid ${C.grid}` }}>
              {['ITIL 5 Practice / Domain','AI-Native Capability','AI Readiness'].map(h => (
                <th key={h} style={{ padding:'8px 12px', textAlign:'left', color:C.muted, fontWeight:600, fontSize:9, letterSpacing:1 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {mappings.map((m,i) => (
              <tr key={i} style={{ borderBottom:`1px solid ${C.grid}` }}>
                <td style={{ padding:'10px 12px', color:C.text, fontSize:11, fontWeight:600 }}>{m.itil}</td>
                <td style={{ padding:'10px 12px', color:C.muted, fontSize:11 }}>{m.aiReady}</td>
                <td style={{ padding:'10px 12px' }}><span style={{ background:`${rColor(m.readiness)}20`, color:rColor(m.readiness), border:`1px solid ${rColor(m.readiness)}40`, borderRadius:100, padding:'3px 12px', fontSize:10, fontWeight:700 }}>{m.readiness}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
        <div style={{ padding:16, background:C.surface, borderRadius:10, border:`1px solid ${C.accent}30` }}>
          <div style={{ fontSize:10, color:C.accent, letterSpacing:2, textTransform:'uppercase', fontFamily:'monospace', marginBottom:8 }}>Key Insight</div>
          <p style={{ fontSize:12, color:C.muted, margin:0, lineHeight:1.8 }}>
            Organisations that achieve AI-Native ITSM status demonstrate 40–60% reduction in MTTR, 70%+ tier-0 resolution rates, and near-zero unplanned downtime through predictive operations. The bridge between current ITSM maturity and AI-Native operations requires simultaneous investment in data quality (DQ), technology readiness (TR), and governance (GE).
          </p>
        </div>
      </div>
      <div style={{ position:'absolute', bottom:0, left:0, right:0, height:2, background:`linear-gradient(90deg, ${C.accent}, ${C.blue})` }}/>
    </div>
  )
}

/* S15 — Methodology & Appendix */
function S15Appendix({ assessmentId, dateStr, orgName }) {
  return (
    <div style={{ ...page }}>
      <HexBackground/>
      <div style={{ position:'relative', zIndex:1 }}>
        <div style={{ ...sectionLabel }}>15 / METHODOLOGY & APPENDIX</div>
        <h2 style={{ ...orbitron, fontSize:22, color:C.text, margin:'0 0 20px' }}>Methodology & Appendix</h2>

        {[
          { title:'Scoring Formula', body:'dimScore = 1 + (earnedPoints / maxPoints) × 4 → range [1.0 – 5.0]\n\nEarned points: Yes = pointsYes, Partial = pointsPartial, No = 0\n\nOverall score = Σ(dimScore × dimWeight) / Σ(dimWeight for answered dimensions)\n\nMaturity tiers: AI Unaware (1.0–1.8) · AI Exploring (1.8–2.6) · AI Piloting (2.6–3.4) · AI Scaling (3.4–4.2) · AI-Native (4.2–5.0)' },
          { title:'Dimension Weights', body:'DQ: Data Quality — 25%\nTR: Tech Readiness — 20%\nTS: Talent & Skills — 20%\nGE: Governance & Ethics — 15%\nCR: Change Readiness — 10%\nVR: Value & ROI — 10%' },
          { title:'Question Bank', body:'Version: ai-question-bank.xlsx v1.0\nStructure: function_id, function_name, domain, competency_level (Exploring/Piloting/Scaling), question_id, question_text, answer_type (YPN), dim_DQ/TR/TS/GE/CR/VR weighting, points_yes/partial/no, industry_overlay, ai_use_case_hint, regulatory_ref' },
          { title:'Industry Benchmark Sources', body:'McKinsey Global AI Survey 2024 · Gartner AI Maturity Model · MIT Sloan Management Review AI Index · IBM Institute for Business Value AI Report 2024 · Deloitte AI Institute Readiness Survey · EU AI Office Adoption Metrics Q3 2025' },
          { title:'Disclaimer', body:'This report was generated automatically from self-reported assessment responses. Scores and recommendations are indicative and based on the information provided. The AI Readiness Assessment Platform does not guarantee accuracy or completeness of findings. All ROI projections, regulatory assessments, and risk ratings are illustrative and should not be relied upon for investment or compliance decisions without independent professional advice.' },
        ].map(sec => (
          <div key={sec.title} style={{ marginBottom:16, padding:14, background:C.surface, borderRadius:10, border:`1px solid ${C.border}` }}>
            <div style={{ fontSize:10, color:C.accent, fontWeight:700, textTransform:'uppercase', letterSpacing:1, fontFamily:'monospace', marginBottom:6 }}>{sec.title}</div>
            <pre style={{ fontSize:10, color:C.muted, margin:0, whiteSpace:'pre-wrap', lineHeight:1.8, fontFamily:'Inter, system-ui, sans-serif' }}>{sec.body}</pre>
          </div>
        ))}

        <div style={{ marginTop:16, padding:14, background:`${C.accent}15`, borderRadius:10, border:`1px solid ${C.accent}30`, textAlign:'center' }}>
          <div style={{ fontSize:11, color:C.text, fontWeight:600, marginBottom:2 }}>AI Readiness Assessment Platform v1.0</div>
          <div style={{ fontSize:10, color:C.muted }}>Developed by Gagandeep Singh | AI Practice · March 2026</div>
          <div style={{ fontSize:9, color:C.muted, marginTop:4, fontFamily:'monospace' }}>Assessment ID: {assessmentId} · Organisation: {orgName} · Generated: {dateStr}</div>
        </div>
      </div>
      <div style={{ position:'absolute', bottom:0, left:0, right:0, height:2, background:`linear-gradient(90deg, ${C.accent}, ${C.blue})` }}/>
    </div>
  )
}

/* ─── Main PDF Report Component ──────────────────────────────────────────── */
const PDFReport = forwardRef(function PDFReport({ assessmentData }, ref) {
  const {
    orgName, industry, region, size,
    orgOverall, orgDimScores, fnScores,
    assessmentId, dateStr,
  } = assessmentData

  return (
    <>
      <style>{FONT_IMPORT}</style>
      <div ref={ref} id="pdf-report-root" style={{ background: C.bg, fontFamily: '"Inter", "Segoe UI", system-ui, sans-serif' }}>
        <S01Cover orgName={orgName} orgOverall={orgOverall} industry={industry} region={region} assessmentId={assessmentId} dateStr={dateStr}/>
        <S02ClassifiedSummary orgName={orgName} orgOverall={orgOverall} industry={industry} orgDimScores={orgDimScores} assessmentId={assessmentId}/>
        <S03CEO orgName={orgName} industry={industry} orgOverall={orgOverall} orgDimScores={orgDimScores} size={size} region={region}/>
        <S04CTO orgName={orgName} orgDimScores={orgDimScores} fnScores={fnScores} industry={industry}/>
        <S05CHRO orgName={orgName} orgDimScores={orgDimScores} size={size}/>
        <S06Heatmap fnScores={fnScores}/>
        <S07Radar orgDimScores={orgDimScores} orgOverall={orgOverall}/>
        <S08UseCases fnScores={fnScores} orgDimScores={orgDimScores}/>
        <S09Regulatory orgDimScores={orgDimScores} region={region}/>
        <S10Gaps fnScores={fnScores} orgDimScores={orgDimScores}/>
        <S11Roadmap fnScores={fnScores} size={size}/>
        <S12ROI orgOverall={orgOverall} orgDimScores={orgDimScores} size={size}/>
        <S13Risks fnScores={fnScores} orgDimScores={orgDimScores}/>
        <S14ITSM fnScores={fnScores} orgDimScores={orgDimScores}/>
        <S15Appendix assessmentId={assessmentId} dateStr={dateStr} orgName={orgName}/>
      </div>
    </>
  )
})

export default PDFReport
