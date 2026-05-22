import { NextResponse } from 'next/server';

export const revalidate = 86400; // Revalidate daily

export async function GET() {
  const apiKey = process.env.FMP_API_KEY;
  const today = new Date();
  const from = today.toISOString().split('T')[0];
  const nextMonth = new Date();
  nextMonth.setDate(today.getDate() + 30);
  const to = nextMonth.toISOString().split('T')[0];

  if (!apiKey) {
    console.warn('FMP API Key not configured, falling back to mock calendar data');
    return NextResponse.json(generateMockCalendar(from, to));
  }

  try {
    // Fetch Economic Calendar from FMP Stable (Modern Endpoint)
    const res = await fetch(
      `https://financialmodelingprep.com/stable/economic-calendar?from=${from}&to=${to}&apikey=${apiKey}`
    );
    
    if (!res.ok) {
      console.warn(`FMP API returned status ${res.status}, falling back to mock calendar data`);
      return NextResponse.json(generateMockCalendar(from, to));
    }
    
    const text = await res.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch (parseErr) {
      console.warn('FMP API response was not valid JSON, falling back to mock calendar data:', text);
      return NextResponse.json(generateMockCalendar(from, to));
    }

    if (!Array.isArray(data)) {
      console.warn('FMP Error Response or not an array, falling back to mock calendar data:', data);
      return NextResponse.json(generateMockCalendar(from, to));
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
    console.error('FMP Calendar fetch error, falling back to mock calendar data:', error);
    return NextResponse.json(generateMockCalendar(from, to));
  }
}

function generateMockCalendar(fromStr: string, toStr: string): any[] {
  const events = [];
  const fromDate = new Date(fromStr);
  const toDate = new Date(toStr);
  
  // Define templates for recurring events
  const templates: {
    event: string;
    time: string;
    importance: 'High' | 'Medium' | 'Low';
    category: string;
    dayOfWeek: number;
    weekOfMonth: number;
    forecast: string;
    previous: string;
    actual: string | undefined;
  }[] = [
    {
      event: 'CPI MoM',
      time: '08:30 AM',
      importance: 'High',
      category: 'Inflation',
      dayOfWeek: 2, // Tuesday
      weekOfMonth: 2, // Second week
      forecast: '0.2%',
      previous: '0.3%',
      actual: undefined
    },
    {
      event: 'Non Farm Payrolls',
      time: '08:30 AM',
      importance: 'High',
      category: 'Labor',
      dayOfWeek: 5, // Friday
      weekOfMonth: 1, // First week
      forecast: '185K',
      previous: '220K',
      actual: undefined
    },
    {
      event: 'Unemployment Rate',
      time: '08:30 AM',
      importance: 'High',
      category: 'Labor',
      dayOfWeek: 5, // Friday
      weekOfMonth: 1, // First week
      forecast: '3.9%',
      previous: '3.8%',
      actual: undefined
    },
    {
      event: 'FOMC Interest Rate Decision',
      time: '02:00 PM',
      importance: 'High',
      category: 'Central Bank',
      dayOfWeek: 3, // Wednesday
      weekOfMonth: 3, // Third week
      forecast: '5.25%',
      previous: '5.25%',
      actual: undefined
    },
    {
      event: 'Retail Sales MoM',
      time: '08:30 AM',
      importance: 'Medium',
      category: 'Consumer',
      dayOfWeek: 4, // Thursday
      weekOfMonth: 2, // Second week
      forecast: '0.4%',
      previous: '-0.1%',
      actual: undefined
    },
    {
      event: 'Initial Jobless Claims',
      time: '08:30 AM',
      importance: 'Medium',
      category: 'Labor',
      dayOfWeek: 4, // Every Thursday
      weekOfMonth: -1, // -1 means every week
      forecast: '215K',
      previous: '210K',
      actual: undefined
    },
    {
      event: 'GDP Growth Rate QoQ (Est)',
      time: '08:30 AM',
      importance: 'High',
      category: 'Growth',
      dayOfWeek: 4, // Thursday
      weekOfMonth: 4, // Fourth week
      forecast: '2.1%',
      previous: '2.5%',
      actual: undefined
    },
    {
      event: 'S&P Global Manufacturing PMI',
      time: '09:45 AM',
      importance: 'Medium',
      category: 'Economic',
      dayOfWeek: 1, // Monday
      weekOfMonth: 3, // Third week
      forecast: '50.8',
      previous: '51.3',
      actual: undefined
    },
    {
      event: 'Consumer Confidence',
      time: '10:00 AM',
      importance: 'Medium',
      category: 'Consumer',
      dayOfWeek: 2, // Tuesday
      weekOfMonth: 4, // Fourth week
      forecast: '104.0',
      previous: '104.7',
      actual: undefined
    }
  ];

  let current = new Date(fromDate);
  while (current <= toDate) {
    const day = current.getDay(); // 0-6 (Sun-Sat)
    const dateNum = current.getDate();
    // Calculate week of month (1-5)
    const weekVal = Math.ceil(dateNum / 7);
    
    // Check which templates match today
    for (const t of templates) {
      const dayMatches = t.dayOfWeek === day;
      const weekMatches = t.weekOfMonth === -1 || t.weekOfMonth === weekVal;
      
      if (dayMatches && weekMatches) {
        const dateStr = current.toISOString().split('T')[0];
        
        // Generate actual value only if the event date has passed
        let actual = t.actual;
        const todayStr = new Date().toISOString().split('T')[0];
        if (dateStr < todayStr) {
          if (t.event === 'Unemployment Rate') actual = '3.8%';
          else if (t.event === 'CPI MoM') actual = '0.2%';
          else if (t.event === 'Non Farm Payrolls') actual = '175K';
          else if (t.event === 'FOMC Interest Rate Decision') actual = '5.25%';
          else if (t.event === 'Initial Jobless Claims') actual = '212K';
          else actual = t.forecast;
        }
        
        events.push({
          id: `${t.event}-${dateStr}`,
          date: dateStr,
          time: t.time,
          event: t.event,
          importance: t.importance,
          category: t.category,
          forecast: t.forecast,
          previous: t.previous,
          actual: actual
        });
      }
    }
    
    current.setDate(current.getDate() + 1);
  }
  
  // Sort ascending by date
  return events.sort((a, b) => a.date.localeCompare(b.date));
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
