import type { RedditPost } from "@/types";

const REDDIT_TOKEN_URL = "https://www.reddit.com/api/v1/access_token";
const REDDIT_API_BASE = "https://oauth.reddit.com";

interface CachedToken {
  token: string;
  expiresAt: number;
}

let cachedToken: CachedToken | null = null;

async function getRedditAccessToken(): Promise<string> {
  if (cachedToken && cachedToken.expiresAt > Date.now() + 60_000) {
    return cachedToken.token;
  }

  const clientId = process.env.REDDIT_CLIENT_ID;
  const clientSecret = process.env.REDDIT_CLIENT_SECRET;
  const userAgent = process.env.REDDIT_USER_AGENT ?? "LeadHuntr/1.0";

  if (!clientId || !clientSecret) {
    throw new Error("Missing REDDIT_CLIENT_ID or REDDIT_CLIENT_SECRET");
  }

  const auth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

  const res = await fetch(REDDIT_TOKEN_URL, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
      "User-Agent": userAgent,
    },
    body: "grant_type=client_credentials",
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Reddit token request failed: ${res.status}`);
  }

  const data = (await res.json()) as {
    access_token: string;
    expires_in: number;
  };

  cachedToken = {
    token: data.access_token,
    expiresAt: Date.now() + data.expires_in * 1000,
  };

  return cachedToken.token;
}

interface RedditListingChild {
  kind: string;
  data: {
    id: string;
    subreddit: string;
    title: string;
    selftext: string;
    author: string;
    permalink: string;
    score: number;
    num_comments: number;
    created_utc: number;
    over_18?: boolean;
    stickied?: boolean;
  };
}

interface RedditListingResponse {
  data: {
    children: RedditListingChild[];
    after: string | null;
  };
}

/**
 * Fetch newest posts from a subreddit (up to 100).
 */
export async function fetchSubredditPosts(
  subreddit: string,
  limit = 50,
): Promise<RedditPost[]> {
  const token = await getRedditAccessToken();
  const userAgent = process.env.REDDIT_USER_AGENT ?? "LeadHuntr/1.0";

  const url = `${REDDIT_API_BASE}/r/${encodeURIComponent(
    subreddit,
  )}/new.json?limit=${Math.min(limit, 100)}&raw_json=1`;

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      "User-Agent": userAgent,
    },
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(
      `Reddit fetch failed for r/${subreddit}: ${res.status} ${res.statusText}`,
    );
  }

  const data = (await res.json()) as RedditListingResponse;

  return data.data.children
    .filter((c) => c.kind === "t3" && !c.data.stickied && !c.data.over_18)
    .map((c) => ({
      id: c.data.id,
      subreddit: c.data.subreddit,
      title: c.data.title,
      selftext: c.data.selftext ?? "",
      author: c.data.author,
      permalink: `https://www.reddit.com${c.data.permalink}`,
      score: c.data.score,
      num_comments: c.data.num_comments,
      created_utc: c.data.created_utc,
    }));
}

/**
 * Filter posts whose title or body contains any keyword and none of the
 * negative keywords. All matching is case-insensitive.
 */
export function filterPostsByKeywords(
  posts: RedditPost[],
  keywords: string[],
  negativeKeywords: string[] = [],
): RedditPost[] {
  const kw = keywords.map((k) => k.toLowerCase()).filter(Boolean);
  const neg = negativeKeywords.map((k) => k.toLowerCase()).filter(Boolean);

  return posts.filter((p) => {
    const haystack = `${p.title} ${p.selftext}`.toLowerCase();
    const hasKeyword = kw.some((k) => haystack.includes(k));
    if (!hasKeyword) return false;
    const hasNegative = neg.some((k) => haystack.includes(k));
    return !hasNegative;
  });
}
