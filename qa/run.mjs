import { chromium, firefox } from "playwright";
import fs from "node:fs";
import path from "node:path";

const BASE = process.env.BASE_URL ?? "http://127.0.0.1:4588";
const OUT = process.env.QA_OUT ?? "evidence/stage-3-qa";
const BROWSER = process.env.BROWSER === "chromium" ? "chromium" : "firefox";
const HEADED = process.env.HEADED === "1";

const SHOTS = path.join(OUT, "screens");
fs.mkdirSync(SHOTS, { recursive: true });

const VIEWPORTS = [
  { name: "desktop", viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 },
  { name: "mobile", viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 },
];

const scenarios = [
  {
    id: "s01-first-visit-and-empty-state",
    title: "Landing page usability, zero horizontal overflow, and actionable empty state recovery",
    async run(page, ctx) {
      await page.goto("/", { waitUntil: "domcontentloaded" });
      await ctx.expectVisible("main");
      ctx.assert((await page.title()).includes("WrenchTruth"), "Title does not contain WrenchTruth");

      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - window.innerWidth,
      );
      ctx.assert(overflow <= 1, `Horizontal overflow detected: ${overflow}px`);
      await ctx.shot("landing");

      // Clear to Blank Ticket (Empty state)
      await page.getByTestId("btn-clear-empty").click();
      await ctx.expectVisible('[data-testid="empty-audit-state"]');
      await ctx.expectText(/No Repair Estimate Loaded Yet/i);
      await ctx.shot("empty-state");

      // Recover from Empty State CTA
      await page.getByTestId("btn-empty-load-default").click();
      await ctx.expectVisible('[data-testid="verdict-summary-card"]');
      await ctx.expectText(/\$2,840\.50\s+Saved/i);
    },
  },
  {
    id: "s02-core-flow-live-nhtsa-audit",
    title: "End-to-end forensic quote audit with live US DOT NHTSA API recall & teardown detection",
    async run(page, ctx) {
      await page.goto("/", { waitUntil: "domcontentloaded" });
      await page.getByTestId("preset-honda-crv-2020").click();
      await page.getByTestId("btn-run-audit").click();

      const badge = page.getByTestId("data-source-badge");
      await badge.waitFor({ state: "visible", timeout: 15000 });
      await page.waitForFunction(
        () => {
          const el = document.querySelector('[data-testid="data-source-badge"]');
          return el && el.textContent && el.textContent.includes("LIVE NHTSA FEDERAL FEED");
        },
        null,
        { timeout: 15000 },
      );

      await ctx.expectText(/23V858000/);
      await ctx.expectText(/-2\.9 DUPLICATE HRS ELIMINATED/);
      await ctx.expectText(/\$2,840\.50\s+Saved\s+\(71%\)/);
      await ctx.shot("live-nhtsa-audit");
    },
  },
  {
    id: "s03-presets-and-counter-offer-toggles",
    title: "Multi-case timing belt teardown graph, interactive line toggles, and script copy",
    async run(page, ctx) {
      await page.goto("/", { waitUntil: "domcontentloaded" });

      // Load Case #02: 2014 Honda Odyssey Timing Belt + Water Pump Overlap
      await page.getByTestId("preset-subaru-outback-timing").click();
      await ctx.expectText(/-6\.6 DUPLICATE HRS ELIMINATED/);
      await ctx.expectText(/\$1,425\.00\s+Saved\s+\(50%\)/);

      const initialAudited = await page.getByTestId("total-audited-amount").textContent();
      ctx.assert(initialAudited?.includes("$1,409.00"), `Expected $1,409.00, got ${initialAudited}`);
      await ctx.shot("case02-timing-overlap");

      // Uncheck Line #1 ($906.00 fair) and verify live counter-offer updates to $503.00
      await page.getByTestId("checkbox-line-1").click();
      const updatedAudited = await page.getByTestId("total-audited-amount").textContent();
      ctx.assert(
        updatedAudited?.includes("$503.00"),
        `Expected counter-offer to drop to $503.00 after unchecking Line 1, got ${updatedAudited}`,
      );

      // Copy Service Advisor Script and verify confirmation toast
      await page.getByTestId("btn-copy-script").click();
      await ctx.expectVisible('[data-testid="copy-success-toast"]');
      await ctx.shot("script-copied-toast");
    },
  },
  {
    id: "s04-validation-and-custom-quote",
    title: "ISO-3779 VIN validation, SAE J2012 DTC validation, and custom quote audit",
    async run(page, ctx) {
      await page.goto("/", { waitUntil: "domcontentloaded" });
      await page.getByTestId("btn-clear-empty").click();

      // Enter invalid VIN containing 'I' at pos 7 and invalid DTC 'Z9999'
      await page.getByTestId("input-vin").fill("2HKRW2I59LH601234");
      await page.getByTestId("input-dtc").fill("Z9999");
      await page.getByTestId("btn-run-audit").click();

      await ctx.expectVisible('[data-testid="error-vin"]');
      await ctx.expectText(/Invalid character 'I' at position 7/);
      await ctx.expectVisible('[data-testid="error-dtc"]');
      await ctx.expectVisible('[data-testid="error-quote"]');
      await ctx.shot("validation-errors", { fullPage: false });

      // Fix inputs & add custom Timing Belt + Water Pump quote lines
      await page.getByTestId("input-vin").fill("5FNRL5H62EB041892");
      await page.getByTestId("input-make").fill("HONDA");
      await page.getByTestId("input-model").fill("ODYSSEY");
      await page.getByTestId("input-dtc").fill("P0128");
      await page
        .getByTestId("textarea-quote")
        .fill(
          "1. Timing Belt & Tensioner Replacement - Parts: $300 | Labor: 4.0 hrs @ $175/hr\n2. Engine Water Pump Replacement - Parts: $220 | Labor: 3.4 hrs @ $175/hr",
        );

      await page.getByTestId("btn-run-audit").click();
      await ctx.expectVisible('[data-testid="verdict-summary-card"]');
      await ctx.expectVisible('[data-testid="teardown-overlap-blueprint"]');
      await ctx.shot("custom-quote-audited");
    },
  },
  {
    id: "s05-dtc-and-nhtsa-dossier-tabs",
    title: "Anti-Parts-Cannon OBD-II DTC explorer and Federal NHTSA Dossier subsystem filter",
    async run(page, ctx) {
      await page.goto("/", { waitUntil: "domcontentloaded" });

      // Switch to Tab 2: DTC Cross-Check
      await page.getByTestId("tab-dtc-checker").click();
      await ctx.expectVisible('[data-testid="dtc-checker-view"]');
      await page.getByTestId("input-dtc-search").fill("P0420");
      await page.getByTestId("dtc-card-P0420").click();
      await ctx.expectText(/Catalyst System Efficiency Below Threshold/i);
      await ctx.expectText(/80,000-mile/i);
      await ctx.shot("dtc-p0420-detail");

      // Switch to Tab 3: Federal NHTSA Dossier
      await page.getByTestId("tab-nhtsa-dossier").click();
      await ctx.expectVisible('[data-testid="nhtsa-dossier-view"]');
      await ctx.expectText(/NHTSA CAMPAIGN #23V858000/i);
      await ctx.shot("nhtsa-dossier");
    },
  },
  {
    id: "s06-keyboard-and-a11y",
    title: "Keyboard focus navigation, form label associations, and >=44px touch targets",
    async run(page, ctx) {
      await page.goto("/", { waitUntil: "domcontentloaded" });

      // Check that primary CTA meets >= 44px touch target requirement
      const box = await page.getByTestId("btn-run-audit").boundingBox();
      ctx.assert(box && box.height >= 44, `Primary CTA height ${box?.height}px is under 44px`);

      // Check that inputs have associated labels
      const vinByLabel = page.getByLabel(/17-Digit Vehicle VIN/i);
      await vinByLabel.waitFor({ state: "visible", timeout: 5000 });

      // Press Tab and verify activeElement advances
      await page.keyboard.press("Tab");
      const activeTag = await page.evaluate(() => document.activeElement?.tagName);
      ctx.assert(Boolean(activeTag && activeTag !== "BODY"), `Tab did not move focus from BODY`);
    },
  },
];

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function expectVisible(page, selector, timeout = 10000) {
  const locator = page.locator(selector).first();
  await locator.waitFor({ state: "visible", timeout });
  return locator;
}

async function expectText(page, text, timeout = 10000) {
  const locator = page.getByText(text).first();
  await locator.waitFor({ state: "visible", timeout });
  return locator;
}

function collectIssues(page) {
  const issues = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") issues.push({ kind: "console", text: msg.text() });
  });
  page.on("pageerror", (err) => {
    issues.push({ kind: "pageerror", text: err.message });
  });
  page.on("requestfailed", (req) => {
    const reason = req.failure()?.errorText ?? "request failed";
    if (!reason.includes("ERR_ABORTED") && !reason.includes("NS_BINDING_ABORTED")) {
      issues.push({ kind: "requestfailed", text: `${reason} ${req.url()}` });
    }
  });
  page.on("response", (res) => {
    const status = res.status();
    if (status >= 500) issues.push({ kind: "http", text: `${status} ${res.url()}` });
    else if (status >= 400) {
      issues.push({ kind: "http", level: "warn", text: `${status} ${res.url()}` });
    }
  });
  return issues;
}

async function main() {
  let browserType = BROWSER === "chromium" ? chromium : firefox;
  let browserName = BROWSER;
  let browser;
  try {
    browser = await browserType.launch({ headless: !HEADED });
  } catch {
    browserType = chromium;
    browserName = "chromium";
    browser = await browserType.launch({ headless: !HEADED });
  }

  const startedAt = new Date().toISOString();
  const results = [];

  for (const vp of VIEWPORTS) {
    const context = await browser.newContext({
      baseURL: BASE,
      viewport: vp.viewport,
      deviceScaleFactor: vp.deviceScaleFactor,
    });

    for (const scenario of scenarios) {
      const page = await context.newPage();
      const issues = collectIssues(page);
      const screenshots = [];
      const started = Date.now();
      let status = "pass";
      let error = null;

      const ctx = {
        assert,
        expectVisible: (selector, timeout) => expectVisible(page, selector, timeout),
        expectText: (text, timeout) => expectText(page, text, timeout),
        shot: async (name, opts = {}) => {
          const file = path.join(SHOTS, `${scenario.id}-${name}-${vp.name}.png`);
          await page.screenshot({ path: file, fullPage: opts.fullPage ?? true });
          screenshots.push(file);
          return file;
        },
      };

      try {
        await scenario.run(page, ctx);
      } catch (err) {
        status = "fail";
        error = err.message;
      } finally {
        await page.close().catch(() => {});
      }

      const errors = issues.filter((i) => (i.level ?? "error") === "error");
      const warnings = issues.filter((i) => i.level === "warn");
      if (status === "pass" && errors.length > 0) {
        status = "fail";
        error = errors.map((i) => `${i.kind}: ${i.text}`).join(" | ");
      }

      results.push({
        viewport: vp.name,
        id: scenario.id,
        title: scenario.title,
        status,
        ms: Date.now() - started,
        error,
        errors,
        warnings,
        screenshots,
      });

      console.log(
        `${status === "pass" ? "✓" : "✗"} [${vp.name}] ${scenario.id}` +
          (error ? ` — ${error}` : ""),
      );
    }

    await context.close();
  }

  await browser.close();

  const summary = {
    total: results.length,
    pass: results.filter((r) => r.status === "pass").length,
    fail: results.filter((r) => r.status === "fail").length,
  };
  const finishedAt = new Date().toISOString();
  const report = {
    base: BASE,
    browser: browserName,
    headed: HEADED,
    startedAt,
    finishedAt,
    summary,
    results,
  };

  fs.writeFileSync(path.join(OUT, "results.json"), JSON.stringify(report, null, 2));

  const warnings = results.flatMap((r) =>
    r.warnings.map((w) => `- [${r.viewport}] ${r.id}: ${w.kind} — ${w.text}`),
  );
  const md = [
    `# QA run — ${finishedAt}`,
    "",
    `- Base URL: ${BASE}`,
    `- Browser: ${browserName} (${HEADED ? "headed" : "headless"})`,
    `- Scenarios: ${summary.total} — ${summary.pass} pass, ${summary.fail} fail`,
    "",
    "| Viewport | Scenario | Status | ms | Detail |",
    "|---|---|---|---|---|",
    ...results.map(
      (r) =>
        `| ${r.viewport} | ${r.id} | ${r.status} | ${r.ms} | ${(r.error ?? "").replace(/\|/g, "\\|")} |`,
    ),
    "",
    ...(warnings.length ? ["## Warnings", "", ...warnings, ""] : []),
    "## Screenshots",
    "",
    ...results.flatMap((r) => r.screenshots.map((s) => `- ${s}`)),
    "",
  ];
  fs.writeFileSync(path.join(OUT, "report.md"), md.join("\n"));

  console.log(`\n${summary.pass}/${summary.total} passed — see ${OUT}/`);
  process.exit(summary.fail > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error(err);
  process.exit(2);
});
