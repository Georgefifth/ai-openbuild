# Stage 4 — Demo Video, Technical Storyboard & Visual QA Report (`WrenchTruth`)

## 1. Production Pipeline & Specifications

- **Engine**: `~/tools/demo-recorder` (Remotion 1080p30 React SVG Presentation Engine + Playwright Live Prototype Capture + `edge-tts` Narration + Synchronized Subtitle Cues + Sidechain-Ducked BGM)
- **Output Video**: `evidence/stage-4-demo/demo.mp4`
- **Resolution & Codec**: `1920×1080` @ `30 fps`, H.264 (`yuv420p`) + AAC Audio (`68.80 seconds`, `9.2 MB`)
- **Fact Validation Status (`project/facts.json` + `planning/storyboard.json`)**:
  - `[validate-facts] scenes: 6 · total: 68.8s · verified facts: 3 · blocked unverified claims: 1 — ✓ All fact checks, asset paths, and timeline constraints passed.`
  - Every metric presented in the video (`$2,840.50` / `71%` saved on the 2020 Honda CR-V quote, `6.6` duplicate teardown hours eliminated on the 2014 Odyssey V6 timing service, `20/20` / `100%` Stage 3.5 real-world validation pass rate vs. `20%` single-procedure estimator baseline, and `12/12` Playwright Firefox QA scenarios) is directly traceable to Stage 3 and Stage 3.5 evidence.

---

## 2. Scene-by-Scene Visual Architecture & Storyboard (`planning/storyboard.json`)

| # | Scene ID | Visual Type | Duration | Visual Structure & Data Shown | Frame QA Proof |
|---|---|---|---:|---|---|
| **1** | `opening` | `opening_title` | 10.82s | **Hero Blueprint Schematic (`wrenchtruth_hero_blueprint.svg`)**: Side-by-side redline comparison of `$3,994.00` Dealer Quote → `$1,153.50` Audited Fair Counter-Offer (`SAVE 71%`), showing NHTSA Recalls `23V858000` & `24V064000` (`$0.00`) and Shared Knuckle Teardown (`-2.9 hrs`). | `frames/01-opening.png` |
| **2** | `problem_asymmetry` | `problem_flow` | 11.51s | **4-Node Bottleneck Flowchart**: `6-Line Dealer Quote ($3,994.00)` → `Double-Billed Teardown (+6.6 hrs)` → `Unchecked NHTSA Recalls ($1,656 loss)` → `Predatory Overcharge (71% overpaid)` with timed red highlight pills. | `frames/02-problem-flow.png` |
| **3** | `exploded_architecture` | `exploded_view` | 10.91s | **4-Layer Isometric Exploded Stack**:<br>1. `ISO-3779 VIN & Quote Parser`<br>2. `Live US DOT NHTSA Gateway (vPIC + Recalls + ODI)`<br>3. `Shared-Teardown Labor Graph`<br>4. `Wal33D DTC & Script Generator (18,805 Codes MIT)` | `frames/03-exploded-architecture.png` |
| **4** | `live_workbench_demo` | `real_footage_with_annotations` | 15.45s | **Live Playwright Capture (`https://ai-openbuild.vercel.app`) + Timed HUD Annotations**: Real-time browser demonstration auditing the 2020 CR-V quote via live NHTSA API, switching to Case #02 (2014 Odyssey 6.6h timing belt overlap), copying the Service Advisor Negotiation Script, and inspecting the `P0420` DTC and NHTSA Dossier tabs. | `frames/04-live-workbench.png` |
| **5** | `validation_benchmark` | `technical_validation` | 12.83s | **Empirical Benchmark Telemetry Chart + Explicit Scope Limitations**:<br>• `Real-World Benchmark Pass Rate (20 Cases)`: `100%` vs `20% baseline`<br>• `Playwright Real-Browser QA`: `100% (12/12)`<br>• `Verified Overcharge Reduction`: `71.1%`<br>• Explicit Limitations: Handwritten paper receipts require text transcription; prior VIN recall completion requires dealer warranty portal. | `frames/05-validation-benchmark.png` |
| **6** | `closing` | `closing_summary` | 7.29s | **Closing Summary Card**: Live URL (`ai-openbuild.vercel.app`), GitHub repository (`github.com/Georgefifth/ai-openbuild`), and open-source attribution (`US DOT NHTSA + Wal33D MIT`). | `frames/06-closing.png` |

---

## 3. Visual QA & Frame Inspection Log

During initial frame inspection (`ffmpeg` extraction + visual review):
1. **Finding 1 (`01-opening.png`)**: An initial highlight overlay rectangle (`x: 50, y: 46`) partially overlapped the `$1,153.50` text inside `wrenchtruth_hero_blueprint.svg`.
   - **Fix**: Removed the redundant overlay on `opening` so the custom vector schematic renders with 100% unobstructed legibility.
2. **Finding 2 (`02-problem-flow.png`)**: A 55-character callout string on `node_overlap` slightly overflowed the fixed-width SVG badge pill.
   - **Fix**: Shortened the callout pill text to `"Water pump: +3.5h overlap"` and `"Recalls billed: $1,656"`, re-rendered `demo.mp4`, and verified that all text sits cleanly centered inside the pill badge.

---

## 4. Exported Artifacts Index (`evidence/stage-4-demo/`)

- `evidence/stage-4-demo/demo.mp4` (Full 1080p30 H.264 MP4 with narration, captions & BGM)
- `evidence/stage-4-demo/assets/wrenchtruth_hero_blueprint.svg` (Editable vector schematic)
- `evidence/stage-4-demo/assets/wrenchtruth_teardown_schematic.svg` (Editable vector teardown tree)
- `evidence/stage-4-demo/frames/01-opening.png`
- `evidence/stage-4-demo/frames/02-problem-flow.png`
- `evidence/stage-4-demo/frames/03-exploded-architecture.png`
- `evidence/stage-4-demo/frames/04-live-workbench.png`
- `evidence/stage-4-demo/frames/05-validation-benchmark.png`
- `evidence/stage-4-demo/frames/06-closing.png`
- `project/facts.json`, `planning/script.md`, `planning/storyboard.json`
