'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BrainCircuit, Volume2, CircleStop } from 'lucide-react';
import styles from './SentimentCard.module.css';

/**
 * SentimentCard Component
 * Visualizes AI-extracted audience sentiment and key thematic insights.
 * Dynamically colors the interface based on the sentiment classification.
 */
export default function SentimentCard({ sentiment }) {
    // State for Speech Synthesis
    const [isPlaying, setIsPlaying] = useState(false);

    useEffect(() => {
        // Stop speaking if component unmounts
        return () => {
            if (typeof window !== 'undefined' && window.speechSynthesis) {
                window.speechSynthesis.cancel();
            }
        };
    }, []);

    if (!sentiment) return null;

    const { classification, summary, keywords } = sentiment;
    const classificationLower = classification?.toLowerCase() || 'mixed';

    const toggleAudio = () => {
        if (!('speechSynthesis' in window)) {
            alert("Sorry, your browser doesn't support text to speech!");
            return;
        }

        if (isPlaying) {
            window.speechSynthesis.cancel();
            setIsPlaying(false);
        } else {
            // Cancel any ongoing speech before starting a new one
            window.speechSynthesis.cancel();

            const utterance = new SpeechSynthesisUtterance(summary);
            // Optionally change voice/pitch here if desired
            utterance.rate = 0.95; // Slightly slower for better comprehension

            utterance.onend = () => setIsPlaying(false);
            utterance.onerror = () => setIsPlaying(false);

            window.speechSynthesis.speak(utterance);
            setIsPlaying(true);
        }
    };

    const visualMap = {
        positive: { color: 'var(--positive)', emoji: '🤩', fill: '85%' },
        mixed: { color: 'var(--mixed)', emoji: '😐', fill: '50%' },
        negative: { color: 'var(--negative)', emoji: '😡', fill: '15%' },
    };

    const visuals = visualMap[classificationLower] || visualMap.mixed;
    const { color, emoji, fill } = visuals;

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
                    <span className={styles.emoji}>{emoji}</span>
                    <span>{(classification || 'mixed').toUpperCase()}</span>
                </div>
            </div>

            {/* Accessibility: Visual Mood Gauge */}
            <div className={styles.gaugeContainer} aria-label={`Sentiment gauge at ${fill}`}>
                <div
                    className={styles.gaugeFill}
                    style={{ width: fill, backgroundColor: color, boxShadow: `0 0 10px ${color}` }}
                />
            </div>

            {/* Accessibility: Audio Readout Button */}
            <button
                onClick={toggleAudio}
                className={`${styles.audioButton} ${isPlaying ? styles.playing : ''}`}
                aria-label={isPlaying ? "Stop audio summary" : "Play audio summary aloud"}
            >
                {isPlaying ? <CircleStop size={20} /> : <Volume2 size={20} />}
                {isPlaying ? "Stop Speaking" : "Read Aloud"}
            </button>

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
