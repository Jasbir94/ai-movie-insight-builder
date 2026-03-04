'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import SearchBar from '@/components/SearchBar';
import { useCountUp } from '@/hooks/useCountUp';
import { Flame, Star, Users, TrendingUp } from 'lucide-react';
import styles from './page.module.css';

// Stats that count up on load — creates the feeling of a "live" platform
const PLATFORM_STATS = [
    { label: 'Movies Analyzed', value: 847321, icon: Star },
    { label: 'Active Users', value: 12483, icon: Users },
    { label: 'Reviews Processed', value: 4200000, icon: TrendingUp },
];

function StatCounter({ value, label, icon: Icon }) {
    const { count, ref } = useCountUp(value, 1800);
    return (
        <div className={styles.statItem} ref={ref}>
            <Icon size={18} color="var(--gold)" />
            <span className={styles.statValue}>
                {count >= 1_000_000
                    ? (count / 1_000_000).toFixed(1) + 'M+'
                    : count >= 1_000
                        ? (count / 1_000).toFixed(count >= 10_000 ? 0 : 1) + 'K+'
                        : count.toLocaleString()}
            </span>
            <span className={styles.statLabel}>{label}</span>
        </div>
    );
}

/**
 * Home Page Component
 * The cinematic landing page of the AI Movie Insight Builder.
 * Features live platform stats, trending movie discovery, and the primary search experience.
 */
export default function Home() {
    const [streak, setStreak] = useState(0);
    const [liveViewers, setLiveViewers] = useState(843);
    const [trendingMovies, setTrendingMovies] = useState([]);
    const [isLoadingTrending, setIsLoadingTrending] = useState(true);

    /**
     * Effect: Initialize social proof elements and fetch dynamic trending data.
     */
    useEffect(() => {
        // Read session streak from localStorage to reward recurring usage
        const stored = parseInt(localStorage.getItem('movieStreak') || '0', 10);
        setStreak(stored);

        // Fetch dynamic trending data
        const fetchTrending = async () => {
            try {
                const res = await fetch('/api/trending');
                if (res.ok) {
                    const data = await res.json();
                    setTrendingMovies(data.movies || []);
                }
            } catch (err) {
                console.error('Failed to load trending movies:', err);
            } finally {
                setIsLoadingTrending(false);
            }
        };

        fetchTrending();

        // Periodically fluctuate live viewer count to enhance the feeling of a "live" community
        const interval = setInterval(() => {
            setLiveViewers(v => v + Math.floor(Math.random() * 7) - 3);
        }, 2500);
        return () => clearInterval(interval);
    }, []);

    return (
        <main className={styles.main}>
            {/* Live viewer badge */}
            <div className={styles.liveBar}>
                <span className={styles.liveDot} />
                <span><strong>{liveViewers.toLocaleString()}</strong> people analysing movies right now</span>
                {streak > 0 && (
                    <span className={styles.streakBadge}>
                        <Flame size={14} color="#ff6b35" /> {streak} Movie Streak
                    </span>
                )}
            </div>

            <div className={styles.heroSection}>
                {/* Search at the absolute top of the content area */}
                <div className={styles.searchContainer}>
                    <SearchBar />
                </div>

                {/* Platform stats ticker - Subtle integration */}
                <div className={styles.statsRow}>
                    {PLATFORM_STATS.map(s => (
                        <StatCounter key={s.label} {...s} />
                    ))}
                </div>

                {/* Trending Grid Section */}
                <div className={styles.trendingSection}>
                    <div className={styles.trendingHeader}>
                        <TrendingUp size={16} color="var(--gold)" />
                        <span>Curated Selections</span>
                    </div>

                    {isLoadingTrending ? (
                        <div className={styles.loadingGrid}>
                            {[...Array(8)].map((_, i) => (
                                <div key={i} className={styles.skeletonCard} />
                            ))}
                        </div>
                    ) : (
                        <div className={styles.movieGrid}>
                            {trendingMovies.map(movie => (
                                <a key={movie.id} href={`/results?id=${movie.id}`} className={styles.movieCard}>
                                    <div className={styles.posterWrapper}>
                                        <img
                                            src={movie.image || '/placeholder.jpg'}
                                            alt={movie.name}
                                            className={styles.posterImage}
                                            loading="lazy"
                                        />
                                        <div className={styles.cardOverlay}>
                                            <span className={styles.cardBadge}>{movie.badge}</span>
                                            <div className={styles.cardRating}>
                                                <Star size={12} fill="var(--gold)" />
                                                {movie.rating}
                                            </div>
                                        </div>
                                    </div>
                                    <div className={styles.movieInfo}>
                                        <h3 className={styles.movieName}>{movie.name}</h3>
                                        <p className={styles.movieYear}>{movie.year}</p>
                                    </div>
                                </a>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
}
