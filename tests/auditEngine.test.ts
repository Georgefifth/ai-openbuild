import { describe, expect, it } from 'vitest';
import {
  parseRawQuoteText,
  runForensicAudit,
  validateVinFormat
} from '../src/engine/auditEngine';
import { DEALERSHIP_PRESETS } from '../src/data/presets';
import { DTC_DATABASE } from '../src/data/dtcDatabase';
import { queryLiveNhtsaData } from '../api/nhtsa';

describe('WrenchTruth Forensic Audit Engine & NHTSA Cross-Checker', () => {
  it('validates ISO-3779 17-character VINs and flags illegal I, O, Q characters with exact position', () => {
    const valid = validateVinFormat('2HKRW2H59LH601234');
    expect(valid.valid).toBe(true);
    expect(valid.normalized).toBe('2HKRW2H59LH601234');

    const badChar = validateVinFormat('2HKRW2I59LH601234');
    expect(badChar.valid).toBe(false);
    expect(badChar.error).toContain("Invalid character 'I' at position 7");

    const shortVin = validateVinFormat('1HGCM82633A');
    expect(shortVin.valid).toBe(false);
    expect(shortVin.error).toContain('11/17');
  });

  it('parses structured and free-form mechanic repair quote lines accurately', () => {
    const raw = [
      '1. Timing Belt & Tensioner Replacement - Parts: $310.00 | Labor: 4.2 hrs @ $170/hr',
      '2. Engine Water Pump Replacement - Parts: $245.00 | Labor: 3.5 hrs @ $170/hr',
      'Front Brake Pads $320'
    ].join('\n');

    const parsed = parseRawQuoteText(raw, 170);
    expect(parsed).toHaveLength(3);
    expect(parsed[0].partPriceQuoted).toBe(310);
    expect(parsed[0].laborHoursQuoted).toBe(4.2);
    expect(parsed[0].laborRateQuoted).toBe(170);
    expect(parsed[1].description).toContain('Water Pump');
    expect(parsed[2].partPriceQuoted).toBeGreaterThan(0);
  });

  it('detects active NHTSA recalls (23V858000 Fuel Pump & 26V332000 Seat Weight Sensor) and suspension labor overlap on Case #01', () => {
    const preset = DEALERSHIP_PRESETS[0]; // 2020 Honda CR-V
    const report = runForensicAudit({
      vehicle: preset.vehicle,
      quoteLines: preset.lines,
      recalls: preset.fallbackRecalls,
      complaintClusters: preset.fallbackComplaints,
      totalComplaintsCount: preset.fallbackTotalComplaints,
      dataSourceMode: 'VERIFIED_SNAPSHOT'
    });

    expect(report.totalQuoted).toBe(3994);
    expect(report.recallCoverageSavings).toBe(1656); // $983 Fuel Pump + $673 Seat Weight Sensor
    expect(report.teardownClusters).toHaveLength(1);
    expect(report.teardownClusters[0].clusterId).toBe('FRONT_SUSPENSION_KNUCKLE');
    expect(report.teardownClusters[0].duplicateHoursEliminated).toBe(2.9);
    expect(report.totalAuditedFair).toBe(1153.5);
    expect(report.totalSavings).toBe(2840.5);
    expect(report.negotiationScript).toContain('23V858000');
    expect(report.negotiationScript).toContain('26V332000');
  });

  it('eliminates 6.6 duplicate teardown hours across Timing Belt + Water Pump + Serpentine Belt + Thermostat + Coolant Flush on Case #02', () => {
    const preset = DEALERSHIP_PRESETS[1]; // 2014 Honda Odyssey V6 Timing
    const report = runForensicAudit({
      vehicle: preset.vehicle,
      quoteLines: preset.lines,
      recalls: preset.fallbackRecalls,
      complaintClusters: preset.fallbackComplaints,
      totalComplaintsCount: preset.fallbackTotalComplaints,
      dataSourceMode: 'VERIFIED_SNAPSHOT'
    });

    expect(report.totalQuoted).toBe(2834);
    expect(report.teardownClusters).toHaveLength(1);
    expect(report.teardownClusters[0].clusterId).toBe('FRONT_TIMING_COVER');
    expect(report.teardownClusters[0].billedCombinedHours).toBe(11.3);
    expect(report.teardownClusters[0].trueCombinedBookHours).toBe(4.7);
    expect(report.teardownClusters[0].duplicateHoursEliminated).toBe(6.6);
    expect(report.teardownClusters[0].dollarOvercharge).toBe(1122);
    expect(report.totalSavings).toBe(1425);
  });

  it('flags 8yr/80k Federal Emissions Warranty on P0420 Catalytic Converter and Front/Rear Brake Pad+Rotor labor overlap on Case #03', () => {
    const preset = DEALERSHIP_PRESETS[2]; // 2019 Toyota RAV4 @ 71,800 mi
    const report = runForensicAudit({
      vehicle: preset.vehicle,
      quoteLines: preset.lines,
      recalls: preset.fallbackRecalls,
      complaintClusters: preset.fallbackComplaints,
      totalComplaintsCount: preset.fallbackTotalComplaints,
      dataSourceMode: 'VERIFIED_SNAPSHOT'
    });

    expect(report.teardownClusters).toHaveLength(2); // FRONT_AXLE_BRAKES + REAR_AXLE_BRAKES
    const catLine = report.lines.find((l) => l.canonicalProcedureId === 'catalytic-converter');
    expect(catLine?.verdict).toBe('RECALL_COVERED');
    expect(catLine?.matchedRecallCampaign).toBe('US-EPA-8YR-80K');
    expect(catLine?.totalAudited).toBe(0);
  });

  it('embeds Wal33D/dtc-database knowledge entries with ranked root causes and 5-minute tests', () => {
    expect(DTC_DATABASE.P0171.trueRootCausesRanked.length).toBeGreaterThanOrEqual(3);
    expect(DTC_DATABASE.P0420.fiveMinuteVerificationTest).toContain('80,000-mile');
  });

  it('queries live US DOT NHTSA API for 2020 Honda CR-V recalls and complaints', async () => {
    const live = await queryLiveNhtsaData({
      vin: '2HKRW2H59LH601234',
      year: 2020,
      make: 'HONDA',
      model: 'CR-V'
    });
    expect(live.source).toBe('LIVE_NHTSA_API');
    expect(live.recalls.length).toBeGreaterThan(0);
    expect(live.totalComplaintsCount).toBeGreaterThan(100);
  }, 15000);
});
