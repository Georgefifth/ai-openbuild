# Stage 3 — Real-Browser QA Report (`WrenchTruth`)

## 1. Test Environment

- **Production Deployed URL**: `https://ai-openbuild.vercel.app`
- **Local Production Preview URL**: `http://127.0.0.1:4588`
- **Browser Engine**: Playwright Headless **Firefox** (`BROWSER=firefox`)
- **Viewports Tested**:
  - Desktop: `1440×900` (`deviceScaleFactor: 1`)
  - Mobile: `390×844` (`deviceScaleFactor: 2`)
- **Date**: 2026-11-11
- **Raw Evidence Files**:
  - `qa/scenarios.md` (Prioritized P0/P1/P2 scenario specifications)
  - `qa/run.mjs` (Playwright real-browser QA runner)
  - `evidence/stage-3-qa/results.json` & `evidence/stage-3-qa/results-deployed.json` (12/12 pass on production)
  - `evidence/stage-3-qa/results-local.json` (12/12 pass on local build)
  - `evidence/stage-3-qa/screens/*.png` (16 full-page and state screenshots across desktop & mobile)

---

## 2. Pass / Fail / Blocked Summary

| Environment | Browser | Total Scenarios (Desktop + Mobile) | Passed | Failed | Blocked | Console / Page Errors | HTTP 5xx / Failed Requests |
|---|---|---:|---:|---:|---:|---:|---:|
| **Deployed (`https://ai-openbuild.vercel.app`)** | Firefox (headless) | **12** | **12** | **0** | **0** | **0** | **0** |
| **Local Build (`http://127.0.0.1:4588`)** | Firefox (headless) | **12** | **12** | **0** | **0** | **0** | **0** |

### Scenario Execution Matrix (Deployed Production Run)

| Viewport | Scenario ID | Priority | Title | Status | Duration (ms) | Console / Network Issues |
|---|---|---|---|---|---:|---|
| `desktop` (1440×900) | `s01-first-visit-and-empty-state` | **P0** | Landing page usability, zero horizontal overflow, and actionable empty state recovery | **PASS** | 2,140 ms | 0 errors |
| `desktop` (1440×900) | `s02-core-flow-live-nhtsa-audit` | **P0** | End-to-end forensic quote audit with live US DOT NHTSA API recall & teardown detection | **PASS** | 4,580 ms | 0 errors |
| `desktop` (1440×900) | `s03-presets-and-counter-offer-toggles` | **P0** | Multi-case timing belt teardown graph, interactive line toggles, and script copy | **PASS** | 2,310 ms | 0 errors |
| `desktop` (1440×900) | `s04-validation-and-custom-quote` | **P1** | ISO-3779 VIN validation, SAE J2012 DTC validation, and custom quote audit | **PASS** | 4,190 ms | 0 errors |
| `desktop` (1440×900) | `s05-dtc-and-nhtsa-dossier-tabs` | **P1** | Anti-Parts-Cannon OBD-II DTC explorer and Federal NHTSA Dossier subsystem filter | **PASS** | 2,050 ms | 0 errors |
| `desktop` (1440×900) | `s06-keyboard-and-a11y` | **P2** | Keyboard focus navigation, form label associations, and >=44px touch targets | **PASS** | 1,180 ms | 0 errors |
| `mobile` (390×844) | `s01-first-visit-and-empty-state` | **P0** | Landing page usability, zero horizontal overflow, and actionable empty state recovery | **PASS** | 2,490 ms | 0 errors |
| `mobile` (390×844) | `s02-core-flow-live-nhtsa-audit` | **P0** | End-to-end forensic quote audit with live US DOT NHTSA API recall & teardown detection | **PASS** | 4,410 ms | 0 errors |
| `mobile` (390×844) | `s03-presets-and-counter-offer-toggles` | **P0** | Multi-case timing belt teardown graph, interactive line toggles, and script copy | **PASS** | 2,520 ms | 0 errors |
| `mobile` (390×844) | `s04-validation-and-custom-quote` | **P1** | ISO-3779 VIN validation, SAE J2012 DTC validation, and custom quote audit | **PASS** | 4,320 ms | 0 errors |
| `mobile` (390×844) | `s05-dtc-and-nhtsa-dossier-tabs` | **P1** | Anti-Parts-Cannon OBD-II DTC explorer and Federal NHTSA Dossier subsystem filter | **PASS** | 2,190 ms | 0 errors |
| `mobile` (390×844) | `s06-keyboard-and-a11y` | **P2** | Keyboard focus navigation, form label associations, and >=44px touch targets | **PASS** | 1,120 ms | 0 errors |

---

## 3. Issues Discovered, Fixed & Regression-Verified

| Issue ID | Severity | Description & Reproduction Steps | Fix Applied | Regression Result |
|---|---|---|---|---|
| **QA-01** | **P0** | **Live NHTSA Recall Priority Ordering**: On `2020 Honda CR-V`, the live NHTSA API returns 7 recalls (`19V865`, `22V380`, `23V158`, `23V524`, `23V858`, `24V064`, `26V332`). Initially, `.find()` matched generic `FUEL SYSTEM` (`22V380` fuel tank absorber clip) before specific `FUEL PUMP` (`23V858000`). Furthermore, local `dist/` had not been rebuilt after the engine update, causing `s02-core-flow-live-nhtsa-audit` to fail on local `vite preview` before rebuild. | Updated `runForensicAudit` in `src/engine/auditEngine.ts` to prioritize exact component match (`fuel pump` → `23V858000`, `seat weight / occupant` → `24V064000` / `26V332000`) and rebuilt `dist/` via `npm run build`. | **PASS** (12/12 on both deployed Vercel and local preview). |
| **QA-02** | **P1** | **Shared-Teardown Blueprint Header Contrast**: `.work-order-card` had `background-color: #FFFFFF` in `src/index.css`, overriding Tailwind's `bg-[#1E3A5F]` on the Shared-Teardown Blueprint card and reducing contrast of yellow `#FBBF24` badges. | Removed hardcoded `background-color: #FFFFFF` from `.work-order-card` in `src/index.css` so dark navy `#1E3A5F` renders with high contrast. | **PASS** (Verified visually in `s02-core-flow-live-nhtsa-audit-live-nhtsa-audit-desktop.png` and mobile). |
| **QA-03** | **P1** | **Sticky Header Full-Page Screenshot Overlap**: `sticky top-0` on `<header>` floated across the middle of full-page screenshots after scrolling to bottom controls. | Changed `<header>` to static document flow so scrolling and full-page printing/screenshots never obscure work-order lines. | **PASS** (Verified across all 16 screenshots in `evidence/stage-3-qa/screens/`). |

---

## 4. Visual & First-Time User Experience Audit

1. **5-Second Comprehension & Domain Identity**:
   - Landing on the workbench immediately communicates its purpose: *"Stop Paying for Double-Billed Teardown Labor & Recall-Covered Repairs"*.
   - The visual design (**Service Bay Forensic Blueprint** — warm shop-ticket paper `#F4F1EA`, `2px solid #141413` work-order cards with hard offset shadows, tabular `IBM Plex Mono` figures, and the deep navy `#1E3A5F` **Shared-Teardown Mechanical Labor Overlap Graph**) is unmistakably tailored to automotive repair auditing and passes the Generic SaaS test.
2. **Actionable Empty & Error States**:
   - Clicking `Clear to Blank Ticket` displays a clear empty state (`No Repair Estimate Loaded Yet`) with two 1-click preset buttons so a user is never stranded on a blank screen.
   - Entering an invalid VIN like `2HKRW2I59LH601234` pinpoints the exact ISO-3779 violation (`Invalid character 'I' at position 7. Standard ISO 3779 VINs never contain I, O, or Q.`).
3. **Mobile (`390×844`) Ergonomics**:
   - Zero horizontal scroll (`scrollWidth - innerWidth === 0`).
   - All buttons and presets meet or exceed `44px` height (`Run Forensic Quote Audit` is `52px` tall).
   - Line-by-line Redline Work Order Diff stacks cleanly into readable cards on 390px viewports.

---

## 5. Screenshot Index (`evidence/stage-3-qa/screens/`)

- `s01-first-visit-and-empty-state-landing-desktop.png`
- `s01-first-visit-and-empty-state-empty-state-desktop.png`
- `s01-first-visit-and-empty-state-landing-mobile.png`
- `s01-first-visit-and-empty-state-empty-state-mobile.png`
- `s02-core-flow-live-nhtsa-audit-live-nhtsa-audit-desktop.png`
- `s02-core-flow-live-nhtsa-audit-live-nhtsa-audit-mobile.png`
- `s03-presets-and-counter-offer-toggles-case02-timing-overlap-desktop.png`
- `s03-presets-and-counter-offer-toggles-script-copied-toast-desktop.png`
- `s03-presets-and-counter-offer-toggles-case02-timing-overlap-mobile.png`
- `s03-presets-and-counter-offer-toggles-script-copied-toast-mobile.png`
- `s04-validation-and-custom-quote-validation-errors-desktop.png`
- `s04-validation-and-custom-quote-custom-quote-audited-desktop.png`
- `s04-validation-and-custom-quote-validation-errors-mobile.png`
- `s04-validation-and-custom-quote-custom-quote-audited-mobile.png`
- `s05-dtc-and-nhtsa-dossier-tabs-dtc-p0420-detail-desktop.png`
- `s05-dtc-and-nhtsa-dossier-tabs-nhtsa-dossier-desktop.png`
- `s05-dtc-and-nhtsa-dossier-tabs-dtc-p0420-detail-mobile.png`
- `s05-dtc-and-nhtsa-dossier-tabs-nhtsa-dossier-mobile.png`
