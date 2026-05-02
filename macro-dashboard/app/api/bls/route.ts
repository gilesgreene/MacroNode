import { NextResponse } from 'next/server';
import { fetchBlsData } from '@/lib/blsClient';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const seriesId = searchParams.get('series_id');
    
    if (!seriesId) {
      return NextResponse.json({ error: 'Missing series_id' }, { status: 400 });
    }

    // BLS requires year ranges. We'll default to the last 10 years.
    const currentYear = new Date().getFullYear();
    const startYear = (currentYear - 10).toString();
    const endYear = currentYear.toString();

    const data = await fetchBlsData(seriesId, startYear, endYear);
    
    return NextResponse.json({ observations: data.observations });
  } catch (error: any) {
    console.error('API /api/bls error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
