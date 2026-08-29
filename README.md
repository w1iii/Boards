# Boards

**Pass the NLE. Your first take.**

AI-powered practice exam platform for the Philippine Nursing Licensure Exam (NLE). Generates NLE-style situational questions with full rationales, tracks weak areas, provides timed mock exam mode, and includes an interactive AI study tutor — built for nursing students and review centers.

## Features

- **AI question generation** — NLE-style situational questions with rationale for every choice via Groq (`llama-3.3-70b-versatile`)
- **Practice mode** — choose content areas, difficulty, and question count (10–100)
- **Mock exam mode** — timed (72s/question), full-screen, results with pass/fail at 75% threshold
- **Interactive study tutor** — 4 modes (Concept Drill, Case Walkthrough, Rapid Recall, Teach-It-Back) with multi-turn AI conversation
- **Progress analytics** — mastery gauge, per-area breakdown, weak-area alerts, session history
- **Adaptive weak-area tracking** — prioritizes weakest content area after ~20 answered questions
- **Study guides & curriculum** — 400+ curated concepts across 5 NLE content areas
- **Pomodoro timer** — configurable focus/break with audio chimes and motivational quotes
- **Clerk authentication** — email/password, Google OAuth, SSO, admin gating via `ADMIN_EMAILS`
- **Subscription payments** — PayMongo checkout (GCash, Maya, cards, Billease)
- **PWA support** — offline fallback, installable, service worker

Content areas follow the PRC's official NLE table of specifications: Community Health, Maternal & Child, Adult Health (Parts 1 & 2), and Psychiatric Nursing.

## Tech Stack

| Layer      | Tech                                                    |
| ---------- | ------------------------------------------------------- |
| Frontend   | Next.js 16 (App Router), React 19, Tailwind CSS 4      |
| Animations | Framer Motion 13                                        |
| Backend    | Next.js API routes, Server Components                   |
| Database   | PostgreSQL (Neon) + `@neondatabase/serverless`          |
| Auth       | Clerk 7 (`@clerk/nextjs`)                               |
| AI         | Groq (`groq-sdk` 1.3) — `llama-3.3-70b-versatile`      |
| Payments   | PayMongo                                                |
| Validation | Zod 4                                                   |
| Webhooks   | Svix (Clerk signature verification)                     |

## Prerequisites

- Node.js 20+
- npm
- PostgreSQL database (Neon recommended)
- Clerk account (Publishable + Secret keys)
- Groq API key
- (Optional) PayMongo secret key for payment flows

## Installation

```bash
git clone https://github.com/w1iii/Boards.git
cd Boards
npm install
```

Copy the environment template and fill in your keys:

```bash
cp .env.local.example .env.local
```

Required environment variables:

| Variable                            | Description                              |
| ----------------------------------- | ---------------------------------------- |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk publishable key                    |
| `CLERK_SECRET_KEY`                  | Clerk secret key                         |
| `CLERK_WEBHOOK_SECRET`              | Clerk webhook signing secret             |
| `DATABASE_URL`                      | PostgreSQL connection string             |
| `GROQ_API_KEY`                      | Groq API key for question generation     |
| `NEXT_PUBLIC_CLERK_SIGN_IN_URL`     | e.g. `/sign-in`                          |
| `NEXT_PUBLIC_CLERK_SIGN_UP_URL`     | e.g. `/sign-up`                          |
| `PAYMONGO_SECRET_KEY`               | (Optional) PayMongo secret key           |

## Database Setup

Run migrations (requires `DATABASE_URL` in `.env.local`):

```bash
npm run db:migrate
```

Migrations live in `migrations/` and create all tables: `questions`, `sessions`, `subscriptions`, `user_profiles`, `study_sessions`, `study_questions`, and `mastery_events`.

## Usage

Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Typical flow:

1. Sign up / sign in at `/sign-in` or `/sign-up`
2. Complete onboarding at `/onboarding` (exam date, goal, content areas)
3. Dashboard at `/dashboard` — stats overview
4. Practice: `/practice` → select content area(s) → set difficulty/count → answer questions with instant rationale
5. Mock exam: `/mock-exam` → timed exam with pass/fail results
6. Study: `/study` → pick a mode and area → interactive AI tutoring session
7. View progress: `/progress` — mastery scores, weak areas, session history
8. Settings: `/dashboard/settings` — profile, preferences, account deletion

## API Endpoints

| Method | Endpoint                        | Description                        |
| ------ | ------------------------------- | ---------------------------------- |
| GET    | `/api/health`                   | Health check                       |
| GET    | `/api/onboarding`               | Get user profile                   |
| POST   | `/api/onboarding`               | Save onboarding data               |
| GET    | `/api/settings`                 | Get profile + email                |
| PATCH  | `/api/settings`                 | Update profile                     |
| DELETE | `/api/settings`                 | Delete user + data                 |
| GET    | `/api/questions`                | List questions (filtered)          |
| POST   | `/api/questions`                | Create question                    |
| POST   | `/api/questions/generate`       | AI-generate questions              |
| POST   | `/api/questions/review`         | Approve/flag question              |
| POST   | `/api/sessions`                 | Create practice/mock session       |
| POST   | `/api/sessions/[id]/answer`     | Submit answer                      |
| GET    | `/api/sessions/[id]/results`    | Get session results                |
| GET    | `/api/users/progress`           | Get progress analytics             |
| POST   | `/api/payments/checkout`        | Create PayMongo checkout           |
| POST   | `/api/webhooks/clerk`           | Clerk webhook handler              |
| POST   | `/api/webhooks/paymongo`        | PayMongo webhook handler           |
| GET    | `/api/study/sessions`           | List study sessions                |
| POST   | `/api/study/sessions`           | Create study session               |
| POST   | `/api/study/sessions/[id]/message` | Send message in study session   |
| POST   | `/api/study/sessions/[id]/finalize` | Finalize study session         |

## Scripts

| Command              | Description                              |
| -------------------- | ---------------------------------------- |
| `npm run dev`        | Start development server                 |
| `npm run build`      | Production build                         |
| `npm run start`      | Start production server                  |
| `npm run lint`       | Run ESLint                               |
| `npm run db:migrate` | Apply all SQL migrations to the database |

## Project Structure

```
app/
  api/                          # API routes (questions, sessions, users, payments, study, webhooks)
  components/                   # Shared UI components (nav, modals, shells)
  contexts/                     # React contexts (Pomodoro timer)
  lib/                          # Core logic (DB, types, validation, AI generation, study engine)
  data/                         # Static data (break quotes)
  onboarding/                   # 4-step onboarding wizard
  dashboard/                    # Dashboard + settings page
  practice/                     # Practice setup, session, results, review
  mock-exam/                    # Mock exam setup
  study/                        # Study mode picker + interactive AI session
  progress/                     # Progress analytics
  sign-in/                      # Clerk sign-in
  sign-up/                      # Clerk sign-up
  sso-callback/                 # SSO callback
  offline/                      # Offline fallback page
migrations/                     # 10 SQL schema migrations
```

## Status

Core loop works end-to-end: landing → auth → onboarding → dashboard → practice/mock-exam → results → review. Interactive study tutor, progress analytics, PWA, Pomodoro timer, and payment integration are functional.

## License

Proprietary. All rights reserved. Contact the maintainer for commercial or review-center licensing.

## Contact

- Repository: [github.com/w1iii/Boards](https://github.com/w1iii/Boards)
