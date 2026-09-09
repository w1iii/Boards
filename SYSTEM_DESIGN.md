# Boards — System Design

> AI-powered NLE review platform. Full architecture as of current codebase.

---

## High-Level Architecture

```mermaid
graph TB
    subgraph "Client (Browser)"
        UI["Next.js 16 App Router<br/>React 19 + Tailwind CSS 4"]
        PWA["PWA / Service Worker"]
    end

    subgraph "Vercel / Node.js Runtime"
        subgraph "Next.js Server"
            RSC["Server Components"]
            MW["Middleware<br/>(Clerk Auth Guard)"]
            subgraph "API Routes"
                API_Q["/api/questions<br/>CRUD + Generate"]
                API_S["/api/sessions<br/>Practice & Mock Exam"]
                API_U["/api/users/progress"]
                API_ST["/api/study/sessions<br/>AI Tutor"]
                API_PAY["/api/payments/checkout"]
                API_ON["/api/onboarding"]
                API_SET["/api/settings"]
                API_WH["/api/webhooks<br/>Clerk + PayMongo"]
                API_HP["/api/health"]
            end
        end
        subgraph "Core Libs"
            QGEN["question-generator.ts<br/>Groq AI"]
            STRIP["study-engine.ts<br/>AI Study Tutor"]
            SBANK["study-bank.ts<br/>Question Bank"]
            DB["db.ts<br/>@neondatabase/serverless"]
            VAL["validation.ts<br/>Zod 4"]
            PM["paymongo.ts"]
            ERR["errors.ts"]
            NLP["nlp-topics.ts<br/>Content Bank"]
        end
    end

    subgraph "External Services"
        CLERK["Clerk 7<br/>Auth + User Mgmt"]
        GROQ["Groq<br/>llama-3.3-70b-versatile"]
        PAY["PayMongo<br/>GCash / Maya / Card"]
        NEON[("Neon<br/>PostgreSQL")]
    end

    UI --> MW
    MW --> CLERK
    RSC --> DB
    API_Q --> QGEN
    API_Q --> DB
    API_S --> DB
    API_U --> DB
    API_ST --> STRIP
    API_ST --> DB
    API_PAY --> PM
    API_WH --> CLERK
    API_WH --> PAY
    QGEN --> GROQ
    STRIP --> GROQ
    DB --> NEON
    PWA -.-> UI
```

---

## Frontend Pages & Navigation

```mermaid
graph LR
    subgraph "Public"
        LP["Landing<br/>Page"]
        SI["Sign In"]
        SU["Sign Up"]
        SSO["SSO Callback"]
    end

    subgraph "Authenticated"
        ON["Onboarding<br/>(4-step wizard)"]
        DASH["Dashboard<br/>Stats + Quick Actions"]
        PRAC["Practice Setup<br/>Area + Difficulty + Count"]
        QUEST["Practice Session<br/>Answer Questions"]
        RES["Results<br/>Score + Breakdown"]
        REV["Review Answers<br/>Read-only Replay"]
        MOCK["Mock Exam Setup"]
        MQUEST["Mock Exam Session<br/>Timed + Full-screen"]
        MRES["Mock Exam Results<br/>Pass/Fail + Review"]
        PROG["Progress<br/>Analytics + Mastery"]
        STUDY["Study Picker<br/>4 AI Modes"]
        SSESSION["Study Session<br/>Interactive AI Tutor"]
        QBANK["Question Bank<br/>Browse + Review"]
        SETTINGS["Settings<br/>Profile + Account"]
        PRICING["Pricing<br/>Subscribe"]
    end

    LP --> SI
    LP --> SU
    SI --> ON
    SU --> ON
    SSO --> DASH
    ON --> DASH

    DASH --> PRAC
    DASH --> MOCK
    DASH --> PROG
    DASH --> STUDY
    DASH --> SETTINGS

    PRAC --> QUEST --> RES --> REV
    MOCK --> MQUEST --> MRES

    STUDY --> SSESSION
    DASH --> QBANK
    DASH --> PRICING
```

---

## Database Schema

```mermaid
erDiagram
    questions {
        uuid id PK
        text content_area
        text difficulty "easy|medium|hard"
        text question_text
        jsonb choices "A,B,C,D"
        text correct_answer
        text rationale
        jsonb wrong_choice_rationales
        boolean reviewed
        text reviewed_by
        timestamptz created_at
    }

    sessions {
        uuid id PK
        text user_id FK
        text type "practice|mock-exam"
        jsonb content_areas
        text status "in-progress|completed"
        jsonb questions "question IDs"
        jsonb answers "question_id: answer"
        timestamptz started_at
        timestamptz completed_at
    }

    subscriptions {
        uuid id PK
        text user_id FK
        text plan "monthly|final-push"
        text status "active|expired|cancelled"
        timestamptz starts_at
        timestamptz expires_at
        text paymongo_session_id
        timestamptz created_at
    }

    user_profiles {
        text user_id PK
        text display_name
        timestamptz exam_date
        text goal
        jsonb content_areas
        timestamptz created_at
    }

    study_sessions {
        uuid id PK
        text user_id FK
        text mode "drill|case|recall|weak_area|teach_back"
        text content_area
        text topic
        jsonb transcript_json
        jsonb weak_concepts
        numeric score_pct
        jsonb question_ids
        jsonb answers "question_id: answer"
        int wrong_choices
        timestamptz created_at
        timestamptz completed_at
    }

    study_questions {
        uuid id PK
        text content_area
        text study_mode
        text question_text
        jsonb choices
        text correct_answer
        text rationale
        jsonb wrong_choice_rationales
        timestamptz created_at
    }

    mastery_events {
        uuid id PK
        text user_id FK
        text content_area
        numeric weight
        text source "practice|study"
        uuid ref_id
        boolean correct
        timestamptz created_at
    }

    user_profiles ||--o| sessions : "has sessions"
    user_profiles ||--o| study_sessions : "has study sessions"
    user_profiles ||--o| subscriptions : "has subscription"
    user_profiles ||--o| mastery_events : "has mastery data"
    sessions }o--|| questions : "references"
    study_sessions }o--|| study_questions : "references"
```

---

## Feature Matrix

| Feature | Component | API Route | DB Table | External |
|---------|-----------|-----------|----------|----------|
| Auth (Email/Google/SSO) | sign-in, sign-up, sso-callback | — | — | Clerk |
| Onboarding | onboarding/ (4-step) | GET/POST /api/onboarding | user_profiles | — |
| Dashboard | dashboard/ | — | — | — |
| Practice Mode | practice/ | POST /api/sessions | sessions, questions | — |
| Mock Exam | mock-exam/ | POST /api/sessions | sessions, questions | — |
| Question Generation | — | POST /api/questions/generate | questions | Groq AI |
| Question Review | question-bank/ | POST /api/questions/review | questions | — |
| Progress Analytics | progress/ | GET /api/users/progress | mastery_events, sessions | — |
| Adaptive Tracking | — | (auto in /api/sessions) | mastery_events | — |
| AI Study Tutor | study/ | POST /api/study/sessions/[id]/message | study_sessions, study_questions | Groq AI |
| Study Question Bank | — | POST /api/study/sessions | study_questions | — |
| Pomodoro Timer | components/pomodoro-modal | — | — | — |
| Subscription Payment | pricing/ | POST /api/payments/checkout | subscriptions | PayMongo |
| Webhooks | — | POST /api/webhooks/* | — | Clerk, PayMongo |
| Settings | dashboard/settings/ | GET/PATCH/DELETE /api/settings | user_profiles | — |
| PWA | manifest, sw-register | — | — | — |

---

## Content Areas (NLE Table of Specifications)

```mermaid
mindmap
  root((NLE Content Areas))
    Community Health
      Public Health Nursing
      Environmental Sanitation
      Communicable Diseases
    Maternal & Child
      Prenatal Care
      Labor & Delivery
      Postpartum
      Pediatric Nursing
    Adult Health Part 1
      Medical-Surgical
      Cardiovascular
      Respiratory
      Renal
    Adult Health Part 2
      Endocrine
      Neurological
      Musculoskeletal
      Integumentary
    Psychiatric Nursing
      Mental Health
      Therapeutic Communication
      Psychopharmacology
```

---

## AI Integration Flow

```mermaid
sequenceDiagram
    participant User
    participant Client
    participant API as API Route
    participant Groq as Groq AI
    participant DB as Neon DB

    Note over User,DB: Question Generation
    User->>Client: Start Practice / Mock
    Client->>API: POST /api/questions/generate
    API->>DB: Fetch weak areas (mastery_events)
    API->>Groq: Generate NLE questions (llama-3.3-70b)
    Groq-->>API: JSON questions + rationales
    API->>DB: INSERT INTO questions
    API-->>Client: Return questions

    Note over User,DB: AI Study Tutor
    User->>Client: Send message in study session
    Client->>API: POST /api/study/sessions/[id]/message
    API->>DB: Fetch transcript + weak concepts
    API->>Groq: Generate tutor response
    Groq-->>API: Response + follow-up questions
    API->>DB: Update study_sessions transcript
    API-->>Client: Stream response
```

---

## Mastery Scoring System

```mermaid
flowchart TD
    A[User Answers Question] --> B{Correct?}
    B -->|Yes| C[mastery_events: correct=true]
    B -->|No| D[mastery_events: correct=false]

    C --> E[Weighted by difficulty<br/>easy=0.5, medium=1.0, hard=1.5]
    D --> E

    E --> F[Rolling Window Calculation<br/>Last 20 answers weighted]
    F --> G[Per-Area Score = correct / total]
    G --> H{Score < 50%?}
    H -->|Yes| I[Flag as Weak Area]
    H -->|No| J[Area Normal]

    I --> K[Adaptive Tracking<br/>Next session prioritizes weak areas]
    K --> L[New questions generated<br/>focused on weak content_area]
```

---

## Study Modes

| Mode | Description | DB Value |
|------|-------------|----------|
| Concept Drill | Q&A flashcard style with immediate feedback | `drill` |
| Case Walkthrough | Clinical scenario with step-by-step analysis | `case` |
| Rapid Recall | Speed round, timed questions | `recall` |
| Teach-It-Back | Student explains concept back to AI | `teach_back` |
| Weak Area | Auto-selected based on mastery tracking | `weak_area` |

---

## Deployment & Infrastructure

```mermaid
graph LR
    DEV["Local Dev<br/>npm run dev"]
    VERCEL["Vercel<br/>Production"]
    NEON["Neon<br/>PostgreSQL"]
    CLERK_CLOUD["Clerk Cloud<br/>Auth + User DB"]
    GROQ_API["Groq API<br/>AI Inference"]
    PAY_CLOUD["PayMongo<br/>Payment Gateway"]

    DEV -->|git push| VERCEL
    VERCEL --> NEON
    VERCEL --> CLERK_CLOUD
    VERCEL --> GROQ_API
    VERCEL --> PAY_CLOUD

    subgraph "Env Variables"
        ENV["NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY<br/>CLERK_SECRET_KEY<br/>CLERK_WEBHOOK_SECRET<br/>DATABASE_URL<br/>GROQ_API_KEY<br/>PAYMONGO_SECRET_KEY"]
    end
```
