# Soulstice ✨

**Your complete self-discovery companion**

AI-powered journaling and self-discovery application that synthesizes astrology, personality frameworks, and personal growth into deeply personalized insights.

---

## The Vision

You are not just your sun sign. You're not just an INFJ. You're the **intersection of all of it**.

Soulstice knows:
- 🌟 Your full birth chart (Western astrology)
- 🐉 Your Chinese zodiac (year, month, day, hour animals)
- 🧠 Your MBTI / 16 personalities
- 💫 Your Enneagram (with wing and instinctual variants)
- 🔮 Your Human Design type
- 💕 Your attachment style & love languages
- 📊 Your DISC profile
- ...and whatever else you want to add

**And it synthesizes them.**

> "As a Scorpio sun with a Cancer moon, INFJ, Enneagram 4w5, and Wood Dragon - here's why you're feeling overwhelmed right now, and here's what actually helps someone with YOUR specific combination."

---

## Tech Stack

### Frontend
- **Next.js 14** - React framework with app router
- **Tailwind CSS** - Utility-first styling
- **Framer Motion** - Smooth animations
- **shadcn/ui** - Beautiful, accessible components

### Backend
- **FastAPI** - Python API framework
- **PostgreSQL + pgvector** - Relational database with vector embeddings
- **SQLModel** - Python ORM

### MCP Servers
- **FastMCP** - Custom MCP servers (TypeScript)
- **Kerykeion** - Astrological calculations (Python)
- Swiss Ephemeris for astronomical data

### AI/ML
- **Claude API** - LLM orchestration
- **Voyage AI** - Vector embeddings
- **RAG** - Semantic search across journal entries

### Deployment
- **Vercel** - Frontend hosting (free tier)
- **Render** - Backend hosting (free tier)
- **Neon** - PostgreSQL database (free tier)

**Total cost to launch**: ~$10/year (domain) + ~$5-10/month (LLM usage)

---

## Features

### 🌟 Soul Profile
Your complete multi-system identity - all personality types in one beautiful, shareable view

### 💬 Chat with Soulstice
AI that actually knows you - advice tailored to your complete profile across all frameworks

### 📔 Journal
Free write or guided prompts personalized to your types and current transits. AI summarizes patterns over time.

### 🃏 Daily Draws
Tarot or oracle cards interpreted through YOUR lens, with pattern tracking

### 📊 Insights Dashboard
Mood trends correlated with transits, growth tracking, monthly/yearly auto-generated reviews

### 💕 Compatibility
See how your charts/types interact with others

### 🌙 Cosmic Calendar
Upcoming transits that matter FOR YOU, Mercury retrograde warnings, moon phases

---

## Project Status

**Current**: Building custom MCP servers
- ✅ Astrology MCP (Kerykeion integration)
- 🚧 Chinese Zodiac MCP
- 🚧 Tarot MCP

**Next**: FastAPI backend + Next.js frontend

---

## Portfolio Project

This is a personal portfolio application demonstrating:

### Technical Skills
- **RAG/Embeddings**: Semantic search across journal entries
- **LLM Orchestration**: Synthesizing 8+ personality frameworks
- **MCP Servers**: Custom FastMCP servers for external integrations
- **Full-Stack**: Next.js frontend + FastAPI backend + PostgreSQL
- **Modern React**: Server components, streaming UI, server actions
- **Python ML/AI**: Embeddings, vector search, LLM integration

### Architecture Patterns
- Multi-tenant data isolation
- Event-driven updates
- Caching strategies for expensive computations
- Advanced prompt engineering
- Graceful degradation

### Soft Skills
- End-to-end ownership (design → development → deployment)
- Product thinking (solving real user problems)
- UI/UX design (making complex data accessible)
- Domain knowledge synthesis

---

## Development

### Prerequisites
- Node.js 18+
- Python 3.11+
- PostgreSQL (or use Neon free tier)

### Setup

```bash
# Clone the repo
git clone https://github.com/bellamrivera/Soulstice.git
cd Soulstice

# MCP Servers
cd mcp-servers/astrology
npm install
python3.11 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Run the astrology MCP server
npm start
```

---

## Architecture

```
┌─────────────────────────────────────────────┐
│         Next.js Frontend (Vercel)           │
│   - UI/UX                                   │
│   - Server components                       │
│   - NextAuth.js                             │
└──────────────────┬──────────────────────────┘
                   │ HTTP/REST
                   ↓
┌─────────────────────────────────────────────┐
│      FastAPI Backend (Render/Fly.io)        │
│   - Business logic                          │
│   - User data & journal storage             │
│   - RAG/vector search (pgvector)            │
│   - LLM orchestration (Claude API)          │
│   - Calls MCP servers for special data      │
└──────────────────┬──────────────────────────┘
                   │ HTTP (calls MCPs)
                   ↓
┌─────────────────────────────────────────────┐
│     FastMCP Servers (Containerized)         │
│   - Astrology MCP (Kerykeion)               │
│   - Chinese Zodiac MCP                      │
│   - Tarot MCP                               │
└─────────────────────────────────────────────┘
```

---

## License

MIT

---

## Credits

Built by [Bella Rivera](https://github.com/bellamrivera) as a portfolio project.

**Technologies & Libraries:**
- Kerykeion by Giacomo Battaglia
- FastMCP by Anthropic
- Swiss Ephemeris
- And many more amazing open-source projects

---

**Status**: 🚧 Active Development

*This project showcases enterprise AI patterns in a consumer application, demonstrating full-stack development, MCP architecture, and modern AI/ML integration.*
