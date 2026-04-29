import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * Generates a signed upload signature for Cloudinary.
 * This allows the client to upload directly to Cloudinary without going through our server.
 */
export async function POST(req: NextRequest) {
    try {
        // 1. Auth check
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ success: false, message: 'Unauthorized.' }, { status: 401 });
        }

        // 2. Admin role check
        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();

        if (profile?.role !== 'admin') {
            return NextResponse.json({ success: false, message: 'Forbidden. Admin access required.' }, { status: 403 });
        }

        // 3. Get parameters from body
        const body = await req.json();
        const { timestamp, folder } = body;

        if (!timestamp || !folder) {
            return NextResponse.json({ success: false, message: 'Missing parameters.' }, { status: 400 });
        }

        const apiSecret = process.env.CLOUDINARY_API_SECRET;
        const apiKey = process.env.CLOUDINARY_API_KEY;
        const cloudName = process.env.CLOUDINARY_CLOUD_NAME;

        if (!apiSecret || !apiKey || !cloudName) {
            return NextResponse.json({ success: false, message: 'Cloudinary configuration missing.' }, { status: 500 });
        }

        // 4. Generate SHA-1 signature
        // Cloudinary signature formula: (all params in alphabetical order) + secret
        const signaturePayload = `folder=${folder}&timestamp=${timestamp}${apiSecret}`;
        
        const encoder = new TextEncoder();
        const data = encoder.encode(signaturePayload);
        const hashBuffer = await crypto.subtle.digest('SHA-1', data);
        const signature = Array.from(new Uint8Array(hashBuffer))
            .map((b) => b.toString(16).padStart(2, '0'))
            .join('');

        return NextResponse.json({ 
            success: true,
            signature, 
            apiKey,
            cloudName
        });
    } catch (error: any) {
        console.error('[cloudinary-sign] Error:', error);
        return NextResponse.json({ success: false, message: error.message || 'Signature generation failed.' }, { status: 500 });
    }
}
