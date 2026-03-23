/**
 * PDFDocument.jsx — Root @react-pdf/renderer document
 * Assembles all section components, registers fonts.
 */
import React from 'react'
import { Document, Font } from '@react-pdf/renderer'
import PDFCover        from './PDFCover.jsx'
import PDFExecutive    from './PDFExecutive.jsx'
import PDFScores       from './PDFScores.jsx'
import PDFUseCases     from './PDFUseCases.jsx'
import PDFRoadmap      from './PDFRoadmap.jsx'
import PDFROI          from './PDFROI.jsx'
import PDFRisks        from './PDFRisks.jsx'
import PDFRegulatory   from './PDFRegulatory.jsx'
import PDFMethodology  from './PDFMethodology.jsx'

// Register fonts from Google Fonts static URLs
Font.register({
  family: 'Inter',
  fonts: [
    { src: 'https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiJ-Ek-_EeA.woff', fontWeight: 400 },
    { src: 'https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuGKYAZ9hiJ-Ek-_EeA.woff', fontWeight: 600 },
    { src: 'https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuFuYAZ9hiJ-Ek-_EeA.woff', fontWeight: 700 },
  ],
})

Font.register({
  family: 'Courier',
  src: 'https://fonts.gstatic.com/s/courierprime/v8/u-450q2lgwslOqpF_6gQ8kELaw9pWt_-.woff2',
})

export default function PDFDocument({ assessmentData }) {
  return (
    <Document
      title={`AI Readiness Report — ${assessmentData.orgName || 'Organisation'}`}
      author="AI Practice"
      subject="AI Readiness Assessment"
      creator="AI Readiness Assessor v2"
    >
      <PDFCover       assessmentData={assessmentData} />
      <PDFExecutive   assessmentData={assessmentData} />
      <PDFScores      assessmentData={assessmentData} />
      <PDFUseCases    assessmentData={assessmentData} />
      <PDFRoadmap     assessmentData={assessmentData} />
      <PDFROI         assessmentData={assessmentData} />
      <PDFRisks       assessmentData={assessmentData} />
      <PDFRegulatory  assessmentData={assessmentData} />
      <PDFMethodology assessmentData={assessmentData} />
    </Document>
  )
}
