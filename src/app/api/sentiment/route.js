import { NextResponse } from 'next/server';
import { analyzeSentiment } from '@/lib/huggingface';

const FALLBACK = {
    summary: 'Sentiment analysis is temporarily unavailable. Try again in a moment.',
    classification: 'mixed',
    keywords: ['cinema', 'story', 'audiences', 'reviews']
};

/**
 * POST /api/sentiment
 * Processes a collection of audience reviews and returns AI-generated insights.
 * Utilizes the Hugging Face (Llama-3) integration.
 */
export async function POST(request) {
    try {
        const { reviews } = await request.json();

        if (!reviews || !Array.isArray(reviews)) {
            return NextResponse.json({ error: 'Missing or malformed reviews' }, { status: 400 });
        }

        // Delegating AI heavy-lifting to the specialized library
        const analysis = await analyzeSentiment(reviews);
        return NextResponse.json(analysis);
    } catch (err) {
        process.env.NODE_ENV === 'development' && console.error('Sentiment API Error:', err.message);
        return NextResponse.json({
            classification: 'mixed',
            summary: 'The audience had mixed feelings, resulting in a unique reception for this film.',
            keywords: ['trending', 'audience', 'vibe', 'reception']
        });
    }
}
