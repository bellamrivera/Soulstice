const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export interface BirthChartRequest {
  name: string;
  birth_date: string;
  birth_time: string;
  latitude: number;
  longitude: number;
  timezone: string;
}

export interface BirthChartResponse {
  name: string;
  birth_data: {
    date: string;
    time: string;
    latitude: number;
    longitude: number;
    timezone: string;
  };
  planets: Record<string, {
    sign: string;
    position: number;
    house: string;
    retrograde: boolean;
  }>;
  houses: Record<string, {
    sign: string;
    position: number;
  }>;
  rising_sign: string;
  aspects: Array<{
    planet1: string;
    planet2: string;
    aspect: string;
    orb: number;
    is_applying: boolean;
  }>;
}

export async function fetchBirthChart(request: BirthChartRequest): Promise<BirthChartResponse> {
  const response = await fetch(`${API_BASE_URL}/api/birth-chart`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: "Failed to fetch birth chart" }));
    throw new Error(error.detail || "Failed to fetch birth chart");
  }

  return response.json();
}
