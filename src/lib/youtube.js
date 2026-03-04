/**
 * YouTube Integration Module
 * Provides trailer discovery and detailed engagement statistics.
 */
import axios from 'axios';

const API_KEY = process.env.YOUTUBE_API_KEY;
const BASE_URL = 'https://www.googleapis.com/youtube/v3';

/**
 * Searches for a movie trailer on YouTube and returns its Video ID.
 * @param {string} title - Movie title
 * @param {string} year - Release year
 * @returns {Promise<string|null>} - YouTube Video ID
 */
export async function searchYouTubeTrailer(title, year) {
    if (!API_KEY) return null;
    try {
        const query = `${title} ${year} official trailer`;
        const res = await axios.get(`${BASE_URL}/search`, {
            params: {
                part: 'snippet',
                q: query,
                type: 'video',
                maxResults: 1,
                key: API_KEY
            }
        });

        return res.data.items?.[0]?.id?.videoId || null;
    } catch (err) {
        process.env.NODE_ENV === 'development' && console.error('YouTube Search Err:', err.message);
        return null;
    }
}

/**
 * Searches for a trailer and fetches its statistics (views, comments, likes).
 * Critical for the AI scoring algorithm in suggested movies.
 * @param {string} title - Movie title
 * @param {string} year - Release year
 */
export async function searchYouTubeTrailerWithStats(title, year) {
    if (!API_KEY) return null;
    try {
        // Step 1: Find the most relevant trailer
        const trailerId = await searchYouTubeTrailer(title, year);
        if (!trailerId) return null;

        // Step 2: Fetch detailed statistics for that specific video
        const res = await axios.get(`${BASE_URL}/videos`, {
            params: {
                part: 'statistics,snippet',
                id: trailerId,
                key: API_KEY
            }
        });

        const video = res.data.items?.[0];
        if (!video) return null;

        return {
            id: trailerId,
            title: video.snippet.title,
            stats: {
                views: parseInt(video.statistics.viewCount) || 0,
                comments: parseInt(video.statistics.commentCount) || 0,
                likes: parseInt(video.statistics.likeCount) || 0
            }
        };
    } catch (err) {
        process.env.NODE_ENV === 'development' && console.error('YouTube Stats Err:', err.message);
        return null;
    }
}
