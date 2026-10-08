import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const EnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(4000),
  HOST: z.string().default('0.0.0.0'),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']).default('info'),
  TZ: z.string().default('UTC'),

  DATABASE_URL: z.string().default('postgresql://postgres:postgres@localhost:5432/shortforge'),
  REDIS_URL: z.string().default('redis://localhost:6379'),

  SESSION_SECRET: z.string().min(32, 'SESSION_SECRET must be at least 32 chars').default('dev-only-session-secret-do-not-use-in-prod-please-xxxx'),
  ENCRYPTION_KEY: z.string().default('dev-encryption-key-must-be-32-bytes-minimum-xxxxxxxxxx'),
  ARGON2_PEPPER: z.string().min(16).default('dev-pepper-dev-pepper-dev-pepper'),
  JWT_AUDIENCE: z.string().default('shortforge'),
  JWT_ISSUER: z.string().default('shortforge'),
  JWT_ACCESS_TTL: z.string().default('15m'),
  JWT_REFRESH_TTL: z.string().default('7d'),
  COOKIE_SECURE: z.coerce.boolean().default(false),

  GOOGLE_CLIENT_ID: z.string().default(''),
  GOOGLE_CLIENT_SECRET: z.string().default(''),
  GOOGLE_REDIRECT_URI: z.string().default('http://localhost:5173/youtube/callback'),
  YOUTUBE_API_KEY: z.string().default(''),

  OPENAI_API_KEY: z.string().default(''),
  OPENAI_MODEL: z.string().default('gpt-4o-mini'),

  ELEVENLABS_API_KEY: z.string().default(''),
  ELEVENLABS_VOICE_ID: z.string().default(''),

  S3_ENDPOINT: z.string().default(''),
  S3_REGION: z.string().default('auto'),
  S3_ACCESS_KEY_ID: z.string().default(''),
  S3_SECRET_ACCESS_KEY: z.string().default(''),
  S3_BUCKET: z.string().default('shortforge'),
  S3_PUBLIC_URL: z.string().default(''),
  S3_CDN_URL: z.string().default(''),
  STORAGE_PROVIDER: z.enum(['s3', 'local']).default('local'),
  STORAGE_LOCAL_DIR: z.string().default('./storage'),

  RESEND_API_KEY: z.string().default(''),
  EMAIL_FROM: z.string().default('ShortForge <noreply@shortforge.app>'),

  STRIPE_SECRET_KEY: z.string().default(''),
  STRIPE_WEBHOOK_SECRET: z.string().default(''),
  STRIPE_PRICE_STARTER: z.string().default(''),
  STRIPE_PRICE_PRO: z.string().default(''),

  FFMPEG_PATH: z.string().default('ffmpeg'),
  FFPROBE_PATH: z.string().default('ffprobe'),
  FFMPEG_WORKDIR: z.string().default('/tmp/shortforge-renders'),

  APP_URL: z.string().default('http://localhost:5173'),
  API_URL: z.string().default('http://localhost:4000'),
  API_BASE_URL: z.string().default('http://localhost:4000'),
  FRONTEND_URL: z.string().default('http://localhost:5173'),
  CORS_ORIGIN: z.string().default('http://localhost:5173,http://localhost:4000'),

  MAX_UPLOAD_MB: z.coerce.number().int().positive().default(500),
  RATE_LIMIT_MAX: z.coerce.number().int().positive().default(300),
  RATE_LIMIT_WINDOW_SEC: z.coerce.number().int().positive().default(60),
  DAILY_PUBLISH_LIMIT: z.coerce.number().int().positive().default(10),
  JOBS_CONCURRENCY: z.coerce.number().int().positive().default(4),
  RENDER_CONCURRENCY: z.coerce.number().int().positive().default(2),

  WORKER_ENABLED: z.string().default('true'),

  DEMO_MODE: z.coerce.boolean().default(false),
});

function parseEnv() {
  const result = EnvSchema.safeParse(process.env);
  if (!result.success) {
    console.error('❌ Invalid environment configuration:');
    for (const issue of result.error.issues) {
      console.error(`  - ${issue.path.join('.')}: ${issue.message}`);
    }
    if (process.env.NODE_ENV === 'production') process.exit(1);
  }
  const cfg = result.success ? result.data : (EnvSchema.parse({}) as z.infer<typeof EnvSchema>);
  return cfg;
}

export const env = parseEnv();
export const isDev = env.NODE_ENV === 'development';
export const isTest = env.NODE_ENV === 'test';
export const isProduction = env.NODE_ENV === 'production';

// Fail fast in production if required external credentials are missing
export function assertRequiredProductionProviders() {
  if (!isProduction) return;
  const missing: string[] = [];
  if (!env.GOOGLE_CLIENT_ID || !env.GOOGLE_CLIENT_SECRET) missing.push('Google OAuth');
  if (!env.OPENAI_API_KEY) missing.push('OpenAI');
  if (!env.ELEVENLABS_API_KEY) missing.push('ElevenLabs');
  if (!env.S3_ACCESS_KEY_ID || !env.S3_SECRET_ACCESS_KEY) missing.push('S3');
  if (missing.length) {
    console.error(`❌ Production requires configured providers: ${missing.join(', ')}`);
    process.exit(1);
  }
}

export default env;
