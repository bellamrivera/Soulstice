export interface NominatimResult {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
  address: {
    city?: string;
    town?: string;
    village?: string;
    state?: string;
    country?: string;
  };
}

export interface LocationResult {
  id: number;
  displayName: string;
  city: string;
  latitude: number;
  longitude: number;
}

const NOMINATIM_BASE_URL = "https://nominatim.openstreetmap.org";

export async function searchLocations(query: string): Promise<LocationResult[]> {
  if (!query || query.length < 2) return [];

  try {
    const response = await fetch(
      `${NOMINATIM_BASE_URL}/search?` +
        new URLSearchParams({
          q: query,
          format: "json",
          addressdetails: "1",
          limit: "5",
        }),
      {
        headers: {
          "User-Agent": "Soulstice/1.0",
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to search locations");
    }

    const results: NominatimResult[] = await response.json();

    return results.map((result) => ({
      id: result.place_id,
      displayName: result.display_name,
      city: result.address.city || result.address.town || result.address.village || query,
      latitude: parseFloat(result.lat),
      longitude: parseFloat(result.lon),
    }));
  } catch (error) {
    console.error("Location search error:", error);
    return [];
  }
}

export async function getTimezone(lat: number, lng: number): Promise<string> {
  // Use a simple timezone estimation based on longitude
  // In production, you'd use a proper timezone API or the timezonefinder library via your backend
  // For now, we'll use a basic approximation
  const timezones: Record<string, string> = {
    "-5": "America/New_York",
    "-6": "America/Chicago",
    "-7": "America/Denver",
    "-8": "America/Los_Angeles",
    "0": "Europe/London",
    "1": "Europe/Paris",
    "2": "Europe/Berlin",
    "8": "Asia/Shanghai",
    "9": "Asia/Tokyo",
  };

  const utcOffset = Math.round(lng / 15);
  return timezones[String(utcOffset)] || "UTC";
}
