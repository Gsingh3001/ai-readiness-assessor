/**
 * PDFRegulatory.jsx — Regulatory Readiness
 */
import React from 'react'
import { Page, View, Text } from '@react-pdf/renderer'
import { C, S } from './PDFStyles.js'

const REGULATIONS = [
  {
    name:    'EU AI Act',
    region:  'EU / UK',
    status:  'In Force (2024)',
    color:   '#6366F1',
    summary: 'Categorises AI systems by risk: Unacceptable (banned), High-Risk (mandatory conformity), Limited (transparency), Minimal.',
    items: [
      'Classify all AI systems under risk tiers before deployment',
      'Establish conformity assessment process for High-Risk AI',
      'Implement mandatory human oversight for High-Risk systems',
      'Create and maintain AI system technical documentation',
      'Register High-Risk AI in EU AI database',
    ],
  },
  {
    name:    'UK GDPR / Data Protection Act 2018',
    region:  'United Kingdom',
    status:  'In Force',
    color:   '#0EA5E9',
    summary: 'Governs use of personal data in AI training and inference, including automated decision-making rights.',
    items: [
      'Document lawful basis for processing personal data in AI models',
      'Conduct Data Protection Impact Assessments (DPIA) for AI systems',
      'Ensure explainability for automated decisions affecting individuals',
      'Right to opt-out of automated decision-making (Art.22)',
      'Cross-border data transfer compliance for AI training data',
    ],
  },
  {
    name:    'FCA Consumer Duty',
    region:  'UK Financial Services',
    status:  'In Force (Jul 2023)',
    color:   '#F59E0B',
    summary: 'Requires firms to demonstrate AI systems deliver good customer outcomes and do not cause foreseeable harm.',
    items: [
      'Assess AI systems for consumer harm risk',
      'Ensure AI-driven decisions deliver fair outcomes',
      'Maintain audit trail of AI recommendations affecting customers',
      'Validate AI models for protected characteristics bias',
    ],
  },
  {
    name:    'ISO/IEC 42001',
    region:  'Global',
    status:  'Published 2023',
    color:   '#10B981',
    summary: 'International standard for AI Management Systems (AIMS) — governance, risk, and lifecycle management.',
    items: [
      'Establish AI management system aligned to ISO 42001',
      'Define AI policy and assign accountability',
      'Implement AI risk assessment process',
      'Pursue certification for trust signalling to clients',
    ],
  },
  {
    name:    'NIST AI RMF',
    region:  'US / Global',
    status:  'Framework v1.0 (2023)',
    color:   '#F97316',
    summary: 'GOVERN, MAP, MEASURE, MANAGE framework for AI risk management aligned to US federal guidance.',
    items: [
      'Adopt GOVERN pillar: AI governance structure and roles',
      'MAP AI use cases to risk categories and stakeholder impacts',
      'MEASURE AI trustworthiness dimensions (safety, explainability, fairness)',
      'MANAGE identified risks through treatment plans',
    ],
  },
]

export default function PDFRegulatory({ assessmentData }) {
  const { orgName='Organisation', region='UK' } = assessmentData

  return (
    <Page size="A4" style={S.page}>
      <View style={S.sectionBar}>
        <Text style={S.sectionTitle}>10 · Regulatory Readiness</Text>
      </View>

      <Text style={{ ...S.body, marginBottom:12 }}>
        Key AI regulatory frameworks applicable to {orgName}. Compliance obligations should be reviewed with legal counsel specific to jurisdiction and sector.
      </Text>

      {REGULATIONS.map(reg => (
        <View key={reg.name} style={{ ...S.card, borderLeft:`3px solid ${reg.color}`, marginBottom:9 }}>
          <View style={{ flexDirection:'row', alignItems:'flex-start', marginBottom:5 }}>
            <View style={{ flex:1 }}>
              <View style={{ flexDirection:'row', gap:6, alignItems:'center', marginBottom:2 }}>
                <Text style={{ fontSize:9, fontFamily:'Inter', fontWeight:700, color:reg.color }}>{reg.name}</Text>
                <View style={{ backgroundColor:`${C.textMut}20`, borderRadius:3, paddingHorizontal:4, paddingVertical:1 }}>
                  <Text style={{ fontSize:6.5, fontFamily:'Inter', color:C.textMut }}>{reg.region}</Text>
                </View>
                <View style={{ backgroundColor:`${reg.color}20`, borderRadius:3, paddingHorizontal:4, paddingVertical:1 }}>
                  <Text style={{ fontSize:6.5, fontFamily:'Inter', color:reg.color }}>{reg.status}</Text>
                </View>
              </View>
              <Text style={{ fontSize:8, fontFamily:'Inter', color:C.textSec }}>{reg.summary}</Text>
            </View>
          </View>
          {reg.items.map((item, i) => (
            <View key={i} style={{ flexDirection:'row', alignItems:'flex-start', marginBottom:3 }}>
              <View style={{ width:4, height:4, borderRadius:2, backgroundColor:reg.color, marginTop:3, marginRight:6 }} />
              <Text style={{ fontSize:7.5, fontFamily:'Inter', color:C.textMut, flex:1 }}>{item}</Text>
            </View>
          ))}
        </View>
      ))}

      <View style={S.footer}>
        <Text style={S.footerText}>{orgName} · AI Readiness Assessment · Confidential</Text>
        <View style={{ flex:1 }} />
        <Text style={S.footerText}>Page 10</Text>
      </View>
    </Page>
  )
}
