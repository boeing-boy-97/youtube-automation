import crypto from 'node:crypto';
import argon2 from 'argon2';
import { env } from '../../config/env.js';

const ARGON2_OPTIONS = {
  type: argon2.argon2id,
  memoryCost: 1 << 16, // 64 MB
  timeCost: 3,
  parallelism: 1,
  secret: Buffer.from(env.ARGON2_PEPPER),
} as const;

export async function hashPassword(plain: string): Promise<string> {
  return argon2.hash(plain, ARGON2_OPTIONS);
}

export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  try {
    return await argon2.verify(hash, plain, { secret: Buffer.from(env.ARGON2_PEPPER) });
  } catch {
    return false;
  }
}

// Encryption for OAuth tokens and other secrets at rest (AES-256-GCM)
const ALG = 'aes-256-gcm';
function encryptionKey(): Buffer {
  const key = env.ENCRYPTION_KEY || env.SESSION_SECRET;
  return crypto.createHash('sha256').update(key).digest();
}

export function encryptString(plain: string): string {
  const iv = crypto.randomBytes(12);
  const key = encryptionKey();
  const cipher = crypto.createCipheriv(ALG, key, iv);
  const enc = Buffer.concat([cipher.update(plain, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, enc]).toString('base64url');
}

export function decryptString(payload: string): string {
  const key = encryptionKey();
  const buf = Buffer.from(payload, 'base64url');
  const iv = buf.subarray(0, 12);
  const tag = buf.subarray(12, 28);
  const enc = buf.subarray(28);
  const dec = crypto.createDecipheriv(ALG, key, iv);
  dec.setAuthTag(tag);
  return Buffer.concat([dec.update(enc), dec.final()]).toString('utf8');
}

export function encryptObject<T>(o: T): string {
  return encryptString(JSON.stringify(o));
}
export function decryptObject<T = unknown>(payload: string): T {
  return JSON.parse(decryptString(payload)) as T;
}

// Random tokens
export function randomToken(bytes = 32): string {
  return crypto.randomBytes(bytes).toString('base64url');
}

export function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('base64url');
}

export function constantTimeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ab.length !== bb.length) return false;
  return crypto.timingSafeEqual(ab, bb);
}

// CSRF state for OAuth flows
export function generateOAuthState(): string {
  return randomToken(24);
}
