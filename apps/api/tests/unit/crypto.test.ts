import { describe, it, expect } from 'vitest';
import {
  hashPassword,
  verifyPassword,
  encryptString,
  decryptString,
  encryptObject,
  decryptObject,
  randomToken,
  hashToken,
  constantTimeEqual,
  generateOAuthState,
} from '../../src/common/utils/crypto.js';

describe('Crypto utility', () => {
  describe('Password hashing (Argon2id)', () => {
    it('hashes passwords using Argon2id format ($argon2id$)', async () => {
      const hash = await hashPassword('SuperSecret123!');
      expect(hash).toContain('$argon2id$');
    });

    it('verifies valid password against generated hash', async () => {
      const plain = 'AnotherValidPassword!456';
      const hash = await hashPassword(plain);
      const ok = await verifyPassword(plain, hash);
      expect(ok).toBe(true);
    });

    it('rejects incorrect password', async () => {
      const hash = await hashPassword('CorrectPass');
      const ok = await verifyPassword('WrongPass', hash);
      expect(ok).toBe(false);
    });
  });

  describe('Encryption at rest (AES-256-GCM)', () => {
    it('encrypts and decrypts arbitrary strings round-trip', () => {
      const secret = 'refresh-token-xyz-12345-oauth';
      const cipher = encryptString(secret);
      expect(cipher).not.toBe(secret);
      expect(typeof cipher).toBe('string');
      const decrypted = decryptString(cipher);
      expect(decrypted).toBe(secret);
    });

    it('encrypts and decrypts typed JSON objects round-trip', () => {
      const obj = { accessToken: 'at_123', expiresAt: 1700000000, scope: ['read', 'write'] };
      const cipher = encryptObject(obj);
      const decrypted = decryptObject<typeof obj>(cipher);
      expect(decrypted).toEqual(obj);
    });

    it('produces different ciphertexts for the same plaintext (random IV)', () => {
      const plain = 'identical-plaintext';
      const c1 = encryptString(plain);
      const c2 = encryptString(plain);
      expect(c1).not.toBe(c2);
      expect(decryptString(c1)).toBe(plain);
      expect(decryptString(c2)).toBe(plain);
    });
  });

  describe('Tokens & constant-time comparison', () => {
    it('generates random tokens with expected entropy', () => {
      const t1 = randomToken(32);
      const t2 = randomToken(32);
      expect(t1).not.toBe(t2);
      expect(t1.length).toBeGreaterThanOrEqual(40); // base64url encoded
    });

    it('hashes tokens deterministically with SHA-256', () => {
      const tok = 'test-token-value';
      const h1 = hashToken(tok);
      const h2 = hashToken(tok);
      expect(h1).toBe(h2);
    });

    it('constantTimeEqual correctly compares equal and non-equal strings', () => {
      expect(constantTimeEqual('matching-string', 'matching-string')).toBe(true);
      expect(constantTimeEqual('string-a', 'string-b')).toBe(false);
      expect(constantTimeEqual('short', 'longer-string')).toBe(false);
    });

    it('generates distinct OAuth state strings', () => {
      const s1 = generateOAuthState();
      const s2 = generateOAuthState();
      expect(s1).not.toBe(s2);
      expect(s1.length).toBeGreaterThanOrEqual(24);
    });
  });
});
