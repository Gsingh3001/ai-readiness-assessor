/**
 * PDFCover.jsx — Mission Cover Page
 */
import React from 'react'
import { Page, View, Text } from '@react-pdf/renderer'
import { C, S, scoreColor, maturityLabel } from './PDFStyles.js'

export default function PDFCover({ assessmentData }) {
  const { orgName = 'Organisation', overallScore = 1.0, assessedBy = '', completedAt } = assessmentData
  const dateStr = completedAt ? new Date(completedAt).toLocaleDateString('en-GB', { year:'numeric', month:'long', day:'numeric' }) : new Date().toLocaleDateString('en-GB', { year:'numeric', month:'long', day:'numeric' })
  const sc = scoreColor(overallScore)
  const ml = maturityLabel(overallScore)

  return (
    <Page size="A4" style={S.coverPage}>
      {/* Top accent bar */}
      <View style={{ backgroundColor: C.accent, height: 4, width: '100%' }} />

      {/* Hero area */}
      <View style={{ flex: 1, backgroundColor: C.bg, padding: 50, justifyContent: 'center' }}>
        {/* Classification tag */}
        <View style={{ flexDirection:'row', marginBottom: 30 }}>
          <View style={{ backgroundColor:`${C.accent}20`, borderRadius:3, paddingHorizontal:10, paddingVertical:4, borderLeft:`3px solid ${C.accent}` }}>
            <Text style={{ fontSize:7, fontFamily:'Inter', fontWeight:700, color:C.accent, letterSpacing:2, textTransform:'uppercase' }}>
              CONFIDENTIAL — AI PRACTICE
            </Text>
          </View>
        </View>

        {/* Main title */}
        <Text style={{ fontSize:36, fontFamily:'Inter', fontWeight:700, color:C.textPri, marginBottom:8, lineHeight:1.2 }}>
          AI Readiness
        </Text>
        <Text style={{ fontSize:36, fontFamily:'Inter', fontWeight:700, color:C.accent, marginBottom:24, lineHeight:1.2 }}>
          Assessment Report
        </Text>

        {/* Org name */}
        <Text style={{ fontSize:18, fontFamily:'Inter', fontWeight:600, color:C.textSec, marginBottom:40 }}>
          {orgName}
        </Text>

        {/* Score card */}
        <View style={{ backgroundColor:C.surface, borderRadius:10, padding:24, marginBottom:40, borderLeft:`4px solid ${sc}`, border:`1px solid ${C.border}` }}>
          <View style={{ flexDirection:'row', alignItems:'center', marginBottom:8 }}>
            <View style={{ flex:1 }}>
              <Text style={{ fontSize:9, fontFamily:'Inter', color:C.textMut, textTransform:'uppercase', letterSpacing:1.5, marginBottom:4 }}>
                Overall AI Readiness Score
              </Text>
              <Text style={{ fontSize:40, fontFamily:'Inter', fontWeight:700, color:sc }}>
                {overallScore.toFixed(2)}
                <Text style={{ fontSize:16, color:C.textMut }}> / 5.00</Text>
              </Text>
            </View>
            <View style={{ backgroundColor:`${sc}20`, borderRadius:8, padding:12, alignItems:'center' }}>
              <Text style={{ fontSize:12, fontFamily:'Inter', fontWeight:700, color:sc, textTransform:'uppercase', letterSpacing:1 }}>
                {ml}
              </Text>
            </View>
          </View>
        </View>

        {/* Meta grid */}
        <View style={{ flexDirection:'row', gap:20, marginBottom:40 }}>
          {[
            ['Organisation', orgName],
            ['Assessment Date', dateStr],
            ['Assessed By', assessedBy || 'Self-Assessment'],
            ['Framework', 'AI Readiness v2.0'],
          ].map(([label, value]) => (
            <View key={label} style={{ flex:1 }}>
              <Text style={{ fontSize:7, fontFamily:'Inter', color:C.textMut, textTransform:'uppercase', letterSpacing:1, marginBottom:3 }}>{label}</Text>
              <Text style={{ fontSize:9, fontFamily:'Inter', fontWeight:600, color:C.textPri }}>{value}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Footer bar */}
      <View style={{ backgroundColor:C.surface, padding:16, flexDirection:'row', alignItems:'center', borderTop:`1px solid ${C.border}` }}>
        <Text style={{ fontSize:8, fontFamily:'Inter', color:C.textMut, flex:1 }}>
          AI Readiness Assessor · AI Practice · Confidential
        </Text>
        <Text style={{ fontSize:8, fontFamily:'Inter', color:C.textMut }}>
          Page 1
        </Text>
      </View>
    </Page>
  )
}
