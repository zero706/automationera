export type Plan = "free" | "pro" | "business";

export type IntentCategory =
  | "buying_intent"
  | "pain_point"
  | "recommendation_request"
  | "comparison"
  | "negative_review";

export type LeadStatus = "new" | "saved" | "contacted" | "dismissed";

export type NotificationFrequency = "realtime" | "daily" | "weekly" | "off";

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  plan: Plan;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  notification_frequency: NotificationFrequency;
  leads_found_today: number;
  leads_found_total: number;
  leads_reset_at: string;
  created_at: string;
  updated_at: string;
}

export interface Monitor {
  id: string;
  user_id: string;
  name: string;
  subreddits: string[];
  keywords: string[];
  negative_keywords: string[];
  is_active: boolean;
  last_scanned_at: string | null;
  created_at: string;
}

export interface Lead {
  id: string;
  monitor_id: string;
  user_id: string;
  reddit_post_id: string;
  subreddit: string;
  title: string;
  body: string | null;
  author: string;
  permalink: string;
  score: number;
  num_comments: number;
  intent_score: number;
  intent_category: IntentCategory;
  ai_summary: string | null;
  suggested_reply: string | null;
  status: LeadStatus;
  reddit_created_at: string;
  created_at: string;
}

export interface ScanLog {
  id: string;
  monitor_id: string;
  posts_scanned: number;
  leads_found: number;
  error: string | null;
  scanned_at: string;
}

export interface Database {
  public: {
    Functions: {
      reset_daily_lead_counters: {
        Args: Record<string, never>;
        Returns: undefined;
      };
    };
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Partial<Profile> & Pick<Profile, "id" | "email">;
        Update: Partial<Profile>;
      };
      monitors: {
        Row: Monitor;
        Insert: Omit<Monitor, "id" | "created_at" | "last_scanned_at"> & {
          id?: string;
          created_at?: string;
          last_scanned_at?: string | null;
        };
        Update: Partial<Monitor>;
      };
      leads: {
        Row: Lead;
        Insert: Omit<Lead, "id" | "created_at"> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Lead>;
      };
      scan_logs: {
        Row: ScanLog;
        Insert: Omit<ScanLog, "id" | "scanned_at"> & {
          id?: string;
          scanned_at?: string;
        };
        Update: Partial<ScanLog>;
      };
    };
  };
}
