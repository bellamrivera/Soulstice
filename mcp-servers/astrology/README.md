# Astrology MCP Server

A FastMCP server for astrological calculations using Kerykeion.

## Features

- **Birth Chart Calculation**: Complete natal charts with planetary positions, houses, and aspects
- **Chart Summaries**: Quick Sun/Moon/Rising sign lookups
- **Python + TypeScript**: Kerykeion (Python) wrapped in FastMCP (TypeScript)

## Tools

### `get_birth_chart`
Calculate a complete natal birth chart including:
- Planetary positions (Sun, Moon, Mercury, Venus, Mars, Jupiter, Saturn, Uranus, Neptune, Pluto)
- 12 House cusps
- Rising sign (Ascendant)
- Aspects between planets
- Retrograde indicators

**Parameters:**
- `name` (string): Person's name
- `birth_date` (string): Birth date in YYYY-MM-DD format
- `birth_time` (string): Birth time in HH:MM format (24-hour)
- `latitude` (number): Latitude of birth location
- `longitude` (number): Longitude of birth location
- `timezone` (string, optional): Timezone string (e.g., 'America/New_York'), defaults to UTC

### `get_chart_summary`
Get a quick summary including Sun, Moon, and Rising signs plus retrograde planets.

**Parameters:** Same as `get_birth_chart` except `name` is optional

## Tech Stack

- **FastMCP**: TypeScript MCP server framework
- **Kerykeion**: Python astrological calculation library
- **Swiss Ephemeris**: Industry-standard astronomical calculations

## Setup

### Prerequisites
- Node.js 18+
- Python 3.11+

### Installation

```bash
# Install Node dependencies
npm install

# Create Python virtual environment
python3.11 -m venv venv

# Activate venv and install Python dependencies
source venv/bin/activate
pip install -r requirements.txt
```

### Running the Server

```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm start
```

The server will start on port 3033 by default (configurable via `.env` file).

## Example Usage

```bash
# Test the Python service directly
echo '{"command": "calculate_birth_chart", "name": "Test", "year": 1995, "month": 3, "day": 15, "hour": 14, "minute": 30, "lat": 40.7128, "lng": -74.0060, "tz_str": "America/New_York"}' | python3 src/services/kerykeion_service.py
```

## Architecture

```
TypeScript FastMCP Server
    ↓
astrology_service.ts (spawns Python process)
    ↓
kerykeion_service.py (Kerykeion wrapper)
    ↓
Kerykeion library (Swiss Ephemeris)
```

## Development

```bash
# Build TypeScript
npm run build

# Watch mode
npm run dev
```

## License

MIT

## Credits

Built for the Lumina personal project portfolio.
Uses Kerykeion by Giacomo Battaglia.
