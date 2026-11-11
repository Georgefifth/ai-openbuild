import { chromium } from 'playwright';
import fs from 'node:fs/promises';
import path from 'node:path';

const OUT_DIR = path.resolve('submission/assets');

const THUMBNAIL_HTML = `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@500;600;700&family=Space+Grotesk:wght@700&display=swap" rel="stylesheet" />
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      width: 1200px;
      height: 800px;
      background-color: #F4F1EA;
      background-image:
        linear-gradient(to right, rgba(20, 20, 19, 0.06) 1px, transparent 1px),
        linear-gradient(to bottom, rgba(20, 20, 19, 0.06) 1px, transparent 1px);
      background-size: 32px 32px;
      font-family: 'Space Grotesk', sans-serif;
      color: #141413;
      padding: 44px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      border: 10px solid #141413;
    }
    .mono { font-family: 'IBM Plex Mono', monospace; }
    .top-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 4px solid #141413;
      padding-bottom: 20px;
    }
    .brand {
      display: flex;
      align-items: center;
      gap: 16px;
    }
    .logo-box {
      width: 56px;
      height: 56px;
      background: #141413;
      color: #D94E1F;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 30px;
      font-weight: 700;
      border: 3px solid #141413;
    }
    .stamp {
      background: #D94E1F;
      color: #FFFFFF;
      padding: 8px 16px;
      font-size: 16px;
      font-weight: 700;
      letter-spacing: 0.06em;
      border: 2px solid #141413;
      box-shadow: 3px 3px 0 #141413;
    }
    .hero-grid {
      display: grid;
      grid-template-columns: 1.08fr 0.92fr;
      gap: 32px;
      align-items: stretch;
      margin: 24px 0;
      flex: 1;
    }
    .left-col {
      display: flex;
      flex-direction: column;
      justify-content: center;
      gap: 20px;
    }
    h1 {
      font-size: 62px;
      line-height: 1.02;
      letter-spacing: -0.03em;
      text-transform: uppercase;
    }
    .highlight-orange {
      color: #D94E1F;
    }
    .subtitle {
      font-size: 22px;
      color: #44403C;
      line-height: 1.35;
    }
    .pill-row {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
      margin-top: 6px;
    }
    .pill {
      background: #FFFFFF;
      border: 2px solid #141413;
      box-shadow: 3px 3px 0 #141413;
      padding: 10px 14px;
      font-size: 15px;
      font-weight: 700;
    }
    .right-card {
      background: #1E3A5F;
      color: #FFFFFF;
      border: 4px solid #141413;
      box-shadow: 8px 8px 0 #141413;
      padding: 26px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }
    .diff-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 14px;
    }
    .quote-box {
      background: #2D161E;
      border: 2px solid #F87171;
      padding: 14px;
    }
    .fair-box {
      background: #0D2E1E;
      border: 2px solid #4ADE80;
      padding: 14px;
    }
    .teardown-list {
      background: #142842;
      border: 2px solid #FBBF24;
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    .footer-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-top: 3px solid #141413;
      padding-top: 16px;
      font-size: 15px;
      color: #57534E;
      font-weight: 600;
    }
  </style>
</head>
<body>
  <div class="top-bar">
    <div class="brand">
      <div class="logo-box mono">WT</div>
      <div>
        <div class="mono" style="font-size: 14px; font-weight: 700; color: #D94E1F;">SERVICE BAY FORENSIC WORKBENCH</div>
        <div style="font-size: 24px; font-weight: 700;">WRENCHTRUTH · AI OPENBUILD 2026</div>
      </div>
    </div>
    <div class="stamp mono">SAVES 50%–71% ON DEALER QUOTES</div>
  </div>

  <div class="hero-grid">
    <div class="left-col">
      <h1>STOP PAYING FOR <span class="highlight-orange">DOUBLE-BILLED</span> TEARDOWN LABOR.</h1>
      <p class="subtitle">
        Audits multi-line mechanic repair estimates against <strong>live U.S. DOT NHTSA Safety Recalls</strong>, <strong>Shared-Teardown Mechanical Graphs</strong>, and <strong>18,805 OBD-II DTC Codes</strong>.
      </p>
      <div class="pill-row mono">
        <div class="pill" style="background:#DCFCE7; color:#15803D;">✓ 20/20 REAL-WORLD VALIDATION</div>
        <div class="pill" style="background:#FEF3C7; color:#B45309;">✓ LIVE NHTSA vPIC &amp; RECALL API</div>
        <div class="pill">✓ ZERO-LOGIN PRIVACY</div>
      </div>
    </div>

    <div class="right-card mono">
      <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid rgba(255,255,255,0.2); padding-bottom:10px;">
        <span style="color:#FBBF24; font-size:13px; font-weight:700;">AUDIT CASE #01 · 2020 HONDA CR-V</span>
        <span style="background:#D94E1F; padding:3px 8px; font-size:12px; font-weight:700;">GRADE: F (PADDED)</span>
      </div>

      <div class="diff-row">
        <div class="quote-box">
          <div style="font-size:11px; color:#FCA5A5; font-weight:700;">DEALER ESTIMATE</div>
          <div style="font-size:32px; color:#F87171; font-weight:700; text-decoration:line-through; margin-top:4px;">$3,994.00</div>
          <div style="font-size:11px; color:#E2E8F0; margin-top:4px;">6 Items @ $185/hr</div>
        </div>
        <div class="fair-box">
          <div style="font-size:11px; color:#86EFAC; font-weight:700;">AUDITED FAIR OFFER</div>
          <div style="font-size:32px; color:#4ADE80; font-weight:700; margin-top:4px;">$1,153.50</div>
          <div style="font-size:11px; color:#DCFCE7; margin-top:4px;">$2,840.50 Saved (71%)</div>
        </div>
      </div>

      <div class="teardown-list">
        <div style="color:#FBBF24; font-size:12px; font-weight:700;">FORENSIC DEDUCTIONS APPLIED:</div>
        <div style="font-size:13px; color:#FFFFFF;">1. Fuel Pump Module → <span style="color:#4ADE80; font-weight:700;">$0 (NHTSA 23V858000)</span></div>
        <div style="font-size:13px; color:#FFFFFF;">2. Seat Weight Sensor → <span style="color:#4ADE80; font-weight:700;">$0 (NHTSA 24V064000)</span></div>
        <div style="font-size:13px; color:#FFFFFF;">3. Control Arm + Ball Joint → <span style="color:#FBBF24; font-weight:700;">-2.9h Shared Teardown</span></div>
        <div style="font-size:13px; color:#FFFFFF;">4. BG Chemical Flush → <span style="color:#F87171; font-weight:700;">Declined Upsell (-$280)</span></div>
      </div>
    </div>
  </div>

  <div class="footer-bar mono">
    <span>LIVE DEMO: https://ai-openbuild.vercel.app</span>
    <span>US DOT NHTSA API + Wal33D/dtc-database (MIT)</span>
  </div>
</body>
</html>`;

async function compose3x2GalleryCard(browser, srcImagePath, outImagePath, title, badge, caption) {
  const imgBuf = await fs.readFile(srcImagePath);
  const b64 = imgBuf.toString('base64');
  const page = await browser.newPage({ viewport: { width: 1500, height: 1000 }, deviceScaleFactor: 1 });
  const html = `<!doctype html>
  <html>
  <head>
    <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@600;700&family=Space+Grotesk:wght@700&display=swap" rel="stylesheet" />
    <style>
      * { box-sizing: border-box; margin: 0; padding: 0; }
      body {
        width: 1500px;
        height: 1000px;
        background: #EAE5D9;
        font-family: 'Space Grotesk', sans-serif;
        color: #141413;
        padding: 28px 36px;
        display: flex;
        flex-direction: column;
        gap: 16px;
        border: 8px solid #141413;
      }
      .header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-bottom: 3px solid #141413;
        padding-bottom: 12px;
      }
      .badge {
        font-family: 'IBM Plex Mono', monospace;
        background: #D94E1F;
        color: #FFFFFF;
        padding: 6px 12px;
        font-size: 14px;
        font-weight: 700;
        border: 2px solid #141413;
      }
      .frame {
        flex: 1;
        background: #F4F1EA;
        border: 3px solid #141413;
        box-shadow: 5px 5px 0 #141413;
        overflow: hidden;
        display: flex;
        align-items: flex-start;
        justify-content: center;
      }
      .frame img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        object-position: top center;
      }
      .caption {
        font-family: 'IBM Plex Mono', monospace;
        font-size: 14px;
        color: #141413;
        background: #FFFFFF;
        border: 2px solid #141413;
        padding: 10px 16px;
        display: flex;
        justify-content: space-between;
      }
    </style>
  </head>
  <body>
    <div class="header">
      <div style="font-size: 26px; font-weight: 700; text-transform: uppercase;">${title}</div>
      <div class="badge">${badge}</div>
    </div>
    <div class="frame">
      <img src="data:image/png;base64,${b64}" />
    </div>
    <div class="caption">
      <span>${caption}</span>
      <span style="color:#15803D; font-weight:700;">https://ai-openbuild.vercel.app</span>
    </div>
  </body>
  </html>`;
  await page.setContent(html, { waitUntil: 'networkidle' });
  await page.screenshot({ path: outImagePath, fullPage: false });
  await page.close();
}

async function main() {
  await fs.mkdir(OUT_DIR, { recursive: true });
  const browser = await chromium.launch({ headless: true });

  // 1. Render custom 1200x800 (3:2) Thumbnail
  const thumbPage = await browser.newPage({ viewport: { width: 1200, height: 800 }, deviceScaleFactor: 1 });
  await thumbPage.setContent(THUMBNAIL_HTML, { waitUntil: 'networkidle' });
  await thumbPage.screenshot({ path: path.join(OUT_DIR, 'thumbnail.png'), fullPage: false });
  await thumbPage.close();

  // 2. Render 5 1500x1000 (3:2) Gallery Images
  await compose3x2GalleryCard(
    browser,
    'evidence/stage-3-qa/screens/s02-core-flow-live-nhtsa-audit-live-nhtsa-audit-desktop.png',
    path.join(OUT_DIR, 'gallery-01-workbench-audit.png'),
    'WrenchTruth · Live NHTSA Recall & Shared-Teardown Quote Audit',
    'SAVES $2,840.50 (71%)',
    'Auditing a $3,994 Honda CR-V quote: flags NHTSA Recalls 23V858000 & 24V064000 ($0) and cuts 2.9 duplicate suspension labor hours.'
  );

  await compose3x2GalleryCard(
    browser,
    'evidence/stage-3-qa/screens/s03-presets-and-counter-offer-toggles-case02-timing-overlap-desktop.png',
    path.join(OUT_DIR, 'gallery-02-teardown-blueprint.png'),
    'Shared-Teardown Mechanical Graph · 6.6 Duplicate Hours Eliminated',
    'SAVES $1,425.00 (50%)',
    'Visualizing why Timing Belt, Water Pump, Serpentine Belt, Thermostat & Coolant Bleed share 1 front-engine teardown (4.7h vs 11.3h billed).'
  );

  await compose3x2GalleryCard(
    browser,
    'evidence/stage-3-qa/screens/s05-dtc-and-nhtsa-dossier-tabs-dtc-p0420-detail-desktop.png',
    path.join(OUT_DIR, 'gallery-03-dtc-root-cause.png'),
    'Anti-"Parts Cannon" OBD-II DTC Differential Root-Cause Explorer',
    '18,805 SAE J2012 CODES (MIT)',
    'Cross-checking P0420 & P0171 codes with freeze-frame fuel-trim physics and 8-year / 80,000-mile Federal Emissions Warranty rules.'
  );

  await compose3x2GalleryCard(
    browser,
    'evidence/stage-3.5-validation/val06-ford-explorer-live-browser.png',
    path.join(OUT_DIR, 'gallery-04-nhtsa-dossier.png'),
    'External Validation Case · 2020 Ford Explorer Live NHTSA Audit',
    '33 LIVE NHTSA RECALLS',
    'Catching NHTSA Rear Suspension Toe Link Recall 21V154000 ($0 remedy) and front axle brake pad/rotor labor overlap ($1,043 saved).'
  );

  await compose3x2GalleryCard(
    browser,
    'evidence/stage-4-demo/frames/05-validation-benchmark.png',
    path.join(OUT_DIR, 'gallery-05-validation-benchmark.png'),
    'Stage 3.5 Real-World Validation Benchmark · 20/20 Cases Passed',
    '100% PASS VS 20% BASELINE',
    'Validated across 20 real-world cases and 8 vehicle models with 0% false positives on negative controls and 12/12 Playwright QA runs.'
  );

  await browser.close();

  // 3. Copy demo.mp4 into submission/assets/demo.mp4
  await fs.copyFile('evidence/stage-4-demo/demo.mp4', path.join(OUT_DIR, 'demo.mp4'));
  console.log('Generated all submission assets in submission/assets/');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
