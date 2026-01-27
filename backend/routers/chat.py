"""
Chat router - AI-powered conversations with personalized insights
"""

import os
from typing import List, Optional
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from groq import Groq
from dotenv import load_dotenv

from services.chinese_zodiac import get_chinese_zodiac

load_dotenv()

router = APIRouter(prefix="/api/chat", tags=["chat"])

client = Groq(api_key=os.getenv("GROQ_API_KEY"))


class Message(BaseModel):
    role: str  # "user" or "assistant"
    content: str


class UserProfile(BaseModel):
    sun_sign: str
    moon_sign: str
    rising_sign: str
    birth_year: Optional[int] = None
    mbti: Optional[str] = None
    enneagram_type: Optional[int] = None
    enneagram_wing: Optional[str] = None
    enneagram_instinct: Optional[str] = None
    attachment_style: Optional[str] = None
    love_languages: Optional[List[str]] = None


class ChatRequest(BaseModel):
    messages: List[Message]
    profile: UserProfile


class ChatResponse(BaseModel):
    message: str


def build_system_prompt(profile: UserProfile) -> str:
    """Build a personalized system prompt based on user's profile."""

    personality_parts = []

    # Western Astrology
    personality_parts.append(f"- Sun in {profile.sun_sign} (core identity, ego, life purpose)")
    personality_parts.append(f"- Moon in {profile.moon_sign} (emotions, inner self, instincts)")
    personality_parts.append(f"- Rising/Ascendant in {profile.rising_sign} (outward persona, first impressions)")

    # Chinese Zodiac
    if profile.birth_year:
        chinese_zodiac = get_chinese_zodiac(profile.birth_year)
        personality_parts.append(f"- Chinese Zodiac: {chinese_zodiac['full_sign']} {chinese_zodiac['emoji']} ({chinese_zodiac['traits']})")

    # MBTI
    if profile.mbti:
        personality_parts.append(f"- MBTI: {profile.mbti}")

    # Enneagram
    if profile.enneagram_type:
        enneagram_str = f"- Enneagram: Type {profile.enneagram_type}"
        if profile.enneagram_wing:
            wing_num = profile.enneagram_type - 1 if profile.enneagram_wing == "left" else profile.enneagram_type + 1
            enneagram_str += f" wing {wing_num}"
        if profile.enneagram_instinct:
            instinct_names = {"sp": "Self-Preservation", "sx": "Sexual/One-to-One", "so": "Social"}
            enneagram_str += f" ({instinct_names.get(profile.enneagram_instinct, profile.enneagram_instinct)} instinct)"
        personality_parts.append(enneagram_str)

    # Attachment
    if profile.attachment_style:
        personality_parts.append(f"- Attachment Style: {profile.attachment_style.title()}")

    # Love Languages
    if profile.love_languages and len(profile.love_languages) > 0:
        personality_parts.append(f"- Love Languages: {', '.join(profile.love_languages)}")

    personality_summary = "\n".join(personality_parts)

    return f"""You are Soulstice, a warm, insightful AI companion specializing in self-discovery, personal growth, and emotional well-being. You combine wisdom from astrology, personality psychology, and attachment theory to provide deeply personalized guidance.

The user you're speaking with has the following profile:
{personality_summary}

Guidelines for your responses:
1. Be warm, empathetic, and supportive - like a wise friend who truly understands them
2. Reference their specific traits naturally when relevant (e.g., "As a Virgo Sun, you might find...")
3. Offer insights that connect different aspects of their personality (e.g., how their Moon sign interacts with their attachment style)
4. Keep responses conversational and not too long - aim for 2-4 paragraphs unless they ask for more detail
5. Ask thoughtful follow-up questions to deepen the conversation
6. Avoid being preachy or overly positive - be genuine and balanced
7. If they're journaling or processing emotions, hold space and reflect back what you hear
8. You can offer journal prompts, reflection questions, or gentle suggestions when appropriate

Remember: You're not just an astrology bot. You're a holistic self-discovery companion who sees them as a whole, unique person."""


@router.post("", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """Send a message and get an AI response personalized to the user's profile."""

    if not request.messages:
        raise HTTPException(status_code=400, detail="Messages cannot be empty")

    system_prompt = build_system_prompt(request.profile)

    # Build messages for Groq
    groq_messages = [{"role": "system", "content": system_prompt}]

    for msg in request.messages:
        groq_messages.append({
            "role": msg.role,
            "content": msg.content
        })

    try:
        completion = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=groq_messages,
            temperature=0.8,
            max_tokens=1024,
        )

        response_text = completion.choices[0].message.content
        return ChatResponse(message=response_text)

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Chat error: {str(e)}")
