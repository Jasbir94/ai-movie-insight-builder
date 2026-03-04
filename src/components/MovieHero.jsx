'use client';

import { motion } from 'framer-motion';
import { Star, Calendar, Film } from 'lucide-react';
import styles from './MovieHero.module.css';

/**
 * MovieHero Component
 * The immersive header section of a movie result page.
 * Features a cinematic blurred background, high-res poster, and key metadata.
 */
export default function MovieHero({ movie }) {
    if (!movie) return null;
    const { title, poster, year, rating, genre, plot } = movie;
    const genres = (genre || '').split(', ').filter(Boolean);
    const ratingNum = parseFloat(rating);
    const ratingColor = ratingNum >= 7.5 ? '#4ade80' : ratingNum >= 6 ? '#facc15' : '#f87171';

    return (
        <div className={styles.heroWrapper}>
            {/* Full-width blurred backdrop */}
            {poster && (
                <div
                    className={styles.backdrop}
                    style={{ backgroundImage: `url(${poster})` }}
                />
            )}
            <div className={styles.backdropOverlay} />

            <div className={styles.container}>
                {/* Poster */}
                {poster && (
                    <motion.div
                        className={styles.posterWrapper}
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <img src={poster} alt={`${title} poster`} className={styles.poster} />
                        <div className={styles.posterShine} />
                    </motion.div>
                )}

                {/* Info */}
                <motion.div
                    className={styles.info}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.15 }}
                >
                    <h1 className={styles.title}>{title}</h1>

                    <div className={styles.meta}>
                        <span className={styles.metaItem}>
                            <Calendar size={15} />
                            {year}
                        </span>
                        <span className={styles.divider}>·</span>
                        <span className={styles.metaItem}>
                            <Film size={15} />
                            {genres[0] || 'Movie'}
                        </span>
                        {rating && rating !== 'N/A' && (
                            <>
                                <span className={styles.divider}>·</span>
                                <span className={styles.ratingBadge} style={{ color: ratingColor, borderColor: ratingColor + '55' }}>
                                    <Star size={14} fill={ratingColor} color={ratingColor} />
                                    {rating}<span className={styles.ratingOf}>/10</span>
                                </span>
                            </>
                        )}
                    </div>

                    <div className={styles.genres}>
                        {genres.map((g, i) => (
                            <motion.span
                                key={g}
                                className={styles.genreBadge}
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.25 + i * 0.08 }}
                            >
                                {g}
                            </motion.span>
                        ))}
                    </div>

                    {plot && (
                        <div className={styles.plotBox}>
                            <div className={styles.plotAccent} />
                            <div>
                                <p className={styles.plotLabel}>Plot Summary</p>
                                <p className={styles.plotText}>{plot}</p>
                            </div>
                        </div>
                    )}
                </motion.div>
            </div>
        </div>
    );
}
