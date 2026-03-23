/**
 * PDFUseCases.jsx — AI Use Case Register (2 pages)
 */
import React from 'react'
import { Page, View, Text } from '@react-pdf/renderer'
import { C, S, scoreColor } from './PDFStyles.js'

const USE_CASE_LIBRARY = [
  { fn:'finance',          title:'Anomaly Detection',          desc:'ML-based financial anomaly detection for fraud and error identification.',          complexity:'Medium', value:'High',   dims:['DQ','TR'] },
  { fn:'finance',          title:'Invoice Automation',         desc:'AI-powered invoice processing and three-way matching at scale.',                   complexity:'Low',    value:'High',   dims:['TS','TR'] },
  { fn:'hr',               title:'Talent Intelligence',        desc:'Predictive analytics for attrition risk, high-performer identification.',          complexity:'High',   value:'High',   dims:['DQ','GE'] },
  { fn:'hr',               title:'Resume Screening AI',        desc:'LLM-driven candidate ranking with bias mitigation controls.',                      complexity:'Medium', value:'Medium', dims:['TS','GE'] },
  { fn:'sales',            title:'Revenue Forecasting',        desc:'ML ensemble models for pipeline and revenue prediction.',                           complexity:'Medium', value:'High',   dims:['DQ','TR'] },
  { fn:'sales',            title:'Lead Scoring',               desc:'Real-time lead prioritisation using CRM and behavioural signals.',                  complexity:'Low',    value:'High',   dims:['DQ','VR'] },
  { fn:'marketing',        title:'Hyper-Personalisation',      desc:'AI-driven content and offer personalisation across channels.',                     complexity:'High',   value:'High',   dims:['DQ','TR'] },
  { fn:'customerservice',  title:'AI Customer Agent',          desc:'Generative AI first-line support agent with escalation logic.',                    complexity:'Medium', value:'High',   dims:['TR','TS'] },
  { fn:'it',               title:'AIOps & Monitoring',         desc:'Anomaly-based alerting and auto-remediation for IT infrastructure.',               complexity:'High',   value:'High',   dims:['TR','CR'] },
  { fn:'softwaredev',      title:'AI Code Assistant',          desc:'GitHub Copilot-style code generation and review acceleration.',                    complexity:'Low',    value:'High',   dims:['TS','TR'] },
  { fn:'data',             title:'Data Quality Automation',    desc:'ML-driven data profiling, validation, and lineage tracking.',                      complexity:'Medium', value:'High',   dims:['DQ','GE'] },
  { fn:'data_readiness',   title:'Data Readiness Platform',    desc:'Automated data readiness scoring to identify AI-ready datasets.',                  complexity:'Medium', value:'High',   dims:['DQ','TR'] },
  { fn:'ai_literacy',      title:'AI Upskilling Programme',    desc:'Personalised AI learning paths using adaptive learning platforms.',                complexity:'Low',    value:'High',   dims:['TS','CR'] },
  { fn:'supplychain',      title:'Demand Forecasting',         desc:'Multi-variate ML forecasting for inventory and demand planning.',                  complexity:'High',   value:'High',   dims:['DQ','TR'] },
  { fn:'manufacturing',    title:'Predictive Maintenance',     desc:'IoT + ML models for equipment failure prediction.',                                complexity:'High',   value:'High',   dims:['TR','DQ'] },
  { fn:'cybersecurity',    title:'Threat Detection AI',        desc:'Behavioural AI for real-time threat and insider risk detection.',                  complexity:'High',   value:'High',   dims:['TR','GE'] },
  { fn:'legal',            title:'Contract Intelligence',      desc:'NLP for contract review, risk flagging, and clause extraction.',                   complexity:'Medium', value:'High',   dims:['DQ','GE'] },
  { fn:'risk',             title:'Risk Signal AI',             desc:'AI-aggregated risk signals for real-time risk dashboards.',                        complexity:'High',   value:'High',   dims:['DQ','GE'] },
  { fn:'procurement',      title:'Supplier Risk AI',           desc:'ML-based supplier risk scoring using external and internal data.',                 complexity:'Medium', value:'Medium', dims:['DQ','VR'] },
  { fn:'qualityassurance', title:'Visual QA Inspection',       desc:'Computer vision for defect detection in production and QA.',                      complexity:'High',   value:'High',   dims:['TR','DQ'] },
]

const COMPLEXITY_COLOR = { Low:'#10B981', Medium:'#F59E0B', High:'#EF4444' }
const VALUE_COLOR      = { Low:'#94A3B8', Medium:'#0EA5E9', High:'#6366F1' }

function UCRow({ uc, index }) {
  return (
    <View style={{ ...S.tableRow, alignItems:'flex-start' }}>
      <Text style={{ ...S.tableCell, width:16 }}>{index+1}</Text>
      <View style={{ flex:2 }}>
        <Text style={{ ...S.tableCellBold }}>{uc.title}</Text>
        <Text style={{ ...S.tableCell, fontSize:7.5, marginTop:2 }}>{uc.desc}</Text>
      </View>
      <Text style={{ ...S.tableCell, width:60, textTransform:'capitalize' }}>{uc.fn.replace(/_/g,' ')}</Text>
      <View style={{ width:52, alignItems:'center' }}>
        <View style={{ backgroundColor:`${COMPLEXITY_COLOR[uc.complexity]}20`, borderRadius:3, paddingHorizontal:5, paddingVertical:2 }}>
          <Text style={{ fontSize:7, fontFamily:'Inter', fontWeight:700, color:COMPLEXITY_COLOR[uc.complexity] }}>{uc.complexity}</Text>
        </View>
      </View>
      <View style={{ width:44, alignItems:'center' }}>
        <View style={{ backgroundColor:`${VALUE_COLOR[uc.value]}20`, borderRadius:3, paddingHorizontal:5, paddingVertical:2 }}>
          <Text style={{ fontSize:7, fontFamily:'Inter', fontWeight:700, color:VALUE_COLOR[uc.value] }}>{uc.value}</Text>
        </View>
      </View>
    </View>
  )
}

export default function PDFUseCases({ assessmentData }) {
  const { orgName='Organisation', functionScores={} } = assessmentData
  // Prioritise use cases for functions that scored well (≥ 2.0)
  const relevantFns = new Set(
    Object.entries(functionScores).filter(([,s])=>s>=2.0).map(([id])=>id)
  )
  const prioritised = USE_CASE_LIBRARY.filter(uc => relevantFns.has(uc.fn) || relevantFns.size === 0)
  const half = Math.ceil(prioritised.length / 2)
  const page1UCs = prioritised.slice(0, 10)
  const page2UCs = prioritised.slice(10)

  const pageContent = (ucs, pageNum, startIdx) => (
    <Page size="A4" style={S.page}>
      <View style={S.sectionBar}>
        <Text style={S.sectionTitle}>05 · AI Use Case Register {pageNum === 1 ? '(1/2)' : '(2/2)'}</Text>
      </View>

      {pageNum === 1 && (
        <Text style={{ ...S.body, marginBottom:10 }}>
          Prioritised AI use cases matched to {orgName}'s assessed functions. Value and complexity ratings guide investment sequencing.
        </Text>
      )}

      {/* Table header */}
      <View style={S.tableHeader}>
        <Text style={{ ...S.tableCellBold, width:16, fontSize:7 }}>#</Text>
        <Text style={{ ...S.tableCellBold, flex:2, fontSize:7 }}>Use Case</Text>
        <Text style={{ ...S.tableCellBold, width:60, fontSize:7 }}>Function</Text>
        <Text style={{ ...S.tableCellBold, width:52, fontSize:7 }}>Complexity</Text>
        <Text style={{ ...S.tableCellBold, width:44, fontSize:7 }}>Value</Text>
      </View>

      {ucs.map((uc, i) => (
        <UCRow key={uc.title} uc={uc} index={startIdx + i} />
      ))}

      <View style={S.footer}>
        <Text style={S.footerText}>{orgName} · AI Readiness Assessment · Confidential</Text>
        <View style={{ flex:1 }} />
        <Text style={S.footerText}>Page {4 + pageNum}</Text>
      </View>
    </Page>
  )

  return (
    <>
      {pageContent(page1UCs, 1, 0)}
      {page2UCs.length > 0 && pageContent(page2UCs, 2, 10)}
    </>
  )
}
