# MusePath 🎵 — MERN AI Music Learning Planner

MusePath is now a **MERN stack** app:

- **M**ongoDB (database)
- **E**xpress.js + Node.js (backend API)
- **R**eact + Vite (frontend)
- **N**ode ecosystem tooling

It generates music learning plans, tracks practice progress, and powers discover/videos/profile flows with JWT auth.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React + Vite + Zustand |
| Backend | Node.js + Express |
| Database | MongoDB + Mongoose |
| Auth | JWT (email/password) |
| Optional APIs | Gemini, Spotify, YouTube |

---

## Quick Start

1. Create env files:

- Copy `backend/.env.example` → `backend/.env`
- Copy `frontend/.env.example` → `frontend/.env`

2. Configure backend env:

- `MONGODB_URI`
- `JWT_SECRET`
- `FRONTEND_URL`

3. Start backend:

- In `backend/`, run `npm install`
- Then run `npm run dev`
- API default: `http://localhost:3001`

4. Start frontend:

- In `frontend/`, run `npm install`
- Then run `npm run dev`
- App default: `http://localhost:5173`

---

## Backend API (Express)

### Auth

- `POST /auth/signup`
- `POST /auth/login`
- `GET /auth/me`

### App

- `POST /generate-plan`
- `GET /dashboard`
- `GET /discover`
- `GET /videos`
- `POST /progress`
- `GET /progress`
- `POST /save-song`
- `DELETE /save-song`
- `GET /profile`
- `PATCH /profile`
- `GET /plans`
- `POST /plans/active`

