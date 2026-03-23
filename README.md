# AI Readiness Assessor — v1.0

**Enterprise AI Readiness Assessment Platform**

A function-by-function AI maturity assessment for business leaders — scored across 6 dimensions, benchmarked by industry, and delivered as a boardroom-ready report.

> **Forked from:** [itil4-assessor](https://github.com/Gsingh3001/itil4-assessor) — reusing the proven React/Vite framework, Excel question bank loader, scoring engine, and report architecture.

---

## Quick Start

```bash
npm install
npm run dev
```

Open http://localhost:5173

---

## What's New vs ITSM Assessor

| Component | ITSM Assessor | AI Readiness Assessor |
|---|---|---|
| **Practices** | 34 ITIL 4 practices | 25 organisational functions |
| **Dimensions** | PE / PC / MM / CI / TI | DQ / TR / TS / GE / CR / VR |
| **Levels** | Beginner / Practitioner / Expert | Exploring / Piloting / Scaling |
| **Maturity labels** | 1–5 ITIL scale | AI Unaware → AI-Native |
| **Question bank** | `question-bank.xlsx` | `ai-question-bank.xlsx` |
| **Report** | ITIL practice gaps | AI use cases, ROI, regulatory readiness |

---

## The 25 Organisational Functions

### Business Domain
Finance & Accounting · Human Resources · Sales & Revenue · Marketing & CX · Legal & Compliance · Procurement & Sourcing · Strategy & Planning · Risk Management · Customer Service · Corporate Governance

### Technology Domain
IT & Infrastructure · Software Development · Data & Analytics · Cybersecurity · IT Service Management · Cloud & Platform · Network & Communications · Digital Workplace

### Operations Domain
Supply Chain & Logistics · Manufacturing & Production · Quality Assurance · Facilities & Property · Health & Safety · Environmental & Sustainability · Field Service

---

## The 6 AI Readiness Dimensions

| Code | Dimension | Weight | What it measures |
|---|---|---|---|
| **DQ** | Data Quality | 25% | Data availability, accuracy, lineage & governance |
| **TR** | Technology Readiness | 20% | Infrastructure, APIs, AI tooling & integration |
| **TS** | Talent & Skills | 20% | AI literacy, data skills & upskilling maturity |
| **GE** | Governance & Ethics | 15% | AI policy, ethics, bias monitoring & regulatory compliance |
| **CR** | Change Readiness | 10% | Culture, leadership sponsorship & change management |
| **VR** | Value & ROI | 10% | Use case clarity, business cases & benefit tracking |

---

## Scoring Formula

Identical to the ITSM assessor:

```
dimScore = 1 + (earnedPoints / maxPoints) × 4   →  [1.0 – 5.0]
overall  = DQ×0.25 + TR×0.20 + TS×0.20 + GE×0.15 + CR×0.10 + VR×0.10
```

### Maturity Levels

| Score | Label | Description |
|---|---|---|
| 1.0 – 1.8 | AI Unaware | No meaningful AI capability. Foundational investment required. |
| 1.8 – 2.6 | AI Exploring | Early awareness and isolated experiments. No coordinated strategy. |
| 2.6 – 3.4 | AI Piloting | Targeted pilots underway. Foundations being built. |
| 3.4 – 4.2 | AI Scaling | Multiple AI deployments delivering value. |
| 4.2 – 5.0 | AI-Native | AI embedded across functions. Competitive differentiation through AI. |

---

## Question Bank

The question bank lives at `public/ai-question-bank.xlsx`.

**160 questions across 25 functions, 3 competency levels, 6 dimensions.**

Replace this file to customise questions without touching any code. The app loads it at runtime.

### Question format

Each question is:
- Written for the **function leader** (CFO, CHRO, CIO) — not a technical expert
- Answerable **Yes / Partial / No** in under 30 seconds
- Mapped to **1–2 dimensions** (DQ, TR, TS, GE, CR, VR)
- Equipped with a **follow-up question** triggered on Partial or No answers
- Flagged for **industry overlay** where specific regulations apply

---

## Privacy Architecture

- **100% browser-local** — all assessment data stays in `localStorage`
- **Zero outbound requests** — no server, no cloud, no analytics
- **Works offline** after initial page load
- **No user accounts** required — assessments are managed locally

---

## Deployment

```bash
npm run build
```

Push to GitHub → Import in Vercel → Deploy. `vercel.json` handles SPA routing.

---

## Project Structure

```
ai-readiness-assessor/
├── public/
│   └── ai-question-bank.xlsx     ← 160 questions, 25 functions
├── src/
│   ├── main.jsx
│   └── App.jsx                   ← Single-file React app
├── index.html
├── package.json
├── vite.config.js
└── vercel.json
```

---

## Roadmap

- [ ] v1.1 — Admin portal (reuse from itil4-assessor)
- [ ] v1.2 — PDF report export (15-section boardroom report)
- [ ] v1.3 — AI Use Case Register (200 use cases mapped to functions)
- [ ] v1.4 — ROI Quantification Engine (headcount × automation potential)
- [ ] v1.5 — Industry overlays (Financial Services, NHS, Manufacturing)
- [ ] v1.6 — EU AI Act compliance gap module
- [ ] v2.0 — Full question bank (600 questions, all 25 functions × 3 levels)

---

## Author

**Gagandeep Singh** | AI Practice  
Based on ITSM Maturity Assessment Framework (ITIL 4)  
March 2026
