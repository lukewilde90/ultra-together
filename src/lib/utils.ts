import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, formatDistanceToNow, differenceInDays, addDays, startOfWeek } from "date-fns";
import type { SessionType, EnergyLevel, WeeklyStats, EventReadiness } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ============================================================
// Date helpers
// ============================================================

export function formatDate(date: string | Date, pattern = "d MMM yyyy") {
  return format(new Date(date), pattern);
}

export function formatRelative(date: string | Date) {
  return formatDistanceToNow(new Date(date), { addSuffix: true });
}

export function daysUntil(date: string | Date) {
  return differenceInDays(new Date(date), new Date());
}

export function getWeekDays(weekStart?: Date): Date[] {
  const start = weekStart ?? startOfWeek(new Date(), { weekStartsOn: 1 });
  return Array.from({ length: 7 }, (_, i) => addDays(start, i));
}

export function getWeekStart(date: Date = new Date()): Date {
  return startOfWeek(date, { weekStartsOn: 1 });
}

// ============================================================
// Session helpers
// ============================================================

export const SESSION_TYPE_LABELS: Record<SessionType, string> = {
  solo_walk: "Solo Walk",
  long_walk: "Long Walk",
  family_walk: "Family Walk",
  recovery: "Recovery",
  strength: "Strength",
  rest: "Rest Day",
};

export const SESSION_TYPE_ICONS: Record<SessionType, string> = {
  solo_walk: "🥾",
  long_walk: "⛰️",
  family_walk: "👨‍👩‍👧",
  recovery: "🌿",
  strength: "💪",
  rest: "😴",
};

export const SESSION_TYPE_COLORS: Record<SessionType, string> = {
  solo_walk: "bg-trail-100 text-trail-800 border-trail-200",
  long_walk: "bg-earth-100 text-earth-800 border-earth-200",
  family_walk: "bg-blue-100 text-blue-800 border-blue-200",
  recovery: "bg-emerald-100 text-emerald-800 border-emerald-200",
  strength: "bg-purple-100 text-purple-800 border-purple-200",
  rest: "bg-stone-100 text-stone-600 border-stone-200",
};

export const ENERGY_LABELS: Record<EnergyLevel, string> = {
  1: "Exhausted",
  2: "Tired",
  3: "OK",
  4: "Good",
  5: "Strong",
};

export const ENERGY_EMOJIS: Record<EnergyLevel, string> = {
  1: "😴",
  2: "😐",
  3: "🙂",
  4: "😀",
  5: "🔥",
};

// ============================================================
// Stats helpers
// ============================================================

export function formatKm(km: number | null | undefined, decimals = 1): string {
  if (km == null) return "—";
  return `${km.toFixed(decimals)}km`;
}

export function formatDuration(minutes: number | null | undefined): string {
  if (minutes == null) return "—";
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

export function formatElevation(m: number | null | undefined): string {
  if (m == null) return "—";
  return `+${m}m`;
}

export function calculateReadinessScore(stats: {
  longestWalkKm: number;
  weeklyAverageKm: number;
  consecutiveWeeks: number;
  weeksToEvent: number;
  targetDistanceKm: number;
}): number {
  const { longestWalkKm, weeklyAverageKm, consecutiveWeeks, weeksToEvent, targetDistanceKm } = stats;

  // Longest single walk as % of target (40% weight)
  const distanceScore = Math.min((longestWalkKm / targetDistanceKm) * 100, 100) * 0.4;

  // Weekly volume (30% weight) - aim for 60% of target as weekly avg
  const volumeTarget = targetDistanceKm * 0.6;
  const volumeScore = Math.min((weeklyAverageKm / volumeTarget) * 100, 100) * 0.3;

  // Consistency (30% weight) - 12 weeks = full score
  const consistencyScore = Math.min((consecutiveWeeks / 12) * 100, 100) * 0.3;

  return Math.round(distanceScore + volumeScore + consistencyScore);
}

export function getReadinessColor(score: number): string {
  if (score >= 80) return "text-trail-600";
  if (score >= 60) return "text-earth-600";
  if (score >= 40) return "text-yellow-600";
  return "text-red-500";
}

export function getReadinessLabel(score: number): string {
  if (score >= 80) return "Race Ready";
  if (score >= 60) return "Building Well";
  if (score >= 40) return "Making Progress";
  if (score >= 20) return "Early Days";
  return "Just Starting";
}

// ============================================================
// Gear helpers
// ============================================================

export function getGearHealthPercent(currentKm: number, retireAtKm: number | null): number {
  if (!retireAtKm) return 100;
  return Math.max(0, Math.round(((retireAtKm - currentKm) / retireAtKm) * 100));
}

export function getGearHealthColor(percent: number): string {
  if (percent >= 60) return "text-trail-600";
  if (percent >= 30) return "text-earth-600";
  return "text-red-500";
}

// ============================================================
// Countdown helpers
// ============================================================

export function formatCountdown(days: number): {
  value: string;
  unit: string;
  urgency: "low" | "medium" | "high";
} {
  if (days <= 0) return { value: "Event day!", unit: "", urgency: "high" };

  const urgency = days < 14 ? "high" : days < 42 ? "medium" : "low";

  if (days < 7) return { value: days.toString(), unit: days === 1 ? "day" : "days", urgency };
  if (days < 30) {
    const weeks = Math.round(days / 7);
    return { value: weeks.toString(), unit: weeks === 1 ? "week" : "weeks", urgency };
  }
  const months = Math.floor(days / 30);
  const remainingWeeks = Math.round((days % 30) / 7);
  if (remainingWeeks > 0) {
    return { value: `${months}m ${remainingWeeks}w`, unit: "", urgency };
  }
  return { value: months.toString(), unit: months === 1 ? "month" : "months", urgency };
}

// ============================================================
// Recovery helpers
// ============================================================

export function getLowSleepRecommendations(avgSleepHours: number): string[] {
  if (avgSleepHours >= 7) return [];
  return [
    "Consider swapping a long walk for an easy recovery walk this week",
    "Focus on sleep quality over training volume",
    "A 30-minute easy walk is better than pushing through tired",
    "Your body rebuilds during rest — honour that",
  ];
}
