'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import MovieHero from '@/components/MovieHero';
import SentimentCard from '@/components/SentimentCard';
import CastGrid from '@/components/CastGrid';
import LoadingSkeleton from '@/components/LoadingSkeleton';
import VideoPlayer from '@/components/VideoPlayer';
import SuggestedMovies from '@/components/SuggestedMovies';
import { ArrowLeft, Search as SearchIcon, AlertCircle } from 'lucide-react';
import styles from './results.module.css';

/**
 * ResultsContent Component
 * The central logic hub for movie insights. 
 * Orchestrates multi-source data fetching: Meta-data (TMDB), Engagement (YouTube), and Scraped Reviews (IMDb).
 */
function ResultsContent() {
    const searchParams = useSearchParams();
    const id = searchParams.get('id');
    const router = useRouter();

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [data, setData] = useState({
        movie: null,
        sentiment: null,
    });

    /**
     * Effect: Track user engagement streak.
     */
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const current = parseInt(localStorage.getItem('movieStreak') || '0', 10);
            localStorage.setItem('movieStreak', current + 1);
        }
    }, []);

    /**
     * Effect: Core Data Orchestration.
     * Sequentially fetches and builds the complete "Insight" profile for the movie.
     */
    useEffect(() => {
        if (!id) {
            setError('No movie selection detected. Please search for a title.');
            setLoading(false);
            return;
        }

        const fetchData = async () => {
            try {
                setLoading(true);
                setError('');

                // Phase 1: Fetch rich movie metadata & credits from TMDB
                const movieRes = await fetch(`/api/movie?id=${encodeURIComponent(id)}`);
                if (!movieRes.ok) {
                    const err = await movieRes.json();
                    throw new Error(err.error || 'Movie lookup failed');
                }
                const movieData = await movieRes.json();
                setData(prev => ({ ...prev, movie: movieData }));

                // Phase 2: Fetch raw audience reviews via the Scraper API
                const reviewsRes = await fetch(`/api/reviews?id=${movieData.imdbID}`);
                let reviews = [];
                if (reviewsRes.ok) {
                    const revData = await reviewsRes.json();
                    reviews = revData.reviews;
                }

                // Phase 3: Submit reviews for AI Sentiment extraction
                const sentimentRes = await fetch('/api/sentiment', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ reviews, movieTitle: movieData.title })
                });

                if (sentimentRes.ok) {
                    const sentimentData = await sentimentRes.json();
                    setData(prev => ({ ...prev, sentiment: sentimentData }));
                }

            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id]);

    if (loading && !data.movie) {
        return <LoadingSkeleton />;
    }

    if (error) {
        return (
            <div className={styles.errorContainer}>
                <div className={styles.errorIcon}>
                    <AlertCircle size={48} color="var(--negative)" />
                </div>
                <h2>Oops! Something went wrong</h2>
                <p className={styles.errorMessage}>{error}</p>
                <button onClick={() => router.push('/')} className={styles.backButton}>
                    <SearchIcon size={18} /> Try a different movie
                </button>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <button onClick={() => router.push('/')} className={styles.navBack}>
                <ArrowLeft size={18} /> Search Another Movie
            </button>

            {data.movie && (
                <MovieHero movie={data.movie} />
            )}

            {loading && data.movie && !data.sentiment ? (
                <div style={{ marginTop: '2rem' }}><LoadingSkeleton /></div>
            ) : (
                data.sentiment && <SentimentCard sentiment={data.sentiment} />
            )}

            {data.movie && data.movie.youtubeTrailerId && (
                <VideoPlayer youtubeId={data.movie.youtubeTrailerId} movieTitle={data.movie.title} />
            )}

            {data.movie && <CastGrid cast={data.movie.cast} />}

            {data.movie && data.movie.tmdbId && (
                <SuggestedMovies movieId={data.movie.tmdbId} />
            )}
        </div>
    );
}

export default function Results() {
    return (
        <main className={styles.main}>
            <Suspense fallback={<LoadingSkeleton />}>
                <ResultsContent />
            </Suspense>
        </main>
    );
}
