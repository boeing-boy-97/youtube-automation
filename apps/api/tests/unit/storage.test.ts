import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { LocalStorageProvider } from '../../src/providers/storage/local/local.storage.js';

describe('LocalStorageProvider', () => {
  let tmpDir: string;
  let storage: LocalStorageProvider;

  beforeAll(async () => {
    tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'sf-storage-test-'));
    storage = new LocalStorageProvider(tmpDir);
  });

  afterAll(async () => {
    await fs.rm(tmpDir, { recursive: true, force: true }).catch(() => {});
  });

  it('builds canonical workspace object keys', () => {
    const key = storage.objectKey('wsp_123', 'content', 'cnt_456', 'render.mp4');
    expect(key).toBe('workspaces/wsp_123/content/cnt_456/render.mp4');
  });

  it('writes and retrieves binary buffers correctly', async () => {
    const key = 'test-file.bin';
    const payload = Buffer.from('hello shortforge media');
    const result = await storage.put(key, payload);
    expect(result.key).toBe(key);
    expect(result.size).toBe(payload.length);

    const retrieved = await storage.getBuffer(key);
    expect(retrieved.body).toBeInstanceOf(Buffer);
    expect(retrieved.body.toString('utf8')).toBe('hello shortforge media');
  });

  it('blocks path traversal attacks attempting to escape storage root', async () => {
    const maliciousKey = '../../../../etc/passwd';
    await expect(storage.getBuffer(maliciousKey)).rejects.toThrow('path traversal');
    await expect(storage.put(maliciousKey, Buffer.from('evil'))).rejects.toThrow('path traversal');
  });

  it('generates local public storage URL', () => {
    const url = storage.getPublicUrl('workspaces/wsp_1/video.mp4');
    expect(url).toBe('/storage/workspaces/wsp_1/video.mp4');
  });

  it('deletes an object cleanly', async () => {
    const key = 'to-delete.txt';
    await storage.put(key, Buffer.from('bye'));
    await storage.deleteObject(key);
    await expect(storage.getBuffer(key)).rejects.toThrow();
  });
});
