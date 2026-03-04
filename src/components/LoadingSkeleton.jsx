'use client';

import { motion } from 'framer-motion';
import styles from './LoadingSkeleton.module.css';

export default function LoadingSkeleton() {
    return (
        <div className={styles.container}>
            <motion.div
                className={styles.filmStrip}
                animate={{ y: [0, -40, 0] }}
                transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
            >
                <div className={styles.frame}></div>
                <div className={styles.frame}></div>
                <div className={styles.frame}></div>
            </motion.div>
            <motion.h2
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
                className={styles.text}
            >
                Analyzing Audience Sentiments...
            </motion.h2>
        </div>
    );
}
