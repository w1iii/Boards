# NLE Review App — Project Plan

**AI-powered practice question generator & study tool for Nursing Licensure Exam (NLE) takers**

---

## 1. Why This Idea

The Philippines has a large annual pool of NLE examinees, a high retake rate, and an established market that already pays ₱8,000–₱20,000+ for review center programs. This app doesn't need to create demand — it captures existing willingness to pay with a cheaper, more convenient, always-available alternative or supplement.

**Personal advantage:** Existing AI-learning-tool codebase (Feynman) to adapt, plus a few personal connections to nursing grads/reviewers who can validate content accuracy and be first users.

---

## 2. MVP Scope

### Core loop

1. Question bank organized around the PRC's official NLE table of specifications (content areas + weighting)
2. AI-generated NLE-style situational/scenario questions (not simple recall) with full rationales — why each wrong choice is wrong, not just "correct answer: C"
3. Adaptive weak-area tracking after ~20 questions answered
4. Timed mock exam mode simulating real test conditions

### Explicitly OUT of v1

- No video lectures/content
- Launch with 2–3 highest-weight content areas only (e.g., Medical-Surgical Nursing, Care of Mother and Child), expand based on real usage
- No native mobile app — mobile-responsive web is sufficient to validate

---

## 3. Content Strategy (the hard part)

Generic AI-generated questions without grounding can be factually wrong or mismatched in style/difficulty — nursing students will catch this immediately and lose trust.

- Source content structure and weighting from PRC's official NLE table of specifications (public)
- Human-in-the-loop review: AI generates in batches → a nursing grad/contact reviews and flags before publishing — non-negotiable given the stakes of medical content
- Pre-generate and cache question batches rather than generating live per request (cheaper, faster, reviewable)

---

## 4. Tech Stack

- **Frontend/backend:** Next.js (reuse patterns from Feynman/ReviewSense) or Laravel/Vue
- **AI:** Claude API for question generation + rationales, batch-generated and cached
- **Database:** Postgres — question bank + user progress/analytics
- **Auth:** Clerk (or equivalent)
- **Payments:** PayMongo — Philippine-founded (YC-backed), single integration covering GCash, Maya, cards, and bank transfer
  - Card fee: ~3.5% + ₱15/transaction
  - E-wallet fee: ~3%
  - Straight Stripe is a poor fit: Stripe PH is invite-only and settles PHP; direct GCash/Maya integration is fiddly without an aggregator
  - GCash must be prominent at checkout — most PH buyers pay via GCash first, cards second, bank transfer third

---

## 5. Pricing Model

| Tier               | Price              | Notes                                                                                                     |
| ------------------ | ------------------ | --------------------------------------------------------------------------------------------------------- |
| Free               | ₱0                 | Limited questions/day — builds trust in accuracy before asking for payment                                |
| Monthly            | ₱199–349/mo        | Unlimited questions, mock exams, weak-area analytics                                                      |
| Final Push Package | ₱499–799 / 30 days | Timed around actual NLE exam dates (fixed schedule, twice a year) — unlimited access during crunch period |

Price anchor: well under a single review center session, positioned as a no-brainer supplement rather than a replacement.

---

## 6. Go-to-Market

- Nursing contacts serve dual role: content validators AND first users
- NLE has fixed exam windows (twice yearly) — concentrate marketing pushes 8–10 weeks before each date
- Channels: nursing school Facebook groups, review center alumni pages, TikTok (strong for PH nursing student study content)
- Partnership angle (later): smaller/regional review centers may license the tool as a supplement rather than see it as competition — worth cold outreach once a working demo exists

---

## 7. Validation Before Building

Before writing production code:

1. Generate a sample batch of 10–15 AI-generated NLE-style questions with rationales
2. Send to nursing contacts and ask:
   - Does this match real NLE question style/difficulty?
   - Would they have paid for this while reviewing for boards?
3. This is ~1 day of work and de-risks the entire build

---

## 8. Suggested Build Timeline (20+ hrs/week)

| Week | Focus                                                                               |
| ---- | ----------------------------------------------------------------------------------- |
| 1    | Content validation with nursing contacts + PRC table of specifications research     |
| 2–3  | MVP build: auth, question generation pipeline, 2 content areas, basic practice mode |
| 4    | Mock exam mode + weak-area tracking                                                 |
| 5    | PayMongo integration + landing page + soft launch to contacts' networks             |
| 6+   | Iterate based on real usage data, expand content areas                              |

---

## 9. Open Questions to Revisit

- Which 2–3 content areas to launch with (needs PRC table of specifications weighting check)
- Whether to pursue review center partnerships early or post-traction
- How much human review capacity is available before content backlog becomes a bottleneck
