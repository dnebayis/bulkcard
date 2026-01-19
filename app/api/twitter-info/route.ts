import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const username = searchParams.get('username');

    if (!username) {
        return NextResponse.json({ error: 'Username is required' }, { status: 400 });
    }

    try {
        // Use fxtwitter/fixupx API (reliable public metadata)
        const response = await fetch(`https://api.fxtwitter.com/${username}`);

        if (!response.ok) {
            return NextResponse.json({ name: null });
        }

        const data = await response.json();
        console.log(`[TwitterInfo] Fetched for ${username}:`, data);

        // Structure is { user: { name: "..." } }
        return NextResponse.json({ name: data.user?.name || null });
    } catch (error) {
        console.error('Failed to fetch twitter info:', error);
        return NextResponse.json({ name: null });
    }
}
