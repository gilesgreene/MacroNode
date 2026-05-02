import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const topic = searchParams.get('topic') || 'economy_macro';
  const apiKey = process.env.ALPHAVANTAGE_API_KEY;

  if (!apiKey) {
    return NextResponse.json({ error: 'AlphaVantage API Key not configured' }, { status: 500 });
  }

  try {
    const res = await fetch(
      `https://www.alphavantage.co/query?function=NEWS_SENTIMENT&topics=${topic}&apikey=${apiKey}&limit=15`
    );
    const data = await res.json();

    if (data.Note) {
      return NextResponse.json({ error: 'API rate limit reached. Please try again in a minute.' }, { status: 429 });
    }

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch news' }, { status: 500 });
  }
}
