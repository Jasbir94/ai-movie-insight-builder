'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import LoadingSkeleton from '@/components/LoadingSkeleton';
import { ArrowLeft, Eye, MessageCircle, ThumbsUp, Star, Award } from 'lucide-react';
import Link from 'next/link';
import styles from './person.module.css';

function RecommendationsSection({ personId }) {
    const [recs, setRecs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!personId) return;
        fetch(`/api/recommend?personId=${personId}`)
            .then(r => r.json())
            .then(data => setRecs(data.recommendations || []))
            .catch(() => { })
            .finally(() => setLoading(false));
    }, [personId]);

    if (loading) return (
        <div className={styles.recLoading}>
            <div className={styles.recSpinner} />
            <span>Analyzing movies using AI + YouTube signals...</span>
        </div>
    );

    if (!recs.length) return null;

    return (
        <div className={styles.recSection}>
            <div className={styles.recHeader}>
                <Award size={22} color="var(--gold)" />
                <h3 className={styles.recTitle}>AI-Recommended Top Movies</h3>
                <span className={styles.recSubtitle}>Scored by IMDb rating · YouTube views · audience engagement</span>
            </div>
            <div className={styles.recGrid}>
                {recs.map((movie, idx) => (
                    <Link href={`/results?id=${movie.id}`} key={movie.id} className={styles.recCard}>
                        <div className={styles.recRank}>#{idx + 1}</div>
                        {movie.poster ? (
                            <img src={movie.poster} alt={movie.title} className={styles.recPoster} />
                        ) : (
                            <div className={styles.recPoster} style={{ background: '#1a1a1a' }} />
                        )}
                        <div className={styles.recInfo}>
                            <h4 className={styles.recMovieTitle}>{movie.title}</h4>
                            <div className={styles.recStats}>
                                <span className={styles.recStat}><Star size={12} /> {movie.rating}</span>
                                {movie.stats.viewsLabel !== '0' && (
                                    <span className={styles.recStat}><Eye size={12} /> {movie.stats.viewsLabel} views</span>
                                )}
                                {movie.stats.commentsLabel !== '0' && (
                                    <span className={styles.recStat}><MessageCircle size={12} /> {movie.stats.commentsLabel}</span>
                                )}
                            </div>
                            <div className={styles.recScoreBar}>
                                <div className={styles.recScoreFill} style={{ width: `${Math.min(100, (movie.score / 180) * 100)}%` }} />
                            </div>
                            <span className={styles.recScoreLabel}>AI Score: {movie.score}</span>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}

function PersonContent() {
    const searchParams = useSearchParams();
    const id = searchParams.get('id');
    const router = useRouter();

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [person, setPerson] = useState(null);

    useEffect(() => {
        if (!id) {
            setError('No person ID provided.');
            setLoading(false);
            return;
        }

        const fetchPerson = async () => {
            try {
                setLoading(true);
                const res = await fetch(`/api/person?id=${id}`);
                if (!res.ok) {
                    const err = await res.json();
                    throw new Error(err.error || 'Person not found');
                }
                const data = await res.json();
                setPerson(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchPerson();
    }, [id]);

    if (loading) return <LoadingSkeleton />;

    if (error) return (
        <div className={styles.errorContainer}>
            <h2>Oops!</h2>
            <p>{error}</p>
            <button onClick={() => router.back()} className={styles.backButton}>
                <ArrowLeft size={18} /> Go Back
            </button>
        </div>
    );

    if (!person) return null;

    return (
        <div className={styles.container}>
            <button onClick={() => router.back()} className={styles.navBack}>
                <ArrowLeft size={18} /> Back
            </button>
            <div className={styles.profileSection}>
                {person.image ? (
                    <img src={person.image} alt={person.name} className={styles.profileImage} />
                ) : (
                    <div className={styles.profileImage} style={{ background: '#1a1a1a' }} />
                )}
                <div className={styles.profileInfo}>
                    <h1 className={styles.name}>{person.name}</h1>
                    {person.birthday && <p className={styles.meta}><strong>Born:</strong> {person.birthday} {person.placeOfBirth && `in ${person.placeOfBirth}`}</p>}
                    {person.knownFor && <p className={styles.meta}><strong>Known For:</strong> {person.knownFor}</p>}
                    {person.biography && (
                        <div className={styles.bio}>
                            <p>{person.biography.substring(0, 500)}{person.biography.length > 500 ? '...' : ''}</p>
                        </div>
                    )}
                </div>
            </div>

            {/* AI Recommendations - loaded asynchronously to not block the profile render */}
            <RecommendationsSection personId={id} />

            <h3 className={styles.sectionTitle}>Full Filmography</h3>
            <div className={styles.movieGrid}>
                {person.credits.map((movie, idx) => (
                    <Link href={`/results?id=${movie.id}`} key={`${movie.id}-${idx}`} className={styles.movieCard}>
                        {movie.poster ? (
                            <img src={movie.poster} alt={movie.title} className={styles.moviePoster} />
                        ) : (
                            <div className={styles.moviePoster} style={{ background: '#1a1a1a' }} />
                        )}
                        <div className={styles.movieInfo}>
                            <h4 className={styles.movieTitle}>{movie.title}</h4>
                            <p className={styles.movieCharacter}>{movie.character}</p>
                            <div className={styles.movieMeta}>
                                <span>{movie.year}</span>
                                <span className={styles.movieRating}>★ {movie.rating}</span>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}

export default function PersonPage() {
    return (
        <main className={styles.main}>
            <Suspense fallback={<LoadingSkeleton />}>
                <PersonContent />
            </Suspense>
        </main>
    );
}
