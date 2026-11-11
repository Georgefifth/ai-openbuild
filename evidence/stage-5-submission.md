# Stage 5 — Submission Package Verification & Evidence (`WrenchTruth`)

## 1. Submission Package Contents (`submission/`)

All required Devpost submission files have been generated and verified under `/home/yap/Hack/ai-openbuild/submission/`:

- **`submission/fields.md`**: Complete, single-version, copy-paste-ready Devpost form fields (Project name, 191-char Elevator pitch, Thumbnail reference, full Markdown `About the project` covering both standard Devpost sections and all 6 AI OpenBuild checklist items, 11 `Built with` tags, `Try it out` links, 5 <=150-char gallery captions, and video instructions).
- **`submission/checklist.md`**: Step-by-step human submission instructions and pre-submission verification checklist.
- **`submission/assets/`**:
  - `thumbnail.png` — Custom-generated `1200×800` (3:2 ratio) PNG (`110 KB`, < 5 MB limit).
  - `gallery-01-workbench-audit.png` — `1500×1000` (3:2 ratio) PNG (`330 KB`) · Caption: 131 chars.
  - `gallery-02-teardown-blueprint.png` — `1500×1000` (3:2 ratio) PNG (`330 KB`) · Caption: 125 chars.
  - `gallery-03-dtc-root-cause.png` — `1500×1000` (3:2 ratio) PNG (`328 KB`) · Caption: 126 chars.
  - `gallery-04-nhtsa-dossier.png` — `1500×1000` (3:2 ratio) PNG (`326 KB`) · Caption: 130 chars.
  - `gallery-05-validation-benchmark.png` — `1500×1000` (3:2 ratio) PNG (`441 KB`) · Caption: 124 chars.
  - `demo.mp4` — `1920×1080` @ `30 fps` H.264 + AAC (`68.80s`, `9.2 MB`).

---

## 2. Claim-to-Evidence Traceability Matrix

| Claim in `submission/fields.md` | Source Stage & Evidence File |
|---|---|
| `$2,840.50` (`71%`) saved on 2020 Honda CR-V ($3,994 quote → $1,153.50 audited fair counter-offer via NHTSA Recalls `23V858000` & `24V064000` and `-2.9 hrs` front suspension teardown overlap) | `evidence/stage-2-build.md`, `evidence/stage-3-qa/screens/s02-core-flow-live-nhtsa-audit-live-nhtsa-audit-desktop.png`, `tests/auditEngine.test.ts` |
| `6.6 duplicate hours` (`$1,122`) eliminated across Timing Belt, Water Pump, Serpentine Belt, Thermostat & Coolant Bleed on 2014 Honda Odyssey V6 quote | `evidence/stage-3-qa/screens/s03-presets-and-counter-offer-toggles-case02-timing-overlap-desktop.png`, `tests/auditEngine.test.ts` |
| `20/20` (`100.0%`) post-fix pass rate on Stage 3.5 real-world benchmark across 8 vehicle models (improved from `13/20` / `65.0%` initial run) vs. `4/20` (`20.0%`) single-procedure estimator baseline, with `0.0%` false-positive rate on negative controls | `evidence/stage-3.5-validation/report.md`, `evidence/stage-3.5-validation/initial-results.json`, `evidence/stage-3.5-validation/post-fix-results.json` |
| `12/12` real-browser Playwright headless Firefox QA scenarios passed across Desktop (`1440×900`) & Mobile (`390×844`) on both deployed Vercel and local build | `evidence/stage-3-qa/report.md`, `evidence/stage-3-qa/results.json`, `evidence/stage-3-qa/results-local.json` |
| Open-source `Wal33D/dtc-database` (18,805 SAE J2012 & OEM DTC definitions, MIT License) + live U.S. DOT NHTSA APIs | `evidence/stage-1-research.md`, `src/data/dtcDatabase.ts`, `api/nhtsa.ts` |

---

## 3. Live Link & Asset Dimension Verification

Verified via `file` / `ffprobe` / `curl` on 2026-11-12:
- `https://ai-openbuild.vercel.app` → `HTTP/2 200`
- `https://ai-openbuild.vercel.app/api/nhtsa?vin=2HKRW2H59LH601234&year=2020&make=HONDA&model=CR-V` → `HTTP/2 200` (Live JSON)
- `https://github.com/Georgefifth/ai-openbuild` → `HTTP/2 200` (Public GitHub repository, 0 secret files tracked)
