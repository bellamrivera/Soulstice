/**
 * Chinese Zodiac calculation utility
 *
 * The Chinese Zodiac is based on a 12-year cycle, with each year associated with an animal.
 * Note: This is a simplified calculation based on year only.
 */

const CHINESE_ZODIAC_ANIMALS = [
  "Rat", "Ox", "Tiger", "Rabbit", "Dragon", "Snake",
  "Horse", "Goat", "Monkey", "Rooster", "Dog", "Pig"
] as const;

const CHINESE_ZODIAC_ELEMENTS = ["Wood", "Fire", "Earth", "Metal", "Water"] as const;

export const CHINESE_ZODIAC_INFO: Record<string, { emoji: string; traits: string }> = {
  Rat: { emoji: "🐀", traits: "Quick-witted, resourceful, versatile" },
  Ox: { emoji: "🐂", traits: "Diligent, dependable, strong" },
  Tiger: { emoji: "🐅", traits: "Brave, confident, competitive" },
  Rabbit: { emoji: "🐇", traits: "Quiet, elegant, kind" },
  Dragon: { emoji: "🐉", traits: "Confident, intelligent, ambitious" },
  Snake: { emoji: "🐍", traits: "Enigmatic, intelligent, wise" },
  Horse: { emoji: "🐴", traits: "Animated, active, energetic" },
  Goat: { emoji: "🐐", traits: "Calm, gentle, sympathetic" },
  Monkey: { emoji: "🐒", traits: "Sharp, smart, curious" },
  Rooster: { emoji: "🐓", traits: "Observant, hardworking, courageous" },
  Dog: { emoji: "🐕", traits: "Loyal, honest, kind" },
  Pig: { emoji: "🐷", traits: "Compassionate, generous, sincere" },
};

export interface ChineseZodiac {
  animal: string;
  element: string;
  emoji: string;
  traits: string;
  fullSign: string;
}

export function getChineseZodiac(year: number): ChineseZodiac {
  // 1900 was a Rat year, so we use that as reference
  const animalIndex = (year - 1900) % 12;
  // Handle negative modulo for years before 1900
  const normalizedIndex = animalIndex < 0 ? animalIndex + 12 : animalIndex;
  const animal = CHINESE_ZODIAC_ANIMALS[normalizedIndex];

  // Elements cycle every 2 years
  const elementIndex = ((year - 4) % 10);
  const normalizedElementIndex = elementIndex < 0 ? elementIndex + 10 : elementIndex;
  const element = CHINESE_ZODIAC_ELEMENTS[Math.floor(normalizedElementIndex / 2)];

  const info = CHINESE_ZODIAC_INFO[animal];

  return {
    animal,
    element,
    emoji: info.emoji,
    traits: info.traits,
    fullSign: `${element} ${animal}`,
  };
}
