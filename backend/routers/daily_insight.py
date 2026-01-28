"""
Daily Insight router - personalized daily guidance based on celestial events
"""

import os
from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from groq import Groq
from dotenv import load_dotenv

from services.moon_phase import get_moon_phase, get_moon_sign
from services.chinese_zodiac import get_chinese_zodiac

load_dotenv()

router = APIRouter(prefix="/api/daily-insight", tags=["daily-insight"])

client = Groq(api_key=os.getenv("GROQ_API_KEY"))


class UserProfile(BaseModel):
    sun_sign: str
    moon_sign: str
    rising_sign: str
    birth_year: Optional[int] = None
    mbti: Optional[str] = None
    enneagram_type: Optional[int] = None


class CosmicWeather(BaseModel):
    moon_phase: dict
    moon_sign: str
    current_year_zodiac: dict
    user_chinese_zodiac: Optional[dict] = None


class DailyInsightRequest(BaseModel):
    profile: UserProfile


class DailyInsightResponse(BaseModel):
    insight: str
    cosmic_weather: CosmicWeather
    generated_at: str


def get_current_cosmic_weather(birth_year: Optional[int] = None) -> CosmicWeather:
    """Get current celestial conditions."""
    now = datetime.now(timezone.utc)
    current_year = now.year

    moon_phase = get_moon_phase(now)
    moon_sign = get_moon_sign(now)
    current_year_zodiac = get_chinese_zodiac(current_year)

    user_chinese_zodiac = None
    if birth_year:
        user_chinese_zodiac = get_chinese_zodiac(birth_year)

    return CosmicWeather(
        moon_phase=moon_phase,
        moon_sign=moon_sign,
        current_year_zodiac=current_year_zodiac,
        user_chinese_zodiac=user_chinese_zodiac,
    )


def build_insight_prompt(profile: UserProfile, weather: CosmicWeather) -> str:
    """Build the prompt for generating daily insight."""

    # Build user profile context
    profile_parts = [
        f"Sun Sign: {profile.sun_sign}",
        f"Moon Sign: {profile.moon_sign}",
        f"Rising Sign: {profile.rising_sign}",
    ]

    if profile.mbti:
        profile_parts.append(f"MBTI: {profile.mbti}")

    if profile.enneagram_type:
        profile_parts.append(f"Enneagram: Type {profile.enneagram_type}")

    if weather.user_chinese_zodiac:
        profile_parts.append(f"Chinese Zodiac: {weather.user_chinese_zodiac['full_sign']}")

    profile_summary = "\n".join(profile_parts)

    # Build cosmic weather context
    moon_phase = weather.moon_phase
    year_zodiac = weather.current_year_zodiac

    # Check if moon is in user's moon sign or sun sign (significant)
    moon_in_users_sign = weather.moon_sign in [profile.moon_sign, profile.sun_sign]

    # Check Chinese zodiac year relationship
    year_relationship = ""
    if weather.user_chinese_zodiac:
        user_animal = weather.user_chinese_zodiac["animal"]
        year_animal = year_zodiac["animal"]
        if user_animal == year_animal:
            year_relationship = f"This is your zodiac year ({user_animal} year)! A powerful time for self-reflection and major life decisions."
        else:
            # Simple compatibility check
            compatible = {
                "Rat": ["Dragon", "Monkey"],
                "Ox": ["Snake", "Rooster"],
                "Tiger": ["Horse", "Dog"],
                "Rabbit": ["Goat", "Pig"],
                "Dragon": ["Rat", "Monkey"],
                "Snake": ["Ox", "Rooster"],
                "Horse": ["Tiger", "Dog"],
                "Goat": ["Rabbit", "Pig"],
                "Monkey": ["Rat", "Dragon"],
                "Rooster": ["Ox", "Snake"],
                "Dog": ["Tiger", "Horse"],
                "Pig": ["Rabbit", "Goat"],
            }
            if year_animal in compatible.get(user_animal, []):
                year_relationship = f"The {year_animal} year harmonizes well with your {user_animal} energy."

    return f"""Generate a personalized daily insight for this user. Be warm, specific, and actionable.

USER PROFILE:
{profile_summary}

TODAY'S COSMIC WEATHER:
- Moon Phase: {moon_phase['name']} {moon_phase['emoji']} ({moon_phase['illumination']}% illuminated)
- Moon Phase Energy: {moon_phase['description']}
- Moon currently in: {weather.moon_sign}
- Current Year: Year of the {year_zodiac['full_sign']} {year_zodiac['emoji']}
{"- Moon is in your " + weather.moon_sign + " - this amplifies your emotional attunement today!" if moon_in_users_sign else ""}
{year_relationship}

INSTRUCTIONS:
1. Write 2-3 short paragraphs (keep it concise and readable)
2. Weave together the moon phase energy with their personality in a natural way
3. Give ONE specific, actionable suggestion for the day
4. Don't list out their traits - integrate them naturally into the guidance
5. Be warm and encouraging but not cheesy
6. If there's something notable (moon in their sign, their zodiac year, full/new moon), highlight its significance briefly

Write the insight directly, no greeting or sign-off needed."""


@router.post("", response_model=DailyInsightResponse)
async def get_daily_insight(request: DailyInsightRequest):
    """Generate a personalized daily insight based on current celestial events."""

    weather = get_current_cosmic_weather(request.profile.birth_year)
    prompt = build_insight_prompt(request.profile, weather)

    try:
        completion = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[
                {
                    "role": "system",
                    "content": "You are Soulstice, a warm and insightful guide who blends astrology, personality psychology, and lunar wisdom to offer meaningful daily guidance. Your tone is like a wise friend - warm, grounded, and genuinely helpful. Never preachy or overly mystical."
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            temperature=0.8,
            max_tokens=400,
        )

        insight = completion.choices[0].message.content.strip()

        return DailyInsightResponse(
            insight=insight,
            cosmic_weather=weather,
            generated_at=datetime.now(timezone.utc).isoformat(),
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate insight: {str(e)}")


@router.get("/cosmic-weather", response_model=CosmicWeather)
async def get_cosmic_weather(birth_year: Optional[int] = None):
    """Get current cosmic weather without generating an insight."""
    return get_current_cosmic_weather(birth_year)
