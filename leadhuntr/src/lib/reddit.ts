import type { RedditPost } from "@/types";

// Uses the public Reddit JSON API — no OAuth credentials required.
// Rate limit: ~1 req/sec per IP (plenty for a cron job).
const REDDIT_API_BASE = "https://www.reddit.com";
const USER_AGENT =
  process.env.REDDIT_USER_AGENT ?? "LeadHuntr/1.0 (lead monitoring tool)";

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
 * Fetch newest posts from a subreddit using the public JSON API.
 * No Reddit credentials needed.
 */
export async function fetchSubredditPosts(
  subreddit: string,
  limit = 50,
): Promise<RedditPost[]> {
  const url = `${REDDIT_API_BASE}/r/${encodeURIComponent(subreddit)}/new.json?limit=${Math.min(limit, 100)}&raw_json=1`;

  const res = await fetch(url, {
    headers: {
      "User-Agent": USER_AGENT,
      Accept: "application/json",
    },
    next: { revalidate: 0 },
    redirect: "follow",
  });

  if (!res.ok) {
    throw new Error(
      `Reddit fetch failed for r/${subreddit}: ${res.status} ${res.statusText}`,
    );
  }

  const contentType = res.headers.get("content-type") ?? "";
  if (!contentType.includes("json")) {
    throw new Error(
      `Reddit returned non-JSON for r/${subreddit}: ${contentType}`,
    );
  }

  const data = (await res.json()) as RedditListingResponse;

  if (!data?.data?.children) {
    throw new Error(`Reddit returned unexpected structure for r/${subreddit}`);
  }

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
