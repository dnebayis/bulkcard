import { NextRequest, NextResponse } from 'next/server';

/**
 * Server-Side Avatar Proxy for X (Twitter) Profile Pictures
 * 
 * This API route fetches user avatars server-side to avoid CORS issues
 * and ensure HTML Canvas can use the images without tainting.
 * 
 * Flow:
 * Browser → /api/avatar?username=elonmusk → Server fetches from unavatar.io → Returns image bytes
 */

export const runtime = 'edge'; // Optimized for Vercel Edge

export async function GET(request: NextRequest) {
    try {
        // Extract username from query parameters
        const { searchParams } = new URL(request.url);
        const username = searchParams.get('username');

        // Validate input
        if (!username || typeof username !== 'string' || username.trim().length === 0) {
            return new NextResponse('Username is required', { status: 400 });
        }

        // Sanitize username (remove @ if present, basic validation)
        const cleanUsername = username.replace('@', '').trim();

        // Basic validation: Twitter usernames are alphanumeric + underscore, 1-15 chars
        if (!/^[a-zA-Z0-9_]{1,15}$/.test(cleanUsername)) {
            console.error(`[Avatar API] Invalid username format: ${cleanUsername}`);
            return new NextResponse('Invalid username format', { status: 400 });
        }

        console.log(`[Avatar API] Fetching avatar for: ${cleanUsername} (length: ${cleanUsername.length})`);

        // Strategy 1: Try with fallback=false (only real avatars)
        let avatarUrl = `https://unavatar.io/twitter/${cleanUsername}?fallback=false`;
        console.log(`[Avatar API] Strategy 1 - URL: ${avatarUrl}`);
        let response = await fetch(avatarUrl, {
            headers: {
                'User-Agent': 'BULK-Card-Generator/1.0',
            },
            // Set timeout
            signal: AbortSignal.timeout(5000),
        });
        console.log(`[Avatar API] Strategy 1 - Status: ${response.status}`);

        // If Strategy 1 fails, try Strategy 2: Default (includes default avatar)
        if (!response.ok || response.status === 404) {
            avatarUrl = `https://unavatar.io/twitter/${cleanUsername}`;
            console.log(`[Avatar API] Strategy 2 - URL: ${avatarUrl}`);
            response = await fetch(avatarUrl, {
                headers: {
                    'User-Agent': 'BULK-Card-Generator/1.0',
                },
                signal: AbortSignal.timeout(5000),
            });
            console.log(`[Avatar API] Strategy 2 - Status: ${response.status}`);
        }

        // If Strategy 2 fails, try Strategy 3: Explicit fallback
        if (!response.ok || response.status === 404) {
            avatarUrl = `https://unavatar.io/twitter/${cleanUsername}?fallback=true`;
            console.log(`[Avatar API] Strategy 3 - URL: ${avatarUrl}`);
            response = await fetch(avatarUrl, {
                headers: {
                    'User-Agent': 'BULK-Card-Generator/1.0',
                },
                signal: AbortSignal.timeout(3000),
            });
            console.log(`[Avatar API] Strategy 3 - Status: ${response.status}`);
        }

        // If all strategies failed, return 404
        if (!response.ok) {
            console.warn(`[Avatar API] All strategies failed for username: ${cleanUsername}`);
            return new NextResponse('Avatar not found', { status: 404 });
        }

        console.log(`[Avatar API] Successfully loaded avatar for: ${cleanUsername}`);

        // Get image data as ArrayBuffer
        const imageBuffer = await response.arrayBuffer();

        // Determine content type (fallback to image/png if not provided)
        const contentType = response.headers.get('content-type') || 'image/png';

        // Return image with proper headers
        return new NextResponse(imageBuffer, {
            status: 200,
            headers: {
                'Content-Type': contentType,
                // Enable CORS for same-origin requests
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET',
                // Cache for 1 hour (avatars don't change frequently)
                'Cache-Control': 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400',
                // Security headers
                'X-Content-Type-Options': 'nosniff',
            },
        });

    } catch (error) {
        console.error('Avatar proxy error:', error);

        // Handle timeout errors specifically
        if (error instanceof Error && error.name === 'TimeoutError') {
            return new NextResponse('Request timeout', { status: 504 });
        }

        // Generic server error
        return new NextResponse('Internal server error', { status: 500 });
    }
}
