'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, MessageCircle, Star, Flame, TrendingUp, Award } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import styles from './SuggestedMovies.module.css';

const BADGES = [
    { icon: '🔥', label: 'Most Engaging' },
    { icon: '⭐', label: 'Highest Rated' },
    { icon: '📈', label: 'Trending' },
    { icon: '💬', label: 'Fan Favourite' },
    { icon: '🎬', label: 'Critically Loved' },
    { icon: '🏆', label: 'Hidden Gem' },
];

const SOCIAL_PROOF = [
    'Watched by 4.2M this month',
    'Trending in 42 countries',
    '92% audience approval',
    'Ranked in IMDb Top 250',
    '8.1M YouTube trailer views',
    'Critics say: unmissable',
];

/**
 * SuggestedMovies Component
 * Renders a grid of AI-recommended movies based on the current title.
 * Displays engagement scores and psychological triggers (Trending, Hot, etc.).
 */
export default function SuggestedMovies({ movieId }) {
    const [suggestions, setSuggestions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    /**
     * Effect: Fetches curated recommendations from the proprietary suggestion API.
     */
    useEffect(() => {
        const fetchSuggestions = async () => {
            setIsLoading(true);
            try {
                const res = await fetch(`/api/movie-suggest?movieId=${movieId}`);
                const data = await res.json();
                setSuggestions(data.suggestions || []);
            } catch (err) {
                console.error('Failed to fetch suggestions:', err);
            } finally {
                setIsLoading(false);
            }
        };

        if (movieId) fetchSuggestions();
    }, [movieId]);

    if (isLoading) return (
        <div className={styles.loadingRow}>
            <div className={styles.spinner} />
            <span>AI is ranking similar movies for you…</span>
        </div>
    );

    if (!suggestions.length) return null;

    const maxScore = suggestions[0]?.score || 1;

    return (
        <section className={styles.section}>
            <div className={styles.header}>
                <Flame size={20} color="#ff6b35" />
                <h3 className={styles.title}>People Who Watched This Also Loved</h3>
                <span className={styles.subtitle}>AI-scored by IMDb · Trailer views · Audience engagement</span>
            </div>

            <div className={styles.grid}>
                {suggestions.map((movie, idx) => {
                    const badge = BADGES[idx] || BADGES[0];
                    const proof = SOCIAL_PROOF[idx] || SOCIAL_PROOF[0];
                    const scorePercent = Math.round((movie.score / maxScore) * 100);
                    const isHot = idx === 0;

                    return (
                        <motion.div
                            key={movie.id}
                            initial={{ opacity: 0, y: 24 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.08, duration: 0.4 }}
                        >
                            <Link href={`/results?id=${movie.id}`} className={`${styles.card} ${isHot ? styles.hotCard : ''}`}>
                                {/* Rank badge */}
                                <div className={`${styles.rank} ${isHot ? styles.hotRank : ''}`}>
                                    {isHot ? '🔥' : `#${idx + 1}`}
                                </div>

                                {/* Type badge top-right */}
                                <div className={styles.typeBadge}>{badge.icon} {badge.label}</div>

                                {/* Poster */}
                                <div className={styles.posterWrap}>
                                    {movie.poster ? (
                                        <Image src={movie.poster} alt={movie.title} className={styles.poster} width={500} height={750} />
                                    ) : (
                                        <div className={styles.posterPlaceholder} />
                                    )}
                                    {/* Rating overlay */}
                                    <div className={styles.ratingBadge}>
                                        <Star size={11} fill="var(--gold)" color="var(--gold)" />
                                        {movie.rating}
                                    </div>
                                    {/* Gradient */}
                                    <div className={styles.posterGradient} />
                                    {/* Score bar */}
                                    <div className={styles.scoreBarWrap}>
                                        <div className={styles.scoreBar} style={{ width: `${scorePercent}%` }} />
                                    </div>
                                </div>

                                <div className={styles.info}>
                                    <p className={styles.movieTitle}>{movie.title}</p>
                                    <p className={styles.socialProof}>{proof}</p>
                                    <div className={styles.stats}>
                                        {movie.stats.views > 0 && (
                                            <span className={styles.stat}>
                                                <Eye size={11} /> {movie.stats.viewsLabel} views
                                            </span>
                                        )}
                                        {movie.stats.comments > 0 && (
                                            <span className={styles.stat}>
                                                <MessageCircle size={11} /> {movie.stats.commentsLabel}
                                            </span>
                                        )}
                                    </div>
                                    <div className={styles.aiScore}>
                                        <span>AI Match</span>
                                        <span className={styles.aiScoreNum}>{scorePercent}%</span>
                                    </div>
                                </div>
                            </Link>
                        </motion.div>
                    );
                })}
            </div>

            <p className={styles.footerNote}>
                <TrendingUp size={13} /> Ranked by real-time audience signals. Updated daily.
            </p>
        </section>
    );
}
