/**
 * PDFExecutive.jsx — Classified Executive Summary
 */
import React from 'react'
import { Page, View, Text } from '@react-pdf/renderer'
import { C, S, scoreColor, maturityLabel } from './PDFStyles.js'

const DIM_META = {
  DQ: { label:'Data Quality',       color:'#6366F1' },
  TR: { label:'Tech Readiness',     color:'#0EA5E9' },
  TS: { label:'Talent & Skills',    color:'#F59E0B' },
  GE: { label:'Governance',         color:'#EF4444' },
  CR: { label:'Change Readiness',   color:'#F97316' },
  VR: { label:'Value & ROI',        color:'#10B981' },
}

function DimBar({ dimKey, score }) {
  const meta = DIM_META[dimKey]
  const pct  = Math.max(0, Math.min(100, ((score - 1) / 4) * 100))
  return (
    <View style={{ marginBottom: 8 }}>
      <View style={{ flexDirection:'row', justifyContent:'space-between', marginBottom:3 }}>
        <Text style={{ fontSize:8, fontFamily:'Inter', fontWeight:600, color:C.textPri }}>{meta.label}</Text>
        <Text style={{ fontSize:8, fontFamily:'Inter', fontWeight:700, color:meta.color }}>{score.toFixed(2)}</Text>
      </View>
      <View style={{ height:5, backgroundColor:C.border, borderRadius:3 }}>
        <View style={{ height:5, width:`${pct}%`, backgroundColor:meta.color, borderRadius:3 }} />
      </View>
    </View>
  )
}

export default function PDFExecutive({ assessmentData }) {
  const { orgName='Organisation', overallScore=1.0, dimScores={}, functionScores={}, orgSize='medium' } = assessmentData
  const ml = maturityLabel(overallScore)
  const sc = scoreColor(overallScore)

  const allFns  = Object.entries(functionScores).sort((a,b)=>b[1]-a[1])
  const topFns  = allFns.slice(0, 5)
  const gapFns  = allFns.slice(-5).reverse()

  const strengths = topFns.filter(([,s])=>s>=3.0).map(([id])=>id)
  const gaps      = gapFns.filter(([,s])=>s<2.6).map(([id])=>id)

  return (
    <Page size="A4" style={S.page}>
      {/* Section header */}
      <View style={S.sectionBar}>
        <Text style={S.sectionTitle}>02 · Executive Summary</Text>
      </View>

      {/* Overall score row */}
      <View style={{ flexDirection:'row', gap:10, marginBottom:16 }}>
        <View style={{ ...S.card, flex:1, borderLeft:`3px solid ${sc}` }}>
          <Text style={{ fontSize:7, color:C.textMut, textTransform:'uppercase', letterSpacing:1.5, marginBottom:4 }}>Overall Score</Text>
          <Text style={{ fontSize:28, fontFamily:'Inter', fontWeight:700, color:sc }}>{overallScore.toFixed(2)}</Text>
          <Text style={{ fontSize:8, color:C.textSec, marginTop:2 }}>{ml}</Text>
        </View>
        <View style={{ ...S.card, flex:2 }}>
          <Text style={{ fontSize:7, color:C.textMut, textTransform:'uppercase', letterSpacing:1.5, marginBottom:8 }}>Executive Assessment</Text>
          <Text style={S.body}>
            {orgName} has been assessed across 27 organisational functions and 6 AI Readiness Dimensions.
            The overall maturity of <Text style={{ color:sc, fontWeight:700 }}>{ml}</Text> ({overallScore.toFixed(2)}/5.00) indicates
            {overallScore >= 3.4
              ? ' a strong foundation with AI initiatives underway. Focus should shift to scaling and value capture.'
              : overallScore >= 2.6
              ? ' early AI adoption. Key gaps in data quality and governance require prioritised investment.'
              : ' significant pre-work required before AI adoption can be sustained at scale.'}
          </Text>
        </View>
      </View>

      {/* Dimension scores */}
      <View style={{ ...S.card, marginBottom:16 }}>
        <Text style={S.h4}>Dimension Scores</Text>
        {Object.entries(dimScores).map(([k,v]) => (
          <DimBar key={k} dimKey={k} score={v} />
        ))}
      </View>

      {/* Strengths and gaps */}
      <View style={{ flexDirection:'row', gap:10, marginBottom:16 }}>
        <View style={{ ...S.card, flex:1, borderLeft:`3px solid ${C.green}` }}>
          <Text style={{ fontSize:8, fontFamily:'Inter', fontWeight:700, color:C.green, marginBottom:6 }}>Top Strengths</Text>
          {topFns.slice(0,3).map(([id, score]) => (
            <View key={id} style={{ flexDirection:'row', justifyContent:'space-between', marginBottom:4 }}>
              <Text style={{ fontSize:8, color:C.textSec, flex:1 }}>{id.replace(/_/g,' ')}</Text>
              <Text style={{ fontSize:8, fontWeight:700, color:C.green }}>{score.toFixed(2)}</Text>
            </View>
          ))}
        </View>
        <View style={{ ...S.card, flex:1, borderLeft:`3px solid ${C.red}` }}>
          <Text style={{ fontSize:8, fontFamily:'Inter', fontWeight:700, color:C.red, marginBottom:6 }}>Critical Gaps</Text>
          {gapFns.slice(0,3).map(([id, score]) => (
            <View key={id} style={{ flexDirection:'row', justifyContent:'space-between', marginBottom:4 }}>
              <Text style={{ fontSize:8, color:C.textSec, flex:1 }}>{id.replace(/_/g,' ')}</Text>
              <Text style={{ fontSize:8, fontWeight:700, color:C.red }}>{score.toFixed(2)}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Key recommendations */}
      <View style={S.cardAccent}>
        <Text style={{ ...S.h4, marginBottom:8 }}>Strategic Recommendations</Text>
        {[
          'Establish a cross-functional AI Governance Committee within 90 days',
          'Conduct a data quality audit and prioritise top 3 data domains for AI readiness',
          'Launch an AI Literacy programme targeting all management layers',
          'Identify 2-3 high-value AI use cases for pilot in the next 6 months',
          'Engage legal/compliance to review AI regulatory obligations under EU AI Act and relevant local frameworks',
        ].map((rec, i) => (
          <View key={i} style={{ flexDirection:'row', marginBottom:5 }}>
            <Text style={{ fontSize:8, color:C.accent, marginRight:6, fontWeight:700 }}>{i+1}.</Text>
            <Text style={S.body}>{rec}</Text>
          </View>
        ))}
      </View>

      {/* Footer */}
      <View style={S.footer}>
        <Text style={S.footerText}>{orgName} · AI Readiness Assessment · Confidential</Text>
        <View style={{ flex:1 }} />
        <Text style={S.footerText}>Page 2</Text>
      </View>
    </Page>
  )
}
