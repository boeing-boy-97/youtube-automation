import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const signupSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const channelSchema = z.object({
  channelName: z.string().min(2, 'Channel name is required'),
  channelUrl: z.string().url('Please enter a valid URL').optional().or(z.literal('')),
  niche: z.string().min(2, 'Niche is required'),
  targetAudience: z.string().min(2, 'Target audience is required'),
  primaryLanguage: z.string().min(2, 'Language is required'),
});

export const contentStrategySchema = z.object({
  pillars: z.array(z.string()).min(1, 'Select at least one content pillar'),
});

export const contentRulesSchema = z.object({
  videoLength: z.object({
    min: z.number().min(5).max(300),
    max: z.number().min(5).max(600),
  }),
  postingFrequency: z.number().min(1).max(21),
  dailyLimit: z.number().min(1).max(10),
  hookStyle: z.string(),
  ctaStyle: z.string(),
  tone: z.string(),
  vocabularyLevel: z.string(),
});

export const voiceConfigSchema = z.object({
  provider: z.string(),
  voice: z.string(),
  language: z.string(),
  speed: z.number().min(0.5).max(2),
  pitch: z.number().min(0.5).max(2),
});

export const brandSchema = z.object({
  name: z.string().min(1, 'Brand name is required'),
  primaryAccent: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid color'),
  captionStyle: z.string(),
  font: z.string(),
});

export const publishingSchema = z.object({
  publishTimes: z.array(z.string()).min(1, 'Select at least one publish time'),
  timezone: z.string(),
  visibility: z.enum(['public', 'unlisted', 'private']),
  autoPublish: z.boolean(),
  approvalRequired: z.boolean(),
});

export const ideaGenerateSchema = z.object({
  topic: z.string().optional(),
  audience: z.string().min(2, 'Describe your audience'),
  niche: z.string().min(2, 'Select a niche'),
  pillar: z.string().optional(),
  tone: z.string().optional(),
  count: z.number().min(1).max(20),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type SignupInput = z.infer<typeof signupSchema>;
export type ChannelInput = z.infer<typeof channelSchema>;
