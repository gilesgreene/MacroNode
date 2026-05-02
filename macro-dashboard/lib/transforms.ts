import { ChartPoint, FredObservation, KpiData } from './types';

export function filterValid(obs: FredObservation[]): { date: string; value: number }[] {
  return obs
    .filter((o) => o.value !== '.')
    .map((o) => ({ date: o.date, value: parseFloat(o.value) }));
}

export function toYoY(obs: FredObservation[]): ChartPoint[] {
  const valid = filterValid(obs);
  const result: ChartPoint[] = [];
  
  for (let i = 12; i < valid.length; i++) {
    const current = valid[i];
    const prevYear = valid[i - 12];
    const yoyPct = ((current.value - prevYear.value) / prevYear.value) * 100;
    result.push({ date: current.date, value: yoyPct });
  }
  return result;
}

export function toQtrGrowth(obs: FredObservation[]): ChartPoint[] {
  // A191RL1Q225SBEA is already raw annualized percent
  return filterValid(obs);
}

export function toMonthlyChange(obs: FredObservation[]): ChartPoint[] {
  const valid = filterValid(obs);
  const result: ChartPoint[] = [];
  for (let i = 1; i < valid.length; i++) {
    result.push({
      date: valid[i].date,
      value: valid[i].value - valid[i - 1].value,
    });
  }
  return result;
}

export function resampleToMonthlyAvg(obs: FredObservation[]): ChartPoint[] {
  const valid = filterValid(obs);
  if (valid.length === 0) return [];
  
  const result: ChartPoint[] = [];
  let currentMonth = valid[0].date.substring(0, 7);
  let sum = 0;
  let count = 0;

  for (const point of valid) {
    const month = point.date.substring(0, 7);
    if (month === currentMonth) {
      sum += point.value;
      count++;
    } else {
      result.push({ date: currentMonth + '-01', value: sum / count });
      currentMonth = month;
      sum = point.value;
      count = 1;
    }
  }
  if (count > 0) {
    result.push({ date: currentMonth + '-01', value: sum / count });
  }
  
  return result;
}

export function sliceByRange(data: ChartPoint[], range: '1Y' | '5Y' | '10Y'): ChartPoint[] {
  if (data.length === 0) return data;
  
  const now = new Date();
  let daysToSubtract = 0;
  if (range === '1Y') daysToSubtract = 365;
  if (range === '5Y') daysToSubtract = 1825;
  if (range === '10Y') daysToSubtract = 3650;
  
  const cutoff = new Date(now.getTime() - daysToSubtract * 24 * 60 * 60 * 1000);
  const cutoffStr = cutoff.toISOString().substring(0, 10);
  
  return data.filter((d) => d.date >= cutoffStr);
}

export function latestDelta(
  points: ChartPoint[], 
  period: 'M' | 'Q' | 'W', 
  directionPositive: 'up' | 'down' | 'neutral'
): KpiData | null {
  if (points.length < 2) return null;
  const latest = points[points.length - 1].value;
  
  // To keep simple: compare against the previous point in the sequence
  // If period is W (weekly) on daily series, it should step back 5 business days
  // Here we just use the points array, assuming it's correctly structured or we just compare last two
  let priorIndex = points.length - 2;
  if (period === 'W' && points.length > 5) {
    priorIndex = points.length - 6; // roughly 5 business days ago
  }

  const prior = points[priorIndex].value;
  const delta = latest - prior;
  
  let direction: 'up' | 'down' | 'flat' = 'flat';
  
  // For Yield, spec says 5 bps threshold (0.05)
  if (directionPositive === 'neutral') {
    if (Math.abs(delta) < 0.05) direction = 'flat';
    else direction = delta > 0 ? 'up' : 'down'; 
    // Spec says "neutral - show raw bps change, gray dot always", so we can force flat for color
    direction = 'flat'; 
  } else if (directionPositive === 'up') {
    if (delta > 0) direction = 'up';
    else if (delta < 0) direction = 'down';
  } else {
    // directionPositive is 'down', meaning negative delta is good/up
    if (delta < 0) direction = 'up'; 
    else if (delta > 0) direction = 'down';
  }
  
  return { latest, delta, direction };
}
