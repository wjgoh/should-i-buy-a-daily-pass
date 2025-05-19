import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const targetUrl = searchParams.get('url');
  
  if (!targetUrl) {
    return NextResponse.json({ error: 'URL parameter is missing' }, { status: 400 });
  }
  
  try {
    const response = await fetch(targetUrl);
    const data = await response.json();
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching fare data:', error);
    return NextResponse.json({ error: 'Failed to fetch fare data' }, { status: 500 });
  }
}