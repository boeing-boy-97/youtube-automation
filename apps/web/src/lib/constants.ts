import { ContentPillar, ContentRules, VoiceConfig, BrandConfig, PublishingConfig } from '../types/workspace';

export const STORAGE_KEYS = {
  user: 'shortforge_user',
  session: 'shortforge_session',
  workspace: 'shortforge_workspace',
  content: 'shortforge_content',
  ideas: 'shortforge_ideas',
  jobs: 'shortforge_jobs',
  automation: 'shortforge_automation',
  notifications: 'shortforge_notifications',
  analytics: 'shortforge_analytics',
  theme: 'shortforge_theme',
  sidebarCollapsed: 'shortforge_sidebar_collapsed',
  youtube: 'shortforge_youtube',
  onboarding: 'shortforge_onboarding',
} as const;

export const DEFAULT_PILLARS: ContentPillar[] = [
  { id: 'pillar_ai_tools', name: 'AI Tools', color: 'hsl(155,43%,38%)' },
  { id: 'pillar_ai_news', name: 'AI News', color: 'hsl(200,80%,48%)' },
  { id: 'pillar_tutorials', name: 'Tutorials', color: 'hsl(38,90%,48%)' },
  { id: 'pillar_explainers', name: 'Explainers', color: 'hsl(280,50%,55%)' },
];

export const DEFAULT_CONTENT_RULES: ContentRules = {
  videoLength: { min: 30, max: 60 },
  postingFrequency: 5,
  postingDays: [1, 2, 3, 4, 5],
  dailyLimit: 2,
  hookStyle: 'question',
  ctaStyle: 'subscribe',
  tone: 'professional',
  vocabularyLevel: 'intermediate',
};

export const DEFAULT_VOICE: VoiceConfig = {
  provider: 'elevenlabs',
  voice: 'Antoni',
  language: 'en',
  accent: 'us',
  speed: 1,
  pitch: 1,
  emotion: 'confident',
};

export const DEFAULT_BRAND: BrandConfig = {
  name: '',
  primaryAccent: '#1a7d4c',
  captionStyle: 'bold',
  captionPosition: 'bottom',
  font: 'Inter',
  defaultMusic: 'ambient',
};

export const DEFAULT_PUBLISHING: PublishingConfig = {
  publishTimes: ['19:30'],
  timezone: 'Asia/Kolkata',
  visibility: 'public',
  autoPublish: false,
  approvalRequired: true,
};

export const PIPELINE_STAGES = [
  { key: 'idea', label: 'Idea' },
  { key: 'script', label: 'Script' },
  { key: 'voice', label: 'Voice' },
  { key: 'visuals', label: 'Visuals' },
  { key: 'rendering', label: 'Edit' },
  { key: 'qc', label: 'QC' },
  { key: 'approval', label: 'Approval' },
  { key: 'scheduling', label: 'Scheduled' },
  { key: 'publishing', label: 'Published' },
] as const;

export const CONTENT_CATEGORIES = [
  'Educational',
  'Entertainment',
  'Motivation',
  'Technology',
  'Business',
  'Fitness',
  'Facts',
  'Storytelling',
  'News',
  'Tutorials',
] as const;

export const HOOK_STYLES = [
  { value: 'question', label: 'Question' },
  { value: 'shock', label: 'Shocking Stat' },
  { value: 'story', label: 'Story' },
  { value: 'contrarian', label: 'Contrarian' },
  { value: 'tutorial', label: 'How-to' },
  { value: 'list', label: 'List' },
] as const;

export const CTA_STYLES = [
  { value: 'subscribe', label: 'Subscribe' },
  { value: 'like', label: 'Like & Follow' },
  { value: 'comment', label: 'Comment' },
  { value: 'watch_next', label: 'Watch Next' },
  { value: 'link', label: 'Link in Bio' },
] as const;

export const TONES = [
  { value: 'professional', label: 'Professional' },
  { value: 'casual', label: 'Casual' },
  { value: 'energetic', label: 'Energetic' },
  { value: 'calm', label: 'Calm' },
  { value: 'dramatic', label: 'Dramatic' },
  { value: 'humorous', label: 'Humorous' },
] as const;

export const VOCAB_LEVELS = [
  { value: 'simple', label: 'Simple' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
] as const;

export const PROVIDERS = {
  ai: [
    { id: 'openai', name: 'OpenAI', status: 'connected' as const },
    { id: 'anthropic', name: 'Anthropic', status: 'connected' as const },
    { id: 'google', name: 'Google AI', status: 'disconnected' as const },
  ],
  voice: [
    { id: 'elevenlabs', name: 'ElevenLabs', status: 'connected' as const },
    { id: 'openai-tts', name: 'OpenAI TTS', status: 'connected' as const },
  ],
  visual: [
    { id: 'midjourney', name: 'Midjourney', status: 'connected' as const },
    { id: 'dalle', name: 'DALL-E 3', status: 'connected' as const },
    { id: 'runway', name: 'Runway', status: 'disconnected' as const },
  ],
  video: [
    { id: 'remotion', name: 'Remotion', status: 'connected' as const },
    { id: 'shotstack', name: 'Shotstack', status: 'connected' as const },
  ],
};

export const VOICE_PRESETS = [
  { id: 'antoni', name: 'Antoni', gender: 'male', description: 'Warm, confident American male' },
  { id: 'rachel', name: 'Rachel', gender: 'female', description: 'Clear, professional American female' },
  { id: 'josh', name: 'Josh', gender: 'male', description: 'Young, energetic male voice' },
  { id: 'sarah', name: 'Sarah', gender: 'female', description: 'Friendly, approachable female' },
  { id: 'adam', name: 'Adam', gender: 'male', description: 'Deep, authoritative male' },
  { id: 'bella', name: 'Bella', gender: 'female', description: 'Young, engaging female' },
];

export const CAPTION_PRESETS = [
  { id: 'minimal', name: 'Minimal', description: 'Clean white text, no background' },
  { id: 'bold', name: 'Bold', description: 'Large bold text with highlight' },
  { id: 'karaoke', name: 'Karaoke', description: 'Word-by-word highlight' },
  { id: 'highlight', name: 'Highlight', description: 'Key words emphasized' },
  { id: 'clean', name: 'Clean', description: 'Subtle background, rounded' },
];

export const DAYS_OF_WEEK = [
  { value: 0, label: 'Sun' },
  { value: 1, label: 'Mon' },
  { value: 2, label: 'Tue' },
  { value: 3, label: 'Wed' },
  { value: 4, label: 'Thu' },
  { value: 5, label: 'Fri' },
  { value: 6, label: 'Sat' },
];

export const PLANS = [
  {
    id: 'starter',
    name: 'Starter',
    price: 0,
    description: 'Perfect for getting started',
    features: ['5 videos per month', 'Basic automation', '720p rendering', '1 channel'],
    limits: { videos: 5, rendering: '720p', channels: 1 },
  },
  {
    id: 'creator',
    name: 'Creator',
    price: 29,
    description: 'For serious content creators',
    features: ['50 videos per month', 'Full automation', '1080p rendering', '3 channels', 'Priority rendering', 'Analytics'],
    limits: { videos: 50, rendering: '1080p', channels: 3 },
    popular: true,
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 79,
    description: 'For agencies and power users',
    features: ['Unlimited videos', 'Autonomous mode', '4K rendering', 'Unlimited channels', 'API access', 'Custom branding'],
    limits: { videos: Infinity, rendering: '4K', channels: Infinity },
  },
];
