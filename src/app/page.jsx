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

const TRENDING_MOVIES = [
    {
        id: 'tt0468569',
        name: 'The Dark Knight',
        year: '2008',
        rating: '9.0',
        image: 'https://image.tmdb.org/t/p/w500/qJ2tW6WMUDp92SKyYw9ebS7n9Uv.jpg',
        badge: '🔥 #1 Trending'
    },
    {
        id: 'tt1375666',
        name: 'Inception',
        year: '2010',
        rating: '8.8',
        image: 'https://image.tmdb.org/t/p/w500/8IB23LsnpiS3mH6hgaqcTuo3vH8.jpg',
        badge: '⭐ Must Watch'
    },
    {
        id: 'tt0133093',
        name: 'The Matrix',
        year: '1999',
        rating: '8.7',
        image: 'https://image.tmdb.org/t/p/w500/f89U3Y9S7Dky35Zgu1ORyccj9eH.jpg',
        badge: '📈 Classic'
    },
    {
        id: 'tt0111161',
        name: 'The Shawshank Redemption',
        year: '1994',
        rating: '9.3',
        image: 'https://image.tmdb.org/t/p/w500/q6y0Go1tsvn2KBigCSTp3qzIuoM.jpg',
        badge: '🏆 Top Rated'
    },
    {
        id: 'tt0109830',
        name: 'Forrest Gump',
        year: '1994',
        rating: '8.8',
        image: 'https://image.tmdb.org/t/p/w500/arw2vcBveWOVZr6pxY9LscAFJs.jpg',
        badge: '💛 Beloved'
    },
    {
        id: 'tt15367370',
        name: 'Everything Everywhere All At Once',
        year: '2022',
        rating: '7.8',
        image: 'https://image.tmdb.org/t/p/w500/rKvC7RM097q966777YVT6B99o8o.jpg',
        badge: '✨ Oscar Winner'
    },
    {
        id: 'tt15239678',
        name: 'Dune: Part Two',
        year: '2024',
        rating: '8.6',
        image: 'https://image.tmdb.org/t/p/w500/czembS0Rhi6BrYj74iUToURz69.jpg',
        badge: '🪐 Epic'
    },
    {
        id: 'tt1160419',
        name: 'Dune',
        year: '2021',
        rating: '8.0',
        image: 'https://image.tmdb.org/t/p/w500/d5PB69enrollTV4pYp1v8U9AKy.jpg',
        badge: '🌟 Atmospheric'
    },
];

/**
 * Home Page Component
 * The cinematic landing page of the AI Movie Insight Builder.
 * Features live platform stats, trending movie discovery, and the primary search experience.
 */
export default function Home() {
    const [streak, setStreak] = useState(0);
    const [liveViewers, setLiveViewers] = useState(843);

    /**
     * Effect: Initialize social proof elements and user session markers.
     */
    useEffect(() => {
        // Read session streak from localStorage to reward recurring usage
        const stored = parseInt(localStorage.getItem('movieStreak') || '0', 10);
        setStreak(stored);

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

                    <div className={styles.movieGrid}>
                        {TRENDING_MOVIES.map(movie => (
                            <a key={movie.id} href={`/results?id=${movie.id}`} className={styles.movieCard}>
                                <div className={styles.posterWrapper}>
                                    <Image
                                        src={movie.image}
                                        alt={movie.name}
                                        width={300}
                                        height={450}
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
                </div>
            </div>
        </main>
    );
}
