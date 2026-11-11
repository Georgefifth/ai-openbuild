# WrenchTruth — Forensic Mechanic Quote Auditor, Shared-Teardown Labor Graph & Live NHTSA Recall Cross-Checker

> **Built for AI OpenBuild 2026** · Live Demo & Serverless Workbench

**WrenchTruth** is a forensic automotive repair estimate auditor that eliminates the information asymmetry between repair shops/dealerships and everyday drivers. Before you authorize a $1,000–$5,000 repair order, WrenchTruth cross-checks every line item against **live U.S. DOT NHTSA Safety Recalls & ODI Owner Complaint clusters**, maps **Mechanical Shared-Teardown Labor Overlaps** (catching double-billed book hours when two procedures share the same physical access path), and cross-references **OBD-II Diagnostic Trouble Codes** (`Wal33D/dtc-database` MIT) to stop the "Parts Cannon."

---

## Core Capabilities

1. **Mechanical Shared-Teardown Labor Overlap Graph**:
   - Detects when shops bill full standalone book time for multiple repairs that share physical teardown access (e.g., *Timing Belt + Water Pump + Serpentine Belt + Thermostat + Coolant Bleed*, *Front Lower Control Arm + Ball Joint*, or *Disc Brake Pads + Rotors on the same axle*).
   - Computes true incremental add-on hours and visualizes the shared physical access steps.
2. **Live US DOT NHTSA Federal Recall & 8yr/80k Warranty Cross-Check**:
   - Decodes 17-digit ISO-3779 VINs via the live **NHTSA vPIC API** (`https://vpic.nhtsa.dot.gov/api/`).
   - Queries live **NHTSA Safety Recalls** (`https://api.nhtsa.gov/recalls/recallsByVehicle`) and **NHTSA ODI Owner Complaints** (`https://api.nhtsa.gov/complaints/complaintsByVehicle`), flagging quoted repairs that are legally covered at **$0.00 customer pay** under federal safety recalls (e.g., `23V858000` Fuel Pump, `24V064000`/`26V332000` Seat Weight Sensor) or the U.S. Clean Air Act 8-year / 80,000-mile Federal Emissions Warranty (`P0420` Catalytic Converters).
3. **Anti-"Parts Cannon" OBD-II DTC Differential Root-Cause Engine**:
   - Built on top of the open-source [`Wal33D/dtc-database`](https://github.com/Wal33D/dtc-database) (18,805 SAE J2012 & manufacturer-specific definitions, MIT License).
   - Provides ranked root-cause probabilities, freeze-frame telemetry signatures (e.g., Short/Long-Term Fuel Trim at idle vs. 2,500 RPM), and 5-minute physical verification tests before authorizing high-cost assemblies.
4. **Actionable Service Advisor Negotiation Script**:
   - Generates a polite, technically grounded script citing NHTSA campaign IDs, shared-teardown labor math, and OEM part benchmarks that drivers can copy or export with one click.

---

## Architecture & Tech Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS v4, Lucide Technical Icons (`Space Grotesk` + `IBM Plex Mono` Service-Bay Blueprint UI).
- **Backend / Serverless API**: `/api/nhtsa` (Vercel Serverless Function + Vite local middleware) integrating live US DOT NHTSA vPIC, Safety Recalls, and ODI Complaints endpoints with graceful verified-snapshot fallback.
- **Testing & QA**: Vitest unit/integration suite (`tests/auditEngine.test.ts`) + Playwright real-browser desktop (`1440×900`) and mobile (`390×844`) end-to-end verification.

---

## Quick Start

```bash
npm install
npm run dev
```

### Run Typecheck, Tests & Production Build

```bash
npm run typecheck
npm test
npm run build
```

---

## Open-Source & Data Credits

- **U.S. Department of Transportation NHTSA APIs**: [vPIC VIN Decoder](https://vpic.nhtsa.dot.gov/api/), [NHTSA Recalls & ODI Complaints API](https://www.nhtsa.gov/nhtsa-datasets-and-apis) (Public Domain / U.S. Government Works).
- **OBD-II DTC Definitions**: Built on top of [`Wal33D/dtc-database`](https://github.com/Wal33D/dtc-database) by Wal33D (MIT License).
