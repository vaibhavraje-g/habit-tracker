
# Ascend Backend Requirements Specification

## Overview
This document outlines the API endpoints and data structures required to fully support the Ascend Personal Growth Dashboard.

## 1. Authentication & User Profile
**GET /api/v1/me**
- **Purpose:** Retrieve current user context and summary.
- **Response:**
  ```json
  {
    "id": "u_123",
    "name": "Alex",
    "email": "alex@example.com",
    "timezone": "UTC-5"
  }
  ```

## 2. Score & Analytics
**GET /api/v1/score**
- **Purpose:** Get the main dashboard score and history for the chart.
- **Response:**
  ```json
  {
    "currentScore": 84,
    "lastUpdated": "2023-10-27T10:00:00Z",
    "history": [65, 68, 70, 72, 75, 74, 76, 78, 80, 79, 82, 85, 84]
  }
  ```

## 3. Goals Management
**GET /api/v1/goals**
- **Purpose:** List all active goals for the user.
- **Response:**
  ```json
  [
    {
      "id": "g_1",
      "title": "Coding Challenge",
      "subtitle": "2 of 3 this week",
      "type": "skill",
      "icon": "💻",
      "progress": 67,
      "status": "active",
      "colorTheme": "blue",
      "sparklineData": [40, 60, 20, 80, 90, 67]
    }
  ]
  ```

**POST /api/v1/goals/{id}/progress**
- **Purpose:** Update progress for a specific goal.
- **Body:** `{ "value": 100, "note": "Completed today" }`

## 4. Voice & AI Processing
**POST /api/v1/voice/command**
- **Purpose:** Process natural language inputs.
- **Input:** `{ "audio_base64": "..." }` OR `{ "transcript": "I finished my coding task" }`
- **Logic:**
  1. Transcribe audio (if provided) via STT (Speech-to-Text).
  2. Analyze intent via NLP.
  3. Execute action (e.g., mark goal complete).
  4. Generate conversational response.
- **Response:**
  ```json
  {
    "transcript": "I finished my coding task",
    "intent": "goal_completion",
    "actionsTaken": [
      { "type": "update_goal", "goalId": "g_1", "newProgress": 100 },
      { "type": "update_score", "delta": 2 }
    ],
    "audioResponse": "url_to_mp3", 
    "textResponse": "Great job! I've marked your coding challenge as complete."
  }
  ```

## 5. WebSocket (Optional)
- **Use Case:** Real-time score updates if processing takes time.
- **Channel:** `user:{userId}:updates`
