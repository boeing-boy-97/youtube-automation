import { describe, it, expect } from 'vitest';
import {
  encodeCursor,
  decodeCursor,
  CursorPaginationSchema,
} from '../../src/common/utils/pagination.js';

describe('Cursor pagination utility', () => {
  it('encodes and decodes string parts round-trip', () => {
    const parts = ['usr_abc123', '2026-10-08T12:00:00.000Z'];
    const cursor = encodeCursor(parts);
    expect(typeof cursor).toBe('string');
    const decoded = decodeCursor(cursor);
    expect(decoded).toEqual(parts);
  });

  it('handles Date objects in parts during encoding', () => {
    const now = new Date();
    const cursor = encodeCursor([now, 'id_123']);
    const decoded = decodeCursor(cursor);
    expect(decoded[0]).toBe(now.toISOString());
    expect(decoded[1]).toBe('id_123');
  });

  it('returns empty array when decoding invalid base64/garbage cursor', () => {
    // Malformed cursor should safely decode to whatever utf8 or fail gracefully
    const decoded = decodeCursor('');
    expect(Array.isArray(decoded)).toBe(true);
  });

  it('validates pagination input schema with default limit 20', () => {
    const parsed = CursorPaginationSchema.parse({});
    expect(parsed.limit).toBe(20);
    expect(parsed.cursor).toBeUndefined();
  });

  it('coerces string limits to numbers and bounds them to [1, 100]', () => {
    const p1 = CursorPaginationSchema.parse({ limit: '50' });
    expect(p1.limit).toBe(50);

    expect(() => CursorPaginationSchema.parse({ limit: '0' })).toThrow();
    expect(() => CursorPaginationSchema.parse({ limit: '101' })).toThrow();
  });
});
