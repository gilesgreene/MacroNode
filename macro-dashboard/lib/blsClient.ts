import { FredObservation } from './types';

const cache = new Map<string, { data: { observations: FredObservation[] }; timestamp: number }>();
const TTL = 24 * 60 * 60 * 1000; // 24 hours in ms

export async function fetchBlsData(seriesId: string, startYear: string, endYear: string): Promise<{ observations: FredObservation[] }> {
  const cacheKey = `${seriesId}-${startYear}-${endYear}`;
  const cachedEntry = cache.get(cacheKey);

  if (cachedEntry && Date.now() - cachedEntry.timestamp < TTL) {
    return cachedEntry.data;
  }

  const apiKey = process.env.BLS_API_KEY;
  // If no API key, BLS limits are very strict. 
  // For now, if no key, we'll return mock or empty, but I'll assume the user will provide one.
  
  if (!apiKey) {
     console.warn('BLS_API_KEY is not defined');
  }

  const response = await fetch('https://api.bls.gov/publicAPI/v2/timeseries/data/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      seriesid: [seriesId],
      startyear: startYear,
      endyear: endYear,
      registrationkey: apiKey,
    }),
  });

  if (!response.ok) {
    throw new Error(`BLS API error: ${response.statusText}`);
  }

  const json = await response.json();
  
  if (json.status === 'REQUEST_NOT_PROCESSED') {
    throw new Error(`BLS API Error: ${json.message[0]}`);
  }

  const series = json.Results.series[0];
  const observations: FredObservation[] = series.data.map((d: any) => {
    // BLS format: { year: "2024", period: "M05", periodName: "May", value: "4.0" }
    // Convert to YYYY-MM-DD
    const month = d.period.replace('M', '');
    return {
      date: `${d.year}-${month}-01`,
      value: d.value,
    };
  }).reverse(); // BLS returns newest first

  const data = { observations };
  
  cache.set(cacheKey, {
    data,
    timestamp: Date.now(),
  });

  return data;
}
