# Stage 1 — Market Research & Candidate Direction Selection (AI OpenBuild — Automotive / Car Track)

## 0. Event & Judging Analysis (Verified Facts)

- **Hackathon**: [AI OpenBuild](https://ai-openbuild.devpost.com/) ([Rules](https://ai-openbuild.devpost.com/rules))
- **Timeline**: November 5 – December 10, 2026 (Results: December 17, 2026)
- **Theme & Core Requirement**: *"Imagine opening a project and realizing: 'I did not know AI could do that.' ... Create a project that uses AI as a meaningful part of its functionality or experience. Show a working prototype or a clearly labeled interactive proof of concept."*
- **Judging Criteria**:
  1. **AI Integration & Technical Execution (30%)** — Meaningful AI integration, model/method choices, solid implementation, and verifiable contribution.
  2. **Originality & Problem Framing (25%)** — Thoughtful/original approach and clear framing of the intended problem or creative goal.
  3. **Usefulness & User Experience (25%)** — Usability, accessibility, and practical value for intended users.
  4. **Testing & Communication (20%)** — Clear demonstration of build, AI behavior, representative inputs/outputs, failure cases/limitations, and testing.
- **User Objective Scope**: Automotive / Car (`car` domain).

---

## 1. Market Exploration & Real User Pain Points

We investigated existing commercial products, open-source repositories, federal vehicle safety APIs, and consumer/developer reviews across Trustpilot, Hacker News, and GitHub Issues:

### Confirmed Facts (with Sources)
1. **Auto Repair Estimate Opacity & Service Upselling**:
   - Dealerships and repair shops routinely present multi-line PDF/printed quotes mixing critical safety repairs with high-margin fluid flushes,bundled labor overlaps, and 100–300% OEM part markups, or charging customers thousands of dollars for defects covered by active recalls or Technical Service Bulletins (TSBs).
   - *Evidence*: NHTSA ODI Complaint `#11776860` (filed Nov 9, 2026 for 2020 Honda CR-V, via `https://api.nhtsa.gov/complaints/complaintsByVehicle?make=honda&model=cr-v&modelYear=2020`) documents a dealership quoting "thousands of dollars" to replace a sticking steering box on a well-known defect with related recall campaigns.
   - *Existing Estimator Limitations*: [RepairPal Estimator](https://repairpal.com/estimator) and [Jerry.ai](https://jerry.ai/) require manual category-by-category lookup of individual procedures; they cannot ingest a multi-line mechanic invoice/quote to detect overlapping labor hours (e.g., charging full book time for a water pump when the timing belt is already off), cross-check NHTSA recalls/complaints for the vehicle's VIN, or flag non-essential dealership "wallet flushes."
2. **Consumer OBD-II Scanners & Subscription Dark Patterns**:
   - Consumer OBD-II apps translate single Diagnostic Trouble Codes (DTCs) into generic descriptions, while locking basic severity or repair info behind aggressive $100–$240/year auto-renewing subscriptions.
   - *Evidence*: [FIXD Trustpilot Reviews](https://www.trustpilot.com/review/www.fixdapp.com) (3,024 reviews) and [Carly Trustpilot Reviews](https://www.trustpilot.com/review/www.mycarly.com) (18,000+ reviews, 2.5/5 rating) show widespread user anger over unexpected $106–$240 annual renewal charges and apps that only output static code definitions without analyzing actual freeze-frame/time-series sensor correlations (e.g., Short/Long Term Fuel Trim vs. RPM and MAF to distinguish a $15 vacuum hose leak from a $1,200 catalytic converter replacement on `P0171`/`P0420`).
   - Open-source trackers like [LubeLogger (`hargata/lubelog`, 2,956★)](https://github.com/hargata/lubelog) have explicit user requests to import and analyze Torque OBD-II CSV logs ([Issue #446](https://github.com/hargata/lubelog/issues/446)) and VIN data ([Issue #485](https://github.com/hargata/lubelog/issues/485)).
3. **Used Car Pre-Purchase Blind Spots & History Report Failures**:
   - Buyers rely on CARFAX ($44.99/report) or remote inspection services like Lemon Squad ($200+), yet CARFAX only shows what was reported to insurance/police and misses unrecorded damage, stealth recalls, or model-specific failure clusters.
   - *Evidence*: [CARFAX Trustpilot](https://www.trustpilot.com/review/www.carfax.com) holds a **1.4 / 5** rating across hundreds of reviews citing missed structural/body repairs, unreported fleet usage, and inaccurate records. [Lemon Squad Trustpilot](https://www.trustpilot.com/review/lemonsquad.com) (3.5/5) documents inspectors missing obvious defects or omitting negotiating leverage. Meanwhile, NHTSA's public APIs (`https://vpic.nhtsa.dot.gov/api/` and `https://api.nhtsa.gov/`) and [CarComplaints.com](https://www.carcomplaints.com/) hold rich VIN specifications, recalls, and hundreds of thousands of real owner failure narratives that buyers struggle to synthesize during a lot inspection.
4. **Dashcam Incident & Telemetry Extraction Friction**:
   - Modern dashcams (including Tesla Dashcam SEI metadata introduced in late 2025 via [`teslamotors/dashcam`](https://github.com/teslamotors/dashcam), and open-source tools like [`ssrajadh/sentrysearch` (4,584★)](https://github.com/ssrajadh/sentrysearch) and [`ehendrix23/tesla_dashcam` (738★)](https://github.com/ehendrix23/tesla_dashcam)) record gigabytes of raw MP4s and kinematics.
   - When an incident occurs, drivers must manually scrub video, extract speed/braking/steering telemetry, diagram the collision trajectory, and write an objective insurance claim narrative.
5. **CAN Bus Reverse Engineering & DBC Authoring Bottleneck**:
   - Automotive engineers, EV conversion builders, and openpilot porters use [`collin80/SavvyCAN` (1,923★)](https://github.com/collin80/SavvyCAN), [`commaai/opendbc` (3,553★)](https://github.com/commaai/opendbc), [`cantools/cantools` (2,312★)](https://github.com/cantools/cantools), and [`Chanchaldhiman/CANviz` (297★)](https://github.com/Chanchaldhiman/CANviz).
   - *Evidence*: SavvyCAN [Issue #271](https://github.com/collin80/SavvyCAN/issues/271) and Cabana [Issue #98](https://github.com/commaai/cabana/issues/98) / [#111](https://github.com/commaai/cabana/issues/111) show that discovering physical signals (counters, checksums, wheel speeds, steering angle scaling/endianness) from raw `.asc`/`.candump` logs and authoring valid `.dbc` files remains a tedious, manual bit-math exercise.

---

## 2. Candidate Directions (6 Distinct Concepts)

### Direction 1: **WrenchTruth** — AI Mechanic Quote Auditor, Labor Overlap Detector & NHTSA Recall Cross-Checker
- **Target User & Pain Point**: Everyday car owners facing a $800–$4,500 repair estimate from a dealership or shop who cannot tell which line items are safety-critical, which have overlapping labor (double-billed book time), which parts are marked up 250%, and whether the failure is actually covered for free under an NHTSA recall, extended warranty, or manufacturer defect cluster.
- **Current Workflow**: Users take a photo of their quote and post it to `r/MechanicAdvice` hoping a mechanic replies before the shop closes, or manually search 10 separate part numbers on RockAuto and RepairPal.
- **Existing Products & Links**:
  - [RepairPal Fair Price Estimator](https://repairpal.com/estimator) — Only estimates single isolated procedures; cannot audit a full multi-line invoice or detect labor overlap.
  - [Jerry.ai Car Care](https://jerry.ai/) — Primarily an insurance lead-gen mobile app; requires account signup and phone number.
  - [NHTSA Recalls & Complaints API](https://vpic.nhtsa.dot.gov/api/) — Raw federal data, not linked to shop repair line items.
- **Our Concrete Improvement**:
  - Upload an itemized repair quote image/PDF or paste text + enter VIN (or Year/Make/Model/Mileage).
  - **Real NHTSA Live Integration + Open DTC DB**: Automatically decodes the VIN via NHTSA vPIC API, pulls live NHTSA Recalls & Owner Complaint clusters for that exact vehicle, and cross-references every quoted line item.
  - **AI Line-by-Line Forensic Audit**:
    1. Flags **Labor Overlap** (e.g., billing 3.5 hrs for water pump + 4.0 hrs for timing belt when 90% of teardown is shared).
    2. Separates **Safety-Critical Now** vs. **Deferrable Maintenance** vs. **High-Margin Upsell ("Wallet Flush")**.
    3. Compares OEM quoted part prices against fair aftermarket/OEM benchmark ranges and OEM maintenance schedule intervals.
    4. Generates a polite, technical **"Service Advisor Negotiation Script"** with exact questions to ask the shop.
- **Why Users Switch**: Zero signup, instant line-by-line savings breakdown backed by live federal NHTSA data and mechanical labor-overlap logic.
- **Feasibility & Risks**: High technical feasibility in a web app; low risk because NHTSA vPIC/Recalls/Complaints APIs are free, public, and require no auth keys.
- **MVP & Validation**: Interactive web workbench with sample real-world dealer invoices + custom quote parser/OCR + live NHTSA VIN/Recall/Complaint integration, validated against a benchmark dataset of 20+ real mechanic quotes (measuring accuracy of upsell detection, labor overlap detection, and recall matching).

---

### Direction 2: **TrimTrace** — AI OBD-II Telemetry & Freeze-Frame Root-Cause Diagnostician
- **Target User & Pain Point**: DIY car owners, used car buyers, and independent techs who plug in a $15 ELM327/OBD-II dongle and get a generic code like `P0171 (System Too Lean)` or `P0420`, then waste hundreds of dollars firing the "parts cannon" (replacing O2 sensors or catalytic converters) because their app doesn't analyze the *correlation* between sensor streams.
- **Current Workflow**: Export a messy `.csv` log from Torque Pro or Car Scanner ELM OBD2, open it in Excel, and squint at 30 columns of PIDs trying to see if Short-Term Fuel Trim (`STFT`) improves at 2,500 RPM (indicating a vacuum leak) or worsens under load (indicating a weak fuel pump or dirty MAF sensor).
- **Existing Products & Links**:
  - [FIXD App](https://www.fixdapp.com/) ([Trustpilot](https://www.trustpilot.com/review/www.fixdapp.com)) — Static code lookup + $100+/yr subscription trap; no multi-PID time-series correlation.
  - [Carly (`mycarly.com`)](https://www.trustpilot.com/review/www.mycarly.com) — 2.5/5 Trustpilot rating due to locked features and annual billing.
  - [Wal33D/dtc-database](https://github.com/Wal33D/dtc-database) & [Car Scanner ELM OBD2](https://www.carscanner.info/) — Great raw data capture/lookup, but leaves cross-sensor diagnostic reasoning entirely to the human.
- **Our Concrete Improvement**:
  - Builds on top of open-source [`Wal33D/dtc-database`](https://github.com/Wal33D/dtc-database) (18,805 DTC definitions, MIT license) + live NHTSA API + WebSerial/WebBluetooth ELM327 support & Torque/CarScanner `.csv` log upload.
  - **Physics-Informed AI Telemetry Engine**: Analyzes multi-PID time-series (RPM, Engine Load, STFT/LTFT Bank 1/2, MAF, MAP, Coolant Temp, O2 Upstream/Downstream voltage, Battery Voltage) alongside DTCs.
  - Produces a **Differential Diagnosis Decision Tree** with ranked probabilities (e.g., *82% Vacuum Leak vs. 12% MAF Sensor vs. 6% Fuel Injector*) citing the exact timestamped sensor evidence in the user's log (e.g., *"At t=42s, RPM rose from 750 to 2,800 and LTFT dropped from +18.8% to +3.1% — classic intake vacuum leak signature"*), plus a step-by-step 5-minute physical verification test before buying any parts.
- **Why Users Switch**: Free, runs in browser, accepts any Torque/CarScanner CSV or live WebSerial OBD-II stream, and explains *why* based on actual sensor curves rather than generic code text.
- **Feasibility & Risks**: Very high feasibility; can ship with real OBD-II drive log fixtures (lean vacuum leak, MAF drift, failing catalyst, misfire under load, alternator ripple) plus custom CSV upload and live NHTSA vehicle context.
- **MVP & Validation**: Interactive oscilloscope-style multi-PID analyzer + AI differential root-cause engine, validated on 25+ labeled OBD-II telemetry logs across fault classes.

---

### Direction 3: **LotLens** — Used-Car Pre-Purchase Risk Intelligence & Negotiation Dossier
- **Target User & Pain Point**: Used-car shoppers standing on a dealer lot or browsing listings who are overwhelmed by fragmented data (VIN specs, NHTSA recalls, NHTSA owner complaint spikes, model-year specific "timebomb" defects, and seller listing claims) and risk buying a money pit.
- **Current Workflow**: Pay $44.99 for CARFAX (which misses unrecorded issues and design defects), then spend 2 hours cross-referencing NHTSA, CarComplaints, and Reddit threads for that specific engine/transmission code.
- **Existing Products & Links**:
  - [CARFAX](https://www.trustpilot.com/review/www.carfax.com) — 1.4/5 on Trustpilot; expensive and silent on design defects/complaint trends.
  - [CarComplaints.com](https://www.carcomplaints.com/) — Static web archive; doesn't decode a specific VIN's engine/transmission variant or combine with a seller listing & inspection checklist.
  - [Lemon Squad](https://www.trustpilot.com/review/lemonsquad.com) — $200+ human inspection taking 48 hours.
- **Our Concrete Improvement**:
  - Enter any 17-digit VIN + mileage + asking price + optional seller listing text or walkaround photos.
  - Pulls live NHTSA vPIC decoded engine/transmission specs, all recalls, and hundreds of NHTSA ODI owner complaints for that exact model year.
  - Uses AI to cluster raw federal complaint narratives into **"Known Failure Hotspots at Your Mileage Bracket"** (e.g., *CVT judder at 60k–90k miles, oil dilution, sticky steering rack*), generates a **Model-Specific 10-Point On-Lot Inspection Checklist** (where to look, what to listen for on the test drive), and calculates **Expected 24-Month Repair Liability** for price negotiation.
- **Why Users Switch**: Instant, VIN-exact pre-purchase intelligence combining federal complaint mining with a tailored on-lot inspection guide.
- **Feasibility & Risks**: High feasibility using live NHTSA APIs; risk is overlap with generic VIN lookup sites unless the AI complaint-clustering and mileage-specific inspection checklist are deeply differentiated.
- **MVP & Validation**: Live VIN intelligence engine tested across 20 real VINs with known NHTSA complaint clusters.

---

### Direction 4: **BlackBox Witness** — Dashcam Telemetry & Video Incident Reconstruction Studio
- **Target User & Pain Point**: Drivers involved in traffic collisions or insurance disputes (50/50 fault threats) who have dashcam MP4 clips (and optional Tesla SEI metadata or GPX/CSV telemetry) but struggle to turn raw video into an objective, timestamped forensic packet for insurance adjusters.
- **Current Workflow**: Take screenshots of video, write a subjective paragraph in an insurance web form, and hope the adjuster watches the whole clip carefully.
- **Existing Products & Links**:
  - [Tesla Dashcam Tools (`teslamotors/dashcam`)](https://github.com/teslamotors/dashcam) — Extracts raw SEI metadata in browser, but offers no incident analysis, timeline annotation, or claim report generation.
  - [SentrySearch (`ssrajadh/sentrysearch`)](https://github.com/ssrajadh/sentrysearch) — CLI semantic search over dashcam clips, not an incident reconstruction or claim tool.
- **Our Concrete Improvement**:
  - Browser-based studio that parses dashcam video frames + embedded/companion kinematics (speed, g-force, braking trigger, steering angle, Autopilot/ADAS state) and uses Vision-Language AI to generate a frame-accurate **Forensic Incident Timeline**, **Top-Down SVG Collision Trajectory Diagram**, **Time-to-Collision (TTC) & Braking Reaction Analysis**, and an exportable insurance claim brief.
- **Why Users Switch**: Turns raw dashcam video + telemetry into a structured engineering-grade incident report in 60 seconds.
- **Feasibility & Risks**: Medium-high difficulty; processing video frames in browser/serverless must handle large files smoothly without timeouts.
- **MVP & Validation**: Browser MP4 + SEI/telemetry parser + multimodal frame analyzer + SVG trajectory & claim packet generator, validated on benchmark dashcam incident clips.

---

### Direction 5: **DBC-Synth** — AI-Assisted CAN Bus Signal Discovery & DBC Reverse-Engineering Workbench
- **Target User & Pain Point**: Automotive security researchers, openpilot contributors, motorsport telemetry engineers, and EV conversion builders trying to decode proprietary CAN bus traffic (`.asc`, `.log`, `.candump`) into a usable `.dbc` file.
- **Current Workflow**: Load raw hex dumps into SavvyCAN or Comma Cabana, manually watch bit-flip heatmaps while pressing the brake pedal or turning the steering wheel, guess endianness (Intel vs. Motorola) and scale factors, and hand-edit `.dbc` syntax.
- **Existing Products & Links**:
  - [SavvyCAN (`collin80/SavvyCAN`)](https://github.com/collin80/SavvyCAN) — Desktop Qt app; powerful but steep learning curve and manual signal hypothesis testing.
  - [CANviz (`Chanchaldhiman/CANviz`)](https://github.com/Chanchaldhiman/CANviz) — Great browser visualizer for *existing* DBCs, but its README lists reverse-engineering/auto-DBC generation as an unbuilt roadmap item.
  - [Comma Cabana (`commaai/cabana`)](https://github.com/commaai/cabana) — Requires manual bit selection and DBC authoring.
- **Our Concrete Improvement**:
  - Browser-based CAN reverse-engineering workbench that computes statistical bit-entropy, periodicity, rolling counters, checksum bytes, and correlates candidate 8/16-bit signals (both little/big endian, signed/unsigned) against physical ground-truth hints (e.g., OBD-II PIDs or user event markers like "brake pressed at 4.2s–6.8s"), then uses AI to classify physical signal semantics and export a validated `.dbc` file compatible with `cantools` and `opendbc`.
- **Why Users Switch**: Automates the hardest 80% of CAN bus reverse engineering right in the browser with instant `.dbc` export.
- **Feasibility & Risks**: High originality and technical depth, though target audience is narrower (automotive hackers/engineers rather than everyday drivers).
- **MVP & Validation**: Tested against real `opendbc` vehicle CAN logs where ground-truth `.dbc` definitions exist, measuring precision/recall of signal boundary and scaling recovery.

---

### Direction 6: **AcousticBay** — Automotive NVH (Noise, Vibration & Harshness) Spectrogram & Symptom Triager
- **Target User & Pain Point**: Car owners hearing an unfamiliar squeal, knock, hum, or rattle who cannot describe the sound accurately to a mechanic or figure out if it is safe to drive to the shop.
- **Current Workflow**: Record a shaky video and post to social media asking "what is this noise?", getting 15 contradictory guesses.
- **Existing Products & Links**:
  - [`KaroDievas/car-sound-classification-with-keras`](https://github.com/KaroDievas/car-sound-classification-with-keras) — Academic toy notebook with small dataset.
  - [RepairPal Symptoms Guide](https://repairpal.com/symptoms/hearing-noises-from-car) — Text-only questionnaire.
- **Our Concrete Improvement**:
  - Interactive FFT spectrogram & harmonic order analyzer (correlating acoustic peak frequencies with engine RPM / wheel speed harmonics) + contextual symptom intake (cold start vs. braking vs. turning) to distinguish serpentine belt chirp, wheel bearing hum, CV axle click, rod knock, and brake wear indicator squeal.
- **Why Users Switch**: Combines real-time audio frequency-domain physics with contextual vehicle mechanics.
- **Feasibility & Risks**: High risk of smartphone microphone distortion and ambient noise confounding pure audio classification unless paired with structured mechanical conditions.
- **MVP & Validation**: Validated on a curated test set of real automotive fault audio recordings across 6 mechanical fault classes.

---

## 3. Scoring Matrix & Evidence-Based Justification

Scored 1–10 across the 5 required dimensions (Practical Value, Innovation, Competitive Advantage, UX Potential, Technical Feasibility):

| # | Candidate Direction | Practical Value | Innovation | Competitive Advantage | UX Potential | Feasibility | **Total (/50)** |
|---|---|---:|---:|---:|---:|---:|---:|
| **1** | **WrenchTruth** (Mechanic Quote Auditor & Live NHTSA Recall/Labor Overlap Engine) | **9.5** | **8.5** | **9.0** | **9.5** | **9.5** | **46.0** |
| **2** | **TrimTrace** (Physics-Informed OBD-II Telemetry & Multi-PID Root-Cause Diagnostician) | **9.0** | **9.0** | **9.0** | **9.0** | **9.0** | **45.0** |
| **3** | **LotLens** (Used-Car VIN Defect Cluster Miner & On-Lot Inspection Dossier) | **9.0** | **8.0** | **8.5** | **9.0** | **9.5** | **44.0** |
| **4** | **BlackBox Witness** (Dashcam Video + SEI Telemetry Forensic Incident Studio) | **8.5** | **9.0** | **8.5** | **8.5** | **8.0** | **42.5** |
| **5** | **DBC-Synth** (AI CAN Bus Signal Discovery & Automated `.dbc` Generator) | **8.0** | **9.5** | **9.0** | **8.0** | **8.5** | **43.0** |
| **6** | **AcousticBay** (Automotive NVH Harmonic Spectrogram & Sound Triager) | **7.5** | **8.5** | **7.5** | **8.0** | **7.0** | **38.5** |

---

## 4. Strict Product Critique & Elimination (Devil's Advocate)

### Critique of Direction 1: **WrenchTruth** (Mechanic Quote Auditor)
1. **Does it really need to exist?** Yes. Auto repair is a textbook market for lemons (information asymmetry). A single prevented double-labor charge or caught NHTSA recall/TSB saves a driver $300–$2,500 immediately.
2. **Why can't existing tools solve it?** RepairPal and Kelley Blue Book require looking up one repair at a time and assume every repair is independent; they cannot parse a 7-line shop quote, spot that two jobs share the same 3-hour front-engine teardown, or cross-check live NHTSA recalls/complaints for that VIN.
3. **Is there a simpler non-AI solution?** A static database can look up one part number, but mechanic quotes use inconsistent free-text descriptions (*"R&R Front Lower Ctrl Arm Bushings + Align"*, *"Perform BG Fuel Induction Service"*). Combining structured NHTSA APIs + labor-tree overlap rules + LLM semantic parsing & negotiation script generation is where AI shines.
4. **Will users use it once and abandon it?** Car owners get service quotes 2–4 times a year per household vehicle, and share quotes with family members.
5. **Evidence our approach is better**: Live NHTSA API integration provides ground-truth federal recall and complaint data (eliminating LLM hallucination on recalls), while deterministic labor-overlap graphs + AI line-item auditing provide transparent math.
6. **Kill assumption**: If the system merely outputs vague "this seems expensive" text without citing specific part vs. labor breakdowns, shared teardown overlaps, or real NHTSA campaign IDs, it fails.

### Critique of Direction 2: **TrimTrace** (OBD-II Multi-PID Root-Cause Diagnostician)
1. **Does it really need to exist?** Yes. Millions of drivers own $15 ELM327 dongles or get free code scans at AutoZone, but a code like `P0171` or `P0300` is a symptom, not a part to replace.
2. **Why can't existing tools solve it?** FIXD and Carly charge $100+/year for static text descriptions; Torque Pro records raw CSVs with 30 columns that non-mechanics cannot interpret.
3. **Is there a simpler non-AI solution?** Simple threshold rules can flag an out-of-range PID, but correlating multi-sensor dynamics across RPM/Load regimes alongside vehicle-specific NHTSA complaint history requires combining signal-processing heuristics with AI diagnostic synthesis.
4. **Will users use it once and abandon it?** Used whenever a Check Engine Light appears, before buying a used car, or during seasonal health checks.
5. **Evidence our approach is better**: Built on `Wal33D/dtc-database` (18,805 codes) + deterministic signal regime math (idle vs. 2500 RPM fuel trim delta, O2 sensor switching ratio, battery cranking voltage drop) + AI root-cause explanation.
6. **Kill assumption**: If users have no sample logs to test immediately on desktop/mobile, onboarding fails — so we must support both instant real-world OBD-II drive log fixtures, custom CSV uploads, and manual DTC + freeze-frame entry.

### Critique of Direction 3: **LotLens** (Used-Car VIN Defect Cluster Miner)
1. **Does it really need to exist?** Yes, used car prices remain high and buyers distrust CARFAX (1.4/5 Trustpilot).
2. **Why can't existing tools solve it?** NHTSA complaints are unindexed walls of text; CARFAX ignores non-accident mechanical defect trends.
3. **Is there a simpler non-AI solution?** Keyword search on NHTSA exists, but clustering 400 raw owner complaints into mileage-specific failure probabilities and turning them into a physical inspection checklist requires NLP synthesis.
4. **Kill assumption**: If it only repeats NHTSA recall titles without mining the raw owner complaint narratives by mileage and component, it adds little over `nhtsa.gov`.

### Critique of Direction 4: **BlackBox Witness** (Dashcam Forensic Studio)
- **Critique**: Strong visual demo and clear value during an accident, but accidents are rare events for an individual user, and browser-side video + telemetry synchronization has higher QA surface area.

### Critique of Direction 5: **DBC-Synth** (CAN Bus Reverse Engineering)
- **Critique**: High technical novelty ("I did not know AI could do that" for hardware hackers), but very niche audience compared to vehicle owners and buyers.

### Critique of Direction 6: **AcousticBay** (Car Sound Triager)
- **Verdict — ELIMINATE**: Smartphone microphone frequency response, automatic gain control (AGC), and wind/road noise frequently mask subtle mechanical bearings/valvetrain frequencies, creating a high false-positive risk in real-world validation.

---

## 5. Recommendation & Decision Summary

### Top Recommendation: **Option 1 (`WrenchTruth`) — or a unified `WrenchTruth + TrimTrace` Diagnostic & Repair Quote Audit Workbench**
- **Why it wins in AI OpenBuild**:
  1. **AI Integration & Technical Execution (30%)**: Combines **live federal NHTSA APIs** (VIN Decoder, Recalls, and ODI Complaints) + **open-source `Wal33D/dtc-database` (18,805 OBD-II codes)** + **deterministic mechanical labor-overlap & PID signal math** + **LLM/VLM structured forensic auditing**. AI isn't a generic chatbot wrapper — it parses messy real-world repair quotes/telemetry, cross-links them to federal defect data, detects double-billed labor teardowns, and writes a concrete negotiation script.
  2. **Originality & Problem Framing (25%)**: Framing car repair and diagnostics as an **evidence-backed forensic audit against information asymmetry** immediately resonates with every judge who has ever been handed a $2,200 dealer service sheet or a mysterious Check Engine Light.
  3. **Usefulness & User Experience (25%)**: Works in seconds on any desktop or phone with zero login, supports uploading/pasting any mechanic quote, entering any 17-digit VIN, or dropping an OBD-II CSV/DTC code, and outputs clear dollar savings and next steps.
  4. **Testing & Communication (20%)**: Allows rigorous Stage 3.5 real-world validation against real NHTSA VIN/recall/complaint records and multi-line repair estimates with measurable precision/recall metrics.
