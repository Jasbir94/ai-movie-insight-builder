import { NextResponse } from 'next/server';
import { fetchTMDB } from '@/lib/tmdb';
import { searchYouTubeTrailerWithStats } from '@/lib/youtube';

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const personId = searchParams.get('personId');

    if (!personId) {
        return NextResponse.json({ error: 'Missing personId' }, { status: 400 });
    }

    try {
        // Step 1: Fetch the person's movie credits from TMDB
        const data = await fetchTMDB(`/person/${personId}`, { append_to_response: 'movie_credits' });
        const rawCredits = data.movie_credits?.cast || [];

        // Step 2: Pick the top 10 candidates by TMDB popularity (to limit YouTube API quota usage)
        const candidates = rawCredits
            .filter(c => c.vote_average > 5 && c.vote_count > 100 && c.poster_path)
            .sort((a, b) => b.popularity - a.popularity)
            .slice(0, 10);

        // Step 3: For each candidate, fetch YouTube trailer stats in parallel
        const scored = await Promise.all(candidates.map(async (movie) => {
            const year = (movie.release_date || '').substring(0, 4);
            const ytResult = await searchYouTubeTrailerWithStats(movie.title, year);

            const views = ytResult?.stats?.views || 0;
            const comments = ytResult?.stats?.comments || 0;
            const likes = ytResult?.stats?.likes || 0;

            // ── AI Scoring Formula ──
            // Weighted combination of:
            //   • TMDB IMDb-equivalent rating (0-10 scale, weight = 15)
            //   • YouTube trailer views (log10 to prevent huge numbers dominating)
            //   • YouTube comments × 2 (engagement signal, weighted higher than views)
            //   • YouTube likes (lighter weight)
            const ratingScore = movie.vote_average * 15;
            const viewScore = views > 0 ? Math.log10(views) * 8 : 0;
            const commentScore = comments > 0 ? Math.log10(comments * 2) * 6 : 0;
            const likeScore = likes > 0 ? Math.log10(likes) * 3 : 0;
            const totalScore = ratingScore + viewScore + commentScore + likeScore;

            return {
                id: movie.id,
                title: movie.title,
                poster: movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : null,
                year,
                rating: movie.vote_average > 0 ? movie.vote_average.toFixed(1) : 'NR',
                character: movie.character,
                youtubeTrailerId: ytResult?.videoId || null,
                stats: {
                    views,
                    comments,
                    likes,
                    viewsLabel: formatNumber(views),
                    commentsLabel: formatNumber(comments),
                },
                score: parseFloat(totalScore.toFixed(2))
            };
        }));

        // Step 4: Sort by total score and return top 5
        const recommendations = scored
            .sort((a, b) => b.score - a.score)
            .slice(0, 5);

        return NextResponse.json({ recommendations });
    } catch (err) {
        console.error('Recommend API error:', err.message);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

function formatNumber(n) {
    if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
    if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K';
    return n.toString();
}
