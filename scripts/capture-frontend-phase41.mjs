import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import fs from 'node:fs/promises';
import path from 'node:path';

const OUT_DIR = path.resolve('evidence/stage-2-build/frontend');

async function waitForServer(url, timeoutMs = 15000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(url);
      if (res.ok) return;
    } catch {}
    await new Promise((r) => setTimeout(r, 250));
  }
  throw new Error(`Server at ${url} did not start within ${timeoutMs}ms`);
}

async function main() {
  await fs.mkdir(OUT_DIR, { recursive: true });

  const server = spawn('npx', ['vite', '--port', '4587', '--strictPort', '--host', '127.0.0.1'], {
    stdio: 'ignore'
  });

  try {
    const baseUrl = 'http://127.0.0.1:4587';
    await waitForServer(baseUrl);

    const browser = await chromium.launch({ headless: true });

    // 1. Desktop 1440x900
    const desktopCtx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await desktopCtx.newPage();
    const consoleErrors = [];
    page.on('console', (m) => {
      if (m.type() === 'error') consoleErrors.push(m.text());
    });
    page.on('pageerror', (err) => consoleErrors.push(err.message));

    await page.goto(baseUrl, { waitUntil: 'networkidle' });
    await page.screenshot({ path: path.join(OUT_DIR, '01-desktop-1440-workbench.png'), fullPage: true });

    // Trigger live NHTSA API backend audit on default preset
    await page.getByTestId('btn-run-audit').click();
    await page.waitForSelector('[data-testid="data-source-badge"]:has-text("LIVE NHTSA FEDERAL FEED")', { timeout: 15000 });
    await page.screenshot({ path: path.join(OUT_DIR, '08-desktop-1440-live-backend-audit.png'), fullPage: true });

    // Check Case #02 (Timing belt + Water pump overlap)
    await page.getByTestId('preset-subaru-outback-timing').click();
    await page.screenshot({ path: path.join(OUT_DIR, '02-desktop-1440-timing-overlap.png'), fullPage: true });

    // Check Empty State & Invalid Input State
    await page.getByTestId('btn-clear-empty').click();
    await page.screenshot({ path: path.join(OUT_DIR, '03-desktop-1440-empty-state.png'), fullPage: false });

    await page.getByTestId('input-vin').fill('2HKRW2IO9LH');
    await page.getByTestId('btn-run-audit').click();
    await page.screenshot({ path: path.join(OUT_DIR, '04-desktop-1440-invalid-input.png'), fullPage: false });

    // Restore preset & check Tab 2 (DTC Checker) and Tab 3 (NHTSA Dossier)
    await page.getByTestId('preset-honda-crv-2020').click();
    await page.getByTestId('tab-dtc-checker').click();
    await page.screenshot({ path: path.join(OUT_DIR, '05-desktop-1440-dtc-checker.png'), fullPage: true });

    await page.getByTestId('tab-nhtsa-dossier').click();
    await page.screenshot({ path: path.join(OUT_DIR, '06-desktop-1440-nhtsa-dossier.png'), fullPage: true });

    // 2. Mobile 390x844
    const mobileCtx = await browser.newContext({ viewport: { width: 390, height: 844 } });
    const mPage = await mobileCtx.newPage();
    await mPage.goto(baseUrl, { waitUntil: 'networkidle' });
    const hasHorizScroll = await mPage.evaluate(() => {
      return document.documentElement.scrollWidth > window.innerWidth;
    });
    await mPage.screenshot({ path: path.join(OUT_DIR, '07-mobile-390-workbench.png'), fullPage: true });

    console.log(JSON.stringify({
      status: 'OK',
      consoleErrorsCount: consoleErrors.length,
      consoleErrors,
      mobileHorizontalOverflow: hasHorizScroll
    }, null, 2));

    await browser.close();
  } finally {
    server.kill('SIGTERM');
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
