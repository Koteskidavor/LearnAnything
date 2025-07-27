import dotenv from 'dotenv';
import { InferenceClient } from '@huggingface/inference';
import axios from 'axios';
import { load } from 'cheerio';

dotenv.config();

const HF_API_KEY = process.env.HF_API_KEY;
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;
const GOOGLE_CX = process.env.GOOGLE_CX;


if (!HF_API_KEY) {
  process.exit(1);
}
// GOOGLE_API_KEY
if (!GOOGLE_API_KEY || !GOOGLE_CX) {
  throw new Error("Missing GOOGLE_API_KEY or GOOGLE_CX");
}

const client = new InferenceClient(HF_API_KEY);

const reqHeaders = {
  'User-Agent': 'Mozilla/5.0 (compatible; GPT-Lite/1.0)',
  'Accept-Language': 'en-US,en;q=0.9',
};

const fetchYouTubeLink = async (query: string): Promise<string> => {
    const searchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
    try {
        const { data } = await axios.get(searchUrl, { headers: reqHeaders, timeout: 10000 });
        const match = data.match(/"videoId":"(.*?)"/);
        return match?.[1] ? `https://www.youtube.com/watch?v=${match[1]}` : searchUrl;
    } catch (err) {
        console.error("Youtube error: ", err); 
        return searchUrl;
    }
}
const fetchGoogleFirstLink = async (query: string): Promise<string> => {
  const searchUrl = `https://www.googleapis.com/customsearch/v1?key=${GOOGLE_API_KEY}&cx=${GOOGLE_CX}&q=${encodeURIComponent(query)}`;

  try {
    const { data } = await axios.get(searchUrl);
    const firstResult = data.items?.[0]?.link;
    return firstResult || `https://www.google.com/search?q=${encodeURIComponent(query)}`;
  } catch (err) {
    console.error("Google CSE error:", (err as any).message);
    return `https://www.google.com/search?q=${encodeURIComponent(query)}`;
  }
};

const generateLinks = async (step: string) => {
  const [youtube, google] = await Promise.all([
    fetchYouTubeLink(step),
    fetchGoogleFirstLink(step),
  ]);
  return { text: step, youtube, google };
};

export async function generateLearningPath(topic: string): Promise<{
    roadmap: string;
    steps: string[];
    resources: { text: string; youtube: string; google: string }[];
}> {
    const prompt = `Generate a detailed learning roadmap for the topic: "${topic}". Format as bullet points.`;

    try {
        const chatCompletion = await client.chatCompletion({
            provider: "together",
            model: "mistralai/Mixtral-8x7B-Instruct-v0.1",
            messages: [
                {
                    role: "user",
                    content: prompt,
                },
            ],
        });
        const message = chatCompletion.choices[0]?.message?.content;
        if (!message) {
            throw new Error("No content returned from Hugging Face response.");
        }
        const steps = message
            .split('\n')
            .map(line => line.replace(/^[-•\*\d.]+\s*/, '').trim())
            .filter(line => line.length > 0);
        const resources = await Promise.all(steps.map(generateLinks));
        return {
            roadmap: message.trim(),
            steps,
            resources,
        }
    } catch (err: any) {
        console.error("🛑 Hugging Face API error:", err.message || err);
        throw new Error("Failed to fetch data from Hugging Face API");
    }
}


