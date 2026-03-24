/**
 * LoginScreen.jsx — Authentication Gate
 * AI Readiness Assessment Platform
 * Author:  Gagandeep Singh | AI Practice
 * Version: 1.0.0
 *
 * Split layout: left dark hero panel with animated particle field,
 * right panel with login form. Mirrors itil4-assessor UserLogin component.
 */

import { useState, useEffect, useRef } from 'react'
import { authenticate } from '../auth.js'

const TAGLINES = [
  'Where is AI ready in your organisation?',
  'Benchmark. Score. Transform.',
  'Built for leaders. Trusted by boards.',
]

// ─── Particle Canvas ──────────────────────────────────────────────────────────
function ParticleCanvas() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let raf
    let particles = []

    function resize() {
      canvas.width  = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
    }

    class Particle {
      constructor() { this.reset() }
      reset() {
        this.x  = Math.random() * canvas.width
        this.y  = Math.random() * canvas.height
        this.vx = (Math.random() - 0.5) * 0.4
        this.vy = (Math.random() - 0.5) * 0.4
        this.r  = Math.random() * 1.5 + 0.5
        this.alpha = Math.random() * 0.5 + 0.1
        this.color = Math.random() > 0.5 ? '#6366F1' : '#0EA5E9'
      }
      update() {
        this.x += this.vx
        this.y += this.vy
        if (this.x < 0 || this.x > canvas.width || this.y < 0 || this.y > canvas.height) this.reset()
      }
      draw() {
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2)
        ctx.fillStyle = this.color
        ctx.globalAlpha = this.alpha
        ctx.fill()
        ctx.globalAlpha = 1
      }
    }

    function init() {
      resize()
      particles = Array.from({ length: 80 }, () => new Particle())
    }

    function drawConnections() {
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x
          const dy = particles[i].y - particles[j].y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < 100) {
            ctx.beginPath()
            ctx.moveTo(particles[i].x, particles[i].y)
            ctx.lineTo(particles[j].x, particles[j].y)
            ctx.strokeStyle = `rgba(99,102,241,${0.15 * (1 - dist / 100)})`
            ctx.lineWidth = 0.5
            ctx.stroke()
          }
        }
      }
    }

    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      drawConnections()
      particles.forEach(p => { p.update(); p.draw() })
      raf = requestAnimationFrame(animate)
    }

    init()
    animate()
    window.addEventListener('resize', init)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', init)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
    />
  )
}

// ─── Login Screen ─────────────────────────────────────────────────────────────
export default function LoginScreen({ onLogin, onClose }) {
  const [username, setUsername]     = useState('')
  const [password, setPassword]     = useState('')
  const [remember,  setRemember]    = useState(false)
  const [error,     setError]       = useState('')
  const [loading,   setLoading]     = useState(false)
  const [taglineIdx, setTaglineIdx] = useState(0)
  const [showPass,  setShowPass]    = useState(false)

  // Rotate taglines
  useEffect(() => {
    const t = setInterval(() => setTaglineIdx(i => (i + 1) % TAGLINES.length), 3500)
    return () => clearInterval(t)
  }, [])

  async function handleSubmit(e) {
    e.preventDefault()
    if (!username.trim() || !password.trim()) {
      setError('Please enter username and password.')
      return
    }
    setLoading(true)
    setError('')
    // Tiny delay for UX
    await new Promise(r => setTimeout(r, 350))
    const session = authenticate(username.trim(), password.trim())
    setLoading(false)
    if (!session) {
      setError('Invalid credentials. Please try again.')
      return
    }
    onLogin(session)
  }

  const inner = (
    <div style={{
      minHeight: onClose ? 'unset' : '100vh',
      display: 'flex',
      fontFamily: "'Segoe UI', Inter, system-ui, sans-serif",
      background: '#08090C',
      borderRadius: onClose ? 20 : 0,
      overflow: 'hidden',
      maxWidth: onClose ? 900 : 'unset',
      width: onClose ? '100%' : 'unset',
      position: 'relative',
    }}>
      {/* ── LEFT HERO PANEL ── */}
      <div style={{
        flex: '0 0 50%',
        position: 'relative',
        background: 'linear-gradient(135deg, #08090C 0%, #0F1117 60%, #0D1020 100%)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '60px 56px',
        overflow: 'hidden',
      }}>
        <ParticleCanvas />

        {/* Hex grid overlay */}
        <svg style={{ position: 'absolute', inset: 0, opacity: 0.03, pointerEvents: 'none' }} width="100%" height="100%">
          <defs>
            <pattern id="hexgrid" x="0" y="0" width="60" height="52" patternUnits="userSpaceOnUse">
              <polygon points="30,2 56,16 56,44 30,58 4,44 4,16" fill="none" stroke="#6366F1" strokeWidth="1"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#hexgrid)"/>
        </svg>

        {/* Corner accent */}
        <div style={{ position: 'absolute', top: 0, right: 0, width: 200, height: 200, background: 'radial-gradient(circle at top right, rgba(99,102,241,0.12), transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: 0, left: 0, width: 200, height: 200, background: 'radial-gradient(circle at bottom left, rgba(14,165,233,0.08), transparent 70%)', pointerEvents: 'none' }} />

        <div style={{ position: 'relative', zIndex: 1 }}>
          {/* Brand pill */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, border: '1px solid rgba(99,102,241,0.35)', borderRadius: 100, padding: '5px 16px', marginBottom: 36, background: 'rgba(99,102,241,0.08)' }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#6366F1', boxShadow: '0 0 8px #6366F1' }} />
            <span style={{ fontSize: 10, color: 'rgba(99,102,241,0.9)', letterSpacing: 2, textTransform: 'uppercase', fontWeight: 700 }}>
              AI Readiness Assessor · AI Practice
            </span>
          </div>

          {/* Main heading */}
          <h1 style={{ fontSize: 'clamp(28px,3.5vw,46px)', fontWeight: 800, color: '#F8FAFC', lineHeight: 1.15, margin: '0 0 12px', letterSpacing: '-1px' }}>
            The World's Most<br />
            <span style={{ background: 'linear-gradient(90deg, #6366F1, #0EA5E9)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Sophisticated
            </span>
            <br />AI Readiness Platform
          </h1>

          {/* Animated tagline */}
          <div style={{ height: 28, overflow: 'hidden', marginBottom: 44 }}>
            <p key={taglineIdx} style={{
              fontSize: 15,
              color: 'rgba(255,255,255,0.45)',
              margin: 0,
              lineHeight: 1.6,
              animation: 'fadeSlideIn 0.5s ease forwards',
            }}>
              {TAGLINES[taglineIdx]}
            </p>
          </div>

          {/* Stats row */}
          <div style={{ display: 'flex', gap: 28 }}>
            {[
              { val: '25', lbl: 'Functions' },
              { val: '6',  lbl: 'Dimensions' },
              { val: '160', lbl: 'Questions' },
            ].map(s => (
              <div key={s.lbl}>
                <div style={{ fontSize: 26, fontWeight: 800, color: '#F8FAFC', lineHeight: 1 }}>{s.val}</div>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', letterSpacing: 1.5, textTransform: 'uppercase', marginTop: 2 }}>{s.lbl}</div>
              </div>
            ))}
          </div>

          {/* Trust badges */}
          <div style={{ display: 'flex', gap: 10, marginTop: 44, flexWrap: 'wrap' }}>
            {['Zero Cloud', 'Browser-Private', 'Print-Ready PDF'].map(b => (
              <div key={b} style={{ display: 'flex', alignItems: 'center', gap: 5, border: '1px solid rgba(255,255,255,0.07)', borderRadius: 100, padding: '4px 12px' }}>
                <span style={{ color: '#10B981', fontSize: 10 }}>✓</span>
                <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', letterSpacing: 0.5 }}>{b}</span>
              </div>
            ))}
          </div>

          {/* Bottom brand */}
          <div style={{ position: 'absolute', bottom: -280, left: 0, fontSize: 10, color: 'rgba(255,255,255,0.15)', letterSpacing: 1 }}>
            AI Practice · Gagandeep Singh · March 2026
          </div>
        </div>
      </div>

      {/* ── RIGHT LOGIN PANEL ── */}
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#F8FAFC',
        padding: '40px 32px',
      }}>
        <div style={{ width: '100%', maxWidth: 420 }}>
          {/* Logo area */}
          <div style={{ marginBottom: 36 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: 'linear-gradient(135deg, #6366F1, #0EA5E9)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
              <span style={{ fontSize: 20 }}>⬡</span>
            </div>
            <h2 style={{ fontSize: 24, fontWeight: 800, color: '#0F172A', margin: '0 0 6px', letterSpacing: '-0.5px' }}>Sign in</h2>
            <p style={{ fontSize: 13, color: '#64748B', margin: 0 }}>AI Readiness Assessment Platform</p>
          </div>

          {/* Error */}
          {error && (
            <div style={{ background: '#FEF2F2', border: '1px solid #FCA5A5', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#DC2626', marginBottom: 18 }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Username */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#0F172A', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1 }}>Username</label>
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="Enter username"
                autoFocus
                style={{ width: '100%', padding: '11px 14px', border: '1.5px solid #E2E8F0', borderRadius: 10, fontSize: 14, fontFamily: 'inherit', outline: 'none', color: '#0F172A', background: '#fff', boxSizing: 'border-box', transition: 'border-color 0.15s' }}
                onFocus={e => e.target.style.borderColor = '#6366F1'}
                onBlur={e => e.target.style.borderColor = '#E2E8F0'}
              />
            </div>

            {/* Password */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#0F172A', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1 }}>Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Enter password"
                  style={{ width: '100%', padding: '11px 44px 11px 14px', border: '1.5px solid #E2E8F0', borderRadius: 10, fontSize: 14, fontFamily: 'inherit', outline: 'none', color: '#0F172A', background: '#fff', boxSizing: 'border-box', transition: 'border-color 0.15s' }}
                  onFocus={e => e.target.style.borderColor = '#6366F1'}
                  onBlur={e => e.target.style.borderColor = '#E2E8F0'}
                />
                <button type="button" onClick={() => setShowPass(v => !v)}
                  style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8', fontSize: 13, padding: 0 }}>
                  {showPass ? '🙈' : '👁'}
                </button>
              </div>
            </div>

            {/* Remember me */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24 }}>
              <input type="checkbox" id="remember" checked={remember} onChange={e => setRemember(e.target.checked)}
                style={{ width: 14, height: 14, accentColor: '#6366F1', cursor: 'pointer' }} />
              <label htmlFor="remember" style={{ fontSize: 13, color: '#64748B', cursor: 'pointer' }}>Remember me</label>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '13px',
                border: 'none',
                borderRadius: 10,
                fontSize: 15,
                fontWeight: 700,
                cursor: loading ? 'wait' : 'pointer',
                background: loading ? '#94A3B8' : 'linear-gradient(135deg, #6366F1, #4F46E5)',
                color: '#fff',
                letterSpacing: '-0.2px',
                transition: 'opacity 0.15s',
                boxShadow: '0 4px 14px rgba(99,102,241,0.35)',
              }}>
              {loading ? 'Signing in…' : 'Sign In →'}
            </button>
          </form>

        </div>
      </div>

      {/* Close button — only shown in modal mode */}
      {onClose && (
        <button
          onClick={onClose}
          style={{ position: 'absolute', top: 16, right: 16, zIndex: 10, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, width: 32, height: 32, fontSize: 18, color: 'rgba(255,255,255,0.5)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1 }}
          aria-label="Close"
        >
          ×
        </button>
      )}

      <style>{`
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @media (max-width: 640px) {
          .login-hero { display: none !important; }
        }
      `}</style>
    </div>
  )

  if (onClose) {
    return (
      <div
        onClick={e => { if (e.target === e.currentTarget) onClose() }}
        style={{ position: 'fixed', inset: 0, zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}
      >
        {inner}
      </div>
    )
  }

  return inner
}
