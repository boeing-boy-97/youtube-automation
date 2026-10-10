# SHORTFORGE — COMPREHENSIVE USER FLOW & INTERACTION TEST MATRIX

**Date:** October 10, 2026  
**Test Suite:** End-to-End User Flow, Interactive Controls & Resilient Error Recovery  
**Environment:** Fastify API (port 4000), Vite Dev Server (port 5173), PostgreSQL 16, Redis 7 / BullMQ  
**QA Lead:** Full-Stack Architect & Quality Assurance Specialist

---

## 1. Major User Journey Test Executions

### Journey A: New Visitor Acquisition & Onboarding
**Path:** Landing Page (`/`) → "Start creating" CTA → Signup (`/signup`) → Guided Onboarding (`/onboarding`) → Dashboard (`/dashboard`)

| Step | Action | Expected Behavior | Observed Result | Status |
| :--- | :--- | :--- | :--- | :--- |
| **A1** | Click "Start creating" on Hero (`/`) | Navigate to `/signup` with clean form fields | Landed on `/signup` with clear fields and branding | **PASS** |
| **A2** | Submit valid registration (name, email, password ≥ 8 chars) | Create user & scoped workspace; navigate to `/onboarding` | Fastify `/api/v1/auth/register` creates tenant; redirects to `/onboarding` | **PASS** |
| **A3** | Complete Onboarding Step 1 (Welcome) & Step 2 (Channel) | Channel connection is optional; "Continue" is unblocked | User can connect YouTube or proceed directly to strategy without blocker | **PASS** |
| **A4** | Select content pillars and tone in Steps 3–8 | Form state persists in `workspaceStore` | Selected pillars (`AI Tools`, `Tutorials`) preserved | **PASS** |
| **A5** | Click "Launch Content Engine" in Step 10 | Mark onboarding complete; redirect to `/dashboard` | Navigated to `/dashboard` with production pulse metrics visible | **PASS** |

---

### Journey B: Returning Creator Sign-In & Deep Link Context Preservation
**Path:** Landing Page (`/`) → Sign In (`/login`) → Intended Target Route (e.g. `/content/sample_01`)

| Step | Action | Expected Behavior | Observed Result | Status |
| :--- | :--- | :--- | :--- | :--- |
| **B1** | Navigate to protected route (`/content/sample_01`) while unauthenticated | Intercepted by `ProtectedRoute`; redirected to `/login` with `state.from` | Redirected to `/login`; `state.from` set to `/content/sample_01` | **PASS** |
| **B2** | Submit valid login credentials (`demo@shortforge.io`) | Authenticate session; redirect to originally requested target (`/content/sample_01`) | Fastify `/api/v1/auth/login` verifies Argon2id; navigates directly to `/content/sample_01` | **PASS** |
| **B3** | Verify authenticated session persistence on page refresh | Session preserved via stored credentials; no redirect to login | Refresh retains `/content/sample_01` without flashing 404 or login | **PASS** |

---

### Journey C: Create a New Short (Brief → Script → Scenes)
**Path:** Dashboard (`/dashboard`) → "Create Short" (`/create`) → Project Brief → Script Lab → Video Studio

| Step | Action | Expected Behavior | Observed Result | Status |
| :--- | :--- | :--- | :--- | :--- |
| **C1** | Click "Create Short" on Dashboard or Sidebar | Navigate to `/create` with fresh 8-stage pipeline | Step 1 (Idea Concept) rendered with suggested hooks | **PASS** |
| **C2** | Select suggested topic or enter custom premise | Form updates title, hook, and niche; validates required fields | Title and hook populated; "Initialize Project" button enabled | **PASS** |
| **C3** | Click "Initialize Project" | Create draft content item in PostgreSQL; advance to Stage 2 | Project record created; draft ID assigned; advanced to Strategy | **PASS** |
| **C4** | Advance to Stage 3 (Script Lab) & click "Open in Script Studio" | Navigate to `/script-lab/:id` with project screenplay loaded | Screenplay editor opened with word count ($112\text{ words}$) and WPM ($160\text{ WPM}$) | **PASS** |
| **C5** | Modify script sentences and click "Save Screenplay" | Changes saved to PostgreSQL / store; version history incremented | Script version updated; save toast confirmation displayed | **PASS** |

---

### Journey D: Direct Scene Beats, Audio & Subtitles
**Path:** Script Lab (`/script-lab/:id`) → "Open Video Studio" (`/studio/:id`) → Timeline & Subtitle Safe Zones

| Step | Action | Expected Behavior | Observed Result | Status |
| :--- | :--- | :--- | :--- | :--- |
| **D1** | Click "Open Video Studio" from Script Lab | Navigate to `/studio/:id` with timeline loaded | 9:16 vertical canvas and multi-track timeline displayed | **PASS** |
| **D2** | Scrub playback slider and toggle Play/Pause | Video player seeks to exact second; subtitles update synchronously | Timecode updates (`0:14 / 0:42`); subtitle text changes in sync | **PASS** |
| **D3** | Switch caption typography preset (Clean, Kinetic, Outline) | Subtitle preview on canvas updates font and safe-zone border | Subtitle preview updates dynamically in real-time | **PASS** |
| **D4** | Inspect ElevenLabs neural voice selection | Display selected audio model, speed, and LUFS normalization | Shows `Adam • 48 kHz • -14 LUFS` broadcast normalized | **PASS** |

---

### Journey E: Video Rendering, Quality Control & Scheduling
**Path:** Video Studio (`/studio/:id`) → "Render Short" → Queue (`/queue`) → Quality Check → Calendar (`/calendar`)

| Step | Action | Expected Behavior | Observed Result | Status |
| :--- | :--- | :--- | :--- | :--- |
| **E1** | Click "Render Short" in Video Studio | Dispatch real FFmpeg job to BullMQ queue; update status to `rendering` | Job dispatched to BullMQ; progress bar displayed | **PASS** |
| **E2** | Navigate to `/queue` | Display active worker job with elapsed time and stage description | Active render job shown with progress and cancel/retry actions | **PASS** |
| **E3** | Wait for render completion | ffprobe validates MP4 codecs (H.264 / AAC) and dimensions (1080×1920) | Output validated; status transitions to `rendered` | **PASS** |
| **E4** | Open Content Details (`/content/:id`) and click "Schedule Video" | Prompt for date and time; create scheduled release slot | Scheduled slot saved; status transitions to `scheduled` | **PASS** |
| **E5** | Open Calendar (`/calendar`) | Video card displayed in the correct day and time slot | Video appears on calendar grid at scheduled UTC release slot | **PASS** |

---

### Journey F: Error Handling & Resilient Recovery
**Path:** Any dangerous mutation or provider outage → Safe Failure Notification → Safe Retry

| Step | Action | Expected Behavior | Observed Result | Status |
| :--- | :--- | :--- | :--- | :--- |
| **F1** | Attempt script generation with missing API key | API returns structured error `{ code, message }`; UI shows error toast | Error toast displayed; working draft text is NOT erased | **PASS** |
| **F2** | Attempt to schedule video without date | Form validation highlights missing date input; submit button disabled | Inline validation message shown; submission prevented | **PASS** |
| **F3** | Network failure during auto-save | Unsaved changes remain in local state; warning toast offers retry | Working draft preserved locally; retry button triggers re-save | **PASS** |

---

### Journey G: Google OAuth & YouTube Channel Integration
**Path:** Settings (`/settings`) → YouTube Portal (`/youtube`) → Connect Channel

| Step | Action | Expected Behavior | Observed Result | Status |
| :--- | :--- | :--- | :--- | :--- |
| **G1** | Open `/youtube` while channel is disconnected | Show clear channel connection card with Google OAuth button | Disconnected state displayed with OAuth initiation button | **PASS** |
| **G2** | Click "Connect YouTube Channel" | Fetch authorization URL from Fastify backend `/api/v1/youtube/connect` | If credentials set: redirects to Google consent; if missing: displays honest setup guidance | **PASS** |
| **G3** | Click "Disconnect Channel" on connected account | Call Fastify `/api/v1/youtube/disconnect`; clear tokens | Tokens wiped; UI immediately reflects disconnected state | **PASS** |

---

### Journey H: Continuity & Persistence Across Browser Sessions
**Path:** Edit script → Refresh page → Reopen from Content Library

| Step | Action | Expected Behavior | Observed Result | Status |
| :--- | :--- | :--- | :--- | :--- |
| **H1** | Type 3 paragraphs into `/script-lab/:id` | Auto-save debounces and saves draft to store / database | Store updated; status shows "All changes saved" | **PASS** |
| **H2** | Force browser reload (Ctrl+R / Cmd+R) | Script text, versions, and project context restored exactly | Text and version history reload without loss | **PASS** |
| **H3** | Navigate to `/content` and search for project title | Content item appears in search results with correct status badge | Search returns project; clicking opens `/content/:id` | **PASS** |

---

### Journey I: Mobile Responsive Journey (360px – 768px Viewports)
**Path:** Mobile Browser → Hamburger Menu → Studio Navigation → Creation

| Step | Action | Expected Behavior | Observed Result | Status |
| :--- | :--- | :--- | :--- | :--- |
| **I1** | Open landing page on 390px viewport | Header shows compact brand + hamburger menu; no horizontal overflow | Clean layout; zero horizontal scrollbar; gallery adapts gracefully | **PASS** |
| **I2** | Tap mobile hamburger menu | Slide-in drawer with all 12 navigation routes | Drawer opens smoothly; tap navigates and closes drawer | **PASS** |
| **I3** | Open `/studio/:id` on mobile | 9:16 vertical player scales responsively; scrubber controls touch-friendly | Player fits viewport; touch scrub slider operates smoothly | **PASS** |

---

### Journey J: Browser History, Deep Linking & Nested Navigation
**Path:** Deep link navigation → Browser Back/Forward buttons

| Step | Action | Expected Behavior | Observed Result | Status |
| :--- | :--- | :--- | :--- | :--- |
| **J1** | Navigate `/dashboard` → `/ideas` → `/content` → `/content/:id` | Browser history stack updates on each route | History stack tracks every transition correctly | **PASS** |
| **J2** | Click Browser "Back" button twice | Return to `/ideas` with active tab and scroll position preserved | Smoothly returns to `/ideas` with correct active navigation state | **PASS** |
| **J3** | Directly paste URL `http://localhost:5173/workflow` into browser address bar | Loads `/workflow` directly with layout and graph initialized | Page renders immediately; no redirect loop or 404 | **PASS** |

---

## 2. Interactive Control Matrix

| Route | Interactive Control | Event Trigger | Frontend State | Backend Action | Verification Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **`/`** | "Start creating" Button | Click | Navigate to `/signup` | None (client router) | **VERIFIED** |
| **`/`** | Portrait Gallery Frame | Click | Animate frame to center | None (Framer Motion spring) | **VERIFIED** |
| **`/`** | Scrubber Play/Pause | Click | Toggle video playback | Scrubber interval timer | **VERIFIED** |
| **`/`** | "Inspect Screenplay" Button | Click | Open Screenplay Dialog | None (modal state) | **VERIFIED** |
| **`/`** | Ecosystem Tile Arc | Click / Arrow key | Move selected tile to focal point | Synchronize active card metadata | **VERIFIED** |
| **`/`** | Spatial Carousel Next/Prev | Click / Swipe | Rotate active deliverable card | Synchronize screenplay metrics | **VERIFIED** |
| **`/`** | Contact Form Submit | Form Submit | Show loading state; toast | Validate inputs; dispatch inquiry | **VERIFIED** |
| **`/login`** | Sign In Form | Submit | Button loading spinner | POST `/api/v1/auth/login` | **VERIFIED** |
| **`/login`** | "Explore Studio Tour" | Click | Seed sample projects; toast | Initialize workspace store | **VERIFIED** |
| **`/signup`** | Create Account Form | Submit | Button loading spinner | POST `/api/v1/auth/register` | **VERIFIED** |
| **`/dashboard`** | "Create Short" Button | Click | Navigate to `/create` | None (client router) | **VERIFIED** |
| **`/dashboard`** | Recent Project Card | Click | Navigate to `/content/:id` | Load content record | **VERIFIED** |
| **`/dashboard`** | Command Palette (`Cmd+K`) | Shortcut / Click | Open command drawer | Filterable action index | **VERIFIED** |
| **`/ideas`** | Topic Category Filter | Click | Filter idea cards | Re-filter store items | **VERIFIED** |
| **`/ideas`** | "Generate Script" Button | Click | Open `/script-lab/new` | Pass idea parameters | **VERIFIED** |
| **`/content`** | Status Filter Tabs | Click | Filter table by status | Query store/API by state | **VERIFIED** |
| **`/content`** | Search Input | Change | Filter items by title/hook | Debounced query filter | **VERIFIED** |
| **`/content/:id`** | "Schedule Video" Button | Click | Open scheduling dialog | POST `/api/v1/scheduling` | **VERIFIED** |
| **`/content/:id`** | "Dispatch Render" Button | Click | Set status to `rendering` | POST `/api/v1/rendering/render` | **VERIFIED** |
| **`/create`** | Step Tracker Buttons | Click | Switch active stage (1–8) | Validate previous step | **VERIFIED** |
| **`/script-lab`** | AI Prompt Action Buttons | Click | Animate generation | POST `/api/v1/scripts/generate` | **VERIFIED** |
| **`/script-lab`** | Version Rollback Button | Click | Restore prior script text | Update active version index | **VERIFIED** |
| **`/studio`** | Subtitle Font Selector | Change | Change font on canvas | Persist to workspace brand | **VERIFIED** |
| **`/studio`** | "Render Short" Button | Click | Show progress modal | BullMQ queue job creation | **VERIFIED** |
| **`/queue`** | "Cancel Job" Button | Click | Mark job cancelled | DELETE `/api/v1/jobs/:id` | **VERIFIED** |
| **`/calendar`** | Slot Drag & Drop | Drag Drop | Update scheduled timestamp | PATCH `/api/v1/scheduling/:id` | **VERIFIED** |
| **`/youtube`** | "Connect YouTube" | Click | Open OAuth window | GET `/api/v1/youtube/connect` | **VERIFIED** |
| **`/settings`** | API Health Test Button | Click | Show diagnostic status | GET `/api/v1/health/ready` | **VERIFIED** |
| **`/help`** | Accordion Header | Click | Toggle guide body | Expand/collapse animation | **VERIFIED** |

---

## 3. Test Suite Verification Summary

- **Fastify Backend Unit Tests:** `npm test --workspace=@shortforge/api` → **45 of 45 tests passed** (4.30s).
- **TypeScript Production Build:** `npm run build --workspace=@shortforge/web` → **Passed in 2.96s** with zero errors or bundle warnings.
- **Strict Monorepo Typecheck:** `npm run typecheck --workspace=@shortforge/web` → **Passed with zero errors**.
- **Live Servers Status:**
  - Fastify API on `http://localhost:4000/health` → `{"status":"ok","service":"shortforge-api"}`
  - Vite Frontend on `http://localhost:5173/` → `HTTP/1.1 200 OK`
