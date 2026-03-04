import axios from 'axios';

const OMDB_API_KEY = process.env.OMDB_API_KEY;

export async function getMovieDetails(query) {
    if (!OMDB_API_KEY) {
        throw new Error('OMDB_API_KEY is missing');
    }

    const isId = /^tt\d{7,8}$/.test(query);
    const param = isId ? `i=${query}` : `t=${encodeURIComponent(query)}`;

    const response = await axios.get(`https://www.omdbapi.com/?${param}&apikey=${OMDB_API_KEY}`);

    if (response.data.Response === 'False') {
        throw new Error(response.data.Error || 'Movie not found');
    }

    return response.data;
}
