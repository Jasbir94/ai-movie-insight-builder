'use client';

import { motion } from 'framer-motion';
import { BrainCircuit } from 'lucide-react';
import styles from './SentimentCard.module.css';

/**
 * SentimentCard Component
 * Visualizes AI-extracted audience sentiment and key thematic insights.
 * Dynamically colors the interface based on the sentiment classification.
 */
export default function SentimentCard({ sentiment }) {
    if (!sentiment) return null;

    const { classification, summary, keywords } = sentiment;

    const classificationLower = classification?.toLowerCase() || 'mixed';

    const badgeColors = {
        positive: 'var(--positive)',
        mixed: 'var(--mixed)',
        negative: 'var(--negative)',
    };

    const color = badgeColors[classificationLower] || badgeColors.mixed;

    return (
        <motion.div
            className={styles.card}
            style={{ borderColor: color, boxShadow: `0 8px 32px rgba(0,0,0,0.4), inset 0 0 10px ${color}10` }}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.6 }}
        >
            <div className={styles.header}>
                <div className={styles.titleWrapper}>
                    <BrainCircuit color="var(--gold)" size={24} />
                    <h2 className={styles.title}>AI Sentiment Insights</h2>
                </div>
                <div
                    className={styles.badge}
                    style={{ backgroundColor: `${color}20`, color, borderColor: `${color}50` }}
                >
                    {(classification || 'mixed').toUpperCase()}
                </div>
            </div>

            <p className={styles.summary}>{summary}</p>

            {keywords && keywords.length > 0 && (
                <div className={styles.keywords}>
                    <span className={styles.keywordsTitle}>Key Themes:</span>
                    <div className={styles.keywordTokens}>
                        {keywords.map(kw => (
                            <span key={kw} className={styles.keywordToken}>{kw}</span>
                        ))}
                    </div>
                </div>
            )}
        </motion.div>
    );
}
