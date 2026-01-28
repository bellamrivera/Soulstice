/**
 * Moon phase calculation utility
 *
 * Calculates the current moon phase using a simple astronomical algorithm.
 * Based on the synodic month (29.53059 days).
 */

export const MOON_PHASES = [
  { name: "New Moon", emoji: "🌑", description: "A time for new beginnings, setting intentions, and planting seeds" },
  { name: "Waxing Crescent", emoji: "🌒", description: "Building momentum, taking initial steps toward goals" },
  { name: "First Quarter", emoji: "🌓", description: "Time for action, decisions, and overcoming obstacles" },
  { name: "Waxing Gibbous", emoji: "🌔", description: "Refining, adjusting, and preparing for culmination" },
  { name: "Full Moon", emoji: "🌕", description: "Culmination, clarity, celebration, and release" },
  { name: "Waning Gibbous", emoji: "🌖", description: "Gratitude, sharing wisdom, and introspection" },
  { name: "Last Quarter", emoji: "🌗", description: "Letting go, forgiveness, and clearing" },
  { name: "Waning Crescent", emoji: "🌘", description: "Rest, surrender, and preparation for renewal" },
] as const;

export interface MoonPhase {
  name: string;
  emoji: string;
  description: string;
  illumination: number; // 0-100%
  daysIntoCycle: number;
  daysUntilFull: number;
  daysUntilNew: number;
}

// Synodic month length in days
const SYNODIC_MONTH = 29.53059;

// Known new moon date for reference (Jan 11, 2024 at 11:57 UTC)
const KNOWN_NEW_MOON = new Date(Date.UTC(2024, 0, 11, 11, 57, 0));

export function getMoonPhase(date: Date = new Date()): MoonPhase {
  // Calculate days since known new moon
  const diffMs = date.getTime() - KNOWN_NEW_MOON.getTime();
  const diffDays = diffMs / (1000 * 60 * 60 * 24);

  // Get position in current cycle (0 to ~29.53)
  let daysIntoCycle = diffDays % SYNODIC_MONTH;
  if (daysIntoCycle < 0) daysIntoCycle += SYNODIC_MONTH;

  // Calculate illumination (simplified - actual varies slightly)
  // 0 at new moon, 100 at full moon
  const cyclePosition = daysIntoCycle / SYNODIC_MONTH;
  const illumination = Math.round(
    50 * (1 - Math.cos(2 * Math.PI * cyclePosition))
  );

  // Determine phase (8 phases, each ~3.69 days)
  const phaseIndex = Math.floor((daysIntoCycle / SYNODIC_MONTH) * 8) % 8;
  const phase = MOON_PHASES[phaseIndex];

  // Calculate days until full moon (occurs at ~14.77 days into cycle)
  const fullMoonDay = SYNODIC_MONTH / 2;
  let daysUntilFull = fullMoonDay - daysIntoCycle;
  if (daysUntilFull < 0) daysUntilFull += SYNODIC_MONTH;

  // Calculate days until new moon
  let daysUntilNew = SYNODIC_MONTH - daysIntoCycle;
  if (daysUntilNew >= SYNODIC_MONTH) daysUntilNew = 0;

  return {
    name: phase.name,
    emoji: phase.emoji,
    description: phase.description,
    illumination,
    daysIntoCycle: Math.round(daysIntoCycle * 10) / 10,
    daysUntilFull: Math.round(daysUntilFull * 10) / 10,
    daysUntilNew: Math.round(daysUntilNew * 10) / 10,
  };
}

/**
 * Get moon sign (simplified - the zodiac sign the moon is currently in)
 * The moon moves through all 12 signs roughly every 27.3 days (~2.3 days per sign)
 */
const ZODIAC_SIGNS = [
  "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
  "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"
] as const;

// Known moon position: Jan 1, 2024 moon was in Cancer (index 3)
const KNOWN_MOON_SIGN_DATE = new Date(Date.UTC(2024, 0, 1, 0, 0, 0));
const KNOWN_MOON_SIGN_INDEX = 3; // Cancer
const SIDEREAL_MONTH = 27.321661; // Days for moon to orbit Earth

export function getMoonSign(date: Date = new Date()): string {
  const diffMs = date.getTime() - KNOWN_MOON_SIGN_DATE.getTime();
  const diffDays = diffMs / (1000 * 60 * 60 * 24);

  // Moon moves through one sign every ~2.28 days
  const daysPerSign = SIDEREAL_MONTH / 12;
  const signsPassed = Math.floor(diffDays / daysPerSign);

  let signIndex = (KNOWN_MOON_SIGN_INDEX + signsPassed) % 12;
  if (signIndex < 0) signIndex += 12;

  return ZODIAC_SIGNS[signIndex];
}
