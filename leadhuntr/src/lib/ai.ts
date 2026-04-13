import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import type { AiScoreResult, RedditPost } from "@/types";

function getClient() {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error("Missing GEMINI_API_KEY");
  return new GoogleGenerativeAI(key);
}

const SCORE_SCHEMA = {
  type: SchemaType.OBJECT,
  properties: {
    intent_score: { type: SchemaType.NUMBER },
    intent_category: {
      type: SchemaType.STRING,
      enum: [
        "buying_intent",
        "pain_point",
        "recommendation_request",
        "comparison",
        "negative_review",
      ],
    },
    summary: { type: SchemaType.STRING },
    suggested_reply: { type: SchemaType.STRING },
  },
  required: ["intent_score", "intent_category", "summary", "suggested_reply"],
} as const;

const SYSTEM_INSTRUCTION = `You are an expert B2B SaaS prospecting analyst.
Score Reddit posts for buying intent and craft a helpful, non-spammy reply.
Always return valid JSON matching the schema.

Scoring criteria:
- 90-100: User is ACTIVELY searching for a tool and is ready to pay.
- 70-89: Clear pain point expressed; user is asking for recommendations.
- 50-69: Relevant discussion, potential opportunity.
- 30-49: Vaguely related, weak intent.
- 0-29: Not relevant despite keyword match.

Suggested reply rules:
- Natural tone, no emojis, no sales language.
- Lead with empathy or a helpful observation.
- Mention a solution subtly, not as an ad.
- Under 80 words.`;

/**
 * Score a single Reddit post with Gemini.
 */
export async function scorePost(
  post: RedditPost,
  keywords: string[],
): Promise<AiScoreResult> {
  const genAI = getClient();
  const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash",
    systemInstruction: SYSTEM_INSTRUCTION,
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: SCORE_SCHEMA,
      temperature: 0.4,
      maxOutputTokens: 500,
    },
  });

  const prompt = `Subreddit: r/${post.subreddit}
Title: ${post.title}
Body: ${post.selftext?.slice(0, 2000) ?? ""}
Keywords the user is monitoring: ${keywords.join(", ")}

Analyze this post and return the JSON.`;

  const result = await model.generateContent(prompt);
  const text = result.response.text();

  let parsed: AiScoreResult;
  try {
    parsed = JSON.parse(text) as AiScoreResult;
  } catch {
    throw new Error(`Failed to parse Gemini response: ${text}`);
  }

  parsed.intent_score = Math.max(
    0,
    Math.min(100, Math.round(parsed.intent_score)),
  );

  return parsed;
}

/**
 * Regenerate a suggested reply for an existing lead (used by the
 * "Get AI Reply" button in the dashboard).
 */
export async function generateReply(
  title: string,
  body: string,
  subreddit: string,
  productDescription?: string,
): Promise<string> {
  const genAI = getClient();
  const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash",
    systemInstruction: SYSTEM_INSTRUCTION,
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 300,
    },
  });

  const prompt = `Write a helpful Reddit reply to this post. Under 80 words, natural tone.

Subreddit: r/${subreddit}
Title: ${title}
Body: ${body.slice(0, 1500)}
${productDescription ? `\nProduct context: ${productDescription}` : ""}

Reply:`;

  const result = await model.generateContent(prompt);
  return result.response.text().trim();
}
