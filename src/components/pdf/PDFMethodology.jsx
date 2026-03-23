/**
 * PDFMethodology.jsx — Methodology & Appendix
 */
import React from 'react'
import { Page, View, Text } from '@react-pdf/renderer'
import { C, S } from './PDFStyles.js'

const DIMS_META = [
  { key:'DQ', label:'Data Quality',       weight:30, color:'#6366F1', desc:'Measures the availability, accuracy, completeness, consistency, and lineage of data assets that AI systems depend on.' },
  { key:'TR', label:'Tech Readiness',     weight:18, color:'#0EA5E9', desc:'Evaluates infrastructure maturity, API integration capabilities, AI/ML tooling, cloud platforms, and MLOps practices.' },
  { key:'TS', label:'Talent & Skills',    weight:22, color:'#F59E0B', desc:'Assesses AI literacy across all staff, specialist AI/data capability, and the organisation\'s approach to upskilling.' },
  { key:'GE', label:'Governance & Ethics',weight:15, color:'#EF4444', desc:'Reviews AI policy frameworks, ethics governance, bias monitoring, regulatory compliance processes, and accountability structures.' },
  { key:'CR', label:'Change Readiness',   weight:8,  color:'#F97316', desc:'Measures leadership sponsorship, cultural openness to AI, change management capability, and stakeholder engagement.' },
  { key:'VR', label:'Value & ROI',        weight:7,  color:'#10B981', desc:'Assesses use case clarity, business case rigour, benefit realisation tracking, and AI investment accountability.' },
]

const MATURITY_TIERS = [
  { label:'AI Unaware',   range:'1.0–1.8', color:'#DC2626', desc:'No structured AI activity. Data, governance, and skills foundations absent. Immediate remediation required before any AI investment.' },
  { label:'AI Exploring', range:'1.8–2.6', color:'#EA580C', desc:'Early AI awareness and isolated experiments. Foundational work underway but not yet enterprise-ready.' },
  { label:'AI Piloting',  range:'2.6–3.4', color:'#D97706', desc:'Active pilots delivering value. Governance frameworks emerging. Investment in scaling infrastructure required.' },
  { label:'AI Scaling',   range:'3.4–4.2', color:'#2563EB', desc:'Multiple production AI systems. MLOps maturing. Focus on value capture, optimisation, and AI CoE establishment.' },
  { label:'AI-Native',    range:'4.2–5.0', color:'#059669', desc:'AI embedded in core processes. Continuous learning systems. AI is a strategic competitive advantage.' },
]

export default function PDFMethodology({ assessmentData }) {
  const { orgName='Organisation', totalQuestions=0, answeredQuestions=0 } = assessmentData
  const dateStr = new Date().toLocaleDateString('en-GB', { year:'numeric', month:'long', day:'numeric' })

  return (
    <Page size="A4" style={S.page}>
      <View style={S.sectionBar}>
        <Text style={S.sectionTitle}>11 · Methodology & Appendix</Text>
      </View>

      {/* Scoring formula */}
      <View style={{ ...S.card, marginBottom:12 }}>
        <Text style={{ ...S.h4, marginBottom:8 }}>Scoring Methodology</Text>
        <Text style={S.body}>
          Each organisational function is scored across six dimensions using a weighted sum. Dimension scores range from 1.0 (no maturity) to 5.0 (full maturity).
        </Text>
        <View style={{ backgroundColor:C.bg, borderRadius:4, padding:10, marginTop:8, border:`1px solid ${C.border}` }}>
          <Text style={{ fontFamily:'Courier', fontSize:8, color:C.accent }}>
            dimScore  = 1 + (earnedPoints / maxPoints) × 4{'\n'}
            fnScore   = weightedAvg(dimScores × dimWeights){'\n'}
            orgScore  = weightedAvg(fnScores)
          </Text>
        </View>
        <Text style={{ fontSize:7.5, color:C.textMut, marginTop:6 }}>
          Questions use a Yes/Partial/No (2/1/0) response model. DQ-tagged questions in the Data Readiness function carry 2× weight (4/2/0) to reflect the primacy of data foundations in AI success.
        </Text>
      </View>

      {/* Dimensions */}
      <View style={{ ...S.card, marginBottom:12 }}>
        <Text style={{ ...S.h4, marginBottom:8 }}>AI Readiness Dimensions</Text>
        {DIMS_META.map(dim => (
          <View key={dim.key} style={{ flexDirection:'row', marginBottom:6 }}>
            <View style={{ width:32 }}>
              <Text style={{ fontSize:8, fontFamily:'Inter', fontWeight:700, color:dim.color }}>{dim.key}</Text>
              <Text style={{ fontSize:6.5, fontFamily:'Inter', color:C.textMut }}>{dim.weight}%</Text>
            </View>
            <View style={{ flex:1 }}>
              <Text style={{ fontSize:8, fontFamily:'Inter', fontWeight:600, color:C.textPri, marginBottom:1 }}>{dim.label}</Text>
              <Text style={{ fontSize:7.5, fontFamily:'Inter', color:C.textMut }}>{dim.desc}</Text>
            </View>
          </View>
        ))}
      </View>

      {/* Maturity tiers */}
      <View style={{ ...S.card, marginBottom:12 }}>
        <Text style={{ ...S.h4, marginBottom:8 }}>Maturity Tiers</Text>
        {MATURITY_TIERS.map(tier => (
          <View key={tier.label} style={{ flexDirection:'row', marginBottom:6 }}>
            <View style={{ width:72 }}>
              <Text style={{ fontSize:8, fontFamily:'Inter', fontWeight:700, color:tier.color }}>{tier.label}</Text>
              <Text style={{ fontSize:6.5, fontFamily:'Inter', color:C.textMut }}>{tier.range}</Text>
            </View>
            <Text style={{ flex:1, fontSize:7.5, fontFamily:'Inter', color:C.textMut }}>{tier.desc}</Text>
          </View>
        ))}
      </View>

      {/* Assessment metadata */}
      <View style={{ ...S.card, borderLeft:`3px solid ${C.accent}` }}>
        <Text style={{ ...S.h4, marginBottom:8 }}>Assessment Metadata</Text>
        {[
          ['Organisation',       orgName],
          ['Report Generated',   dateStr],
          ['Framework Version',  'AI Readiness Assessor v2.0'],
          ['Question Bank',      `v2.0 — 205 questions across 27 functions`],
          ['Developer',          'Gagandeep Singh · AI Practice'],
          ['Confidentiality',    'This report is confidential. Not for public distribution.'],
        ].map(([label, value]) => (
          <View key={label} style={{ flexDirection:'row', marginBottom:4 }}>
            <Text style={{ width:110, fontSize:7.5, fontFamily:'Inter', color:C.textMut }}>{label}</Text>
            <Text style={{ flex:1, fontSize:7.5, fontFamily:'Inter', color:C.textSec }}>{value}</Text>
          </View>
        ))}
      </View>

      <View style={S.footer}>
        <Text style={S.footerText}>{orgName} · AI Readiness Assessment · Confidential</Text>
        <View style={{ flex:1 }} />
        <Text style={S.footerText}>Page 11</Text>
      </View>
    </Page>
  )
}
