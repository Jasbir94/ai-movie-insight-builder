import { NextResponse } from 'next/server';
import { fetchTMDB } from '@/lib/tmdb';

/**
 * GET /api/suggestions
 * Provides real-time movie title suggestions as the user types.
 * Connects directly to TMDB's search engine.
 */
export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q');

    if (!q || q.length < 2) {
        return NextResponse.json({ results: [] });
    }

    try {
        // Fetch matches from TMDB's global search index
        const data = await fetchTMDB('/search/movie', {
            query: q,
            include_adult: false,
            page: 1
        });

        const results = data.results || [];

        const suggestions = results.slice(0, 5).map(m => ({
            id: m.id,
            title: m.title,
            year: m.release_date ? m.release_date.split('-')[0] : 'N/A',
            rating: m.vote_average > 0 ? m.vote_average.toFixed(1) : 'NR',
            poster: m.poster_path ? `https://image.tmdb.org/t/p/w92${m.poster_path}` : null
        }));

        return NextResponse.json({ suggestions });
    } catch (err) {
        console.error("Suggestions error:", err.message);
        return NextResponse.json({ suggestions: [] });
    }
}
