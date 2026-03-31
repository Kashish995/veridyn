# VERIDYN — AI Behavioral Productivity Intelligence Platform

> "An AI-powered behavioral productivity analytics platform that tracks, analyzes, and predicts user discipline patterns."

## Live Demo

- **Frontend:** [https://veridyn-five.vercel.app](https://veridyn-five.vercel.app)
- **Backend API:** Deployed on Render

---

## What Is VERIDYN?

VERIDYN is a full-stack AI productivity platform built for students and developers. It goes beyond simple task management — it **tracks behavioral patterns**, **measures discipline consistency**, and uses AI to **predict when your productivity is about to decline** before it happens.

---

## Features

### Core Analytics Engine
- **Discipline Score** — daily score based on task completion rate
- **Performance Tiers** — Elite (85%+), Gold (70–84%), Silver (50–69%), Bronze (<50%)
- **Streak System** — current streak + longest streak tracking
- **Trend Detection** — 3-day moving average (Strong Improvement → Strong Decline)
- **Volatility Detection** — standard deviation of discipline scores
- **GitHub-style Heatmap** — 365-day productivity calendar

### AI Layer (Standout Feature)
- **AI Chat Coach** — real-time GPT-4o-mini powered productivity coach with your data context
- **Discipline Risk Predictor** — predicts if productivity will decline (Low / Medium / High risk)
- **Study Pattern Analyzer** — finds your peak and worst productivity hours
- **Weekly AI Report** — comprehensive weekly performance summary
- **AI Recommendations** — 5 personalized tips based on your behavior data
- **7-Day Improvement Plan** — structured daily action plan

### Dashboard
- Weekly performance chart (Chart.js)
- Discipline history graph
- Monthly analytics (avg score, dominant tier, days tracked)
- Real-time task management

---

## Tech Stack

| Layer     | Technology                          |
|-----------|-------------------------------------|
| Frontend  | React (Vite), Chart.js, Framer Motion |
| Backend   | Node.js, Express.js                 |
| Database  | MongoDB Atlas, Mongoose             |
| Auth      | JWT                                 |
| AI        | OpenAI GPT-4o-mini                  |
| Deployment| Vercel (frontend), Render (backend) |

---

## Architecture

```
Frontend (React/Vite)
    ↓  axios + JWT
Backend (Express.js)
    ↓
Routes → Controllers → Services → MongoDB
                    ↘
              AI Service (OpenAI GPT-4o-mini)
                    ↘
              Analytics Aggregator
```

### Backend Structure
```
/routes          — API route definitions
/controllers     — Request handlers
/services        — Business logic + AI
  ai.service.js              — OpenAI integration + mock fallback
  promptBuilder.js           — AI prompt construction
  analyticsAggregator.service.js — User data aggregation for AI
  riskAnalysis.service.js    — Risk score calculation
  patternAnalysis.service.js — Study pattern detection
  performanceService.js      — Stats + streaks
/models          — Mongoose schemas
/middleware      — Auth, validation, rate limiting
/utils           — Streak calculator, tier logic
```

---

## Setup

### Backend

```bash
cd backend
npm install
```

Create `.env`:
```
MONGO_URI=mongodb+srv://...
JWT_SECRET=your_secret_here
OPENAI_API_KEY=sk-...
PORT=5000
```

```bash
npm start
```

### Frontend

```bash
cd frontend
npm install
```

Create `.env.local`:
```
VITE_API_URL=http://localhost:5000/api
```

```bash
npm run dev
```

---

## Database Models

| Model              | Key Fields                                        |
|--------------------|---------------------------------------------------|
| User               | email, password (hashed)                          |
| Task               | userId, title, status, priority, dueDate          |
| DailyStats         | userId, date, totalTasks, completed, missed       |
| DisciplineHistory  | userId, date, disciplineScore, completionRate, tier |
| StreakHistory       | userId, startDate, endDate, length                |

---

## AI Response Format

All AI endpoints return structured JSON:

```json
{
  "explanation": "Behavioral analysis in 2–3 sentences",
  "recommendations": [
    "Specific action 1",
    "Specific action 2",
    "Specific action 3"
  ],
  "improvementPlan": [
    { "day": 1, "task": "Day 1 action" },
    ...
    { "day": 7, "task": "Day 7 action" }
  ],
  "risk": {
    "riskLevel": "Low | Medium | High",
    "reason": "Why this risk level"
  }
}
```

---

## Screenshots

> Dashboard with discipline score, heatmap, weekly chart, and AI insights panel

---

## Key Design Decisions

- **Mock AI fallback** — App works fully offline / without OpenAI quota (every endpoint has a meaningful mock response)
- **`req.user.id` consistency** — Single auth convention across all controllers
- **Service-based architecture** — Clean separation: controllers call services, services call DB
- **Rate limiting** — Stricter limits on auth and AI endpoints
- **env-based API URL** — No hardcoded localhost URLs in production

---

## Author

**Kashish Behera** — B.Tech Computer Science, Kalam Institute of Technology  
[LinkedIn](https://www.linkedin.com/in/kashish-behera-25b7bb325)

---

*Built with the goal of moving beyond basic CRUD — VERIDYN demonstrates real AI integration, behavioral analytics, and production-grade architecture.*
