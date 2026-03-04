'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import styles from './VideoPlayer.module.css';

export default function VideoPlayer({ youtubeId, movieTitle }) {
    const [isPlaying, setIsPlaying] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth <= 480);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    if (!youtubeId) return null;

    // Inline styles that GUARANTEE full-screen on mobile — cannot be overridden by CSS
    const mobileWrapperStyle = isMobile ? {
        width: '100vw',
        height: '100dvh',
        paddingBottom: 0,
        marginLeft: 'calc(-50vw + 50%)',
        borderRadius: 0,
        boxShadow: 'none',
        border: 'none',
    } : {};

    const mobileThumbnailStyle = isMobile ? {
        width: '100%',
        height: '100%',
        objectFit: 'cover',
    } : {};

    const mobileIframeStyle = isMobile ? {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        border: 0,
    } : {};

    return (
        <div className={styles.container}>
            <h3 className={styles.sectionTitle}>Official Trailer</h3>
            <div className={styles.videoWrapper} style={mobileWrapperStyle}>
                {!isPlaying ? (
                    <div className={styles.thumbnailContainer} onClick={() => setIsPlaying(true)}>
                        {/* Thumbnail Image */}
                        <Image
                            src={`https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg`}
                            alt={`${movieTitle || 'Movie'} Official Trailer`}
                            className={styles.thumbnail}
                            style={mobileThumbnailStyle}
                            width={1280}
                            height={720}
                            onError={(e) => {
                                e.target.srcset = `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg 1x`;
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
                        style={mobileIframeStyle}
                        src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1&rel=0&modestbranding=1&vq=hd1080&fs=1&enablejsapi=1`}
                        title={`${movieTitle || 'Movie'} Trailer`}
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen
                        webkitallowfullscreen="true"
                        mozallowfullscreen="true"
                    />
                )}
            </div>
        </div>
    );
}

