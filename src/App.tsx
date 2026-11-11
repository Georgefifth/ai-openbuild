import React, { useState, useMemo } from 'react';
import {
  Wrench,
  ShieldAlert,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Copy,
  Check,
  Search,
  RefreshCw,
  FileText,
  Layers,
  Cpu,
  Download,
  Plus,
  Trash2,
  RotateCcw,
  Upload,
  ArrowRight
} from 'lucide-react';
import { DEALERSHIP_PRESETS, DealershipCasePreset } from './data/presets';
import { DTC_DATABASE, DTC_LIST } from './data/dtcDatabase';
import {
  parseRawQuoteText,
  runForensicAudit,
  validateVinFormat
} from './engine/auditEngine';
import { fetchVehicleNhtsaIntelligence } from './services/nhtsaService';
import { ForensicAuditReport, QuoteLineInput, VehicleProfile } from './types/audit';

type ActiveTab = 'WORKBENCH' | 'DTC_CHECKER' | 'NHTSA_DOSSIER';

export function App() {
  const initialPreset = DEALERSHIP_PRESETS[0];

  const [activeTab, setActiveTab] = useState<ActiveTab>('WORKBENCH');
  const [selectedPresetId, setSelectedPresetId] = useState<string>(initialPreset.id);
  const [vehicle, setVehicle] = useState<VehicleProfile>(initialPreset.vehicle);
  const [rawQuoteText, setRawQuoteText] = useState<string>(initialPreset.rawQuoteText);
  const [dtcInputText, setDtcInputText] = useState<string>(initialPreset.vehicle.dtcCodes.join(', '));

  // Audit execution states
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingStageText, setLoadingStageText] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{ vin?: string; quote?: string; dtc?: string }>({});
  const [isEmptyIntake, setIsEmptyIntake] = useState<boolean>(false);

  // Initial synchronous audit report so first-time visitors immediately see the signature workbench in action
  const [auditReport, setAuditReport] = useState<ForensicAuditReport | null>(() =>
    runForensicAudit({
      vehicle: initialPreset.vehicle,
      quoteLines: initialPreset.lines,
      recalls: initialPreset.fallbackRecalls.map((r) => ({ ...r })),
      complaintClusters: initialPreset.fallbackComplaints.map((c) => ({ ...c })),
      totalComplaintsCount: initialPreset.fallbackTotalComplaints,
      dataSourceMode: 'VERIFIED_SNAPSHOT',
      nhtsaLatencyMs: 42
    })
  );

  // Interactive line-item inclusion overrides (user can toggle items in/out of their Counter-Offer)
  const [excludedLineIds, setExcludedLineIds] = useState<Record<string, boolean>>({});
  const [copiedBanner, setCopiedBanner] = useState<boolean>(false);

  // DTC Checker tab state
  const [selectedDtcCode, setSelectedDtcCode] = useState<string>('P0171');
  const [dtcSearchQuery, setDtcSearchQuery] = useState<string>('');

  // NHTSA Dossier filter state
  const [complaintSubsystemFilter, setComplaintSubsystemFilter] = useState<string>('ALL');

  const currentPreset: DealershipCasePreset = useMemo(
    () => DEALERSHIP_PRESETS.find((p) => p.id === selectedPresetId) || DEALERSHIP_PRESETS[0],
    [selectedPresetId]
  );

  const handleLoadPreset = (preset: DealershipCasePreset) => {
    setSelectedPresetId(preset.id);
    setVehicle({ ...preset.vehicle });
    setRawQuoteText(preset.rawQuoteText);
    setDtcInputText(preset.vehicle.dtcCodes.join(', '));
    setFieldErrors({});
    setErrorMessage(null);
    setIsEmptyIntake(false);
    setExcludedLineIds({});

    const nextReport = runForensicAudit({
      vehicle: preset.vehicle,
      quoteLines: preset.lines.map((l) => ({ ...l })),
      recalls: preset.fallbackRecalls.map((r) => ({ ...r })),
      complaintClusters: preset.fallbackComplaints.map((c) => ({ ...c })),
      totalComplaintsCount: preset.fallbackTotalComplaints,
      dataSourceMode: 'VERIFIED_SNAPSHOT',
      nhtsaLatencyMs: 38
    });
    setAuditReport(nextReport);
  };

  const handleClearToEmptyState = () => {
    setIsEmptyIntake(true);
    setAuditReport(null);
    setErrorMessage(null);
    setFieldErrors({});
    setRawQuoteText('');
    setDtcInputText('');
    setVehicle({
      vin: '',
      year: 2020,
      make: '',
      model: '',
      mileage: 60000,
      shopLaborRate: 175,
      dtcCodes: []
    });
  };

  const handleRunForensicAudit = async (options?: {
    forceMock?: boolean;
    simulateError?: boolean;
  }) => {
    setErrorMessage(null);
    const nextFieldErrors: { vin?: string; quote?: string; dtc?: string } = {};

    const vinCheck = validateVinFormat(vehicle.vin);
    if (!vinCheck.valid) {
      nextFieldErrors.vin = vinCheck.error;
    }

    const parsedLines: QuoteLineInput[] = parseRawQuoteText(
      rawQuoteText,
      vehicle.shopLaborRate || 175
    );
    if (parsedLines.length === 0) {
      nextFieldErrors.quote =
        'Repair estimate is empty. Paste at least 1 mechanic line item (e.g., "Timing Belt Replacement - Parts: $310 | Labor: 4.2 hrs @ $170/hr") or load a Dealership Case Preset above.';
    }

    const parsedDtcs = dtcInputText
      .split(/[,;\s]+/)
      .map((s) => s.trim().toUpperCase())
      .filter(Boolean);

    const invalidDtc = parsedDtcs.find((code) => !/^[PBCU][0-9A-F]{4}$/.test(code));
    if (invalidDtc) {
      nextFieldErrors.dtc = `Invalid OBD-II code format "${invalidDtc}". Standard SAE J2012 codes start with P, B, C, or U followed by 4 hex digits (e.g., P0171, P0420, B0001).`;
    }

    if (Object.keys(nextFieldErrors).length > 0) {
      setFieldErrors(nextFieldErrors);
      return;
    }

    setFieldErrors({});
    setIsEmptyIntake(false);
    setIsLoading(true);
    setLoadingStageText('Stage 1/3 · Decoding 17-digit VIN & querying NHTSA Recalls / ODI Complaints...');

    try {
      const updatedVehicle: VehicleProfile = {
        ...vehicle,
        vin: vinCheck.normalized,
        dtcCodes: parsedDtcs
      };

      const nhtsaData = await fetchVehicleNhtsaIntelligence(
        updatedVehicle,
        currentPreset.fallbackRecalls,
        currentPreset.fallbackComplaints,
        currentPreset.fallbackTotalComplaints,
        {
          forceMock: options?.forceMock,
          simulateNetworkError: options?.simulateError
        }
      );

      setLoadingStageText('Stage 2/3 · Computing Mechanical Shared-Teardown Labor Overlap Graph...');
      await new Promise((r) => setTimeout(r, 90));

      const mergedVehicle: VehicleProfile = {
        ...updatedVehicle,
        ...nhtsaData.vehiclePatch
      };
      setVehicle(mergedVehicle);

      setLoadingStageText('Stage 3/3 · Auditing OEM Part Markups & generating Service Advisor Script...');
      await new Promise((r) => setTimeout(r, 60));

      const report = runForensicAudit({
        vehicle: mergedVehicle,
        quoteLines: parsedLines,
        recalls: nhtsaData.recalls,
        complaintClusters: nhtsaData.complaintClusters,
        totalComplaintsCount: nhtsaData.totalComplaintsCount,
        dataSourceMode: nhtsaData.source,
        nhtsaLatencyMs: nhtsaData.latencyMs
      });

      setExcludedLineIds({});
      setAuditReport(report);
    } catch (err) {
      setErrorMessage(
        err instanceof Error
          ? err.message
          : 'Unexpected error while auditing quote. Use Verified Local Snapshot to continue.'
      );
    } finally {
      setIsLoading(false);
      setLoadingStageText('');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const content = String(reader.result || '').trim();
      if (!content) {
        setErrorMessage('Uploaded file was empty. Paste quote lines or upload a valid .txt/.csv/.json quote.');
        return;
      }
      setRawQuoteText(content);
      setIsEmptyIntake(false);
      setFieldErrors((prev) => ({ ...prev, quote: undefined }));
    };
    reader.readAsText(file);
  };

  const toggleLineInclusion = (lineId: string, defaultIncluded: boolean) => {
    setExcludedLineIds((prev) => {
      const currentExcluded = prev[lineId] ?? !defaultIncluded;
      return { ...prev, [lineId]: !currentExcluded };
    });
  };

  // Dynamically recalculated totals when user toggles line items
  const liveCounterOfferMetrics = useMemo(() => {
    if (!auditReport) return null;
    let activeAuditedTotal = 0;
    auditReport.lines.forEach((line) => {
      const isExcluded = excludedLineIds[line.id] ?? !line.includedInCounterOffer;
      if (!isExcluded) {
        activeAuditedTotal += line.totalAudited;
      }
    });
    const totalSaved = Math.max(0, auditReport.totalQuoted - activeAuditedTotal);
    const savedPct =
      auditReport.totalQuoted > 0
        ? Math.round((totalSaved / auditReport.totalQuoted) * 100)
        : 0;
    return {
      activeAuditedTotal: Number(activeAuditedTotal.toFixed(2)),
      totalSaved: Number(totalSaved.toFixed(2)),
      savedPct
    };
  }, [auditReport, excludedLineIds]);

  const handleCopyScript = async () => {
    if (!auditReport) return;
    try {
      await navigator.clipboard.writeText(auditReport.negotiationScript);
    } catch {
      // Fallback for headless environments
    }
    setCopiedBanner(true);
    setTimeout(() => setCopiedBanner(false), 3500);
  };

  const handleDownloadWorkOrder = () => {
    if (!auditReport || !liveCounterOfferMetrics) return;
    const blob = new Blob(
      [
        `WRENCHTRUTH FORENSIC WORK ORDER AUDIT\n` +
          `Vehicle: ${auditReport.vehicle.year} ${auditReport.vehicle.make} ${auditReport.vehicle.model} (VIN: ${auditReport.vehicle.vin})\n` +
          `Original Shop Quote: $${auditReport.totalQuoted.toFixed(2)}\n` +
          `Audited Fair Counter-Offer: $${liveCounterOfferMetrics.activeAuditedTotal.toFixed(2)}\n` +
          `Total Verified Savings: $${liveCounterOfferMetrics.totalSaved.toFixed(2)} (${liveCounterOfferMetrics.savedPct}%)\n\n` +
          `--- SERVICE ADVISOR NEGOTIATION SCRIPT ---\n` +
          auditReport.negotiationScript
      ],
      { type: 'text/plain;charset=utf-8' }
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `WrenchTruth-Audit-${auditReport.vehicle.vin}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const filteredDtcList = useMemo(() => {
    const q = dtcSearchQuery.trim().toLowerCase();
    if (!q) return DTC_LIST;
    return DTC_LIST.filter(
      (d) =>
        d.code.toLowerCase().includes(q) ||
        d.officialDefinition.toLowerCase().includes(q) ||
        d.commonMisdiagnosis.toLowerCase().includes(q)
    );
  }, [dtcSearchQuery]);

  const activeDtcDetail = useMemo(
    () => DTC_DATABASE[selectedDtcCode] || DTC_LIST[0],
    [selectedDtcCode]
  );

  return (
    <div className="min-h-screen flex flex-col bg-[#F4F1EA] text-[#141413] blueprint-grid">
      {/* Top Industrial Shop-Ticket Header */}
      <header className="border-b-2 border-[#141413] bg-[#EAE5D9] z-30">
        <div className="max-w-[1400px] mx-auto px-3 sm:px-6 py-3 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
          <div className="flex items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 bg-[#141413] text-[#F4F1EA] flex items-center justify-center border-2 border-[#141413] shrink-0">
                <Wrench className="w-6 h-6 text-[#D94E1F]" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-display text-xl sm:text-2xl font-bold tracking-tight uppercase">
                    WrenchTruth
                  </span>
                  <span className="stamp-badge text-[11px] px-2 py-0.5 bg-[#D94E1F] text-white">
                    BAY SPEC v2.6
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-[#57534E] font-medium">
                  Forensic Mechanic Quote Auditor · Shared-Teardown Labor Graph · Live NHTSA Recall Cross-Checker
                </p>
              </div>
            </div>
          </div>

          {/* Primary Navigation Mode Tabs */}
          <nav
            aria-label="Workbench Views"
            className="grid grid-cols-1 sm:grid-cols-3 gap-2 w-full lg:w-auto"
          >
            <button
              type="button"
              data-testid="tab-workbench"
              onClick={() => setActiveTab('WORKBENCH')}
              className={`min-h-[44px] px-3.5 py-2 text-xs sm:text-sm font-mono-tech font-semibold border-2 border-[#141413] flex items-center justify-center gap-2 transition-colors cursor-pointer ${
                activeTab === 'WORKBENCH'
                  ? 'bg-[#141413] text-[#F4F1EA]'
                  : 'bg-white text-[#141413] hover:bg-[#F4F1EA]'
              }`}
            >
              <FileSpreadsheet className="w-4 h-4 shrink-0 text-[#D94E1F]" />
              <span>1. Quote Audit Workbench</span>
            </button>

            <button
              type="button"
              data-testid="tab-dtc-checker"
              onClick={() => setActiveTab('DTC_CHECKER')}
              className={`min-h-[44px] px-3.5 py-2 text-xs sm:text-sm font-mono-tech font-semibold border-2 border-[#141413] flex items-center justify-center gap-2 transition-colors cursor-pointer ${
                activeTab === 'DTC_CHECKER'
                  ? 'bg-[#141413] text-[#F4F1EA]'
                  : 'bg-white text-[#141413] hover:bg-[#F4F1EA]'
              }`}
            >
              <Cpu className="w-4 h-4 shrink-0 text-[#D94E1F]" />
              <span>2. OBD-II DTC Cross-Check</span>
            </button>

            <button
              type="button"
              data-testid="tab-nhtsa-dossier"
              onClick={() => setActiveTab('NHTSA_DOSSIER')}
              className={`min-h-[44px] px-3.5 py-2 text-xs sm:text-sm font-mono-tech font-semibold border-2 border-[#141413] flex items-center justify-center gap-2 transition-colors cursor-pointer ${
                activeTab === 'NHTSA_DOSSIER'
                  ? 'bg-[#141413] text-[#F4F1EA]'
                  : 'bg-white text-[#141413] hover:bg-[#F4F1EA]'
              }`}
            >
              <ShieldAlert className="w-4 h-4 shrink-0 text-[#D94E1F]" />
              <span>
                3. Federal NHTSA Dossier ({auditReport?.recalls.length ?? currentPreset.fallbackRecalls.length})
              </span>
            </button>
          </nav>
        </div>

        {/* Stateless Privacy & Telemetry Status Sub-Bar */}
        <div className="border-t border-[#C8C1B4] bg-[#F4F1EA] px-3 sm:px-6 py-1.5">
          <div className="max-w-[1400px] mx-auto flex flex-wrap items-center justify-between gap-2 text-xs font-mono-tech text-[#57534E]">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 font-semibold text-[#15803D]">
                <span className="w-2 h-2 rounded-full bg-[#15803D]" />
                ZERO-LOGIN STATELESS PRIVACY: VIN Never Sold to Insurers
              </span>
              <span className="hidden md:inline">|</span>
              <span className="hidden md:inline">
                Data Sources: US DOT NHTSA vPIC & Recalls API + Wal33D/dtc-database (18,805 SAE J2012 Codes, MIT)
              </span>
            </div>
            {auditReport && (
              <div className="flex items-center gap-2">
                <span
                  data-testid="data-source-badge"
                  className={`px-2 py-0.5 text-[11px] font-semibold border ${
                    auditReport.dataSourceMode === 'LIVE_NHTSA_API'
                      ? 'bg-[#DCFCE7] text-[#15803D] border-[#15803D]'
                      : 'bg-[#FEF3C7] text-[#B45309] border-[#B45309]'
                  }`}
                >
                  {auditReport.dataSourceMode === 'LIVE_NHTSA_API'
                    ? `LIVE NHTSA FEDERAL FEED (${auditReport.nhtsaLatencyMs ?? 110}ms)`
                    : `VERIFIED NHTSA SNAPSHOT (${auditReport.nhtsaLatencyMs ?? 42}ms)`}
                </span>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Container */}
      <main className="flex-1 max-w-[1400px] w-full mx-auto px-3 sm:px-6 py-5 space-y-6">
        {/* Real Dealership Case Presets Strip */}
        <section
          aria-label="Verified Dealership Quote Cases"
          className="work-order-card p-3.5 sm:p-4 bg-white"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 mb-3 border-b border-[#D6D0C4]">
            <div>
              <span className="stamp-badge text-xs text-[#D94E1F] block">
                STEP 1 · LOAD REAL DEALERSHIP ESTIMATE OR ENTER YOUR OWN WORK ORDER
              </span>
              <h1 className="font-display text-lg sm:text-xl font-bold text-[#141413]">
                Stop Paying for Double-Billed Teardown Labor & Recall-Covered Repairs
              </h1>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                data-testid="btn-clear-empty"
                onClick={handleClearToEmptyState}
                className="min-h-[44px] px-3 py-1.5 text-xs font-mono-tech font-semibold border border-[#141413] bg-[#F4F1EA] hover:bg-[#EAE5D9] flex items-center gap-1.5 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Clear to Blank Ticket</span>
              </button>
              <label className="min-h-[44px] px-3 py-1.5 text-xs font-mono-tech font-semibold border border-[#141413] bg-white hover:bg-[#F4F1EA] flex items-center gap-1.5 cursor-pointer">
                <Upload className="w-3.5 h-3.5 text-[#D94E1F]" />
                <span>Upload Quote (.txt/.csv)</span>
                <input
                  type="file"
                  accept=".txt,.csv,.json"
                  onChange={handleFileUpload}
                  className="sr-only"
                  data-testid="input-upload-quote"
                />
              </label>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
            {DEALERSHIP_PRESETS.map((preset) => {
              const isSelected = !isEmptyIntake && selectedPresetId === preset.id;
              return (
                <button
                  key={preset.id}
                  type="button"
                  data-testid={`preset-${preset.id}`}
                  onClick={() => handleLoadPreset(preset)}
                  className={`min-h-[68px] text-left p-3 border-2 transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'border-[#141413] bg-[#FEF3C7]/60 shadow-[2px_2px_0px_#141413]'
                      : 'border-[#C8C1B4] bg-[#F4F1EA]/60 hover:border-[#141413] hover:bg-white'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="font-mono-tech text-[11px] font-bold px-1.5 py-0.5 bg-[#141413] text-[#F4F1EA]">
                        {preset.badge}
                      </span>
                      {isSelected && (
                        <span className="font-mono-tech text-[11px] font-bold text-[#D94E1F]">
                          ACTIVE TICKET
                        </span>
                      )}
                    </div>
                    <div className="font-display font-bold text-sm text-[#141413]">
                      {preset.title}
                    </div>
                  </div>
                  <p className="text-xs text-[#57534E] mt-1 line-clamp-2">{preset.subtitle}</p>
                </button>
              );
            })}
          </div>
        </section>

        {/* Global Error Banner (with Retry / Fallback recovery) */}
        {errorMessage && (
          <div
            role="alert"
            data-testid="error-banner"
            className="border-2 border-[#B91C1C] bg-[#FEE2E2] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
          >
            <div className="flex items-start gap-3">
              <XCircle className="w-5 h-5 text-[#B91C1C] shrink-0 mt-0.5" />
              <div>
                <div className="font-mono-tech text-xs font-bold uppercase text-[#B91C1C]">
                  TELEMETRY / PARSER FAULT DETECTED
                </div>
                <p className="text-sm text-[#141413] font-medium mt-0.5">{errorMessage}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                data-testid="btn-recover-snapshot"
                onClick={() => handleRunForensicAudit({ forceMock: true })}
                className="min-h-[44px] px-3.5 py-2 bg-[#141413] text-white font-mono-tech text-xs font-semibold cursor-pointer hover:bg-[#333]"
              >
                Use Verified Local Snapshot
              </button>
            </div>
          </div>
        )}

        {/* Loading Progress State */}
        {isLoading && (
          <div
            role="status"
            data-testid="loading-banner"
            className="border-2 border-[#141413] bg-[#FEF3C7] p-4 flex items-center gap-3"
          >
            <RefreshCw className="w-5 h-5 text-[#D94E1F] animate-spin shrink-0" />
            <div className="flex-1">
              <div className="font-mono-tech text-xs font-bold uppercase text-[#141413]">
                EXECUTING FORENSIC WORK ORDER AUDIT...
              </div>
              <div className="text-sm font-mono-tech text-[#57534E] mt-0.5">
                {loadingStageText}
              </div>
            </div>
          </div>
        )}

        {/* TAB 1: QUOTE AUDIT WORKBENCH */}
        {activeTab === 'WORKBENCH' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column (5 cols on lg): Vehicle & Repair Estimate Intake Form */}
            <section
              aria-label="Service Work Order Intake"
              className="lg:col-span-5 work-order-card bg-white p-4 sm:p-5 space-y-4"
            >
              <div className="flex items-center justify-between border-b-2 border-[#141413] pb-2.5">
                <div>
                  <span className="stamp-badge text-[11px] text-[#57534E]">
                    SERVICE BAY INTAKE FORM
                  </span>
                  <h2 className="font-display text-lg font-bold uppercase">
                    Vehicle & Shop Quote Input
                  </h2>
                </div>
                <span className="font-mono-tech text-xs px-2 py-1 bg-[#EAE5D9] border border-[#141413] font-semibold">
                  ISO-3779 VIN
                </span>
              </div>

              {/* VIN Field */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label
                    htmlFor="vin-input"
                    className="font-mono-tech text-xs font-bold uppercase text-[#141413]"
                  >
                    17-Digit Vehicle VIN *
                  </label>
                  <span
                    data-testid="vin-length-counter"
                    className={`font-mono-tech text-xs font-semibold ${
                      vehicle.vin.trim().length === 17 ? 'text-[#15803D]' : 'text-[#B45309]'
                    }`}
                  >
                    {vehicle.vin.trim().length}/17 chars
                  </span>
                </div>
                <input
                  id="vin-input"
                  data-testid="input-vin"
                  type="text"
                  maxLength={17}
                  value={vehicle.vin}
                  onChange={(e) => {
                    const val = e.target.value.toUpperCase();
                    setVehicle((prev) => ({ ...prev, vin: val }));
                    if (fieldErrors.vin) setFieldErrors((prev) => ({ ...prev, vin: undefined }));
                  }}
                  placeholder="e.g. 2HKRW2H59LH601234"
                  className={`w-full min-h-[44px] px-3 py-2 font-mono-tech text-sm uppercase bg-[#F4F1EA] border-2 ${
                    fieldErrors.vin ? 'border-[#B91C1C] bg-[#FEE2E2]/40' : 'border-[#141413]'
                  }`}
                />
                {fieldErrors.vin && (
                  <p
                    data-testid="error-vin"
                    className="mt-1.5 text-xs font-mono-tech font-semibold text-[#B91C1C] flex items-center gap-1"
                  >
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                    <span>{fieldErrors.vin}</span>
                  </p>
                )}
              </div>

              {/* Vehicle Specs Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                <div>
                  <label
                    htmlFor="year-input"
                    className="block font-mono-tech text-[11px] font-bold uppercase text-[#57534E] mb-1"
                  >
                    Model Year
                  </label>
                  <input
                    id="year-input"
                    data-testid="input-year"
                    type="number"
                    inputMode="numeric"
                    value={vehicle.year}
                    onChange={(e) =>
                      setVehicle((prev) => ({ ...prev, year: Number(e.target.value) || 2020 }))
                    }
                    className="w-full min-h-[44px] px-2.5 py-1.5 font-mono-tech text-sm bg-[#F4F1EA] border border-[#141413]"
                  />
                </div>
                <div>
                  <label
                    htmlFor="make-input"
                    className="block font-mono-tech text-[11px] font-bold uppercase text-[#57534E] mb-1"
                  >
                    Make
                  </label>
                  <input
                    id="make-input"
                    data-testid="input-make"
                    type="text"
                    value={vehicle.make}
                    onChange={(e) =>
                      setVehicle((prev) => ({ ...prev, make: e.target.value.toUpperCase() }))
                    }
                    placeholder="HONDA"
                    className="w-full min-h-[44px] px-2.5 py-1.5 font-mono-tech text-sm uppercase bg-[#F4F1EA] border border-[#141413]"
                  />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label
                    htmlFor="model-input"
                    className="block font-mono-tech text-[11px] font-bold uppercase text-[#57534E] mb-1"
                  >
                    Model
                  </label>
                  <input
                    id="model-input"
                    data-testid="input-model"
                    type="text"
                    value={vehicle.model}
                    onChange={(e) =>
                      setVehicle((prev) => ({ ...prev, model: e.target.value.toUpperCase() }))
                    }
                    placeholder="CR-V"
                    className="w-full min-h-[44px] px-2.5 py-1.5 font-mono-tech text-sm uppercase bg-[#F4F1EA] border border-[#141413]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label
                    htmlFor="mileage-input"
                    className="block font-mono-tech text-[11px] font-bold uppercase text-[#57534E] mb-1"
                  >
                    Odometer (Miles)
                  </label>
                  <input
                    id="mileage-input"
                    data-testid="input-mileage"
                    type="number"
                    inputMode="numeric"
                    value={vehicle.mileage}
                    onChange={(e) =>
                      setVehicle((prev) => ({
                        ...prev,
                        mileage: Math.max(0, Number(e.target.value) || 0)
                      }))
                    }
                    className="w-full min-h-[44px] px-2.5 py-1.5 font-mono-tech text-sm bg-[#F4F1EA] border border-[#141413]"
                  />
                </div>
                <div>
                  <label
                    htmlFor="rate-input"
                    className="block font-mono-tech text-[11px] font-bold uppercase text-[#57534E] mb-1"
                  >
                    Shop Labor Rate ($/hr)
                  </label>
                  <input
                    id="rate-input"
                    data-testid="input-labor-rate"
                    type="number"
                    inputMode="decimal"
                    value={vehicle.shopLaborRate}
                    onChange={(e) =>
                      setVehicle((prev) => ({
                        ...prev,
                        shopLaborRate: Math.max(50, Number(e.target.value) || 175)
                      }))
                    }
                    className="w-full min-h-[44px] px-2.5 py-1.5 font-mono-tech text-sm bg-[#F4F1EA] border border-[#141413]"
                  />
                </div>
              </div>

              {/* Optional OBD-II DTC Input */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label
                    htmlFor="dtc-input"
                    className="font-mono-tech text-xs font-bold uppercase text-[#141413]"
                  >
                    OBD-II Fault Codes (Optional)
                  </label>
                  <span className="font-mono-tech text-[11px] text-[#57534E]">
                    e.g. P0171, P0420, B0001
                  </span>
                </div>
                <input
                  id="dtc-input"
                  data-testid="input-dtc"
                  type="text"
                  value={dtcInputText}
                  onChange={(e) => {
                    setDtcInputText(e.target.value.toUpperCase());
                    if (fieldErrors.dtc) setFieldErrors((prev) => ({ ...prev, dtc: undefined }));
                  }}
                  placeholder="P0171, B0001"
                  className={`w-full min-h-[44px] px-3 py-2 font-mono-tech text-sm uppercase bg-[#F4F1EA] border ${
                    fieldErrors.dtc ? 'border-2 border-[#B91C1C] bg-[#FEE2E2]/40' : 'border-[#141413]'
                  }`}
                />
                {fieldErrors.dtc && (
                  <p
                    data-testid="error-dtc"
                    className="mt-1.5 text-xs font-mono-tech font-semibold text-[#B91C1C] flex items-center gap-1"
                  >
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                    <span>{fieldErrors.dtc}</span>
                  </p>
                )}
              </div>

              {/* Mechanic Quote Line Items Textarea */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label
                    htmlFor="quote-textarea"
                    className="font-mono-tech text-xs font-bold uppercase text-[#141413]"
                  >
                    Itemized Mechanic Quote Lines *
                  </label>
                  <button
                    type="button"
                    data-testid="btn-add-sample-line"
                    onClick={() => {
                      const nextLine = `Engine Water Pump Replacement - Parts: $220.00 | Labor: 3.4 hrs @ $${vehicle.shopLaborRate}/hr`;
                      setRawQuoteText((prev) => (prev ? `${prev}\n${nextLine}` : nextLine));
                      setFieldErrors((prev) => ({ ...prev, quote: undefined }));
                    }}
                    className="min-h-[36px] px-2 py-1 text-[11px] font-mono-tech font-semibold bg-[#EAE5D9] border border-[#141413] hover:bg-white flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add Water Pump Line</span>
                  </button>
                </div>
                <textarea
                  id="quote-textarea"
                  data-testid="textarea-quote"
                  rows={8}
                  value={rawQuoteText}
                  onChange={(e) => {
                    setRawQuoteText(e.target.value);
                    if (fieldErrors.quote) setFieldErrors((prev) => ({ ...prev, quote: undefined }));
                  }}
                  placeholder={`Paste mechanic estimate lines here, one per line:\n1. Timing Belt Replacement - Parts: $310 | Labor: 4.2 hrs @ $170/hr\n2. Water Pump Replacement - Parts: $245 | Labor: 3.5 hrs @ $170/hr`}
                  className={`w-full p-3 font-mono-tech text-xs leading-relaxed bg-[#F4F1EA] border-2 ${
                    fieldErrors.quote ? 'border-[#B91C1C] bg-[#FEE2E2]/40' : 'border-[#141413]'
                  }`}
                />
                {fieldErrors.quote && (
                  <p
                    data-testid="error-quote"
                    className="mt-1.5 text-xs font-mono-tech font-semibold text-[#B91C1C] flex items-center gap-1"
                  >
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                    <span>{fieldErrors.quote}</span>
                  </p>
                )}
              </div>

              {/* Primary CTA Button (One Primary Action on Page) */}
              <div className="pt-1 space-y-2">
                <button
                  type="button"
                  data-testid="btn-run-audit"
                  disabled={isLoading}
                  onClick={() => handleRunForensicAudit()}
                  className="w-full min-h-[48px] px-4 py-3 bg-[#D94E1F] hover:bg-[#B83D14] disabled:opacity-60 text-white font-display font-bold text-base uppercase tracking-wide border-2 border-[#141413] shadow-[3px_3px_0px_#141413] flex items-center justify-center gap-2 cursor-pointer transition-all"
                >
                  <Wrench className="w-5 h-5" />
                  <span>
                    {isLoading ? 'Auditing Quote & NHTSA Records...' : 'Run Forensic Quote Audit'}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </section>

            {/* Right Column (7 cols on lg): Audited Work Order Diff, Shared-Teardown Graph & Negotiation Script */}
            <section
              aria-label="Forensic Audit Verdict and Work Order Diff"
              className="lg:col-span-7 space-y-6"
            >
              {/* Empty / First Intake State when cleared */}
              {!auditReport && (
                <div
                  data-testid="empty-audit-state"
                  className="work-order-card p-6 sm:p-8 bg-white text-center space-y-4"
                >
                  <div className="w-12 h-12 mx-auto bg-[#EAE5D9] border-2 border-[#141413] flex items-center justify-center">
                    <FileSpreadsheet className="w-6 h-6 text-[#D94E1F]" />
                  </div>
                  <div className="space-y-1 max-w-lg mx-auto">
                    <span className="stamp-badge text-xs text-[#D94E1F]">
                      READY FOR WORK ORDER INTAKE
                    </span>
                    <h3 className="font-display text-xl font-bold">
                      No Repair Estimate Loaded Yet
                    </h3>
                    <p className="text-sm text-[#57534E]">
                      Enter a 17-character VIN and paste your shop&apos;s repair lines on the left, or load a verified dealership estimate below to inspect double-billed teardown labor and active federal recalls.
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                    <button
                      type="button"
                      data-testid="btn-empty-load-default"
                      onClick={() => handleLoadPreset(DEALERSHIP_PRESETS[0])}
                      className="min-h-[44px] px-4 py-2 bg-[#141413] text-[#F4F1EA] font-mono-tech text-xs font-semibold border-2 border-[#141413] cursor-pointer hover:bg-[#333]"
                    >
                      Load 2020 Honda CR-V Dealer Quote ($3,485)
                    </button>
                    <button
                      type="button"
                      onClick={() => handleLoadPreset(DEALERSHIP_PRESETS[1])}
                      className="min-h-[44px] px-4 py-2 bg-white text-[#141413] font-mono-tech text-xs font-semibold border-2 border-[#141413] cursor-pointer hover:bg-[#F4F1EA]"
                    >
                      Load 2014 Odyssey Timing Overlap ($2,690)
                    </button>
                  </div>
                </div>
              )}

              {auditReport && liveCounterOfferMetrics && (
                <>
                  {/* 1. Stamped Forensic Verdict Summary Card */}
                  <div
                    data-testid="verdict-summary-card"
                    className="work-order-card p-4 sm:p-5 bg-white space-y-4"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b-2 border-[#141413]">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="stamp-badge text-xs px-2 py-0.5 bg-[#B91C1C] text-white">
                            FORENSIC AUDIT VERDICT: {auditReport.riskGrade}
                          </span>
                          <span className="font-mono-tech text-xs text-[#57534E]">
                            VIN: {auditReport.vehicle.vin} · {auditReport.vehicle.year}{' '}
                            {auditReport.vehicle.make} {auditReport.vehicle.model}
                          </span>
                        </div>
                        <h2 className="font-display text-xl sm:text-2xl font-bold mt-1">
                          Potential Overcharge Detected:{' '}
                          <span
                            data-testid="total-savings-amount"
                            className="text-[#15803D] underline decoration-2"
                          >
                            ${liveCounterOfferMetrics.totalSaved.toLocaleString('en-US', {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2
                            })}{' '}
                            Saved ({liveCounterOfferMetrics.savedPct}%)
                          </span>
                        </h2>
                      </div>
                    </div>

                    {/* Top 3 Financial Comparison Boxes */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="p-3 bg-[#FEE2E2]/50 border-2 border-[#B91C1C]">
                        <div className="font-mono-tech text-[11px] font-bold uppercase text-[#B91C1C]">
                          ORIGINAL SHOP ESTIMATE
                        </div>
                        <div
                          data-testid="total-quoted-amount"
                          className="font-mono-tech text-2xl font-bold text-[#B91C1C] line-through mt-0.5"
                        >
                          ${auditReport.totalQuoted.toLocaleString('en-US', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2
                          })}
                        </div>
                        <div className="text-xs text-[#57534E] mt-1">
                          {auditReport.lines.length} line items @ ${auditReport.vehicle.shopLaborRate}/hr
                        </div>
                      </div>

                      <div className="p-3 bg-[#DCFCE7]/60 border-2 border-[#15803D]">
                        <div className="font-mono-tech text-[11px] font-bold uppercase text-[#15803D]">
                          AUDITED FAIR COUNTER-OFFER
                        </div>
                        <div
                          data-testid="total-audited-amount"
                          className="font-mono-tech text-2xl font-bold text-[#15803D] mt-0.5"
                        >
                          ${liveCounterOfferMetrics.activeAuditedTotal.toLocaleString('en-US', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2
                          })}
                        </div>
                        <div className="text-xs text-[#141413] font-medium mt-1">
                          Shared-teardown adjusted & recalls removed
                        </div>
                      </div>

                      <div className="p-3 bg-[#FEF3C7]/70 border-2 border-[#141413]">
                        <div className="font-mono-tech text-[11px] font-bold uppercase text-[#141413]">
                          SAVINGS BREAKDOWN
                        </div>
                        <div className="mt-1 space-y-0.5 font-mono-tech text-xs">
                          <div className="flex justify-between">
                            <span>Free Recall/Warranty:</span>
                            <span className="font-bold text-[#15803D]">
                              -${auditReport.recallCoverageSavings.toFixed(0)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Duplicate Labor Cut:</span>
                            <span className="font-bold text-[#15803D]">
                              -${auditReport.laborOverlapSavings.toFixed(0)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Upsells & Part Trim:</span>
                            <span className="font-bold text-[#15803D]">
                              -$
                              {(
                                auditReport.upsellEliminationSavings + auditReport.partMarkupSavings
                              ).toFixed(0)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 2. SIGNATURE ELEMENT: Shared-Teardown Mechanical Labor Overlap Blueprint */}
                  {auditReport.teardownClusters.length > 0 && (
                    <div
                      data-testid="teardown-overlap-blueprint"
                      className="work-order-card p-4 sm:p-5 bg-[#1E3A5F] text-[#F4F1EA] space-y-3"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/20 pb-2.5">
                        <div className="flex items-center gap-2">
                          <Layers className="w-5 h-5 text-[#FBBF24] shrink-0" />
                          <div>
                            <span className="stamp-badge text-[11px] text-[#FBBF24] block">
                              SIGNATURE FORENSIC SCHEMATIC · SHARED MECHANICAL TEARDOWN GRAPH
                            </span>
                            <h3 className="font-display text-base sm:text-lg font-bold text-white">
                              Why You Are Being Double-Billed for Book-Time Labor
                            </h3>
                          </div>
                        </div>
                        <span className="font-mono-tech text-xs px-2.5 py-1 bg-[#D94E1F] text-white font-bold">
                          -{auditReport.teardownClusters.reduce((s, c) => s + c.duplicateHoursEliminated, 0).toFixed(1)} DUPLICATE HRS ELIMINATED
                        </span>
                      </div>

                      {auditReport.teardownClusters.map((cluster) => (
                        <div
                          key={cluster.clusterId}
                          className="bg-[#142842] border border-white/25 p-3.5 space-y-3"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <div className="font-display font-bold text-sm text-[#FBBF24]">
                              Assembly Zone: {cluster.clusterTitle}
                            </div>
                            <div className="font-mono-tech text-xs">
                              Shop Billed:{' '}
                              <span className="line-through text-red-300 font-bold">
                                {cluster.billedCombinedHours} hrs
                              </span>{' '}
                              → True Combined Book Time:{' '}
                              <span className="text-emerald-300 font-bold">
                                {cluster.trueCombinedBookHours} hrs
                              </span>{' '}
                              (Saves ${cluster.dollarOvercharge.toFixed(0)})
                            </div>
                          </div>

                          {/* Visual Teardown Access Path Steps */}
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                            {cluster.sharedPhysicalAccessSteps.map((step, i) => (
                              <div
                                key={i}
                                className="p-2.5 bg-white/10 border border-white/15 text-xs font-mono-tech flex items-start gap-2"
                              >
                                <span className="px-1.5 py-0.5 bg-[#FBBF24] text-[#141413] font-bold text-[10px] shrink-0">
                                  ACCESS {i + 1}
                                </span>
                                <span className="text-white/90">{step}</span>
                              </div>
                            ))}
                          </div>

                          <div className="text-xs text-white/85 font-mono-tech flex flex-wrap items-center gap-2 pt-1">
                            <span className="text-[#FBBF24] font-semibold">
                              Overlapping Quoted Procedures:
                            </span>
                            {cluster.involvedNames.map((name, idx) => (
                              <span
                                key={idx}
                                className="px-2 py-0.5 bg-white/10 border border-white/20 text-white"
                              >
                                {name}
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* 3. Line-by-Line Redline Work Order Diff */}
                  <div
                    data-testid="work-order-diff-list"
                    className="work-order-card p-4 sm:p-5 bg-white space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b-2 border-[#141413] pb-2.5">
                      <div>
                        <span className="stamp-badge text-[11px] text-[#57534E]">
                          LINE-BY-LINE REDLINE WORK ORDER DIFF
                        </span>
                        <h3 className="font-display text-lg font-bold uppercase">
                          Audited Repair Line Items ({auditReport.lines.length})
                        </h3>
                      </div>
                      <span className="text-xs font-mono-tech text-[#57534E]">
                        Uncheck any line item to exclude it from your Counter-Offer
                      </span>
                    </div>

                    <div className="space-y-3">
                      {auditReport.lines.map((item, idx) => {
                        const isIncluded = !(
                          excludedLineIds[item.id] ?? !item.includedInCounterOffer
                        );

                        let badgeBg = 'bg-[#DCFCE7] text-[#15803D] border-[#15803D]';
                        if (item.verdict === 'RECALL_COVERED') {
                          badgeBg = 'bg-[#FEE2E2] text-[#B91C1C] border-[#B91C1C]';
                        } else if (item.verdict === 'LABOR_OVERLAP' || item.verdict === 'PART_MARKUP') {
                          badgeBg = 'bg-[#FEF3C7] text-[#B45309] border-[#B45309]';
                        } else if (item.verdict === 'WALLET_FLUSH_UPSELL') {
                          badgeBg = 'bg-[#141413] text-[#F4F1EA] border-[#141413]';
                        }

                        return (
                          <div
                            key={item.id}
                            data-testid={`audit-line-${idx + 1}`}
                            className={`work-order-subcard p-3.5 transition-colors ${
                              isIncluded ? 'bg-white' : 'bg-[#F4F1EA]/70 opacity-85'
                            }`}
                          >
                            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                              <div className="flex items-start gap-2.5">
                                <input
                                  type="checkbox"
                                  id={`toggle-${item.id}`}
                                  data-testid={`checkbox-line-${idx + 1}`}
                                  checked={isIncluded}
                                  onChange={() =>
                                    toggleLineInclusion(item.id, item.includedInCounterOffer)
                                  }
                                  className="mt-1 w-5 h-5 accent-[#D94E1F] cursor-pointer shrink-0"
                                />
                                <div>
                                  <div className="flex items-center gap-1.5 flex-wrap">
                                    <span className="font-mono-tech text-xs font-bold text-[#57534E]">
                                      LINE #{idx + 1} · {item.subsystem}
                                    </span>
                                    <span
                                      className={`stamp-badge text-[10px] px-2 py-0.5 border ${badgeBg}`}
                                    >
                                      {item.verdictLabel}
                                    </span>
                                  </div>
                                  <label
                                    htmlFor={`toggle-${item.id}`}
                                    className="font-display font-bold text-base text-[#141413] cursor-pointer block mt-0.5"
                                  >
                                    {item.originalDescription}
                                  </label>
                                </div>
                              </div>

                              {/* Price Diff Column */}
                              <div className="sm:text-right font-mono-tech shrink-0 flex sm:flex-col items-center sm:items-end justify-between border-t sm:border-t-0 pt-2 sm:pt-0 border-[#D6D0C4]">
                                <div className="text-xs text-[#57534E]">
                                  Quoted:{' '}
                                  <span className="line-through text-[#B91C1C] font-semibold">
                                    ${item.totalQuoted.toFixed(2)}
                                  </span>
                                </div>
                                <div className="text-base font-bold text-[#15803D]">
                                  Fair: ${item.totalAudited.toFixed(2)}
                                </div>
                                {item.potentialSavings > 0 && (
                                  <div className="text-[11px] font-bold text-[#D94E1F]">
                                    Save ${item.potentialSavings.toFixed(2)}
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Granular Parts & Labor Hours Breakdown Row */}
                            <div className="mt-2.5 pt-2.5 border-t border-[#EAE5D9] grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono-tech">
                              <div className="bg-[#F4F1EA] px-2.5 py-1.5 border border-[#D6D0C4]">
                                <span className="text-[#57534E]">PARTS: </span>
                                <span
                                  className={
                                    item.partPriceQuoted > item.partPriceAudited
                                      ? 'line-through text-[#B91C1C]'
                                      : ''
                                  }
                                >
                                  ${item.partPriceQuoted.toFixed(0)} quoted
                                </span>
                                {' → '}
                                <span className="font-bold text-[#15803D]">
                                  ${item.partPriceAudited.toFixed(0)} audited
                                </span>
                                <span className="text-[#57534E]">
                                  {' '}
                                  (OEM/OES range ${item.partPriceFairMin}–${item.partPriceFairMax})
                                </span>
                              </div>

                              <div className="bg-[#F4F1EA] px-2.5 py-1.5 border border-[#D6D0C4]">
                                <span className="text-[#57534E]">LABOR: </span>
                                <span
                                  className={
                                    item.laborHoursQuoted > item.laborHoursAudited
                                      ? 'line-through text-[#B91C1C]'
                                      : ''
                                  }
                                >
                                  {item.laborHoursQuoted} hrs billed
                                </span>
                                {' → '}
                                <span className="font-bold text-[#15803D]">
                                  {item.laborHoursAudited} hrs true book
                                </span>
                                {item.sharedTeardownHoursDeducted > 0 && (
                                  <span className="text-[#D94E1F] font-semibold">
                                    {' '}
                                    (-{item.sharedTeardownHoursDeducted} hrs overlap)
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Forensic Explanation */}
                            <p className="mt-2 text-xs sm:text-sm text-[#141413] leading-relaxed bg-[#EAE5D9]/50 p-2.5 border-l-4 border-[#141413]">
                              {item.forensicReasoning}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* 4. Service Advisor Negotiation Script Card */}
                  <div
                    data-testid="negotiation-script-card"
                    className="work-order-card p-4 sm:p-5 bg-white space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b-2 border-[#141413] pb-2.5">
                      <div>
                        <span className="stamp-badge text-[11px] text-[#D94E1F]">
                          STEP 3 · ACTIONABLE COUNTER-OFFER SCRIPT
                        </span>
                        <h3 className="font-display text-lg font-bold uppercase">
                          Service Advisor Negotiation Script
                        </h3>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          data-testid="btn-copy-script"
                          onClick={handleCopyScript}
                          className="min-h-[44px] px-3.5 py-2 bg-[#141413] hover:bg-[#333] text-[#F4F1EA] font-mono-tech text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                        >
                          {copiedBanner ? (
                            <>
                              <Check className="w-4 h-4 text-[#4ADE80]" />
                              <span>Copied to Clipboard!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-4 h-4 text-[#D94E1F]" />
                              <span>Copy Advisor Script</span>
                            </>
                          )}
                        </button>

                        <button
                          type="button"
                          data-testid="btn-download-workorder"
                          onClick={handleDownloadWorkOrder}
                          className="min-h-[44px] px-3.5 py-2 bg-white hover:bg-[#F4F1EA] text-[#141413] border-2 border-[#141413] font-mono-tech text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                        >
                          <Download className="w-4 h-4" />
                          <span>Export Audited Sheet (.txt)</span>
                        </button>
                      </div>
                    </div>

                    {copiedBanner && (
                      <div
                        role="status"
                        data-testid="copy-success-toast"
                        className="p-2.5 bg-[#DCFCE7] border border-[#15803D] text-[#15803D] font-mono-tech text-xs font-semibold flex items-center gap-2"
                      >
                        <CheckCircle2 className="w-4 h-4 shrink-0" />
                        <span>
                          Copied negotiation script to clipboard — ready to text or read to your service advisor (saves ${liveCounterOfferMetrics.totalSaved.toFixed(2)}).
                        </span>
                      </div>
                    )}

                    <pre
                      data-testid="negotiation-script-text"
                      className="p-3.5 bg-[#F4F1EA] border border-[#141413] font-mono-tech text-xs leading-relaxed whitespace-pre-wrap text-[#141413]"
                    >
                      {auditReport.negotiationScript}
                    </pre>
                  </div>
                </>
              )}
            </section>
          </div>
        )}

        {/* TAB 2: OBD-II DTC & ROOT-CAUSE CROSS-CHECK */}
        {activeTab === 'DTC_CHECKER' && (
          <section
            aria-label="OBD-II DTC Differential Root Cause Explorer"
            data-testid="dtc-checker-view"
            className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start"
          >
            <div className="lg:col-span-4 work-order-card p-4 sm:p-5 bg-white space-y-4">
              <div className="border-b-2 border-[#141413] pb-2.5">
                <span className="stamp-badge text-[11px] text-[#D94E1F]">
                  WAL33D / SAE J2012 DIAGNOSTIC LIBRARY
                </span>
                <h2 className="font-display text-lg font-bold uppercase">
                  Anti-&ldquo;Parts Cannon&rdquo; DTC Lookup
                </h2>
                <p className="text-xs text-[#57534E] mt-0.5">
                  Select a Diagnostic Trouble Code to see why shops misdiagnose it and how to verify the true root cause in 5 minutes.
                </p>
              </div>

              <div>
                <label
                  htmlFor="dtc-search-input"
                  className="block font-mono-tech text-xs font-bold uppercase mb-1"
                >
                  Filter by Code or Symptom
                </label>
                <div className="relative">
                  <input
                    id="dtc-search-input"
                    data-testid="input-dtc-search"
                    type="text"
                    value={dtcSearchQuery}
                    onChange={(e) => setDtcSearchQuery(e.target.value)}
                    placeholder="Search P0171, P0420, lean, catalyst..."
                    className="w-full min-h-[44px] pl-3 pr-9 py-2 font-mono-tech text-xs bg-[#F4F1EA] border-2 border-[#141413]"
                  />
                  <Search className="w-4 h-4 text-[#57534E] absolute right-3 top-3" />
                </div>
              </div>

              <div className="space-y-2">
                {filteredDtcList.map((entry) => {
                  const isActive = entry.code === activeDtcDetail.code;
                  return (
                    <button
                      key={entry.code}
                      type="button"
                      data-testid={`dtc-card-${entry.code}`}
                      onClick={() => setSelectedDtcCode(entry.code)}
                      className={`w-full min-h-[52px] p-3 text-left border-2 transition-colors cursor-pointer flex items-center justify-between gap-2 ${
                        isActive
                          ? 'bg-[#141413] text-[#F4F1EA] border-[#141413]'
                          : 'bg-[#F4F1EA] text-[#141413] border-[#C8C1B4] hover:bg-white'
                      }`}
                    >
                      <div>
                        <div className="font-mono-tech text-sm font-bold flex items-center gap-2">
                          <span className="text-[#D94E1F]">{entry.code}</span>
                          <span className="text-xs opacity-80">· {entry.system}</span>
                        </div>
                        <div className="text-xs font-medium line-clamp-1 mt-0.5">
                          {entry.officialDefinition}
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 shrink-0" />
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="lg:col-span-8 work-order-card p-4 sm:p-6 bg-white space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b-2 border-[#141413] pb-3">
                <div>
                  <span className="stamp-badge text-xs px-2 py-0.5 bg-[#141413] text-[#F4F1EA]">
                    {activeDtcDetail.code} · {activeDtcDetail.oemScope}
                  </span>
                  <h3 className="font-display text-xl sm:text-2xl font-bold mt-1.5">
                    {activeDtcDetail.officialDefinition}
                  </h3>
                </div>
                <div className="p-2.5 bg-[#FEE2E2] border border-[#B91C1C] font-mono-tech text-xs text-[#B91C1C]">
                  <div className="font-bold uppercase">Typical &ldquo;Parts Cannon&rdquo; Trap:</div>
                  <div className="font-semibold">
                    {activeDtcDetail.highCostPartsCannon} (${activeDtcDetail.highCostEstimate})
                  </div>
                </div>
              </div>

              <div className="p-3.5 bg-[#FEF3C7] border-l-4 border-[#B45309] space-y-1">
                <div className="font-mono-tech text-xs font-bold uppercase text-[#B45309]">
                  WHY SHOPS MISDIAGNOSE {activeDtcDetail.code}
                </div>
                <p className="text-sm text-[#141413]">{activeDtcDetail.commonMisdiagnosis}</p>
              </div>

              <div className="space-y-3">
                <h4 className="font-display text-base font-bold uppercase">
                  Physics-Informed Differential Probability & Sensor Telemetry Signatures
                </h4>
                {activeDtcDetail.trueRootCausesRanked.map((rc, i) => (
                  <div
                    key={i}
                    className="work-order-subcard p-3.5 bg-[#F4F1EA] space-y-1.5"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <div className="font-display font-bold text-sm text-[#141413]">
                        #{i + 1} · {rc.cause}
                      </div>
                      <div className="flex items-center gap-2 font-mono-tech text-xs">
                        <span className="px-2 py-0.5 bg-[#15803D] text-white font-bold">
                          {rc.probabilityPct}% Probability
                        </span>
                        <span className="px-2 py-0.5 bg-white border border-[#141413] font-semibold">
                          Fair Part: {rc.typicalPartCost}
                        </span>
                      </div>
                    </div>
                    <p className="font-mono-tech text-xs text-[#57534E]">
                      <strong>OBD-II Freeze-Frame / PID Proof:</strong> {rc.telemetrySignature}
                    </p>
                  </div>
                ))}
              </div>

              <div className="p-4 bg-[#DCFCE7]/60 border-2 border-[#15803D] space-y-1.5">
                <div className="font-mono-tech text-xs font-bold uppercase text-[#15803D]">
                  5-MINUTE VERIFICATION TEST BEFORE BUYING PARTS
                </div>
                <p className="text-sm font-medium text-[#141413]">
                  {activeDtcDetail.fiveMinuteVerificationTest}
                </p>
              </div>
            </div>
          </section>
        )}

        {/* TAB 3: LIVE NHTSA FEDERAL RECALL & COMPLAINT DOSSIER */}
        {activeTab === 'NHTSA_DOSSIER' && (
          <section
            aria-label="Live NHTSA Federal Safety Recalls and Owner Complaints"
            data-testid="nhtsa-dossier-view"
            className="space-y-6"
          >
            <div className="work-order-card p-4 sm:p-5 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="stamp-badge text-xs text-[#D94E1F]">
                  US DOT NHTSA SAFERCAR / ODI FEDERAL RECORD INTEGRATION
                </span>
                <h2 className="font-display text-xl font-bold mt-0.5">
                  {vehicle.year} {vehicle.make} {vehicle.model} (VIN: {vehicle.vin || 'N/A'})
                </h2>
                <p className="text-xs sm:text-sm text-[#57534E]">
                  Showing{' '}
                  <strong>
                    {(auditReport?.recalls || currentPreset.fallbackRecalls).length} Federal Safety Recalls
                  </strong>{' '}
                  and{' '}
                  <strong>
                    {auditReport?.totalComplaintsCount ?? currentPreset.fallbackTotalComplaints} ODI Owner Defect Reports
                  </strong>{' '}
                  on file for this vehicle configuration.
                </p>
              </div>

              <button
                type="button"
                data-testid="btn-refresh-nhtsa"
                disabled={isLoading}
                onClick={() => handleRunForensicAudit()}
                className="min-h-[44px] px-4 py-2 bg-[#D94E1F] hover:bg-[#B83D14] text-white font-mono-tech text-xs font-bold uppercase border-2 border-[#141413] flex items-center gap-2 cursor-pointer shrink-0"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                <span>Scan Live NHTSA Federal Records</span>
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
              {/* Left: Mandatory Free Safety Recalls */}
              <div className="work-order-card p-4 sm:p-5 bg-white space-y-3">
                <div className="border-b-2 border-[#141413] pb-2">
                  <span className="stamp-badge text-[11px] text-[#B91C1C]">
                    MANDATORY DEALER FREE REMEDY ($0 PARTS & LABOR)
                  </span>
                  <h3 className="font-display text-lg font-bold uppercase">
                    NHTSA Safety Recall Campaigns (
                    {(auditReport?.recalls || currentPreset.fallbackRecalls).length})
                  </h3>
                </div>

                {(auditReport?.recalls || currentPreset.fallbackRecalls).map((rec) => (
                  <div
                    key={rec.nhtsaCampaignNumber}
                    data-testid={`recall-item-${rec.nhtsaCampaignNumber}`}
                    className="work-order-subcard p-3.5 bg-[#F4F1EA] space-y-2"
                  >
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <span className="font-mono-tech text-xs font-bold px-2 py-0.5 bg-[#B91C1C] text-white">
                        NHTSA CAMPAIGN #{rec.nhtsaCampaignNumber}
                      </span>
                      <span className="font-mono-tech text-xs text-[#57534E]">
                        Filed: {rec.reportReceivedDate}
                      </span>
                    </div>
                    <div className="font-display font-bold text-sm text-[#141413]">
                      {rec.component}
                    </div>
                    <p className="text-xs text-[#141413] leading-relaxed">{rec.summary}</p>
                    <div className="p-2 bg-[#DCFCE7] border border-[#15803D] text-xs font-mono-tech text-[#15803D]">
                      <strong>Free Remedy:</strong> {rec.remedy}
                    </div>
                  </div>
                ))}
              </div>

              {/* Right: NHTSA ODI Owner Complaint Clusters */}
              <div className="work-order-card p-4 sm:p-5 bg-white space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b-2 border-[#141413] pb-2">
                  <div>
                    <span className="stamp-badge text-[11px] text-[#B45309]">
                      REAL OWNER DEFECT REPORTS (ODI DATABASE)
                    </span>
                    <h3 className="font-display text-lg font-bold uppercase">
                      High-Frequency Failure Clusters
                    </h3>
                  </div>
                  <select
                    aria-label="Filter Complaint Subsystem"
                    data-testid="select-complaint-filter"
                    value={complaintSubsystemFilter}
                    onChange={(e) => setComplaintSubsystemFilter(e.target.value)}
                    className="min-h-[44px] px-2.5 py-1 font-mono-tech text-xs bg-[#F4F1EA] border border-[#141413]"
                  >
                    <option value="ALL">All Subsystems</option>
                    {(auditReport?.complaintClusters || currentPreset.fallbackComplaints).map(
                      (c) => (
                        <option key={c.component} value={c.component}>
                          {c.component} ({c.count})
                        </option>
                      )
                    )}
                  </select>
                </div>

                {(auditReport?.complaintClusters || currentPreset.fallbackComplaints)
                  .filter(
                    (c) =>
                      complaintSubsystemFilter === 'ALL' ||
                      c.component === complaintSubsystemFilter
                  )
                  .map((cluster) => (
                    <div
                      key={cluster.component}
                      className="work-order-subcard p-3.5 bg-[#F4F1EA] space-y-2"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-display font-bold text-sm text-[#141413]">
                          {cluster.component}
                        </span>
                        <span className="font-mono-tech text-xs font-bold px-2 py-0.5 bg-[#FEF3C7] border border-[#B45309] text-[#B45309]">
                          {cluster.count} Federal Reports ({cluster.crashCount} Crashes)
                        </span>
                      </div>
                      {cluster.sampleSummaries.map((s) => (
                        <blockquote
                          key={s.odiNumber}
                          className="p-2.5 bg-white border-l-4 border-[#141413] text-xs text-[#141413] space-y-1"
                        >
                          <div className="font-mono-tech text-[11px] font-semibold text-[#57534E]">
                            NHTSA ODI #{s.odiNumber} · Incident Date: {s.dateOfIncident}
                          </div>
                          <p className="leading-relaxed">&ldquo;{s.summary}&rdquo;</p>
                        </blockquote>
                      ))}
                    </div>
                  ))}
              </div>
            </div>
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t-2 border-[#141413] bg-[#EAE5D9] mt-8 py-4 px-3 sm:px-6 text-xs font-mono-tech text-[#57534E]">
        <div className="max-w-[1400px] mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <strong>WrenchTruth</strong> · Built for AI OpenBuild 2026 · Open-Source Credits: US DOT NHTSA vPIC/Recalls/ODI APIs &amp; Wal33D/dtc-database (MIT)
          </div>
          <div>
            Disclaimer: Forensic estimates use standard mechanical teardown graphs &amp; federal recall records; always verify physical vehicle condition with an ASE-certified technician.
          </div>
        </div>
      </footer>
    </div>
  );
}
