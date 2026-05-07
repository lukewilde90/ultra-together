// ============================================================
// Core Domain Types for Ultra Together
// ============================================================

export type SessionType =
  | "solo_walk"
  | "long_walk"
  | "family_walk"
  | "recovery"
  | "strength"
  | "rest";

export type EnergyLevel = 1 | 2 | 3 | 4 | 5;

export type GearCategory = "shoes" | "socks" | "pack" | "poles" | "other";

export type MilestoneDistance = 10 | 20 | 30 | 40 | 50;

export type ChildcareDuty = "user" | "partner" | "shared" | "external";

// ============================================================
// Database Row Types (mirroring Supabase schema)
// ============================================================

export interface Profile {
  id: string;
  created_at: string;
  updated_at: string;
  email: string;
  full_name: string;
  avatar_url: string | null;
  couple_id: string | null;
  display_name: string;
  low_sleep_mode: boolean;
  notification_prefs: NotificationPrefs;
}

export interface Couple {
  id: string;
  created_at: string;
  updated_at: string;
  name: string;
  user_a_id: string;
  user_b_id: string | null;
  invite_token: string | null;
  invite_email: string | null;
  active_event_id: string | null;
}

export interface TrainingEvent {
  id: string;
  created_at: string;
  updated_at: string;
  couple_id: string;
  name: string;
  event_date: string; // ISO date string
  distance_km: number;
  elevation_m: number;
  description: string | null;
  location: string | null;
  is_active: boolean;
}

export interface TrainingSession {
  id: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  event_id: string | null;
  couple_id: string;
  session_type: SessionType;
  session_date: string; // ISO date string
  scheduled_date: string | null;
  distance_km: number | null;
  duration_minutes: number | null;
  elevation_m: number | null;
  energy_level: EnergyLevel | null;
  notes: string | null;
  blister_notes: string | null;
  pain_notes: string | null;
  fuelling_notes: string | null;
  gear_used: string[] | null; // gear item IDs
  completed: boolean;
  childcare_duty: ChildcareDuty | null;
}

export interface GearItem {
  id: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  couple_id: string;
  name: string;
  category: GearCategory;
  brand: string | null;
  model: string | null;
  purchase_date: string | null;
  retire_at_km: number | null;
  current_km: number;
  notes: string | null;
  is_retired: boolean;
}

export interface Milestone {
  id: string;
  created_at: string;
  user_id: string;
  couple_id: string;
  distance_km: MilestoneDistance;
  achieved_at: string;
  session_id: string | null;
}

export interface RecoveryLog {
  id: string;
  created_at: string;
  user_id: string;
  log_date: string;
  sleep_hours: number | null;
  hrv_score: number | null;
  soreness_level: number | null; // 1-5
  notes: string | null;
  low_sleep_flag: boolean;
}

export interface Reminder {
  id: string;
  created_at: string;
  user_id: string;
  session_id: string | null;
  reminder_type: "session" | "hydration" | "fuel" | "rest" | "partner";
  scheduled_at: string;
  message: string;
  sent: boolean;
  dismissed: boolean;
}

export interface ChildcarePlan {
  id: string;
  created_at: string;
  updated_at: string;
  couple_id: string;
  week_start: string; // ISO date string (Monday)
  slots: ChildcareSlot[];
}

export interface ChildcareSlot {
  date: string;
  duty: ChildcareDuty;
  notes: string | null;
  assigned_to: string | null; // user_id
}

// ============================================================
// Application-level Types
// ============================================================

export interface NotificationPrefs {
  session_reminders: boolean;
  hydration_reminders: boolean;
  partner_activity: boolean;
  weekly_summary: boolean;
  gentle_nudges: boolean;
}

export interface WeeklyStats {
  week_start: string;
  total_km: number;
  total_sessions: number;
  longest_session_km: number;
  total_elevation: number;
  avg_energy: number;
}

export interface EventReadiness {
  score: number; // 0-100
  longest_walk_km: number;
  weekly_average_km: number;
  consecutive_weeks: number;
  weeks_to_event: number;
  milestones_achieved: MilestoneDistance[];
  recommendations: string[];
}

export interface DashboardData {
  event: TrainingEvent | null;
  user_weekly_stats: WeeklyStats;
  partner_weekly_stats: WeeklyStats | null;
  upcoming_sessions: TrainingSession[];
  recent_sessions: TrainingSession[];
  event_readiness: EventReadiness;
  childcare_this_week: ChildcareSlot[];
  days_to_event: number;
}

export interface LogSessionForm {
  session_type: SessionType;
  session_date: string;
  distance_km: number | "";
  duration_minutes: number | "";
  elevation_m: number | "";
  energy_level: EnergyLevel;
  notes: string;
  blister_notes: string;
  pain_notes: string;
  fuelling_notes: string;
  gear_used: string[];
  childcare_duty: ChildcareDuty | "";
}

export interface ScheduleSessionForm {
  session_type: SessionType;
  scheduled_date: string;
  planned_distance_km: number | "";
  planned_duration_minutes: number | "";
  notes: string;
  childcare_duty: ChildcareDuty | "";
}

export interface CreateEventForm {
  name: string;
  event_date: string;
  distance_km: number | "";
  elevation_m: number | "";
  description: string;
  location: string;
}

export interface InvitePartnerForm {
  email: string;
}

// ============================================================
// API Response Types
// ============================================================

export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
}

export interface PaginatedResponse<T> {
  data: T[];
  count: number;
  page: number;
  page_size: number;
}
