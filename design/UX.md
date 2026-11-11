# UX Contract — WrenchTruth

> Fill this before writing UI code. It is the acceptance contract for the
> frontend: if the implementation does not match this file, the implementation
> is wrong. Keep it short and specific.

## 1. Product

- **One-liner**: Forensic mechanic quote auditor that detects double-billed teardown labor, part markups, and active NHTSA recalls before you authorize a repair.
- **Primary user**: Everyday vehicle owners and used-car buyers handed a $500–$5,000 repair estimate from a dealership or independent shop.
- **Job to be done**: Know within 60 seconds which quoted line items are genuinely safety-critical, which double-count shared mechanical teardown hours, which are covered for $0 under federal NHTSA recalls or defect clusters, and what exact counter-offer to tell the service advisor.
- **Core success action**: Run a forensic audit on a multi-line repair estimate (via VIN / vehicle selector + pasted quote text, uploaded shop invoice, or one-click real dealer case preset) and produce a dollar-quantified **Audited Work Order Diff + Negotiation Script**.
- **What the user should never have to guess**:
  - Whether a repair is safe to defer or requires immediate shop attention.
  - Why a line item is flagged as overpriced (exact breakdown of quoted labor hours vs. shared-teardown book time, and quoted OEM part price vs. benchmark range).
  - Whether NHTSA recall/complaint data is live from federal APIs or offline fallback.

## 2. Core flow

| # | Step | User action | System feedback | Next step is obvious? |
|---|---|---|---|---|
| 1 | **Load Vehicle & Repair Estimate** | Enter 17-digit VIN (or select Year/Make/Model + Mileage) and paste mechanic quote lines / upload invoice / click a verified dealership case preset (`2020 Honda CR-V`, `2018 Ford F-150`, `2019 Toyota RAV4`, `2017 Subaru Outback`). Optionally attach OBD-II DTC codes (e.g., `P0171`, `P0420`). | Instant VIN checksum & NHTSA vehicle badge preview; line-item counter updates in <50ms. | Yes — primary CTA button `Run Forensic Quote Audit` (`min-h-[48px]`) is highlighted in Signal Orange. |
| 2 | **Inspect Forensic Audit & Teardown Graph** | Click `Run Forensic Quote Audit`. | Immediate progress indicator (<100ms) showing 3 stages: *1. Decoding VIN & NHTSA Federal Recalls/Complaints → 2. Calculating Mechanical Shared-Teardown Labor Graph → 3. Auditing Part Markups & DTC Root Causes*. Renders the **Audited Work Order Diff**, **Shared-Teardown Labor Overlap Blueprint**, and **Live NHTSA Recall/Complaint Match Panel**. | Yes — each flagged line item has an interactive toggle (`Approve`, `Challenge Overlap`, `Claim Recall`, `Decline Upsell`) that updates the live Counter-Offer Total. |
| 3 | **Export Counter-Offer & Advisor Script** | Toggle line-item decisions or click `Copy Service Advisor Script` / `Print Audited Work Order`. | Confirmation banner (`Copied negotiation script to clipboard — saves $1,425.00 (48%)`) with ready-to-read script citing NHTSA campaign numbers and shared teardown book hours. | Yes — user can immediately read/text the script to their mechanic or test another quote/DTC. |

Target: **≤ 3 steps** and **≤ 60 seconds** from landing to the core result.

## 3. Pages & Workspace Views

We use a single-screen **Tactical Service-Bay Workbench** with focused mode tabs so the user never loses context, enforcing **one primary action per view**:

| View / Tab | Purpose | Primary action | Secondary actions |
|---|---|---|---|
| **1. Quote Audit Workbench (Default Landing)** | Input vehicle VIN/specs, repair quote lines, and optional OBD-II DTC codes; inspect line-by-line forensic diff, teardown labor overlap graph, and NHTSA recall matches. | `Run Forensic Quote Audit` | Load 1 of 5 real-world dealer quote presets; upload quote `.txt`/`.csv`/`.json`/receipt; decode VIN live via NHTSA; toggle line-item decisions; copy Service Advisor Negotiation Script. |
| **2. OBD-II DTC & Root-Cause Cross-Check** | Verify whether a shop's quoted high-cost part actually matches the vehicle's OBD-II Diagnostic Trouble Code (powered by 18,805-code `Wal33D/dtc-database` + mechanical differential tree). | `Cross-Check DTC Against Quote` | Search DTC by code (`P0420`, `P0171`, `P0300`, `C0035`, `B1000`, `U0100`) or symptom; inspect low-cost 5-minute verification tests before replacing expensive assemblies. |
| **3. Live NHTSA Federal Dossier** | Deep-dive into the vehicle's live NHTSA Safety Recalls and ODI Owner Complaint clusters by subsystem (Steering, Fuel, Brakes, Transmission, Airbags, Electrical). | `Scan Live NHTSA Federal Records` | Filter owner complaints by component; link a matching recall or complaint cluster directly to a quoted repair line item. |

One primary action per view. Secondary actions are visually subordinate (`border-ink/20 bg-transparent`).

## 4. Required states

For every view and interactive component:

- [x] **Empty / first visit**: Shows an actionable Service Bay Intake ticket with 1-click "Load Real Dealership Quote" buttons and a clear 3-step blueprint guide — never a blank screen.
- [x] **Loading**: Visible step-by-step telemetry progress bar (`Querying NHTSA vPIC & Recalls API...`, `Computing shared teardown labor tree...`) within 100ms; buttons disable with spinner so there is no dead UI.
- [x] **Success**: Displays the stamped **Forensic Audit Verdict Banner** (`POTENTIAL OVERCHARGE DETECTED: $1,485.00 SAVED`), line-by-line diff table, teardown graph, and copy confirmation toast.
- [x] **Error**: Explicit red shop-tag alert explaining what failed (e.g., NHTSA API network timeout or unparseable file) and an immediate `Retry Live Query` or `Use Verified Local Snapshot` recovery button.
- [x] **Invalid input**: Field-level validation pointing to the exact input (e.g., VIN length/illegal characters `I`, `O`, `Q` highlighted with exact character position; empty quote lines; negative dollar amounts; malformed DTC code).
- [x] **No permission / signed out**: Zero-login architecture by design; displays a `100% Client/Stateless Privacy Badge — No Account Required, VIN Never Sold to Insurers` status indicator.
- [x] **Mobile 390px layout**: Responsive single-column stacked Service Ticket layout, horizontal-scroll-free (`overflow-x: hidden`), sticky bottom summary bar or reachable 48px primary CTA, collapsible technical teardown details.

## 5. Design tokens

- **Font family and scale**:
  - Heading / Display: `'Space Grotesk', sans-serif` (`700` bold, tight tracking `-0.02em`, uppercase section stamps)
  - Body / Technical UI: `'Inter', system-ui, sans-serif` (`400`/`500`/`600`)
  - Monospace / Numbers / VIN / DTC / Prices / Hours: `'IBM Plex Mono', monospace` (`500`/`600`, `tabular-nums`)
  - Scale: Hero `2.25rem` (36px) desktop / `1.625rem` (26px) mobile; Section Title `1.25rem` (20px); Body `0.9375rem` (15px); Technical Tag/Mono `0.8125rem` (13px).
- **Spacing scale**: `4px` base unit (`4, 8, 12, 16, 24, 32, 48px`). High-density tabular layout with crisp `1px` structural borders.
- **Colors**:
  - Background Primary (Shop Work Order Paper): `#F4F1EA`
  - Background Surface / Ticket Card: `#FFFFFF`
  - Background Secondary / Blueprint Well: `#EAE5D9`
  - Text Primary (Carbon Shop Ink): `#141413`
  - Text Muted (Stamped Steel): `#57534E`
  - Accent Primary (Safety Signal Orange — Primary Actions & Overcharge Flags): `#D94E1F` (Hover: `#B83D14`)
  - Accent Verified / Savings (Calibrated Gauge Emerald): `#15803D` (Surface: `#DCFCE7`)
  - Warning / Labor Overlap (Amber Caution): `#B45309` (Surface: `#FEF3C7`)
  - Danger / Critical Recall or Rip-off (Hydraulic Red): `#B91C1C` (Surface: `#FEE2E2`)
  - Blueprint Technical Line: `#1E3A5F`
- **Radius and borders**: Crisp industrial geometry — `2px` to `4px` border radius (`rounded-sm`), `1px solid #D6D0C4` structural grid lines, `2px solid #141413` active work-order frame with subtle offset hard shadow (`3px 3px 0px #141413`).
- **Button and input height**: All interactive buttons, presets, and inputs have `min-height: 44px` (`48px` for primary CTA) to guarantee mobile touch ergonomics.
- **Icon style and stroke**: Lucide technical line icons (`1.75px` stroke width), paired with explicit text labels (zero unlabeled icon-only buttons).

## 6. References

| Reference | What to borrow | What not to copy |
|---|---|---|
| **Haynes / Chilton Factory Service Manuals & Dealership Multi-Point Inspection (MPI) Work Orders** | Tabular repair order layout, green/yellow/red mechanical triage stamps, exploded assembly teardown hierarchy, monospace part/labor columns | Cluttered paper scan artifacts, low-contrast tiny footnotes |
| **RepairPal Estimator (`repairpal.com/estimator`)** | Clear separation of Parts vs. Labor cost ranges and regional labor rate transparency | Multi-page wizard requiring 6 clicks to look up a single isolated repair without multi-line invoice support |
| **GitHub Pull Request Diff View** | Line-by-line side-by-side comparison (`Quoted Price/Hours` struck through in red → `Audited Fair Price/Hours` in green with inline annotation tags) | Developer-only git terminology |

## 7. Mobile (390px)

- **390px layout**: Single-column vertical work-order flow. The top header compacts into a crisp shop-tag bar; the 3 view tabs remain full-width touch targets (`min-h-[44px]`).
- **Primary action reachable without horizontal scroll**: `Run Forensic Quote Audit` is immediately reachable on screen without any horizontal scroll (`document.documentElement.scrollWidth <= 390`).
- **What is collapsed or hidden**: Secondary raw JSON/NHTSA complaint narrative lists collapse into expandable accordions; the Line-by-Line Diff Table adapts into stacked forensic line-item cards on `<768px` viewports so every number (Quoted vs. Audited, Labor Hrs, Verdict Badge) is legible without horizontal scrolling.
- **Keyboard behavior**: VIN input forces uppercase alphanumeric with live character counter (`17/17`); numeric inputs use `inputMode="decimal"`.

## 8. Visual direction

- **Three adjectives**: **Forensic, Mechanical, High-Contrast**.
- **Product archetype**: **Editor / Workbench** (Interactive Service-Bay Work Order Diff & Mechanical Teardown Blueprint).
- **Palette and why it fits the domain**: Warm Shop-Ticket Paper (`#F4F1EA`), Carbon Ink (`#141413`), Safety Signal Orange (`#D94E1F`), and Gauge Emerald (`#15803D`). Auto repair lives on printed clipboard service sheets, steel gauges, and factory service manuals — not dark-mode neon cyberpunk or generic SaaS purple.
- **Type pairing (max 2 families)**: `Space Grotesk` (industrial stenciled headers) + `IBM Plex Mono` (tabular dollar figures, VINs, NHTSA campaign IDs, labor hours, and OBD-II DTCs).
- **Density**: **Dense & Structured** — users comparing a 7-line mechanic invoice against federal recalls and book-time labor overlaps need to see the numbers, teardown dependencies, and dollar savings side by side without fluff.
- **Signature element**: **The Shared-Teardown Mechanical Labor Overlap & Work-Order Diff Sheet** — an interactive visual schematic + redline invoice diff that links two or more quoted repairs (e.g., *Timing Belt + Water Pump*, or *Front Lower Control Arm + Ball Joint + Alignment*, or *Rear Brake Pads + Rear Rotors*) to their shared physical access path, visually subtracting the double-billed book hours and stamping the exact dollar overcharge.
- **Motion rules**: Instantaneous (<100ms) state transitions and tabular number recalculation when toggling line items; zero decorative floating blobs or slow fade-ins.
- **Rejected clichés**: Purple/indigo gradients, glassmorphism blur cards, centered 3-column generic marketing hero, fake KPI sidebar dashboards, emoji icons, abstract AI sparkles.

**Generic test**: Could this first screen be dropped into a generic CRM, AI copywriter, or crypto SaaS without looking out of place? **No** — the top VIN/Chassis Stamp bar, the multi-line Mechanic Work Order Redline Diff, and the Shared-Teardown Labor Overlap schematic are unmistakably built for automotive service auditing.

## 9. UX acceptance

- [x] A first-time user can explain the product's purpose within 5 seconds
- [x] The core task is reachable from the landing page without reading docs
- [x] Every action produces visible feedback within 100ms, or a loading state
- [x] Every error says what happened and what to do next
- [x] Empty states are actionable, not blank
- [x] No dead ends; no unlabeled icon-only buttons
- [x] Desktop (1440px) and mobile (390px) screenshots reviewed side by side
- [x] The flow still works after connecting the real backend
