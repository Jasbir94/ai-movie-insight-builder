'use client';

import { useState } from 'react';
import styles from './VideoPlayer.module.css';

export default function VideoPlayer({ youtubeId, movieTitle }) {
    const [isPlaying, setIsPlaying] = useState(false);

    if (!youtubeId) return null;

    return (
        <div className={styles.container}>
            <h3 className={styles.sectionTitle}>Official Trailer</h3>
            <div className={styles.videoWrapper}>
                {!isPlaying ? (
                    <div className={styles.thumbnailContainer} onClick={() => setIsPlaying(true)}>
                        {/* Thumbnail Image */}
                        <img
                            src={`https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg`}
                            alt={`${movieTitle || 'Movie'} Official Trailer`}
                            className={styles.thumbnail}
                            onError={(e) => {
                                e.target.src = `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`;
                            }}
                        />

                        {/* Dark gradient overlay at the bottom */}
                        <div className={styles.gradientOverlay} />

                        {/* TRAILER Badge top-left */}
                        <div className={styles.trailerBadge}>
                            <span className={styles.badgeDot} />
                            OFFICIAL TRAILER
                        </div>

                        {/* Centered play button with ripple */}
                        <div className={styles.playButtonOverlay}>
                            <div className={styles.ripple} />
                            <div className={styles.playButton}>
                                <svg
                                    width="30"
                                    height="30"
                                    viewBox="0 0 24 24"
                                    fill="white"
                                >
                                    <path d="M8 5v14l11-7z" />
                                </svg>
                            </div>
                        </div>

                        {/* Movie title at the bottom */}
                        {movieTitle && (
                            <div className={styles.titleOverlay}>
                                <span className={styles.movieNameLabel}>{movieTitle}</span>
                            </div>
                        )}
                    </div>
                ) : (
                    <iframe
                        className={styles.iframe}
                        src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1&rel=0&modestbranding=1&vq=hd1080`}
                        title={`${movieTitle || 'Movie'} Trailer`}
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen
                    />
                )}
            </div>
        </div>
    );
}
