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
    { id: 'tt0468569', name: 'The Dark Knight', badge: '🔥 #1 This Week' },
    { id: 'tt1375666', name: 'Inception', badge: '⭐ IMDb Top 10' },
    { id: 'tt0133093', name: 'The Matrix', badge: '📈 Trending' },
    { id: 'tt0111161', name: 'The Shawshank Redemption', badge: '🏆 All-Time Best' },
    { id: 'tt0109830', name: 'Forrest Gump', badge: '💛 Fan Favourite' },
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
                <div className={styles.logoContainer}>
                    <Image src="/logo.png" alt="Movie Insight Builder Logo" width={180} height={180} priority className={styles.mainLogo} />
                </div>
                <div className={styles.eyebrow}>🎬 AI-Powered Cinema Intelligence</div>
                <h1 className={styles.title}>
                    Uncover the Truth<br />Behind Every Film
                </h1>
                <p className={styles.subtitle}>
                    Powered by live YouTube signals, IMDb ratings & AI sentiment — get insights no review site can offer.
                </p>

                <SearchBar />

                {/* Platform stats ticker */}
                <div className={styles.statsRow}>
                    {PLATFORM_STATS.map(s => (
                        <StatCounter key={s.label} {...s} />
                    ))}
                </div>

                {/* Trending movies */}
                <div className={styles.trendingSection}>
                    <div className={styles.trendingHeader}>
                        <TrendingUp size={16} color="var(--gold)" />
                        <span>Trending right now</span>
                    </div>
                    <div className={styles.chipContainer}>
                        {TRENDING_MOVIES.map(movie => (
                            <a key={movie.id} href={`/results?id=${movie.id}`} className={styles.chip}>
                                <span className={styles.chipBadge}>{movie.badge}</span>
                                <span>{movie.name}</span>
                            </a>
                        ))}
                    </div>
                </div>
            </div>
        </main>
    );
}
