import { prisma } from '../database/prisma.js';
import { newId } from '../common/utils/ids.js';
import type { Prisma } from '@prisma/client';

export interface TrackedCallOpts {
  provider: string;
  operation: string;
  model?: string;
  workspaceId?: string;
  userId?: string;
  requestId?: string;
  traceId?: string;
}

export async function trackProviderCall<T>(
  opts: TrackedCallOpts,
  fn: () => Promise<{ result: T; usage?: { inputTokens?: number; outputTokens?: number; durationMs?: number; charCount?: number; sizeBytes?: number; estimatedCost?: number; errorCode?: never } }>,
): Promise<T> {
  const start = Date.now();
  const id = newId('prq');
  try {
    const out = await fn();
    const latencyMs = Date.now() - start;
    const u = out.usage || {};
    await prisma.providerRequest.create({
      data: {
        id,
        provider: opts.provider,
        operation: opts.operation,
        model: opts.model,
        requestId: opts.requestId,
        traceId: opts.traceId,
        workspaceId: opts.workspaceId,
        userId: opts.userId,
        status: 'ok',
        latencyMs,
        inputTokens: u.inputTokens ?? 0,
        outputTokens: u.outputTokens ?? 0,
        estimatedCost: u.estimatedCost ?? 0,
      },
    });
    await recordUsage({
      workspaceId: opts.workspaceId,
      provider: opts.provider,
      operation: opts.operation,
      model: opts.model,
      inputTokens: u.inputTokens ?? 0,
      outputTokens: u.outputTokens ?? 0,
      durationMs: u.durationMs ?? latencyMs,
      charCount: u.charCount ?? 0,
      sizeBytes: u.sizeBytes ?? 0,
      estimatedCost: u.estimatedCost ?? 0,
      errors: 0,
    });
    return out.result;
  } catch (err) {
    const latencyMs = Date.now() - start;
    const e = err as { code?: string; message?: string };
    await prisma.providerRequest.create({
      data: {
        id,
        provider: opts.provider,
        operation: opts.operation,
        model: opts.model,
        requestId: opts.requestId,
        traceId: opts.traceId,
        workspaceId: opts.workspaceId,
        userId: opts.userId,
        status: 'error',
        latencyMs,
        errorCode: e?.code || 'UNKNOWN',
        errorMessage: e?.message,
      },
    });
    await recordUsage({
      workspaceId: opts.workspaceId,
      provider: opts.provider,
      operation: opts.operation,
      model: opts.model,
      inputTokens: 0, outputTokens: 0,
      durationMs: latencyMs,
      charCount: 0, sizeBytes: 0, estimatedCost: 0,
      errors: 1,
    });
    throw err;
  }
}

async function recordUsage(u: {
  workspaceId?: string; provider: string; operation: string; model?: string;
  inputTokens: number; outputTokens: number; durationMs: number;
  charCount: number; sizeBytes: number; estimatedCost: number; errors: number;
}) {
  if (!u.workspaceId) return;
  const now = new Date();
  const periodStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const periodEnd = new Date(periodStart.getTime() + 24 * 3600_000);
  const key = { provider_operation_model_workspaceId_periodStart: {
    provider: u.provider, operation: u.operation, model: u.model || '', workspaceId: u.workspaceId!, periodStart,
  } };
  try {
    await prisma.providerUsage.upsert({
      where: {
        provider_operation_model_workspaceId_periodStart: {
          provider: u.provider, operation: u.operation, model: u.model || '', workspaceId: u.workspaceId!, periodStart,
        },
      } as Prisma.ProviderUsageUpsertArgs['where'],
      create: {
        id: newId('pru'),
        provider: u.provider, operation: u.operation, model: u.model, workspaceId: u.workspaceId!,
        periodStart, periodEnd, calls: 1,
        inputTokens: u.inputTokens, outputTokens: u.outputTokens,
        durationMs: u.durationMs, totalCost: u.estimatedCost, errors: u.errors,
      },
      update: {
        calls: { increment: 1 },
        inputTokens: { increment: u.inputTokens },
        outputTokens: { increment: u.outputTokens },
        durationMs: { increment: u.durationMs },
        totalCost: { increment: u.estimatedCost },
        errors: { increment: u.errors },
        updatedAt: new Date(),
      },
    });
    // Also write to UsageRecord (line-item history)
    await prisma.usageRecord.create({
      data: {
        id: newId('urg'),
        workspaceId: u.workspaceId!,
        provider: u.provider,
        operation: u.operation,
        model: u.model,
        inputTokens: u.inputTokens,
        outputTokens: u.outputTokens,
        durationMs: u.durationMs,
        charCount: u.charCount,
        sizeBytes: u.sizeBytes,
        estimatedCost: u.estimatedCost,
        status: u.errors > 0 ? 'error' : 'ok',
      },
    });
  } catch (err) {
    // Don't fail the primary operation if telemetry fails
    // eslint-disable-next-line no-console
    console.warn('trackUsage failed', (err as Error).message);
  }
}
