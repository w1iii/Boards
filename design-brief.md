# Boards — NLE Nursing Board Exam Review Platform

## Brand Overview

| Field | Value |
|-------|-------|
| **Name** | Boards |
| **Tagline** | Pass the NLE. Your first take. |
| **Target Users** | Nursing students & review centers (B2C + B2B) |
| **Tone** | Professional, confident, warm |
| **Typography** | Clean sans-serif (Geist), heavy weight for headings |
| **Country** | Philippines (PHP currency, PayMongo payments via GCash/Maya/card) |

---

## Pages / Screens

### 1. Landing Page (Public)
- Hero: "Pass the NLE. Your first take."
- Subtitle: "AI-powered practice exams designed for Philippine nursing boards"
- CTA buttons: "Start Free Practice" → Sign Up | "View Pricing" → Pricing
- Stats section: e.g., "5,000+ questions generated", "95% passing rate among active users"
- How it works: 3-step visual (Choose Content Area → Answer Questions → Track Progress)
- Features preview: AI-generated questions, mock exams, progress analytics
- Pricing teaser: Monthly ₱349 / Final Push ₱799
- Footer: About, Contact, Terms, Privacy

### 2. Sign In / Sign Up Pages (Clerk)
- Minimal layout, centered card
- Sign In: Email/password, Google OAuth
- Sign Up: Email/password, name, Google OAuth
- Brand mark at top left
- Clean, focused design — no distractions

### 3. Dashboard (Authenticated)
- **Header**: Logo + nav links + user avatar dropdown
- **Welcome card**: "Good morning, [Name]" + streak or daily goal
- **Overall stats row**: Total questions answered, overall score %, weak areas count
- **Progress by content area**: Horizontal bar chart or grid of cards showing score per area (Medical-Surgical, Mother-Child, Psychiatric, Community Health, Leadership & Management)
- **Weak areas alert**: Red/orange callout card for areas scoring <50%
- **Quick actions**: "Start Practice" button, "Take Mock Exam" button
- **Recent sessions**: List of last 5 sessions with score, date, type

### 4. Practice Mode (Select & Start)
- **Step 1 — Choose Content Area(s)**: Grid of 5 cards with icons
  - Medical-Surgical
  - Mother & Child
  - Psychiatric
  - Community Health
  - Leadership & Management
- **Step 2 — Settings**: Practice or Mock Exam toggle, difficulty (Easy/Medium/Hard), question count slider (5-50)
- **Step 3 — Start**: Large "Begin" button
- Visual: Clean card-based layout, progress indicator at top

### 5. Question Screen (The Core Experience)
- **Progress bar**: "Question 5 of 20" with remaining time (for mock exam mode)
- **Question text**: Large, readable, situational NLE-style question
- **Choices**: 4 option cards (A, B, C, D) — tap/click to select, highlighted state
- **Submit button**: Appears after selection
- **After answering**:
  - Correct: Green highlight + rationale (why this is right)
  - Wrong: Red highlight on wrong answer + green on correct + rationale for both
  - "Wrong choice rationale" shown below for the selected wrong answer
- **Navigation**: Previous / Next buttons, question grid overview (numbered dots)
- **End screen**: "Practice Complete!" confetti-ish, stats summary

### 6. Mock Exam Mode
- Same as question screen but:
  - **Timer**: Countdown visible at top (e.g., 2 hours)
  - **No instant feedback**: Answers recorded, results at the end
  - **Full screen**: Focus mode, minimal chrome
- **Results screen**: Score %, pass/fail indicator (75% passing), time taken
- Breakdown by content area, list of wrong answers with rationales
- "Review Answers" toggle to see each question with correct answer

### 7. Progress & Analytics
- **Overall mastery %**: Large circular gauge or score card
- **Area breakdown**: 5 cards or bar chart showing score per content area
- **History**: Scrollable list of past sessions (date, type, score, content areas)
- **Weak areas section**: Highlighted areas needing work (<50%)
- **Trend**: Simple chart showing score over time (optional)

### 8. Question Bank (Browse / Admin)
- **Filters bar**: Content area dropdown, difficulty filter, reviewed/unreviewed toggle
- **Question list**: Paginated table/cards with question text preview, area, difficulty, reviewed badge
- **Click to expand**: Full question, choices, correct answer, rationales
- **Review action**: Approve / Flag buttons for unreviewed questions

### 9. Pricing / Subscription Page
- **Two plan cards** side by side:
  - **Monthly** — ₱349/month — Full access, all content areas, practice & mock exams
  - **Final Push** — ₱799 — 30-day intensive, everything + priority AI generation, analytics
- Feature comparison list
- "Subscribe" button → PayMongo checkout (GCash, Maya, card, Billease)
- **Current plan status**: If subscribed, show active plan + expiry date + cancel option

### 10. Payment Flow
- Redirect to PayMongo checkout page (external)
- **Success page**: Confirmation, "Back to Dashboard" button
- **Cancel page**: "Payment didn't go through? Try again" + support contact

### 11. Profile / Settings
- Account info (name, email from Clerk)
- Subscription management
- Notification preferences (future)

---

## Layout & Navigation Structure

```
[Public]
  Landing Page
  Sign In / Sign Up

[Authenticated — Sidebar or Top Nav]
  Dashboard (home)
  Practice (→ select area → questions)
  Mock Exam (→ select → exam mode)
  Progress (analytics)
  Question Bank (review/browse)
  Pricing / Subscription
  Profile / Settings
```

**Recommended nav**: Top bar with logo left, nav links center, user avatar right.
**Mobile**: Hamburger menu, full-screen overlay.

---

## Design Notes

- Use the reference image you'll upload for colors, style, and overall aesthetic
- Stitch will extract the design system from the image automatically

---

## What to Generate in Stitch

Start with these screens in order of priority:

1. **Landing Page** — Marketing hero, features, pricing teaser
2. **Dashboard** — Stats, area progress, quick actions
3. **Practice Setup** — Content area selection + settings
4. **Question Screen** — Active answering view (correct/incorrect states)
5. **Mock Exam Results** — Score summary, area breakdown
6. **Pricing Page** — Two plans side by side
7. **Progress Analytics** — Area scores, weak spots, history

Use multi-screen generation: describe the flow so Stitch connects them with navigation.
