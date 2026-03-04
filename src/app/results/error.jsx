'use client';

import { useEffect } from 'react';
import { RefreshCcw, Home, AlertTriangle } from 'lucide-react';
import styles from './results.module.css';

/**
 * Results Error Boundary
 * Catches runtime crashes in the results hierarchy (e.g., malformed AI data).
 */
export default function Error({ error, reset }) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error('Results Crash:', error);
    }, [error]);

    return (
        <div className={styles.errorContainer} style={{ minHeight: '80vh' }}>
            <div className={styles.errorIcon} style={{ animation: 'pulse 2s infinite' }}>
                <AlertTriangle size={64} color="var(--gold)" />
            </div>

            <h2 style={{ color: 'var(--white)', fontSize: '2rem' }}>AI Processing Encountered a Glitch</h2>

            <p className={styles.errorMessage}>
                The requested movie data couldn&apos;t be rendered. This usually happens when the AI sentiment engine returns an unexpected format.
            </p>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button
                    onClick={() => reset()}
                    className={styles.backButton}
                    style={{ background: 'var(--gold)', color: 'black' }}
                >
                    <RefreshCcw size={18} /> Retry Analysis
                </button>

                <button
                    onClick={() => window.location.href = '/'}
                    className={styles.backButton}
                >
                    <Home size={18} /> Back to Home
                </button>
            </div>

            <style jsx>{`
                @keyframes pulse {
                    0% { transform: scale(1); opacity: 1; }
                    50% { transform: scale(1.1); opacity: 0.8; }
                    100% { transform: scale(1); opacity: 1; }
                }
            `}</style>
        </div>
    );
}
