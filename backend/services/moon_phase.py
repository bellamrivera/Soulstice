"""
Moon phase calculation service

Calculates the current moon phase using astronomical algorithms.
"""

import math
from datetime import datetime, timezone
from typing import TypedDict


class MoonPhaseInfo(TypedDict):
    name: str
    emoji: str
    description: str


MOON_PHASES: list[MoonPhaseInfo] = [
    {"name": "New Moon", "emoji": "🌑", "description": "A time for new beginnings, setting intentions, and planting seeds"},
    {"name": "Waxing Crescent", "emoji": "🌒", "description": "Building momentum, taking initial steps toward goals"},
    {"name": "First Quarter", "emoji": "🌓", "description": "Time for action, decisions, and overcoming obstacles"},
    {"name": "Waxing Gibbous", "emoji": "🌔", "description": "Refining, adjusting, and preparing for culmination"},
    {"name": "Full Moon", "emoji": "🌕", "description": "Culmination, clarity, celebration, and release"},
    {"name": "Waning Gibbous", "emoji": "🌖", "description": "Gratitude, sharing wisdom, and introspection"},
    {"name": "Last Quarter", "emoji": "🌗", "description": "Letting go, forgiveness, and clearing"},
    {"name": "Waning Crescent", "emoji": "🌘", "description": "Rest, surrender, and preparation for renewal"},
]

ZODIAC_SIGNS = [
    "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
    "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"
]

# Synodic month length in days
SYNODIC_MONTH = 29.53059

# Known new moon: Jan 11, 2024 at 11:57 UTC
KNOWN_NEW_MOON = datetime(2024, 1, 11, 11, 57, 0, tzinfo=timezone.utc)

# Sidereal month for moon sign calculation
SIDEREAL_MONTH = 27.321661


def get_moon_phase(date: datetime | None = None) -> dict:
    """
    Calculate moon phase for a given date.

    Returns:
        dict with name, emoji, description, illumination, days_into_cycle,
        days_until_full, days_until_new
    """
    if date is None:
        date = datetime.now(timezone.utc)
    elif date.tzinfo is None:
        date = date.replace(tzinfo=timezone.utc)

    # Calculate days since known new moon
    diff = date - KNOWN_NEW_MOON
    diff_days = diff.total_seconds() / (60 * 60 * 24)

    # Get position in current cycle (0 to ~29.53)
    days_into_cycle = diff_days % SYNODIC_MONTH
    if days_into_cycle < 0:
        days_into_cycle += SYNODIC_MONTH

    # Calculate illumination
    cycle_position = days_into_cycle / SYNODIC_MONTH
    illumination = round(50 * (1 - math.cos(2 * math.pi * cycle_position)))

    # Determine phase (8 phases)
    phase_index = int((days_into_cycle / SYNODIC_MONTH) * 8) % 8
    phase = MOON_PHASES[phase_index]

    # Days until full moon (~14.77 days into cycle)
    full_moon_day = SYNODIC_MONTH / 2
    days_until_full = full_moon_day - days_into_cycle
    if days_until_full < 0:
        days_until_full += SYNODIC_MONTH

    # Days until new moon
    days_until_new = SYNODIC_MONTH - days_into_cycle
    if days_until_new >= SYNODIC_MONTH:
        days_until_new = 0

    return {
        "name": phase["name"],
        "emoji": phase["emoji"],
        "description": phase["description"],
        "illumination": illumination,
        "days_into_cycle": round(days_into_cycle, 1),
        "days_until_full": round(days_until_full, 1),
        "days_until_new": round(days_until_new, 1),
    }


def get_moon_sign(date: datetime | None = None) -> str:
    """
    Get the current zodiac sign the moon is in (simplified calculation).
    """
    if date is None:
        date = datetime.now(timezone.utc)
    elif date.tzinfo is None:
        date = date.replace(tzinfo=timezone.utc)

    # Known: Jan 1, 2024 moon was in Cancer (index 3)
    known_date = datetime(2024, 1, 1, 0, 0, 0, tzinfo=timezone.utc)
    known_sign_index = 3  # Cancer

    diff = date - known_date
    diff_days = diff.total_seconds() / (60 * 60 * 24)

    # Moon moves through one sign every ~2.28 days
    days_per_sign = SIDEREAL_MONTH / 12
    signs_passed = int(diff_days / days_per_sign)

    sign_index = (known_sign_index + signs_passed) % 12
    if sign_index < 0:
        sign_index += 12

    return ZODIAC_SIGNS[sign_index]
