/**
 * TMDB Integration Module
 * Handles movie discovery, detailed metadata fetching, and person profiles.
 * Optimized for Windows performance using IPv4 forcing for Axios.
 */
import axios from 'axios';
import https from 'https';
import { searchYouTubeTrailer } from './youtube.js';

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

/**
 * Custom Axios instance with persistent connection pooling.
 * family: 4 is critical for preventing ECONNRESET on Windows/Node.js environments.
 */
const axiosInstance = axios.create({
    timeout: 12000,
    httpsAgent: new https.Agent({
        keepAlive: true,
        maxSockets: 50,
        family: 4
    })
});

/**
 * Generic fetch wrapper for TMDB API with exponential backoff retries.
 * @param {string} endpoint - API path (e.g., /movie/popular)
 * @param {Object} params - Query parameters
 * @param {number} retries - Maximum retry attempts
 */
export async function fetchTMDB(endpoint, params = {}, retries = 5) {
    for (let i = 0; i < retries; i++) {
        try {
            const res = await axiosInstance.get(`${TMDB_BASE_URL}${endpoint}`, {
                params: { api_key: TMDB_API_KEY, ...params }
            });
            return res.data;
        } catch (error) {
            if (error.response && error.response.status === 404) {
                throw new Error(`TMDB error 404: ${JSON.stringify(error.response.data)}`);
            }
            if (i === retries - 1) {
                throw new Error(`TMDB fetch failed after ${retries} attempts: ${error.message}`);
            }
            await new Promise(r => setTimeout(r, 500 * Math.pow(2, i)));
        }
    }
}

/**
 * Fetches comprehensive movie details, credits, and trailers.
 * Supports IMDb IDs, TMDB IDs, and text search.
 * @param {string} query - Search term or ID
 */
export async function getMovieDetailsAndCredits(query) {
    if (!TMDB_API_KEY) {
        throw new Error('TMDB_API_KEY is missing');
    }

    const isImdbId = /^tt\d{7,8}$/.test(query);
    const isTmdbId = /^\d+$/.test(query);
    let tmdbMovieId;
    let movieBasicData;

    try {
        // Step 1: Resolve the input into a TMDB Movie ID
        if (isImdbId) {
            const findData = await fetchTMDB(`/find/${query}`, {
                external_source: 'imdb_id'
            });
            if (!findData.movie_results || findData.movie_results.length === 0) {
                throw new Error('Movie not found on TMDB');
            }
            movieBasicData = findData.movie_results[0];
            tmdbMovieId = movieBasicData.id;
        } else if (isTmdbId) {
            tmdbMovieId = query;
        } else {
            const searchData = await fetchTMDB(`/search/movie`, {
                query: query,
                include_adult: false,
                page: 1
            });
            if (!searchData.results || searchData.results.length === 0) {
                throw new Error('Movie not found on TMDB');
            }
            movieBasicData = searchData.results[0];
            tmdbMovieId = movieBasicData.id;
        }

        // Step 2: Fetch detailed info with appended credits and videos
        const fullData = await fetchTMDB(`/movie/${tmdbMovieId}`, {
            append_to_response: 'credits,videos'
        });

        // Step 3: Extract and deduplicate cast for UI stability
        const castRaw = fullData.credits?.cast || [];
        const seenCastIds = new Set();
        const uniqueCast = [];

        for (const member of castRaw) {
            if (!seenCastIds.has(member.id)) {
                seenCastIds.add(member.id);
                uniqueCast.push(member);
            }
            if (uniqueCast.length >= 15) break;
        }

        const cast = uniqueCast.map(member => ({
            id: member.id,
            name: member.name,
            character: member.character,
            image: member.profile_path ? `https://image.tmdb.org/t/p/w200${member.profile_path}` : null
        }));

        // Step 4: Resolve trailer (YouTube Data API preferred, TMDB fallback)
        let youtubeTrailerId = null;
        try {
            const ytTitle = fullData.title;
            const ytYear = fullData.release_date ? fullData.release_date.substring(0, 4) : '';
            youtubeTrailerId = await searchYouTubeTrailer(ytTitle, ytYear);
        } catch (ytErr) {
            process.env.NODE_ENV === 'development' && console.warn('YouTube API fallback triggered');
        }

        if (!youtubeTrailerId && fullData.videos?.results) {
            const trailer = fullData.videos.results.find(
                v => v.site === 'YouTube' && v.type === 'Trailer'
            );
            youtubeTrailerId = trailer?.key || fullData.videos.results.find(v => v.site === 'YouTube')?.key;
        }

        return {
            tmdbId: fullData.id,
            title: fullData.title,
            poster: fullData.poster_path ? `https://image.tmdb.org/t/p/w500${fullData.poster_path}` : null,
            year: fullData.release_date ? fullData.release_date.substring(0, 4) : 'N/A',
            rating: fullData.vote_average ? fullData.vote_average.toFixed(1) : 'N/A',
            genre: fullData.genres ? fullData.genres.map(g => g.name).join(', ') : 'N/A',
            plot: fullData.overview,
            imdbID: fullData.imdb_id,
            cast: cast,
            youtubeTrailerId: youtubeTrailerId
        };
    } catch (error) {
        throw new Error(error.message || 'Failed to fetch from TMDB');
    }
}

/**
 * Fetches a person's biography and their filmography.
 * @param {number} personId - TMDB Person ID
 */
export async function getPersonDetailsAndCredits(personId) {
    if (!TMDB_API_KEY) {
        throw new Error('TMDB_API_KEY is missing');
    }

    try {
        const data = await fetchTMDB(`/person/${personId}`, {
            append_to_response: 'combined_credits'
        });

        // Deduplicate and filter credits to show only top-tier movies
        const rawCredits = data.combined_credits?.cast || [];
        const movieCredits = rawCredits.filter(c => c.poster_path && c.media_type === 'movie');
        const seenMovieIds = new Set();
        const uniqueCredits = [];

        const sortedCredits = movieCredits.sort((a, b) => b.popularity - a.popularity);

        for (const c of sortedCredits) {
            if (!seenMovieIds.has(c.id)) {
                seenMovieIds.add(c.id);
                uniqueCredits.push(c);
            }
            if (uniqueCredits.length >= 20) break;
        }

        const topCredits = uniqueCredits.map(c => ({
            id: c.id,
            title: c.title || c.name,
            poster: `https://image.tmdb.org/t/p/w500${c.poster_path}`,
            year: (c.release_date || c.first_air_date || '').substring(0, 4) || 'N/A',
            character: c.character,
            rating: c.vote_average ? c.vote_average.toFixed(1) : 'NR'
        }));

        return {
            id: data.id,
            name: data.name,
            biography: data.biography,
            image: data.profile_path ? `https://image.tmdb.org/t/p/w500${data.profile_path}` : null,
            birthday: data.birthday,
            placeOfBirth: data.place_of_birth,
            knownFor: data.known_for_department,
            credits: topCredits
        };
    } catch (error) {
        throw new Error(error.message || 'Failed to fetch person details');
    }
}
