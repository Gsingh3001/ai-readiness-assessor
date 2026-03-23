/**
 * PDFScores.jsx — Function Heatmap + Dimension Analysis (2 pages)
 */
import React from 'react'
import { Page, View, Text } from '@react-pdf/renderer'
import { C, S, scoreColor, maturityLabel } from './PDFStyles.js'

const DIM_META = {
  DQ: { label:'Data Quality',     color:'#6366F1', weight:0.30 },
  TR: { label:'Tech Readiness',   color:'#0EA5E9', weight:0.18 },
  TS: { label:'Talent & Skills',  color:'#F59E0B', weight:0.22 },
  GE: { label:'Governance',       color:'#EF4444', weight:0.15 },
  CR: { label:'Change Readiness', color:'#F97316', weight:0.08 },
  VR: { label:'Value & ROI',      color:'#10B981', weight:0.07 },
}

function FnRow({ id, score, index }) {
  const sc = scoreColor(score)
  const pct = Math.max(0, Math.min(100, ((score-1)/4)*100))
  return (
    <View style={{ flexDirection:'row', alignItems:'center', paddingVertical:4, borderBottom:`1px solid ${C.border}` }}>
      <Text style={{ width:22, fontSize:7, color:C.textMut, fontFamily:'Inter' }}>{index+1}.</Text>
      <Text style={{ flex:1, fontSize:8, color:C.textPri, fontFamily:'Inter', textTransform:'capitalize' }}>
        {id.replace(/_/g,' ')}
      </Text>
      <View style={{ width:80, height:5, backgroundColor:C.border, borderRadius:3, marginRight:8 }}>
        <View style={{ width:`${pct}%`, height:5, backgroundColor:sc, borderRadius:3 }} />
      </View>
      <View style={{ backgroundColor:`${sc}20`, borderRadius:3, paddingHorizontal:6, paddingVertical:2, minWidth:32, alignItems:'center' }}>
        <Text style={{ fontSize:7.5, fontFamily:'Inter', fontWeight:700, color:sc }}>{score.toFixed(2)}</Text>
      </View>
    </View>
  )
}

export default function PDFScores({ assessmentData }) {
  const { orgName='Organisation', dimScores={}, functionScores={} } = assessmentData

  const sorted = Object.entries(functionScores).sort((a,b)=>b[1]-a[1])
  const half   = Math.ceil(sorted.length / 2)
  const col1   = sorted.slice(0, half)
  const col2   = sorted.slice(half)

  return (
    <>
      {/* Page 3 — Function Heatmap */}
      <Page size="A4" style={S.page}>
        <View style={S.sectionBar}>
          <Text style={S.sectionTitle}>03 · Function Heatmap</Text>
        </View>

        <Text style={{ ...S.body, marginBottom:12 }}>
          AI readiness scores across {sorted.length} organisational functions, ordered by maturity. Scores range from 1.0 (AI Unaware) to 5.0 (AI-Native).
        </Text>

        <View style={{ flexDirection:'row', gap:16 }}>
          <View style={{ flex:1 }}>
            {col1.map(([id, score], i) => (
              <FnRow key={id} id={id} score={score} index={i} />
            ))}
          </View>
          <View style={{ flex:1 }}>
            {col2.map(([id, score], i) => (
              <FnRow key={id} id={id} score={score} index={half+i} />
            ))}
          </View>
        </View>

        {/* Legend */}
        <View style={{ flexDirection:'row', gap:8, marginTop:16 }}>
          {[
            { label:'AI-Native',    color:C.green,  range:'4.2–5.0' },
            { label:'AI Scaling',   color:C.blue,   range:'3.4–4.2' },
            { label:'AI Piloting',  color:C.amber,  range:'2.6–3.4' },
            { label:'AI Exploring', color:C.orange, range:'1.8–2.6' },
            { label:'AI Unaware',   color:C.red,    range:'1.0–1.8' },
          ].map(m => (
            <View key={m.label} style={{ flexDirection:'row', alignItems:'center', gap:4 }}>
              <View style={{ width:8, height:8, borderRadius:2, backgroundColor:m.color }} />
              <Text style={{ fontSize:7, fontFamily:'Inter', color:C.textMut }}>{m.label} ({m.range})</Text>
            </View>
          ))}
        </View>

        <View style={S.footer}>
          <Text style={S.footerText}>{orgName} · AI Readiness Assessment · Confidential</Text>
          <View style={{ flex:1 }} />
          <Text style={S.footerText}>Page 3</Text>
        </View>
      </Page>

      {/* Page 4 — Dimension Analysis */}
      <Page size="A4" style={S.page}>
        <View style={S.sectionBar}>
          <Text style={S.sectionTitle}>04 · Dimension Analysis</Text>
        </View>

        <Text style={{ ...S.body, marginBottom:16 }}>
          Weighted AI Readiness Dimensions. Each dimension contributes to the overall score per its weight.
        </Text>

        {Object.entries(DIM_META).map(([key, meta]) => {
          const score = dimScores[key] || 1.0
          const sc    = scoreColor(score)
          const pct   = Math.max(0, Math.min(100, ((score-1)/4)*100))
          const ml    = maturityLabel(score)
          return (
            <View key={key} style={{ ...S.card, marginBottom:10 }}>
              <View style={{ flexDirection:'row', alignItems:'flex-start', marginBottom:8 }}>
                <View style={{ flex:1 }}>
                  <View style={{ flexDirection:'row', alignItems:'center', gap:8, marginBottom:3 }}>
                    <Text style={{ fontSize:9, fontFamily:'Inter', fontWeight:700, color:meta.color, letterSpacing:1 }}>{key}</Text>
                    <Text style={{ fontSize:9, fontFamily:'Inter', fontWeight:600, color:C.textPri }}>{meta.label}</Text>
                    <View style={{ backgroundColor:`${C.textMut}20`, borderRadius:3, paddingHorizontal:5, paddingVertical:1 }}>
                      <Text style={{ fontSize:7, fontFamily:'Inter', color:C.textMut }}>Weight: {(meta.weight*100).toFixed(0)}%</Text>
                    </View>
                  </View>
                </View>
                <View style={{ backgroundColor:`${sc}20`, borderRadius:4, paddingHorizontal:8, paddingVertical:3 }}>
                  <Text style={{ fontSize:10, fontFamily:'Inter', fontWeight:700, color:sc }}>{score.toFixed(2)}</Text>
                </View>
              </View>
              <View style={{ height:6, backgroundColor:C.border, borderRadius:3, marginBottom:6 }}>
                <View style={{ width:`${pct}%`, height:6, backgroundColor:meta.color, borderRadius:3 }} />
              </View>
              <Text style={{ fontSize:8, fontFamily:'Inter', color:C.textMut }}>
                Maturity: <Text style={{ color:sc, fontWeight:700 }}>{ml}</Text>
              </Text>
            </View>
          )
        })}

        <View style={S.footer}>
          <Text style={S.footerText}>{orgName} · AI Readiness Assessment · Confidential</Text>
          <View style={{ flex:1 }} />
          <Text style={S.footerText}>Page 4</Text>
        </View>
      </Page>
    </>
  )
}
