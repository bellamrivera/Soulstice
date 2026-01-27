from pydantic import BaseModel, Field
from typing import Dict, List, Optional


class BirthChartRequest(BaseModel):
    name: str = Field(default="User")
    birth_date: str = Field(..., pattern=r"^\d{4}-\d{2}-\d{2}$", description="YYYY-MM-DD format")
    birth_time: str = Field(..., pattern=r"^\d{2}:\d{2}$", description="HH:MM format (24-hour)")
    latitude: float = Field(..., ge=-90, le=90)
    longitude: float = Field(..., ge=-180, le=180)
    timezone: Optional[str] = Field(default="UTC", description="IANA timezone, e.g., America/New_York")


class ChartSummaryRequest(BaseModel):
    birth_date: str = Field(..., pattern=r"^\d{4}-\d{2}-\d{2}$")
    birth_time: str = Field(..., pattern=r"^\d{2}:\d{2}$")
    latitude: float = Field(..., ge=-90, le=90)
    longitude: float = Field(..., ge=-180, le=180)
    timezone: Optional[str] = Field(default="UTC")


class PlanetPosition(BaseModel):
    sign: str
    position: float
    house: str
    retrograde: bool


class HouseCusp(BaseModel):
    sign: str
    position: float


class Aspect(BaseModel):
    planet1: str
    planet2: str
    aspect: str
    orb: float
    is_applying: bool


class BirthData(BaseModel):
    date: str
    time: str
    latitude: float
    longitude: float
    timezone: str


class BirthChartResponse(BaseModel):
    name: str
    birth_data: BirthData
    planets: Dict[str, PlanetPosition]
    houses: Dict[str, HouseCusp]
    rising_sign: str
    aspects: List[Aspect]


class ChartSummaryResponse(BaseModel):
    sun_sign: str
    moon_sign: str
    rising_sign: str
    retrograde_planets: List[str]
    dominant_element: Optional[str] = None
