"""
Chinese Zodiac calculation service

The Chinese Zodiac is based on a 12-year cycle, with each year associated with an animal.
Note: This is a simplified calculation based on year only. The actual Chinese New Year
varies each year (late Jan to mid Feb), so for people born in January/February,
the previous year's animal might apply.
"""

CHINESE_ZODIAC_ANIMALS = [
    "Rat", "Ox", "Tiger", "Rabbit", "Dragon", "Snake",
    "Horse", "Goat", "Monkey", "Rooster", "Dog", "Pig"
]

CHINESE_ZODIAC_ELEMENTS = ["Wood", "Fire", "Earth", "Metal", "Water"]

CHINESE_ZODIAC_INFO = {
    "Rat": {
        "emoji": "🐀",
        "traits": "Quick-witted, resourceful, versatile, kind",
        "years": "1924, 1936, 1948, 1960, 1972, 1984, 1996, 2008, 2020"
    },
    "Ox": {
        "emoji": "🐂",
        "traits": "Diligent, dependable, strong, determined",
        "years": "1925, 1937, 1949, 1961, 1973, 1985, 1997, 2009, 2021"
    },
    "Tiger": {
        "emoji": "🐅",
        "traits": "Brave, confident, competitive, unpredictable",
        "years": "1926, 1938, 1950, 1962, 1974, 1986, 1998, 2010, 2022"
    },
    "Rabbit": {
        "emoji": "🐇",
        "traits": "Quiet, elegant, kind, responsible",
        "years": "1927, 1939, 1951, 1963, 1975, 1987, 1999, 2011, 2023"
    },
    "Dragon": {
        "emoji": "🐉",
        "traits": "Confident, intelligent, enthusiastic, ambitious",
        "years": "1928, 1940, 1952, 1964, 1976, 1988, 2000, 2012, 2024"
    },
    "Snake": {
        "emoji": "🐍",
        "traits": "Enigmatic, intelligent, wise, intuitive",
        "years": "1929, 1941, 1953, 1965, 1977, 1989, 2001, 2013, 2025"
    },
    "Horse": {
        "emoji": "🐴",
        "traits": "Animated, active, energetic, free-spirited",
        "years": "1930, 1942, 1954, 1966, 1978, 1990, 2002, 2014, 2026"
    },
    "Goat": {
        "emoji": "🐐",
        "traits": "Calm, gentle, sympathetic, creative",
        "years": "1931, 1943, 1955, 1967, 1979, 1991, 2003, 2015"
    },
    "Monkey": {
        "emoji": "🐒",
        "traits": "Sharp, smart, curious, mischievous",
        "years": "1932, 1944, 1956, 1968, 1980, 1992, 2004, 2016"
    },
    "Rooster": {
        "emoji": "🐓",
        "traits": "Observant, hardworking, courageous, confident",
        "years": "1933, 1945, 1957, 1969, 1981, 1993, 2005, 2017"
    },
    "Dog": {
        "emoji": "🐕",
        "traits": "Loyal, honest, amiable, kind, prudent",
        "years": "1934, 1946, 1958, 1970, 1982, 1994, 2006, 2018"
    },
    "Pig": {
        "emoji": "🐷",
        "traits": "Compassionate, generous, diligent, sincere",
        "years": "1935, 1947, 1959, 1971, 1983, 1995, 2007, 2019"
    }
}


def get_chinese_zodiac(year: int) -> dict:
    """
    Calculate Chinese Zodiac animal and element for a given year.

    Returns a dict with:
    - animal: The zodiac animal name
    - element: The element (Wood, Fire, Earth, Metal, Water)
    - emoji: The animal emoji
    - traits: Key personality traits
    - full_sign: Combined element + animal (e.g., "Water Dragon")
    """
    # The cycle started in 4 AD with the Rat
    # 1900 was a Rat year, so we use that as reference
    animal_index = (year - 1900) % 12
    animal = CHINESE_ZODIAC_ANIMALS[animal_index]

    # Elements cycle every 2 years (each element has a yin and yang year)
    # Wood: 4,5 | Fire: 6,7 | Earth: 8,9 | Metal: 0,1 | Water: 2,3
    element_index = ((year - 4) % 10) // 2
    element = CHINESE_ZODIAC_ELEMENTS[element_index]

    info = CHINESE_ZODIAC_INFO[animal]

    return {
        "animal": animal,
        "element": element,
        "emoji": info["emoji"],
        "traits": info["traits"],
        "full_sign": f"{element} {animal}"
    }


def get_chinese_zodiac_compatibility(animal1: str, animal2: str) -> dict:
    """
    Get compatibility between two Chinese Zodiac animals.
    Returns compatibility level and description.
    """
    # Best matches (highly compatible)
    best_matches = {
        "Rat": ["Dragon", "Monkey", "Ox"],
        "Ox": ["Snake", "Rooster", "Rat"],
        "Tiger": ["Horse", "Dog", "Pig"],
        "Rabbit": ["Goat", "Pig", "Dog"],
        "Dragon": ["Rat", "Monkey", "Rooster"],
        "Snake": ["Ox", "Rooster", "Dragon"],
        "Horse": ["Tiger", "Goat", "Dog"],
        "Goat": ["Rabbit", "Horse", "Pig"],
        "Monkey": ["Rat", "Dragon", "Snake"],
        "Rooster": ["Ox", "Snake", "Dragon"],
        "Dog": ["Tiger", "Rabbit", "Horse"],
        "Pig": ["Tiger", "Rabbit", "Goat"]
    }

    # Challenging matches (least compatible)
    challenging = {
        "Rat": ["Horse", "Rooster"],
        "Ox": ["Goat", "Horse"],
        "Tiger": ["Monkey", "Snake"],
        "Rabbit": ["Rooster", "Dragon"],
        "Dragon": ["Dog", "Rabbit"],
        "Snake": ["Pig", "Tiger"],
        "Horse": ["Rat", "Ox"],
        "Goat": ["Ox", "Dog"],
        "Monkey": ["Tiger", "Pig"],
        "Rooster": ["Rabbit", "Rat"],
        "Dog": ["Dragon", "Goat"],
        "Pig": ["Snake", "Monkey"]
    }

    if animal2 in best_matches.get(animal1, []):
        return {
            "level": "excellent",
            "score": 90,
            "description": f"{animal1} and {animal2} are highly compatible! This is one of the best matches in Chinese astrology."
        }
    elif animal2 in challenging.get(animal1, []):
        return {
            "level": "challenging",
            "score": 40,
            "description": f"{animal1} and {animal2} may face challenges. Different temperaments require patience and understanding."
        }
    else:
        return {
            "level": "moderate",
            "score": 65,
            "description": f"{animal1} and {animal2} have moderate compatibility. With effort, this can be a harmonious relationship."
        }
