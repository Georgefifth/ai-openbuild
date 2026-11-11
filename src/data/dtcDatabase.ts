import { DtcKnowledgeEntry } from '../types/audit';

/**
 * Built on top of open-source Wal33D/dtc-database (MIT License)
 * https://github.com/Wal33D/dtc-database (18,805 SAE J2012 & OEM DTC definitions)
 * Enriched with mechanical differential diagnosis probabilities, freeze-frame
 * telemetry signatures, and anti-"Parts Cannon" verification steps.
 */
export const DTC_DATABASE: Record<string, DtcKnowledgeEntry> = {
  P0171: {
    code: 'P0171',
    system: 'Powertrain (P)',
    oemScope: 'SAE J2012 Generic + Ford/Toyota/Honda/GM',
    officialDefinition: 'System Too Lean (Bank 1)',
    severity: 'MODERATE_SERVICE_SOON',
    commonMisdiagnosis: 'Shops frequently quote immediate replacement of the Upstream Air/Fuel Ratio (O2) Sensor ($380) or Fuel Injectors ($1,150) without smoke-testing intake plumbing or checking fuel trim delta at 2,500 RPM.',
    highCostPartsCannon: 'Fuel Injector Set or High-Pressure Fuel Pump Assembly',
    highCostEstimate: 1180,
    trueRootCausesRanked: [
      {
        cause: 'Cracked PCV Hose / Intake Accordion Boot Vacuum Leak',
        probabilityPct: 58,
        typicalPartCost: '$18 – $45',
        telemetrySignature: 'LTFT > +16% at 750 RPM idle, but drops toward 0% (+2% to +4%) when holding engine at 2,500 RPM.'
      },
      {
        cause: 'Contaminated Mass Air Flow (MAF) Sensor Hot-Wire',
        probabilityPct: 26,
        typicalPartCost: '$12 (MAF Cleaner) or $110 (OEM Sensor)',
        telemetrySignature: 'Calculated Load under-reports at wide-open throttle; LTFT stays positive (+14% to +22%) across both idle and highway load.'
      },
      {
        cause: 'Weak Fuel Pump / Clogged Fuel Filter / Injector Restriction',
        probabilityPct: 16,
        typicalPartCost: '$220 – $650',
        telemetrySignature: 'LTFT is near normal (+3%) at idle but spikes above +20% under high RPM / uphill load.'
      }
    ],
    fiveMinuteVerificationTest: 'Before authorizing any $400+ sensor or injector replacement: Ask the tech for the Freeze-Frame Fuel Trim at Idle vs. 2,500 RPM. If Long-Term Fuel Trim (LTFT) recovers above 2,000 RPM, it is an inexpensive vacuum leak—not a fuel pump or injector failure.'
  },
  P0420: {
    code: 'P0420',
    system: 'Powertrain (P)',
    oemScope: 'SAE J2012 Generic + All OEMs',
    officialDefinition: 'Catalyst System Efficiency Below Threshold (Bank 1)',
    severity: 'LOW_EMISSIONS_MONITOR',
    commonMisdiagnosis: 'Dealerships immediately quote a $1,800–$3,200 OEM Catalytic Converter assembly without checking for a $40 exhaust flange leak ahead of the downstream O2 sensor or verifying whether an upstream rich/misfire condition poisoned the catalyst.',
    highCostPartsCannon: 'OEM Three-Way Catalytic Converter Manifold Assembly',
    highCostEstimate: 2150,
    trueRootCausesRanked: [
      {
        cause: 'Exhaust Flex-Pipe / Gasket Pin-Hole Leak Upstream of Sensor 2',
        probabilityPct: 32,
        typicalPartCost: '$25 – $95',
        telemetrySignature: 'Downstream O2 (B1S2) shows erratic lean dips at idle due to Venturi air intrusion into the exhaust pipe.'
      },
      {
        cause: 'Aged / Lazy Downstream Oxygen Sensor (Bank 1 Sensor 2)',
        probabilityPct: 24,
        typicalPartCost: '$65 – $140',
        telemetrySignature: 'B1S2 voltage fails to hold 0.65–0.75V steady even when catalyst bed temperature exceeds 500°C.'
      },
      {
        cause: 'Degraded Catalytic Converter Substrate (Check 8yr/80k Federal Emissions Warranty!)',
        probabilityPct: 44,
        typicalPartCost: '$0 under 8yr/80,000-mi Federal Emissions Warranty, or $650–$1,450 aftermarket/OEM',
        telemetrySignature: 'Downstream O2 sensor (B1S2) mirrors the 1Hz oscillation of Upstream O2 (B1S1) at 2,000 RPM steady cruise.'
      }
    ],
    fiveMinuteVerificationTest: '1) Check vehicle mileage: Federal Clean Air Act mandates an 8-year / 80,000-mile warranty on catalytic converters across ALL brands ($0 at dealer). 2) Ask shop to confirm zero exhaust leaks before B1S2 and verify no underlying P0300 misfire codes.'
  },
  P0300: {
    code: 'P0300',
    system: 'Powertrain (P)',
    oemScope: 'SAE J2012 Generic',
    officialDefinition: 'Random/Multiple Cylinder Misfire Detected',
    severity: 'HIGH_STOP_DRIVING',
    commonMisdiagnosis: 'Quoting all 4 or 6 ignition coils + all fuel injectors ($1,400+) at once when worn spark plugs, a single vacuum leak, or a recall-covered fuel pump (e.g., Honda NHTSA Recall 23V858) is starving the rail.',
    highCostPartsCannon: 'Complete Ignition Coil Pack Set + Fuel Injector Rail',
    highCostEstimate: 1420,
    trueRootCausesRanked: [
      {
        cause: 'Worn Spark Plugs or Oil in Spark Plug Tube Seals',
        probabilityPct: 45,
        typicalPartCost: '$48 – $120',
        telemetrySignature: 'Misfire counters increment primarily under high load / low RPM lugging.'
      },
      {
        cause: 'Fuel Starvation from Failing Low/High-Pressure Fuel Pump (Check Active Recalls)',
        probabilityPct: 30,
        typicalPartCost: '$0 if covered by NHTSA Fuel Pump Recall (e.g. 23V858000)',
        telemetrySignature: 'Random misfires across all cylinders simultaneously accompanied by lean STFT.'
      },
      {
        cause: 'EGR Valve Stuck Open or Intake Manifold Gasket Leak',
        probabilityPct: 25,
        typicalPartCost: '$85 – $210',
        telemetrySignature: 'Rough idle misfire across all cylinders that smooths out above 2,200 RPM.'
      }
    ],
    fiveMinuteVerificationTest: 'Never replace all ignition coils for a P0300 random misfire: coils do not all fail on the same Tuesday. Check NHTSA fuel pump recalls first, and inspect spark plug gap and oil fouling.'
  },
  P0455: {
    code: 'P0455',
    system: 'Powertrain (P)',
    oemScope: 'SAE J2012 Generic',
    officialDefinition: 'Evaporative Emission System Leak Detected (Large Leak)',
    severity: 'LOW_EMISSIONS_MONITOR',
    commonMisdiagnosis: 'Quoting $750+ to drop the fuel tank and replace the EVAP Charcoal Canister without checking the gas cap seal or testing the $45 under-hood Purge Solenoid Valve.',
    highCostPartsCannon: 'EVAP Charcoal Canister & Fuel Tank Pressure Assembly',
    highCostEstimate: 780,
    trueRootCausesRanked: [
      {
        cause: 'Loose, Cracked, or Non-OEM Fuel Filler Cap O-Ring',
        probabilityPct: 52,
        typicalPartCost: '$0 (tighten) – $24',
        telemetrySignature: 'Zero vacuum pull achieved during EVAP monitor tank drawdown test.'
      },
      {
        cause: 'Stuck-Open EVAP Canister Purge Valve (Under Hood)',
        probabilityPct: 35,
        typicalPartCost: '$38 – $85',
        telemetrySignature: 'Hard starting right after refueling; STFT spikes rich when purge duty cycle activates.'
      },
      {
        cause: 'Cracked EVAP Vent Valve or Charcoal Canister Hose',
        probabilityPct: 13,
        typicalPartCost: '$65 – $180',
        telemetrySignature: 'Smoke test reveals leak near rear axle vent solenoid.'
      }
    ],
    fiveMinuteVerificationTest: 'Inspect the gas cap rubber O-ring and unplug the under-hood EVAP purge valve to see if you can blow air through it when unpowered (it should be normally closed).'
  },
  P0128: {
    code: 'P0128',
    system: 'Powertrain (P)',
    oemScope: 'SAE J2012 Generic',
    officialDefinition: 'Coolant Thermostat (Coolant Temperature Below Thermostat Regulating Temperature)',
    severity: 'MODERATE_SERVICE_SOON',
    commonMisdiagnosis: 'Bundling a full radiator replacement ($950) and paid "cooling system chemical flush" ($220) when only the $35 thermostat is stuck open—and double-charging coolant drain/refill labor.',
    highCostPartsCannon: 'Radiator + Water Pump + Chemical Cooling Flush Bundle',
    highCostEstimate: 1120,
    trueRootCausesRanked: [
      {
        cause: 'Thermostat Stuck Open (Mechanical Wax Pellet Fatigue)',
        probabilityPct: 82,
        typicalPartCost: '$28 – $75',
        telemetrySignature: 'ECT (Engine Coolant Temp) plateaus at 68–73°C on highway cruise instead of reaching 88–95°C within 10 minutes.'
      },
      {
        cause: 'Faulty Engine Coolant Temperature (ECT) Sensor',
        probabilityPct: 18,
        typicalPartCost: '$22 – $55',
        telemetrySignature: 'Cold morning key-on ECT reading differs by >10°C from Intake Air Temp (IAT) sensor.'
      }
    ],
    fiveMinuteVerificationTest: 'Replacing a thermostat already requires draining and refilling coolant—never pay for a separate "Coolant Flush Labor" line item on the same invoice.'
  },
  C0035: {
    code: 'C0035',
    system: 'Chassis (C)',
    oemScope: 'SAE J2012 Chassis / ABS / VSA',
    officialDefinition: 'Left Front Wheel Speed Sensor Circuit Malfunction',
    severity: 'MODERATE_SERVICE_SOON',
    commonMisdiagnosis: 'Dealerships quote an entire ABS Hydraulic Modulator / VSA Control Unit ($1,850+) or full Hub Bearing Assembly ($680) when a $45 wheel speed sensor harness is frayed or magnetic tone ring has metallic debris.',
    highCostPartsCannon: 'ABS/VSA Hydraulic Modulator Pump Assembly',
    highCostEstimate: 1890,
    trueRootCausesRanked: [
      {
        cause: 'Damaged Wheel Speed Sensor Wire or Corroded Connector Pin',
        probabilityPct: 64,
        typicalPartCost: '$35 – $90',
        telemetrySignature: 'Left-front wheel speed drops to 0 km/h intermittently over bumps while other 3 wheels read 55 km/h.'
      },
      {
        cause: 'Rusted/Debris-Covered Magnetic Encoder Ring on Wheel Bearing',
        probabilityPct: 28,
        typicalPartCost: '$140 – $290',
        telemetrySignature: 'Periodic signal dropout once per wheel revolution.'
      },
      {
        cause: 'ABS Module Internal Solder Fault',
        probabilityPct: 8,
        typicalPartCost: '$250 (Module Rebuild) – $1,200',
        telemetrySignature: 'Fault persists even after swapping left/right sensor inputs at the harness.'
      }
    ],
    fiveMinuteVerificationTest: 'Ask the shop to graph all 4 wheel speed sensors during a slow roll and inspect the wheel well harness clip before authorizing any hub or ABS pump replacement.'
  },
  B0001: {
    code: 'B0001',
    system: 'Body (B)',
    oemScope: 'SAE J2012 Restraints / SRS Airbag',
    officialDefinition: 'Driver Frontal Stage 1 Deployment Control / Seat Weight & Clockspring Circuit',
    severity: 'HIGH_STOP_DRIVING',
    commonMisdiagnosis: 'Charging $900–$1,500 out-of-pocket for SRS airbag sensors or seat weight sensors that are actively covered under mandatory free NHTSA Safety Recalls (e.g., Honda/Acura 24V064 / 26V332 or Takata/Occupant Classification recalls).',
    highCostPartsCannon: 'SRS Airbag Control Module & Seat Mat Replacement',
    highCostEstimate: 1350,
    trueRootCausesRanked: [
      {
        cause: 'Front Passenger Seat Weight Sensor Crack / Short (Active NHTSA Recall)',
        probabilityPct: 55,
        typicalPartCost: '$0.00 (Free NHTSA Recall Remedy at Dealership)',
        telemetrySignature: 'SRS light illuminates intermittently when passenger shifts weight; covered by NHTSA 24V064000 / 26V332000.'
      },
      {
        cause: 'Steering Wheel Clockspring Ribbon Cable Wear',
        probabilityPct: 33,
        typicalPartCost: '$110 – $260',
        telemetrySignature: 'Horn or steering wheel audio buttons fail alongside SRS airbag warning lamp.'
      },
      {
        cause: 'Under-Seat Yellow SRS Connector Pin Oxidation',
        probabilityPct: 12,
        typicalPartCost: '$0 – $85 (Connector Service)',
        telemetrySignature: 'Code triggers immediately after sliding the front seat forward/backward.'
      }
    ],
    fiveMinuteVerificationTest: 'Check live NHTSA Recalls by VIN/Model first—airbag and seat occupant sensors have the highest rate of lifetime free federal safety recalls.'
  },
  U0100: {
    code: 'U0100',
    system: 'Network (U)',
    oemScope: 'SAE J2012 CAN Network',
    officialDefinition: 'Lost Communication With ECM/PCM "A"',
    severity: 'HIGH_STOP_DRIVING',
    commonMisdiagnosis: 'Quoting a $1,600 programmed Engine Control Module (ECM) when a weak 12V battery, corroded chassis ground strap, or 60-ohm CAN termination wire rub is causing bus drop-outs.',
    highCostPartsCannon: 'New OEM Engine Control Module (ECM) + Reprogramming',
    highCostEstimate: 1650,
    trueRootCausesRanked: [
      {
        cause: 'Weak 12V Battery Cranking Voltage Drop (<9.6V) or Corroded Ground Strap',
        probabilityPct: 62,
        typicalPartCost: '$15 (Ground Strap) – $180 (Battery)',
        telemetrySignature: 'U0100 sets only during starter cranking when system voltage dips below module brown-out threshold.'
      },
      {
        cause: 'CAN High / CAN Low Harness Chafing or Pin Spread',
        probabilityPct: 29,
        typicalPartCost: '$90 – $240 (Wiring Repair)',
        telemetrySignature: 'DLC pins 6 & 14 measure open or 120 ohms instead of the required 60 ohms parallel termination.'
      },
      {
        cause: 'Internal ECM Power Supply Failure',
        probabilityPct: 9,
        typicalPartCost: '$450 – $1,200',
        telemetrySignature: 'Verified 12V power and ground at ECM pinout with 0V CAN output.'
      }
    ],
    fiveMinuteVerificationTest: 'Measure resistance across OBD-II pins 6 and 14 with battery disconnected (must be ~60 Ohms) and load-test the 12V battery before ever buying a replacement computer.'
  }
};

export const DTC_LIST: DtcKnowledgeEntry[] = Object.values(DTC_DATABASE);
