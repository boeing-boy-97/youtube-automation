export interface Workspace {
  id: string;
  name: string;
  channelName: string;
  channelUrl?: string;
  niche: string;
  subNiche?: string;
  targetAudience: string;
  audienceAge?: string;
  primaryLanguage: string;
  country?: string;
  pillars: ContentPillar[];
  contentRules: ContentRules;
  voice: VoiceConfig;
  brand: BrandConfig;
  publishing: PublishingConfig;
  automationMode: AutomationMode;
  onboardingComplete: boolean;
  createdAt: string;
}

export interface ContentPillar {
  id: string;
  name: string;
  color?: string;
}

export interface ContentRules {
  videoLength: { min: number; max: number };
  postingFrequency: number;
  postingDays: number[];
  dailyLimit: number;
  hookStyle: string;
  ctaStyle: string;
  tone: string;
  vocabularyLevel: string;
}

export interface VoiceConfig {
  provider: string;
  voice: string;
  language: string;
  accent?: string;
  speed: number;
  pitch: number;
  emotion?: string;
}

export interface BrandConfig {
  logoUrl?: string;
  name: string;
  primaryAccent: string;
  captionStyle: string;
  captionPosition: string;
  font: string;
  watermark?: string;
  introUrl?: string;
  outroUrl?: string;
  defaultMusic?: string;
}

export interface PublishingConfig {
  publishTimes: string[];
  timezone: string;
  visibility: 'public' | 'unlisted' | 'private';
  autoPublish: boolean;
  approvalRequired: boolean;
}

export type AutomationMode = 'manual' | 'assisted' | 'autonomous';
