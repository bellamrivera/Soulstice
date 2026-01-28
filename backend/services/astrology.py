"""
Astrology Service - Direct Kerykeion integration
Provides birth chart calculations for the FastAPI backend
"""

from kerykeion import AstrologicalSubject, NatalAspects
from schemas.astrology import (
    BirthChartRequest,
    BirthChartResponse,
    ChartSummaryResponse,
    BirthData,
    PlanetPosition,
    HouseCusp,
    Aspect,
)


SIGN_TO_ELEMENT = {
    "Ari": "Fire", "Leo": "Fire", "Sag": "Fire",
    "Tau": "Earth", "Vir": "Earth", "Cap": "Earth",
    "Gem": "Air", "Lib": "Air", "Aqu": "Air",
    "Can": "Water", "Sco": "Water", "Pis": "Water",
}

# Map short sign names to full names
SIGN_FULL_NAMES = {
    "Ari": "Aries", "Tau": "Taurus", "Gem": "Gemini", "Can": "Cancer",
    "Leo": "Leo", "Vir": "Virgo", "Lib": "Libra", "Sco": "Scorpio",
    "Sag": "Sagittarius", "Cap": "Capricorn", "Aqu": "Aquarius", "Pis": "Pisces",
}


def calculate_birth_chart(request: BirthChartRequest) -> BirthChartResponse:
    """Calculate a complete natal birth chart using Kerykeion"""

    # Parse date and time
    year, month, day = map(int, request.birth_date.split("-"))
    hour, minute = map(int, request.birth_time.split(":"))

    # Create the astrological subject
    subject = AstrologicalSubject(
        name=request.name,
        year=year,
        month=month,
        day=day,
        hour=hour,
        minute=minute,
        lat=request.latitude,
        lng=request.longitude,
        tz_str=request.timezone or "UTC",
    )

    # Get planetary positions
    planet_attrs = ["sun", "moon", "mercury", "venus", "mars",
                    "jupiter", "saturn", "uranus", "neptune", "pluto"]

    planets = {}
    for planet_name in planet_attrs:
        planet_data = getattr(subject, planet_name, None)
        if planet_data:
            full_sign = SIGN_FULL_NAMES.get(planet_data.sign, planet_data.sign)
            house_name = planet_data.house.replace("_", " ") if planet_data.house else "Unknown"
            planets[planet_name.capitalize()] = PlanetPosition(
                sign=full_sign,
                position=round(planet_data.abs_pos, 2),
                house=house_name,
                retrograde=planet_data.retrograde if planet_data.retrograde else False,
            )

    # Get house cusps
    house_attrs = ["first_house", "second_house", "third_house", "fourth_house",
                   "fifth_house", "sixth_house", "seventh_house", "eighth_house",
                   "ninth_house", "tenth_house", "eleventh_house", "twelfth_house"]

    houses = {}
    rising_sign = "Unknown"
    for i, house_attr in enumerate(house_attrs, 1):
        house_data = getattr(subject, house_attr, None)
        if house_data:
            full_sign = SIGN_FULL_NAMES.get(house_data.sign, house_data.sign)
            houses[str(i)] = HouseCusp(
                sign=full_sign,
                position=round(house_data.abs_pos, 2),
            )
            if i == 1:
                rising_sign = full_sign

    # Calculate aspects
    aspects = []
    try:
        natal_aspects = NatalAspects(subject)
        aspects_data = natal_aspects.all_aspects

        for aspect in aspects_data:
            aspects.append(Aspect(
                planet1=aspect.get("p1_name", ""),
                planet2=aspect.get("p2_name", ""),
                aspect=aspect.get("aspect", ""),
                orb=round(aspect.get("orbit", 0), 2),
                is_applying=aspect.get("aid", 0) < 0,
            ))
    except Exception:
        # If aspects calculation fails, continue without them
        pass

    return BirthChartResponse(
        name=request.name,
        birth_data=BirthData(
            date=request.birth_date,
            time=request.birth_time,
            latitude=request.latitude,
            longitude=request.longitude,
            timezone=request.timezone or "UTC",
        ),
        planets=planets,
        houses=houses,
        rising_sign=rising_sign,
        aspects=aspects,
    )


def get_chart_summary(chart: BirthChartResponse) -> ChartSummaryResponse:
    """Extract a summary from a full birth chart"""

    planets = chart.planets

    # Calculate dominant element (use short sign names)
    element_counts = {"Fire": 0, "Earth": 0, "Air": 0, "Water": 0}
    sign_to_element_full = {
        "Aries": "Fire", "Leo": "Fire", "Sagittarius": "Fire",
        "Taurus": "Earth", "Virgo": "Earth", "Capricorn": "Earth",
        "Gemini": "Air", "Libra": "Air", "Aquarius": "Air",
        "Cancer": "Water", "Scorpio": "Water", "Pisces": "Water",
    }
    for planet in planets.values():
        element = sign_to_element_full.get(planet.sign)
        if element:
            element_counts[element] += 1

    dominant_element = max(element_counts, key=element_counts.get)

    # Get retrograde planets
    retrograde_planets = [
        name for name, data in planets.items()
        if data.retrograde
    ]

    return ChartSummaryResponse(
        sun_sign=planets.get("Sun").sign if planets.get("Sun") else "Unknown",
        moon_sign=planets.get("Moon").sign if planets.get("Moon") else "Unknown",
        rising_sign=chart.rising_sign,
        retrograde_planets=retrograde_planets,
        dominant_element=dominant_element,
    )
