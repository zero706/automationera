export * from "./database";

export interface PlanLimits {
  name: string;
  price: number;
  priceId: string | null;
  maxMonitors: number;
  maxSubreddits: number;
  maxKeywords: number;
  maxLeadsPerDay: number;
  scanIntervalMinutes: number;
  exportCsv: boolean;
  aiReplies: boolean;
  emailAlerts: boolean;
  apiAccess: boolean;
  prioritySupport: boolean;
}

export interface AiScoreResult {
  intent_score: number;
  intent_category:
    | "buying_intent"
    | "pain_point"
    | "recommendation_request"
    | "comparison"
    | "negative_review";
  summary: string;
  suggested_reply: string;
}

export interface RedditPost {
  id: string;
  subreddit: string;
  title: string;
  selftext: string;
  author: string;
  permalink: string;
  score: number;
  num_comments: number;
  created_utc: number;
}
