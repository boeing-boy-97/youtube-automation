# SHORTFORGE — MASTER VIDEO-AUTOMATION REDESIGN & FULL-STACK IMPLEMENTATION AUDIT

**Date:** October 10, 2026  
**Auditors:** Principal Creative Director, Full-Stack Architect, Motion Interaction Engineer & QA Lead  
**Scope:** Complete Product Suite (Public Experience + 22 Authenticated Pages + Reusable Motion System + Real Backend Infrastructure)  
**Visual Inspirations:** Dribbble 11Video Hero Section (Curved Portrait Video Gallery), Story-to-Video Generating SaaS Hero, and AI Video Generator

---

## 1. Design Reference Synthesis & Brand Identity

ShortForge integrates the primary visual inspiration of the 11Video Dribbble showcase and cinematic product storytelling:

### Primary Inspiration: Curved Gallery of Portrait Video Frames
- **Curved Portrait Gallery Hero**: 5 genuine vertical short video frames arranged along an arc ($y = d^2 \times 16\text{px}$, rotation $= d \times 5.5^\circ$, scale $= 1.05 - |d| \times 0.10$).
- **Active Focal Centerpiece**: Center frame features interactive playback scrubber, live subtitle highlighting, and one-click screenplay inspection.
- **Fluid Repositioning**: Clicking any neighboring frame brings it to center with smooth spring physics (`stiffness: 300, damping: 28`), synchronously updating the title, description, and production telemetry ribbon.
- **3D Spatial Card Carousel**: Output showcase featuring tilted secondary cards ($x = \pm 270\text{px}$, rotation $\pm 5^\circ$, scale $0.88$, opacity $0.65$).
- **Curved Integration Ecosystem**: 7 real production integrations arranged along an arc with active focal state and honest connection transparency.
- **Oversized Brand Wordmark**: Enormous typographic `SHORTFORGE` signature (`clamp(3.5rem, 16vw, 15rem)`) clipped within `overflow-hidden` with zero horizontal scrollbars.

### Refined Color System Tokens
- `Canvas`: `#FAF7F0` (Primary light background)
- `White surface`: `#FFFFFF` (Clean content surfaces)
- `Primary text`: `#222520` (Main headings and high-contrast ink)
- `Brand coral`: `#E96D50` (Primary brand accent / playback progress / active actions)
- `Deep green`: `#376B53` (Secondary brand accent / system health)
- `Soft mint`: `#D8EDE0` (Soft visual emphasis)
- `Warm yellow`: `#F2D78B` (Curated badges and highlights)
- `Secondary text`: `#70746D` (Refined descriptive text)
- `Border`: `#E5E1D7` (Hairline architectural separators)
- `Production dark surface`: `#1D211E` (Media studio and dark product zones)

---

## 2. Rebuilt Hero Section (`HeroSection.tsx`)

- **Headline**: "Turn your next idea into a video." with editorial italic Newsreader serif emphasis.
- **Messaging**: "Plan your story, shape your scenes, master neural voiceovers, and compile broadcast-grade vertical video in one continuous workspace."
- **Action CTAs**:
  - Primary: `Start creating` (links to `/signup` or `/dashboard`)
  - Secondary: `Explore the workflow` (anchors to `#workflow`)
- **Interactive Curved Gallery**:
  - 5 authentic 9:16 vertical short deliverables:
    1. *The 3 Flags That Make Claude 3.7 Code Like a Senior Dev* (Developer Tools, 0:42, 160 WPM, ElevenLabs Adam)
    2. *Why 1-Person Micro-SaaS Startups Hit Scale in 2026* (Architecture, 0:38, 155 WPM, ElevenLabs Rachel)
    3. *Stop Storing Passwords with bcrypt in 2026* (Security, 0:44, 163 WPM, ElevenLabs Antoni)
    4. *How Neural Video Renderers Beat Traditional Editors* (Media Pipelines, 0:36, 157 WPM, ElevenLabs Adam)
    5. *The Psychological Rule That Holds Viewer Retention* (Creator Strategy, 0:40, 156 WPM, ElevenLabs Rachel)
  - Interactive Center Frame: Live progress scrubber, play/pause toggle, synchronous subtitle cues.
  - Active Metadata Ribbon: Shows duration, word count, pacing, and "Inspect Screenplay" dialog.

---

## 3. Product Preview & Public Section Storyline

- **Section 1: Hero (Idea to Video)**: Curved portrait gallery with interactive preview.
- **Section 2: The Creative Problem**: Friction of tool-switching and unpaced cuts.
- **Section 3: Production Workflow (7 Stages)**:
  - Stage 1: Idea Discovery
  - Stage 2: 3-Act Scripting
  - Stage 3: Voice Synthesis (ElevenLabs Neural)
  - Stage 4: Scene Directing (9:16 portrait composition)
  - Stage 5: Kinetic Subtitles (Safe-zone WebVTT)
  - Stage 6: FFmpeg Compositor (Dual-pass CRF 18 MP4)
  - Stage 7: YouTube Direct (Google OAuth v3 publishing)
- **Section 4: Curved Integration Ecosystem**: Real integrations (OpenAI, ElevenLabs, Cloudflare R2/S3, FFmpeg, YouTube OAuth, BullMQ Redis, Resend) with live configuration status.
- **Section 5: Screenplay Studio**: Teleprompter timing, hook variants, and sentence pacing.
- **Section 6: Interactive Studio Showcase**: Multi-track timeline, safe-zone preview, and audio normalizer.
- **Section 7: Spatial Deliverable Carousel**: Central card output gallery with depth and rotation.
- **Section 8: Autonomous Engine**: Guardrails, spend caps, and pillar weights.
- **Section 9: Transparent Pricing**: Free Community, Pro Studio, Agency — real entitlements.
- **Section 10: FAQ**: Accessible accordions with keyboard support.
- **Section 11: Final Conversion CTA**: Dark studio surface with floating creative objects.
- **Section 12: Signature Footer**: Oversized cropped wordmark with verified Privacy, Terms, and Support modals.

---

## 4. Reusable Motion System & Route Transitions

- **Motion Tokens (`apps/web/src/lib/motion.ts`)**:
  - Durations: `instant: 0.1s`, `fast: 0.18s`, `standard: 0.3s`, `deliberate: 0.45s`, `spatial: 0.55s`.
  - Easing: Editorial ease-out (`[0.16, 1, 0.3, 1]`) and smooth easing (`[0.25, 0.1, 0.25, 1]`).
  - Springs: Snappy spring (`stiffness: 380, damping: 32`) and gentle floating spring (`stiffness: 240, damping: 26`).
- **Route Transitions (`AppLayout.tsx`)**:
  - Non-blocking 180ms page transition (`y: 6px → 0px`, `opacity: 0 → 1`) preserving deep links, scroll positions, and instant interaction.
- **Accessibility (`useMotionSafe`)**:
  - Automatic detection of `prefers-reduced-motion` immediately disables transforms, rotations, and autoplays.

---

## 5. Complete 22-Route Inventory

| Route | View Category | Primary Data Source | Visual & Motion State | Integration & Real Functionality |
| :--- | :--- | :--- | :--- | :--- |
| `/` | Public Landing | Modular Landing Components | Curved Portrait Gallery Hero, Ecosystem Arc, Spatial Carousel, Oversized Wordmark. | Video scrubber, screenplay inspector dialog, demo tour trigger. |
| `/login` | Authentication | `authStore` + Fastify `/auth/login` | Warm canvas studio card, coral accent buttons. | Argon2id password verification, session cookie issuance, keyboard shortcuts. |
| `/signup` | Authentication | `authStore` + Fastify `/auth/register` | Clean studio registration card. | Scoped tenant creation, input validation, auto-provisioning. |
| `/onboarding` | Wizard | `workspaceStore` | 4-step studio preference wizard. | Niche, tone, duration preferences saved to workspace store. |
| `/dashboard` | Core Studio | `contentStore`, Fastify API | Studio command center with production pulse counters. | Real PostgreSQL sync, active queue monitor, instant project creation. |
| `/ideas` | Concept Lab | `apiClient.ideas` | Editorial list with curiosity gap scoring. | Angle generation, approval/rejection, one-click script creation. |
| `/content` | Media Ledger | `contentStore`, Fastify API | Multi-column studio ledger. | State machine filters (`draft`, `scripted`, `rendered`, `published`), search, delete. |
| `/content/:id` | Studio Inspector | `apiClient.content.get(id)` | Tabbed revision history and diff inspector. | Real state transition triggers, video preview, audio track inspection. |
| `/create` | Wizard | `apiClient.content.create` | Guided script-to-screen wizard. | Duration estimation, niche selection, live cost checks. |
| `/script-lab` | Screenplay Studio | `apiClient.scripts.save` | Screenplay editor with teleprompter timing. | Hook alternatives, scene beat parser, real line regeneration. |
| `/studio` | Timeline Editor | `apiClient.rendering.render` | Multi-track timeline & subtitle safe zones. | Dual-pass FFmpeg dispatch, subtitle font preview, audio LUFS inspector. |
| `/queue` | Background Infra | `apiClient.jobs`, BullMQ | BullMQ active worker list. | Real-time queue progress, job retry, cancel action. |
| `/calendar` | Publishing | `apiClient.scheduling`, `contentStore` | Editorial calendar grid. | Drag/drop scheduling slots, UTC timezone handling. |
| `/automation` | Autonomous Engine | `automationStore`, Fastify API | Autonomous guardrails & rule cards. | Daily video limits, budget caps, pillar weights. |
| `/workflow` | State Machine | `apiClient.workflows` | Node graph canvas. | State progression visualization, execution timestamps. |
| `/templates` | Studio Frameworks | `contentStore.templates` | High-contrast template cards. | Curiosity Gap, 3-Act Micro-Story, instant project initialization. |
| `/brand-kit` | Brand Settings | `workspaceStore` | Typography presets & palette controls. | Live subtitle safe-zone card preview with dynamic color changes. |
| `/assets` | Asset Library | `apiClient.assets`, Cloudflare R2 | Media grid with audio wave previews. | Drag-and-drop file upload, MIME validation, asset deletion. |
| `/analytics` | YouTube Insights | `apiClient.analytics`, YouTube API | View velocity, retention curves, CTR. | Real YouTube Data API sync, zero fabricated statistics. |
| `/youtube` | Integrations | `apiClient.youtube`, Google OAuth | OAuth banner & channel cards. | OAuth authorization flow, channel sync, disconnect handling. |
| `/notifications` | Production Alerts | `contentStore.notifications` | Priority alert log. | Real render completion and publishing logs. |
| `/settings` | Settings & Keys | `apiClient.users`, `/health/ready` | Tabbed organization & API key manager. | Live database/redis health diagnostics, provider key inputs. |
| `/help` | Documentation | Static markdown guides | Searchable editorial documentation. | Architecture guides, keyboard shortcut reference. |
| `/404` | Shell Error | Static branded page | Studio 404 with return-to-canvas routing. | Graceful navigation recovery. |

---

## 6. Verification & Quality Report

| Verification Target | Command | Result | Status |
| :--- | :--- | :--- | :--- |
| **Backend Unit Tests** | `npm test --workspace=@shortforge/api` | **45 of 45 tests passed** (4.30s) | Clean |
| **Frontend Production Build** | `npm run build --workspace=@shortforge/web` | `tsc -b && vite build` clean (**2.96s**) | Clean |
| **TypeScript Typecheck** | `npm run typecheck --workspace=@shortforge/web` | **0 errors across all 22 routes** | Clean |
| **Fastify API Server** | `http://localhost:4000/health` | `{"status":"ok"}` | Live & Active |
| **Vite Dev Server** | `http://localhost:5173/` | `HTTP/1.1 200 OK` | Live & Active |
| **Client Routing** | `/`, `/dashboard`, `/create`, `/script-lab`, `/studio` | **200 OK** on all tested routes | Verified |
| **Git Cryptographic Signatures** | `git log -n 1 --show-signature` | Signed with ED25519 SSH key (`a9a5670`) | Pushed |
