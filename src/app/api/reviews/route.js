// Re-saved to trigger reload
import { NextResponse } from 'next/server';
import { scrapeReviews } from '@/lib/scraper';

/**
 * GET /api/reviews
 * Fetches audience reviews for a specific movie from IMDb using the scraper module.
 * Reviews are then utilized by the AI Sentiment route.
 */
export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const imdbId = searchParams.get('id');

    if (!imdbId) {
        return NextResponse.json({ error: 'Missing IMDb ID' }, { status: 400 });
    }

    try {
        // Delegates scraping to the lib/scraper utility
        const reviews = await scrapeReviews(imdbId);
        return NextResponse.json({ reviews });
    } catch (err) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
