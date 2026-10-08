# Operations Runbooks

## Restart order after deploy
1. Run migrations: `npm run db:deploy -w @shortforge/api` (from repo root or container).
2. Rolling-restart API workers (zero-downtime behind load balancer; drain connections).
3. Rolling-restart BullMQ workers; BullMQ will resume processing jobs in progress after `stalledInterval` (30s).

## Diagnosing a stuck publish
1. Check job status: inspect `Job` table for `publishing` queue entries with state=`failed` or `stalled`.
2. Check `OutboxEvent` table where `processed=false` for type='PublishRequested' — indicates DB/queue split.
3. Run reconciliation manually (or wait 5 min for the scheduled job):
   ```sql
   SELECT * FROM "OutboxEvent" WHERE processed = false ORDER BY "createdAt" DESC LIMIT 20;
   ```
   The reconciliation worker lists videos in the YouTube channel and compares against DB content marked `PUBLISHING`/`PUBLISHED`, healing mismatches without re-uploading.

## Redis down
API continues to serve reads (no queue-dependent endpoints) but writes that enqueue jobs will error 503. BullMQ will reconnect automatically. On Redis restart:
- In-flight jobs will become `stalled` and retried by the worker.
- Locks (Redlock) expire; any in-progress publish/automation will re-check idempotency keys.

## Postgres failover
After promoting a replica:
1. Update `DATABASE_URL` in env / secret manager.
2. Restart API + workers. Prisma pool reconnects automatically on new requests.

## Logs
All services emit structured JSON (pino). Required fields: `msg`, `level`, `time`. Requests are logged with `requestId` at the end of each response. Use this `requestId` to correlate across API + workers + provider calls (`ProviderRequest.requestId`).

## Cost-control emergency kill switch
Set `AUTONOMOUS_ENABLED=false` to stop the automation loop from enqueue net-new AI/TTS/render/publish jobs. In-flight jobs will finish.
