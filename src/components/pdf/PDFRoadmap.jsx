/**
 * PDFRoadmap.jsx — 3-Phase Investment Roadmap
 */
import React from 'react'
import { Page, View, Text } from '@react-pdf/renderer'
import { C, S, scoreColor, maturityLabel } from './PDFStyles.js'

const PHASES = [
  {
    num:   1,
    label: 'Foundation',
    time:  'Months 1–6',
    color: '#6366F1',
    focus: 'Data quality, governance, AI literacy baseline',
    actions: [
      'Commission an enterprise-wide data quality audit',
      'Appoint AI Governance Lead and form AI Steering Committee',
      'Deploy AI literacy e-learning for all staff (target: 80% completion)',
      'Identify and document 3–5 high-value AI use cases',
      'Conduct regulatory readiness review (EU AI Act, sectoral rules)',
    ],
    investSmall:  '£80K–£150K',
    investMedium: '£200K–£400K',
    investLarge:  '£500K–£1M',
  },
  {
    num:   2,
    label: 'Pilot',
    time:  'Months 7–18',
    color: '#0EA5E9',
    focus: 'MVP AI use cases, model governance, MLOps baseline',
    actions: [
      'Build and deploy 2–3 AI pilots in selected functions',
      'Establish MLOps tooling (Databricks / Azure ML / Vertex AI)',
      'Implement AI Model Risk Management framework',
      'Instrument KPI tracking and A/B testing for each pilot',
      'Expand AI literacy to advanced technical and management tracks',
    ],
    investSmall:  '£200K–£500K',
    investMedium: '£600K–£1.5M',
    investLarge:  '£1.5M–£4M',
  },
  {
    num:   3,
    label: 'Scale',
    time:  'Months 19–36',
    color: '#10B981',
    focus: 'Enterprise AI platform, autonomous optimisation, value capture',
    actions: [
      'Expand proven pilots to full production at enterprise scale',
      'Deploy unified AI data platform and feature store',
      'Launch AI Centre of Excellence with internal capability',
      'Automate model monitoring, retraining, and drift detection',
      'Report AI ROI to board; plan next 3-year AI roadmap',
    ],
    investSmall:  '£400K–£1M',
    investMedium: '£1.5M–£4M',
    investLarge:  '£4M–£12M',
  },
]

export default function PDFRoadmap({ assessmentData }) {
  const { orgName='Organisation', orgSize='medium', overallScore=1.0 } = assessmentData
  const sizeKey = orgSize?.toLowerCase().includes('large') ? 'investLarge'
    : orgSize?.toLowerCase().includes('small') ? 'investSmall'
    : 'investMedium'
  const sizeLabel = orgSize?.toLowerCase().includes('large') ? 'Large Enterprise'
    : orgSize?.toLowerCase().includes('small') ? 'Small Organisation'
    : 'Mid-Market'

  return (
    <Page size="A4" style={S.page}>
      <View style={S.sectionBar}>
        <Text style={S.sectionTitle}>07 · Investment Roadmap</Text>
      </View>

      <View style={{ flexDirection:'row', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
        <Text style={S.body}>
          Three-phase AI transformation roadmap tailored for {orgName} at current maturity: <Text style={{ color:scoreColor(overallScore), fontWeight:700 }}>{maturityLabel(overallScore)}</Text>.
        </Text>
        <View style={{ backgroundColor:`${C.accent}20`, borderRadius:4, paddingHorizontal:8, paddingVertical:3 }}>
          <Text style={{ fontSize:7.5, fontFamily:'Inter', color:C.accent }}>Org size: {sizeLabel}</Text>
        </View>
      </View>

      {PHASES.map((phase, idx) => (
        <View key={phase.num} style={{ ...S.card, borderLeft:`3px solid ${phase.color}`, marginBottom:12 }}>
          <View style={{ flexDirection:'row', alignItems:'center', marginBottom:8 }}>
            <View style={{ width:26, height:26, borderRadius:13, backgroundColor:phase.color, alignItems:'center', justifyContent:'center', marginRight:10 }}>
              <Text style={{ fontSize:12, fontFamily:'Inter', fontWeight:700, color:C.white }}>{phase.num}</Text>
            </View>
            <View style={{ flex:1 }}>
              <Text style={{ fontSize:11, fontFamily:'Inter', fontWeight:700, color:phase.color }}>{phase.label}</Text>
              <Text style={{ fontSize:8, fontFamily:'Inter', color:C.textMut }}>{phase.time} · {phase.focus}</Text>
            </View>
            <View style={{ backgroundColor:`${phase.color}20`, borderRadius:4, paddingHorizontal:8, paddingVertical:4, alignItems:'center' }}>
              <Text style={{ fontSize:7, fontFamily:'Inter', color:C.textMut, marginBottom:2 }}>Est. Investment</Text>
              <Text style={{ fontSize:9, fontFamily:'Inter', fontWeight:700, color:phase.color }}>{phase[sizeKey]}</Text>
            </View>
          </View>

          {phase.actions.map((action, i) => (
            <View key={i} style={{ flexDirection:'row', alignItems:'flex-start', marginBottom:4 }}>
              <View style={{ width:5, height:5, borderRadius:3, backgroundColor:phase.color, marginTop:3, marginRight:7 }} />
              <Text style={{ ...S.body, flex:1 }}>{action}</Text>
            </View>
          ))}
        </View>
      ))}

      {/* Timeline bar */}
      <View style={{ flexDirection:'row', height:8, borderRadius:4, overflow:'hidden', marginTop:4 }}>
        <View style={{ flex:1, backgroundColor:'#6366F1' }} />
        <View style={{ flex:2, backgroundColor:'#0EA5E9' }} />
        <View style={{ flex:2, backgroundColor:'#10B981' }} />
      </View>
      <View style={{ flexDirection:'row', marginTop:4 }}>
        <Text style={{ flex:1, fontSize:7, fontFamily:'Inter', color:'#6366F1', textAlign:'center' }}>Foundation (M1–6)</Text>
        <Text style={{ flex:2, fontSize:7, fontFamily:'Inter', color:'#0EA5E9', textAlign:'center' }}>Pilot (M7–18)</Text>
        <Text style={{ flex:2, fontSize:7, fontFamily:'Inter', color:'#10B981', textAlign:'center' }}>Scale (M19–36)</Text>
      </View>

      <View style={S.footer}>
        <Text style={S.footerText}>{orgName} · AI Readiness Assessment · Confidential</Text>
        <View style={{ flex:1 }} />
        <Text style={S.footerText}>Page 7</Text>
      </View>
    </Page>
  )
}
