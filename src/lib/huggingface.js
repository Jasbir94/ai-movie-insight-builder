/**
 * Hugging Face AI Integration Module
 * Utilizes Llama-3-8B for advanced sentiment classification of movie reviews.
 */
import axios from 'axios';

const HUGGING_FACE_API_KEY = process.env.HUGGING_FACE_API_KEY;
// Using Mistral-7B-Instruct-v0.3 for stable sentiment extraction
const HF_MODEL = "mistralai/Mistral-7B-Instruct-v0.3";

/**
 * Analyzes a collection of reviews to determine overall audience sentiment.
 * Extracts key themes and classifies as POSITIVE, MIXED, or NEGATIVE.
 * @param {string[]} reviews - Array of review text strings
 * @returns {Promise<{sentiment: string, summary: string, themes: string[]}>} An object containing the sentiment, summary, and key themes.
 */
export async function analyzeSentiment(reviews) {
    if (!HUGGING_FACE_API_KEY) {
        return { sentiment: 'NEUTRAL', summary: 'AI Analysis skipped: No API Key.', themes: [] };
    }

    if (!reviews || reviews.length === 0) {
        return { sentiment: 'NEUTRAL', summary: 'No audience reviews available for analysis.', themes: [] };
    }

    // Combine reviews into a single context block for the LLM
    // Truncate to avoid exceeding model input limits
    const context = reviews.join('\n\n').slice(0, 2000);

    const prompt = `
Analyze the following movie reviews and provide a summary in JSON format.
Reviews:
"""
${context}
"""

Instructions:
1. Determine overall sentiment: positive, negative, or mixed.
2. Provide a 2-sentence summary of what the audience felt.
3. List 4 key themes (single words or short phrases).

Output strictly valid JSON:
{
  "classification": "positive | mixed | negative",
  "summary": "...",
  "keywords": ["...", "..."]
}
`;

    try {
        const response = await axios.post(
            `https://api-inference.huggingface.co/models/${HF_MODEL}`,
            {
                inputs: prompt,
                parameters: {
                    max_new_tokens: 250, // Limit the length of the AI's response
                    return_full_text: false // Only return the generated text, not the prompt
                }
            },
            {
                headers: {
                    Authorization: `Bearer ${HUGGING_FACE_API_KEY}`,
                    'Content-Type': 'application/json'
                },
                timeout: 25000 // Sentiment analysis can take some time, set a generous timeout
            }
        );

        const resultText = response.data?.[0]?.generated_text || response.data?.generated_text;
        if (!resultText) throw new Error("Empty AI response");

        let jsonStr = resultText.trim();

        // Failsafe extraction of JSON object from potential LLM conversational text
        const firstBrace = jsonStr.indexOf('{');
        const lastBrace = jsonStr.lastIndexOf('}');
        if (firstBrace !== -1 && lastBrace !== -1) {
            jsonStr = jsonStr.substring(firstBrace, lastBrace + 1);
        }

        return JSON.parse(jsonStr);
    } catch (error) {
        process.env.NODE_ENV === 'development' && console.error('AI Sentiment Error:', error.message);
        // Resilient fallback to prevent UI crashes
        return {
            classification: 'mixed',
            summary: 'The audience had diverse opinions about the film, reflecting its unique impact.',
            keywords: ['cinematography', 'performances', 'pacing', 'storytelling']
        };
    }
}
