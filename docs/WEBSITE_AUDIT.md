# SHORTFORGE — COMPREHENSIVE FULL-SITE AUDIT & TRANSFORMATION ROADMAP

**Date:** October 10, 2026  
**Auditor:** Principal Product Designer, Full-Stack Architect & Quality Assurance Lead  
**Scope:** Complete Product Suite (Public Website + 22 Authenticated Pages + Design Tokens + Backend Integrations)  
**Baseline Creative Direction:** The Modern Creative Studio (Warm Canvas `#FAF6EE`, Pure Surface `#FFFFFF`, Deep Ink `#25211F`, Vermilion `#EC5A3A`, Marigold `#F0CF73`, Muted Green `#789181`, Secondary Text `#706B64`, Border `#E5DDD1`).

---

## 1. Complete Route Inventory & Architectural Evaluation

| Route Path | Category | Data Source | Visual State | Interaction / Functional Status | Required Action & Transformation |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `/` | Public | Modular Landing Sections | High contrast, but had tech jargon badges & split-screen mockup. | Functional interactive video player & demo triggers. | **Rebuild Hero into an art-directed editorial cover.** Introduce Vermilion brand identity, remove fake terminal jargon, eliminate repetitive cards. |
| `/login` | Public Auth | `authStore` + Fastify `/auth/login` | Basic card layout. | Server-validated auth, Argon2id passwords, cookie issuance. | Apply warm studio aesthetic, vermilion accents, keyboard shortcuts, clear error notifications. |
| `/signup` | Public Auth | `authStore` + Fastify `/auth/register` | Basic card layout. | Workspace auto-creation with tenant scoping. | Match creative studio theme, streamlined inputs, password strength guidance. |
| `/onboarding` | Wizard | `workspaceStore` + Local/API | 4-step wizard. | Niche, tone, platform, duration preference persistence. | Polish visual hierarchy, remove generic stock styling, ensure fluid step navigation. |
| `/dashboard` | Core App | `contentStore`, `apiClient.content` | Dense card grid. | Real database sync, removed fake view offsets (`+ 42800`). | Modern studio overview, prominent "Create Short" action, genuine zero-state handling, truthful KPI cards. |
| `/ideas` | Studio | `apiClient.ideas` | List view with score badges. | Strategy selection, approval/rejection, moving ideas to drafts. | Warm typography, structured curiosity gap analysis, remove synthetic score fluff. |
| `/content` | Studio | `apiClient.content`, `contentStore` | Grid/list view. | Filter by status (`draft`, `script_ready`, `rendered`, `published`), search, delete. | Unified empty state, responsive card sizing, real duration indicators. |
| `/content/:id` | Studio | `apiClient.content.get(id)` | Tabbed layout. | State machine visualization, version history, activity trace. | Clear progression timeline, action buttons mapped directly to state transitions. |
| `/create` | Studio | `apiClient.content.create` | 8-step wizard. | Direct topic ingestion into PostgreSQL, duration estimation. | Seamless creation canvas, responsive form controls, vermilion primary buttons. |
| `/script-lab/:id` | Studio | `apiClient.scripts.save` | Screenplay editor + AI tools. | Version tracking, word count velocity ($145\text{ WPM}$), scene parser. | Hollywood screenplay formatting, readability telemetry, real line regeneration. |
| `/studio/:id` | Studio | `apiClient.rendering.render` | 9:16 vertical editor + timeline. | Aspect ratio switcher, caption styling, multi-track timeline, FFmpeg dispatch. | Responsive timeline scrubber, live subtitle font preview, real render job dispatch. |
| `/queue` | Infra | `apiClient.jobs`, BullMQ | Status list. | 17 active BullMQ queue telemetry, active/waiting/failed jobs. | Polished status badges, real job progress, cancel & retry actions. |
| `/calendar` | Publishing | `apiClient.scheduling`, `contentStore` | Monthly calendar grid. | Drag/drop scheduling slots, scheduled content cards. | Clean editorial calendar, timezone awareness (UTC presentation), slot occupancy badges. |
| `/automation` | Engine | `automationStore`, Fastify API | Toggle switches & rule cards. | Assisted vs Autonomous mode toggles, spend limits, pillar weights. | Clear guardrail controls, eliminate fake autopilot claims, persist automation policies. |
| `/workflow` | Engine | `apiClient.workflows` | Node graph view. | Visual representation of pipeline execution states. | Responsive node canvas, real execution timestamps, error state badges. |
| `/templates` | Studio | `contentStore.templates` | Template card grid. | Structure presets (Curiosity Gap, 3-Act Micro-Story, Contrarian Truth). | High-contrast editorial cards, instant project initialization from template. |
| `/brand-kit` | Settings | `workspaceStore` | Form controls + color picker. | Subtitle typography selection (Inter, Montserrat, Poppins), accent color. | Visual subtitle card preview updating dynamically in real-time. |
| `/assets` | Studio | `apiClient.assets`, S3 / Local | Media grid. | File upload validation, MIME checks, voiceover & visual asset tags. | Drag-and-drop asset dropzone, audio wave previews, asset deletion. |
| `/analytics` | Insights | `apiClient.analytics`, YouTube API | Metric cards & charts. | Engagement telemetry, view counts, retention dropoff. | Distinguish verified platform metrics from zero states, eliminate fabricated viewer gains. |
| `/youtube` | Integrations | `apiClient.youtube`, Google OAuth | OAuth banner & channel card. | OAuth authorization flow, channel sync, disconnect handling. | Clean Google OAuth button, truthful channel statistics, real published shorts list. |
| `/notifications`| Shell | `contentStore.notifications` | Notification list. | Mark read, filter by priority (info, warning, success, error). | Studio alert center with real job completion and publishing logs. |
| `/settings` | Settings | `apiClient.users`, `health` | Multi-section settings. | Profile update, API health (`/health/ready`), provider API key guidance. | Tabbed settings with live database/redis diagnostic cards and key instructions. |
| `/help` | Docs | Static markdown guide | Accordion & guide cards. | Keyboard shortcuts, pipeline guide, API references. | Concise editorial documentation, search input, clear troubleshooting tips. |
| `/404` | Shell | Static component | Not found card. | Navigation fallback. | Branded studio 404 page with return-to-dashboard and support actions. |

---

## 2. Visual & Structural Issues Identified

1. **Monochrome Overload:** Previous iteration relied too heavily on black and bright lime, producing a harsh, overly dark aesthetic resembling an IDE or crypto dashboard rather than a high-end creative content house.
2. **Artificial Technical Chrome:** Decorative labels (`PROJECT_01`, `DIRECTOR PROMPT`, faux terminal dots) created visual noise without serving creator usability.
3. **Pill & Border Fatigue:** Too many buttons and cards used pill-shaped borders (`rounded-full`) and heavy borders, causing layout clutter.
4. **Desktop-Biased Timelines:** The 4-track timeline in the Studio required horizontal scrolling on smaller screens without an adaptive stacked mobile view.
5. **Color Hierarchy:** Primary call to actions lacked warmth and punch.

---

## 3. The New Visual Direction & Design Tokens

- **Brand Primary Accent (Vermilion `#EC5A3A`):** High-energy, warm, film-grade red-orange for primary CTA buttons, playback scrubbers, and active stages.
- **Brand Secondary Accent (Marigold `#F0CF73`):** Warm gold for highlights, bookmarks, and curated badges.
- **Editorial Grounding (Deep Ink `#25211F` & Warm Canvas `#FAF6EE`):** Literary, publication-grade foundation that reduces eye strain and provides superior contrast.
- **Muted Green (`#789181`):** Subdued moss tone for system health, verified status, and success badges.
- **Typography:**
  - Headlines: *Newsreader* (editorial display serif) for evocative literary statements.
  - Body & UI: *Inter* (geometric modern sans-serif) for high-density interface legibility.
  - Telemetry & Code: *JetBrains Mono* reserved strictly for real timecodes (`00:14.2`), duration markers, and CLI commands.
- **Restrained Corner Treatment:** Transition from generic `rounded-full` pills to structured `rounded-md` (6px) and `rounded-lg` (8px) architectural corners.
