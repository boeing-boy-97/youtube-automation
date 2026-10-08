# API Reference

All API endpoints are prefixed `/api/v1`. Interactive Swagger UI is available at `http://localhost:4000/docs` when the server is running.

## Envelope

### Success (2xx)
```json
{
  "data": { ... },
  "meta": { "cursor": "...", "limit": 50 }
}
```

### Error (4xx / 5xx)
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Human-readable message",
    "requestId": "req_2f8a1b...",
    "details": { ... }
  }
}
```

Stack traces and secrets are **never** exposed to clients. The `requestId` matches server logs for support/debugging.

## Authentication
- `Authorization: Bearer <jwt>` **or** cookie `sf_token=<jwt>`
- Workspace-scoped routes additionally require `X-Workspace-Id: wsp_xxx` header.

## Pagination
List endpoints use **cursor-based pagination only** (no offset):
- Request: `?limit=50&cursor=<opaqueCursor>`
- Response `meta.nextCursor` is `null` when there are no more pages.

## Modules
| Module | Prefix | Purpose |
|---|---|---|
| auth | `/auth` | Register, login, logout, refresh, me |
| workspaces | `/workspaces` | Workspace CRUD, membership, RBAC |
| channels | `/channels` | YouTube channel connections (OAuth) |
| ideas | `/ideas` | AI-generated content ideas |
| content | `/content` | Content items (state-machine driven) |
| scripts | `/scripts` | Script generation + revisions |
| voices | `/voices` | TTS generation |
| visuals | `/visuals` | Image/visual generation |
| scenes | `/scenes` | Scene segmentation |
| projects | `/projects` | Render projects |
| rendering | `/rendering` | FFmpeg render jobs |
| subtitles | `/subtitles` | SRT generation/burn-in |
| qc | `/qc` | Automated quality checks |
| reviews | `/reviews` | Human review gate |
| scheduling | `/scheduling` | Publish schedule |
| publishing | `/publishing` | YouTube upload + idempotency |
| analytics | `/analytics` | YouTube analytics sync |
| automation | `/automation` | Autonomous loop controls |
| strategies | `/strategies` | Performance strategy config |
| workflows | `/workflows` | Workflow template library |
| notifications | `/notifications` | In-app/email notifications |
| billing | `/billing` | Stripe plans, subscription, usage |
| assets | `/assets` | Uploaded/generated asset storage proxy |
| jobs | `/jobs` | Job status, SSE progress stream |
| audit | `/audit` | Audit log |
| intelligence | `/intelligence` | Performance insights |
| users | `/users` | User profile |
| usage | `/usage` | Usage/cost metering |

## Real-time updates
Subscribe to `/api/v1/jobs/events` (SSE) for job progress events. Event payloads are shaped `{ event: 'job.progress'|'job.completed'|'job.failed', jobId, data }`. WebSocket support will be added when multi-client presence is required.
