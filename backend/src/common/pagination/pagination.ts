import { z } from 'zod';

export const CursorPaginationSchema = z.object({
  cursor: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export type CursorPagination = z.infer<typeof CursorPaginationSchema>;

export interface Page<T> {
  data: T[];
  meta: { cursor?: string; nextCursor?: string; limit: number; hasMore: boolean; total?: number };
}

const CURSOR_SEP = '~';

export function encodeCursor(parts: Array<string | number | Date>): string {
  return Buffer.from(parts.map((p) => p instanceof Date ? p.toISOString() : String(p)).join(CURSOR_SEP)).toString('base64url');
}

export function decodeCursor(cursor: string): string[] {
  try {
    return Buffer.from(cursor, 'base64url').toString('utf8').split(CURSOR_SEP);
  } catch {
    return [];
  }
}
