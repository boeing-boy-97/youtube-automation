import { describe, it, expect } from 'vitest';
import { newId, type IdPrefix } from '../../src/common/utils/ids.js';

describe('ID generator utility', () => {
  const prefixes: IdPrefix[] = [
    'usr', 'wsp', 'cnt', 'scr', 'voi', 'ast', 'vpr', 'pub', 'anx', 'idk',
  ];

  it('prefixes generated IDs with the requested domain prefix', () => {
    for (const prefix of prefixes) {
      const id = newId(prefix);
      expect(id.startsWith(`${prefix}_`)).toBe(true);
    }
  });

  it('generates unique IDs across successive calls', () => {
    const set = new Set<string>();
    const count = 1000;
    for (let i = 0; i < count; i++) {
      set.add(newId('cnt'));
    }
    expect(set.size).toBe(count);
  });

  it('generates IDs of expected format without ambiguous characters', () => {
    const id = newId('usr');
    const [, suffix] = id.split('_');
    expect(suffix).toBeDefined();
    expect(suffix.length).toBe(24);
    // Nanoid alphabet uses: 0123456789abcdefghjkmnpqrstvwxyz (no l, o, u, i to prevent look-alike mistakes)
    expect(suffix).toMatch(/^[0-9a-z]+$/);
    expect(suffix).not.toMatch(/[loi]/);
  });
});
