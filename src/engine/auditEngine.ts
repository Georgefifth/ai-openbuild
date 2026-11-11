import {
  AuditedLineItem,
  ForensicAuditReport,
  NhtsaComplaintCluster,
  NhtsaRecallItem,
  QuoteLineInput,
  TeardownOverlapNode,
  VehicleProfile
} from '../types/audit';
import { DTC_DATABASE } from '../data/dtcDatabase';

interface ProcedureSpec {
  id: string;
  canonicalName: string;
  keywords: RegExp;
  subsystem: AuditedLineItem['subsystem'];
  safetyPriority: AuditedLineItem['safetyPriority'];
  fairPartMin: number;
  fairPartMax: number;
  standaloneBookHours: number;
  teardownClusterId?: string;
  teardownClusterTitle?: string;
  sharedAccessSteps?: string[];
  addOnIncrementalHours?: number; // Hours when performed while cluster primary is already torn down
  isWalletFlushUpsell?: boolean;
  upsellReason?: string;
  recallKeywords?: RegExp;
  federalEmissionsWarrantyEligible?: boolean;
}

const PROCEDURE_CATALOG: ProcedureSpec[] = [
  // Cluster: Front-Engine Timing & Cooling Teardown
  {
    id: 'timing-belt',
    canonicalName: 'Timing Belt & Tensioner Assembly Replacement',
    keywords: /timing\s*(belt|chain|tensioner)/i,
    subsystem: 'Engine & Timing',
    safetyPriority: 'CRITICAL_SAFETY',
    fairPartMin: 140,
    fairPartMax: 260,
    standaloneBookHours: 3.8,
    teardownClusterId: 'FRONT_TIMING_COVER',
    teardownClusterTitle: 'Front Engine Timing Cover & Accessory Drive Teardown',
    sharedAccessSteps: [
      'Drain engine coolant & remove upper radiator hose',
      'Remove accessory serpentine drive belt & tensioner',
      'Support engine, unbolt passenger side engine mount & remove upper/lower timing covers'
    ]
  },
  {
    id: 'water-pump',
    canonicalName: 'Engine Water Pump & Gasket Replacement',
    keywords: /water\s*pump/i,
    subsystem: 'Engine & Timing',
    safetyPriority: 'CRITICAL_SAFETY',
    fairPartMin: 95,
    fairPartMax: 185,
    standaloneBookHours: 3.4,
    teardownClusterId: 'FRONT_TIMING_COVER',
    teardownClusterTitle: 'Front Engine Timing Cover & Accessory Drive Teardown',
    sharedAccessSteps: [
      'Drain engine coolant & remove upper radiator hose',
      'Remove accessory serpentine drive belt & tensioner',
      'Support engine, unbolt passenger side engine mount & remove upper/lower timing covers'
    ],
    addOnIncrementalHours: 0.5
  },
  {
    id: 'serpentine-belt',
    canonicalName: 'Accessory Serpentine Drive Belt Replacement',
    keywords: /(serpentine|accessory|drive)\s*belt/i,
    subsystem: 'Engine & Timing',
    safetyPriority: 'REQUIRED_SOON',
    fairPartMin: 28,
    fairPartMax: 55,
    standaloneBookHours: 0.8,
    teardownClusterId: 'FRONT_TIMING_COVER',
    teardownClusterTitle: 'Front Engine Timing Cover & Accessory Drive Teardown',
    sharedAccessSteps: [
      'Remove accessory serpentine drive belt (already required to access timing cover / water pump)'
    ],
    addOnIncrementalHours: 0.0
  },
  {
    id: 'thermostat',
    canonicalName: 'Engine Coolant Thermostat & Housing Seal Replacement',
    keywords: /thermostat/i,
    subsystem: 'Engine & Timing',
    safetyPriority: 'REQUIRED_SOON',
    fairPartMin: 25,
    fairPartMax: 65,
    standaloneBookHours: 1.2,
    teardownClusterId: 'FRONT_TIMING_COVER',
    teardownClusterTitle: 'Front Engine Timing Cover & Accessory Drive Teardown',
    sharedAccessSteps: [
      'Cooling system is already drained and bled during water pump / timing service'
    ],
    addOnIncrementalHours: 0.4
  },
  {
    id: 'coolant-flush',
    canonicalName: 'Cooling System Drain, Flush & Bleed Service',
    keywords: /cool(ant|ing)\s*(system\s*)?(chemical\s*)?(flush|exchange|bleed|drain)/i,
    subsystem: 'Fluids & Preventive',
    safetyPriority: 'OPTIONAL_MAINTENANCE',
    fairPartMin: 28,
    fairPartMax: 45,
    standaloneBookHours: 1.0,
    teardownClusterId: 'FRONT_TIMING_COVER',
    teardownClusterTitle: 'Front Engine Timing Cover & Accessory Drive Teardown',
    sharedAccessSteps: [
      'Draining, refilling, and bleeding coolant is already included in Water Pump / Thermostat book time'
    ],
    addOnIncrementalHours: 0.0
  },

  // Cluster: Front Suspension & Steering Knuckle
  {
    id: 'front-control-arm',
    canonicalName: 'Front Lower Control Arm Assembly (Left & Right)',
    keywords: /control\s*arm/i,
    subsystem: 'Steering & Suspension',
    safetyPriority: 'CRITICAL_SAFETY',
    fairPartMin: 220,
    fairPartMax: 360,
    standaloneBookHours: 2.8,
    teardownClusterId: 'FRONT_SUSPENSION_KNUCKLE',
    teardownClusterTitle: 'Front Suspension Knuckle & Subframe Corner Teardown',
    sharedAccessSteps: [
      'Raise vehicle, remove front wheels & splash shields',
      'Separate lower ball joint stud from steering knuckle',
      'Unbolt sway bar end link & control arm subframe bushings'
    ]
  },
  {
    id: 'front-ball-joint',
    canonicalName: 'Front Lower Ball Joint Replacement (Left & Right)',
    keywords: /ball\s*joint/i,
    subsystem: 'Steering & Suspension',
    safetyPriority: 'CRITICAL_SAFETY',
    fairPartMin: 75,
    fairPartMax: 135,
    standaloneBookHours: 2.4,
    teardownClusterId: 'FRONT_SUSPENSION_KNUCKLE',
    teardownClusterTitle: 'Front Suspension Knuckle & Subframe Corner Teardown',
    sharedAccessSteps: [
      'Raise vehicle, remove front wheels & separate lower ball joint from steering knuckle (identical teardown to Lower Control Arm)'
    ],
    addOnIncrementalHours: 0.3
  },
  {
    id: 'steering-rack',
    canonicalName: 'Electronic Power Steering (EPS) Gearbox / Rack Replacement',
    keywords: /steering\s*(rack|gear|box|column|worm)/i,
    subsystem: 'Steering & Suspension',
    safetyPriority: 'CRITICAL_SAFETY',
    fairPartMin: 680,
    fairPartMax: 1250,
    standaloneBookHours: 4.0,
    teardownClusterId: 'FRONT_SUSPENSION_KNUCKLE',
    teardownClusterTitle: 'Front Suspension Knuckle & Subframe Corner Teardown',
    sharedAccessSteps: [
      'Remove front wheels, detach outer tie-rod ends, lower front subframe'
    ],
    addOnIncrementalHours: 2.6,
    recallKeywords: /steering|eps|gearbox|subframe/i
  },

  // Cluster: Front Axle Brakes
  {
    id: 'front-brake-pads',
    canonicalName: 'Front Disc Brake Pad Set Replacement',
    keywords: /front.*brake\s*pad|brake\s*pad.*front/i,
    subsystem: 'Brakes & Hydraulic',
    safetyPriority: 'CRITICAL_SAFETY',
    fairPartMin: 55,
    fairPartMax: 95,
    standaloneBookHours: 1.0,
    teardownClusterId: 'FRONT_AXLE_BRAKES',
    teardownClusterTitle: 'Front Axle Caliper & Hub Teardown',
    sharedAccessSteps: [
      'Lift front axle & remove both front wheels',
      'Unbolt front brake caliper slide pins & retract pistons'
    ]
  },
  {
    id: 'front-brake-rotors',
    canonicalName: 'Front Disc Brake Rotors Replacement (Pair)',
    keywords: /front.*(brake\s*)?rotor|rotor.*front/i,
    subsystem: 'Brakes & Hydraulic',
    safetyPriority: 'CRITICAL_SAFETY',
    fairPartMin: 120,
    fairPartMax: 210,
    standaloneBookHours: 1.4,
    teardownClusterId: 'FRONT_AXLE_BRAKES',
    teardownClusterTitle: 'Front Axle Caliper & Hub Teardown',
    sharedAccessSteps: [
      'Wheels and brake calipers are already removed during Front Brake Pad replacement; only 2 caliper bracket bolts per side remain'
    ],
    addOnIncrementalHours: 0.3
  },

  // Cluster: Rear Axle Brakes
  {
    id: 'rear-brake-pads',
    canonicalName: 'Rear Disc Brake Pad Set Replacement',
    keywords: /rear.*brake\s*pad|brake\s*pad.*rear/i,
    subsystem: 'Brakes & Hydraulic',
    safetyPriority: 'CRITICAL_SAFETY',
    fairPartMin: 50,
    fairPartMax: 90,
    standaloneBookHours: 1.0,
    teardownClusterId: 'REAR_AXLE_BRAKES',
    teardownClusterTitle: 'Rear Axle Caliper & Electronic Parking Brake Teardown',
    sharedAccessSteps: [
      'Lift rear axle, command EPB service mode & remove rear wheels',
      'Unbolt rear brake calipers & clean abutment clips'
    ]
  },
  {
    id: 'rear-brake-rotors',
    canonicalName: 'Rear Disc Brake Rotors Replacement (Pair)',
    keywords: /rear.*(brake\s*)?rotor|rotor.*rear/i,
    subsystem: 'Brakes & Hydraulic',
    safetyPriority: 'CRITICAL_SAFETY',
    fairPartMin: 110,
    fairPartMax: 190,
    standaloneBookHours: 1.4,
    teardownClusterId: 'REAR_AXLE_BRAKES',
    teardownClusterTitle: 'Rear Axle Caliper & Electronic Parking Brake Teardown',
    sharedAccessSteps: [
      'Rear wheels and brake calipers are already off during Rear Brake Pad replacement'
    ],
    addOnIncrementalHours: 0.3
  },

  // Recall-prone & Federal Emissions items
  {
    id: 'fuel-pump-module',
    canonicalName: 'In-Tank Low/High Pressure Fuel Pump Module Replacement',
    keywords: /fuel\s*pump/i,
    subsystem: 'Fuel & Emissions',
    safetyPriority: 'CRITICAL_SAFETY',
    fairPartMin: 185,
    fairPartMax: 320,
    standaloneBookHours: 2.0,
    recallKeywords: /fuel\s*pump|fuel\s*system|tank\s*assembly/i
  },
  {
    id: 'seat-weight-sensor',
    canonicalName: 'Front Passenger Occupant Classification / Seat Weight Sensor SRS',
    keywords: /(seat\s*weight|occupant|srs|air\s*bag).*sensor|sensor.*(seat|air\s*bag|srs)/i,
    subsystem: 'Electrical & Airbag',
    safetyPriority: 'CRITICAL_SAFETY',
    fairPartMin: 145,
    fairPartMax: 240,
    standaloneBookHours: 1.4,
    recallKeywords: /air\s*bag|occupant|seat\s*weight|seat\s*belt/i
  },
  {
    id: 'catalytic-converter',
    canonicalName: 'Three-Way Catalytic Converter Exhaust Assembly',
    keywords: /catalytic\s*converter|catalyst.*manifold|p0420/i,
    subsystem: 'Fuel & Emissions',
    safetyPriority: 'OPTIONAL_MAINTENANCE',
    fairPartMin: 580,
    fairPartMax: 1150,
    standaloneBookHours: 2.0,
    federalEmissionsWarrantyEligible: true
  },

  // High-Margin Dealership Upsells & Easy DIY Items
  {
    id: 'fuel-induction-flush',
    canonicalName: 'Chemical Fuel Induction / Throttle Body Cleaner Package',
    keywords: /(bg\s*platinum|fuel\s*induction|induction\s*chemical|intake.*induction.*service|intake\s*decarbon|throttle\s*chemical|injector\s*flush)/i,
    subsystem: 'Fluids & Preventive',
    safetyPriority: 'UNNECESSARY_UPSELL',
    fairPartMin: 0,
    fairPartMax: 25,
    standaloneBookHours: 0.0,
    isWalletFlushUpsell: true,
    upsellReason: 'High-margin dealership "wallet flush" chemical service. Modern Top-Tier detergent gasoline and port/direct injection ECU trims do not require $200+ preventive chemical fogging unless a specific carbon-idle TSB applies.'
  },
  {
    id: 'ac-evaporator-mist',
    canonicalName: 'A/C Evaporator Deodorizer Foam & Vent Antibacterial Mist',
    keywords: /(ac|a\/c|evaporator|vent)\s*(foam|deodorizer|mist|refresh|sanitize)/i,
    subsystem: 'Fluids & Preventive',
    safetyPriority: 'UNNECESSARY_UPSELL',
    fairPartMin: 0,
    fairPartMax: 18,
    standaloneBookHours: 0.0,
    isWalletFlushUpsell: true,
    upsellReason: 'Pure profit-padding upsell ($15 aerosol can billed with 0.6 hrs labor). Replacing the cabin air filter resolves 95% of HVAC odor issues.'
  },
  {
    id: 'oil-seal-additive',
    canonicalName: 'Engine / Oil Seal Conditioner Chemical Additive',
    keywords: /(seal\s*protector|seal\s*conditioner|oil\s*additive|engine\s*treatment|friction\s*modifier)/i,
    subsystem: 'Fluids & Preventive',
    safetyPriority: 'UNNECESSARY_UPSELL',
    fairPartMin: 0,
    fairPartMax: 12,
    standaloneBookHours: 0.0,
    isWalletFlushUpsell: true,
    upsellReason: 'Non-OEM chemical additive upsell. Factory service manuals explicitly advise against third-party petroleum swell additives in modern synthetic engine oils.'
  },
  {
    id: 'cabin-engine-air-filter',
    canonicalName: 'Cabin Pollen & Engine Air Filter Elements',
    keywords: /(cabin|engine|pollen)\s*air\s*filter/i,
    subsystem: 'Fluids & Preventive',
    safetyPriority: 'OPTIONAL_MAINTENANCE',
    fairPartMin: 28,
    fairPartMax: 48,
    standaloneBookHours: 0.2
  }
];

export interface VinValidationResult {
  valid: boolean;
  normalized: string;
  error?: string;
}

export function validateVinFormat(vinRaw: string): VinValidationResult {
  const normalized = vinRaw.trim().toUpperCase();
  if (!normalized) {
    return { valid: false, normalized, error: 'VIN is empty. Enter a 17-character VIN or select a vehicle preset.' };
  }
  const forbiddenMatch = normalized.match(/[IOQ]/);
  if (forbiddenMatch && forbiddenMatch.index !== undefined) {
    return {
      valid: false,
      normalized,
      error: `Invalid character '${forbiddenMatch[0]}' at position ${forbiddenMatch.index + 1}. Standard ISO 3779 VINs never contain I, O, or Q.`
    };
  }
  if (normalized.length !== 17) {
    return {
      valid: false,
      normalized,
      error: `VIN must be exactly 17 characters (currently ${normalized.length}/17).`
    };
  }
  if (!/^[A-HJ-NPR-Z0-9]{17}$/.test(normalized)) {
    return {
      valid: false,
      normalized,
      error: 'VIN contains non-alphanumeric symbols. Use only A–Z (excluding I, O, Q) and 0–9.'
    };
  }
  return { valid: true, normalized };
}

export function parseRawQuoteText(rawText: string, defaultLaborRate = 175): QuoteLineInput[] {
  const lines = rawText
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 3);

  const parsed: QuoteLineInput[] = [];

  lines.forEach((line, idx) => {
    // Strip leading numbering like "1. " or "- "
    const clean = line.replace(/^\d+[\.\)]\s*|^[-*•]\s*/, '');
    // Match Parts: $X | Labor: Y hrs @ $Z/hr
    const partsMatch = clean.match(/parts?\s*[:=-]?\s*\$?\s*(\d+(?:\.\d{1,2})?)/i);
    const laborHrsMatch = clean.match(/labor\s*[:=-]?\s*(\d+(?:\.\d{1,2})?)\s*(?:hrs?|hours?)/i) ||
                          clean.match(/(\d+(?:\.\d{1,2})?)\s*(?:hrs?|hours?)/i);
    const rateMatch = clean.match(/@\s*\$?\s*(\d+(?:\.\d{1,2})?)\s*\/?\s*(?:hr|hour)/i);

    let partPrice = partsMatch ? parseFloat(partsMatch[1]) : 0;
    let laborHours = laborHrsMatch ? parseFloat(laborHrsMatch[1]) : 1.0;
    let laborRate = rateMatch ? parseFloat(rateMatch[1]) : defaultLaborRate;

    // Fallback if user pasted "Front Brake Pads $420" without explicit Parts/Labor split
    if (!partsMatch && !laborHrsMatch) {
      const anyDollar = clean.match(/\$\s*(\d+(?:\.\d{1,2})?)/);
      if (anyDollar) {
        const total = parseFloat(anyDollar[1]);
        partPrice = Math.round(total * 0.48);
        laborHours = Number(((total - partPrice) / defaultLaborRate).toFixed(1));
      } else {
        partPrice = 150;
        laborHours = 1.2;
      }
    }

    const descPart = clean
      .split(/\s+-\s+parts?|\s*\|\s*parts?|\s*\|\s*labor/i)[0]
      .replace(/\$\s*\d+(?:\.\d{1,2})?.*$/, '')
      .trim();

    parsed.push({
      id: `parsed-${idx + 1}`,
      description: descPart || clean,
      partPriceQuoted: partPrice,
      laborHoursQuoted: laborHours,
      laborRateQuoted: laborRate
    });
  });

  return parsed;
}

export function runForensicAudit(params: {
  vehicle: VehicleProfile;
  quoteLines: QuoteLineInput[];
  recalls: NhtsaRecallItem[];
  complaintClusters: NhtsaComplaintCluster[];
  totalComplaintsCount: number;
  dataSourceMode: 'LIVE_NHTSA_API' | 'VERIFIED_SNAPSHOT';
  nhtsaLatencyMs?: number;
}): ForensicAuditReport {
  const {
    vehicle,
    quoteLines,
    recalls,
    complaintClusters,
    totalComplaintsCount,
    dataSourceMode,
    nhtsaLatencyMs
  } = params;

  const benchmarkLaborRate = Math.min(vehicle.shopLaborRate || 175, 145);
  const currentYear = 2026;
  const vehicleAgeYears = Math.max(0, currentYear - vehicle.year);
  const underFederalEmissionsWarranty = vehicleAgeYears <= 8 && vehicle.mileage <= 80000;

  // Step 1: Match each line to our mechanical catalog
  const matchedSpecs = quoteLines.map((line) => {
    const spec = PROCEDURE_CATALOG.find((p) => p.keywords.test(line.description));
    return { line, spec };
  });

  // Step 2: Group lines by teardownClusterId to identify shared teardown labor overlap
  const clusterGroups = new Map<string, Array<{ line: QuoteLineInput; spec: ProcedureSpec }>>();
  matchedSpecs.forEach(({ line, spec }) => {
    if (spec?.teardownClusterId) {
      const list = clusterGroups.get(spec.teardownClusterId) || [];
      list.push({ line, spec });
      clusterGroups.set(spec.teardownClusterId, list);
    }
  });

  // Primary item in each cluster is the one with the highest standaloneBookHours
  const clusterPrimaryLineId = new Map<string, string>();
  const clusterPrimaryName = new Map<string, string>();
  clusterGroups.forEach((items, clusterId) => {
    if (items.length >= 2) {
      const sorted = [...items].sort((a, b) => b.spec.standaloneBookHours - a.spec.standaloneBookHours);
      clusterPrimaryLineId.set(clusterId, sorted[0].line.id);
      clusterPrimaryName.set(clusterId, sorted[0].spec.canonicalName);
    }
  });

  const auditedLines: AuditedLineItem[] = [];
  let laborOverlapSavings = 0;
  let recallCoverageSavings = 0;
  let partMarkupSavings = 0;
  let upsellEliminationSavings = 0;

  matchedSpecs.forEach(({ line, spec }) => {
    const totalQuoted = Number((line.partPriceQuoted + line.laborHoursQuoted * line.laborRateQuoted).toFixed(2));

    // Check if an active NHTSA recall covers this item (prioritize exact component match)
    const descWords = line.description.toLowerCase();
    const matchingRecall =
      recalls.find((r) => {
        const hay = `${r.component} ${r.summary}`.toLowerCase();
        if (descWords.includes('fuel pump') && hay.includes('fuel pump')) return true;
        if (
          (descWords.includes('seat weight') || descWords.includes('occupant')) &&
          (hay.includes('seat weight') || hay.includes('occupant classification'))
        ) {
          return true;
        }
        if (descWords.includes('subframe') && hay.includes('subframe')) return true;
        return false;
      }) ||
      recalls.find((r) => {
        if (
          spec?.recallKeywords &&
          (spec.recallKeywords.test(r.component) || spec.recallKeywords.test(r.summary))
        ) {
          return true;
        }
        return false;
      });

    // Check if covered by 8yr/80,000-mile Federal Emissions Warranty (Catalytic Converter / ECU)
    const isFedEmissionsCovered = Boolean(
      spec?.federalEmissionsWarrantyEligible && underFederalEmissionsWarranty
    );

    if (matchingRecall || isFedEmissionsCovered) {
      const campaignId = matchingRecall
        ? matchingRecall.nhtsaCampaignNumber
        : 'US-EPA-8YR-80K';
      const campaignSummary = matchingRecall
        ? `${matchingRecall.summary} Remedy: ${matchingRecall.remedy}`
        : `Vehicle is ${vehicleAgeYears} yrs old with ${vehicle.mileage.toLocaleString()} miles (< 8 yrs / 80,000 mi). Under the U.S. Clean Air Act Section 207(i), OEM Catalytic Converters and ECUs are covered 100% free of charge ($0 parts & $0 labor) at any franchised dealership. Furthermore, check DTC P0420 upstream exhaust leaks before replacing the converter.`;

      if (matchingRecall) {
        matchingRecall.matchesQuotedItemId = line.id;
      }

      recallCoverageSavings += totalQuoted;

      auditedLines.push({
        id: line.id,
        originalDescription: line.description,
        canonicalProcedureId: spec?.id || 'recall-item',
        canonicalName: spec?.canonicalName || line.description,
        subsystem: spec?.subsystem || 'Fuel & Emissions',
        verdict: 'RECALL_COVERED',
        verdictLabel: matchingRecall
          ? `FREE NHTSA RECALL (${campaignId})`
          : 'FREE 8YR/80K FEDERAL WARRANTY',
        safetyPriority: 'CRITICAL_SAFETY',
        partPriceQuoted: line.partPriceQuoted,
        laborHoursQuoted: line.laborHoursQuoted,
        laborRateQuoted: line.laborRateQuoted,
        totalQuoted,
        partPriceFairMin: 0,
        partPriceFairMax: 0,
        partPriceAudited: 0,
        standaloneBookHours: spec?.standaloneBookHours || line.laborHoursQuoted,
        sharedTeardownHoursDeducted: line.laborHoursQuoted,
        laborHoursAudited: 0,
        laborRateBenchmark: 0,
        totalAudited: 0,
        potentialSavings: totalQuoted,
        matchedRecallCampaign: campaignId,
        matchedRecallSummary: campaignSummary,
        forensicReasoning: matchingRecall
          ? `STOP — DO NOT PAY FOR THIS LINE ITEM. Active NHTSA Safety Recall Campaign ${campaignId} (${matchingRecall.component}) mandates that the manufacturer/dealership perform this exact repair free of charge ($0 parts, $0 labor).`
          : campaignSummary,
        userAction: 'CLAIM_FREE_RECALL',
        includedInCounterOffer: true
      });
      return;
    }

    // Check if it is a Wallet Flush Upsell
    if (spec?.isWalletFlushUpsell) {
      upsellEliminationSavings += totalQuoted;
      auditedLines.push({
        id: line.id,
        originalDescription: line.description,
        canonicalProcedureId: spec.id,
        canonicalName: spec.canonicalName,
        subsystem: spec.subsystem,
        verdict: 'WALLET_FLUSH_UPSELL',
        verdictLabel: 'HIGH-MARGIN UPSELL (DECLINE)',
        safetyPriority: 'UNNECESSARY_UPSELL',
        partPriceQuoted: line.partPriceQuoted,
        laborHoursQuoted: line.laborHoursQuoted,
        laborRateQuoted: line.laborRateQuoted,
        totalQuoted,
        partPriceFairMin: spec.fairPartMin,
        partPriceFairMax: spec.fairPartMax,
        partPriceAudited: 0,
        standaloneBookHours: 0,
        sharedTeardownHoursDeducted: line.laborHoursQuoted,
        laborHoursAudited: 0,
        laborRateBenchmark: benchmarkLaborRate,
        totalAudited: 0,
        potentialSavings: totalQuoted,
        forensicReasoning: spec.upsellReason || 'Non-essential high-margin chemical upsell not required by the factory maintenance schedule.',
        userAction: 'DECLINE_UPSELL',
        includedInCounterOffer: false
      });
      return;
    }

    // Check if part of a multi-item Shared Teardown Cluster
    const clusterId = spec?.teardownClusterId;
    const clusterItems = clusterId ? clusterGroups.get(clusterId) : undefined;
    const isSecondaryInCluster = Boolean(
      clusterId &&
      clusterItems &&
      clusterItems.length >= 2 &&
      clusterPrimaryLineId.get(clusterId) !== line.id
    );

    const fairPartMid = spec
      ? Math.round((spec.fairPartMin + spec.fairPartMax) / 2)
      : Math.round(line.partPriceQuoted * 0.75);
    const partPriceAudited = Math.min(line.partPriceQuoted, spec ? spec.fairPartMax : fairPartMid);

    if (isSecondaryInCluster && spec && clusterId) {
      const primaryName = clusterPrimaryName.get(clusterId) || 'Primary Teardown Job';
      const addOnHrs = spec.addOnIncrementalHours ?? 0.4;
      const deductedHrs = Number(Math.max(0, line.laborHoursQuoted - addOnHrs).toFixed(1));
      const totalAudited = Number((partPriceAudited + addOnHrs * line.laborRateQuoted).toFixed(2));
      const savings = Number(Math.max(0, totalQuoted - totalAudited).toFixed(2));
      const laborSavedDollars = Number((deductedHrs * line.laborRateQuoted).toFixed(2));
      const partSavedDollars = Number(Math.max(0, line.partPriceQuoted - partPriceAudited).toFixed(2));

      laborOverlapSavings += laborSavedDollars;
      partMarkupSavings += partSavedDollars;

      auditedLines.push({
        id: line.id,
        originalDescription: line.description,
        canonicalProcedureId: spec.id,
        canonicalName: spec.canonicalName,
        subsystem: spec.subsystem,
        verdict: 'LABOR_OVERLAP',
        verdictLabel: `SHARED TEARDOWN (-${deductedHrs} HRS)`,
        safetyPriority: spec.safetyPriority,
        partPriceQuoted: line.partPriceQuoted,
        laborHoursQuoted: line.laborHoursQuoted,
        laborRateQuoted: line.laborRateQuoted,
        totalQuoted,
        partPriceFairMin: spec.fairPartMin,
        partPriceFairMax: spec.fairPartMax,
        partPriceAudited,
        standaloneBookHours: spec.standaloneBookHours,
        sharedTeardownHoursDeducted: deductedHrs,
        laborHoursAudited: addOnHrs,
        laborRateBenchmark: benchmarkLaborRate,
        totalAudited,
        potentialSavings: savings,
        teardownClusterId: clusterId,
        teardownAccessPath: (spec.sharedAccessSteps || []).join(' → '),
        overlapWithItemName: primaryName,
        forensicReasoning: `DOUBLE-BILLED LABOR OVERLAP: Shop billed ${line.laborHoursQuoted} hrs standalone book time, but 90% of the physical teardown is already performed during "${primaryName}". Incremental add-on labor is only ${addOnHrs} hrs (saving ${deductedHrs} hrs / $${laborSavedDollars.toFixed(0)} in duplicate labor${partSavedDollars > 0 ? ` + $${partSavedDollars.toFixed(0)} part markup` : ''}).`,
        userAction: 'CHALLENGE_OVERLAP',
        includedInCounterOffer: true
      });
      return;
    }

    // Standard item or Primary item in a cluster: check for excessive part/labor markup
    const standaloneHrs = spec ? spec.standaloneBookHours : line.laborHoursQuoted;
    const auditedHrs = Math.min(line.laborHoursQuoted, standaloneHrs);
    const hrsDelta = Number(Math.max(0, line.laborHoursQuoted - auditedHrs).toFixed(1));
    const totalAudited = Number((partPriceAudited + auditedHrs * line.laborRateQuoted).toFixed(2));
    const savings = Number(Math.max(0, totalQuoted - totalAudited).toFixed(2));

    const partSaved = Math.max(0, line.partPriceQuoted - partPriceAudited);
    const laborSaved = Math.max(0, (line.laborHoursQuoted - auditedHrs) * line.laborRateQuoted);
    partMarkupSavings += partSaved;
    laborOverlapSavings += laborSaved;

    const isMarkup = savings >= 65;

    auditedLines.push({
      id: line.id,
      originalDescription: line.description,
      canonicalProcedureId: spec?.id || 'standard-repair',
      canonicalName: spec?.canonicalName || line.description,
      subsystem: spec?.subsystem || 'Engine & Timing',
      verdict: isMarkup ? 'PART_MARKUP' : 'FAIR_ESSENTIAL',
      verdictLabel: isMarkup ? 'PART / BOOK-TIME MARKUP' : 'VERIFIED BASE PROCEDURE',
      safetyPriority: spec?.safetyPriority || 'REQUIRED_SOON',
      partPriceQuoted: line.partPriceQuoted,
      laborHoursQuoted: line.laborHoursQuoted,
      laborRateQuoted: line.laborRateQuoted,
      totalQuoted,
      partPriceFairMin: spec ? spec.fairPartMin : Math.round(line.partPriceQuoted * 0.6),
      partPriceFairMax: spec ? spec.fairPartMax : line.partPriceQuoted,
      partPriceAudited,
      standaloneBookHours: standaloneHrs,
      sharedTeardownHoursDeducted: hrsDelta,
      laborHoursAudited: auditedHrs,
      laborRateBenchmark: benchmarkLaborRate,
      totalAudited,
      potentialSavings: savings,
      teardownClusterId: clusterId,
      teardownAccessPath: spec?.sharedAccessSteps?.join(' → '),
      forensicReasoning: isMarkup
        ? `Quoted parts ($${line.partPriceQuoted}) and/or labor (${line.laborHoursQuoted} hrs) exceed OEM/aftermarket book benchmarks ($${spec?.fairPartMin ?? 40}–$${spec?.fairPartMax ?? partPriceAudited} parts, ${auditedHrs} hrs standard book time).`
        : `Core mechanical procedure ("${spec?.canonicalName || line.description}"). Serves as the primary teardown anchor—approve at fair OEM part & book labor benchmark ($${totalAudited.toFixed(0)}).`,
      userAction: isMarkup ? 'CHALLENGE_OVERLAP' : 'APPROVE_FAIR',
      includedInCounterOffer: true
    });
  });

  // Step 3: Build Teardown Overlap Blueprint Nodes
  const teardownClusters: TeardownOverlapNode[] = [];
  clusterGroups.forEach((items, clusterId) => {
    if (items.length < 2) return;
    const involvedIds = items.map((i) => i.line.id);
    const matchingAudited = auditedLines.filter((a) => involvedIds.includes(a.id));
    const billedCombinedHours = Number(
      matchingAudited.reduce((acc, a) => acc + a.laborHoursQuoted, 0).toFixed(1)
    );
    const trueCombinedBookHours = Number(
      matchingAudited.reduce((acc, a) => acc + a.laborHoursAudited, 0).toFixed(1)
    );
    const duplicateHoursEliminated = Number(
      Math.max(0, billedCombinedHours - trueCombinedBookHours).toFixed(1)
    );
    const avgRate = matchingAudited[0]?.laborRateQuoted || vehicle.shopLaborRate || 175;
    const dollarOvercharge = Number((duplicateHoursEliminated * avgRate).toFixed(2));

    if (duplicateHoursEliminated > 0) {
      teardownClusters.push({
        clusterId,
        clusterTitle: items[0].spec.teardownClusterTitle || 'Shared Mechanical Teardown Assembly',
        sharedPhysicalAccessSteps: items[0].spec.sharedAccessSteps || [
          'Raise vehicle & remove wheel/cover assembly',
          'Disassemble primary mounting bracket shared by sub-components'
        ],
        involvedLineIds: involvedIds,
        involvedNames: matchingAudited.map((a) => a.canonicalName),
        billedCombinedHours,
        trueCombinedBookHours,
        duplicateHoursEliminated,
        dollarOvercharge
      });
    }
  });

  // Step 4: Match DTC codes
  const matchedDtcs = (vehicle.dtcCodes || [])
    .map((c) => DTC_DATABASE[c.trim().toUpperCase()])
    .filter(Boolean);

  // Totals
  const totalQuoted = Number(auditedLines.reduce((s, l) => s + l.totalQuoted, 0).toFixed(2));
  const totalAuditedFair = Number(auditedLines.reduce((s, l) => s + l.totalAudited, 0).toFixed(2));
  const totalSavings = Number(Math.max(0, totalQuoted - totalAuditedFair).toFixed(2));
  const savingsPercent = totalQuoted > 0 ? Math.round((totalSavings / totalQuoted) * 100) : 0;

  const overchargeRiskScore = Math.min(100, Math.round(savingsPercent * 1.35 + (recallCoverageSavings > 0 ? 20 : 0)));
  let riskGrade: ForensicAuditReport['riskGrade'] = 'A (Fair Quote)';
  if (overchargeRiskScore >= 65) riskGrade = 'F (Predatory Estimate)';
  else if (overchargeRiskScore >= 45) riskGrade = 'D (Severe Padding)';
  else if (overchargeRiskScore >= 28) riskGrade = 'C (Overcharged)';
  else if (overchargeRiskScore >= 12) riskGrade = 'B (Minor Markup)';

  // Step 5: Generate Service Advisor Negotiation Script
  const scriptLines: string[] = [];
  scriptLines.push(
    `Hi Service Advisor — thank you for inspecting my ${vehicle.year} ${vehicle.make} ${vehicle.model} (VIN: ${vehicle.vin}, ${vehicle.mileage.toLocaleString()} mi).`
  );
  scriptLines.push(
    `I reviewed the $${totalQuoted.toLocaleString()} estimate against NHTSA federal campaign records and standard shared-teardown labor guides. Before I authorize work today, let's adjust the work order as follows:`
  );

  const recallItems = auditedLines.filter((l) => l.verdict === 'RECALL_COVERED');
  if (recallItems.length > 0) {
    recallItems.forEach((item) => {
      scriptLines.push(
        `• [WARRANTY / RECALL COVERAGE — $0.00]: "${item.originalDescription}" ($${item.totalQuoted.toFixed(0)} quoted) is covered under ${item.matchedRecallCampaign}. Please process this under the manufacturer campaign / federal emissions warranty at $0 customer pay.`
      );
    });
  }

  if (teardownClusters.length > 0) {
    teardownClusters.forEach((tc) => {
      scriptLines.push(
        `• [REMOVE DUPLICATE TEARDOWN LABOR — SAVE ${tc.duplicateHoursEliminated} HRS / $${tc.dollarOvercharge.toFixed(0)}]: For ${tc.involvedNames.join(' + ')}, the quote bills ${tc.billedCombinedHours} combined hours as if each job were torn down from scratch. Because ${tc.sharedPhysicalAccessSteps[0].toLowerCase()} is shared, combined book time is ${tc.trueCombinedBookHours} hrs.`
      );
    });
  }

  const upsellItems = auditedLines.filter((l) => l.verdict === 'WALLET_FLUSH_UPSELL');
  if (upsellItems.length > 0) {
    scriptLines.push(
      `• [REMOVE OPTIONAL UPSELLS — SAVE $${upsellItems.reduce((s, i) => s + i.totalQuoted, 0).toFixed(0)}]: Please remove ${upsellItems.map((u) => `"${u.originalDescription}"`).join(' and ')}; I only want factory-scheduled mechanical repairs today.`
    );
  }

  scriptLines.push(
    `With the combined labor adjustment and removal of recall/upsell items, I am ready to authorize the core mechanical work today for $${totalAuditedFair.toLocaleString()} (saving $${totalSavings.toLocaleString()}). Please send over the revised work order.`
  );

  return {
    vehicle,
    dataSourceMode,
    nhtsaLatencyMs,
    lines: auditedLines,
    teardownClusters,
    recalls,
    complaintClusters,
    totalComplaintsCount,
    matchedDtcs,
    totalQuoted,
    totalAuditedFair,
    totalSavings,
    savingsPercent,
    laborOverlapSavings: Number(laborOverlapSavings.toFixed(2)),
    recallCoverageSavings: Number(recallCoverageSavings.toFixed(2)),
    partMarkupSavings: Number(partMarkupSavings.toFixed(2)),
    upsellEliminationSavings: Number(upsellEliminationSavings.toFixed(2)),
    overchargeRiskScore,
    riskGrade,
    negotiationScript: scriptLines.join('\n\n')
  };
}
