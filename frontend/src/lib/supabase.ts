import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types for our database tables
export interface Profile {
  id: string;
  user_id: string;
  birth_date: string;
  birth_time: string;
  birth_time_unknown: boolean;
  location_city: string;
  location_latitude: number;
  location_longitude: number;
  location_timezone: string;
  mbti: string | null;
  enneagram_type: number | null;
  enneagram_wing: "left" | "right" | null;
  enneagram_instinct: "sp" | "sx" | "so" | null;
  attachment_style: string | null;
  love_languages: string[];
  created_at: string;
  updated_at: string;
}

export interface BirthChartRecord {
  id: string;
  profile_id: string;
  sun_sign: string;
  moon_sign: string;
  rising_sign: string;
  chart_data: Record<string, unknown>;
  created_at: string;
}
