/**
 * PDFStyles.js — Shared StyleSheet for @react-pdf/renderer
 * AI Readiness Assessment Platform
 */
import { StyleSheet } from '@react-pdf/renderer'

export const C = {
  bg:       '#08090C',
  surface:  '#0F1117',
  border:   '#1E2028',
  accent:   '#6366F1',
  blue:     '#0EA5E9',
  green:    '#10B981',
  amber:    '#F59E0B',
  red:      '#EF4444',
  orange:   '#F97316',
  textPri:  '#F8FAFC',
  textSec:  '#94A3B8',
  textMut:  '#475569',
  white:    '#FFFFFF',
}

export const S = StyleSheet.create({
  page: {
    backgroundColor: C.bg,
    padding: 40,
    fontFamily: 'Inter',
    color: C.textPri,
  },
  coverPage: {
    backgroundColor: C.bg,
    padding: 0,
    fontFamily: 'Inter',
    color: C.textPri,
    display: 'flex',
    flexDirection: 'column',
  },
  // Typography
  h1: { fontSize: 28, fontFamily: 'Inter', fontWeight: 700, color: C.textPri, marginBottom: 8 },
  h2: { fontSize: 20, fontFamily: 'Inter', fontWeight: 700, color: C.textPri, marginBottom: 6 },
  h3: { fontSize: 14, fontFamily: 'Inter', fontWeight: 600, color: C.textPri, marginBottom: 4 },
  h4: { fontSize: 11, fontFamily: 'Inter', fontWeight: 600, color: C.textSec, marginBottom: 3 },
  body: { fontSize: 9, fontFamily: 'Inter', color: C.textSec, lineHeight: 1.5 },
  small: { fontSize: 7.5, fontFamily: 'Inter', color: C.textMut },
  mono: { fontSize: 8, fontFamily: 'Courier', color: C.accent },
  // Layout
  row: { display: 'flex', flexDirection: 'row' },
  col: { display: 'flex', flexDirection: 'column' },
  spacer: { flex: 1 },
  // Cards
  card: {
    backgroundColor: C.surface,
    borderRadius: 6,
    padding: 14,
    marginBottom: 10,
    border: `1px solid ${C.border}`,
  },
  cardAccent: {
    backgroundColor: C.surface,
    borderRadius: 6,
    padding: 14,
    marginBottom: 10,
    borderLeft: `3px solid ${C.accent}`,
    border: `1px solid ${C.border}`,
  },
  // Divider
  divider: {
    borderBottom: `1px solid ${C.border}`,
    marginVertical: 10,
  },
  // Badge
  badge: {
    fontSize: 7,
    fontFamily: 'Inter',
    fontWeight: 700,
    borderRadius: 3,
    paddingHorizontal: 5,
    paddingVertical: 2,
    textTransform: 'uppercase',
  },
  // Section header bar
  sectionBar: {
    backgroundColor: C.surface,
    borderBottom: `2px solid ${C.accent}`,
    paddingVertical: 8,
    paddingHorizontal: 14,
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 11,
    fontFamily: 'Inter',
    fontWeight: 700,
    color: C.accent,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  // Score pill
  scorePill: {
    width: 44,
    height: 20,
    borderRadius: 10,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreText: {
    fontSize: 9,
    fontFamily: 'Inter',
    fontWeight: 700,
    color: C.white,
  },
  // Table
  tableHeader: {
    backgroundColor: C.border,
    flexDirection: 'row',
    paddingVertical: 5,
    paddingHorizontal: 8,
    borderRadius: 3,
    marginBottom: 2,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderBottom: `1px solid ${C.border}`,
  },
  tableCell: {
    fontSize: 8,
    fontFamily: 'Inter',
    color: C.textSec,
  },
  tableCellBold: {
    fontSize: 8,
    fontFamily: 'Inter',
    fontWeight: 600,
    color: C.textPri,
  },
  // Page footer
  footer: {
    position: 'absolute',
    bottom: 20,
    left: 40,
    right: 40,
    flexDirection: 'row',
    alignItems: 'center',
    borderTop: `1px solid ${C.border}`,
    paddingTop: 6,
  },
  footerText: {
    fontSize: 7,
    fontFamily: 'Inter',
    color: C.textMut,
  },
})

export function scoreColor(score) {
  if (score >= 4.2) return C.green
  if (score >= 3.4) return C.blue
  if (score >= 2.6) return C.amber
  if (score >= 1.8) return C.orange
  return C.red
}

export function maturityLabel(score) {
  if (score >= 4.2) return 'AI-Native'
  if (score >= 3.4) return 'AI Scaling'
  if (score >= 2.6) return 'AI Piloting'
  if (score >= 1.8) return 'AI Exploring'
  return 'AI Unaware'
}
