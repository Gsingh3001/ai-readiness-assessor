/**
 * PDFGenerator.js — jsPDF + html2canvas PDF Generation Pipeline
 * AI Readiness Assessment Platform
 * Author:  Gagandeep Singh | AI Practice
 * Version: 1.0.0
 *
 * Renders the PDFReport component into an off-screen div,
 * captures each page with html2canvas, and assembles into a jsPDF A4 document.
 */

const A4_W = 794   // px at 96dpi = ~210mm
const A4_H = 1123  // px at 96dpi = ~297mm
const SCALE = 2    // retina quality

/**
 * Generate PDF from a mounted PDFReport DOM node.
 * @param {HTMLElement} rootEl   - The div containing all report sections
 * @param {string}      filename - Output filename (without extension)
 * @param {Function}    onProgress - Callback (current, total, label)
 */
export async function generatePDF(rootEl, filename, onProgress) {
  // Lazy-load jsPDF and html2canvas
  const [{ default: jsPDF }, { default: html2canvas }] = await Promise.all([
    import('jspdf'),
    import('html2canvas'),
  ])

  const sections = Array.from(rootEl.querySelectorAll('[data-pdf-section]'))
  if (sections.length === 0) {
    // Fallback: treat the whole root as one page
    sections.push(rootEl)
  }

  const pdf = new jsPDF({
    orientation: 'portrait',
    unit:        'pt',
    format:      'a4',
  })

  const pdfW = pdf.internal.pageSize.getWidth()
  const pdfH = pdf.internal.pageSize.getHeight()

  for (let i = 0; i < sections.length; i++) {
    const el = sections[i]
    const label = el.getAttribute('data-section-label') || `Section ${i + 1}`
    onProgress?.(i + 1, sections.length, `Rendering ${label}…`)

    const canvas = await html2canvas(el, {
      scale:            SCALE,
      useCORS:          true,
      allowTaint:       true,
      backgroundColor:  '#08090C',
      logging:          false,
      width:            A4_W,
      height:           Math.max(el.offsetHeight, A4_H),
      windowWidth:      A4_W,
    })

    const imgData = canvas.toDataURL('image/jpeg', 0.92)

    // Scale canvas to fit A4
    const canvasW = canvas.width  / SCALE
    const canvasH = canvas.height / SCALE
    const ratio   = pdfW / canvasW
    const imgH    = canvasH * ratio

    if (i > 0) pdf.addPage()

    // If section is taller than one A4 page, split across pages
    if (imgH <= pdfH + 2) {
      pdf.addImage(imgData, 'JPEG', 0, 0, pdfW, Math.min(imgH, pdfH))
    } else {
      let yOffset = 0
      while (yOffset < imgH) {
        if (yOffset > 0) pdf.addPage()
        pdf.addImage(imgData, 'JPEG', 0, -yOffset, pdfW, imgH)
        yOffset += pdfH
      }
    }
  }

  onProgress?.(sections.length, sections.length, 'Saving PDF…')
  pdf.save(`${filename}.pdf`)
}

/**
 * Full-report generation entry point.
 * Creates a hidden container, renders PDFReport into it, generates PDF, cleans up.
 */
export async function generateFullReport({ assessmentData, onProgress }) {
  const { createRoot } = await import('react-dom/client')
  const { default: React } = await import('react')
  const { default: PDFReport } = await import('./PDFReport.jsx')

  const orgName  = assessmentData.orgName || 'Organisation'
  const dateStr  = new Date().toISOString().slice(0, 10)
  const filename = `${orgName.replace(/[^a-z0-9]/gi, '-')}-AI-Readiness-Report-${dateStr}`

  // Mount in a hidden off-screen container
  const container = document.createElement('div')
  container.style.cssText = `
    position: fixed;
    left: -9999px;
    top: 0;
    width: ${A4_W}px;
    background: #08090C;
    z-index: -1;
    pointer-events: none;
  `
  document.body.appendChild(container)

  return new Promise((resolve, reject) => {
    const root = createRoot(container)

    const ref = { current: null }
    const ReportWithRef = () => {
      const domRef = React.useRef(null)
      React.useEffect(() => {
        if (domRef.current) {
          ref.current = domRef.current
        }
      }, [])
      return React.createElement(PDFReport, { ref: domRef, assessmentData })
    }

    root.render(React.createElement(ReportWithRef))

    // Wait for fonts and render to complete
    setTimeout(async () => {
      try {
        const el = ref.current || container.querySelector('#pdf-report-root') || container

        // Tag sections for page-by-page capture
        const pages = Array.from(el.children).filter(c => c.tagName !== 'STYLE')
        const SECTION_LABELS = [
          'Mission Cover', 'Classified Summary', 'CEO Strategic Brief', 'CIO/CTO Tech Brief',
          'CHRO People Brief', 'Function Heatmap', 'Dimension Radar', 'AI Use Case Register',
          'Regulatory Readiness', 'Critical Gap Analysis', 'Investment Roadmap',
          'ROI Projections', 'AI Risk Register', 'ITSM Bridge', 'Methodology & Appendix',
        ]
        pages.forEach((p, i) => {
          p.setAttribute('data-pdf-section', 'true')
          p.setAttribute('data-section-label', SECTION_LABELS[i] || `Section ${i + 1}`)
        })

        await generatePDF(el, filename, (cur, tot, label) => {
          onProgress?.(`Generating Mission Report… ${cur}/${tot} — ${label}`)
        })

        root.unmount()
        document.body.removeChild(container)
        resolve()
      } catch (err) {
        root.unmount()
        document.body.removeChild(container)
        reject(err)
      }
    }, 1800) // allow fonts + paint
  })
}
