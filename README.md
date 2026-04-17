<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&color=0:0369a1,100:0ea5e9&height=200&section=header&text=StudyHub&fontSize=72&fontColor=ffffff&fontAlignY=38&desc=AI-Powered%20Exam%20Prep%20OS%20for%20CSE%20Students&descAlignY=58&descSize=18&animation=fadeIn" width="100%" />

<br/>

[![License](https://img.shields.io/badge/License-MIT-0ea5e9?style=for-the-badge&logo=opensourceinitiative&logoColor=white)](LICENSE)
[![Node](https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-5-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-14+-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Gemini](https://img.shields.io/badge/Google_Gemini-AI-8E75B2?style=for-the-badge&logo=google&logoColor=white)](https://aistudio.google.com/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![JWT](https://img.shields.io/badge/JWT-Auth-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white)](https://jwt.io/)

<br/>

> *"Stop juggling 20 tabs. Start studying smarter."*

**StudyHub** is a next-generation, full-stack AI exam preparation platform built for CSE students. Paste your syllabus and get a structured, trackable study sheet with direct YouTube videos, GFG articles, and LeetCode problems — instantly, powered by Google Gemini.

<br/>

[![→ Dashboard](https://img.shields.io/badge/→%20Dashboard-0369a1?style=for-the-badge)](http://localhost:5173/dashboard)
[![→ DSA Prep](https://img.shields.io/badge/→%20DSA%20Prep-0e7490?style=for-the-badge)](http://localhost:5173/dsa)
[![→ PrepSheet](https://img.shields.io/badge/→%20PrepSheet-0f766e?style=for-the-badge)](http://localhost:5173/syllabus)

</div>

---

## 📋 Table of Contents

1. [Introduction](#-introduction)
2. [Core Features](#-core-features)
3. [Tech Stack & Architecture](#-tech-stack--architecture)
4. [Folder Structure](#-folder-structure)
5. [Getting Started](#-getting-started)
6. [Environment Variables](#-environment-variables)
7. [Database Setup](#-database-setup)
8. [API Reference](#-api-reference)
9. [Badge System](#-badge-system)
10. [Troubleshooting](#-troubleshooting)

---

## 🌟 Introduction

**StudyHub** is a full-stack AI-powered exam prep platform built exclusively for Computer Science & Engineering students.

> 🔴 **Problem:** Students waste hours searching for the right tutorials, notes, and practice problems — while losing track of what they've studied.

> 💡 **Solution:** StudyHub unifies AI-generated study plans, direct YouTube videos, GFG articles, LeetCode problems, progress tracking, gamification, and a Striver-style DSA sheet — all in one dark, beautiful dashboard.

### What makes it different?

| StudyHub | Generic platforms |
|----------|------------------|
| AI parses *your* syllabus → structured sheet | Generic courses you have to follow |
| Direct YouTube video links (Striver, NeetCode, Neso) | Redirects to YouTube search |
| Separate LeetCode + GFG column per topic | No practice integration |
| Striver-style DSA Prep with 90+ curated problems | No DSA tracker |
| Gamified: badges, streaks, leaderboard | No gamification |
| One-click crash plans for exam night | No emergency prep |

---

## ✨ Core Features

<table>
<tr>
<td width="50%">

### 🤖 AI-Powered Features
- **PrepSheet** — paste any syllabus → AI generates a structured tracker with direct YouTube, GFG & LeetCode links + key exam points per topic
- **Exam Mode** — input your exam date, subjects, CGPA → AI generates a week-by-week roadmap
- **Study Mode** — AI weekly study plans + 1-night crash plans
- **AI Prep Plans** — comprehensive A2Z exam prep with revision strategy

</td>
<td width="50%">

### 📊 Tracking & Progress
- **DSA Prep** — 90+ curated problems across 12 sections (Striver-style) with NeetCode/Striver video links
- **Progress Tracking** — done / revision / pending per topic with notes & stars
- **Study Streaks** — daily streak tracker with heatmap
- **Leaderboard** — competitive rankings among peers

</td>
</tr>
<tr>
<td width="50%">

### 🎓 Study Tools
- **Subjects** — 5 CSE subjects with Units → Resources (Notes, Videos, PYQs)
- **Pomodoro Timer** — floating study timer in sidebar
- **Roadmap** — visual semester study roadmap
- **Search** — full-text resource search across all subjects
- **Bookmarks** — save resources for later

</td>
<td width="50%">

### 🏆 Gamification & UX
- **12 Badges** — First Flame, Scholar, Night Owl, Week Warrior, Elite, and more
- **Dark-first UI** — sky blue & dark design system, glassmorphism cards
- **Push Notifications** — Web Push (VAPID) for exam reminders
- **Google OAuth** — sign in with Google or email
- **Admin Panel** — manage resources, announcements, exam dates

</td>
</tr>
</table>

---

## ⚙️ Tech Stack & Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                             │
│          React 18 + Vite 5 + Tailwind CSS (Dark-first)         │
│   Pages · Components · Context (Auth, Pomodoro, Notifications) │
└──────────────────────────┬──────────────────────────────────────┘
                           │  HTTP + JWT  (Vite proxy → :5000)
┌──────────────────────────▼──────────────────────────────────────┐
│                        API LAYER (Server)                       │
│             Node.js 18+ + Express.js (ESM modules)             │
│   auth · subjects · progress · plans · syllabus · dsa · ai    │
│   badges · bookmarks · votes · search · notifications · admin  │
└────────┬───────────────────────────────────┬────────────────────┘
         │                                   │
┌────────▼────────┐               ┌──────────▼─────────┐
│  PostgreSQL 14+ │               │  Google Gemini AI  │
│                 │               │                    │
│  students       │               │  PrepSheet parse   │
│  study_logs     │               │  Exam roadmap gen  │
│  resources      │               │  Prep plan builder │
│  prep_plans     │               │  Study mode plans  │
│  syllabus_sheets│               │  Crash plan gen    │
│  dsa_progress   │               └────────────────────┘
│  badges + more  │
└─────────────────┘
```

### Technology Breakdown

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Frontend | React 18 + Vite 5 | SPA with hot reload |
| Styling | Tailwind CSS + Custom Design System | Dark-first sky blue theme |
| State | React Context API | Auth, Pomodoro, Notifications |
| Backend | Express.js (ESM) | REST API server |
| Database | PostgreSQL 14+ | Persistent data store |
| AI | Google Gemini 2.0 Flash | Study sheet parsing & plan generation |
| Auth | JWT + Google OAuth 2.0 | Stateless authentication |
| Push | Web Push (VAPID) | Browser push notifications |
| Dev | Nodemon + Concurrently | Simultaneous dev servers |

---

## 📁 Folder Structure

```
studyresources/
│
├── backend/                          # Express.js API server (ESM)
│   ├── db/
│   │   ├── schema.sql                # Core tables — run once on fresh DB
│   │   ├── migrate.sql               # V2 additions (badges, notifications)
│   │   ├── migrate2.sql              # V3 prep plans schema
│   │   ├── migrate3.sql              # Auth provider, prep tables
│   │   ├── migrate4.sql              # DSA progress table
│   │   ├── seed.js                   # Sample subjects, resources, students
│   │   ├── runMigration.js           # Migration runner scripts
│   │   └── index.js                  # PostgreSQL pool + query helpers
│   │
│   ├── middleware/
│   │   └── auth.js                   # JWT authenticate + requireAdmin
│   │
│   ├── routes/
│   │   ├── auth.js                   # Register, login, Google OAuth, profile
│   │   ├── ai.js                     # AI routes (roadmap, weekly, crash plans)
│   │   ├── plans.js                  # Prep plan CRUD + generation
│   │   ├── syllabus.js               # PrepSheet parse + tracker CRUD
│   │   ├── dsa.js                    # DSA Prep progress tracking
│   │   ├── subjects.js               # Subjects + units + resources
│   │   ├── progress.js               # Study logs + resource completion
│   │   ├── leaderboard.js            # Rankings by points/streaks
│   │   ├── search.js                 # Full-text resource search
│   │   ├── bookmarks.js              # Save/unsave resources
│   │   ├── votes.js                  # Upvote/downvote resources
│   │   ├── badges.js                 # Badge list + earned status
│   │   ├── notifications.js          # In-app + Web Push notifications
│   │   ├── announcements.js          # Admin announcement CRUD
│   │   ├── exams.js                  # Exam date management
│   │   └── admin.js                  # Admin resource management
│   │
│   ├── services/
│   │   ├── gemini.js                 # Shared Gemini client + error mapping
│   │   ├── badges.js                 # Badge auto-award logic
│   │   ├── prepPlans.js              # Plan normalization + fallback planner
│   │   └── push.js                   # Web Push + in-app notification sender
│   │
│   ├── server.js                     # Express entry point + startup checks
│   └── .env                          # 🔐 Environment variables (never commit)
│
└── frontend/                         # React + Vite SPA
    ├── public/
    │   └── sw.js                     # Service worker for Web Push
    │
    ├── src/
    │   ├── components/
    │   │   ├── Layout.jsx            # App shell (sidebar + topbar + Pomodoro)
    │   │   ├── ResourceCard.jsx      # Reusable resource (vote, bookmark, done)
    │   │   ├── PomodoroWidget.jsx    # Floating study timer
    │   │   ├── NotificationDropdown.jsx
    │   │   ├── Heatmap.jsx           # GitHub-style study activity heatmap
    │   │   ├── StatCard.jsx          # Dashboard stat chips
    │   │   ├── ExamCountdown.jsx     # Live countdown to exam date
    │   │   ├── GoogleSignInButton.jsx
    │   │   └── AnnouncementBanner.jsx
    │   │
    │   ├── context/
    │   │   ├── AuthContext.jsx       # JWT + Google OAuth session management
    │   │   ├── PomodoroContext.jsx   # Timer state across routes
    │   │   └── NotificationContext.jsx
    │   │
    │   ├── data/
    │   │   └── dsaProblems.js        # 90+ curated DSA problems (NeetCode/Striver links)
    │   │
    │   ├── lib/
    │   │   └── api.js                # Axios client + all typed API calls
    │   │
    │   └── pages/
    │       ├── LandingPage.jsx       # Public landing page
    │       ├── LoginPage.jsx
    │       ├── RegisterPage.jsx
    │       ├── DashboardPage.jsx     # Home: stats, streaks, quick resume
    │       ├── DSAPrepPage.jsx       # 🔥 Striver-style DSA tracker (90+ problems)
    │       ├── SyllabusSheetPage.jsx # 📄 AI PrepSheet builder
    │       ├── StudyModePage.jsx     # Weekly plan + crash plan generator
    │       ├── ExamModePage.jsx      # AI exam roadmap generator
    │       ├── CreatePlanPage.jsx    # A2Z prep plan creator
    │       ├── PlanDetailPage.jsx    # Saved plan detail + topic tracker
    │       ├── PlansPage.jsx         # All saved plans
    │       ├── SubjectsPage.jsx      # Subject browser
    │       ├── SubjectDetailPage.jsx # Units + resources
    │       ├── LeaderboardPage.jsx
    │       ├── SearchPage.jsx
    │       ├── BookmarksPage.jsx
    │       ├── ProfilePage.jsx
    │       ├── RoadmapPage.jsx
    │       └── AdminPage.jsx
    │
    ├── tailwind.config.js            # Dark-first theme (sky blue palette)
    ├── vite.config.js                # Proxy /api → localhost:5000
    └── index.html                    # Google Fonts: Manrope + JetBrains Mono
```

---

## 🚀 Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** `v18.0+` — [Download](https://nodejs.org/)
- **npm** `v9.0+` or **yarn** `v1.22+`
- **PostgreSQL** `14+` — [Download](https://www.postgresql.org/download/)
- **Git** — [Download](https://git-scm.com/)

You'll also need accounts/API keys for:

- 🤖 **Google Gemini** — [Get a free API key](https://aistudio.google.com/apikey) (required for AI features)
- 🔐 **Google OAuth** *(optional)* — [Create OAuth credentials](https://console.cloud.google.com/) for Google sign-in

---

### Step 1 — Clone the Repository

```bash
git clone https://github.com/your-username/studyhub.git
cd studyhub/studyresources
```

---

### Step 2 — Create PostgreSQL Database

Open **pgAdmin** or `psql` and run:

```sql
CREATE DATABASE studyhub;
```

---

### Step 3 — Install Dependencies

```bash
# Install all (backend + frontend) in one command
npm run install:all
```

Or manually:

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

---

### Step 4 — Configure Environment

Create `backend/.env` by copying the example:

```bash
cp backend/.env.example backend/.env
```

Then fill in your values (see [Environment Variables](#-environment-variables) below).

---

### Step 5 — Run Database Migrations

```bash
# Run all migrations in order
cd backend
node db/seed.js           # Core schema + sample data
npm run db:migrate        # V2: badges, notifications
npm run db:migrate2       # V3: prep plans
npm run db:migrate3       # Auth providers, prep_plan_topic_status
cd ..
node backend/db/runMigration4.js   # DSA progress table
```

Or using the root shortcuts:

```bash
npm run db:migrate
npm run db:migrate2
npm run db:migrate3
npm run db:migrate4
```

---

### Step 6 — Start the Application

```bash
# Start both backend + frontend together (recommended)
npm run dev
```

Or separately:

```bash
# Terminal 1 — Backend (runs on :5000)
cd backend && npm run dev

# Terminal 2 — Frontend (runs on :5173)
cd frontend && npm run dev
```

Open **[http://localhost:5173](http://localhost:5173)** 🎉

---

## 🔑 Demo Credentials

| Role | Login | Password |
|------|-------|----------|
| 👨‍🎓 Student | `CS2021001` | `pass123` |
| 👩‍🎓 Student | `CS2021002` | `pass123` |
| 🛡️ Admin | `ADMIN001` | `admin123` |

> You can also register a new account at `/register`

---

## 🔐 Environment Variables

Create `backend/.env` with the following keys:

```env
# ── Server ────────────────────────────────────────────────────────
PORT=5000
NODE_ENV=development

# ── Authentication ─────────────────────────────────────────────────
JWT_SECRET=your_super_long_random_secret_at_least_32_chars

# ── Database ───────────────────────────────────────────────────────
DB_HOST=localhost
DB_PORT=5432
DB_NAME=studyhub
DB_USER=postgres
DB_PASSWORD=your_postgres_password

# (Optional) Use connection string instead of individual fields
# DATABASE_URL=postgresql://postgres:password@localhost:5432/studyhub

# ── AI (Required for AI features) ──────────────────────────────────
GEMINI_API_KEY=your_gemini_api_key_here
# Get a free key → https://aistudio.google.com/apikey

# ── Google OAuth (Optional) ────────────────────────────────────────
GOOGLE_CLIENT_ID=your_google_oauth_client_id.apps.googleusercontent.com

# ── Web Push / VAPID (Optional) ────────────────────────────────────
VAPID_PUBLIC_KEY=BMI_4_JzB8Us2_V-oHST0qvQU-wtkfnTRbPdszgfxG_wVN8L4DzW9...
VAPID_PRIVATE_KEY=I2rv9iAr4s5hHlYiSfLSjkgKMInjNq1_PD6h_bexn3k
VAPID_EMAIL=your-email@gmail.com

# ── CORS (Optional, for production) ────────────────────────────────
CORS_ORIGIN=https://your-frontend-domain.vercel.app
```

And for the frontend, create `frontend/.env`:

```env
VITE_GOOGLE_CLIENT_ID=your_google_oauth_client_id.apps.googleusercontent.com
VITE_API_URL=http://localhost:5000
```

---

## 🗄️ Database Setup

The project uses **4 migration files** applied in order:

| File | What it creates |
|------|----------------|
| `db/schema.sql` + `seed.js` | Core tables: students, subjects, units, resources, study_logs, completed_resources, leaderboard |
| `db/migrate.sql` | Badges table, notifications, announcements, study_sessions |
| `db/migrate2.sql` | Prep plans: prep_plans, prep_plan_topics |
| `db/migrate3.sql` | Auth providers (Google OAuth), prep_plan_topic_status |
| `db/migrate4.sql` | DSA progress tracker: dsa_progress |

---

## 📡 API Reference

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/auth/register` | Register with email + password |
| `POST` | `/api/auth/login` | Login (returns JWT) |
| `POST` | `/api/auth/google` | Google OAuth sign-in |
| `GET` | `/api/auth/profile` | Get current user profile |
| `PATCH` | `/api/auth/profile` | Update profile (name, bio, links) |
| `PATCH` | `/api/auth/change-password` | Change password |

### AI & Study Plans
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/plans/generate` | 🤖 Generate AI prep plan from syllabus |
| `GET` | `/api/plans` | List all saved prep plans |
| `GET` | `/api/plans/:id` | Get plan detail + topic progress |
| `PATCH` | `/api/plans/:id/topic/:id` | Update topic status/note/starred |
| `DELETE` | `/api/plans/:id` | Delete a prep plan |
| `POST` | `/api/ai/roadmap` | 🤖 Generate exam roadmap (Exam Mode) |
| `POST` | `/api/ai/weekly-plan` | 🤖 Generate weekly study plan |
| `POST` | `/api/ai/crash-plan` | 🤖 Generate 1-night crash plan |

### PrepSheet (Syllabus Tracker)
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/syllabus/parse` | 🤖 AI-parse raw syllabus into structured sheet |
| `POST` | `/api/syllabus` | Save parsed sheet |
| `GET` | `/api/syllabus` | List all sheets |
| `GET` | `/api/syllabus/:id` | Get sheet + topic statuses |
| `PATCH` | `/api/syllabus/:id/topic/:id` | Update topic status/note/starred |
| `DELETE` | `/api/syllabus/:id` | Delete sheet |

### DSA Prep
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/dsa/progress` | Get student's DSA progress map |
| `PATCH` | `/api/dsa/progress/:problemId` | Update problem status/starred |

### Subjects & Resources
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/subjects` | List all CSE subjects |
| `GET` | `/api/subjects/:id` | Subject detail with units + resources |
| `GET` | `/api/progress/stats` | Study stats (streak, hours, points) |
| `POST` | `/api/progress/log` | Log a study session |
| `POST` | `/api/progress/complete/:resourceId` | Mark resource complete |

### Social & Discovery
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/leaderboard` | Ranked student leaderboard |
| `GET` | `/api/search?q=query` | Full-text search across resources |
| `GET` | `/api/bookmarks` | List saved bookmarks |
| `POST` | `/api/bookmarks/:resourceId` | Toggle bookmark |
| `POST` | `/api/votes/:resourceId` | Upvote/downvote resource |
| `GET` | `/api/badges` | All badges + earned status |

---

## 🏅 Badge System

Badges are automatically awarded when conditions are met:

| Badge | Name | Condition |
|-------|------|-----------|
| 🔥 | **First Flame** | Complete your first resource |
| 📚 | **Bookworm** | Complete 10 resources |
| 🎓 | **Scholar** | Complete 25 resources |
| ⚡ | **Speed Runner** | 5 resources in a single day |
| 🎯 | **Week Warrior** | Maintain a 7-day study streak |
| 👑 | **Dedicated** | Maintain a 30-day streak |
| 🏆 | **Elite** | Reach top 3 on the leaderboard |
| 🦉 | **Night Owl** | Study after 10 PM |
| 🤖 | **AI Explorer** | Generate your first AI roadmap |
| 📅 | **The Planner** | Create your first prep plan |
| 💯 | **Centurion** | Log 100+ total study hours |
| 🌙 | **1 Night Hero** | Generate a crash plan |

---

## 🔧 Troubleshooting

### ❌ Backend won't start

```
Error: listen EADDRINUSE: address already in use :::5000
```
> Another process is using port 5000. Kill it:
> ```bash
> # Windows
> Get-Process -Name "node" | Stop-Process -Force
> # Mac/Linux
> kill -9 $(lsof -ti:5000)
> ```

---

### ❌ AI features not working

- Ensure `GEMINI_API_KEY` is set in `backend/.env`
- Get a free key at [aistudio.google.com/apikey](https://aistudio.google.com/apikey)
- The backend logs `✅ Gemini AI key detected` on startup if configured correctly

---

### ❌ Database connection failed

```
SASL: SCRAM-SERVER-FIRST-MESSAGE: client password must be a string
```
> Run migrations from inside the `backend/` directory so `.env` loads correctly:
> ```bash
> cd backend
> node db/runMigration4.js  # ✅ correct
> ```
> Not from root:
> ```bash
> node backend/db/runMigration4.js  # ❌ .env not found
> ```

---

### ❌ Frontend shows network errors

- Ensure backend is running on port **5000**
- Vite dev server auto-proxies `/api` → `localhost:5000` (configured in `vite.config.js`)
- Check browser console — if you see `"Cannot connect to server"` → start the backend first

---

### ❌ "Email already registered" on register

- Sign in with that email at `/login` instead
- Or use demo credentials: `CS2021001` / `pass123`

---

## 🤝 Contributing

Contributions, issues and feature requests are welcome!

1. Fork the repo
2. Create your feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'feat: add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

<div align="center">

Built with ❤️ for CSE students · Powered by **Google Gemini** · Inspired by **Striver's A2Z Sheet**

<img src="https://capsule-render.vercel.app/api?type=waving&color=0:0ea5e9,100:0369a1&height=100&section=footer" width="100%" />

</div>
