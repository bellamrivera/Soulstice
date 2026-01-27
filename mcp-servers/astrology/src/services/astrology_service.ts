import { spawn } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface BirthChartParams {
  name: string;
  birth_date: string;
  birth_time: string;
  latitude: number;
  longitude: number;
  timezone?: string;
}

/**
 * Call the Python Kerykeion service to calculate a birth chart
 */
export async function calculateBirthChart(params: BirthChartParams): Promise<any> {
  const { name, birth_date, birth_time, latitude, longitude, timezone = "UTC" } = params;

  // Parse date and time
  const [year, month, day] = birth_date.split("-").map(Number);
  const [hour, minute] = birth_time.split(":").map(Number);

  // Prepare input for Python script
  const input = {
    command: "calculate_birth_chart",
    name,
    year,
    month,
    day,
    hour,
    minute,
    lat: latitude,
    lng: longitude,
    tz_str: timezone,
  };

  // Path to the Python script
  const pythonScript = path.join(__dirname, "kerykeion_service.py");
  const venvPython = path.join(__dirname, "..", "..", "venv", "bin", "python3");

  return new Promise((resolve, reject) => {
    const python = spawn(venvPython, [pythonScript]);

    let stdout = "";
    let stderr = "";

    python.stdout.on("data", (data) => {
      stdout += data.toString();
    });

    python.stderr.on("data", (data) => {
      stderr += data.toString();
    });

    python.on("close", (code) => {
      if (code !== 0) {
        reject(new Error(`Python process exited with code ${code}: ${stderr}`));
        return;
      }

      try {
        const result = JSON.parse(stdout);
        if (result.error) {
          reject(new Error(result.error));
        } else {
          resolve(result);
        }
      } catch (error) {
        reject(new Error(`Failed to parse Python output: ${error}`));
      }
    });

    // Send input to Python script
    python.stdin.write(JSON.stringify(input));
    python.stdin.end();
  });
}

/**
 * Get a summary of the birth chart
 */
export async function getChartSummary(params: BirthChartParams): Promise<any> {
  // First calculate the full chart
  const chart = await calculateBirthChart(params);

  // Extract summary information
  const planets = chart.planets || {};

  return {
    sun_sign: planets.Sun?.sign || "Unknown",
    moon_sign: planets.Moon?.sign || "Unknown",
    rising_sign: chart.rising_sign || "Unknown",
    retrograde_planets: Object.entries(planets)
      .filter(([_, data]: [string, any]) => data.retrograde)
      .map(([name, _]: [string, any]) => name),
  };
}
