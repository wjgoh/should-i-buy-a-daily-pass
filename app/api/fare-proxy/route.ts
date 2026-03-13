import { NextResponse } from 'next/server';

const API_BASE_URL = process.env.RAPIDKL_API_URL;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const from = searchParams.get('from');
  const to = searchParams.get('to');
  
  if (!from || !to) {
    return NextResponse.json({ error: 'Missing from or to parameters' }, { status: 400 });
  }

  if (!API_BASE_URL) {
    return NextResponse.json({ error: 'API URL not configured' }, { status: 500 });
  }
  
  try {
    const targetUrl = `${API_BASE_URL}?agency=rapidkl&from=${from}&to=${to}`;
    console.log('Fetching from:', targetUrl);
    
    const response = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    
    const data = await response.json();
    console.log('API Response status:', response.status);
    
    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching fare data:', error);
    return NextResponse.json({ error: 'Failed to fetch fare data' }, { status: 500 });
  }
}