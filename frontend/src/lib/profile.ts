import { supabase } from "./supabase";

interface SaveProfileParams {
  birthDate: Date;
  birthTime: string;
  birthTimeUnknown: boolean;
  location: {
    city: string;
    latitude: number;
    longitude: number;
    timezone: string;
  };
  mbti: string;
  enneagram: {
    type: number | null;
    wing: "w" | "w-1" | null;
    instinct: "sp" | "sx" | "so" | null;
  };
  attachmentStyle: string;
  loveLanguages: string[];
  birthChart: {
    planets: Record<string, { sign: string }>;
    rising_sign: string;
    [key: string]: unknown;
  };
}

export async function saveProfile(params: SaveProfileParams) {
  const {
    birthDate,
    birthTime,
    birthTimeUnknown,
    location,
    mbti,
    enneagram,
    attachmentStyle,
    loveLanguages,
    birthChart,
  } = params;

  // Get current user
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error("You must be logged in to save your profile");
  }

  // Insert profile
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .insert({
      user_id: user.id,
      birth_date: birthDate.toISOString().split("T")[0],
      birth_time: birthTime || "12:00:00",
      birth_time_unknown: birthTimeUnknown,
      location_city: location.city,
      location_latitude: location.latitude,
      location_longitude: location.longitude,
      location_timezone: location.timezone,
      mbti: mbti || null,
      enneagram_type: enneagram.type,
      enneagram_wing: enneagram.wing === "w" ? "left" : enneagram.wing === "w-1" ? "right" : null,
      enneagram_instinct: enneagram.instinct,
      attachment_style: attachmentStyle || null,
      love_languages: loveLanguages,
    })
    .select()
    .single();

  if (profileError) {
    throw new Error(profileError.message);
  }

  // Insert birth chart
  const sunSign = birthChart.planets.Sun?.sign || "Unknown";
  const moonSign = birthChart.planets.Moon?.sign || "Unknown";
  const risingSign = birthChart.rising_sign || "Unknown";

  const { error: chartError } = await supabase
    .from("birth_charts")
    .insert({
      profile_id: profile.id,
      sun_sign: sunSign,
      moon_sign: moonSign,
      rising_sign: risingSign,
      chart_data: birthChart,
    });

  if (chartError) {
    throw new Error(chartError.message);
  }

  return profile;
}

export async function getProfile() {
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return null;
  }

  const { data: profile, error } = await supabase
    .from("profiles")
    .select(`
      *,
      birth_charts (*)
    `)
    .eq("user_id", user.id)
    .single();

  if (error) {
    return null;
  }

  return profile;
}
