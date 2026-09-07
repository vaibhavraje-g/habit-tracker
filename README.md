# 🎯 Ascend - GenAI-Powered Behavioral Habit Platform

A modern, full-stack habit tracking and behavioral intelligence platform built with **Angular 17**, **Node.js/Express**, **MongoDB**, and **Google Gemini AI**.

![Angular](https://img.shields.io/badge/Angular-17-dd0031?logo=angular&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-18+-339933?logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express-4.x-000000?logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?logo=mongodb&logoColor=white)
![Gemini AI](https://img.shields.io/badge/Gemini-AI%20Coach-4285F4?logo=google&logoColor=white)

---

## 🏛️ Architectural Overview

```
┌────────────────────────────────────────────────────────┐
│                   ANGULAR 17 CLIENT                    │
│   Streak Tracking · Habit Completion Matrix · UI Coach │
└───────────────────────────┬────────────────────────────┘
                            │ REST API / JWT
                            ▼
┌────────────────────────────────────────────────────────┐
│                 NODE.JS / EXPRESS BACKEND              │
│       Controllers · Middleware · Auth & Habit Logic    │
└─────────────┬────────────────────────────┬─────────────┘
              │                            │
              ▼                            ▼
┌───────────────────────────┐ ┌──────────────────────────┐
│      MONGODB DATABASE     │ │      GEMINI AI COACH     │
│   Users · Habits · Logs   │ │ Habit Feedback & Insights│
└───────────────────────────┘ └──────────────────────────┘
```

---

## 🌟 Key Features

- **🔥 Visual Streak Matrix**: Interactive daily and weekly habit checklists with automated streak counter and completion percentages.
- **🤖 Intelligent AI Habit Coach**: Analyzes historical completion patterns to offer constructive tips, burnout warnings, and behavioral suggestions.
- **📊 Longitudinal Habit Analytics**: Monthly progress breakdowns and consistency score trends.
- **🛡️ Secure JWT Authentication**: End-to-end user authentication with bcrypt password hashing and token validation.

---

## 🛠️ Project Structure

```
habit-tracker/
├── backend/
│   ├── controllers/          # Habit and Auth route handlers
│   ├── middleware/           # JWT auth and input validation
│   ├── models/               # Mongoose schemas (User, Habit, Log)
│   ├── routes/               # Express API endpoints
│   ├── services/             # Gemini AI integration service
│   ├── server.js             # Application entrypoint
│   └── package.json          # Backend dependencies
├── src/                      # Angular frontend client
│   ├── app/
│   │   ├── components/       # Dashboard, habit cards, AI coach modal
│   │   └── services/         # State management and API services
│   └── package.json          # Frontend dependencies
└── AGENTS.md                 # Autonomous engineering directives
```

---

## ⚙️ Getting Started

### 1. Backend
```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

### 2. Frontend
```bash
npm install
npm run start
```
Access the application at `http://localhost:4200`.
