'use client';

import { motion } from 'framer-motion';
import { User } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import styles from './CastGrid.module.css';

/**
 * CastGrid Component
 * Renders a horizontally scrollable list of the movie's top cast.
 * Includes unique key stability for actors with multiple roles.
 */
export default function CastGrid({ cast }) {
    if (!cast || cast.length === 0) return null;

    return (
        <div className={styles.container}>
            <h3 className={styles.sectionTitle}>Main Cast</h3>
            <div className={styles.scrollTrack}>
                {cast.map((actor, index) => {
                    const cardContent = (
                        <motion.div
                            className={styles.card}
                            initial={{ opacity: 0, x: 30 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.4, delay: index * 0.06 }}
                            whileHover={{ y: -6 }}
                        >
                            <div className={styles.portrait}>
                                {actor.image ? (
                                    <Image
                                        src={actor.image}
                                        alt={actor.name}
                                        className={styles.photo}
                                        width={200}
                                        height={300}
                                    />
                                ) : (
                                    <div className={styles.photoPlaceholder}>
                                        <User size={36} color="rgba(212,175,55,0.5)" />
                                    </div>
                                )}
                                {/* Character name hover overlay */}
                                <div className={styles.overlay}>
                                    <span className={styles.asLabel}>as</span>
                                    <span className={styles.character}>{actor.character || '—'}</span>
                                </div>
                            </div>
                            <div className={styles.info}>
                                <p className={styles.name}>{actor.name}</p>
                            </div>
                        </motion.div>
                    );

                    return actor.id ? (
                        <Link href={`/person?id=${actor.id}`} key={actor.id} className={styles.cardLink}>
                            {cardContent}
                        </Link>
                    ) : (
                        <div key={actor.name} className={styles.cardLink}>
                            {cardContent}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
