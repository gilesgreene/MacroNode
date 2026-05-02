import { FredObservation } from './types';

const cache = new Map<string, { data: { observations: FredObservation[] }; timestamp: number }>();
const TTL = 6 * 60 * 60 * 1000; // 6 hours in ms

export async function fetchFredData(seriesId: string, observationStart?: string): Promise<{ observations: FredObservation[] }> {
  const cacheKey = `${seriesId}-${observationStart || ''}`;
  const cachedEntry = cache.get(cacheKey);

  if (cachedEntry && Date.now() - cachedEntry.timestamp < TTL) {
    return cachedEntry.data;
  }

  const apiKey = process.env.FRED_API_KEY;
  if (!apiKey) {
    console.warn('FRED_API_KEY is not defined, returning mock data');
    return generateMockData(seriesId, observationStart);
  }

  const url = new URL('https://api.stlouisfed.org/fred/series/observations');
  url.searchParams.append('series_id', seriesId);
  url.searchParams.append('api_key', apiKey);
  url.searchParams.append('file_type', 'json');
  if (observationStart) {
    url.searchParams.append('observation_start', observationStart);
  }

  const response = await fetch(url.toString());
  
  if (!response.ok) {
    throw new Error(`FRED API error: ${response.statusText}`);
  }

  const data = await response.json();
  
  cache.set(cacheKey, {
    data: { observations: data.observations },
    timestamp: Date.now(),
  });

  return data;
}

function generateMockData(seriesId: string, start?: string): { observations: FredObservation[] } {
  const observations: FredObservation[] = [];
  const startDate = start ? new Date(start) : new Date('2020-01-01');
  const endDate = new Date();
  
  let current = new Date(startDate);
  let val = 100;
  
  while (current <= endDate) {
    const dateStr = current.toISOString().split('T')[0];
    val += (Math.random() - 0.45) * 5;
    observations.push({ date: dateStr, value: val.toFixed(2) });
    current.setMonth(current.getMonth() + 1);
  }
  
  return { observations };
}
