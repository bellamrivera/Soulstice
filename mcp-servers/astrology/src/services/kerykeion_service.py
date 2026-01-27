#!/usr/bin/env python3
"""
Kerykeion Service - Wrapper for astrological calculations
Provides birth chart, transit, and compatibility calculations
"""

import json
import sys
from datetime import datetime
from kerykeion import KrInstance
from kerykeion.aspects import NatalAspects

def calculate_birth_chart(name: str, year: int, month: int, day: int, hour: int, minute: int, lat: float, lng: float, tz_str: str = "UTC"):
    """Calculate a complete natal birth chart"""
    try:
        # Create the astrological subject
        subject = KrInstance(
            name=name,
            year=year,
            month=month,
            day=day,
            hour=hour,
            minute=minute,
            lat=lat,
            lng=lng,
            tz_str=tz_str,
            online=False  # Don't fetch geolocation data online
        )

        # Build the chart data
        chart = {
            "name": name,
            "birth_data": {
                "date": f"{year}-{month:02d}-{day:02d}",
                "time": f"{hour:02d}:{minute:02d}",
                "latitude": lat,
                "longitude": lng,
                "timezone": tz_str
            },
            "planets": {},
            "houses": {},
            "aspects": []
        }

        # Get planetary positions
        planets_to_include = ["sun", "moon", "mercury", "venus", "mars", "jupiter", "saturn", "uranus", "neptune", "pluto"]

        for planet_name in planets_to_include:
            planet_data = getattr(subject, planet_name, None)
            if planet_data:
                chart["planets"][planet_name.capitalize()] = {
                    "sign": planet_data.sign,
                    "position": round(planet_data.abs_pos, 2),
                    "house": planet_data.house,
                    "retrograde": planet_data.retrograde
                }

        # Get house cusps
        houses_list = subject.houses_list
        for i, house_data in enumerate(houses_list, 1):
            chart["houses"][str(i)] = {
                "sign": house_data.sign,
                "position": round(house_data.position, 2)
            }

        # Get rising sign (Ascendant) - same as first house
        chart["rising_sign"] = houses_list[0].sign if houses_list else ""

        # Calculate aspects
        try:
            natal_aspects = NatalAspects(subject)
            aspects_data = natal_aspects.all_aspects

            for aspect in aspects_data:
                chart["aspects"].append({
                    "planet1": aspect.get("p1_name", ""),
                    "planet2": aspect.get("p2_name", ""),
                    "aspect": aspect.get("aspect", ""),
                    "orb": round(aspect.get("orbit", 0), 2),
                    "is_applying": aspect.get("aid", 0) < 0
                })
        except Exception as e:
            # If aspects calculation fails, continue without them
            chart["aspects"] = []

        return chart

    except Exception as e:
        return {"error": str(e)}


def get_chart_summary(chart_data: dict):
    """Generate a high-level summary of the chart"""
    try:
        planets = chart_data.get("planets", {})

        summary = {
            "sun_sign": planets.get("Sun", {}).get("sign", "Unknown"),
            "moon_sign": planets.get("Moon", {}).get("sign", "Unknown"),
            "rising_sign": chart_data.get("rising_sign", "Unknown"),
            "dominant_elements": calculate_dominant_element(planets),
            "retrograde_planets": [name for name, data in planets.items() if data.get("retrograde", False)]
        }

        return summary

    except Exception as e:
        return {"error": str(e)}


def calculate_dominant_element(planets: dict):
    """Calculate which element (Fire, Earth, Air, Water) is most dominant"""
    elements = {"Fire": 0, "Earth": 0, "Air": 0, "Water": 0}

    sign_to_element = {
        "Aries": "Fire", "Leo": "Fire", "Sagittarius": "Fire",
        "Taurus": "Earth", "Virgo": "Earth", "Capricorn": "Earth",
        "Gemini": "Air", "Libra": "Air", "Aquarius": "Air",
        "Cancer": "Water", "Scorpio": "Water", "Pisces": "Water"
    }

    for planet_data in planets.values():
        sign = planet_data.get("sign", "")
        element = sign_to_element.get(sign)
        if element:
            elements[element] += 1

    dominant = max(elements, key=elements.get)
    return {"element": dominant, "count": elements[dominant], "distribution": elements}


if __name__ == "__main__":
    # Read JSON input from stdin
    input_data = json.loads(sys.stdin.read())
    command = input_data.get("command")

    if command == "calculate_birth_chart":
        result = calculate_birth_chart(
            name=input_data.get("name", "User"),
            year=input_data["year"],
            month=input_data["month"],
            day=input_data["day"],
            hour=input_data["hour"],
            minute=input_data["minute"],
            lat=input_data["lat"],
            lng=input_data["lng"],
            tz_str=input_data.get("tz_str", "UTC")
        )
        print(json.dumps(result))

    elif command == "get_chart_summary":
        chart_data = input_data.get("chart_data", {})
        result = get_chart_summary(chart_data)
        print(json.dumps(result))

    else:
        print(json.dumps({"error": f"Unknown command: {command}"}))
