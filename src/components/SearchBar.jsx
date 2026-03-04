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
    const [trending, setTrending] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [isFocused, setIsFocused] = useState(false);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    const wrapperRef = useRef(null);

    /**
     * Effect: Fetch trending discovery movies on mount.
     */
    useEffect(() => {
        const fetchTrending = async () => {
            try {
                const res = await fetch('/api/trending?count=12');
                if (res.ok) {
                    const data = await res.json();
                    setTrending(data.movies || []);
                }
            } catch (err) {
                console.error("Failed to fetch discovery images:", err);
            }
        };
        fetchTrending();
    }, []);

    /**
     * Effect: Handles debounced search suggestions as the user types.
     */
    useEffect(() => {
        if (query.length < 2) {
            setSuggestions([]);
            return;
        }

        const timer = setTimeout(async () => {
            try {
                const res = await fetch(`/api/suggestions?q=${encodeURIComponent(query)}`);
                if (res.ok) {
                    const data = await res.json();
                    setSuggestions(data.suggestions || []);
                    setShowSuggestions(true);
                }
            } catch (err) {
                console.error("Failed to fetch suggestions:", err);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [query]);

    // Close dropdown on outside click
    useEffect(() => {
        function handleClickOutside(event) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setShowSuggestions(false);
                setIsFocused(false);
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
        setIsFocused(false);
        setIsLoading(true);
        router.push(`/results?id=${encodeURIComponent(query.trim())}`);
    };

    const handleSelectSuggestion = (suggestion) => {
        setQuery(suggestion.title);
        setShowSuggestions(false);
        setIsFocused(false);
        setIsLoading(true);
        router.push(`/results?id=${encodeURIComponent(suggestion.id)}`);
    };

    return (
        <>
            {isFocused && (
                <div
                    className={styles.overlayActive}
                    onClick={() => {
                        setIsFocused(false);
                        setShowSuggestions(false);
                    }}
                />
            )}
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
                                setIsFocused(true);
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
                        {/* Discovery Grid: Show when focused and no query */}
                        {isFocused && !query && trending.length > 0 && (
                            <motion.div
                                className={styles.discoveryContainer}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ duration: 0.2 }}
                            >
                                <div className={styles.discoveryHeader}>Trending Discovery</div>
                                <div className={styles.discoveryGrid}>
                                    {trending.map((movie) => (
                                        <div
                                            key={movie.id}
                                            className={styles.discoveryItem}
                                            onClick={() => handleSelectSuggestion({ id: movie.id, title: movie.name })}
                                        >
                                            <img
                                                src={movie.image || '/placeholder.jpg'}
                                                alt={movie.name}
                                                className={styles.discoveryImage}
                                            />
                                            <div className={styles.discoveryTooltip}>{movie.name}</div>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        )}

                        {/* Suggestions List: Show when typing */}
                        {showSuggestions && query.length >= 2 && suggestions.length > 0 && (
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
        </>
    );
}
