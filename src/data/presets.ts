import { QuoteLineInput, VehicleProfile, NhtsaRecallItem, NhtsaComplaintCluster } from '../types/audit';

export interface DealershipCasePreset {
  id: string;
  badge: string;
  title: string;
  subtitle: string;
  vehicle: VehicleProfile;
  rawQuoteText: string;
  lines: QuoteLineInput[];
  fallbackRecalls: NhtsaRecallItem[];
  fallbackComplaints: NhtsaComplaintCluster[];
  fallbackTotalComplaints: number;
}

export const DEALERSHIP_PRESETS: DealershipCasePreset[] = [
  {
    id: 'honda-crv-2020',
    badge: 'CASE #01 · NHTSA RECALL + STEERING + OVERLAP',
    title: '2020 Honda CR-V EX-L ($3,994 Dealer Quote)',
    subtitle: 'Quoted $1,656 for Fuel Pump & Seat Weight Sensor covered by active NHTSA Recalls 23V858 / 26V332 + Front Suspension Labor Overlap',
    vehicle: {
      vin: '2HKRW2H59LH601234',
      year: 2020,
      make: 'HONDA',
      model: 'CR-V',
      trim: 'EX-L AWD',
      engine: '1.5L Turbo I4 (L15BE)',
      transmission: 'CVT Automatic',
      mileage: 64200,
      shopLaborRate: 185,
      dtcCodes: ['P0171', 'B0001']
    },
    rawQuoteText: [
      '1. High/Low Pressure In-Tank Fuel Pump Module Replacement (Stalling / Lean P0171) - Parts: $465.00 | Labor: 2.8 hrs @ $185/hr',
      '2. Front Passenger Seat Weight Sensor SRS Assembly (B0001 Airbag Light) - Parts: $340.00 | Labor: 1.8 hrs @ $185/hr',
      '3. Front Lower Control Arm Assembly Replacement (Both Sides) - Parts: $490.00 | Labor: 3.4 hrs @ $185/hr',
      '4. Front Lower Ball Joint Replacement (Both Sides) - Parts: $195.00 | Labor: 2.6 hrs @ $185/hr',
      '5. BG Platinum Fuel Injection & Upper Intake Induction Chemical Service - Parts: $95.00 | Labor: 1.0 hrs @ $185/hr',
      '6. Cabin & Engine Air Filter Element Replacement - Parts: $115.00 | Labor: 0.8 hrs @ $185/hr'
    ].join('\n'),
    lines: [
      {
        id: 'line-1',
        description: 'In-Tank Fuel Pump Module Replacement (Engine Stall / Lean Code P0171)',
        partPriceQuoted: 465,
        laborHoursQuoted: 2.8,
        laborRateQuoted: 185
      },
      {
        id: 'line-2',
        description: 'Front Passenger Seat Weight Sensor SRS Replacement (Airbag Light B0001)',
        partPriceQuoted: 340,
        laborHoursQuoted: 1.8,
        laborRateQuoted: 185
      },
      {
        id: 'line-3',
        description: 'Front Lower Control Arm Assembly Replacement (Left & Right)',
        partPriceQuoted: 490,
        laborHoursQuoted: 3.4,
        laborRateQuoted: 185
      },
      {
        id: 'line-4',
        description: 'Front Lower Ball Joint Replacement (Left & Right)',
        partPriceQuoted: 195,
        laborHoursQuoted: 2.6,
        laborRateQuoted: 185
      },
      {
        id: 'line-5',
        description: 'BG Platinum Fuel Induction & Throttle Chemical Flush Package',
        partPriceQuoted: 95,
        laborHoursQuoted: 1.0,
        laborRateQuoted: 185
      },
      {
        id: 'line-6',
        description: 'Cabin Pollen & Engine Air Filter Replacement',
        partPriceQuoted: 115,
        laborHoursQuoted: 0.8,
        laborRateQuoted: 185
      }
    ],
    fallbackRecalls: [
      {
        nhtsaCampaignNumber: '23V858000',
        component: 'FUEL SYSTEM, GASOLINE:DELIVERY:FUEL PUMP',
        summary: 'Honda (American Honda Motor Co.) is recalling certain 2017-2020 CR-V vehicles. The impeller inside the low-pressure fuel pump may deform and cause the fuel pump to fail.',
        consequence: 'Fuel pump failure can cause an engine stall while driving, increasing the risk of a crash.',
        remedy: 'Dealers will replace the fuel pump module, free of charge ($0 parts & $0 labor). Honda recall campaign KGC/KGD.',
        reportReceivedDate: '19/12/2023'
      },
      {
        nhtsaCampaignNumber: '26V332000',
        component: 'AIR BAGS:SENSOR:OCCUPANT CLASSIFICATION:FRONT PASSENGER',
        summary: 'Honda is recalling certain 2017-2022 CR-V vehicles. The front passenger seat weight sensor may crack and short circuit, failing to suppress the air bag as intended.',
        consequence: 'Air bags that deploy unintentionally during a crash increase the risk of injury.',
        remedy: 'Dealers will replace the seat weight sensors, free of charge ($0 parts & $0 labor). Expands recall 24V064.',
        reportReceivedDate: '22/05/2026'
      },
      {
        nhtsaCampaignNumber: '19V865000',
        component: 'STRUCTURE:FRAME AND MEMBERS',
        summary: 'The rear subframe bolts were improperly manufactured and may loosen, allowing the rear subframe to separate.',
        consequence: 'A separated rear subframe reduces vehicle handling and increases crash risk.',
        remedy: 'Dealers will inspect and retorque or replace rear subframe bolts free of charge.',
        reportReceivedDate: '05/12/2019'
      }
    ],
    fallbackComplaints: [
      {
        component: 'STEERING',
        count: 118,
        crashCount: 3,
        fireCount: 0,
        sampleSummaries: [
          {
            odiNumber: '11776860',
            dateOfIncident: '11/09/2026',
            summary: 'The steering has been sticking especially when the weather is warm and the car is driving at speed which results in the driver having to jerk the wheel. Dealership says steering box needs complete replacement for thousands of dollars.'
          },
          {
            odiNumber: '11776844',
            dateOfIncident: '07/06/2026',
            summary: 'Sticky steering after driving at highway speeds for awhile; hard to make small adjustments when slightly turning the steering wheel.'
          }
        ]
      },
      {
        component: 'FUEL/PROPULSION SYSTEM',
        count: 89,
        crashCount: 2,
        fireCount: 0,
        sampleSummaries: [
          {
            odiNumber: '11594210',
            dateOfIncident: '03/14/2025',
            summary: 'Vehicle hesitated and threw lean/fuel system warnings on highway prior to fuel pump module recall replacement.'
          }
        ]
      },
      {
        component: 'SERVICE BRAKES / ELECTRICAL',
        count: 94,
        crashCount: 4,
        fireCount: 0,
        sampleSummaries: [
          {
            odiNumber: '11776065',
            dateOfIncident: '10/19/2026',
            summary: 'Warning lights VSA stability and brake system illuminated intermittently due to sensor/harness fault.'
          }
        ]
      }
    ],
    fallbackTotalComplaints: 363
  },
  {
    id: 'subaru-outback-timing',
    badge: 'CASE #02 · TIMING BELT + WATER PUMP OVERLAP',
    title: '2014 Honda Odyssey / V6 Timing Service ($2,834 Quote)',
    subtitle: 'Classic Shared-Teardown Double Billing: Full labor charged separately for Timing Belt, Water Pump, Serpentine Belt & Coolant Flush',
    vehicle: {
      vin: '5FNRL5H62EB041892',
      year: 2014,
      make: 'HONDA',
      model: 'ODYSSEY',
      trim: 'EX-L 3.5L V6',
      engine: '3.5L SOHC i-VTEC V6 (J35Z8)',
      transmission: '6-Speed Automatic',
      mileage: 105400,
      shopLaborRate: 170,
      dtcCodes: ['P0128']
    },
    rawQuoteText: [
      '1. Timing Belt & Hydraulic Tensioner Replacement - Parts: $310.00 | Labor: 4.2 hrs @ $170/hr',
      '2. Engine Water Pump & Gasket Replacement - Parts: $245.00 | Labor: 3.5 hrs @ $170/hr',
      '3. Accessory Serpentine Drive Belt Replacement - Parts: $78.00 | Labor: 1.0 hrs @ $170/hr',
      '4. Engine Coolant Thermostat Replacement (Code P0128) - Parts: $85.00 | Labor: 1.4 hrs @ $170/hr',
      '5. Cooling System Chemical Flush & Bleeding Service - Parts: $65.00 | Labor: 1.2 hrs @ $170/hr',
      '6. Crankshaft & Camshaft Oil Seal Protector Additive - Parts: $79.00 | Labor: 0.3 hrs @ $170/hr'
    ].join('\n'),
    lines: [
      {
        id: 'line-201',
        description: 'Timing Belt & Hydraulic Tensioner Replacement',
        partPriceQuoted: 310,
        laborHoursQuoted: 4.2,
        laborRateQuoted: 170
      },
      {
        id: 'line-202',
        description: 'Engine Water Pump & Gasket Replacement',
        partPriceQuoted: 245,
        laborHoursQuoted: 3.5,
        laborRateQuoted: 170
      },
      {
        id: 'line-203',
        description: 'Accessory Serpentine Drive Belt Replacement',
        partPriceQuoted: 78,
        laborHoursQuoted: 1.0,
        laborRateQuoted: 170
      },
      {
        id: 'line-204',
        description: 'Engine Coolant Thermostat Replacement (Code P0128)',
        partPriceQuoted: 85,
        laborHoursQuoted: 1.4,
        laborRateQuoted: 170
      },
      {
        id: 'line-205',
        description: 'Cooling System Chemical Flush & Bleeding Service',
        partPriceQuoted: 65,
        laborHoursQuoted: 1.2,
        laborRateQuoted: 170
      },
      {
        id: 'line-206',
        description: 'Crankshaft & Camshaft Oil Seal Conditioner Additive',
        partPriceQuoted: 79,
        laborHoursQuoted: 0.3,
        laborRateQuoted: 170
      }
    ],
    fallbackRecalls: [
      {
        nhtsaCampaignNumber: '20V439000',
        component: 'EXTERIOR LIGHTING:BACK UP LIGHTS',
        summary: 'Water may enter the backup light assembly and corrode the camera and wiring.',
        consequence: 'Loss of rearview camera display increases crash risk while backing up.',
        remedy: 'Dealers will replace the rearview camerafree of charge.',
        reportReceivedDate: '28/07/2020'
      }
    ],
    fallbackComplaints: [
      {
        component: 'ENGINE AND ENGINE COOLING',
        count: 74,
        crashCount: 0,
        fireCount: 1,
        sampleSummaries: [
          {
            odiNumber: '11420911',
            dateOfIncident: '08/12/2024',
            summary: 'Timing belt hydraulic tensioner noise on cold start around 95k miles; requires timing belt and water pump service together.'
          }
        ]
      }
    ],
    fallbackTotalComplaints: 288
  },
  {
    id: 'toyota-rav4-brakes-cat',
    badge: 'CASE #03 · BRAKE ROTOR OVERLAP + P0420 CATALYST',
    title: '2019 Toyota RAV4 XLE ($4,230 Brake & Catalyst Quote)',
    subtitle: 'Double-billed Brake Pad + Rotor labor on same axles + $2,135 Catalytic Converter quoted under 80k-mile Federal Emissions Warranty',
    vehicle: {
      vin: '2T3P1RFV4KW029381',
      year: 2019,
      make: 'TOYOTA',
      model: 'RAV4',
      trim: 'XLE AWD',
      engine: '2.5L Dynamic Force I4 (A25A-FKS)',
      transmission: '8-Speed Direct-Shift Automatic',
      mileage: 71800,
      shopLaborRate: 175,
      dtcCodes: ['P0420']
    },
    rawQuoteText: [
      '1. Front Disc Brake Pad Replacement - Parts: $145.00 | Labor: 1.5 hrs @ $175/hr',
      '2. Front Disc Brake Rotor Replacement (Both) - Parts: $290.00 | Labor: 1.6 hrs @ $175/hr',
      '3. Rear Disc Brake Pad Replacement - Parts: $135.00 | Labor: 1.5 hrs @ $175/hr',
      '4. Rear Disc Brake Rotor Replacement (Both) - Parts: $270.00 | Labor: 1.5 hrs @ $175/hr',
      '5. OEM Catalytic Converter Exhaust Manifold Assembly (Code P0420) - Parts: $1,680.00 | Labor: 2.6 hrs @ $175/hr',
      '6. AC Evaporator Foam Deodorizer & Anti-Bacterial Mist - Parts: $85.00 | Labor: 0.6 hrs @ $175/hr'
    ].join('\n'),
    lines: [
      {
        id: 'line-301',
        description: 'Front Disc Brake Pad Replacement',
        partPriceQuoted: 145,
        laborHoursQuoted: 1.5,
        laborRateQuoted: 175
      },
      {
        id: 'line-302',
        description: 'Front Disc Brake Rotor Replacement (Both)',
        partPriceQuoted: 290,
        laborHoursQuoted: 1.6,
        laborRateQuoted: 175
      },
      {
        id: 'line-303',
        description: 'Rear Disc Brake Pad Replacement',
        partPriceQuoted: 135,
        laborHoursQuoted: 1.5,
        laborRateQuoted: 175
      },
      {
        id: 'line-304',
        description: 'Rear Disc Brake Rotor Replacement (Both)',
        partPriceQuoted: 270,
        laborHoursQuoted: 1.5,
        laborRateQuoted: 175
      },
      {
        id: 'line-305',
        description: 'OEM Catalytic Converter Exhaust Assembly (Code P0420 @ 71,800 mi)',
        partPriceQuoted: 1680,
        laborHoursQuoted: 2.6,
        laborRateQuoted: 175
      },
      {
        id: 'line-306',
        description: 'A/C Evaporator Foam Deodorizer & Vent Mist Upsell',
        partPriceQuoted: 85,
        laborHoursQuoted: 0.6,
        laborRateQuoted: 175
      }
    ],
    fallbackRecalls: [
      {
        nhtsaCampaignNumber: '23V734000',
        component: 'ELECTRICAL SYSTEM:12V/24V/48V BATTERY',
        summary: 'Toyota is recalling certain 2013-2018 and 2019 RAV4 vehicles. Replacement 12-volt batteries of smaller top dimensions may loosen during forceful turns and short-circuit against the hold-down clamp.',
        consequence: 'A short-circuit increases the risk of an engine compartment fire.',
        remedy: 'Dealers will replace the battery hold-down clamp, battery tray, and positive terminal cover free of charge.',
        reportReceivedDate: '01/11/2023'
      }
    ],
    fallbackComplaints: [
      {
        component: 'ENGINE AND ENGINE COOLING / COOLANT BYPASS VALVE',
        count: 142,
        crashCount: 0,
        fireCount: 2,
        sampleSummaries: [
          {
            odiNumber: '11602190',
            dateOfIncident: '02/11/2026',
            summary: 'Engine maintenance required message due to plastic coolant bypass valve failure; common 2019 RAV4 defect covered under Customer Support Program.'
          }
        ]
      }
    ],
    fallbackTotalComplaints: 512
  }
];
