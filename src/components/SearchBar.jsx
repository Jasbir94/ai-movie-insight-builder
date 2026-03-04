'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import styles from './SearchBar.module.css';

/**
 * SearchBar Component
 * A premium, interactive search input with real-time autocompletion.
 * Includes debounced API calls and keyboard navigation support.
 */
export default function SearchBar() {
    const [query, setQuery] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    const wrapperRef = useRef(null);

    /**
     * Effect: Handles debounced search suggestions as the user types.
     */
    useEffect(() => {
        if (query.length < 2) { // Changed from query.trim().length
            setSuggestions([]);
            return;
        }

        const timer = setTimeout(async () => { // Renamed timeoutId to timer, added async
            try {
                // Don't set isLoading(true) for suggestions, only for full searches
                const res = await fetch(`/api/suggestions?q=${encodeURIComponent(query)}`);
                if (res.ok) {
                    const data = await res.json();
                    setSuggestions(data.suggestions || []); // Reverted to data.suggestions to match API route
                    setShowSuggestions(true);
                }
            } catch (err) {
                console.error("Failed to fetch suggestions:", err);
            }
        }, 300); // 300ms debounce buffer

        return () => clearTimeout(timer);
    }, [query]);

    // Close dropdown on outside click
    useEffect(() => {
        function handleClickOutside(event) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setShowSuggestions(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSearch = (e) => {
        e.preventDefault();
        setError('');

        if (!query.trim()) {
            setError('Please enter a movie title or IMDb ID');
            return;
        }

        setShowSuggestions(false);
        setIsLoading(true);
        router.push(`/results?id=${encodeURIComponent(query.trim())}`);
    };

    const handleSelectSuggestion = (suggestion) => {
        setQuery(suggestion.title); // Update visual input immediately
        setShowSuggestions(false);
        setIsLoading(true);
        // We push the ID specifically to avoid text ambiguity if identical movie titles exist
        router.push(`/results?id=${encodeURIComponent(suggestion.id)}`);
    };

    return (
        <div className={styles.container}>
            <motion.form
                ref={wrapperRef}
                onSubmit={handleSearch}
                className={styles.searchForm}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
            >
                <div className={styles.inputWrapper}>
                    <Search className={styles.icon} size={20} />
                    <input
                        type="text"
                        placeholder="Search smartly... (e.g. Inception)"
                        value={query}
                        onChange={(e) => {
                            setQuery(e.target.value);
                            setShowSuggestions(true);
                        }}
                        onFocus={() => {
                            if (query.trim().length >= 2) setShowSuggestions(true);
                        }}
                        className={styles.input}
                        disabled={isLoading}
                        autoComplete="off"
                    />
                    <button type="submit" className={styles.button} disabled={isLoading}>
                        {isLoading ? 'Searching...' : 'Analyze'}
                    </button>
                </div>

                <AnimatePresence>
                    {showSuggestions && suggestions.length > 0 && (
                        <motion.div
                            className={styles.suggestionsContainer}
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                        >
                            {suggestions.map((s) => (
                                <div
                                    key={s.id}
                                    className={styles.suggestionItem}
                                    onClick={() => handleSelectSuggestion(s)}
                                >
                                    {s.poster ? (
                                        <Image src={s.poster} alt={s.title} className={styles.suggestionPoster} width={50} height={75} />
                                    ) : (
                                        <div className={styles.suggestionPosterPlaceholder}>🎬</div>
                                    )}
                                    <div className={styles.suggestionInfo}>
                                        <span className={styles.suggestionTitle}>{s.title}</span>
                                        <div className={styles.suggestionMeta}>
                                            <span>{s.year}</span>
                                            <span className={styles.suggestionRating}>★ {s.rating}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>

                {error && <p className={styles.error}>{error}</p>}
            </motion.form>
        </div>
    );
}
