/**
 * PDFGeneratorHTML.js — Fortune 500-Grade AI Readiness Report
 * AI Readiness Assessment Platform
 * Author: Gagandeep Singh | AI Practice
 *
 * Architecture: HTML string → window.open → window.print()
 * Same proven approach as itil4-assessor.
 *
 * Sections (15 pages):
 *  Cover · TOC · CEO Briefing · CIO/CTO Scorecard · CISO Brief · Chief AI Officer ·
 *  Methodology · Current State · Dimensional Analysis · Function Heatmap ·
 *  Gap Analysis · Use Case Register · Risk Register · Roadmap · ROI · Regulatory · Appendix
 */

// ─── Colour helpers ──────────────────────────────────────────────────────────
function scoreColor(s) {
  if (s >= 4.2) return '#10B981'
  if (s >= 3.4) return '#3B82F6'
  if (s >= 2.6) return '#F59E0B'
  if (s >= 1.8) return '#F97316'
  return '#EF4444'
}
function maturityLabel(s) {
  if (s >= 4.2) return 'AI-Native'
  if (s >= 3.4) return 'AI Scaling'
  if (s >= 2.6) return 'AI Piloting'
  if (s >= 1.8) return 'AI Exploring'
  return 'AI Unaware'
}
function pct(score) { return Math.max(0, Math.min(100, ((score - 1) / 4) * 100)).toFixed(1) }
function fmt(n) { return typeof n === 'number' ? n.toFixed(2) : '—' }

const DIMS = {
  DQ: { label: 'Data Quality',       color: '#6366F1', weight: 0.30 },
  TR: { label: 'Tech Readiness',     color: '#0EA5E9', weight: 0.18 },
  TS: { label: 'Talent & Skills',    color: '#F59E0B', weight: 0.22 },
  GE: { label: 'Governance & Ethics',color: '#EF4444', weight: 0.15 },
  CR: { label: 'Change Readiness',   color: '#F97316', weight: 0.08 },
  VR: { label: 'Value & ROI',        color: '#10B981', weight: 0.07 },
}

const USE_CASES = [
  { fn:'finance',         title:'Anomaly Detection & Fraud AI',    value:'High',   complexity:'Medium', desc:'ML-based financial anomaly detection for fraud, error identification, and audit trail automation.' },
  { fn:'finance',         title:'AI-Powered Invoice Processing',   value:'High',   complexity:'Low',    desc:'Intelligent invoice matching, three-way reconciliation, and exception management at scale.' },
  { fn:'hr',              title:'Predictive Attrition Modelling',  value:'High',   complexity:'High',   desc:'ML models identifying flight-risk employees 90 days in advance to enable proactive retention.' },
  { fn:'sales',           title:'AI Revenue Forecasting',          value:'High',   complexity:'Medium', desc:'Ensemble ML pipeline for pipeline forecasting with 85%+ accuracy at 30/60/90 day horizons.' },
  { fn:'sales',           title:'Real-Time Lead Scoring',          value:'High',   complexity:'Low',    desc:'CRM-integrated lead prioritisation using behavioural signals and intent data.' },
  { fn:'marketing',       title:'Hyper-Personalisation Engine',    value:'High',   complexity:'High',   desc:'AI-driven content and offer personalisation across all customer touchpoints in real time.' },
  { fn:'customerservice', title:'Generative AI Support Agent',     value:'High',   complexity:'Medium', desc:'LLM first-line support agent handling 60-70% of queries autonomously with escalation logic.' },
  { fn:'it',              title:'AIOps & Auto-Remediation',        value:'High',   complexity:'High',   desc:'Anomaly-based infrastructure alerting with automated playbook execution, reducing MTTR by 40%.' },
  { fn:'softwaredev',     title:'AI Code Generation & Review',     value:'High',   complexity:'Low',    desc:'GitHub Copilot-class code generation increasing developer throughput by 30-50%.' },
  { fn:'data',            title:'Automated Data Quality Platform', value:'High',   complexity:'Medium', desc:'ML-driven data profiling, validation, lineage tracking, and anomaly alerting across all data domains.' },
  { fn:'data_readiness',  title:'AI Data Readiness Scoring',       value:'High',   complexity:'Medium', desc:'Continuous automated scoring of datasets for AI-readiness across quality, completeness, and governance.' },
  { fn:'ai_literacy',     title:'Adaptive AI Learning Platform',   value:'High',   complexity:'Low',    desc:'Personalised AI upskilling paths for all staff levels, driving organisation-wide AI fluency.' },
  { fn:'cybersecurity',   title:'AI-Powered Threat Detection',     value:'High',   complexity:'High',   desc:'Behavioural AI detecting zero-day threats and insider risks 10x faster than rule-based systems.' },
  { fn:'legal',           title:'Contract Intelligence Platform',  value:'High',   complexity:'Medium', desc:'NLP-based contract review, risk clause extraction, and obligation tracking at 10× speed.' },
  { fn:'supplychain',     title:'AI Demand Forecasting',           value:'High',   complexity:'High',   desc:'Multi-variate ML forecasting reducing inventory carrying costs by 15-25%.' },
  { fn:'manufacturing',   title:'Predictive Maintenance AI',       value:'High',   complexity:'High',   desc:'IoT sensor + ML models predicting equipment failure 48-72 hours in advance.' },
  { fn:'risk',            title:'AI Risk Signal Aggregation',      value:'High',   complexity:'High',   desc:'Real-time risk dashboard combining internal signals, external data, and ML-predicted exposure.' },
  { fn:'procurement',     title:'Supplier Risk Intelligence',      value:'Medium', complexity:'Medium', desc:'ML-based supplier risk scoring integrating ESG, financial health, and geopolitical signals.' },
  { fn:'qualityassurance',title:'Computer Vision QA Inspection',   value:'High',   complexity:'High',   desc:'Deep learning visual defect detection at 99.2% accuracy, replacing manual spot-check processes.' },
  { fn:'strategy',        title:'AI Scenario Planning Engine',     value:'High',   complexity:'High',   desc:'Strategic scenario modelling using market signals, competitive intelligence, and macro indicators.' },
]

// ─── SVG Helpers ─────────────────────────────────────────────────────────────
function radarSVG(dimScores, w = 300, h = 300) {
  const keys = Object.keys(DIMS)
  const cx = w / 2, cy = h / 2, r = 105
  const pts = keys.map((k, i) => {
    const ang = (i / keys.length) * 2 * Math.PI - Math.PI / 2
    const val = Math.max(1, Math.min(5, dimScores[k] || 1))
    const p = (val - 1) / 4
    return {
      x: cx + r * p * Math.cos(ang), y: cy + r * p * Math.sin(ang),
      lx: cx + (r + 28) * Math.cos(ang), ly: cy + (r + 28) * Math.sin(ang),
      key: k, val, color: DIMS[k].color
    }
  })
  const gridPts = f => keys.map((_, i) => {
    const a = (i / keys.length) * 2 * Math.PI - Math.PI / 2
    return `${cx + r * f * Math.cos(a)},${cy + r * f * Math.sin(a)}`
  }).join(' ')
  const poly = pts.map(p => `${p.x},${p.y}`).join(' ')
  return `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
    ${[0.2, 0.4, 0.6, 0.8, 1].map(f => `<polygon points="${gridPts(f)}" fill="none" stroke="#e2e8f0" stroke-width="1"/>`).join('')}
    ${keys.map((_, i) => { const a = (i / keys.length) * 2 * Math.PI - Math.PI / 2; return `<line x1="${cx}" y1="${cy}" x2="${cx + r * Math.cos(a)}" y2="${cy + r * Math.sin(a)}" stroke="#e2e8f0" stroke-width="1"/>` }).join('')}
    <polygon points="${poly}" fill="#6366F1" fill-opacity="0.15" stroke="#6366F1" stroke-width="2.5"/>
    ${pts.map(p => `
      <circle cx="${p.x}" cy="${p.y}" r="5" fill="${p.color}" stroke="#fff" stroke-width="2"/>
      <text x="${p.lx}" y="${p.ly}" text-anchor="middle" dominant-baseline="middle" font-size="10" font-weight="700" fill="${p.color}" style="font-family:Inter,system-ui">${p.key} ${p.val.toFixed(1)}</text>
    `).join('')}
    ${[1, 2, 3, 4, 5].map(v => `<text x="${cx + 4}" y="${cy - r * ((v - 1) / 4) + 4}" font-size="7.5" fill="#94a3b8">${v}</text>`).join('')}
  </svg>`
}

function hBarSVG(items, w = 440, barH = 16, gap = 5) {
  const sorted = [...items].sort((a, b) => b.val - a.val)
  const h = sorted.length * (barH + gap) + 10
  return `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
    ${sorted.map((it, i) => {
      const p = Math.max(0, Math.min(100, ((it.val - 1) / 4) * 100))
      const bw = Math.max(4, (w - 180) * p / 100)
      const y = i * (barH + gap)
      const col = scoreColor(it.val)
      const lbl = it.label.length > 26 ? it.label.slice(0, 24) + '…' : it.label
      return `<text x="0" y="${y + barH - 3}" font-size="8.5" fill="#475569" style="font-family:Inter,system-ui">${lbl}</text>
        <rect x="180" y="${y}" width="${bw}" height="${barH}" rx="3" fill="${col}" opacity="0.9"/>
        <text x="${180 + bw + 5}" y="${y + barH - 3}" font-size="9" font-weight="700" fill="${col}" style="font-family:Inter,system-ui">${it.val.toFixed(2)}</text>`
    }).join('')}
  </svg>`
}

function donutSVG(score, size = 100) {
  const col = scoreColor(score)
  const p = ((score - 1) / 4)
  const circ = 2 * Math.PI * 38
  const dash = circ * p
  return `<svg width="${size}" height="${size}" viewBox="0 0 100 100">
    <circle cx="50" cy="50" r="38" fill="none" stroke="#e2e8f0" stroke-width="10"/>
    <circle cx="50" cy="50" r="38" fill="none" stroke="${col}" stroke-width="10"
      stroke-dasharray="${dash} ${circ}" stroke-dashoffset="${circ * 0.25}"
      stroke-linecap="round"/>
    <text x="50" y="47" text-anchor="middle" dominant-baseline="middle" font-size="16" font-weight="800" fill="${col}" style="font-family:Inter,system-ui">${score.toFixed(2)}</text>
    <text x="50" y="62" text-anchor="middle" font-size="7.5" fill="#94a3b8" style="font-family:Inter,system-ui">/5.00</text>
  </svg>`
}

// ─── MAIN GENERATOR ──────────────────────────────────────────────────────────
// ─── Roadmap Goal Metadata ────────────────────────────────────────────────────
const GOAL_META = {
  automation:  { label:'Process Automation',      color:'#6366F1', icon:'⚙', bars:[[2,6],[8,18],[19,30]], actions:['Map and digitise all high-volume manual processes','Deploy RPA + AI for finance, HR and operations workflows','Expand automation to cross-functional enterprise processes'] },
  revenue:     { label:'Revenue Growth',           color:'#10B981', icon:'↗', bars:[[5,9],[12,24],[25,36]], actions:['Build AI lead scoring and pipeline forecasting models','Launch personalisation engine for sales & marketing','Scale AI-driven revenue optimisation across all channels'] },
  cx:          { label:'Customer Experience',      color:'#F59E0B', icon:'◉', bars:[[5,12],[14,24],[25,36]], actions:['Deploy AI chatbot for first-line customer support','Implement real-time personalisation across touchpoints','Build predictive CX model (churn, NPS, lifetime value)'] },
  efficiency:  { label:'Operational Efficiency',   color:'#0EA5E9', icon:'⚡', bars:[[2,6],[8,18],[19,36]], actions:['Identify top 10 efficiency use cases by function','Deploy AI-assisted scheduling, routing and resource planning','AI-driven continuous process improvement at scale'] },
  risk:        { label:'Risk & Compliance',        color:'#EF4444', icon:'⬡', bars:[[1,6],[8,18],[19,36]], actions:['Classify AI systems under EU AI Act risk tiers','Deploy AI-powered compliance monitoring and alerting','Fully automated risk signal aggregation and board reporting'] },
  innovation:  { label:'Innovation & R&D',         color:'#8B5CF6', icon:'◈', bars:[[8,15],[18,27],[27,36]], actions:['Establish AI sandbox for R&D experimentation','Launch AI-accelerated product development pilots','AI-driven innovation pipeline and IP generation platform'] },
  workforce:   { label:'Workforce Transformation', color:'#F97316', icon:'◎', bars:[[1,6],[6,18],[19,36]], actions:['Launch mandatory AI literacy programme (80% target)','Train AI champions and build internal AI guild','Embed AI into every role; AI-first hiring & culture'] },
  data:        { label:'Data Intelligence',        color:'#06B6D4', icon:'▲', bars:[[1,6],[6,12],[12,36]], actions:['Audit all data assets for quality, lineage & completeness','Build enterprise data platform and feature store','AI-driven data quality platform with continuous monitoring'] },
}

// ─── Build WOW Roadmap SVG ────────────────────────────────────────────────────
function buildRoadmapSVG(activeGoalIds, w = 680) {
  const goals = activeGoalIds.length > 0 ? activeGoalIds : ['automation','efficiency','data','workforce']
  const activeGoals = goals.map(id => ({ id, ...(GOAL_META[id] || GOAL_META.data) }))

  const LABEL_W = 132
  const CHART_W = w - LABEL_W
  const mx = m => LABEL_W + (m / 36) * CHART_W

  const PHASE_H = 46
  const LANE_H  = 22
  const LANE_GAP = 5
  const CM_H    = 20
  const totalH  = PHASE_H + activeGoals.length * (LANE_H + LANE_GAP) + CM_H + LANE_GAP + 14

  const PHASES = [
    { label:'Foundation', ms:'M1–6',   start:0,  end:6,  color:'#6366F1' },
    { label:'Pilot & Build', ms:'M7–18', start:6, end:18, color:'#0EA5E9' },
    { label:'Scale & Optimise', ms:'M19–36', start:18, end:36, color:'#10B981' },
  ]
  const MILESTONES = [
    { m:1,  label:'Governance',  color:'#6366F1' },
    { m:3,  label:'Data Audit',  color:'#6366F1' },
    { m:6,  label:'Literacy\nMet', color:'#a5b4fc' },
    { m:9,  label:'Pilots Live', color:'#0EA5E9' },
    { m:18, label:'Scale\nApproved', color:'#7dd3fc' },
    { m:24, label:'AI CoE',      color:'#10B981' },
    { m:36, label:'AI-Native\n★', color:'#6ee7b7' },
  ]

  let s = `<svg width="${w}" height="${totalH}" viewBox="0 0 ${w} ${totalH}" xmlns="http://www.w3.org/2000/svg">`

  // Phase column backgrounds
  PHASES.forEach(p => {
    const x1 = mx(p.start), x2 = mx(p.end)
    s += `<rect x="${x1}" y="0" width="${x2-x1-1}" height="${totalH}" fill="${p.color}" opacity="0.06" rx="0"/>`
    s += `<rect x="${x1}" y="0" width="${x2-x1-1}" height="${PHASE_H}" fill="${p.color}" opacity="0.18"/>`
    s += `<text x="${(x1+x2)/2}" y="17" text-anchor="middle" font-size="10" font-weight="800" fill="${p.color}" font-family="Inter,system-ui">${p.label}</text>`
    s += `<text x="${(x1+x2)/2}" y="30" text-anchor="middle" font-size="8" fill="${p.color}" font-family="Inter,system-ui" opacity="0.7">${p.ms}</text>`
  })

  // Phase vertical dividers
  s += `<line x1="${LABEL_W}" y1="0" x2="${LABEL_W}" y2="${totalH}" stroke="rgba(255,255,255,0.08)" stroke-width="1"/>`
  ;[6, 18, 36].forEach(m => {
    s += `<line x1="${mx(m)}" y1="0" x2="${mx(m)}" y2="${totalH}" stroke="rgba(255,255,255,0.12)" stroke-width="1.5" stroke-dasharray="5,4"/>`
  })

  // Month tick marks every 6
  for (let m = 0; m <= 36; m += 6) {
    const x = mx(m)
    s += `<line x1="${x}" y1="${PHASE_H-6}" x2="${x}" y2="${PHASE_H}" stroke="rgba(255,255,255,0.25)" stroke-width="1"/>`
  }

  // Label column opaque background
  s += `<rect x="0" y="0" width="${LABEL_W}" height="${totalH}" fill="#0F1929"/>`
  s += `<text x="6" y="14" font-size="8" font-weight="700" fill="rgba(255,255,255,0.2)" font-family="Inter,system-ui" letter-spacing="1">PRIORITY</text>`
  s += `<text x="${LABEL_W/2+8}" y="14" text-anchor="middle" font-size="8" font-weight="700" fill="rgba(255,255,255,0.2)" font-family="Inter,system-ui" letter-spacing="1">GOAL STREAM</text>`

  // Goal swim lanes
  activeGoals.forEach((g, i) => {
    const color = g.color
    const y = PHASE_H + i * (LANE_H + LANE_GAP)
    const lbl = (g.label || '').length > 20 ? (g.label || '').slice(0,18)+'…' : (g.label || '')

    // Lane alternating bg
    if (i % 2 === 0) s += `<rect x="${LABEL_W}" y="${y}" width="${CHART_W}" height="${LANE_H}" fill="${color}" opacity="0.04"/>`

    // Priority number
    s += `<rect x="4" y="${y+4}" width="18" height="14" rx="4" fill="${color}" opacity="0.9"/>`
    s += `<text x="13" y="${y+14}" text-anchor="middle" font-size="8" font-weight="900" fill="#fff" font-family="Inter,system-ui">P${i+1}</text>`

    // Goal label
    s += `<text x="28" y="${y+LANE_H/2+3}" font-size="8.5" font-weight="700" fill="${color}" font-family="Inter,system-ui">${lbl}</text>`

    // Work bars (foundation/pilot/scale intensities)
    ;(g.bars || []).forEach((bar, bi) => {
      const bx1 = mx(bar[0])
      const bx2 = mx(bar[1])
      const opac = bi === 0 ? 0.4 : bi === 1 ? 0.65 : 0.9
      s += `<rect x="${bx1+2}" y="${y+4}" width="${bx2-bx1-4}" height="${LANE_H-8}" fill="${color}" opacity="${opac}" rx="3"/>`
      if (bx2 - bx1 > 28) {
        const ltext = bi === 0 ? 'Build' : bi === 1 ? 'Deploy' : 'Scale'
        s += `<text x="${(bx1+bx2)/2}" y="${y+LANE_H/2+3}" text-anchor="middle" font-size="7" font-weight="700" fill="rgba(255,255,255,0.85)" font-family="Inter,system-ui">${ltext}</text>`
      }
    })
  })

  // Change Management lane
  const cmY = PHASE_H + activeGoals.length * (LANE_H + LANE_GAP) + LANE_GAP
  s += `<rect x="${LABEL_W}" y="${cmY}" width="${CHART_W}" height="${CM_H}" fill="rgba(255,255,255,0.03)"/>`
  s += `<text x="28" y="${cmY+CM_H/2+3}" font-size="8" font-weight="600" fill="rgba(255,255,255,0.35)" font-family="Inter,system-ui">Change Management</text>`
  s += `<rect x="${mx(0)+2}" y="${cmY+4}" width="${mx(36)-mx(0)-4}" height="${CM_H-8}" fill="rgba(255,255,255,0.06)" rx="3"/>`
  s += `<text x="${(mx(0)+mx(36))/2}" y="${cmY+CM_H/2+3}" text-anchor="middle" font-size="7.5" fill="rgba(255,255,255,0.28)" font-family="Inter,system-ui">Communications · Training · Stakeholder Engagement · Leadership Alignment · Culture</text>`

  // Milestone diamonds (draw last so they sit on top)
  MILESTONES.forEach(ms => {
    const x = mx(ms.m)
    const y = PHASE_H - 4
    const size = 5
    s += `<polygon points="${x},${y-size} ${x+size},${y} ${x},${y+size} ${x-size},${y}" fill="${ms.color}" stroke="#0F1929" stroke-width="1.5"/>`
  })

  s += '</svg>'
  return { svg: s, activeGoals }
}

export function generateAIReadinessPDFHTML({
  orgName = 'Organisation', industry = '', region = '', orgSize = 'medium',
  overallScore = 1.0, dimScores = {}, functionScores = {},
  assessedBy = '', completedAt = Date.now(), assessmentId = '',
  goals = []
}) {
  const dateStr = new Date(completedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
  const sc = scoreColor(overallScore)
  const ml = maturityLabel(overallScore)
  const TARGET = 4.0

  // ── Derived data ──
  const fnEntries = Object.entries(functionScores).filter(([, v]) => typeof v === 'number' && !isNaN(v))
  const fnCount = fnEntries.length
  const sortedFns = [...fnEntries].sort((a, b) => b[1] - a[1])
  const topFns = sortedFns.slice(0, 5)
  const gapFns = [...sortedFns].reverse().slice(0, 5)
  const criticalGaps = fnEntries.filter(([, s]) => s < 2.5)
  const onTarget = fnEntries.filter(([, s]) => s >= TARGET - 0.5)

  // Org size meta
  const sizeKey = orgSize?.toLowerCase().includes('large') ? 'large'
    : orgSize?.toLowerCase().includes('small') ? 'small' : 'medium'
  const ORG_META = {
    small:  { label: 'Small (<500)',      budget: '£80K–£200K',   yr1: '£120K–£350K',  yr2: '£400K–£900K',  yr3: '£800K–£2M',   payback: '18–24 months', employees: 250 },
    medium: { label: 'Mid-Market',        budget: '£300K–£1.5M',  yr1: '£500K–£1.5M',  yr2: '£1.5M–£5M',   yr3: '£4M–£12M',    payback: '12–18 months', employees: 2500 },
    large:  { label: 'Large Enterprise',  budget: '£1.5M–£8M',    yr1: '£2M–£8M',      yr2: '£8M–£25M',     yr3: '£20M–£60M',   payback: '9–15 months',  employees: 10000 },
  }
  const orgMeta = ORG_META[sizeKey]

  // ROI model
  const headcount = orgMeta.employees
  const avgSalary = 72000
  const effGain = 0.10 + (TARGET - overallScore) * 0.035
  const annualSaving = Math.round(headcount * avgSalary * effGain)
  const implCost = Math.round(headcount * 2800 + fnCount * 22000)
  const yr1 = Math.round(annualSaving * 0.35)
  const yr2 = Math.round(annualSaving * 0.75)
  const yr3 = annualSaving
  const roi3yr = Math.round(((yr1 + yr2 + yr3 - implCost) / implCost) * 100)
  const paybackMo = Math.ceil(implCost / (annualSaving / 12))

  // Auto-generate risks from scores
  const risks = []
  fnEntries.forEach(([id, s]) => {
    const name = id.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
    if (s < 2.0) risks.push({ area: name, risk: `No structured AI process in ${name}`, likelihood: 'High', impact: 'Critical', rating: 16, cat: 'Process' })
    else if (s < 2.6) risks.push({ area: name, risk: `Inconsistent AI adoption in ${name}`, likelihood: 'High', impact: 'High', rating: 12, cat: 'Consistency' })
  })
  if ((dimScores.DQ || 1) < 2.5) risks.push({ area: 'Data', risk: 'Poor data quality will cause AI model failures at scale', likelihood: 'High', impact: 'Critical', rating: 16, cat: 'Data' })
  if ((dimScores.GE || 1) < 2.5) risks.push({ area: 'Governance', risk: 'Absence of AI governance creates EU AI Act non-compliance exposure', likelihood: 'High', impact: 'Critical', rating: 16, cat: 'Regulatory' })
  if ((dimScores.TS || 1) < 2.5) risks.push({ area: 'Talent', risk: 'Critical AI skills gap — organisation cannot execute AI programmes without external dependency', likelihood: 'High', impact: 'High', rating: 12, cat: 'People' })
  if (overallScore < 2.5) risks.push({ area: 'Strategic', risk: 'Systemic AI unreadiness creates competitive disadvantage and board-level reputational risk', likelihood: 'High', impact: 'Critical', rating: 16, cat: 'Strategic' })
  const topRisks = risks.sort((a, b) => b.rating - a.rating).slice(0, 12)

  function riskColor(r) {
    if (r >= 16) return '#DC2626'; if (r >= 10) return '#F97316'; if (r >= 5) return '#F59E0B'; return '#10B981'
  }
  function riskLabel(r) {
    if (r >= 16) return 'CRITICAL'; if (r >= 10) return 'HIGH'; if (r >= 5) return 'MEDIUM'; return 'LOW'
  }

  // ─── CSS ──────────────────────────────────────────────────────────────────
  const css = `
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Inter', system-ui, -apple-system, sans-serif; font-size: 13px; color: #1e293b; background: #fff; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    .page { padding: 40px 52px 70px; min-height: 1050px; max-height: 1120px; overflow: hidden; position: relative; page-break-after: always; }
    .page-light { background: #ffffff; }
    .page-alt { background: #f8fafc; }
    .page-break { page-break-after: always; }
    h1 { font-size: 40px; font-weight: 900; line-height: 1.15; }
    h2 { font-size: 26px; font-weight: 800; color: #0f172a; margin-bottom: 6px; }
    h3 { font-size: 18px; font-weight: 700; color: #0f172a; margin-bottom: 4px; }
    h4 { font-size: 13px; font-weight: 700; color: #334155; margin-bottom: 3px; }
    p { color: #475569; line-height: 1.75; }
    .section-label { font-size: 10px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; color: #94a3b8; margin-bottom: 10px; }
    .kpi-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 14px; margin: 20px 0; }
    .kpi-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 18px 20px; }
    .kpi-value { font-size: 28px; font-weight: 900; line-height: 1; margin-bottom: 4px; }
    .kpi-label { font-size: 11px; color: #64748b; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; }
    .kpi-sub { font-size: 10.5px; color: #94a3b8; margin-top: 3px; }
    .card { background: #fff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px 22px; margin-bottom: 14px; }
    .card-accent { border-left: 4px solid #6366F1; }
    .insight-box { background: #f0f4ff; border: 1px solid #c7d2fe; border-radius: 12px; padding: 18px 22px; margin: 16px 0; }
    .insight-box p { color: #3730a3; }
    .bar-row { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; }
    .bar-label { font-size: 11.5px; color: #334155; font-weight: 500; width: 160px; flex-shrink: 0; }
    .bar-track { flex: 1; height: 8px; background: #e2e8f0; border-radius: 4px; overflow: hidden; }
    .bar-fill { height: 100%; border-radius: 4px; }
    .bar-score { font-size: 11px; font-weight: 700; width: 36px; text-align: right; }
    .toc-row { display: flex; align-items: center; gap: 12px; padding: 7px 0; border-bottom: 1px solid #f1f5f9; }
    .toc-num { width: 28px; height: 28px; border-radius: 7px; background: #6366F1; color: #fff; font-size: 11px; font-weight: 800; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
    .toc-dots { flex: 1; border-bottom: 2px dotted #cbd5e1; }
    table { width: 100%; border-collapse: collapse; font-size: 11.5px; }
    th { background: #f1f5f9; padding: 8px 10px; text-align: left; font-size: 10px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; }
    td { padding: 8px 10px; border-bottom: 1px solid #f1f5f9; color: #334155; vertical-align: top; }
    tr:hover td { background: #fafafa; }
    .badge { display: inline-block; padding: 2px 9px; border-radius: 20px; font-size: 10px; font-weight: 700; }
    .maturity-badge { display: inline-flex; align-items: center; padding: 4px 12px; border-radius: 20px; font-size: 11px; font-weight: 700; }
    .two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
    .three-col { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px; }
    .flex-row { display: flex; gap: 16px; align-items: flex-start; }
    .page-footer { position: absolute; bottom: 18px; left: 52px; right: 52px; display: flex; justify-content: space-between; align-items: center; border-top: 1px solid #e2e8f0; padding-top: 8px; font-size: 10px; color: #94a3b8; background:#fff; }
    .phase-card { border-left: 4px solid; border-radius: 12px; padding: 16px 20px; margin-bottom: 14px; background: #f8fafc; }
    .risk-badge { display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 9px; font-weight: 800; letter-spacing: 0.5px; }
    @media print {
      body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      .page { page-break-after: always; }
      @page { size: A4 portrait; margin: 0; }
    }
  `

  // ─── COVER PAGE ───────────────────────────────────────────────────────────
  const cover = `
<div style="min-height:100vh;background:linear-gradient(150deg,#0A0E1A 0%,#0F1929 45%,#1a0a3a 100%);position:relative;overflow:hidden;display:flex;flex-direction:column;justify-content:space-between;padding:0;page-break-after:always;">
  <!-- Geometric art -->
  <svg style="position:absolute;top:0;right:0;opacity:.06" width="700" height="700" viewBox="0 0 700 700">
    <circle cx="600" cy="80" r="340" fill="#6366F1"/>
    <circle cx="500" cy="600" r="220" fill="#0EA5E9"/>
    <polygon points="80,80 280,80 180,240" fill="#F59E0B" opacity=".6"/>
    <rect x="50" y="400" width="180" height="180" rx="36" fill="#10B981" transform="rotate(20,140,490)"/>
  </svg>
  <div style="position:absolute;bottom:-100px;left:-80px;width:500px;height:500px;border-radius:50%;background:rgba(99,102,241,.08)"></div>
  <!-- Header -->
  <div style="background:rgba(255,255,255,.05);backdrop-filter:blur(12px);padding:22px 56px;border-bottom:1px solid rgba(255,255,255,.1);display:flex;justify-content:space-between;align-items:center;">
    <div style="display:flex;align-items:center;gap:14px;">
      <div style="width:44px;height:44px;border-radius:12px;background:linear-gradient(135deg,#6366F1,#8B5CF6);display:flex;align-items:center;justify-content:center;font-size:20px;">◈</div>
      <div>
        <div style="color:#fff;font-weight:800;font-size:16px;letter-spacing:.5px;">AI Readiness Assessor</div>
        <div style="color:rgba(255,255,255,.5);font-size:10px;letter-spacing:1.5px;text-transform:uppercase;">AI Practice</div>
      </div>
    </div>
    <div style="text-align:right;">
      <div style="color:rgba(255,255,255,.4);font-size:10px;letter-spacing:1.5px;text-transform:uppercase;">CONFIDENTIAL</div>
      <div style="color:rgba(255,255,255,.3);font-size:10px;margin-top:2px;">For Board & C-Suite Use Only</div>
    </div>
  </div>
  <!-- Main -->
  <div style="padding:60px 56px;flex:1;display:flex;flex-direction:column;justify-content:center;">
    <div style="margin-bottom:16px;">
      <span style="background:rgba(99,102,241,.7);color:#fff;padding:6px 18px;border-radius:20px;font-size:10px;font-weight:800;letter-spacing:2px;text-transform:uppercase;">AI READINESS ASSESSMENT REPORT</span>
    </div>
    ${orgName ? `<div style="color:rgba(255,255,255,.75);font-size:20px;font-weight:700;margin-bottom:12px;">${orgName}${industry ? ` · <span style="font-weight:400">${industry}</span>` : ''}</div>` : ''}
    <h1 style="color:#fff;font-size:46px;font-weight:900;line-height:1.1;margin:0 0 20px;max-width:700px;">
      Enterprise AI<br/>Readiness &<br/><span style="background:linear-gradient(135deg,#6366F1,#0EA5E9);-webkit-background-clip:text;-webkit-text-fill-color:transparent;">Transformation Report</span>
    </h1>
    <p style="color:rgba(255,255,255,.6);font-size:15px;max-width:540px;line-height:1.8;margin-bottom:48px;">A comprehensive analysis of AI maturity across ${fnCount} organisational functions — with dimensional scoring, gap analysis, use case register, risk assessment, and a data-driven strategic roadmap.</p>
    <!-- Stat pills -->
    <div style="display:flex;gap:18px;flex-wrap:wrap;margin-bottom:48px;">
      <div style="background:rgba(255,255,255,.1);backdrop-filter:blur(8px);border:1px solid rgba(255,255,255,.15);border-radius:14px;padding:18px 26px;">
        <div style="color:${sc};font-size:32px;font-weight:900;">${overallScore.toFixed(2)}</div>
        <div style="color:rgba(255,255,255,.55);font-size:10.5px;margin-top:3px;">Overall AI Score</div>
      </div>
      <div style="background:rgba(255,255,255,.1);backdrop-filter:blur(8px);border:1px solid rgba(255,255,255,.15);border-radius:14px;padding:18px 26px;">
        <div style="color:${sc};font-size:32px;font-weight:900;">${ml}</div>
        <div style="color:rgba(255,255,255,.55);font-size:10.5px;margin-top:3px;">Maturity Tier</div>
      </div>
      <div style="background:rgba(255,255,255,.1);backdrop-filter:blur(8px);border:1px solid rgba(255,255,255,.15);border-radius:14px;padding:18px 26px;">
        <div style="color:#fff;font-size:32px;font-weight:900;">${fnCount}</div>
        <div style="color:rgba(255,255,255,.55);font-size:10.5px;margin-top:3px;">Functions Assessed</div>
      </div>
      <div style="background:rgba(255,255,255,.1);backdrop-filter:blur(8px);border:1px solid rgba(255,255,255,.15);border-radius:14px;padding:18px 26px;">
        <div style="color:#EF4444;font-size:32px;font-weight:900;">${criticalGaps.length}</div>
        <div style="color:rgba(255,255,255,.55);font-size:10.5px;margin-top:3px;">Critical Gaps</div>
      </div>
    </div>
  </div>
  <!-- Footer -->
  <div style="padding:22px 56px;background:rgba(0,0,0,.25);border-top:1px solid rgba(255,255,255,.08);display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:16px;">
    <div><div style="color:rgba(255,255,255,.4);font-size:10px;">Prepared for</div><div style="color:#fff;font-size:13px;font-weight:700;">${orgName} — CEO · CIO · CISO · Chief AI Officer</div></div>
    <div style="text-align:center;"><div style="color:rgba(255,255,255,.4);font-size:10px;">Assessed by</div><div style="color:#fff;font-size:13px;font-weight:700;">${assessedBy || 'AI Practice Consultant'}</div></div>
    <div style="text-align:right;"><div style="color:rgba(255,255,255,.4);font-size:10px;">Report Date</div><div style="color:#fff;font-size:13px;font-weight:700;">${dateStr}</div></div>
  </div>
</div>`

  // ─── TABLE OF CONTENTS ────────────────────────────────────────────────────
  const toc = `
<div class="page page-light">
  <div class="section-label">Navigation</div>
  <h2 style="font-size:26px;color:#0f172a;margin-bottom:4px;">Table of Contents</h2>
  <p style="margin-bottom:16px;font-size:12px;">Prepared exclusively for the Board and C-Suite. Assessment ID: <strong style="font-family:monospace;color:#6366F1;">${assessmentId || 'N/A'}</strong></p>
  ${[
    ['01','CEO Briefing','Board-Ready Summary · Financial Impact · Strategic Decisions','3'],
    ['02','CIO / CTO Technical Scorecard','Infrastructure · MLOps · AI Platform Readiness','4'],
    ['03','CISO AI Risk & Compliance Brief','EU AI Act · Model Governance · Data Privacy Posture','5'],
    ['04','Chief AI Officer Capability Map','AI Maturity by Function · Use Case Pipeline · Talent','6'],
    ['05','Assessment Methodology','Framework · Scoring Formula · Dimensions · Maturity Tiers','7'],
    ['06','Current State Analysis','Overall Score · Maturity Distribution · Benchmarks','8'],
    ['07','Dimensional Analysis','6-Dimension Radar · Deep Dive per Dimension','9'],
    ['08','Function Performance Heatmap',`All ${fnCount} Functions Scored · Domain Grouping`,'10'],
    ['09','Gap Analysis','Current vs Target · Priority Matrix · Quick Wins','11'],
    ['10','AI Use Case Register','Prioritised Use Cases · Value · Complexity','12'],
    ['11','Risk Register','Risk Identification · Likelihood/Impact · Controls','13'],
    ['12','Investment Roadmap','3-Phase Plan · Milestones · Resources','14'],
    ['13','ROI & Business Case','Investment · Savings · Payback · NPV','15'],
    ['14','Regulatory Readiness','EU AI Act · UK GDPR · FCA · ISO 42001 · NIST','16'],
  ].map(([num, title, sub, pg]) => `
    <div class="toc-row">
      <div class="toc-num">${num}</div>
      <div style="flex:1;">
        <div style="font-weight:700;color:#1e293b;font-size:12.5px;">${title}</div>
        <div style="font-size:10px;color:#94a3b8;margin-top:1px;">${sub}</div>
      </div>
      <div class="toc-dots"></div>
      <div style="font-weight:800;color:#6366F1;font-size:12px;white-space:nowrap;">pg. ${pg}</div>
    </div>`).join('')}
  <div style="background:#f0f4ff;border:1px solid #c7d2fe;border-radius:10px;padding:12px 16px;margin-top:14px;page-break-inside:avoid;">
    <span style="font-size:11.5px;font-weight:700;color:#3730a3;">How to Read This Report: </span>
    <span style="font-size:11.5px;color:#3730a3;">Scores use a 1–5 scale: <strong>1.0–1.8 = AI Unaware → 4.2–5.0 = AI-Native</strong>. Target benchmark: <strong>3.4 (AI Scaling)</strong>. Sections 01–04 are role-specific C-suite briefings. Sections 05–14 provide the full analytical detail.</span>
  </div>
  <div class="page-footer"><span>AI Readiness Assessor · AI Practice · Confidential</span><span>© ${new Date().getFullYear()} AI Practice</span></div>
</div>`

  // ─── S01: CEO BRIEFING ────────────────────────────────────────────────────
  const ceoBriefing = `
<div class="page page-light">
  <div class="section-label">Section 01 · CEO Briefing</div>
  <h2>Board-Ready Executive Summary</h2>
  <div style="background:#f0f4ff;border:1px solid #c7d2fe;border-radius:12px;padding:18px 22px;margin:16px 0 20px;">
    <p style="color:#3730a3;font-size:14px;line-height:1.8;"><strong>${orgName}</strong> has been assessed across <strong>${fnCount} organisational functions</strong> and 6 AI Readiness Dimensions. The organisation currently operates at <strong style="color:${sc}">${ml} (${overallScore.toFixed(2)}/5.00)</strong> — ${overallScore >= 3.4 ? 'demonstrating a strong foundation with active AI programmes. The strategic priority is accelerating value capture and scaling proven pilots.' : overallScore >= 2.6 ? 'indicating early AI adoption with meaningful pilots underway. Foundational gaps in data quality and governance require board-level investment to prevent AI programme failure.' : 'indicating significant pre-work required before AI can deliver enterprise-grade value. Unaddressed, this creates a widening competitive disadvantage as industry peers accelerate AI adoption.'}</p>
  </div>
  <div class="kpi-grid">
    <div class="kpi-card" style="border-left:4px solid ${sc};">${donutSVG(overallScore, 80)}<div class="kpi-label" style="margin-top:8px;">AI Readiness Score</div></div>
    <div class="kpi-card" style="border-left:4px solid #EF4444;"><div class="kpi-value" style="color:#EF4444;">${criticalGaps.length}</div><div class="kpi-label">Critical Gaps</div><div class="kpi-sub">Functions scoring below 2.5</div></div>
    <div class="kpi-card" style="border-left:4px solid #10B981;"><div class="kpi-value" style="color:#10B981;">${onTarget.length}</div><div class="kpi-label">On Target</div><div class="kpi-sub">Functions at AI Scaling+</div></div>
    <div class="kpi-card" style="border-left:4px solid #6366F1;"><div class="kpi-value" style="color:#6366F1;">£${(yr1 / 1000000).toFixed(1)}M+</div><div class="kpi-label">Year 1 Potential Benefit</div><div class="kpi-sub">Based on org size & readiness</div></div>
  </div>
  <div class="two-col" style="margin-top:4px;">
    <div>
      <h4 style="margin-bottom:10px;color:#10B981;">▲ Top Strengths</h4>
      ${topFns.slice(0,4).map(([id, s]) => `
        <div class="bar-row">
          <div class="bar-label">${id.replace(/_/g,' ').replace(/\b\w/g,c=>c.toUpperCase())}</div>
          <div class="bar-track"><div class="bar-fill" style="width:${pct(s)}%;background:${scoreColor(s)};"></div></div>
          <div class="bar-score" style="color:${scoreColor(s)}">${fmt(s)}</div>
        </div>`).join('')}
    </div>
    <div>
      <h4 style="margin-bottom:10px;color:#EF4444;">▼ Critical Gaps</h4>
      ${gapFns.slice(0,4).map(([id, s]) => `
        <div class="bar-row">
          <div class="bar-label">${id.replace(/_/g,' ').replace(/\b\w/g,c=>c.toUpperCase())}</div>
          <div class="bar-track"><div class="bar-fill" style="width:${pct(s)}%;background:${scoreColor(s)};"></div></div>
          <div class="bar-score" style="color:${scoreColor(s)}">${fmt(s)}</div>
        </div>`).join('')}
    </div>
  </div>
  <h3 style="margin-top:20px;margin-bottom:12px;">Strategic Decision Matrix</h3>
  <table>
    <thead><tr><th>Decision Area</th><th>Current State</th><th>Required Action</th><th>Timeline</th><th>Owner</th></tr></thead>
    <tbody>
      <tr><td><strong>AI Governance</strong></td><td style="color:${(dimScores.GE||1)<2.5?'#EF4444':'#10B981'}">${(dimScores.GE||1)<2.5?'Not Established':'Developing'}</td><td>Appoint Chief AI Officer; establish AI Steering Committee</td><td>0–90 days</td><td>CEO</td></tr>
      <tr><td><strong>Data Investment</strong></td><td style="color:${(dimScores.DQ||1)<2.5?'#EF4444':'#10B981'}">${(dimScores.DQ||1)<2.5?'Insufficient':'Adequate'}</td><td>Commission data quality audit; fund data platform upgrade</td><td>90–180 days</td><td>CIO</td></tr>
      <tr><td><strong>AI Literacy</strong></td><td style="color:${(dimScores.TS||1)<2.5?'#EF4444':'#10B981'}">${(dimScores.TS||1)<2.5?'Limited':'Building'}</td><td>Launch mandatory AI literacy programme across all levels</td><td>0–180 days</td><td>CHRO</td></tr>
      <tr><td><strong>Pilot Portfolio</strong></td><td style="color:${overallScore<2.6?'#EF4444':'#F59E0B'}">${overallScore<2.6?'None':'1–2 Pilots'}</td><td>Identify and fund 3 high-ROI AI pilots with board sponsorship</td><td>90–270 days</td><td>CIO / CAIO</td></tr>
      <tr><td><strong>Regulatory</strong></td><td style="color:${(dimScores.GE||1)<2.5?'#EF4444':'#F59E0B'}">${(dimScores.GE||1)<2.5?'Exposed':'Reviewing'}</td><td>EU AI Act risk classification for all AI systems</td><td>0–180 days</td><td>GC / CISO</td></tr>
    </tbody>
  </table>
  <div class="page-footer"><span>${orgName} · AI Readiness Assessment · Confidential</span><span>Page 3</span></div>
</div>`

  // ─── S02: CIO/CTO SCORECARD ───────────────────────────────────────────────
  const cioScorecard = `
<div class="page page-alt">
  <div class="section-label">Section 02 · CIO / CTO Technical Scorecard</div>
  <h2>Technical Readiness Assessment</h2>
  <p style="margin-bottom:20px;">Technical dimensions (Data Quality, Tech Readiness) account for 48% of the overall AI readiness score. This section provides the CIO/CTO with an actionable technical remediation agenda.</p>
  <div class="two-col">
    <div>
      <div class="card card-accent">
        <div class="section-label">Data Quality (DQ) · Weight 30%</div>
        <div style="display:flex;align-items:center;gap:14px;margin-bottom:12px;">
          ${donutSVG(dimScores.DQ || 1, 70)}
          <div>
            <div style="font-size:22px;font-weight:900;color:${scoreColor(dimScores.DQ||1)}">${fmt(dimScores.DQ||1)}</div>
            <div style="font-size:11px;color:#64748b;">${maturityLabel(dimScores.DQ||1)}</div>
          </div>
        </div>
        <div style="font-size:11.5px;color:#475569;line-height:1.7;">${(dimScores.DQ||1)<2.5?'<strong style="color:#EF4444;">Critical:</strong> Data quality is insufficient for reliable AI model training. High risk of biased or inaccurate AI outputs. Immediate data quality programme required.':'<strong style="color:#F59E0B;">Developing:</strong> Data quality foundations exist but coverage and consistency need strengthening before scaling AI across all functions.'}</div>
      </div>
      <div class="card">
        <div class="section-label">Tech Readiness (TR) · Weight 18%</div>
        <div style="display:flex;align-items:center;gap:14px;margin-bottom:12px;">
          ${donutSVG(dimScores.TR || 1, 70)}
          <div>
            <div style="font-size:22px;font-weight:900;color:${scoreColor(dimScores.TR||1)}">${fmt(dimScores.TR||1)}</div>
            <div style="font-size:11px;color:#64748b;">${maturityLabel(dimScores.TR||1)}</div>
          </div>
        </div>
        <div style="font-size:11.5px;color:#475569;line-height:1.7;">${(dimScores.TR||1)<2.5?'<strong style="color:#EF4444;">Critical:</strong> Infrastructure lacks AI/ML tooling, API integration, and MLOps capabilities. Cloud platform maturity insufficient for production AI deployment.':'<strong style="color:#F59E0B;">Developing:</strong> Core infrastructure is AI-capable but MLOps maturity (CI/CD for models, monitoring, drift detection) needs investment.'}</div>
      </div>
    </div>
    <div>
      <h4 style="margin-bottom:12px;">Technical Remediation Priorities</h4>
      ${[
        { pri:'P1', title:'Data Platform Consolidation', action:'Implement unified data lakehouse (Snowflake/Databricks/BigQuery). Establish single source of truth for AI training data.', timeline:'Q1–Q2', cost:'£200K–£800K' },
        { pri:'P1', title:'MLOps Foundation', action:'Deploy MLflow/Vertex AI/Azure ML for model versioning, experiment tracking, and automated retraining pipelines.', timeline:'Q2–Q3', cost:'£150K–£500K' },
        { pri:'P2', title:'API Integration Layer', action:'Build API mesh enabling AI models to consume live operational data across CRM, ERP, and ITSM systems.', timeline:'Q2–Q4', cost:'£100K–£400K' },
        { pri:'P2', title:'Data Quality Automation', action:'Deploy Great Expectations or Monte Carlo for continuous data quality monitoring, profiling, and alerting.', timeline:'Q1–Q3', cost:'£80K–£250K' },
        { pri:'P3', title:'AI Model Governance Platform', action:'Implement model registry, bias monitoring, explainability tooling, and automated compliance reporting.', timeline:'Q3–Q4', cost:'£120K–£350K' },
      ].map(item => `
        <div style="display:flex;gap:10px;margin-bottom:12px;padding:12px;background:#fff;border:1px solid #e2e8f0;border-radius:10px;">
          <div style="width:28px;height:28px;border-radius:6px;background:${item.pri==='P1'?'#EF4444':item.pri==='P2'?'#F59E0B':'#6366F1'};color:#fff;font-size:9px;font-weight:800;display:flex;align-items:center;justify-content:center;flex-shrink:0;">${item.pri}</div>
          <div>
            <div style="font-size:12px;font-weight:700;color:#0f172a;margin-bottom:3px;">${item.title} <span style="font-size:10px;color:#94a3b8;font-weight:400;">· ${item.timeline} · ${item.cost}</span></div>
            <div style="font-size:11px;color:#475569;">${item.action}</div>
          </div>
        </div>`).join('')}
    </div>
  </div>
  <div class="page-footer"><span>${orgName} · AI Readiness Assessment · Confidential</span><span>Page 4</span></div>
</div>`

  // ─── S03: CISO BRIEF ──────────────────────────────────────────────────────
  const cisoBrief = `
<div class="page page-light">
  <div class="section-label">Section 03 · CISO AI Risk & Compliance Brief</div>
  <h2>AI Security, Risk & Regulatory Posture</h2>
  <p style="margin-bottom:20px;">The Governance & Ethics dimension (GE, 15% weight) specifically measures AI policy, ethics governance, and regulatory readiness. Combined with model security posture, this section constitutes the CISO's AI risk mandate.</p>
  <div class="three-col" style="margin-bottom:20px;">
    <div class="kpi-card" style="border-left:4px solid ${scoreColor(dimScores.GE||1)};">
      <div class="kpi-value" style="color:${scoreColor(dimScores.GE||1)}">${fmt(dimScores.GE||1)}</div>
      <div class="kpi-label">Governance & Ethics Score</div>
      <div class="kpi-sub">${maturityLabel(dimScores.GE||1)}</div>
    </div>
    <div class="kpi-card" style="border-left:4px solid #EF4444;">
      <div class="kpi-value" style="color:#EF4444;">${topRisks.filter(r=>r.rating>=16).length}</div>
      <div class="kpi-label">Critical AI Risks</div>
      <div class="kpi-sub">Requiring immediate board action</div>
    </div>
    <div class="kpi-card" style="border-left:4px solid #F59E0B;">
      <div class="kpi-value" style="color:#F59E0B;">${(dimScores.GE||1)<3.0?'NOT READY':'PARTIAL'}</div>
      <div class="kpi-label">EU AI Act Readiness</div>
      <div class="kpi-sub">Risk classification not completed</div>
    </div>
  </div>
  <h3 style="margin-bottom:12px;">AI Risk Register — Top Risks</h3>
  <table>
    <thead><tr><th>Risk</th><th>Category</th><th>Likelihood</th><th>Impact</th><th>Rating</th><th>Primary Control</th></tr></thead>
    <tbody>
      ${topRisks.slice(0,6).map(r => `
        <tr>
          <td><strong>${r.risk}</strong></td>
          <td><span class="badge" style="background:${riskColor(r.rating)}22;color:${riskColor(r.rating)}">${r.cat}</span></td>
          <td>${r.likelihood}</td>
          <td>${r.impact}</td>
          <td><span class="risk-badge" style="background:${riskColor(r.rating)}22;color:${riskColor(r.rating)}">${riskLabel(r.rating)} (${r.rating})</span></td>
          <td style="font-size:10.5px;color:#64748b;">${r.cat==='Data'?'Data quality audit + governance framework':r.cat==='Regulatory'?'AI Act classification + legal review':r.cat==='People'?'AI literacy programme + hiring plan':'Process assessment + remediation plan'}</td>
        </tr>`).join('')}
    </tbody>
  </table>
  <div class="two-col" style="margin-top:18px;">
    <div class="card" style="border-left:4px solid #6366F1;">
      <h4 style="margin-bottom:10px;">EU AI Act Obligations</h4>
      ${['Conduct AI system inventory and risk classification (Unacceptable/High/Limited/Minimal)','Register all High-Risk AI systems in EU AI database before deployment','Implement mandatory human oversight for High-Risk AI systems','Create technical documentation and conformity assessments for High-Risk AI','Establish AI incident reporting process within 72-hour notification window'].map(i=>`<div style="display:flex;gap:8px;margin-bottom:7px;font-size:11px;color:#475569;"><span style="color:#6366F1;font-weight:700;flex-shrink:0;">→</span>${i}</div>`).join('')}
    </div>
    <div class="card" style="border-left:4px solid #0EA5E9;">
      <h4 style="margin-bottom:10px;">Model Security Controls</h4>
      ${['Implement input validation and prompt injection defence for all LLM deployments','Establish model provenance tracking and supply chain integrity verification','Deploy AI output monitoring for hallucination detection and safety filtering','Conduct red team adversarial testing before production deployment','Maintain model access controls with least-privilege principles and audit logging'].map(i=>`<div style="display:flex;gap:8px;margin-bottom:7px;font-size:11px;color:#475569;"><span style="color:#0EA5E9;font-weight:700;flex-shrink:0;">→</span>${i}</div>`).join('')}
    </div>
  </div>
  <div class="page-footer"><span>${orgName} · AI Readiness Assessment · Confidential</span><span>Page 5</span></div>
</div>`

  // ─── S04: CHIEF AI OFFICER ────────────────────────────────────────────────
  const caoBrief = `
<div class="page page-alt">
  <div class="section-label">Section 04 · Chief AI Officer Capability Map</div>
  <h2>AI Capability &amp; Use Case Portfolio</h2>
  <p style="margin-bottom:20px;">This section maps the organisation's AI capability maturity to its highest-value use case opportunities. Functions scoring ≥2.6 are ready for AI pilot investment; those below 2.0 require pre-AI foundation work first.</p>
  <div class="flex-row" style="margin-bottom:20px;">
    <div style="flex:1;">
      <h4 style="margin-bottom:12px;">Dimension Capability Radar</h4>
      ${radarSVG(dimScores, 300, 300)}
    </div>
    <div style="flex:1;">
      <h4 style="margin-bottom:12px;">Top Capability Areas</h4>
      ${sortedFns.slice(0,8).map(([id, s]) => `
        <div class="bar-row">
          <div class="bar-label" style="font-size:11px;">${id.replace(/_/g,' ').replace(/\b\w/g,c=>c.toUpperCase())}</div>
          <div class="bar-track"><div class="bar-fill" style="width:${pct(s)}%;background:${scoreColor(s)};"></div></div>
          <div class="bar-score" style="color:${scoreColor(s)}">${fmt(s)}</div>
        </div>`).join('')}
    </div>
  </div>
  <h4 style="margin-bottom:12px;">Priority AI Use Cases for ${orgName}</h4>
  <table>
    <thead><tr><th>#</th><th>Use Case</th><th>Function</th><th>Value</th><th>Complexity</th><th>Recommended Action</th></tr></thead>
    <tbody>
      ${USE_CASES.filter(uc => {
        const s = functionScores[uc.fn]
        return s !== undefined ? s >= 2.0 : true
      }).slice(0,8).map((uc, i) => `
        <tr>
          <td><strong style="color:#6366F1">${i+1}</strong></td>
          <td><strong>${uc.title}</strong><div style="font-size:10px;color:#94a3b8;margin-top:2px;">${uc.desc}</div></td>
          <td style="white-space:nowrap">${uc.fn.replace(/_/g,' ').replace(/\b\w/g,c=>c.toUpperCase())}</td>
          <td><span class="badge" style="background:${uc.value==='High'?'#10B98122':'#0EA5E922'};color:${uc.value==='High'?'#10B981':'#0EA5E9'}">${uc.value}</span></td>
          <td><span class="badge" style="background:${uc.complexity==='Low'?'#10B98122':uc.complexity==='Medium'?'#F59E0B22':'#EF444422'};color:${uc.complexity==='Low'?'#10B981':uc.complexity==='Medium'?'#F59E0B':'#EF4444'}">${uc.complexity}</span></td>
          <td style="font-size:10.5px;color:#475569">${uc.complexity==='Low'?'Pilot in 90 days':'Pilot in 6 months'}</td>
        </tr>`).join('')}
    </tbody>
  </table>
  <div class="page-footer"><span>${orgName} · AI Readiness Assessment · Confidential</span><span>Page 6</span></div>
</div>`

  // ─── S05: METHODOLOGY ─────────────────────────────────────────────────────
  const methodology = `
<div class="page page-light">
  <div class="section-label">Section 05 · Assessment Methodology</div>
  <h2>Framework &amp; Scoring Methodology</h2>
  <div class="two-col" style="margin-top:16px;">
    <div>
      <div class="card card-accent">
        <h4 style="margin-bottom:10px;">Scoring Formula</h4>
        <div style="background:#f8fafc;border-radius:8px;padding:14px;font-family:monospace;font-size:11px;color:#6366F1;line-height:2;">
          dimScore = 1 + (earned / max) × 4<br/>
          fnScore = weightedAvg(dimScores × weights)<br/>
          orgScore = avg(allFunctionScores)
        </div>
        <p style="margin-top:10px;font-size:11.5px;">Questions use Yes/Partial/No (2/1/0) responses. DQ-tagged questions in the Data Readiness function carry 2× weight (4/2/0) to reflect the primacy of data foundations.</p>
      </div>
      <div class="card">
        <h4 style="margin-bottom:10px;">6 AI Readiness Dimensions</h4>
        ${Object.entries(DIMS).map(([k, d]) => `
          <div style="display:flex;align-items:center;gap:10px;margin-bottom:9px;">
            <div style="width:36px;height:36px;border-radius:8px;background:${d.color}22;display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:800;color:${d.color};flex-shrink:0;">${k}</div>
            <div><div style="font-size:12px;font-weight:700;color:#0f172a;">${d.label} <span style="color:#94a3b8;font-weight:400;">(${(d.weight*100).toFixed(0)}%)</span></div></div>
          </div>`).join('')}
      </div>
    </div>
    <div>
      <div class="card">
        <h4 style="margin-bottom:12px;">AI Maturity Tiers</h4>
        ${[
          { label:'AI-Native',   range:'4.2–5.0', color:'#10B981', desc:'AI embedded in core processes. Autonomous optimisation. Continuous learning systems operating at scale.' },
          { label:'AI Scaling',  range:'3.4–4.2', color:'#3B82F6', desc:'Multiple production AI systems delivering value. MLOps mature. AI Centre of Excellence established.' },
          { label:'AI Piloting', range:'2.6–3.4', color:'#F59E0B', desc:'Active AI pilots in selected functions. Governance frameworks emerging. Infrastructure investment underway.' },
          { label:'AI Exploring',range:'1.8–2.6', color:'#F97316', desc:'Early AI awareness and isolated experiments. Foundational work needed across data, skills, and governance.' },
          { label:'AI Unaware',  range:'1.0–1.8', color:'#EF4444', desc:'No structured AI activity. Significant pre-work required in data quality, governance, and literacy before any AI investment.' },
        ].map(t => `
          <div style="display:flex;gap:12px;margin-bottom:12px;">
            <div style="width:6px;flex-shrink:0;border-radius:3px;background:${t.color};margin-top:3px;"></div>
            <div>
              <div style="display:flex;align-items:center;gap:8px;margin-bottom:3px;">
                <span style="font-size:12px;font-weight:700;color:${t.color}">${t.label}</span>
                <span style="font-size:10.5px;color:#94a3b8;">${t.range}</span>
              </div>
              <p style="font-size:11px;margin:0;">${t.desc}</p>
            </div>
          </div>`).join('')}
      </div>
    </div>
  </div>
  <div class="page-footer"><span>${orgName} · AI Readiness Assessment · Confidential</span><span>Page 7</span></div>
</div>`

  // ─── S06: CURRENT STATE ───────────────────────────────────────────────────
  const currentState = `
<div class="page page-alt">
  <div class="section-label">Section 06 · Current State Analysis</div>
  <h2>Overall AI Readiness: ${orgName}</h2>
  <div class="kpi-grid" style="margin-bottom:20px;">
    <div class="kpi-card" style="border-left:4px solid ${sc};text-align:center;">${donutSVG(overallScore,90)}<div class="kpi-label" style="margin-top:6px;">Overall Score</div><div style="font-size:11px;font-weight:700;color:${sc};margin-top:4px;">${ml}</div></div>
    <div class="kpi-card" style="border-left:4px solid #6366F1;"><div class="kpi-value" style="color:#6366F1;">${fnCount}</div><div class="kpi-label">Functions Assessed</div><div class="kpi-sub">${industry || 'All domains'}</div></div>
    <div class="kpi-card" style="border-left:4px solid #10B981;"><div class="kpi-value" style="color:#10B981;">${fnEntries.filter(([,s])=>s>=3.4).length}</div><div class="kpi-label">AI Scaling+</div><div class="kpi-sub">At or above target tier</div></div>
    <div class="kpi-card" style="border-left:4px solid #EF4444;"><div class="kpi-value" style="color:#EF4444;">${criticalGaps.length}</div><div class="kpi-label">Below 2.5</div><div class="kpi-sub">Require immediate action</div></div>
  </div>
  <div class="two-col">
    <div>
      <h4 style="margin-bottom:12px;">Dimension Overview</h4>
      ${Object.entries(DIMS).map(([k, d]) => {
        const s = dimScores[k] || 1
        return `<div class="bar-row">
          <div class="bar-label" style="display:flex;align-items:center;gap:6px;"><span style="width:20px;height:20px;border-radius:5px;background:${d.color}22;display:inline-flex;align-items:center;justify-content:center;font-size:8px;font-weight:800;color:${d.color};">${k}</span>${d.label}</div>
          <div class="bar-track"><div class="bar-fill" style="width:${pct(s)}%;background:${d.color};"></div></div>
          <div class="bar-score" style="color:${scoreColor(s)}">${fmt(s)}</div>
        </div>`}).join('')}
    </div>
    <div>
      <h4 style="margin-bottom:12px;">Maturity Distribution</h4>
      ${[['AI-Native','#10B981','>=4.2'],['AI Scaling','#3B82F6','>=3.4'],['AI Piloting','#F59E0B','>=2.6'],['AI Exploring','#F97316','>=1.8'],['AI Unaware','#EF4444','<1.8']].map(([lbl, col, cond]) => {
        const count = fnEntries.filter(([,s]) => {
          if (cond.startsWith('>=')) return s >= parseFloat(cond.slice(2)) && (lbl==='AI-Native'?true:s < [5.0,4.2,3.4,2.6,1.8][['AI-Native','AI Scaling','AI Piloting','AI Exploring','AI Unaware'].indexOf(lbl)+1]||true)
          return s < 1.8
        }).length
        const barPct = fnCount > 0 ? (count/fnCount*100).toFixed(0) : 0
        return `<div style="margin-bottom:10px;">
          <div style="display:flex;justify-content:space-between;margin-bottom:4px;">
            <span style="font-size:11.5px;font-weight:600;color:${col}">${lbl}</span>
            <span style="font-size:11.5px;font-weight:700;color:#334155">${count} functions (${barPct}%)</span>
          </div>
          <div style="height:10px;background:#f1f5f9;border-radius:5px;overflow:hidden;">
            <div style="height:100%;width:${barPct}%;background:${col};border-radius:5px;"></div>
          </div>
        </div>`
      }).join('')}
      <div class="insight-box" style="margin-top:14px;padding:14px 16px;">
        <p style="font-size:11.5px;"><strong>Industry Benchmark:</strong> Fortune 500 AI leaders average <strong>3.4–3.8</strong> overall. ${orgName} at <strong style="color:${sc}">${overallScore.toFixed(2)}</strong> is ${overallScore >= 3.4 ? 'at or above the benchmark' : `${(3.4 - overallScore).toFixed(2)} points below the Fortune 500 benchmark`}.</p>
      </div>
    </div>
  </div>
  <div class="page-footer"><span>${orgName} · AI Readiness Assessment · Confidential</span><span>Page 8</span></div>
</div>`

  // ─── S07: DIMENSIONAL ANALYSIS ────────────────────────────────────────────
  const dimAnalysis = `
<div class="page page-light">
  <div class="section-label">Section 07 · Dimensional Analysis</div>
  <h2>6-Dimension Deep Dive</h2>
  <div class="flex-row" style="margin-bottom:20px;align-items:flex-start;">
    <div>${radarSVG(dimScores, 310, 310)}</div>
    <div style="flex:1;">
      ${Object.entries(DIMS).map(([k, d]) => {
        const s = dimScores[k] || 1
        const sc2 = scoreColor(s)
        return `<div style="margin-bottom:14px;padding:14px 16px;background:#f8fafc;border:1px solid #e2e8f0;border-left:4px solid ${d.color};border-radius:10px;">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
            <div>
              <span style="font-size:10px;font-weight:800;color:${d.color};letter-spacing:1px;">${k}</span>
              <span style="font-size:13px;font-weight:700;color:#0f172a;margin-left:8px;">${d.label}</span>
              <span style="font-size:10px;color:#94a3b8;margin-left:6px;">(${(d.weight*100).toFixed(0)}% weight)</span>
            </div>
            <div style="background:${sc2}22;border-radius:8px;padding:4px 10px;">
              <span style="font-size:14px;font-weight:900;color:${sc2}">${fmt(s)}</span>
            </div>
          </div>
          <div style="height:6px;background:#e2e8f0;border-radius:3px;margin-bottom:8px;overflow:hidden;">
            <div style="height:100%;width:${pct(s)}%;background:${d.color};border-radius:3px;"></div>
          </div>
          <p style="font-size:11px;margin:0;">${
            k==='DQ'?(s<2.5?'Data foundations are critically weak. AI models trained on this data will produce unreliable outputs. Immediate enterprise data quality programme required.':'Data quality is developing. Prioritise completeness and consistency across top 5 AI-ready datasets before scaling.')
            :k==='TR'?(s<2.5?'Infrastructure lacks AI/ML capabilities. Cloud platform, API integration, and MLOps tooling need significant investment before AI deployment.':'Technical foundation is AI-capable. Focus investment on MLOps automation and model serving infrastructure.')
            :k==='TS'?(s<2.5?'AI literacy gap is organisation-wide. Without upskilling, AI programmes will face adoption failure and over-dependence on external vendors.':'AI skills are building. Accelerate through structured learning paths and internal AI champions programme.')
            :k==='GE'?(s<2.5?'AI governance is absent or ad hoc. EU AI Act compliance, ethics oversight, and bias monitoring are not in place — creating significant legal and reputational risk.':'Governance frameworks are emerging. Formalise AI ethics committee, complete EU AI Act risk classification, and establish bias audit cadence.')
            :k==='CR'?(s<2.5?'Organisational change readiness is low. AI programmes risk failure due to cultural resistance, lack of leadership sponsorship, and poor change management.':'Change readiness is developing. Strengthen executive sponsorship, communication, and staff engagement to accelerate adoption.')
            :(s<2.5?'AI value capture mechanisms are absent. Use cases lack defined business cases, benefit tracking, and ROI measurement frameworks.':'Value management is building. Establish AI programme PMO with standardised ROI measurement and executive benefit reporting.')
          }</p>
        </div>`
      }).join('')}
    </div>
  </div>
  <div class="page-footer"><span>${orgName} · AI Readiness Assessment · Confidential</span><span>Page 9</span></div>
</div>`

  // ─── S08: FUNCTION HEATMAP ────────────────────────────────────────────────
  const heatmap = `
<div class="page page-alt">
  <div class="section-label">Section 08 · Function Performance Heatmap</div>
  <h2>All ${fnCount} Functions — AI Readiness Scores</h2>
  <p style="margin-bottom:16px;">Ordered by maturity score. Scores below 2.5 require immediate foundational investment. Target: 3.4 (AI Scaling) within 24 months.</p>
  <div class="two-col">
    <div>
      ${sortedFns.slice(0, Math.ceil(sortedFns.length/2)).map(([id, s], i) => `
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:7px;">
          <div style="width:20px;font-size:9px;color:#94a3b8;text-align:right;flex-shrink:0;">${i+1}</div>
          <div style="flex:1;font-size:11px;color:#334155;font-weight:500;">${id.replace(/_/g,' ').replace(/\b\w/g,c=>c.toUpperCase())}</div>
          <div style="width:80px;height:7px;background:#e2e8f0;border-radius:4px;overflow:hidden;flex-shrink:0;">
            <div style="height:100%;width:${pct(s)}%;background:${scoreColor(s)};border-radius:4px;"></div>
          </div>
          <div style="width:32px;font-size:10.5px;font-weight:700;color:${scoreColor(s)};text-align:right;">${fmt(s)}</div>
        </div>`).join('')}
    </div>
    <div>
      ${sortedFns.slice(Math.ceil(sortedFns.length/2)).map(([id, s], i) => `
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:7px;">
          <div style="width:20px;font-size:9px;color:#94a3b8;text-align:right;flex-shrink:0;">${Math.ceil(sortedFns.length/2)+i+1}</div>
          <div style="flex:1;font-size:11px;color:#334155;font-weight:500;">${id.replace(/_/g,' ').replace(/\b\w/g,c=>c.toUpperCase())}</div>
          <div style="width:80px;height:7px;background:#e2e8f0;border-radius:4px;overflow:hidden;flex-shrink:0;">
            <div style="height:100%;width:${pct(s)}%;background:${scoreColor(s)};border-radius:4px;"></div>
          </div>
          <div style="width:32px;font-size:10.5px;font-weight:700;color:${scoreColor(s)};text-align:right;">${fmt(s)}</div>
        </div>`).join('')}
    </div>
  </div>
  <div style="display:flex;gap:16px;margin-top:16px;flex-wrap:wrap;">
    ${[['AI-Native','#10B981','4.2–5.0'],['AI Scaling','#3B82F6','3.4–4.2'],['AI Piloting','#F59E0B','2.6–3.4'],['AI Exploring','#F97316','1.8–2.6'],['AI Unaware','#EF4444','1.0–1.8']].map(([l,c,r])=>`
      <div style="display:flex;align-items:center;gap:5px;">
        <div style="width:10px;height:10px;border-radius:2px;background:${c};"></div>
        <span style="font-size:10px;color:#475569;">${l} (${r})</span>
      </div>`).join('')}
  </div>
  <div class="page-footer"><span>${orgName} · AI Readiness Assessment · Confidential</span><span>Page 10</span></div>
</div>`

  // ─── S09: GAP ANALYSIS ────────────────────────────────────────────────────
  const gapAnalysis = `
<div class="page page-light">
  <div class="section-label">Section 09 · Gap Analysis</div>
  <h2>Current State vs. Target (AI Scaling: 3.4)</h2>
  <p style="margin-bottom:16px;">${criticalGaps.length} functions are in the critical zone (below 2.5) requiring foundational investment before AI pilots can succeed. ${onTarget.length} functions are on or approaching target.</p>
  <div class="three-col" style="margin-bottom:20px;">
    <div class="kpi-card" style="border-left:4px solid #EF4444;">
      <div class="kpi-value" style="color:#EF4444;">${criticalGaps.length}</div>
      <div class="kpi-label">Critical (Gap &gt;1.5)</div>
      <div class="kpi-sub">Require foundation work first</div>
    </div>
    <div class="kpi-card" style="border-left:4px solid #F59E0B;">
      <div class="kpi-value" style="color:#F59E0B;">${fnEntries.filter(([,s])=>s>=2.5&&s<TARGET-0.5).length}</div>
      <div class="kpi-label">Developing (Gap 0.5–1.5)</div>
      <div class="kpi-sub">Ready for structured pilots</div>
    </div>
    <div class="kpi-card" style="border-left:4px solid #10B981;">
      <div class="kpi-value" style="color:#10B981;">${onTarget.length}</div>
      <div class="kpi-label">On Target (Gap &lt;0.5)</div>
      <div class="kpi-sub">Focus on scaling &amp; value capture</div>
    </div>
  </div>
  <table>
    <thead><tr><th>Function</th><th>Current Score</th><th>Gap to Target (3.4)</th><th>Priority</th><th>Recommended Action</th></tr></thead>
    <tbody>
      ${sortedFns.slice().reverse().slice(0,12).map(([id, s]) => {
        const gap = (TARGET - s)
        const pri = gap > 1.5 ? 'P1 — Critical' : gap > 0.5 ? 'P2 — Medium' : 'P3 — Maintain'
        const priColor = gap > 1.5 ? '#EF4444' : gap > 0.5 ? '#F59E0B' : '#10B981'
        return `<tr>
          <td><strong>${id.replace(/_/g,' ').replace(/\b\w/g,c=>c.toUpperCase())}</strong></td>
          <td><span style="color:${scoreColor(s)};font-weight:700;">${fmt(s)}</span></td>
          <td><span style="color:${priColor};font-weight:700;">-${gap.toFixed(2)}</span></td>
          <td><span class="badge" style="background:${priColor}22;color:${priColor}">${pri}</span></td>
          <td style="font-size:10.5px;color:#64748b;">${gap>1.5?'Data audit + governance baseline + AI literacy before any pilot':gap>0.5?'Structure AI pilot with dedicated programme team and governance':'Scale proven approaches and capture value'}</td>
        </tr>`
      }).join('')}
    </tbody>
  </table>
  <div class="page-footer"><span>${orgName} · AI Readiness Assessment · Confidential</span><span>Page 11</span></div>
</div>`

  // ─── S10: USE CASE REGISTER ───────────────────────────────────────────────
  const useCaseRegister = `
<div class="page page-alt">
  <div class="section-label">Section 10 · AI Use Case Register</div>
  <h2>Prioritised AI Use Case Portfolio</h2>
  <p style="margin-bottom:16px;">Use cases matched to ${orgName}'s assessed functions. High-value, low-complexity cases should be piloted in Phase 1. All cases are sequenced by readiness and strategic value.</p>
  <table>
    <thead><tr><th>#</th><th>Use Case</th><th>Function</th><th>Value</th><th>Complexity</th><th>Description</th></tr></thead>
    <tbody>
      ${USE_CASES.slice(0, 16).map((uc, i) => `
        <tr>
          <td style="color:#6366F1;font-weight:700">${i+1}</td>
          <td><strong style="font-size:11.5px;">${uc.title}</strong></td>
          <td style="font-size:10.5px;white-space:nowrap">${uc.fn.replace(/_/g,' ').replace(/\b\w/g,c=>c.toUpperCase())}</td>
          <td><span class="badge" style="background:${uc.value==='High'?'#10B98122':'#0EA5E922'};color:${uc.value==='High'?'#10B981':'#0EA5E9'}">${uc.value}</span></td>
          <td><span class="badge" style="background:${uc.complexity==='Low'?'#10B98122':uc.complexity==='Medium'?'#F59E0B22':'#EF444422'};color:${uc.complexity==='Low'?'#10B981':uc.complexity==='Medium'?'#F59E0B':'#EF4444'}">${uc.complexity}</span></td>
          <td style="font-size:10px;color:#475569;">${uc.desc}</td>
        </tr>`).join('')}
    </tbody>
  </table>
  <div class="page-footer"><span>${orgName} · AI Readiness Assessment · Confidential</span><span>Page 12</span></div>
</div>`

  // ─── S11: RISK REGISTER ───────────────────────────────────────────────────
  const riskRegister = `
<div class="page page-light">
  <div class="section-label">Section 11 · AI Risk Register</div>
  <h2>AI Implementation Risk Assessment</h2>
  <div class="three-col" style="margin-bottom:16px;">
    <div class="kpi-card" style="border-left:4px solid #DC2626;"><div class="kpi-value" style="color:#DC2626">${topRisks.filter(r=>r.rating>=16).length}</div><div class="kpi-label">CRITICAL Risks</div></div>
    <div class="kpi-card" style="border-left:4px solid #F97316;"><div class="kpi-value" style="color:#F97316">${topRisks.filter(r=>r.rating>=10&&r.rating<16).length}</div><div class="kpi-label">HIGH Risks</div></div>
    <div class="kpi-card" style="border-left:4px solid #F59E0B;"><div class="kpi-value" style="color:#F59E0B">${topRisks.filter(r=>r.rating<10).length}</div><div class="kpi-label">MEDIUM Risks</div></div>
  </div>
  <table>
    <thead><tr><th>Risk</th><th>Area</th><th>Category</th><th>Likelihood</th><th>Impact</th><th>Rating</th></tr></thead>
    <tbody>
      ${topRisks.map(r => `
        <tr>
          <td><strong style="font-size:11.5px;">${r.risk}</strong></td>
          <td style="font-size:10.5px;white-space:nowrap">${r.area}</td>
          <td><span class="badge" style="background:${riskColor(r.rating)}22;color:${riskColor(r.rating)}">${r.cat}</span></td>
          <td style="font-size:11px">${r.likelihood}</td>
          <td style="font-size:11px">${r.impact}</td>
          <td><span class="risk-badge" style="background:${riskColor(r.rating)}22;color:${riskColor(r.rating)}">${riskLabel(r.rating)} · ${r.rating}</span></td>
        </tr>`).join('')}
    </tbody>
  </table>
  <div class="page-footer"><span>${orgName} · AI Readiness Assessment · Confidential</span><span>Page 13</span></div>
</div>`

  // ─── S12: ROADMAP (WOW Visual) ────────────────────────────────────────────
  const { svg: timelineSVG, activeGoals } = buildRoadmapSVG(goals || [], 680)

  const goalChipsHTML = activeGoals.length > 0 ? `
    <div style="display:flex;flex-wrap:wrap;gap:7px;margin-bottom:14px;">
      ${activeGoals.map((g, i) => `
        <div style="display:inline-flex;align-items:center;gap:6px;background:${g.color}18;border:1px solid ${g.color}40;border-radius:20px;padding:4px 10px;">
          <span style="font-size:8.5px;background:${g.color};color:#fff;width:16px;height:16px;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;font-weight:900;flex-shrink:0;">${i+1}</span>
          <span style="font-size:10px;font-weight:700;color:${g.color};">${g.label}</span>
        </div>`).join('')}
    </div>` : ''

  const roadmap = `
<div style="background:linear-gradient(150deg,#0A0E1A 0%,#0F1929 45%,#111827 100%);padding:40px 52px 70px;min-height:1050px;max-height:1120px;overflow:hidden;position:relative;page-break-after:always;">
  <svg style="position:absolute;top:0;right:0;opacity:.05;pointer-events:none" width="550" height="550" viewBox="0 0 550 550">
    <circle cx="460" cy="80" r="260" fill="#6366F1"/>
    <circle cx="360" cy="460" r="160" fill="#0EA5E9"/>
    <polygon points="60,60 200,60 130,190" fill="#F59E0B" opacity=".7"/>
  </svg>
  <div style="font-size:10px;font-weight:700;letter-spacing:2.5px;text-transform:uppercase;color:rgba(255,255,255,.3);margin-bottom:14px;">Section 12 · AI Transformation Roadmap</div>

  <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:16px;">
    <div>
      <h2 style="color:#fff;font-size:26px;font-weight:900;margin-bottom:4px;letter-spacing:-.5px;">36-Month AI Transformation Roadmap</h2>
      <p style="color:rgba(255,255,255,.45);font-size:11.5px;margin:0;">${orgName} · Starting at <strong style="color:${sc}">${ml}</strong> · Goal-Driven Execution Plan</p>
    </div>
    <div style="background:linear-gradient(135deg,rgba(99,102,241,.85),rgba(139,92,246,.75));border:1px solid rgba(255,255,255,.15);border-radius:14px;padding:14px 18px;min-width:175px;text-align:center;flex-shrink:0;">
      <div style="font-size:8px;letter-spacing:2px;color:rgba(255,255,255,.5);text-transform:uppercase;margin-bottom:4px;">North Star · Month 36</div>
      <div style="font-size:24px;font-weight:900;color:#fff;line-height:1;">AI-Native</div>
      <div style="font-size:9.5px;color:rgba(255,255,255,.55);margin-top:3px;">Target Score 4.2+</div>
      <div style="display:flex;align-items:center;gap:5px;margin-top:8px;">
        <div style="height:4px;flex:1;background:rgba(255,255,255,.12);border-radius:2px;overflow:hidden;">
          <div style="height:100%;width:${pct(overallScore)}%;background:linear-gradient(90deg,#6366F1,#10B981);border-radius:2px;"></div>
        </div>
        <span style="font-size:8.5px;color:rgba(255,255,255,.4);white-space:nowrap;">${overallScore.toFixed(1)}→4.2</span>
      </div>
    </div>
  </div>

  ${goalChipsHTML}

  <div style="border-radius:12px;overflow:hidden;margin-bottom:16px;">
    ${timelineSVG}
  </div>

  <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px;margin-bottom:10px;">
    ${[
      { n:1, label:'Foundation',       time:'M1–6',   color:'#6366F1', budget:orgMeta.budget,
        items:['AI Governance & CAIO','Data quality audit','AI literacy programme','EU AI Act classification','3–5 use case business cases'] },
      { n:2, label:'Pilot & Build',    time:'M7–18',  color:'#0EA5E9', budget:orgMeta.budget,
        items:['2–3 high-ROI AI pilots','MLOps platform (Azure/GCP)','Model risk & explainability','ROI instrumentation & A/B tests','Advanced AI skills tracks'] },
      { n:3, label:'Scale & Optimise', time:'M19–36', color:'#10B981', budget:orgMeta.budget,
        items:['Pilots to full production','AI Centre of Excellence','Enterprise feature store','Automated model monitoring','3-year AI strategy refresh'] },
    ].map(p => `
      <div style="background:${p.color}14;border:1px solid ${p.color}30;border-radius:10px;padding:11px 13px;">
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;">
          <div style="width:22px;height:22px;background:${p.color};border-radius:6px;color:#fff;font-size:11px;font-weight:900;display:flex;align-items:center;justify-content:center;flex-shrink:0;">${p.n}</div>
          <div>
            <div style="font-size:10.5px;font-weight:800;color:${p.color};">${p.label}</div>
            <div style="font-size:8.5px;color:rgba(255,255,255,.35);">${p.time} · Est. ${p.budget}</div>
          </div>
        </div>
        ${p.items.map(item => `<div style="display:flex;gap:5px;font-size:9.5px;color:rgba(255,255,255,.5);margin-bottom:4px;"><span style="color:${p.color};flex-shrink:0;font-weight:700;">→</span>${item}</div>`).join('')}
      </div>`).join('')}
  </div>

  <div style="background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);border-radius:10px;padding:10px 16px;display:flex;align-items:center;gap:16px;">
    <div style="font-size:9px;font-weight:700;color:rgba(255,255,255,.3);letter-spacing:1.5px;text-transform:uppercase;flex-shrink:0;">Dependencies</div>
    ${[
      ['Data Foundation','unlocks all AI use cases','#6366F1'],
      ['AI Literacy','enables cultural adoption','#F97316'],
      ['Governance Framework','de-risks regulatory exposure','#EF4444'],
      ['MLOps Platform','enables scale from pilots','#0EA5E9'],
    ].map(([k,v,c]) => `<div style="display:flex;gap:4px;align-items:center;font-size:9px;color:rgba(255,255,255,.4);"><span style="color:${c};font-weight:700;">${k}</span><span>→</span>${v}</div>`).join('')}
  </div>

  <div style="position:absolute;bottom:18px;left:52px;right:52px;display:flex;justify-content:space-between;border-top:1px solid rgba(255,255,255,.08);padding-top:8px;font-size:10px;color:rgba(255,255,255,.25);">
    <span>${orgName} · AI Readiness Assessment · Confidential</span><span>Page 14</span>
  </div>
</div>`

  // ─── S13: ROI ─────────────────────────────────────────────────────────────
  const roiPage = `
<div class="page page-light">
  <div class="section-label">Section 13 · ROI &amp; Business Case</div>
  <h2>AI Investment &amp; Return Model</h2>
  <p style="margin-bottom:20px;">Indicative ROI model for <strong>${orgName}</strong> (${orgMeta.label}) based on current readiness score of <strong style="color:${sc}">${overallScore.toFixed(2)}</strong>. Actual returns depend on execution quality and programme governance.</p>
  <div class="kpi-grid" style="margin-bottom:20px;">
    <div class="kpi-card" style="border-left:4px solid #6366F1;"><div class="kpi-value" style="color:#6366F1;">£${(implCost/1000).toFixed(0)}K</div><div class="kpi-label">Programme Investment</div><div class="kpi-sub">3-year total cost estimate</div></div>
    <div class="kpi-card" style="border-left:4px solid #10B981;"><div class="kpi-value" style="color:#10B981;">£${(yr1/1000).toFixed(0)}K</div><div class="kpi-label">Year 1 Savings</div><div class="kpi-sub">Partial year, ramp-up phase</div></div>
    <div class="kpi-card" style="border-left:4px solid #0EA5E9;"><div class="kpi-value" style="color:#0EA5E9;">£${((yr1+yr2+yr3)/1000000).toFixed(1)}M</div><div class="kpi-label">3-Year Total Benefit</div><div class="kpi-sub">Cumulative value realisation</div></div>
    <div class="kpi-card" style="border-left:4px solid #F59E0B;"><div class="kpi-value" style="color:#F59E0B;">${roi3yr}%</div><div class="kpi-label">3-Year ROI</div><div class="kpi-sub">Net of programme investment</div></div>
    <div class="kpi-card" style="border-left:4px solid #EF4444;"><div class="kpi-value" style="color:#EF4444;">${paybackMo}mo</div><div class="kpi-label">Payback Period</div><div class="kpi-sub">Break-even timeline</div></div>
  </div>
  <div class="two-col">
    <div>
      <div class="card card-accent">
        <h4 style="margin-bottom:12px;">3-Year Benefit Projection</h4>
        ${[['Year 1',yr1,0.35],['Year 2',yr2,0.75],['Year 3',yr3,1.0]].map(([lbl,v,p2])=>`
          <div class="bar-row" style="margin-bottom:12px;">
            <div class="bar-label" style="font-weight:700;">${lbl}</div>
            <div class="bar-track" style="height:12px;"><div class="bar-fill" style="width:${(p2*100).toFixed(0)}%;background:#6366F1;"></div></div>
            <div class="bar-score" style="color:#6366F1;width:50px;">£${(v/1000).toFixed(0)}K</div>
          </div>`).join('')}
        <p style="font-size:10.5px;color:#94a3b8;margin-top:10px;">* Based on ${(effGain*100).toFixed(0)}% efficiency improvement across ${headcount.toLocaleString()} staff at avg £${avgSalary.toLocaleString()} salary. Industry benchmark: 10–15% productivity gain from AI automation.</p>
      </div>
    </div>
    <div>
      <h4 style="margin-bottom:12px;">Value Driver Breakdown</h4>
      ${[
        { driver:'Process Automation', pct:'25–35%', desc:'Reduction in manual task effort across finance, HR, and operations', color:'#6366F1' },
        { driver:'Decision Intelligence', pct:'15–25%', desc:'Improvement in forecast accuracy and risk-adjusted decision quality', color:'#0EA5E9' },
        { driver:'Customer Experience', pct:'10–20%', desc:'NPS/CSAT uplift through AI-powered personalisation', color:'#10B981' },
        { driver:'Revenue Acceleration', pct:'5–15%', desc:'Incremental revenue from AI-driven sales and marketing insights', color:'#F59E0B' },
        { driver:'Risk Cost Reduction', pct:'20–40%', desc:'Lower compliance costs, audit risk, and fraud losses', color:'#EF4444' },
      ].map(d => `
        <div style="display:flex;gap:10px;margin-bottom:10px;padding:10px 12px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;">
          <div style="width:4px;border-radius:2px;background:${d.color};flex-shrink:0;"></div>
          <div>
            <div style="display:flex;gap:8px;align-items:center;margin-bottom:3px;">
              <span style="font-size:12px;font-weight:700;color:#0f172a;">${d.driver}</span>
              <span style="font-size:10px;background:${d.color}22;color:${d.color};padding:1px 7px;border-radius:10px;font-weight:700;">${d.pct}</span>
            </div>
            <p style="font-size:10.5px;margin:0;">${d.desc}</p>
          </div>
        </div>`).join('')}
    </div>
  </div>
  <div class="page-footer"><span>${orgName} · AI Readiness Assessment · Confidential</span><span>Page 15</span></div>
</div>`

  // ─── S14: REGULATORY ──────────────────────────────────────────────────────
  const regulatory = `
<div class="page page-alt">
  <div class="section-label">Section 14 · Regulatory Readiness</div>
  <h2>AI Compliance Framework</h2>
  <p style="margin-bottom:16px;">Key regulatory obligations applicable to ${orgName}. Legal counsel review required for jurisdiction-specific obligations.</p>
  ${[
    { name:'EU AI Act', region:'EU / Global', color:'#6366F1', status:(dimScores.GE||1)<3?'Action Required':'Reviewing',
      items:['Classify all AI systems by risk tier (Unacceptable / High / Limited / Minimal)','Register High-Risk AI systems in EU AI database before any deployment','Implement mandatory human oversight for all High-Risk AI systems','Create and maintain technical documentation and conformity assessments','Establish 72-hour AI incident reporting process to regulatory authorities'] },
    { name:'UK GDPR / Data Protection Act 2018', region:'United Kingdom', color:'#0EA5E9', status:(dimScores.DQ||1)<3?'Gaps Identified':'Compliant',
      items:['Document lawful basis for all personal data used in AI model training','Conduct Data Protection Impact Assessments (DPIA) for high-risk AI systems','Ensure explainability for automated decisions affecting data subjects','Implement right to opt-out of automated decision-making (Art.22)','Validate cross-border data transfer compliance for AI training datasets'] },
    { name:'ISO/IEC 42001:2023', region:'International', color:'#10B981', status:'Not Started',
      items:['Establish AI Management System (AIMS) aligned to ISO 42001 requirements','Define organisational AI policy with clear accountability structures','Implement AI risk assessment and treatment processes','Pursue certification as trust signal to enterprise clients and regulators'] },
    { name:'NIST AI Risk Management Framework', region:'US / Global', color:'#F59E0B', status:'Awareness Only',
      items:['GOVERN: Establish AI governance structure, roles, and accountability','MAP: Document all AI use cases and associated stakeholder impacts','MEASURE: Assess trustworthiness dimensions (safety, explainability, fairness)','MANAGE: Implement risk treatment plans with assigned owners and timelines'] },
  ].map(reg => `
    <div class="card" style="border-left:4px solid ${reg.color};margin-bottom:12px;">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:10px;">
        <div>
          <span style="font-size:13px;font-weight:800;color:${reg.color}">${reg.name}</span>
          <span style="font-size:10.5px;color:#94a3b8;margin-left:8px;">${reg.region}</span>
        </div>
        <span class="badge" style="background:${reg.status==='Action Required'||reg.status==='Gaps Identified'?'#EF444422':'#F59E0B22'};color:${reg.status==='Action Required'||reg.status==='Gaps Identified'?'#EF4444':'#F59E0B'};white-space:nowrap">${reg.status}</span>
      </div>
      <div class="two-col">
        ${reg.items.map(i=>`<div style="display:flex;gap:7px;font-size:11px;color:#475569;margin-bottom:5px;"><span style="color:${reg.color};flex-shrink:0;">→</span>${i}</div>`).join('')}
      </div>
    </div>`).join('')}
  <div class="page-footer"><span>${orgName} · AI Readiness Assessment · Confidential</span><span>Page 16</span></div>
</div>`

  // ─── APPENDIX ─────────────────────────────────────────────────────────────
  // Limit function table rows so content fits on one page without bleeding
  const appendixFns = sortedFns.slice(0, 20)
  const appendix = `
<div class="page page-light">
  <div class="section-label">Appendix · Full Data &amp; Metadata</div>
  <h2 style="margin-bottom:12px;">Assessment Data &amp; Methodology Notes</h2>
  <div class="two-col" style="margin-top:10px;">
    <div style="page-break-inside:avoid;">
      <div class="card card-accent" style="margin-bottom:0;page-break-inside:avoid;">
        <h4 style="margin-bottom:8px;">Assessment Metadata</h4>
        ${[['Organisation',orgName],['Industry',industry||'Not specified'],['Region',region||'Not specified'],['Org Size',orgMeta.label],['Assessment ID',assessmentId||'N/A'],['Assessed By',assessedBy||'Self-Assessment'],['Report Date',dateStr],['Framework','AI Readiness Assessor v2.0'],['Question Bank','v2.0 · 205 questions · 27 functions'],['Methodology','Weighted dimension scoring, 1–5 scale']].map(([l,v])=>`
          <div style="display:flex;margin-bottom:5px;">
            <span style="width:120px;font-size:10.5px;color:#94a3b8;flex-shrink:0;">${l}</span>
            <span style="font-size:10.5px;color:#334155;font-weight:500;">${v}</span>
          </div>`).join('')}
      </div>
    </div>
    <div style="page-break-inside:avoid;">
      <div class="card" style="margin-bottom:0;page-break-inside:avoid;">
        <h4 style="margin-bottom:8px;">Function Score Summary (Top ${appendixFns.length})</h4>
        <table style="font-size:9.5px;">
          <thead><tr><th>Function</th><th>Score</th><th>Tier</th></tr></thead>
          <tbody>
            ${appendixFns.map(([id,s])=>`<tr style="page-break-inside:avoid;"><td style="padding:5px 8px;">${id.replace(/_/g,' ').replace(/\b\w/g,c=>c.toUpperCase())}</td><td style="padding:5px 8px;color:${scoreColor(s)};font-weight:700;">${fmt(s)}</td><td style="padding:5px 8px;"><span style="font-size:8.5px;color:${scoreColor(s)}">${maturityLabel(s)}</span></td></tr>`).join('')}
          </tbody>
        </table>
      </div>
    </div>
  </div>
  <div class="insight-box" style="margin-top:12px;page-break-inside:avoid;">
    <strong>Disclaimer:</strong> <span style="font-size:11px;color:#3730a3;">This report is based on a structured self-assessment across ${fnCount} organisational functions. ROI projections are indicative and based on industry benchmarks for ${orgMeta.label} organisations. All financial figures should be validated with detailed feasibility analysis before capital allocation. This report is confidential and intended solely for the named organisation's board and C-suite leadership.</span>
  </div>
  <div class="page-footer"><span>${orgName} · AI Readiness Assessment · Confidential</span><span>Page 17</span></div>
</div>`

  // ─── ASSEMBLE ─────────────────────────────────────────────────────────────
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <title>AI Readiness Report — ${orgName}</title>
  <style>${css}</style>
</head>
<body>
${cover}
${toc}
${ceoBriefing}
${cioScorecard}
${cisoBrief}
${caoBrief}
${methodology}
${currentState}
${dimAnalysis}
${heatmap}
${gapAnalysis}
${useCaseRegister}
${riskRegister}
${roadmap}
${roiPage}
${regulatory}
${appendix}
<script>
  window.addEventListener('load', function() {
    setTimeout(function() { window.print(); }, 1200);
  });
<\/script>
</body>
</html>`
}
