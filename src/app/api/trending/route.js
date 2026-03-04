import { NextResponse } from 'next/server';
import { getTrendingMovies } from '@/lib/tmdb';

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const count = parseInt(searchParams.get('count') || '8', 10);
        const movies = await getTrendingMovies(count);
        return NextResponse.json({ movies });
    } catch (err) {
        return NextResponse.json({ error: 'Failed to fetch trending' }, { status: 500 });
    }
}
