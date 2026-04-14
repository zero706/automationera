import type { Plan, PlanLimits } from "@/types";

export const PLAN_LIMITS: Record<Plan, PlanLimits> = {
  free: {
    name: "Free",
    price: 0,
    priceId: null,
    maxMonitors: 1,
    maxSubreddits: 3,
    maxKeywords: 5,
    maxLeadsPerDay: 10,
    scanIntervalMinutes: 360,
    exportCsv: false,
    aiReplies: false,
    emailAlerts: false,
    apiAccess: false,
    prioritySupport: false,
  },
  pro: {
    name: "Pro",
    price: 29,
    priceId: process.env.STRIPE_PRO_PRICE_ID ?? null,
    maxMonitors: 5,
    maxSubreddits: 15,
    maxKeywords: 25,
    maxLeadsPerDay: 100,
    scanIntervalMinutes: 60,
    exportCsv: true,
    aiReplies: true,
    emailAlerts: true,
    apiAccess: false,
    prioritySupport: false,
  },
  business: {
    name: "Business",
    price: 79,
    priceId: process.env.STRIPE_BUSINESS_PRICE_ID ?? null,
    maxMonitors: 20,
    maxSubreddits: Number.POSITIVE_INFINITY,
    maxKeywords: Number.POSITIVE_INFINITY,
    maxLeadsPerDay: Number.POSITIVE_INFINITY,
    scanIntervalMinutes: 30,
    exportCsv: true,
    aiReplies: true,
    emailAlerts: true,
    apiAccess: true,
    prioritySupport: true,
  },
};

export function getPlanLimits(plan: Plan): PlanLimits {
  return PLAN_LIMITS[plan];
}

export function canCreateMonitor(plan: Plan, currentCount: number): boolean {
  return currentCount < getPlanLimits(plan).maxMonitors;
}

export function canAddSubreddits(plan: Plan, count: number): boolean {
  return count <= getPlanLimits(plan).maxSubreddits;
}

export function canAddKeywords(plan: Plan, count: number): boolean {
  return count <= getPlanLimits(plan).maxKeywords;
}

export function hasReachedDailyLeadLimit(
  plan: Plan,
  leadsFoundToday: number,
): boolean {
  return leadsFoundToday >= getPlanLimits(plan).maxLeadsPerDay;
}
