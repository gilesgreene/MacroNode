import { NextResponse } from 'next/server';

export const revalidate = 86400; // Revalidate daily

export async function GET() {
  const apiKey = process.env.FMP_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'FMP API Key not configured' }, { status: 500 });
  }

  const today = new Date();
  const from = today.toISOString().split('T')[0];
  const nextMonth = new Date();
  nextMonth.setDate(today.getDate() + 30);
  const to = nextMonth.toISOString().split('T')[0];

  try {
    // Fetch Economic Calendar from FMP Stable (Modern Endpoint)
    const res = await fetch(
      `https://financialmodelingprep.com/stable/economic-calendar?from=${from}&to=${to}&apikey=${apiKey}`
    );
    const data = await res.json();

    if (!Array.isArray(data)) {
      console.error('FMP Error Response:', data);
      return NextResponse.json({ 
        error: data['Error Message'] || data['message'] || 'Invalid response from FMP' 
      }, { status: 400 });
    }

    // Filter for US events, map to our structure, and sort by date ascending
    const formattedEvents = data
      .filter((e: any) => e.country === 'US')
      .map((e: any) => ({
        id: `${e.event}-${e.date}`,
        date: e.date.split(' ')[0],
        time: e.date.split(' ')[1] ? formatTime(e.date.split(' ')[1]) : '08:30 AM',
        event: e.event,
        importance: e.impact === 'High' ? 'High' : e.impact === 'Medium' ? 'Medium' : 'Low',
        category: getCategory(e.event),
        forecast: e.estimate ? formatValue(e.estimate) : '--',
        previous: e.previous ? formatValue(e.previous) : '--',
        actual: e.actual ? formatValue(e.actual) : undefined
      }))
      .sort((a: any, b: any) => a.date.localeCompare(b.date));

    return NextResponse.json(formattedEvents);
  } catch (error) {
    console.error('FMP Calendar fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch calendar data' }, { status: 500 });
  }
}

function formatTime(timeStr: string) {
  // Convert HH:mm:ss to hh:mm AM/PM
  const [h, m] = timeStr.split(':');
  const hour = parseInt(h);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${m} ${ampm}`;
}

function formatValue(val: number) {
  if (Math.abs(val) > 1000) {
    return `${(val / 1000).toFixed(1)}K`;
  }
  return `${val.toFixed(1)}%`;
}

function getCategory(event: string) {
  const e = event.toLowerCase();
  if (e.includes('cpi') || e.includes('pce') || e.includes('inflation')) return 'Inflation';
  if (e.includes('payroll') || e.includes('unemployment') || e.includes('jobless')) return 'Labor';
  if (e.includes('gdp')) return 'Growth';
  if (e.includes('fed') || e.includes('fomc') || e.includes('interest rate')) return 'Central Bank';
  if (e.includes('retail') || e.includes('consumer')) return 'Consumer';
  return 'Economic';
}
