import { NextResponse } from 'next/server';
import { getMovieDetailsAndCredits } from '@/lib/tmdb';

/**
 * GET /api/movie
 * Fetches detailed movie metadata and credits from TMDB based on a query (title or ID).
 */
export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('id'); // Can be TMDB ID, IMDb ID, or title

    if (!query) {
        return NextResponse.json({ error: 'Missing query' }, { status: 400 });
    }

    try {
        // Core business logic delegated to the TMDB library
        const movie = await getMovieDetailsAndCredits(query);
        return NextResponse.json(movie);
    } catch (err) {
        // Graceful error reporting for the frontend
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
