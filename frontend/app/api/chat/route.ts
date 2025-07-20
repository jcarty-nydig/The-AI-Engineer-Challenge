import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const apiRes = await fetch('http://localhost:8000/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    const text = await apiRes.text();
    // Try to parse as JSON, fallback to text
    try {
      const data = JSON.parse(text);
      return NextResponse.json(data, { status: apiRes.status });
    } catch {
      return new NextResponse(text, { status: apiRes.status });
    }
  } catch (err) {
    return NextResponse.json({ response: 'Proxy error: ' + (err instanceof Error ? err.message : 'Unknown error') }, { status: 500 });
  }
}

