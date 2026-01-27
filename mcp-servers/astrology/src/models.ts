import { z } from "zod";

// Input schema for get_birth_chart tool
export const birthChartInputSchema = z.object({
  name: z.string().describe("Person's name"),
  birth_date: z.string().describe("Birth date in YYYY-MM-DD format"),
  birth_time: z.string().describe("Birth time in HH:MM format (24-hour)"),
  latitude: z.number().describe("Latitude of birth location"),
  longitude: z.number().describe("Longitude of birth location"),
  timezone: z.string().optional().describe("Timezone string (e.g., 'America/New_York'), defaults to UTC"),
});

// Response schema for birth chart
export const birthChartResponseSchema = z.object({
  name: z.string(),
  birth_data: z.object({
    date: z.string(),
    time: z.string(),
    latitude: z.number(),
    longitude: z.number(),
    timezone: z.string(),
  }),
  planets: z.record(z.object({
    sign: z.string(),
    position: z.number(),
    house: z.string(),
    retrograde: z.boolean(),
  })),
  houses: z.record(z.object({
    sign: z.string(),
    position: z.number(),
  })),
  rising_sign: z.string(),
  aspects: z.array(z.object({
    planet1: z.string(),
    planet2: z.string(),
    aspect: z.string(),
    orb: z.number(),
    is_applying: z.boolean(),
  })),
});

// Input schema for chart summary
export const chartSummaryInputSchema = z.object({
  birth_date: z.string().describe("Birth date in YYYY-MM-DD format"),
  birth_time: z.string().describe("Birth time in HH:MM format (24-hour)"),
  latitude: z.number().describe("Latitude of birth location"),
  longitude: z.number().describe("Longitude of birth location"),
  timezone: z.string().optional().describe("Timezone string, defaults to UTC"),
});
