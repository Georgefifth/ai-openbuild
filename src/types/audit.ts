export type LineItemVerdict =
  | 'FAIR_ESSENTIAL'
  | 'LABOR_OVERLAP'
  | 'RECALL_COVERED'
  | 'PART_MARKUP'
  | 'WALLET_FLUSH_UPSELL'
  | 'DTC_MISMATCH';

export interface QuoteLineInput {
  id: string;
  description: string;
  partPriceQuoted: number;
  laborHoursQuoted: number;
  laborRateQuoted: number;
  category?: string;
}

export interface VehicleProfile {
  vin: string;
  year: number;
  make: string;
  model: string;
  trim?: string;
  engine?: string;
  transmission?: string;
  mileage: number;
  shopLaborRate: number;
  dtcCodes: string[];
}

export interface AuditedLineItem {
  id: string;
  originalDescription: string;
  canonicalProcedureId: string;
  canonicalName: string;
  subsystem: 'Engine & Timing' | 'Steering & Suspension' | 'Brakes & Hydraulic' | 'Fuel & Emissions' | 'Electrical & Airbag' | 'Transmission & Drivetrain' | 'Fluids & Preventive' | 'Diagnostic & Shop Fees';
  verdict: LineItemVerdict;
  verdictLabel: string;
  safetyPriority: 'CRITICAL_SAFETY' | 'REQUIRED_SOON' | 'OPTIONAL_MAINTENANCE' | 'UNNECESSARY_UPSELL';
  // Quoted numbers
  partPriceQuoted: number;
  laborHoursQuoted: number;
  laborRateQuoted: number;
  totalQuoted: number;
  // Audited benchmark numbers
  partPriceFairMin: number;
  partPriceFairMax: number;
  partPriceAudited: number;
  standaloneBookHours: number;
  sharedTeardownHoursDeducted: number;
  laborHoursAudited: number;
  laborRateBenchmark: number;
  totalAudited: number;
  potentialSavings: number;
  // Explanations & evidence
  teardownClusterId?: string;
  teardownAccessPath?: string;
  overlapWithItemName?: string;
  matchedRecallCampaign?: string;
  matchedRecallSummary?: string;
  matchedComplaintCount?: number;
  matchedDtcCode?: string;
  forensicReasoning: string;
  userAction: 'APPROVE_FAIR' | 'CHALLENGE_OVERLAP' | 'CLAIM_FREE_RECALL' | 'DECLINE_UPSELL';
  includedInCounterOffer: boolean;
}

export interface TeardownOverlapNode {
  clusterId: string;
  clusterTitle: string;
  sharedPhysicalAccessSteps: string[];
  involvedLineIds: string[];
  involvedNames: string[];
  billedCombinedHours: number;
  trueCombinedBookHours: number;
  duplicateHoursEliminated: number;
  dollarOvercharge: number;
}

export interface NhtsaRecallItem {
  nhtsaCampaignNumber: string;
  component: string;
  summary: string;
  consequence: string;
  remedy: string;
  reportReceivedDate: string;
  parkIt?: boolean;
  parkOutSide?: boolean;
  matchesQuotedItemId?: string;
}

export interface NhtsaComplaintCluster {
  component: string;
  count: number;
  crashCount: number;
  fireCount: number;
  sampleSummaries: Array<{
    odiNumber: string;
    dateOfIncident: string;
    summary: string;
  }>;
  matchesQuotedSubsystem?: boolean;
}

export interface DtcKnowledgeEntry {
  code: string;
  system: 'Powertrain (P)' | 'Chassis (C)' | 'Body (B)' | 'Network (U)';
  oemScope: string;
  officialDefinition: string;
  severity: 'HIGH_STOP_DRIVING' | 'MODERATE_SERVICE_SOON' | 'LOW_EMISSIONS_MONITOR';
  commonMisdiagnosis: string;
  highCostPartsCannon: string;
  highCostEstimate: number;
  trueRootCausesRanked: Array<{
    cause: string;
    probabilityPct: number;
    typicalPartCost: string;
    telemetrySignature: string;
  }>;
  fiveMinuteVerificationTest: string;
}

export interface ForensicAuditReport {
  vehicle: VehicleProfile;
  dataSourceMode: 'LIVE_NHTSA_API' | 'VERIFIED_SNAPSHOT';
  nhtsaLatencyMs?: number;
  lines: AuditedLineItem[];
  teardownClusters: TeardownOverlapNode[];
  recalls: NhtsaRecallItem[];
  complaintClusters: NhtsaComplaintCluster[];
  totalComplaintsCount: number;
  matchedDtcs: DtcKnowledgeEntry[];
  // Totals
  totalQuoted: number;
  totalAuditedFair: number;
  totalSavings: number;
  savingsPercent: number;
  laborOverlapSavings: number;
  recallCoverageSavings: number;
  partMarkupSavings: number;
  upsellEliminationSavings: number;
  overchargeRiskScore: number; // 0 to 100
  riskGrade: 'A (Fair Quote)' | 'B (Minor Markup)' | 'C (Overcharged)' | 'D (Severe Padding)' | 'F (Predatory Estimate)';
  negotiationScript: string;
}
