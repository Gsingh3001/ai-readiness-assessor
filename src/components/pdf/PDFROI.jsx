/**
 * PDFROI.jsx — ROI Projections
 */
import React from 'react'
import { Page, View, Text } from '@react-pdf/renderer'
import { C, S, scoreColor } from './PDFStyles.js'

const ORG_SIZE_MULTIPLIERS = {
  small:  { employees:250,    revenue:'£10M–50M',    aibudget:'£80K–200K',   yr1:'£120K–350K',   yr2:'£400K–900K',   yr3:'£800K–2M',   payback:'18–24 months' },
  medium: { employees:2500,   revenue:'£50M–500M',   aibudget:'£300K–1.5M',  yr1:'£500K–1.5M',   yr2:'£1.5M–5M',     yr3:'£4M–12M',    payback:'12–18 months' },
  large:  { employees:10000,  revenue:'£500M+',      aibudget:'£1.5M–8M',    yr1:'£2M–8M',       yr2:'£8M–25M',      yr3:'£20M–60M',   payback:'9–15 months'  },
}

const ROI_DRIVERS = [
  { driver:'Process Automation',     pct:'25–35%', desc:'Reduction in manual task effort across finance, HR, operations',   color:'#6366F1' },
  { driver:'Decision Intelligence',  pct:'15–25%', desc:'Improvement in forecast accuracy and risk-adjusted decisions',    color:'#0EA5E9' },
  { driver:'Customer Experience',    pct:'10–20%', desc:'Increase in CSAT / NPS through AI-powered personalisation',       color:'#10B981' },
  { driver:'Revenue Uplift',         pct:'5–15%',  desc:'Incremental revenue from AI-driven sales and marketing insights', color:'#F59E0B' },
  { driver:'Risk Reduction',         pct:'20–40%', desc:'Reduction in compliance costs and audit risk exposure',           color:'#EF4444' },
  { driver:'Talent Efficiency',      pct:'10–20%', desc:'FTE hours reclaimed through automation and AI augmentation',     color:'#F97316' },
]

function BarRow({ label, value, pct, color }) {
  return (
    <View style={{ marginBottom:8 }}>
      <View style={{ flexDirection:'row', justifyContent:'space-between', marginBottom:3 }}>
        <Text style={{ fontSize:8.5, fontFamily:'Inter', fontWeight:600, color:C.textPri }}>{label}</Text>
        <Text style={{ fontSize:8.5, fontFamily:'Inter', fontWeight:700, color }}>{value}</Text>
      </View>
      <View style={{ height:6, backgroundColor:C.border, borderRadius:3 }}>
        <View style={{ width:`${pct}%`, height:6, backgroundColor:color, borderRadius:3 }} />
      </View>
    </View>
  )
}

export default function PDFROI({ assessmentData }) {
  const { orgName='Organisation', orgSize='medium', overallScore=1.0 } = assessmentData
  const sizeKey = orgSize?.toLowerCase().includes('large') ? 'large'
    : orgSize?.toLowerCase().includes('small') ? 'small'
    : 'medium'
  const meta = ORG_SIZE_MULTIPLIERS[sizeKey]
  const sc   = scoreColor(overallScore)
  // Readiness factor: higher score = higher confidence
  const confidencePct = Math.round(((overallScore - 1) / 4) * 100)

  return (
    <Page size="A4" style={S.page}>
      <View style={S.sectionBar}>
        <Text style={S.sectionTitle}>08 · ROI Projections</Text>
      </View>

      {/* Org size card */}
      <View style={{ flexDirection:'row', gap:10, marginBottom:14 }}>
        <View style={{ ...S.card, flex:1, borderLeft:`3px solid ${sc}` }}>
          <Text style={{ fontSize:7, color:C.textMut, textTransform:'uppercase', letterSpacing:1.2, marginBottom:4 }}>Organisation Profile</Text>
          <Text style={{ fontSize:9, fontFamily:'Inter', fontWeight:600, color:C.textPri, marginBottom:2 }}>
            {orgName}
          </Text>
          <Text style={{ fontSize:8, color:C.textSec }}>Employees: ~{meta.employees.toLocaleString()}</Text>
          <Text style={{ fontSize:8, color:C.textSec }}>Revenue Band: {meta.revenue}</Text>
          <Text style={{ fontSize:8, color:C.textSec }}>Suggested AI Budget: {meta.aibudget} p.a.</Text>
        </View>
        <View style={{ ...S.card, flex:1 }}>
          <Text style={{ fontSize:7, color:C.textMut, textTransform:'uppercase', letterSpacing:1.2, marginBottom:8 }}>ROI Confidence Level</Text>
          <View style={{ height:8, backgroundColor:C.border, borderRadius:4, marginBottom:6 }}>
            <View style={{ width:`${confidencePct}%`, height:8, backgroundColor:sc, borderRadius:4 }} />
          </View>
          <Text style={{ fontSize:9, fontFamily:'Inter', fontWeight:700, color:sc }}>{confidencePct}% — Based on AI Readiness Score {overallScore.toFixed(2)}/5.00</Text>
          <Text style={{ fontSize:7.5, color:C.textMut, marginTop:3 }}>Higher readiness → lower risk of failed AI investments</Text>
        </View>
      </View>

      {/* 3-year projection */}
      <View style={{ ...S.card, marginBottom:14 }}>
        <Text style={{ ...S.h4, marginBottom:10 }}>3-Year Cumulative Benefit Projection</Text>
        <BarRow label="Year 1 Benefit"          value={meta.yr1} pct={25}  color={C.accent} />
        <BarRow label="Year 2 Benefit"          value={meta.yr2} pct={55}  color={C.blue}   />
        <BarRow label="Year 3 Benefit"          value={meta.yr3} pct={90}  color={C.green}  />
        <BarRow label="Expected Payback Period" value={meta.payback} pct={60} color={C.amber} />
        <Text style={{ fontSize:7, color:C.textMut, marginTop:8 }}>
          * Projections are indicative based on industry benchmarks for {sizeKey}-sized organisations at {overallScore.toFixed(2)}/5.00 AI maturity.
          Actual returns depend on execution quality, technology investments, and change management.
        </Text>
      </View>

      {/* ROI drivers */}
      <View style={S.card}>
        <Text style={{ ...S.h4, marginBottom:8 }}>Key ROI Drivers</Text>
        {ROI_DRIVERS.map(driver => (
          <View key={driver.driver} style={{ flexDirection:'row', alignItems:'flex-start', marginBottom:6 }}>
            <View style={{ width:4, height:4, borderRadius:2, backgroundColor:driver.color, marginTop:4, marginRight:8 }} />
            <View style={{ flex:1 }}>
              <View style={{ flexDirection:'row', gap:6, marginBottom:2 }}>
                <Text style={{ fontSize:8.5, fontFamily:'Inter', fontWeight:600, color:C.textPri }}>{driver.driver}</Text>
                <View style={{ backgroundColor:`${driver.color}20`, borderRadius:3, paddingHorizontal:5, paddingVertical:1 }}>
                  <Text style={{ fontSize:7, fontFamily:'Inter', fontWeight:700, color:driver.color }}>{driver.pct} improvement</Text>
                </View>
              </View>
              <Text style={{ fontSize:7.5, fontFamily:'Inter', color:C.textMut }}>{driver.desc}</Text>
            </View>
          </View>
        ))}
      </View>

      <View style={S.footer}>
        <Text style={S.footerText}>{orgName} · AI Readiness Assessment · Confidential</Text>
        <View style={{ flex:1 }} />
        <Text style={S.footerText}>Page 8</Text>
      </View>
    </Page>
  )
}
