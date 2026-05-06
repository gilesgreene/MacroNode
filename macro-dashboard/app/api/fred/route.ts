import { NextResponse } from 'next/server';

export const revalidate = 86400; // Revalidate daily
import { fetchFredData } from '@/lib/fredClient';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const seriesId = searchParams.get('series_id');
    const observationStart = searchParams.get('observation_start');

    if (!seriesId) {
      return NextResponse.json({ error: 'Missing series_id parameter' }, { status: 400 });
    }

    const data = await fetchFredData(seriesId, observationStart || undefined);
    
    return NextResponse.json({ observations: data.observations });
  } catch (error: any) {
    console.error('API /api/fred error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
