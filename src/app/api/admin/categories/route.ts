import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  
  const limit = parseInt(searchParams.get('limit') || '10');
  const page = parseInt(searchParams.get('page') || '1');
  const sort = searchParams.get('sort') || 'desc';

  const mockData = Array.from({ length: limit }).map((_, i) => ({
    id: `${i + 1 + (page - 1) * limit}`,
    name: 'Mock Categories ${i + 1}',
    status: 'ACTIVE',
    createdAt: new Date().toISOString()
  }));

  const headers = new Headers();
  headers.set('Cache-Control', 's-maxage=60, stale-while-revalidate');

  return NextResponse.json({
    data: mockData,
    meta: {
      total: 100,
      page,
      limit,
      totalPages: Math.ceil(100 / limit)
    }
  }, { headers });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    return NextResponse.json({ message: 'categories created', data: body }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  }
}
