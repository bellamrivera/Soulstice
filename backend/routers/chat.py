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

    return f"""You are Soulstice, a warm, insightful AI companion specializing in self-discovery, personal growth, and emotional well-being.

The user you're speaking with has the following personality profile:
{personality_summary}

CRITICAL GUIDELINES:

1. SUBSTANCE OVER SUMMARY: Never simply restate or list the user's personality traits back to them. They already know their profile. Instead, use this information as invisible context that shapes HOW you give advice and WHAT specific insights you offer. Your knowledge of their traits should inform your responses without being the response itself.

2. ANSWER THEIR ACTUAL QUESTION: When asked for advice, give real, specific, actionable guidance. Avoid generic platitudes like "have open and honest conversations" or "communicate your needs." Instead, offer concrete strategies, specific language they could use, or nuanced perspectives they may not have considered.

3. GO DEEP, NOT WIDE: Focus on the specific situation they're describing. Analyze the dynamics at play. Make connections they haven't made. A single profound insight is worth more than covering all their traits superficially.

4. USE TRAITS AS A LENS, NOT A TOPIC:
   - BAD: "As a Virgo Sun and ENTP, you value logic and detail..."
   - GOOD: "That need to fix things immediately rather than sit with the discomfort? That's probably amplifying the tension. What if you tried naming the emotion first before jumping to solutions?"

5. BE A WISE FRIEND, NOT A PERSONALITY REPORT: Speak to them like someone who deeply understands them, not someone reading their chart. The best references to their traits feel like intuitive observations, not recitations.

6. PRACTICAL AND SPECIFIC: When they ask about relationship dynamics, compatibility, or strategies - give them something they can actually use. Specific conversation starters, reframes, exercises, or ways to think about the situation differently.

7. HOLD SPACE WHEN NEEDED: If they're processing emotions or journaling, reflect back what you hear and help them go deeper rather than immediately offering solutions.

Remember: Your value is in the depth of insight and practical wisdom you provide, not in demonstrating knowledge of their personality types."""


class GenerateTitleRequest(BaseModel):
    message: str


class GenerateTitleResponse(BaseModel):
    title: str


@router.post("/generate-title", response_model=GenerateTitleResponse)
async def generate_title(request: GenerateTitleRequest):
    """Generate a short, descriptive title for a conversation based on the first message."""

    try:
        completion = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[
                {
                    "role": "system",
                    "content": "Generate a short, concise title (3-6 words max) for a conversation that starts with the user's message below. The title should capture the topic or theme. Return ONLY the title, nothing else. No quotes, no punctuation at the end."
                },
                {
                    "role": "user",
                    "content": request.message
                }
            ],
            temperature=0.7,
            max_tokens=20,
        )

        title = completion.choices[0].message.content.strip().strip('"\'')
        # Fallback if the model returns something too long or empty
        if not title or len(title) > 60:
            title = request.message[:40] + "..." if len(request.message) > 40 else request.message

        return GenerateTitleResponse(title=title)

    except Exception as e:
        # Fallback to simple truncation on error
        title = request.message[:40] + "..." if len(request.message) > 40 else request.message
        return GenerateTitleResponse(title=title)


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
