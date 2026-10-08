import { ContentItem, Idea, Scene } from '../types/content';
import { uid, randomBetween, generateSparkline } from '../lib/utils';
import { WorkflowNode, WorkflowEdge, Notification } from '../types/automation';
import { Template } from '../types/production';
import { Insight, TopicPerformance, AnalyticsOverview, ChartPoint, LearnedPreferences, HeatmapCell, ContentPerformance } from '../types/analytics';
import { YouTubeChannel, RecentUpload } from '../types/youtube';

const GRADIENTS = [
  'from-emerald-900 via-emerald-800 to-teal-700',
  'from-slate-800 via-slate-700 to-zinc-600',
  'from-teal-900 via-emerald-800 to-green-700',
  'from-gray-900 via-emerald-900 to-teal-800',
  'from-zinc-800 via-stone-700 to-emerald-900',
  'from-emerald-800 via-green-700 to-lime-600',
  'from-slate-900 via-gray-800 to-slate-700',
  'from-teal-800 via-cyan-700 to-emerald-600',
];

function makeScenes(title: string): Scene[] {
  return [
    { id: uid('scene'), index: 0, title: 'Hook', type: 'hook', script: `Did you know about ${title.toLowerCase()}? This changes everything.`, duration: 5, visualStatus: 'ready' },
    { id: uid('scene'), index: 1, title: 'The Problem', type: 'content', script: 'Most people are approaching this completely wrong...', duration: 8, visualStatus: 'ready' },
    { id: uid('scene'), index: 2, title: 'Point 1', type: 'content', script: 'First, here is what you need to understand.', duration: 10, visualStatus: 'ready' },
    { id: uid('scene'), index: 3, title: 'Point 2', type: 'content', script: 'Second, this is where the real power is.', duration: 12, visualStatus: 'ready' },
    { id: uid('scene'), index: 4, title: 'CTA', type: 'cta', script: 'Follow for more AI tools and tutorials.', duration: 5, visualStatus: 'ready' },
  ];
}

function daysAgo(days: number): string {
  return new Date(Date.now() - days * 86400000).toISOString();
}

function daysFromNow(days: number): string {
  return new Date(Date.now() + days * 86400000).toISOString();
}

export const seedIdeas = (): Idea[] => [
  { id: uid('idea'), title: '5 AI Tools Students Should Know in 2026', hook: 'Students are using these AI tools to cut study time in half', angle: 'Student productivity with AI', pillar: 'AI Tools', whyItWorks: 'Targets student demographic, utility-focused, high share potential', suggestedDuration: 48, cta: 'Save for later', potential: 92, freshness: 85, difficulty: 2, estimatedRetention: 78, source: 'Trending analysis', status: 'trending', createdAt: daysAgo(1) },
  { id: uid('idea'), title: 'Why AI Agents Are Changing Software Development', hook: 'AI agents just replaced an entire dev team for one task', angle: 'AI agents impact on coding', pillar: 'AI News', whyItWorks: 'Controversial angle drives engagement, tech audience overlap', suggestedDuration: 55, cta: 'Follow for updates', potential: 88, freshness: 95, difficulty: 3, estimatedRetention: 72, source: 'Competitor analysis', status: 'saved', createdAt: daysAgo(2) },
  { id: uid('idea'), title: '3 Free AI Tools That Save Hours Every Week', hook: 'These free AI tools just saved me 10 hours this week', angle: 'Free AI utility tools', pillar: 'AI Tools', whyItWorks: 'Free tools have high click-through, list format performs well', suggestedDuration: 42, cta: 'Link in bio', potential: 95, freshness: 70, difficulty: 1, estimatedRetention: 82, source: 'Generated', status: 'generated', createdAt: daysAgo(1) },
  { id: uid('idea'), title: 'AI vs Traditional Search: What\'s Actually Changing?', hook: 'Google search is dying and here is what replaces it', angle: 'AI search disruption', pillar: 'AI News', whyItWorks: 'Trending topic with strong opinions', suggestedDuration: 52, cta: 'Comment your thoughts', potential: 85, freshness: 90, difficulty: 3, estimatedRetention: 68, source: 'Trend detection', status: 'trending', createdAt: daysAgo(0) },
  { id: uid('idea'), title: 'How ChatGPT Agents Work in 45 Seconds', hook: 'ChatGPT agents explained like you are five', angle: 'Simple AI explanation', pillar: 'Tutorials', whyItWorks: 'Short educational content performs well with algorithm', suggestedDuration: 45, cta: 'Follow for more', potential: 90, freshness: 80, difficulty: 2, estimatedRetention: 85, source: 'Generated', status: 'saved', createdAt: daysAgo(3) },
  { id: uid('idea'), title: 'The AI Skill That Will Be Worth $200k in 2027', hook: 'Nobody is talking about this AI skill yet', angle: 'AI career insight', pillar: 'Explainers', whyItWorks: 'Career/future angle has high curiosity gap', suggestedDuration: 50, cta: 'Save this post', potential: 93, freshness: 88, difficulty: 3, estimatedRetention: 75, source: 'Trend analysis', status: 'trending', createdAt: daysAgo(0) },
  { id: uid('idea'), title: 'Stop Using ChatGPT Wrong — Do This Instead', hook: '90% of people use ChatGPT completely wrong', angle: 'ChatGPT tips', pillar: 'Tutorials', whyItWorks: 'Contrarian hook, practical value', suggestedDuration: 38, cta: 'Like & save', potential: 87, freshness: 60, difficulty: 1, estimatedRetention: 70, source: 'Performance pattern', status: 'generated', createdAt: daysAgo(2) },
  { id: uid('idea'), title: 'I Tried 50 AI Tools — These 3 Are Actually Worth It', hook: 'I tested every AI tool so you do not have to', angle: 'Curated AI tool review', pillar: 'AI Tools', whyItWorks: 'Curated list format, trust-building through testing', suggestedDuration: 58, cta: 'Comment your favorite', potential: 91, freshness: 75, difficulty: 4, estimatedRetention: 76, source: 'Generated', status: 'rejected', createdAt: daysAgo(5) },
  { id: uid('idea'), title: 'The Future of Programming Is Not Coding', hook: 'In 5 years, coding will look completely different', angle: 'Future of development', pillar: 'Explainers', whyItWorks: 'Thought leadership, debate-driving', suggestedDuration: 53, cta: 'Follow for updates', potential: 89, freshness: 82, difficulty: 4, estimatedRetention: 65, source: 'Trend detection', status: 'used', createdAt: daysAgo(8) },
  { id: uid('idea'), title: 'One AI Prompt That Does The Work of 10 People', hook: 'This AI prompt is worth 10 employees', angle: 'Powerful prompt sharing', pillar: 'Tutorials', whyItWorks: 'High utility, shareable, immediate value', suggestedDuration: 40, cta: 'Copy this prompt', potential: 96, freshness: 92, difficulty: 1, estimatedRetention: 88, source: 'Generated', status: 'generated', createdAt: daysAgo(0) },
];

export const seedContent = (): ContentItem[] => {
  const items: ContentItem[] = [];

  // Published videos (5)
  const publishedTitles = [
    'I Tried 50 AI Tools — These 3 Are Actually Worth It',
    'The Future of Programming Is Not Coding',
    'Stop Using ChatGPT Wrong — Do This Instead',
    'How AI Actually Works in 60 Seconds',
    'Top 3 AI Websites You Did Not Know Existed',
  ];
  publishedTitles.forEach((title, i) => {
    const daysPublished = [5, 12, 20, 35, 48][i];
    const baseViews = [47000, 32000, 89000, 15000, 62000][i];
    items.push({
      id: uid('content'),
      title,
      hook: title + ' - this is what you need to know',
      pillar: i % 2 === 0 ? 'AI Tools' : 'Explainers',
      pillarId: i % 2 === 0 ? 'pillar_ai_tools' : 'pillar_explainers',
      status: 'published',
      duration: randomBetween(35, 58),
      thumbnailGradient: GRADIENTS[i % GRADIENTS.length],
      script: { id: uid('script'), content: '', wordCount: 120, charCount: 650, hookStrength: 85, ctaStrength: 80, readability: 78, estimatedDuration: 45, versions: [] },
      voiceStatus: 'ready',
      visuals: makeScenes(title),
      description: `In this video, we cover ${title.toLowerCase()}. Follow for daily AI content.`,
      hashtags: ['#ai', '#tech', '#shorts', '#aitools'],
      cta: 'Follow for more AI content',
      qualityScore: { overall: randomBetween(85, 96), hook: randomBetween(82, 95), script: randomBetween(80, 94), voice: randomBetween(85, 97), visuals: randomBetween(82, 94), captions: randomBetween(88, 96), brand: randomBetween(90, 98), publishReadiness: randomBetween(85, 95) },
      publishedAt: daysAgo(daysPublished),
      scheduledAt: daysAgo(daysPublished),
      youtubeId: `yt_${uid()}`,
      youtubeUrl: 'https://youtube.com/shorts/demo',
      views: baseViews,
      likes: Math.round(baseViews * randomBetween(4, 9) / 100),
      comments: Math.round(baseViews * randomBetween(0.5, 2) / 100),
      shares: Math.round(baseViews * randomBetween(1, 4) / 100),
      retention: randomBetween(55, 82),
      watchTime: Math.round(baseViews * 0.7),
      subscribersGained: Math.round(baseViews * randomBetween(0.3, 1.2) / 100),
      createdAt: daysAgo(daysPublished + 2),
      updatedAt: daysAgo(daysPublished),
      createdBy: 'user',
      activity: [
        { id: uid('act'), type: 'publish_completed', message: 'Video published to YouTube', timestamp: daysAgo(daysPublished) },
      ],
    });
  });

  // Scheduled (4)
  const scheduledTitles = [
    '5 AI Tools Students Should Know in 2026',
    'Why AI Agents Are Changing Software Development',
    'How ChatGPT Agents Work in 45 Seconds',
    'The AI Skill That Will Be Worth $200k in 2027',
  ];
  scheduledTitles.forEach((title, i) => {
    const schedDays = [1, 2, 4, 6][i];
    items.push({
      id: uid('content'),
      title,
      hook: title,
      pillar: ['AI Tools', 'AI News', 'Tutorials', 'Explainers'][i],
      status: 'scheduled',
      duration: randomBetween(40, 55),
      thumbnailGradient: GRADIENTS[(i + 3) % GRADIENTS.length],
      script: { id: uid('script'), content: `[HOOK]\n${title}\n\n[BODY]\nLet me show you exactly what this means...\n\n[CTA]\nFollow for more AI tools and tutorials every day.`, wordCount: 115, charCount: 620, hookStrength: 88, ctaStrength: 82, readability: 82, estimatedDuration: 48, versions: [] },
      voiceStatus: 'ready',
      visuals: makeScenes(title),
      description: `${title} - Watch to learn more.`,
      hashtags: ['#ai', '#tech', '#shorts'],
      cta: 'Follow for more',
      qualityScore: { overall: randomBetween(88, 95), hook: randomBetween(85, 96), script: randomBetween(84, 93), voice: randomBetween(88, 96), visuals: randomBetween(85, 94), captions: randomBetween(90, 97), brand: randomBetween(90, 98), publishReadiness: randomBetween(90, 96) },
      scheduledAt: daysFromNow(schedDays),
      createdAt: daysAgo(schedDays + 1),
      updatedAt: daysAgo(1),
      createdBy: 'user',
      activity: [
        { id: uid('act'), type: 'scheduled', message: `Scheduled for publishing`, timestamp: daysAgo(1) },
      ],
    });
  });

  // Rendering
  items.push({
    id: uid('content'),
    title: '3 Free AI Tools That Save Hours Every Week',
    hook: 'These free AI tools just saved me 10 hours this week',
    pillar: 'AI Tools',
    pillarId: 'pillar_ai_tools',
    status: 'rendering',
    progress: 64,
    estimatedDuration: 42,
    thumbnailGradient: GRADIENTS[2],
    script: { id: uid('script'), content: 'Script content here...', wordCount: 108, charCount: 580, hookStrength: 91, ctaStrength: 85, readability: 80, estimatedDuration: 42, versions: [] },
    voiceStatus: 'ready',
    visuals: makeScenes('3 Free AI Tools'),
    cta: 'Link in bio',
    goal: 'reach',
    audience: 'Professionals and students',
    qualityScore: { overall: 0, hook: 91, script: 86, voice: 92, visuals: 84, captions: 0, brand: 95, publishReadiness: 0 },
    createdAt: daysAgo(0),
    updatedAt: new Date().toISOString(),
    createdBy: 'user',
    activity: [
      { id: uid('act'), type: 'render_started', message: 'Rendering started', timestamp: new Date(Date.now() - 120000).toISOString() },
    ],
  });

  // In review
  items.push({
    id: uid('content'),
    title: 'AI vs Traditional Search: What\'s Actually Changing?',
    hook: 'Google search is dying and here is what replaces it',
    pillar: 'AI News',
    status: 'review',
    duration: 52,
    thumbnailGradient: GRADIENTS[4],
    script: { id: uid('script'), content: 'Script content...', wordCount: 135, charCount: 720, hookStrength: 86, ctaStrength: 78, readability: 75, estimatedDuration: 52, versions: [] },
    voiceStatus: 'ready',
    visuals: makeScenes('AI vs Search'),
    qualityScore: { overall: 88, hook: 86, script: 82, voice: 91, visuals: 85, captions: 90, brand: 93, publishReadiness: 87 },
    qcStatus: { score: 92, status: 'ready', checks: [
      { id: uid('qc'), name: 'Resolution', status: 'pass' },
      { id: uid('qc'), name: 'Aspect ratio', status: 'pass' },
      { id: uid('qc'), name: 'Audio', status: 'pass' },
      { id: uid('qc'), name: 'Duration', status: 'pass' },
      { id: uid('qc'), name: 'Subtitle coverage', status: 'pass' },
      { id: uid('qc'), name: 'Brand consistency', status: 'pass' },
    ], completedAt: daysAgo(0) },
    createdAt: daysAgo(1),
    updatedAt: daysAgo(0),
    createdBy: 'user',
    activity: [],
    riskFlags: ['Title may be considered controversial'],
  });

  // Approved
  items.push({
    id: uid('content'),
    title: 'One AI Prompt That Does The Work of 10 People',
    hook: 'This AI prompt is worth 10 employees',
    pillar: 'Tutorials',
    status: 'approved',
    duration: 40,
    thumbnailGradient: GRADIENTS[7],
    script: { id: uid('script'), content: 'Script...', wordCount: 102, charCount: 540, hookStrength: 94, ctaStrength: 88, readability: 85, estimatedDuration: 40, versions: [] },
    voiceStatus: 'ready',
    visuals: makeScenes('AI Prompt'),
    qualityScore: { overall: 93, hook: 94, script: 89, voice: 96, visuals: 90, captions: 94, brand: 96, publishReadiness: 92 },
    qcStatus: { score: 94, status: 'ready', checks: [], completedAt: daysAgo(0) },
    createdAt: daysAgo(1),
    updatedAt: daysAgo(0),
    createdBy: 'user',
    activity: [
      { id: uid('act'), type: 'approved', message: 'Content approved', timestamp: daysAgo(0) },
    ],
  });

  // Draft
  items.push({
    id: uid('content'),
    title: 'Untitled AI Concept',
    pillar: 'AI Tools',
    status: 'draft',
    estimatedDuration: 45,
    thumbnailGradient: GRADIENTS[1],
    voiceStatus: 'idle',
    goal: 'reach',
    audience: 'Tech enthusiasts',
    niche: 'AI Technology',
    createdAt: daysAgo(0),
    updatedAt: new Date().toISOString(),
    createdBy: 'user',
    activity: [],
  });

  // Failed
  items.push({
    id: uid('content'),
    title: 'Top 10 AI Coding Assistants Compared',
    pillar: 'AI Tools',
    status: 'failed',
    duration: 55,
    thumbnailGradient: GRADIENTS[5],
    script: { id: uid('script'), content: 'Script...', wordCount: 140, charCount: 760, hookStrength: 82, ctaStrength: 80, readability: 78, estimatedDuration: 55, versions: [] },
    voiceStatus: 'ready',
    visuals: makeScenes('AI Coding'),
    failureReason: 'Temporary renderer unavailable. The rendering service timed out while processing scene 4.',
    createdAt: daysAgo(2),
    updatedAt: daysAgo(1),
    createdBy: 'user',
    activity: [
      { id: uid('act'), type: 'render_failed', message: 'Rendering failed: Temporary renderer unavailable', timestamp: daysAgo(1) },
    ],
  });

  return items;
};

export const seedTemplates = (): Template[] => [
  { id: uid('tpl'), name: 'AI News', description: 'Breaking news format for AI updates', hook: 'Breaking: [topic] just changed everything', sceneStructure: ['Hook', 'Context', 'What happened', 'Why it matters', 'CTA'], captionStyle: 'bold', cta: 'Follow for updates', duration: 45, category: 'News', usageCount: 24 },
  { id: uid('tpl'), name: 'AI Tool Explainer', description: 'Showcase a single AI tool', hook: 'This AI tool will change how you [task]', sceneStructure: ['Hook', 'Problem', 'Tool intro', 'Demo', 'Result', 'CTA'], captionStyle: 'highlight', cta: 'Link in bio', duration: 50, category: 'Tools', usageCount: 38, isDefault: true },
  { id: uid('tpl'), name: 'Top 5 List', description: 'Countdown format', hook: 'Number [X] will blow your mind', sceneStructure: ['Hook', '#5', '#4', '#3', '#2', '#1', 'CTA'], captionStyle: 'karaoke', cta: 'Save this list', duration: 55, category: 'List', usageCount: 52 },
  { id: uid('tpl'), name: 'Quick Tutorial', description: 'Fast how-to format', hook: 'How to [task] in [time]', sceneStructure: ['Hook', 'Step 1', 'Step 2', 'Step 3', 'Result', 'CTA'], captionStyle: 'clean', cta: 'Follow for more tutorials', duration: 40, category: 'Tutorial', usageCount: 31 },
  { id: uid('tpl'), name: 'Myth vs Fact', description: 'Debunking format', hook: 'Stop believing this myth about [topic]', sceneStructure: ['Hook', 'Myth', 'Fact', 'Proof', 'Takeaway', 'CTA'], captionStyle: 'bold', cta: 'Comment what you thought', duration: 48, category: 'Educational', usageCount: 19 },
  { id: uid('tpl'), name: 'Storytelling', description: 'Narrative format', hook: 'This story will change how you see [topic]', sceneStructure: ['Hook', 'Setup', 'Conflict', 'Turning point', 'Resolution', 'Lesson', 'CTA'], captionStyle: 'minimal', cta: 'Share this story', duration: 58, category: 'Story', usageCount: 14 },
  { id: uid('tpl'), name: 'Motivational', description: 'Inspiration-driven format', hook: 'You will not believe what happened when...', sceneStructure: ['Hook', 'Struggle', 'Breakthrough', 'Lesson', 'CTA'], captionStyle: 'highlight', cta: 'Save for motivation', duration: 42, category: 'Motivation', usageCount: 11 },
  { id: uid('tpl'), name: 'Product Review', description: 'Honest review format', hook: 'I tested [product] for 30 days...', sceneStructure: ['Hook', 'Expectations', 'What I found', 'Pros', 'Cons', 'Verdict', 'CTA'], captionStyle: 'clean', cta: 'Comment your experience', duration: 55, category: 'Review', usageCount: 8 },
];

export const seedYouTubeChannel = (): YouTubeChannel => ({
  id: uid('yt'),
  connectionStatus: 'connected',
  channelId: 'UC_demo_channel',
  title: 'AI Explained',
  description: 'Daily AI news, tools, and tutorials',
  subscriberCount: 47200,
  viewCount: 3840000,
  videoCount: 127,
  lastSync: new Date().toISOString(),
  lastUpload: daysAgo(2),
  nextUpload: daysFromNow(1),
  expiresAt: daysFromNow(25),
});

export const seedRecentUploads = (): RecentUpload[] => [
  { id: uid('upload'), youtubeId: 'yt1', title: 'I Tried 50 AI Tools — These 3 Are Actually Worth It', thumbnail: '', views: 47000, likes: 2340, comments: 189, publishedAt: daysAgo(5), duration: 52 },
  { id: uid('upload'), youtubeId: 'yt2', title: 'The Future of Programming Is Not Coding', thumbnail: '', views: 32000, likes: 1890, comments: 245, publishedAt: daysAgo(12), duration: 48 },
  { id: uid('upload'), youtubeId: 'yt3', title: 'Stop Using ChatGPT Wrong — Do This Instead', thumbnail: '', views: 89000, likes: 5200, comments: 412, publishedAt: daysAgo(20), duration: 38 },
  { id: uid('upload'), youtubeId: 'yt4', title: 'How AI Actually Works in 60 Seconds', thumbnail: '', views: 15000, likes: 890, comments: 67, publishedAt: daysAgo(35), duration: 55 },
  { id: uid('upload'), youtubeId: 'yt5', title: 'Top 3 AI Websites You Did Not Know Existed', thumbnail: '', views: 62000, likes: 3100, comments: 198, publishedAt: daysAgo(48), duration: 44 },
];

export const seedAnalytics = (): AnalyticsOverview => ({
  views: 245000,
  viewsChange: 12.4,
  watchTime: 2840000,
  watchTimeChange: 8.7,
  subscribers: 1240,
  subscribersChange: 18.2,
  retention: 72,
  retentionChange: 3.1,
  likes: 13400,
  likesChange: 15.6,
  comments: 1111,
  commentsChange: 9.3,
  shares: 4200,
  sharesChange: 22.1,
  publishingConsistency: 94,
  consistencyChange: -2,
  videosPublished: 5,
});

function generateDatePoints(days: number, base: number, variance: number, trend: number): ChartPoint[] {
  const points: ChartPoint[] = [];
  let current = base;
  for (let i = days - 1; i >= 0; i--) {
    current += (Math.random() - 0.45) * variance + trend;
    current = Math.max(base * 0.3, current);
    const date = new Date(Date.now() - i * 86400000);
    points.push({
      date: date.toISOString(),
      value: Math.round(current),
      label: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    });
  }
  return points;
}

export const seedViewsSeries = (): ChartPoint[] => generateDatePoints(30, 5000, 3000, 80);
export const seedWatchTimeSeries = (): ChartPoint[] => generateDatePoints(30, 70000, 40000, 1200);
export const seedSubscribersSeries = (): ChartPoint[] => generateDatePoints(30, 46000, 800, 15);

export const seedTopics = (): TopicPerformance[] => [
  { topic: 'AI Tools', videos: 18, views: 142000, avgRetention: 78, engagement: 8.4, subscriberConversion: 2.1 },
  { topic: 'AI News', videos: 12, views: 89000, avgRetention: 68, engagement: 6.2, subscriberConversion: 1.4 },
  { topic: 'Tutorials', videos: 15, views: 124000, avgRetention: 75, engagement: 7.8, subscriberConversion: 1.8 },
  { topic: 'Explainers', videos: 9, views: 67000, avgRetention: 71, engagement: 5.9, subscriberConversion: 1.2 },
  { topic: 'Product Reviews', videos: 6, views: 41000, avgRetention: 65, engagement: 7.1, subscriberConversion: 0.9 },
];

export const seedInsights = (): Insight[] => [
  { id: uid('ins'), text: 'AI explainer videos are outperforming general technology videos by 34% in watch time.', confidence: 92, category: 'performance' },
  { id: uid('ins'), text: 'Videos between 35 and 48 seconds have 23% stronger completion rates than longer content.', confidence: 87, category: 'content' },
  { id: uid('ins'), text: 'Your strongest hook pattern is question-based openings, with 18% higher click-through.', confidence: 82, category: 'content' },
  { id: uid('ins'), text: 'Posting between 7:30 PM and 9:00 PM IST yields the highest engagement for your audience.', confidence: 90, category: 'timing' },
  { id: uid('ins'), text: 'List-format videos (Top 3/5) generate 2.1x more shares than single-topic explainers.', confidence: 78, category: 'performance' },
  { id: uid('ins'), text: 'Your audience retention drops sharply after the 50-second mark — consider tighter edits.', confidence: 85, category: 'audience' },
];

export const seedLearnedPreferences = (): LearnedPreferences => ({
  bestDuration: '38–48 seconds',
  bestHook: 'Question-based',
  bestPillar: 'AI Tools',
  bestCta: 'Save / Follow',
  bestPostingTime: '7:30–9:00 PM IST',
  videosAnalyzed: 127,
});

export const seedHeatmap = (): HeatmapCell[] => {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const hours = [9, 12, 15, 18, 19, 20, 21, 22];
  const cells: HeatmapCell[] = [];
  for (const day of days) {
    for (const hour of hours) {
      const isPeak = (hour >= 19 && hour <= 21) && day !== 'Sun';
      const isModerate = (hour === 18 || hour === 22) && day !== 'Sun';
      cells.push({
        day,
        hour,
        value: isPeak ? randomBetween(75, 95) : isModerate ? randomBetween(40, 65) : randomBetween(10, 35),
        recommended: isPeak,
      });
    }
  }
  return cells;
};

export const seedContentPerformance = (): ContentPerformance[] => {
  const titles = [
    'I Tried 50 AI Tools — These 3 Are Actually Worth It',
    'Stop Using ChatGPT Wrong — Do This Instead',
    'Top 3 AI Websites You Did Not Know Existed',
    'The Future of Programming Is Not Coding',
    'How AI Actually Works in 60 Seconds',
  ];
  return titles.map((title, i) => ({
    id: uid('perf'),
    title,
    views: [47000, 89000, 62000, 32000, 15000][i],
    retention: [72, 78, 75, 68, 65][i],
    likes: [2340, 5200, 3100, 1890, 890][i],
    comments: [189, 412, 198, 245, 67][i],
    publishedAt: daysAgo([5, 20, 48, 12, 35][i]),
  }));
};

export const seedWorkflowNodes = (): WorkflowNode[] => [
  { id: 'node_scheduler', type: 'scheduler', label: 'Scheduler', status: 'idle', position: { x: 0, y: 150 } },
  { id: 'node_trend', type: 'trend-analyzer', label: 'Trend Analyzer', status: 'idle', position: { x: 200, y: 50 } },
  { id: 'node_topic', type: 'topic-generator', label: 'Topic Generator', status: 'idle', position: { x: 200, y: 250 } },
  { id: 'node_script', type: 'script-generator', label: 'Script Generator', status: 'idle', position: { x: 420, y: 150 } },
  { id: 'node_voice', type: 'voice-generator', label: 'Voice Generator', status: 'idle', position: { x: 640, y: 50 } },
  { id: 'node_visual', type: 'visual-generator', label: 'Visual Generator', status: 'idle', position: { x: 640, y: 250 } },
  { id: 'node_render', type: 'video-renderer', label: 'Video Renderer', status: 'idle', position: { x: 860, y: 150 } },
  { id: 'node_caption', type: 'caption-generator', label: 'Caption Generator', status: 'idle', position: { x: 1080, y: 50 } },
  { id: 'node_qc', type: 'quality-checker', label: 'Quality Checker', status: 'idle', position: { x: 1080, y: 250 } },
  { id: 'node_approval', type: 'approval-gate', label: 'Approval Gate', status: 'idle', position: { x: 1300, y: 150 } },
  { id: 'node_publisher', type: 'youtube-publisher', label: 'YouTube Publisher', status: 'idle', position: { x: 1520, y: 150 } },
  { id: 'node_analytics', type: 'analytics-sync', label: 'Analytics Sync', status: 'idle', position: { x: 1740, y: 250 } },
  { id: 'node_learning', type: 'learning-engine', label: 'Learning Engine', status: 'idle', position: { x: 1740, y: 50 } },
];

export const seedWorkflowEdges = (): WorkflowEdge[] => [
  { id: 'e1', source: 'node_scheduler', target: 'node_trend' },
  { id: 'e2', source: 'node_scheduler', target: 'node_topic' },
  { id: 'e3', source: 'node_trend', target: 'node_topic' },
  { id: 'e4', source: 'node_topic', target: 'node_script' },
  { id: 'e5', source: 'node_script', target: 'node_voice' },
  { id: 'e6', source: 'node_script', target: 'node_visual' },
  { id: 'e7', source: 'node_voice', target: 'node_render' },
  { id: 'e8', source: 'node_visual', target: 'node_render' },
  { id: 'e9', source: 'node_render', target: 'node_caption' },
  { id: 'e10', source: 'node_render', target: 'node_qc' },
  { id: 'e11', source: 'node_caption', target: 'node_approval' },
  { id: 'e12', source: 'node_qc', target: 'node_approval' },
  { id: 'e13', source: 'node_approval', target: 'node_publisher' },
  { id: 'e14', source: 'node_publisher', target: 'node_analytics' },
  { id: 'e15', source: 'node_analytics', target: 'node_learning' },
];

export const seedNotifications = (): Notification[] => [
  { id: uid('notif'), type: 'success', title: 'Render completed', message: '3 Free AI Tools That Save Hours Every Week — rendering in progress', read: false, timestamp: daysAgo(0) },
  { id: uid('notif'), type: 'warning', title: 'Approval required', message: 'AI vs Traditional Search is ready for your review', read: false, link: '/content', timestamp: daysAgo(0) },
  { id: uid('notif'), type: 'error', title: 'Render failed', message: 'Top 10 AI Coding Assistants Compared — renderer unavailable', read: true, link: '/queue', timestamp: daysAgo(1) },
  { id: uid('notif'), type: 'info', title: 'Video scheduled', message: '5 AI Tools Students Should Know scheduled for tomorrow', read: true, link: '/calendar', timestamp: daysAgo(1) },
  { id: uid('notif'), type: 'success', title: 'Upload completed', message: 'I Tried 50 AI Tools is now live on YouTube', read: true, link: '/youtube', timestamp: daysAgo(5) },
];
