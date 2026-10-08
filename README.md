# ShortForge

**Your content engine, running on autopilot.**

ShortForge is an autonomous short-form video operating system for YouTube creators — a production-grade frontend application built with React, TypeScript, Vite, Tailwind CSS, React Router, Zustand, React Query, React Hook Form, Framer Motion, Recharts, and React Flow.

## Quick Start

```bash
npm install
npm run dev      # start dev server at http://localhost:5173
npm run build    # production build
```

## Architecture

```
src/
  app/            # App shell, router, providers
  components/
    ui/           # Reusable primitives (Button, Card, Input, Dialog, etc.)
    shell/        # Sidebar, Header, MobileNav, CommandPalette, Toast
    common/       # PageHeader, EmptyState
  pages/          # All routes (Landing, Login, Onboarding, Dashboard, …)
  services/
    demoEngine.ts # Staged async simulation (script, voice, visuals, render, QC, publish)
    mockApi.ts    # Simulated progress helpers
  stores/         # auth, workspace, content, automation, ui (Zustand)
  mock/           # Seed data for ideas, content, analytics, YouTube
  types/          # Full TypeScript domain types
  lib/            # utils, constants, formatters, validators
  styles/         # Design tokens in globals.css (light/dark)
```

## Demo Flow

1. Open `/` → click "Start Building"
2. Sign up with any name/email (demo auth, localStorage only)
3. Complete onboarding: Welcome → Connect YouTube (simulated) → Channel → Pillars → Rules → Voice → Brand → Publishing → Automation → Launch
4. Dashboard shows seeded KPIs, pipeline, queue, engine health
5. Click **Create** → AI-generate a concept → step through Script → Voice → Visuals → Studio → Render → QC → Approve → Schedule
6. Open **Automation** → enable Assisted or Autonomous → Run Now (runs the full pipeline with live progress)
7. **Calendar**, **Queue**, **Analytics**, **YouTube**, **Workflow builder**, **Templates**, **Brand Kit**, **Assets**, **Notifications**, **Settings**, **Help** are all connected.

## Keyboard Shortcuts

- `C` — Create
- `/` or `Cmd/Ctrl+K` — Command palette
- `G D/I/C/Q/A/S` — Navigate (Go to Dashboard/Ideas/Content/Queue/Analytics/Settings)
- `Esc` — Close dialogs/drawers/palette

## Design System

- **Palette:** off-white background, white surfaces, charcoal typography, emerald accent (#1a7d4c), semantic success/warning/error/info
- **Typography:** Inter with display / page-title / section-title / card-title / body / caption / metadata / micro-label scale
- **Dark mode:** Theme toggle in Settings or header; persisted in localStorage
- **Mobile:** Bottom nav with floating Create button; tables become cards; responsive layouts at sm/md/lg breakpoints
- **Motion:** Subtle fade/slide/scale transitions with reduced-motion support

## Data Persistence

All demo state (user, workspace, content, ideas, jobs, notifications, automation config, theme) is persisted to `localStorage`. Use **Settings → Danger Zone → Reset Demo Data** to clear everything and return to onboarding.
