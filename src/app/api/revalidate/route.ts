import { NextRequest, NextResponse } from 'next/server';
import { revalidateTag, revalidatePath } from 'next/cache';

/**
 * Protected On-Demand Revalidation Endpoint
 * 
 * Usage:
 *   POST /api/revalidate
 *   Headers: { Authorization: "Bearer <REVALIDATE_SECRET>" }
 *   Body:    { tag?: string, path?: string, type?: "page" | "layout" }
 * 
 * Examples:
 *   Bust all product caches:   { "tag": "products" }
 *   Bust a specific page:      { "path": "/product/whey-protein" }
 *   Bust all brand caches:     { "tag": "brands" }
 *   Bust homepage layout:      { "path": "/", "type": "layout" }
 */
export async function POST(request: NextRequest) {
  const secret = process.env.REVALIDATE_SECRET;

  if (!secret) {
    console.error('[revalidate] REVALIDATE_SECRET is not configured');
    return NextResponse.json(
      { error: 'Server misconfiguration' },
      { status: 500 }
    );
  }

  // Validate authorization
  const authHeader = request.headers.get('authorization');
  const token = authHeader?.replace('Bearer ', '');

  if (token !== secret) {
    return NextResponse.json(
      { error: 'Invalid authorization token' },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();
    const { tag, path, type } = body as {
      tag?: string;
      path?: string;
      type?: 'page' | 'layout';
    };

    if (!tag && !path) {
      return NextResponse.json(
        { error: 'Must provide either "tag" or "path" in request body' },
        { status: 400 }
      );
    }

    const results: string[] = [];

    if (tag) {
      // In Next.js 16.1.6, revalidateTag requires a second argument (e.g., 'max')
      revalidateTag(tag, 'max');
      results.push(`Revalidated tag: ${tag}`);
    }

    if (path) {
      revalidatePath(path, type || 'page');
      results.push(`Revalidated path: ${path} (type: ${type || 'page'})`);
    }

    return NextResponse.json({
      revalidated: true,
      results,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('[revalidate] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Revalidation failed' },
      { status: 500 }
    );
  }
}
