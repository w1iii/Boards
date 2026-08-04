# Boards

**Pass the NLE. Your first take.**

AI-powered practice exam platform for the Philippine Nursing Licensure Exam (NLE). Generates NLE-style situational questions with full rationales, tracks weak areas, and provides timed mock exam mode — built for nursing students and review centers.

## Features

- **AI question generation** — NLE-style situational questions with rationale for every choice, not just "correct answer: C"
- **Practice mode** — choose content areas, difficulty, and question count (5–50)
- **Mock exam mode** — timed, full-screen, results at the end with pass/fail at the 75% mark
- **Progress analytics** — overall mastery score, per-area breakdown, weak-area alerts (<50%)
- **Adaptive weak-area tracking** — prioritizes your weakest content area after ~20 answered questions
- **Study guides & curriculum** — downloadable guides, notes, and review materials (`/study`, `/study-review`, admin-gated review queue)
- **Clerk authentication** — email/password, Google OAuth, org-ready
- **Admin review queue** — controlled via `ADMIN_EMAILS` env var
- **Clerk authentication** — email/password, Google OAuth, org-ready
- **Subscription payments** — PayMongo checkout (GCash, Maya, cards, Billease)

Content areas follow the PRC's official NLE table of specifications: Medical-Surgical, Mother & Child, Psychiatric, Community Health, Leadership & Management.

## Tech Stack

| Layer     | Tech                                              |
| --------- | ------------------------------------------------- |
| Frontend  | Next.js 16 (App Router), React 19, Tailwind CSS 4 |
| Backend   | Next.js API routes, Server Components             |
| Database  | PostgreSQL (Neon) + `@neondatabase/serverless`    |
| Auth      | Clerk                                             |
| AI        | Groq (`groq-sdk`)                                 |
| Payments  | PayMongo                                          |
| Validation| Zod                                               |

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

Migrations live in `migrations/` and create the `questions`, `sessions`, and `subscriptions` tables.

## Usage

Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Typical flow:

1. Sign up / sign in at `/sign-in` or `/sign-up`
2. Complete onboarding at `/onboarding`
3. Practice: `/practice` → select content area(s) → set difficulty/count → answer
4. View progress: `/dashboard` and `/progress`
5. Browse the question bank: `/question-bank`

## Scripts

| Command              | Description                            |
| -------------------- | -------------------------------------- |
| `npm run dev`        | Start development server               |
| `npm run build`      | Production build                       |
| `npm run start`      | Start production server                |
| `npm run lint`       | Run ESLint                             |
| `npm run db:migrate` | Apply all SQL migrations to the database |

## Project Structure

```
app/
  api/            # API routes (questions, sessions, users, payments, webhooks)
  components/     # Shared UI components
  dashboard/      # Dashboard page
  practice/       # Practice setup, session, results, review
  progress/       # Progress & analytics
  onboarding/     # Onboarding flow
  question-bank/  # Question browser/review (filters, approve/flag)
  settings/       # Profile & settings
migrations/       # SQL schema migrations
```

## Status

Core loop (landing → auth → onboarding → dashboard → practice → results) works end-to-end. Pricing and payment flow are partially scaffolded. See `UPDATED_TODO.md` for the remaining feature list.

## License

Proprietary. All rights reserved. Contact the maintainer for commercial or review-center licensing.

## Contact

- Repository: [github.com/w1iii/Boards](https://github.com/w1iii/Boards)
