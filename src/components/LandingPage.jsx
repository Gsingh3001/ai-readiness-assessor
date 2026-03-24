/**
 * LandingPage.jsx — Public Marketing Homepage
 * AI Readiness Assessment Platform
 * Author:  Gagandeep Singh | AI Practice
 *
 * Converted from static HTML design to fully animated React component.
 * Features: star-field canvas, gauge animation, tab switcher,
 * scroll-reveal IntersectionObserver, counter animations.
 */

import { useState, useEffect, useRef } from 'react'

// ─── Star Field Canvas ────────────────────────────────────────────────────────
function StarField() {
  const canvasRef = useRef(null)
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let stars = []
    let raf

    function resize() {
      canvas.width  = window.innerWidth
      canvas.height = window.innerHeight
      buildStars()
    }
    function buildStars() {
      stars = Array.from({ length: 220 }, () => ({
        x:      Math.random() * canvas.width,
        y:      Math.random() * canvas.height,
        size:   Math.random() * 1.4 + 0.4,
        opacity: Math.random() * 0.57 + 0.08,
        speed:  0.01 + Math.random() * 0.05,
        offset: Math.random() * Math.PI * 2,
      }))
    }
    function animate(time) {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      stars.forEach(s => {
        const tw = Math.sin(time * 0.001 * s.speed * 50 + s.offset) * 0.5 + 0.5
        ctx.globalAlpha = s.opacity * (0.3 + 0.7 * tw)
        ctx.fillStyle   = '#ffffff'
        ctx.beginPath()
        ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2)
        ctx.fill()
      })
      ctx.globalAlpha = 1
      raf = requestAnimationFrame(animate)
    }
    resize()
    window.addEventListener('resize', resize)
    raf = requestAnimationFrame(animate)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none z-0"
    />
  )
}

// ─── Score Gauge ─────────────────────────────────────────────────────────────
function ScoreGauge() {
  const gaugeRef  = useRef(null)
  const progressRef = useRef(null)
  const numberRef   = useRef(null)
  const tipRef      = useRef(null)
  const animated    = useRef(false)

  useEffect(() => {
    // Build tick marks
    const group = document.getElementById('lpGaugeTicks')
    if (group && group.children.length === 0) {
      for (let i = 0; i < 20; i++) {
        const angle   = (i * 18) * (Math.PI / 180)
        const isMajor = i % 4 === 0
        const len     = isMajor ? 14 : 8
        const r       = 140
        const x1 = 160 + (r + 10) * Math.cos(angle)
        const y1 = 160 + (r + 10) * Math.sin(angle)
        const x2 = 160 + (r + 10 + len) * Math.cos(angle)
        const y2 = 160 + (r + 10 + len) * Math.sin(angle)
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line')
        line.setAttribute('x1', x1); line.setAttribute('y1', y1)
        line.setAttribute('x2', x2); line.setAttribute('y2', y2)
        line.setAttribute('stroke', '#464554')
        line.setAttribute('stroke-width', isMajor ? '2' : '1')
        group.appendChild(line)
      }
    }
    if (!gaugeRef.current) return
    const obs = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting || animated.current) return
      animated.current = true
      const progress = progressRef.current
      const numEl    = numberRef.current
      const tip      = tipRef.current
      const TARGET   = 3.4
      const CIRC     = 880
      progress.style.strokeDashoffset = CIRC - (TARGET / 5) * CIRC
      if (tip) tip.style.opacity = 1
      let start = null
      function step(ts) {
        if (!start) start = ts
        const p    = Math.min((ts - start) / 1800, 1)
        const ease = p === 1 ? 1 : 1 - Math.pow(2, -10 * p)
        if (numEl) numEl.textContent = (ease * TARGET).toFixed(1)
        if (tip) {
          const angle = (ease * (TARGET / 5) * 360 - 90) * (Math.PI / 180)
          const tx = 160 + 140 * Math.cos(angle)
          const ty = 160 + 140 * Math.sin(angle)
          tip.style.transform = `translate(${tx - 160}px, ${ty - 160}px)`
        }
        if (p < 1) requestAnimationFrame(step)
      }
      requestAnimationFrame(step)
    }, { threshold: 0.3 })
    obs.observe(gaugeRef.current)
    return () => obs.disconnect()
  }, [])

  return (
    <div ref={gaugeRef} className="relative w-80 h-80 flex items-center justify-center gauge-container">
      <svg className="w-full h-full overflow-visible" style={{ transform: 'rotate(-90deg)' }} viewBox="0 0 320 320">
        <defs>
          <linearGradient id="lpGaugeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#6366F1" />
            <stop offset="100%" stopColor="#0EA5E9" />
          </linearGradient>
        </defs>
        <g id="lpGaugeTicks" />
        <circle cx="160" cy="160" r="140" fill="transparent" stroke="rgba(70,69,84,0.3)" strokeWidth="4" />
        <circle
          ref={progressRef}
          cx="160" cy="160" r="140" fill="transparent"
          stroke="url(#lpGaugeGrad)"
          strokeDasharray="880" strokeDashoffset="880"
          strokeLinecap="round" strokeWidth="12"
          style={{ transition: 'stroke-dashoffset 1800ms cubic-bezier(0.16,1,0.3,1)' }}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span ref={numberRef} className="text-6xl text-white" style={{ fontFamily: 'Orbitron, monospace' }}>0.0</span>
        <span className="text-xs tracking-widest text-on-surface-variant uppercase mt-2 text-center" style={{ maxWidth: 120, fontFamily: 'Orbitron, sans-serif' }}>Current Industry Avg</span>
      </div>
      <div ref={tipRef} className="absolute w-4 h-4 rounded-full z-10"
        style={{ background: '#89ceff', boxShadow: '0 0 15px rgba(14,165,233,0.8)', left: 'calc(50% - 8px)', top: 'calc(50% - 8px)', opacity: 0, transition: 'opacity 0.3s' }} />
    </div>
  )
}

// ─── Reveal wrapper — fades in when scrolled into view ───────────────────────
function Reveal({ children, delay = 0, className = '' }) {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setVisible(true); obs.disconnect() }
    }, { threshold: 0.1 })
    obs.observe(el)
    return () => obs.disconnect()
  }, [])
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity:    visible ? 1 : 0,
        transform:  visible ? 'translateY(0)' : 'translateY(20px)',
        transition: `opacity 600ms cubic-bezier(0.16,1,0.3,1) ${delay}ms, transform 600ms cubic-bezier(0.16,1,0.3,1) ${delay}ms`,
      }}
    >
      {children}
    </div>
  )
}

// ─── Animated counter ─────────────────────────────────────────────────────────
function Counter({ target }) {
  const ref  = useRef(null)
  const done = useRef(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting || done.current) return
      done.current = true
      let start = null
      const duration = 1500
      function step(ts) {
        if (!start) start = ts
        const p = Math.min((ts - start) / duration, 1)
        el.textContent = Math.floor(p * target)
        if (p < 1) requestAnimationFrame(step)
        else el.textContent = target
      }
      requestAnimationFrame(step)
    }, { threshold: 0.1 })
    obs.observe(el)
    return () => obs.disconnect()
  }, [target])
  return <span ref={ref}>0</span>
}

// ─── Education Tabs ───────────────────────────────────────────────────────────
const TABS = [
  { id: 'glossary',   label: 'Glossary' },
  { id: 'guide',      label: 'Assessment Guide' },
  { id: 'dimensions', label: '6 Dimensions' },
]

// ─── Main Landing Page ────────────────────────────────────────────────────────
export default function LandingPage({ onShowLogin }) {
  const [activeTab, setActiveTab] = useState('glossary')

  return (
    <div className="antialiased" style={{ background: '#08090C', color: '#e3e2e6', fontFamily: 'Inter, sans-serif', overflowX: 'hidden' }}>
      <style>{`
        .material-symbols-outlined { font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24; }
        .text-gradient-primary { background: linear-gradient(135deg, #c0c1ff 0%, #89ceff 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .hex-grid { background-image: url("data:image/svg+xml,%3Csvg width='60' height='104' viewBox='0 0 60 104' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0l30 17.32v34.64L30 69.28 0 51.96V17.32L30 0zM0 86.6l30 17.32 30-17.32v-34.64L30 51.96 0 69.28v17.32z' fill='%236366F1' fill-opacity='0.03' fill-rule='evenodd'/%3E%3C/svg%3E"); }
        .radar-sweep { height: 1px; width: 100%; background: linear-gradient(90deg, transparent, rgba(137,206,255,0.3), transparent); position: absolute; top: 0; animation: lp-sweep 8s linear infinite; }
        @keyframes lp-sweep { 0% { transform: translateY(0vh); } 100% { transform: translateY(100vh); } }
        .nav-glass { background: rgba(8,9,12,0.7); backdrop-filter: blur(20px); }
        .glow-aura { filter: blur(80px); opacity: 0.15; z-index: -1; }
      `}</style>

      <StarField />

      {/* ── Navigation ── */}
      <nav className="fixed top-0 w-full z-50 flex justify-between items-center px-8 py-4 nav-glass">
        <div className="text-xl font-extrabold tracking-tighter text-slate-100" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
          AI Readiness Assessor — AI Practice
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={onShowLogin}
            className="text-slate-400 hover:text-slate-100 transition-colors text-sm font-semibold px-4 py-2"
          >
            Login
          </button>
          <button
            onClick={onShowLogin}
            className="px-6 py-2.5 rounded-xl font-semibold text-sm hover:shadow-lg active:scale-95 transition-all"
            style={{ background: 'linear-gradient(135deg, #c0c1ff, #8083ff)', color: '#1000a9' }}
          >
            Start Assessment
          </button>
        </div>
      </nav>

      {/* ── Hero ── */}
      <header className="relative min-h-screen flex flex-col items-center justify-center pt-24 overflow-hidden hex-grid">
        <div className="radar-sweep" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full glow-aura" style={{ background: '#c0c1ff' }} />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full glow-aura" style={{ background: '#89ceff' }} />

        <div className="relative z-10 text-center px-4 max-w-5xl mx-auto">
          <Reveal>
            <div className="inline-flex items-center gap-2 px-3 py-1 mb-8"
              style={{ borderRadius: 100, background: 'rgba(192,193,255,0.1)', border: '1px solid rgba(192,193,255,0.2)' }}>
              <span className="text-[9px] tracking-[0.2em]" style={{ fontFamily: 'Orbitron, sans-serif', color: '#89ceff' }}>
                ◆ ENTERPRISE AI MATURITY ASSESSMENT
              </span>
            </div>
          </Reveal>

          <Reveal delay={80}>
            <h1 className="text-5xl md:text-8xl font-extrabold tracking-tight mb-6" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              <span className="block text-white">Where is AI ready</span>
              <span className="block text-gradient-primary">in your organisation?</span>
            </h1>
          </Reveal>

          <Reveal delay={160}>
            <p className="text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed" style={{ color: '#c7c4d7' }}>
              A function-by-function AI maturity assessment for business leaders. Scored across 6 dimensions. Benchmarked by industry. Delivered as a boardroom-ready report.
            </p>
          </Reveal>

          <Reveal delay={240}>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20">
              <button
                onClick={onShowLogin}
                className="px-8 py-4 rounded-xl font-bold text-lg flex items-center gap-2 transition-all active:scale-95"
                style={{ background: 'linear-gradient(135deg, #c0c1ff, #8083ff)', color: '#1000a9', boxShadow: '0 0 0 0 rgba(99,102,241,0)' }}
                onMouseEnter={e => e.currentTarget.style.boxShadow = '0 0 40px rgba(99,102,241,0.3)'}
                onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
              >
                Start Assessment <span className="material-symbols-outlined text-xl">arrow_forward</span>
              </button>
              <button className="px-8 py-4 rounded-xl font-bold text-lg transition-all text-white"
                style={{ border: '1px solid rgba(70,69,84,0.3)' }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                View a Sample Report
              </button>
            </div>
          </Reveal>

          <Reveal delay={320}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-0 max-w-4xl mx-auto pt-12"
              style={{ borderTop: '1px solid rgba(70,69,84,0.1)' }}>
              {[
                { target: 25,  label: 'Org Functions' },
                { target: 160, label: 'Expert Questions' },
                { target: 6,   label: 'Readiness Dimensions' },
              ].map((s, i) => (
                <div key={s.label} className="flex flex-col items-center"
                  style={{ borderLeft: i > 0 ? '1px solid rgba(70,69,84,0.1)' : 'none' }}>
                  <span className="text-4xl text-white mb-1" style={{ fontFamily: 'Orbitron, monospace' }}>
                    <Counter target={s.target} />
                  </span>
                  <span className="text-xs tracking-widest uppercase" style={{ fontFamily: 'Orbitron, sans-serif', color: '#c7c4d7' }}>
                    {s.label}
                  </span>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </header>

      {/* ── Privacy Band ── */}
      <Reveal>
        <div className="w-full py-4 flex justify-center items-center"
          style={{ background: 'rgba(13,14,17,0.5)', borderTop: '1px solid rgba(70,69,84,0.05)', borderBottom: '1px solid rgba(70,69,84,0.05)' }}>
          <div className="flex flex-col items-center text-center py-2">
            <div className="text-white font-bold text-lg mb-1" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              🔒 100% Private · Zero Cloud · No Data Leaves Your Browser
            </div>
            <p className="text-sm" style={{ color: '#c7c4d7' }}>
              All processing runs in your browser. Zero data transmission. Your AI strategy stays confidential.
            </p>
          </div>
        </div>
      </Reveal>

      {/* ── Features ── */}
      <section className="py-24 px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { icon: 'account_tree', color: 'indigo', num: '01', title: '25 Functions', desc: 'Granular analysis across specialized departments from HR and Legal to Supply Chain and Engineering.' },
            { icon: 'database',     color: 'cyan',   num: '02', title: 'Data Readiness', desc: 'Comprehensive review of your data infrastructure, governance policies, and technical debt levels.' },
            { icon: 'analytics',    color: 'emerald',num: '03', title: 'Board Report', desc: 'Auto-generated, executive-level documentation with clear investment priorities and strategic roadmaps.' },
          ].map((f, i) => {
            const colors = {
              indigo:  { border: '#6366F1', text: '#818CF8', bg: 'rgba(99,102,241,0.1)', shadow: 'rgba(99,102,241,0.1)' },
              cyan:    { border: '#0EA5E9', text: '#38BDF8', bg: 'rgba(14,165,233,0.1)', shadow: 'rgba(14,165,233,0.1)' },
              emerald: { border: '#10B981', text: '#34D399', bg: 'rgba(16,185,129,0.1)', shadow: 'rgba(16,185,129,0.1)' },
            }[f.color]
            return (
              <Reveal key={f.num} delay={i * 80}>
                <div className="group relative p-8 rounded-xl transition-all duration-300 cursor-default"
                  style={{ background: '#1b1b1f', borderLeft: `4px solid ${colors.border}` }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-8px)'; e.currentTarget.style.boxShadow = `0 20px 50px ${colors.shadow}` }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none' }}
                >
                  <div className="mb-6 flex justify-between" style={{ color: colors.text }}>
                    <span className="material-symbols-outlined text-4xl">{f.icon}</span>
                    <span style={{ fontFamily: 'Orbitron, monospace', fontSize: 12, color: colors.border, opacity: 0.5 }}>{f.num}</span>
                  </div>
                  <h3 className="text-2xl font-bold mb-4 text-white" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>{f.title}</h3>
                  <p style={{ color: '#c7c4d7', lineHeight: '1.6' }}>{f.desc}</p>
                </div>
              </Reveal>
            )
          })}
        </div>
      </section>

      {/* ── Maturity Scale + Gauge ── */}
      <section className="py-24" style={{ background: '#0d0e11' }}>
        <Reveal>
          <div className="max-w-7xl mx-auto px-8 flex flex-col lg:flex-row items-center gap-20">
            {/* Scale */}
            <div className="flex-1 space-y-4 w-full">
              <h2 className="text-4xl font-extrabold mb-4 text-white" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>The AI Maturity Scale</h2>
              <p className="mb-12 text-lg" style={{ color: '#c7c4d7' }}>Five levels. One honest score. No averages hiding the gaps.</p>
              <div className="space-y-4">
                {[
                  { n: '01', color: '#EF4444', label: 'AI Unaware',   pct: '20%',  opacity: 0.4  },
                  { n: '02', color: '#F97316', label: 'AI Exploring',  pct: '40%',  opacity: 0.6  },
                  { n: '03', color: '#F59E0B', label: 'AI Piloting',   pct: '60%',  opacity: 0.8  },
                  { n: '04', color: '#0EA5E9', label: 'AI Scaling',    pct: '80%',  opacity: 1, active: true },
                  { n: '05', color: '#10B981', label: 'AI-Embedded',   pct: '100%', opacity: 1    },
                ].map(lvl => (
                  <div key={lvl.n} className="flex items-center gap-6 p-4 rounded-lg" style={{ background: '#1f1f23', opacity: lvl.opacity, borderLeft: lvl.active ? `4px solid ${lvl.color}` : 'none' }}>
                    <span style={{ fontFamily: 'Orbitron, monospace', fontSize: 18, width: 32, color: lvl.color }}>{lvl.n}</span>
                    <div className="flex-1">
                      <div className="font-bold uppercase text-xs tracking-widest mb-1" style={{ color: lvl.color }}>Level {lvl.n.replace('0','')}</div>
                      <div className="text-white font-bold">{lvl.label}</div>
                      <div className="h-1 mt-2 rounded-full overflow-hidden" style={{ background: 'rgba(70,69,84,0.2)' }}>
                        <div className="h-full rounded-full" style={{ width: lvl.pct, background: lvl.color }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {/* Gauge */}
            <ScoreGauge />
          </div>
        </Reveal>
      </section>

      {/* ── Education Centre Tabs ── */}
      <section className="py-24 px-8 max-w-7xl mx-auto">
        <div className="flex justify-center gap-8 mb-16" style={{ borderBottom: '1px solid rgba(70,69,84,0.1)' }}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)}
              className="pb-4 px-4 font-bold text-lg transition-colors"
              style={{
                fontFamily:   'Space Grotesk, sans-serif',
                color:        activeTab === t.id ? '#fff' : '#c7c4d7',
                borderBottom: activeTab === t.id ? '2px solid #c0c1ff' : '2px solid transparent',
                background:   'none',
                border:       'none',
                borderBottom: activeTab === t.id ? '2px solid #c0c1ff' : '2px solid transparent',
                cursor:       'pointer',
              }}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Glossary */}
        {activeTab === 'glossary' && (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {[
              { range: '1.0–1.8', color: '#464554', label: 'AI Unaware',  desc: 'No formal strategy or use-cases identified across any function.' },
              { range: '1.8–2.6', color: '#c0c1ff', label: 'AI Exploring', desc: 'Identifying potential impact areas and conducting initial pilots.' },
              { range: '2.6–3.4', color: '#89ceff', label: 'AI Piloting',  desc: 'Dedicated teams running active PoCs with measurable KPIs.' },
              { range: '3.4–4.2', color: '#4edea3', label: 'AI Scaling',   desc: 'Cross-functional deployment and centralised AI governance.' },
              { range: '4.2–5.0', color: '#ffffff', label: 'AI-Embedded',  desc: 'Core business model operates on AI-first principles.' },
            ].map(g => (
              <div key={g.label} className="p-6 rounded-lg" style={{ background: '#1f1f23', borderTop: `2px solid ${g.color}` }}>
                <span className="block mb-4 uppercase"
                  style={{ fontFamily: 'Orbitron, monospace', fontSize: 10, color: g.color, letterSpacing: 2 }}>{g.range}</span>
                <h4 className="text-lg font-bold text-white mb-2">{g.label}</h4>
                <p className="text-sm" style={{ color: '#c7c4d7' }}>{g.desc}</p>
              </div>
            ))}
          </div>
        )}

        {/* Assessment Guide */}
        {activeTab === 'guide' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Who fills it in */}
            <div className="p-8 rounded-xl" style={{ background: '#1f1f23', border: '1px solid rgba(70,69,84,0.1)' }}>
              <h4 className="text-xl font-bold mb-6 text-white flex items-center gap-3" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                <span className="material-symbols-outlined" style={{ color: '#c0c1ff' }}>groups</span> Who Should Fill This In
              </h4>
              <div className="space-y-4">
                {[['CIO / CTO','Technical Foundation'],['CDO / Data Leads','Data Maturity'],['CHRO','Talent & Culture'],['CFO','Value Realization'],['BU Heads','Functional Use-cases']].map(([r,d]) => (
                  <div key={r} className="flex items-center justify-between py-2" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <span className="font-bold text-sm text-white">{r}</span>
                    <span className="text-xs" style={{ color: '#c7c4d7' }}>{d}</span>
                  </div>
                ))}
              </div>
            </div>
            {/* Time & Format */}
            <div className="p-8 rounded-xl" style={{ background: '#1f1f23', border: '1px solid rgba(70,69,84,0.1)' }}>
              <h4 className="text-xl font-bold mb-6 text-white flex items-center gap-3" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                <span className="material-symbols-outlined" style={{ color: '#89ceff' }}>schedule</span> Time &amp; Format
              </h4>
              <div className="space-y-4 mb-6">
                {[['45m','Total completion time per function'],['160','Multiple choice targeted questions'],['100%','Digital, self-paced interface'],['24h','Final report generation window']].map(([v,l]) => (
                  <div key={l} className="flex items-center gap-4">
                    <span className="text-sm" style={{ fontFamily: 'Orbitron, monospace', color: '#89ceff' }}>{v}</span>
                    <span className="text-sm text-white">{l}</span>
                  </div>
                ))}
              </div>
              <div className="p-4 rounded-lg" style={{ background: 'rgba(137,206,255,0.05)', border: '1px solid rgba(137,206,255,0.2)' }}>
                <p className="text-xs italic" style={{ color: '#89ceff' }}>Pro Tip: We recommend a workshop format for the most accurate multi-perspective results.</p>
              </div>
            </div>
            {/* What to prepare */}
            <div className="p-8 rounded-xl" style={{ background: '#1f1f23', border: '1px solid rgba(70,69,84,0.1)' }}>
              <h4 className="text-xl font-bold mb-6 text-white flex items-center gap-3" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                <span className="material-symbols-outlined" style={{ color: '#4edea3' }}>inventory_2</span> What to Prepare
              </h4>
              <div className="grid gap-3">
                {[
                  [true, 'Data Governance Policy'], [true, 'Cloud Infrastructure Map'],
                  [true, 'Current AI Pilot List'],  [true, 'Org Charts (Functional)'],
                  [false,'Tech Debt Inventory'],     [false,'Skill Gap Analysis'],
                  [false,'Ethical Guidelines Draft'],[false,'Functional ROI Metrics'],
                ].map(([done, item]) => (
                  <div key={item} className="flex items-center gap-3 text-sm" style={{ color: done ? '#e3e2e6' : '#c7c4d7' }}>
                    <span className="material-symbols-outlined text-lg"
                      style={{ color: done ? '#4edea3' : '#908fa0', fontVariationSettings: done ? "'FILL' 1" : "'FILL' 0" }}>
                      {done ? 'check_circle' : 'circle'}
                    </span>
                    {item}
                  </div>
                ))}
              </div>
            </div>
            {/* How to answer */}
            <div className="p-8 rounded-xl" style={{ background: '#1f1f23', border: '1px solid rgba(70,69,84,0.1)' }}>
              <h4 className="text-xl font-bold mb-6 text-white flex items-center gap-3" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                <span className="material-symbols-outlined" style={{ color: '#c0c1ff' }}>lightbulb</span> How to Answer Well
              </h4>
              <div className="relative pl-8 space-y-6">
                <div className="absolute left-3 top-2 bottom-2 w-px" style={{ background: 'rgba(70,69,84,0.3)' }} />
                {[
                  ['Select Lead Function',  'Begin with the department most critical to your 2024 strategy.'],
                  ['Be Radical & Honest',   'Overstating readiness leads to flawed implementation plans.'],
                  ['Consult Technical Owners','Dimensions like DQ and TS require deep infrastructure knowledge.'],
                ].map(([t, d]) => (
                  <div key={t} className="relative">
                    <div className="absolute w-4 h-4 rounded-full" style={{ left: -25, top: 0, background: '#c0c1ff', border: '4px solid #1f1f23' }} />
                    <h5 className="font-bold text-sm mb-1 text-white">{t}</h5>
                    <p className="text-xs" style={{ color: '#c7c4d7' }}>{d}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 6 Dimensions */}
        {activeTab === 'dimensions' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { code: 'DQ', title: 'Data Quality',        weight: 30, color: '#818CF8', bg: 'rgba(99,102,241,0.1)',  desc: 'Assessment of availability, cleanliness, and accessibility of historical data silos.' },
              { code: 'TS', title: 'Talent & Skills',     weight: 22, color: '#FCD34D', bg: 'rgba(245,158,11,0.1)',  desc: 'Internal skill gaps, data literacy levels, and change management capacity.' },
              { code: 'TR', title: 'Tech Readiness',      weight: 18, color: '#38BDF8', bg: 'rgba(14,165,233,0.1)',  desc: 'Infrastructure readiness, cloud-native capabilities, and architectural flexibility.' },
              { code: 'GE', title: 'Governance & Ethics', weight: 15, color: '#F87171', bg: 'rgba(239,68,68,0.1)',   desc: 'Privacy frameworks, ethical guidelines, and compliance monitoring systems.' },
              { code: 'CR', title: 'Change Readiness',    weight:  8, color: '#FB923C', bg: 'rgba(249,115,22,0.1)',  desc: 'Leadership buy-in and organizational willingness to experiment with workflows.' },
              { code: 'VR', title: 'Value & ROI',         weight:  7, color: '#34D399', bg: 'rgba(16,185,129,0.1)',  desc: 'Ability to translate AI outputs into tangible ROI and business value.' },
            ].map(d => (
              <div key={d.code} className="p-8 rounded-xl" style={{ background: '#1b1b1f', border: '1px solid rgba(70,69,84,0.05)' }}>
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-lg flex items-center justify-center font-bold"
                    style={{ background: d.bg, color: d.color, fontFamily: 'Orbitron, monospace', fontSize: 13 }}>{d.code}</div>
                  <h3 className="text-xl font-bold text-white">{d.title}</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between text-xs uppercase" style={{ fontFamily: 'Orbitron, monospace', color: '#c7c4d7' }}>
                    <span>Weight</span><span>{d.weight}%</span>
                  </div>
                  <div className="h-1.5 w-full rounded-full" style={{ background: 'rgba(70,69,84,0.1)' }}>
                    <div className="h-full rounded-full" style={{ width: `${d.weight}%`, background: d.color }} />
                  </div>
                  <p className="text-sm pt-2" style={{ color: '#c7c4d7' }}>{d.desc}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ── Footer ── */}
      <footer className="py-16 px-12 mt-24" style={{ background: '#08090C', borderTop: '1px solid rgba(30,27,75,0.3)' }}>
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div>
            <p className="text-xs" style={{ fontFamily: 'Orbitron, monospace', color: '#c7c4d7' }}>
              © 2026 AI Readiness Assessor — AI Practice by Gagandeep Singh. All rights reserved.
            </p>
          </div>
          <div className="flex gap-8">
            {['Privacy Policy','Terms of Service','Documentation'].map(l => (
              <a key={l} href="#" className="text-xs uppercase tracking-widest transition-colors"
                style={{ fontFamily: 'Orbitron, monospace', color: '#c7c4d7' }}
                onMouseEnter={e => e.currentTarget.style.color = '#fff'}
                onMouseLeave={e => e.currentTarget.style.color = '#c7c4d7'}>
                {l}
              </a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  )
}
