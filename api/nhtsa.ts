export interface NhtsaApiPayload {
  vehiclePatch: {
    year?: number;
    make?: string;
    model?: string;
    trim?: string;
    engine?: string;
    transmission?: string;
  };
  recalls: Array<{
    nhtsaCampaignNumber: string;
    component: string;
    summary: string;
    consequence: string;
    remedy: string;
    reportReceivedDate: string;
    parkIt?: boolean;
    parkOutSide?: boolean;
  }>;
  complaintClusters: Array<{
    component: string;
    count: number;
    crashCount: number;
    fireCount: number;
    sampleSummaries: Array<{
      odiNumber: string;
      dateOfIncident: string;
      summary: string;
    }>;
  }>;
  totalComplaintsCount: number;
  source: 'LIVE_NHTSA_API';
}

export async function queryLiveNhtsaData(params: {
  vin?: string;
  year?: string | number;
  make?: string;
  model?: string;
}): Promise<NhtsaApiPayload> {
  const vin = String(params.vin || '').trim().toUpperCase();
  let year = Number(params.year) || 2020;
  let make = String(params.make || 'HONDA').trim().toUpperCase();
  let model = String(params.model || 'CR-V').trim().toUpperCase();

  const vehiclePatch: NhtsaApiPayload['vehiclePatch'] = {};

  // 1. Decode VIN via NHTSA vPIC API if 17 chars
  if (vin.length === 17) {
    try {
      const vpicUrl = `https://vpic.nhtsa.dot.gov/api/vehicles/DecodeVinValuesExtended/${encodeURIComponent(
        vin
      )}?format=json`;
      const vpicRes = await fetch(vpicUrl, { signal: AbortSignal.timeout(6500) });
      if (vpicRes.ok) {
        const vpicJson = (await vpicRes.json()) as { Results?: Array<Record<string, string>> };
        const row = vpicJson?.Results?.[0];
        if (row) {
          if (row.ModelYear && !isNaN(Number(row.ModelYear))) {
            year = Number(row.ModelYear);
            vehiclePatch.year = year;
          }
          if (row.Make) {
            make = row.Make.trim().toUpperCase();
            vehiclePatch.make = make;
          }
          if (row.Model) {
            model = row.Model.trim().toUpperCase();
            vehiclePatch.model = model;
          }
          if (row.Trim) {
            vehiclePatch.trim = row.Trim.trim();
          }
          const engParts = [
            row.DisplacementL ? `${Number(row.DisplacementL).toFixed(1)}L` : '',
            row.EngineCylinders ? `V${row.EngineCylinders}/I${row.EngineCylinders}` : '',
            row.EngineModel ? `(${row.EngineModel})` : ''
          ].filter(Boolean);
          if (engParts.length > 0) {
            vehiclePatch.engine = engParts.join(' ');
          }
        }
      }
    } catch {
      // Proceed with provided year/make/model
    }
  }

  // 2. Fetch Recalls and ODI Complaints in parallel from api.nhtsa.gov
  const recallsUrl = `https://api.nhtsa.gov/recalls/recallsByVehicle?make=${encodeURIComponent(
    make.toLowerCase()
  )}&model=${encodeURIComponent(model.toLowerCase())}&modelYear=${encodeURIComponent(String(year))}`;

  const complaintsUrl = `https://api.nhtsa.gov/complaints/complaintsByVehicle?make=${encodeURIComponent(
    make.toLowerCase()
  )}&model=${encodeURIComponent(model.toLowerCase())}&modelYear=${encodeURIComponent(String(year))}`;

  const [recallsSettled, complaintsSettled] = await Promise.allSettled([
    fetch(recallsUrl, { signal: AbortSignal.timeout(7000) }),
    fetch(complaintsUrl, { signal: AbortSignal.timeout(7000) })
  ]);

  const recalls: NhtsaApiPayload['recalls'] = [];
  if (recallsSettled.status === 'fulfilled' && recallsSettled.value.ok) {
    const recJson = (await recallsSettled.value.json()) as {
      results?: Array<Record<string, unknown>>;
    };
    if (Array.isArray(recJson?.results)) {
      recJson.results.slice(0, 40).forEach((r) => {
        recalls.push({
          nhtsaCampaignNumber: String(r.NHTSACampaignNumber || ''),
          component: String(r.Component || 'UNKNOWN SUBSYSTEM'),
          summary: String(r.Summary || ''),
          consequence: String(r.Consequence || ''),
          remedy: String(r.Remedy || ''),
          reportReceivedDate: String(r.ReportReceivedDate || ''),
          parkIt: Boolean(r.parkIt),
          parkOutSide: Boolean(r.parkOutSide)
        });
      });
    }
  }

  let totalComplaintsCount = 0;
  const complaintClusters: NhtsaApiPayload['complaintClusters'] = [];

  if (complaintsSettled.status === 'fulfilled' && complaintsSettled.value.ok) {
    const compJson = (await complaintsSettled.value.json()) as {
      count?: number;
      results?: Array<Record<string, unknown>>;
    };
    const results = Array.isArray(compJson?.results) ? compJson.results : [];
    totalComplaintsCount = Number(compJson?.count || results.length);

    // Group complaints by primary component
    const clusterMap = new Map<
      string,
      {
        component: string;
        count: number;
        crashCount: number;
        fireCount: number;
        sampleSummaries: Array<{ odiNumber: string; dateOfIncident: string; summary: string }>;
      }
    >();

    results.forEach((item) => {
      const rawComp = String(item.components || 'OTHER').split(',')[0].trim().toUpperCase();
      const existing = clusterMap.get(rawComp) || {
        component: rawComp,
        count: 0,
        crashCount: 0,
        fireCount: 0,
        sampleSummaries: []
      };
      existing.count += 1;
      if (item.crash) existing.crashCount += 1;
      if (item.fire) existing.fireCount += 1;
      if (existing.sampleSummaries.length < 2 && item.summary) {
        existing.sampleSummaries.push({
          odiNumber: String(item.odiNumber || ''),
          dateOfIncident: String(item.dateOfIncident || ''),
          summary: String(item.summary || '').slice(0, 320)
        });
      }
      clusterMap.set(rawComp, existing);
    });

    const sortedClusters = Array.from(clusterMap.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
    complaintClusters.push(...sortedClusters);
  }

  return {
    vehiclePatch,
    recalls,
    complaintClusters,
    totalComplaintsCount,
    source: 'LIVE_NHTSA_API'
  };
}

// Vercel Serverless Handler
export default async function handler(req: { query?: Record<string, string>; url?: string }, res: {
  status: (code: number) => { json: (body: unknown) => void };
  setHeader: (name: string, value: string) => void;
}) {
  try {
    const urlObj = new URL(req.url || '/', 'http://localhost');
    const vin = req.query?.vin || urlObj.searchParams.get('vin') || '';
    const year = req.query?.year || urlObj.searchParams.get('year') || '2020';
    const make = req.query?.make || urlObj.searchParams.get('make') || 'HONDA';
    const model = req.query?.model || urlObj.searchParams.get('model') || 'CR-V';

    const payload = await queryLiveNhtsaData({ vin, year, make, model });
    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate');
    return res.status(200).json(payload);
  } catch (err) {
    return res.status(502).json({
      error: err instanceof Error ? err.message : 'Failed to query NHTSA API'
    });
  }
}
