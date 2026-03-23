/**
 * PDFRisks.jsx — AI Risk Register
 */
import React from 'react'
import { Page, View, Text } from '@react-pdf/renderer'
import { C, S } from './PDFStyles.js'

const AI_RISKS = [
  { id:'R01', category:'Data',       title:'Data Quality Failure',       likelihood:4, impact:5, desc:'Poor data quality leads to biased or unreliable model outputs, undermining AI business cases.', control:'Data quality audit; automated profiling; DQ KPIs in governance dashboard.' },
  { id:'R02', category:'Regulatory', title:'EU AI Act Non-Compliance',    likelihood:3, impact:5, desc:'Failure to classify AI systems under EU AI Act risk tiers (Limited/High) before deployment.', control:'AI regulatory inventory; legal review; High-Risk AI system register.' },
  { id:'R03', category:'Security',   title:'Model Adversarial Attack',    likelihood:2, impact:4, desc:'Prompt injection, model poisoning, or adversarial inputs corrupting AI system behaviour.', control:'Red team exercises; input validation; model monitoring and anomaly alerts.' },
  { id:'R04', category:'People',     title:'AI Skills Gap',              likelihood:5, impact:3, desc:'Insufficient AI/data skills in-house leading to vendor dependency and delayed delivery.', control:'AI literacy programme; internal upskilling; strategic hiring plan.' },
  { id:'R05', category:'Ethics',     title:'Algorithmic Bias',            likelihood:3, impact:5, desc:'AI models exhibit discriminatory outcomes across protected characteristics.', control:'Bias audits; fairness metrics; diverse training data governance.' },
  { id:'R06', category:'Governance', title:'Shadow AI Proliferation',     likelihood:4, impact:4, desc:'Unapproved GenAI tools used by staff, creating data leakage and compliance risks.', control:'Approved AI tools list; acceptable use policy; DLP controls.' },
  { id:'R07', category:'Technology', title:'Vendor Lock-In',              likelihood:3, impact:3, desc:'Over-dependence on single AI vendor constrains future flexibility and bargaining.', control:'Multi-vendor strategy; open standards preference; contract exit clauses.' },
  { id:'R08', category:'Change',     title:'AI Adoption Resistance',      likelihood:4, impact:3, desc:'Cultural resistance to AI-driven change undermines ROI and programme momentum.', control:'Change management programme; executive sponsorship; wins communication.' },
]

function riskColor(score) {
  if (score >= 16) return C.red
  if (score >= 10) return C.orange
  if (score >= 5)  return C.amber
  return C.green
}

function riskLabel(score) {
  if (score >= 16) return 'CRITICAL'
  if (score >= 10) return 'HIGH'
  if (score >= 5)  return 'MEDIUM'
  return 'LOW'
}

export default function PDFRisks({ assessmentData }) {
  const { orgName='Organisation' } = assessmentData

  return (
    <Page size="A4" style={S.page}>
      <View style={S.sectionBar}>
        <Text style={S.sectionTitle}>09 · AI Risk Register</Text>
      </View>

      <Text style={{ ...S.body, marginBottom:12 }}>
        Identified AI implementation risks with likelihood and impact ratings (1–5 scale). Risk score = Likelihood × Impact.
      </Text>

      {/* Risk matrix legend */}
      <View style={{ flexDirection:'row', gap:8, marginBottom:12 }}>
        {[
          { label:'CRITICAL ≥16', color:C.red    },
          { label:'HIGH 10–15',   color:C.orange },
          { label:'MEDIUM 5–9',   color:C.amber  },
          { label:'LOW 1–4',      color:C.green  },
        ].map(m => (
          <View key={m.label} style={{ flexDirection:'row', alignItems:'center', gap:4 }}>
            <View style={{ width:8, height:8, borderRadius:2, backgroundColor:m.color }} />
            <Text style={{ fontSize:7, fontFamily:'Inter', color:C.textMut }}>{m.label}</Text>
          </View>
        ))}
      </View>

      {/* Risk table header */}
      <View style={S.tableHeader}>
        <Text style={{ ...S.tableCellBold, width:28, fontSize:7 }}>ID</Text>
        <Text style={{ ...S.tableCellBold, width:52, fontSize:7 }}>Category</Text>
        <Text style={{ ...S.tableCellBold, flex:2, fontSize:7 }}>Risk Title & Description</Text>
        <Text style={{ ...S.tableCellBold, width:22, fontSize:7, textAlign:'center' }}>L</Text>
        <Text style={{ ...S.tableCellBold, width:22, fontSize:7, textAlign:'center' }}>I</Text>
        <Text style={{ ...S.tableCellBold, width:40, fontSize:7, textAlign:'center' }}>Score</Text>
      </View>

      {AI_RISKS.map(risk => {
        const score = risk.likelihood * risk.impact
        const rc    = riskColor(score)
        const rl    = riskLabel(score)
        return (
          <View key={risk.id} style={{ ...S.tableRow, alignItems:'flex-start' }}>
            <Text style={{ ...S.tableCell, width:28, fontFamily:'Inter', fontWeight:700, color:C.accent }}>{risk.id}</Text>
            <Text style={{ ...S.tableCell, width:52, color:C.textMut }}>{risk.category}</Text>
            <View style={{ flex:2 }}>
              <Text style={{ ...S.tableCellBold, marginBottom:2 }}>{risk.title}</Text>
              <Text style={{ fontSize:7, fontFamily:'Inter', color:C.textMut }}>{risk.desc}</Text>
              <Text style={{ fontSize:6.5, fontFamily:'Inter', color:C.accent, marginTop:3 }}>
                Control: {risk.control}
              </Text>
            </View>
            <Text style={{ ...S.tableCell, width:22, textAlign:'center' }}>{risk.likelihood}</Text>
            <Text style={{ ...S.tableCell, width:22, textAlign:'center' }}>{risk.impact}</Text>
            <View style={{ width:40, alignItems:'center' }}>
              <View style={{ backgroundColor:`${rc}20`, borderRadius:3, paddingHorizontal:4, paddingVertical:2, minWidth:30, alignItems:'center' }}>
                <Text style={{ fontSize:7, fontFamily:'Inter', fontWeight:700, color:rc }}>{rl}</Text>
                <Text style={{ fontSize:6, fontFamily:'Inter', color:rc }}>{score}</Text>
              </View>
            </View>
          </View>
        )
      })}

      <View style={S.footer}>
        <Text style={S.footerText}>{orgName} · AI Readiness Assessment · Confidential</Text>
        <View style={{ flex:1 }} />
        <Text style={S.footerText}>Page 9</Text>
      </View>
    </Page>
  )
}
