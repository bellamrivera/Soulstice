"""
Soulstice FastAPI Backend
Main application entry point
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routers import astrology, chat, daily_insight

app = FastAPI(
    title="Soulstice API",
    description="Backend API for Soulstice - your complete self-discovery companion",
    version="0.1.0",
)

# Configure CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",  # Next.js dev server
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(astrology.router)
app.include_router(chat.router)
app.include_router(daily_insight.router)


@app.get("/")
async def root():
    return {
        "name": "Soulstice API",
        "version": "0.1.0",
        "status": "running",
    }


@app.get("/health")
async def health_check():
    return {"status": "healthy"}
