"""
Astrology API Router
Provides endpoints for birth chart and summary calculations
"""

from fastapi import APIRouter, HTTPException

from schemas.astrology import (
    BirthChartRequest,
    BirthChartResponse,
    ChartSummaryRequest,
    ChartSummaryResponse,
)
from services.astrology import calculate_birth_chart, get_chart_summary

router = APIRouter(prefix="/api", tags=["astrology"])


@router.post("/birth-chart", response_model=BirthChartResponse)
async def create_birth_chart(request: BirthChartRequest):
    """
    Calculate a complete natal birth chart.

    Requires:
    - birth_date: YYYY-MM-DD format
    - birth_time: HH:MM format (24-hour)
    - latitude: decimal degrees
    - longitude: decimal degrees
    - timezone: IANA timezone (e.g., "America/New_York")
    """
    try:
        chart = calculate_birth_chart(request)
        return chart
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to calculate birth chart: {str(e)}")


@router.post("/chart-summary", response_model=ChartSummaryResponse)
async def create_chart_summary(request: ChartSummaryRequest):
    """
    Get a quick summary (sun/moon/rising) for a birth chart.
    """
    try:
        # First calculate the full chart
        chart_request = BirthChartRequest(
            name="User",
            birth_date=request.birth_date,
            birth_time=request.birth_time,
            latitude=request.latitude,
            longitude=request.longitude,
            timezone=request.timezone,
        )
        chart = calculate_birth_chart(chart_request)
        summary = get_chart_summary(chart)
        return summary
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to calculate chart summary: {str(e)}")
