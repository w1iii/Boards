# BOARDS — Feature TODO

> Core loop (landing → auth → onboarding → dashboard → practice → results) works end-to-end.
> This tracks remaining features only. Pricing/payment deferred.

---

## Week 1 — Core Feature Gaps

### [ ] Progress & Analytics Page
- **Files:** `app/progress/page.tsx` (new)
- **API:** `GET /api/users/progress` — exists, returns `{overallScore, areaScores, weakAreas, totalQuestionsAnswered}`
- **What:** Large score gauge, 5 area cards with scores+bars, recent sessions list, weak areas alert
- **Pattern:** Same server component pattern as `dashboard/page.tsx`

### [ ] Mock Exam Mode
- **Files:** `app/practice/practice-setup.tsx` (modify), `app/practice/session/[id]/practice-session.tsx` (variant), `app/practice/session/[id]/results/results-view.tsx` (variant)
- **DB:** `sessions.type` supports `'practice' | 'mock-exam'` already
- **What:** Add Practice/Mock toggle in setup. Mock flow: no instant feedback, overall 2hr timer, full-screen. Results show pass/fail at 75%.

### [ ] Review Answers (from results page)
- **Files:** `app/practice/session/[id]/review/page.tsx` (new)
- **Link:** Results page has `<Link href={\`/practice/session/${sessionId}?review=1\`}>` — not wired
- **What:** Read-only session replay. Each question with selected answer, correct answer, rationale. No timer, no submission.

---

## Week 2 — UX Polish & Admin

### [ ] Clickable Question Grid Dots
- **Files:** `app/practice/session/[id]/practice-session.tsx`
- **What:** Dots are visual only — make them clickable to jump to any question

### [ ] Mobile Hamburger Menu
- **Files:** `app/components/nav-header.tsx`
- **What:** Hamburger icon on mobile, slide-out overlay with nav links

### [ ] Question Bank Page
- **Files:** `app/question-bank/page.tsx` (new)
- **API:** `GET /api/questions?contentArea=&difficulty=&reviewed=&limit=&offset=` — exists
- **What:** Filters (area, difficulty, reviewed), paginated list, expand detail, approve/flag actions

### [ ] Settings Page
- **Files:** `app/settings/page.tsx` (new)
- **What:** Profile name, content areas, exam date, subscription status placeholder

### [ ] Weak-Area Adaptive Tracking
- **Files:** `app/api/sessions/route.ts` or `app/api/questions/generate/route.ts` (modify)
- **What:** After ~20 answered questions, prioritize weakest area when generating new session questions

---

## Stretch

- [ ] Pre-generate question bank (seed via scraper or AI batch)
- [ ] Loading/empty/error states audit
- [ ] Footer placeholder pages (Privacy, Terms)
