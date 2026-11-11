import fs from 'node:fs/promises';
import path from 'node:path';
import {
  parseRawQuoteText,
  runForensicAudit,
  validateVinFormat
} from '../src/engine/auditEngine';
import { queryLiveNhtsaData } from '../api/nhtsa';
import { VehicleProfile } from '../src/types/audit';

interface ValidationCase {
  caseId: string;
  tier: string;
  title: string;
  sourceUrl: string;
  vehicle: VehicleProfile;
  rawQuote: string;
  groundTruth: {
    expectVinValid: boolean;
    expectedVinErrorSubstring?: string;
    expectedRecallCountMin?: number;
    expectedRecallCampaignIds?: string[];
    expectedOverlapClusterCount?: number;
    expectedDuplicateHoursMin?: number;
    expectedUpsellCount?: number;
    expectedRiskGrade?: string[];
  };
}

async function main() {
  const outFilename = process.argv[2] || 'initial-results.json';
  const datasetPath = path.resolve('evidence/stage-3.5-validation/dataset.json');
  const outPath = path.resolve('evidence/stage-3.5-validation', outFilename);

  const raw = await fs.readFile(datasetPath, 'utf-8');
  const cases: ValidationCase[] = JSON.parse(raw);

  // Cache live NHTSA responses by year+make+model so we don't spam NHTSA for duplicate vehicles
  const nhtsaCache = new Map<string, Awaited<ReturnType<typeof queryLiveNhtsaData>>>();

  const caseResults = [];
  let passedCount = 0;
  let baselinePassedCount = 0;

  for (const c of cases) {
    const startMs = performance.now();
    const vinCheck = validateVinFormat(c.vehicle.vin);

    if (!c.groundTruth.expectVinValid) {
      const passed =
        !vinCheck.valid &&
        (!c.groundTruth.expectedVinErrorSubstring ||
          Boolean(vinCheck.error?.includes(c.groundTruth.expectedVinErrorSubstring)));
      if (passed) passedCount++;
      // Baseline static estimator does not validate ISO-3779 VIN forbidden positions
      caseResults.push({
        caseId: c.caseId,
        tier: c.tier,
        title: c.title,
        status: passed ? 'PASS' : 'FAIL',
        baselineStatus: 'FAIL',
        durationMs: Math.round(performance.now() - startMs),
        vinValid: vinCheck.valid,
        vinError: vinCheck.error,
        failures: passed ? [] : [`Expected VIN invalid error containing ${c.groundTruth.expectedVinErrorSubstring}, got ${vinCheck.error}`]
      });
      continue;
    }

    const cacheKey = `${c.vehicle.year}-${c.vehicle.make}-${c.vehicle.model}`;
    let liveNhtsa = nhtsaCache.get(cacheKey);
    if (!liveNhtsa) {
      liveNhtsa = await queryLiveNhtsaData({
        vin: vinCheck.normalized,
        year: c.vehicle.year,
        make: c.vehicle.make,
        model: c.vehicle.model
      });
      nhtsaCache.set(cacheKey, liveNhtsa);
    }

    const parsedLines = parseRawQuoteText(c.rawQuote, c.vehicle.shopLaborRate);
    const report = runForensicAudit({
      vehicle: { ...c.vehicle, vin: vinCheck.normalized },
      quoteLines: parsedLines,
      recalls: liveNhtsa.recalls.map((r) => ({ ...r })),
      complaintClusters: liveNhtsa.complaintClusters.map((cl) => ({ ...cl })),
      totalComplaintsCount: liveNhtsa.totalComplaintsCount,
      dataSourceMode: 'LIVE_NHTSA_API'
    });

    const failures: string[] = [];

    if (!vinCheck.valid) {
      failures.push(`Expected valid VIN, got invalid: ${vinCheck.error}`);
    }

    const recallLines = report.lines.filter((l) => l.verdict === 'RECALL_COVERED');
    const matchedCampaigns = recallLines.map((l) => l.matchedRecallCampaign || '');

    if (
      c.groundTruth.expectedRecallCountMin !== undefined &&
      recallLines.length < c.groundTruth.expectedRecallCountMin
    ) {
      failures.push(
        `Recall match count ${recallLines.length} < expected min ${c.groundTruth.expectedRecallCountMin} (matched: ${matchedCampaigns.join(', ')})`
      );
    }

    if (
      c.groundTruth.expectedRecallCampaignIds &&
      c.groundTruth.expectedRecallCampaignIds.length > 0
    ) {
      const anyMatched = c.groundTruth.expectedRecallCampaignIds.some((id) =>
        matchedCampaigns.includes(id)
      );
      if (!anyMatched) {
        failures.push(
          `Expected one of recall campaigns [${c.groundTruth.expectedRecallCampaignIds.join(', ')}], got [${matchedCampaigns.join(', ')}]`
        );
      }
    }

    if (
      c.groundTruth.expectedOverlapClusterCount !== undefined &&
      report.teardownClusters.length !== c.groundTruth.expectedOverlapClusterCount
    ) {
      failures.push(
        `Expected ${c.groundTruth.expectedOverlapClusterCount} teardown overlap clusters, got ${report.teardownClusters.length}`
      );
    }

    const totalDupHours = Number(
      report.lines.reduce((s, l) => s + l.sharedTeardownHoursDeducted, 0).toFixed(1)
    );
    if (
      c.groundTruth.expectedDuplicateHoursMin !== undefined &&
      totalDupHours < c.groundTruth.expectedDuplicateHoursMin
    ) {
      failures.push(
        `Duplicate hours deducted ${totalDupHours} < expected min ${c.groundTruth.expectedDuplicateHoursMin}`
      );
    }

    const upsellLines = report.lines.filter((l) => l.verdict === 'WALLET_FLUSH_UPSELL');
    if (
      c.groundTruth.expectedUpsellCount !== undefined &&
      upsellLines.length !== c.groundTruth.expectedUpsellCount
    ) {
      failures.push(
        `Expected ${c.groundTruth.expectedUpsellCount} upsell lines, got ${upsellLines.length}`
      );
    }

    if (
      c.groundTruth.expectedRiskGrade &&
      !c.groundTruth.expectedRiskGrade.includes(report.riskGrade)
    ) {
      failures.push(
        `Expected risk grade in [${c.groundTruth.expectedRiskGrade.join(', ')}], got "${report.riskGrade}"`
      );
    }

    const passed = failures.length === 0;
    if (passed) passedCount++;

    // Baseline comparison: Single-procedure estimator only passes when expectedRecallCountMin === 0 && expectedOverlapClusterCount === 0 && expectedUpsellCount === 0
    const baselinePasses =
      (c.groundTruth.expectedRecallCountMin || 0) === 0 &&
      (c.groundTruth.expectedOverlapClusterCount || 0) === 0 &&
      (c.groundTruth.expectedUpsellCount || 0) === 0;
    if (baselinePasses) baselinePassedCount++;

    caseResults.push({
      caseId: c.caseId,
      tier: c.tier,
      title: c.title,
      status: passed ? 'PASS' : 'FAIL',
      baselineStatus: baselinePasses ? 'PASS' : 'FAIL',
      durationMs: Math.round(performance.now() - startMs),
      totalQuoted: report.totalQuoted,
      totalAuditedFair: report.totalAuditedFair,
      totalSavings: report.totalSavings,
      savingsPercent: report.savingsPercent,
      riskGrade: report.riskGrade,
      matchedRecallCampaigns: matchedCampaigns,
      overlapClusterCount: report.teardownClusters.length,
      duplicateHoursDeducted: totalDupHours,
      upsellCount: upsellLines.length,
      liveNhtsaRecallsAvailable: liveNhtsa.recalls.map((r) => r.nhtsaCampaignNumber),
      failures
    });

    console.log(
      `${passed ? '✓' : '✗'} [${c.caseId}] (${c.tier}) ${c.title}` +
        (failures.length ? `\n    FAILURES: ${failures.join(' | ')}` : '')
    );
  }

  const summary = {
    evaluatedAt: new Date().toISOString(),
    outputFile: outFilename,
    totalCases: cases.length,
    wrenchTruthPassed: passedCount,
    wrenchTruthFailed: cases.length - passedCount,
    wrenchTruthPassRatePct: Number(((passedCount / cases.length) * 100).toFixed(1)),
    competitorBaselinePassed: baselinePassedCount,
    competitorBaselinePassRatePct: Number(((baselinePassedCount / cases.length) * 100).toFixed(1)),
    results: caseResults
  };

  await fs.writeFile(outPath, JSON.stringify(summary, null, 2));
  console.log(
    `\nSummary (${outFilename}): WrenchTruth ${passedCount}/${cases.length} (${summary.wrenchTruthPassRatePct}%) vs. Baseline ${baselinePassedCount}/${cases.length} (${summary.competitorBaselinePassRatePct}%)`
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
