import { ResendEmailProvider } from './ResendEmailProvider.js';
import type { EmailProvider } from './EmailProvider.js';
import { env } from '../../config/env.js';

let instance: EmailProvider | null = null;
export function getEmail(): EmailProvider {
  if (instance) return instance;
  if (env.RESEND_API_KEY) instance = new ResendEmailProvider();
  else throw new Error('Email provider not configured. Set RESEND_API_KEY.');
  return instance;
}

export * from './EmailProvider.js';
export { ResendEmailProvider };
