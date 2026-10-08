import { useContentStore } from '../stores/contentStore';
import { useAutomationStore } from '../stores/automationStore';
import { useWorkspaceStore } from '../stores/workspaceStore';
import { delay, uid, randomBetween } from '../lib/utils';
import { simulateProgress, renderStages, scriptStages, voiceStages, visualStages, uploadStages, ideaStages } from './mockApi';
import type { Idea, IdeaGenerateParams, Scene, QcStatus } from '../types/content';

const GRADIENTS = [
  'from-emerald-900 via-emerald-800 to-teal-700',
  'from-slate-800 via-slate-700 to-zinc-600',
  'from-teal-900 via-emerald-800 to-green-700',
  'from-gray-900 via-emerald-900 to-teal-800',
  'from-zinc-800 via-stone-700 to-emerald-900',
  'from-emerald-800 via-green-700 to-lime-600',
];

const TITLE_TEMPLATES = [
  '5 AI Tools {audience} Should Know in 2026',
  'Why AI Agents Are Changing {topic}',
  '3 Free AI Tools That Save Hours Every Week',
  'AI vs {topic}: What\'s Actually Changing?',
  'How {topic} Works in 45 Seconds',
  'The AI Skill That Will Be Worth $200k in 2027',
  'Stop Using {tool} Wrong — Do This Instead',
  'One AI Prompt That Does The Work of 10 People',
  'This AI Tool Will Change How You Work Forever',
  'Nobody Is Talking About This AI Trend Yet',
];

const HOOK_TEMPLATES = [
  'This changes everything about {topic}...',
  '{audience} are using this to cut their work in half',
  'You will not believe what AI can do now',
  'Most people are approaching {topic} completely wrong',
  'This is the AI tool everyone will be using soon',
];

function generateIdea(params: IdeaGenerateParams, index: number): Omit<Idea, 'id' | 'createdAt'> {
  const title = TITLE_TEMPLATES[index % TITLE_TEMPLATES.length]
    .replace('{audience}', params.audience || 'you')
    .replace('{topic}', params.topic || params.niche || 'AI')
    .replace('{tool}', params.topic || 'ChatGPT');
  return {
    title,
    hook: HOOK_TEMPLATES[index % HOOK_TEMPLATES.length]
      .replace('{topic}', params.topic || params.niche || 'AI')
      .replace('{audience}', params.audience || 'People'),
    angle: params.pillar || 'General AI',
    pillar: params.pillar || params.niche || 'AI Tools',
    whyItWorks: 'Targets high-intent audience, utility-focused content with strong share potential and clear value proposition.',
    suggestedDuration: randomBetween(35, 55),
    cta: 'Follow for more AI tools and tutorials',
    potential: randomBetween(75, 96),
    freshness: randomBetween(60, 95),
    difficulty: randomBetween(1, 4),
    estimatedRetention: randomBetween(60, 88),
    source: 'AI Generated',
    status: 'generated',
  };
}

export const demoEngine = {
  async simulateIdeaGeneration(params: IdeaGenerateParams, onProgress?: (p: number, stage: string) => void): Promise<Idea[]> {
    const store = useContentStore.getState();
    await simulateProgress(ideaStages, {
      onStage: (label) => onProgress?.(0, label),
      onProgress: (p) => onProgress?.(p, 'Generating ideas...'),
    }, { duration: 2500 });

    const ideas: Idea[] = [];
    for (let i = 0; i < params.count; i++) {
      const idea = store.addIdea(generateIdea(params, i));
      ideas.push(idea);
    }

    store.addNotification({ type: 'success', title: 'Ideas generated', message: `${ideas.length} new concepts ready` });
    return ideas;
  },

  async simulateScriptGeneration(contentId: string, onProgress?: (p: number, stage: string) => void): Promise<boolean> {
    const store = useContentStore.getState();
    const content = store.getContent(contentId);
    if (!content) return false;

    const job = store.createJob(contentId, 'script');
    store.updateJob(job.id, { status: 'running' });
    store.addJobLog(job.id, 'Starting script generation', 'info');
    store.updateStatus(contentId, 'draft');

    const success = await simulateProgress(scriptStages, {
      onStage: (label) => {
        onProgress?.(0, label);
        store.addJobLog(job.id, label, 'info');
      },
      onProgress: (p) => {
        onProgress?.(p, 'Writing script...');
        store.updateJob(job.id, { progress: p });
      },
      onComplete: () => {
        const wordCount = randomBetween(95, 140);
        const scriptContent = `[HOOK]\n${content.hook || content.title}\n\n[BODY]\nLet me show you something that changes everything.\n\nMost people don't realize this, but the way we work is being completely transformed.\n\nHere's what you need to know:\n\nFirst, understand that speed matters. The tools available now can do in seconds what used to take hours.\n\nSecond, don't get left behind. The creators who adapt fastest will be the ones who win.\n\nThird, start today. Pick one tool, learn it well, and build from there.\n\n[CTA]\n${content.cta || 'Follow for more AI tools and tutorials every day.'}`;

        store.updateContent(contentId, {
          script: {
            id: uid('script'),
            content: scriptContent,
            wordCount,
            charCount: scriptContent.length,
            hookStrength: randomBetween(80, 95),
            ctaStrength: randomBetween(78, 92),
            readability: randomBetween(72, 88),
            estimatedDuration: Math.round(wordCount / 2.5),
            versions: [{
              id: uid('ver'),
              content: scriptContent,
              wordCount,
              createdAt: new Date().toISOString(),
              label: 'Version 1',
            }],
          },
          estimatedDuration: Math.round(wordCount / 2.5),
        });
        store.updateStatus(contentId, 'script_ready');
        store.addActivity(contentId, 'script_generated', 'Script generated successfully');
        store.updateJob(job.id, { status: 'completed', progress: 100, completedAt: new Date().toISOString() });
        store.addJobLog(job.id, 'Script generated successfully', 'success');
        store.addNotification({ type: 'success', title: 'Script ready', message: content.title });
      },
      onFail: (error) => {
        store.updateJob(job.id, { status: 'failed', error });
        store.addJobLog(job.id, `Script generation failed: ${error}`, 'error');
        store.updateContent(contentId, { failureReason: error });
        store.addNotification({ type: 'error', title: 'Script generation failed', message: error });
      },
    }, { duration: 3000, shouldFail: Math.random() < 0.05 });

    return success;
  },

  async simulateVoiceGeneration(contentId: string, onProgress?: (p: number, stage: string) => void): Promise<boolean> {
    const store = useContentStore.getState();
    const content = store.getContent(contentId);
    if (!content) return false;

    const job = store.createJob(contentId, 'voice');
    store.updateJob(job.id, { status: 'running' });
    store.addJobLog(job.id, 'Starting voice generation', 'info');
    store.updateContent(contentId, { voiceStatus: 'generating' });

    const success = await simulateProgress(voiceStages, {
      onStage: (label) => {
        onProgress?.(0, label);
        store.addJobLog(job.id, label, 'info');
      },
      onProgress: (p) => {
        onProgress?.(p, 'Generating voice...');
        store.updateJob(job.id, { progress: p });
      },
      onComplete: () => {
        store.updateContent(contentId, {
          voiceStatus: 'ready',
          voiceUrl: `voice_${contentId}.mp3`,
        });
        store.updateStatus(contentId, 'voice_ready');
        store.addActivity(contentId, 'voice_generated', 'Voice generated successfully');
        store.updateJob(job.id, { status: 'completed', progress: 100, completedAt: new Date().toISOString() });
        store.addJobLog(job.id, 'Voice generated successfully', 'success');
        store.addNotification({ type: 'success', title: 'Voice ready', message: content.title });
      },
      onFail: (error) => {
        store.updateContent(contentId, { voiceStatus: 'failed', failureReason: error });
        store.updateJob(job.id, { status: 'failed', error });
        store.addJobLog(job.id, `Voice generation failed: ${error}`, 'error');
        store.addNotification({ type: 'error', title: 'Voice generation failed', message: error });
      },
    }, { duration: 2500, shouldFail: Math.random() < 0.03 });

    return success;
  },

  async simulateVisualGeneration(contentId: string, onProgress?: (p: number, stage: string) => void): Promise<boolean> {
    const store = useContentStore.getState();
    const content = store.getContent(contentId);
    if (!content) return false;

    const job = store.createJob(contentId, 'visuals');
    store.updateJob(job.id, { status: 'running' });
    store.addJobLog(job.id, 'Starting visual generation', 'info');

    const scenes: Scene[] = [
      { id: uid('scene'), index: 0, title: 'Hook', type: 'hook', script: content.hook || content.title, duration: randomBetween(4, 7), visualStatus: 'generating', visualType: 'generated' },
      { id: uid('scene'), index: 1, title: 'Problem', type: 'content', script: 'The problem most people face...', duration: randomBetween(6, 10), visualStatus: 'generating', visualType: 'generated' },
      { id: uid('scene'), index: 2, title: 'Point 1', type: 'content', script: 'First, here is what you need to understand.', duration: randomBetween(8, 12), visualStatus: 'generating', visualType: 'generated' },
      { id: uid('scene'), index: 3, title: 'Point 2', type: 'content', script: 'Second, this is where the real power is.', duration: randomBetween(8, 12), visualStatus: 'generating', visualType: 'generated' },
      { id: uid('scene'), index: 4, title: 'CTA', type: 'cta', script: content.cta || 'Follow for more.', duration: randomBetween(4, 6), visualStatus: 'generating', visualType: 'generated' },
    ];
    store.updateContent(contentId, { visuals: scenes });

    const success = await simulateProgress(visualStages, {
      onStage: (label) => {
        onProgress?.(0, label);
        store.addJobLog(job.id, label, 'info');
      },
      onProgress: (p) => {
        onProgress?.(p, 'Generating visuals...');
        store.updateJob(job.id, { progress: p });
      },
      onComplete: () => {
        const updatedScenes = scenes.map(s => ({ ...s, visualStatus: 'ready' as const, visualAsset: `asset_${s.id}` }));
        store.updateContent(contentId, {
          visuals: updatedScenes,
          thumbnailGradient: GRADIENTS[randomBetween(0, GRADIENTS.length - 1)],
        });
        store.updateStatus(contentId, 'visuals_ready');
        store.addActivity(contentId, 'visuals_generated', 'Visuals generated for all scenes');
        store.updateJob(job.id, { status: 'completed', progress: 100, completedAt: new Date().toISOString() });
        store.addJobLog(job.id, 'Visuals generated successfully', 'success');
        store.addNotification({ type: 'success', title: 'Visuals ready', message: content.title });
      },
      onFail: (error) => {
        store.updateJob(job.id, { status: 'failed', error });
        store.addJobLog(job.id, `Visual generation failed: ${error}`, 'error');
        store.addNotification({ type: 'error', title: 'Visual generation failed', message: error });
      },
    }, { duration: 3000, shouldFail: Math.random() < 0.04 });

    return success;
  },

  async simulateRendering(contentId: string, onProgress?: (p: number, stage: string) => void): Promise<boolean> {
    const store = useContentStore.getState();
    const content = store.getContent(contentId);
    if (!content) return false;

    const job = store.createJob(contentId, 'rendering');
    store.updateJob(job.id, { status: 'running' });
    store.addJobLog(job.id, 'Starting render', 'info');
    store.updateStatus(contentId, 'rendering', { progress: 0 });

    const success = await simulateProgress(renderStages, {
      onStage: (label) => {
        onProgress?.(0, label);
        store.addJobLog(job.id, label, 'info');
      },
      onProgress: (p) => {
        onProgress?.(p, 'Rendering...');
        store.updateJob(job.id, { progress: p });
        store.updateContent(contentId, { progress: p });
      },
      onComplete: () => {
        const totalDuration = content.estimatedDuration || 45;
        store.updateContent(contentId, {
          progress: 100,
          videoUrl: `video_${contentId}.mp4`,
          duration: totalDuration,
          qualityScore: {
            overall: randomBetween(85, 96),
            hook: randomBetween(82, 95),
            script: randomBetween(80, 94),
            voice: randomBetween(85, 97),
            visuals: randomBetween(82, 94),
            captions: randomBetween(88, 96),
            brand: randomBetween(90, 98),
            publishReadiness: randomBetween(85, 95),
          },
        });
        store.updateStatus(contentId, 'rendered', { progress: 100 });
        store.addActivity(contentId, 'render_completed', 'Video rendered successfully');
        store.updateJob(job.id, { status: 'completed', progress: 100, completedAt: new Date().toISOString() });
        store.addJobLog(job.id, 'Render completed successfully', 'success');
        store.addNotification({ type: 'success', title: 'Render completed', message: content.title });
      },
      onFail: (error) => {
        store.updateContent(contentId, { failureReason: error, progress: undefined });
        store.updateStatus(contentId, 'failed');
        store.updateJob(job.id, { status: 'failed', error });
        store.addJobLog(job.id, `Render failed: ${error}`, 'error');
        store.addActivity(contentId, 'render_failed', `Render failed: ${error}`);
        store.addNotification({ type: 'error', title: 'Rendering failed', message: `${content.title}: ${error}` });
      },
    }, { duration: 5000, shouldFail: Math.random() < 0.08 });

    return success;
  },

  async simulateQualityCheck(contentId: string, onProgress?: (p: number, stage: string) => void): Promise<QcStatus | null> {
    const store = useContentStore.getState();
    const content = store.getContent(contentId);
    if (!content) return null;

    const job = store.createJob(contentId, 'qc');
    store.updateJob(job.id, { status: 'running' });
    store.addJobLog(job.id, 'Running quality checks', 'info');
    store.updateStatus(contentId, 'quality_check');

    await delay(1500);
    const stages = ['Checking resolution', 'Verifying aspect ratio', 'Analyzing audio levels', 'Checking duration', 'Verifying subtitles', 'Detecting silence', 'Checking visuals', 'Verifying brand consistency', 'Scoring title quality', 'Checking description', 'Duplicate detection', 'Policy risk scan'];
    for (let i = 0; i < stages.length; i++) {
      onProgress?.(Math.round((i / stages.length) * 100), stages[i]);
      store.updateJob(job.id, { progress: Math.round((i / stages.length) * 100) });
      store.addJobLog(job.id, stages[i], 'info');
      await delay(200);
    }

    const score = randomBetween(82, 97);
    const qcStatus: QcStatus = {
      score,
      status: score >= 90 ? 'ready' : score >= 75 ? 'issues' : 'failed',
      checks: [
        { id: uid('qc'), name: 'Resolution', status: 'pass' },
        { id: uid('qc'), name: 'Aspect ratio (9:16)', status: 'pass' },
        { id: uid('qc'), name: 'Audio levels', status: score > 85 ? 'pass' : 'warning' },
        { id: uid('qc'), name: 'Duration', status: 'pass' },
        { id: uid('qc'), name: 'Subtitle coverage', status: score > 80 ? 'pass' : 'warning' },
        { id: uid('qc'), name: 'Silence detection', status: 'pass' },
        { id: uid('qc'), name: 'Missing visuals', status: 'pass' },
        { id: uid('qc'), name: 'Brand consistency', status: score > 88 ? 'pass' : 'warning' },
        { id: uid('qc'), name: 'Title quality', status: 'pass' },
        { id: uid('qc'), name: 'Description quality', status: 'pass' },
        { id: uid('qc'), name: 'Duplicate content', status: 'pass' },
        { id: uid('qc'), name: 'Policy risk', status: score > 85 ? 'pass' : 'warning', message: score <= 85 ? 'Title may be considered sensationalist' : undefined },
      ],
      completedAt: new Date().toISOString(),
    };

    store.updateContent(contentId, { qcStatus });
    store.updateStatus(contentId, 'review');
    store.addActivity(contentId, 'qc_passed', `Quality check completed: ${score}/100`);
    store.updateJob(job.id, { status: 'completed', progress: 100, completedAt: new Date().toISOString() });
    store.addJobLog(job.id, `Quality check: ${score}/100 - ${qcStatus.status}`, qcStatus.status === 'ready' ? 'success' : 'warning');
    store.addNotification({ type: 'success', title: 'Quality check complete', message: `Score: ${score}/100` });

    return qcStatus;
  },

  async simulateApproval(contentId: string): Promise<void> {
    const store = useContentStore.getState();
    store.updateStatus(contentId, 'approved');
    store.addActivity(contentId, 'approved', 'Content approved for scheduling');
    store.addNotification({ type: 'success', title: 'Content approved', message: 'Ready to schedule' });
  },

  async simulateScheduling(contentId: string, scheduledAt?: string): Promise<void> {
    const store = useContentStore.getState();
    const content = store.getContent(contentId);
    if (!content) return;

    const scheduleTime = scheduledAt || new Date(Date.now() + 86400000).toISOString();
    store.updateContent(contentId, { scheduledAt: scheduleTime });
    store.updateStatus(contentId, 'scheduled');
    store.addActivity(contentId, 'scheduled', `Scheduled for publishing`);
    store.addNotification({ type: 'success', title: 'Video scheduled', message: content.title });
  },

  async simulateYouTubeUpload(contentId: string, onProgress?: (p: number, stage: string) => void): Promise<boolean> {
    const store = useContentStore.getState();
    const content = store.getContent(contentId);
    if (!content) return false;

    const job = store.createJob(contentId, 'publishing');
    store.updateJob(job.id, { status: 'running' });
    store.addJobLog(job.id, 'Starting YouTube upload', 'info');
    store.updateStatus(contentId, 'publishing');

    const success = await simulateProgress(uploadStages, {
      onStage: (label) => {
        onProgress?.(0, label);
        store.addJobLog(job.id, label, 'info');
      },
      onProgress: (p) => {
        onProgress?.(p, 'Uploading...');
        store.updateJob(job.id, { progress: p });
      },
      onComplete: () => {
        store.updateContent(contentId, {
          publishedAt: new Date().toISOString(),
          youtubeId: `yt_${uid()}`,
          youtubeUrl: 'https://youtube.com/shorts/demo',
          views: 0,
          likes: 0,
          comments: 0,
          shares: 0,
          retention: 70,
          watchTime: 0,
          subscribersGained: 0,
          scheduledAt: content.scheduledAt || new Date().toISOString(),
        });
        store.updateStatus(contentId, 'published');
        store.addActivity(contentId, 'publish_completed', 'Demo publication completed');
        store.updateJob(job.id, { status: 'completed', progress: 100, completedAt: new Date().toISOString() });
        store.addJobLog(job.id, 'Demo publication completed successfully', 'success');
        store.addNotification({ type: 'success', title: 'Publication complete', message: 'Demo Mode — no external service was contacted.' });
      },
      onFail: (error) => {
        store.updateStatus(contentId, 'failed');
        store.updateContent(contentId, { failureReason: error });
        store.updateJob(job.id, { status: 'failed', error });
        store.addJobLog(job.id, `Upload failed: ${error}`, 'error');
        store.addActivity(contentId, 'publish_failed', `Upload failed: ${error}`);
        store.addNotification({ type: 'error', title: 'Upload failed', message: error });
      },
    }, { duration: 4000, shouldFail: Math.random() < 0.03 });

    return success;
  },

  async runFullAutomation(): Promise<void> {
    const store = useContentStore.getState();
    const autoStore = useAutomationStore.getState();
    const wsStore = useWorkspaceStore.getState();

    if (!wsStore.youtubeChannel || wsStore.youtubeChannel.connectionStatus !== 'connected') {
      store.addNotification({ type: 'error', title: 'Cannot start automation', message: 'YouTube channel not connected' });
      return;
    }

    autoStore.updateConfig({ status: 'active' });
    store.addNotification({ type: 'info', title: 'Automation started', message: 'Content engine running' });

    // Create content from trending idea
    const ideas = store.ideas.filter(i => i.status === 'trending' || i.status === 'generated');
    const idea = ideas[Math.floor(Math.random() * ideas.length)];
    if (!idea) {
      store.addNotification({ type: 'warning', title: 'No ideas available', message: 'Generate ideas first' });
      return;
    }

    const content = store.createContent({
      title: idea.title,
      hook: idea.hook,
      angle: idea.angle,
      pillar: idea.pillar,
      cta: idea.cta,
      estimatedDuration: idea.suggestedDuration,
      audience: wsStore.workspace?.targetAudience,
      niche: wsStore.workspace?.niche,
    });
    store.updateIdea(idea.id, { status: 'used' });
    store.addActivity(content.id, 'idea_generated', 'Idea selected by automation engine');

    // Run pipeline
    await delay(800);
    await demoEngine.simulateScriptGeneration(content.id);
    await delay(600);
    await demoEngine.simulateVoiceGeneration(content.id);
    await delay(600);
    await demoEngine.simulateVisualGeneration(content.id);
    await delay(600);
    await demoEngine.simulateRendering(content.id);
    await delay(800);
    await demoEngine.simulateQualityCheck(content.id);
    await delay(500);

    const mode = wsStore.workspace?.automationMode || 'manual';
    if (mode === 'autonomous') {
      await demoEngine.simulateApproval(content.id);
      await delay(400);
      await demoEngine.simulateScheduling(content.id);
      await delay(600);
      await demoEngine.simulateYouTubeUpload(content.id);
    } else {
      store.addNotification({ type: 'warning', title: 'Approval required', message: `${content.title} is ready for review`, link: `/content/${content.id}` });
    }

    autoStore.updateConfig({ lastRun: new Date().toISOString(), totalRuns: autoStore.config.totalRuns + 1 });
  },

  async retryJob(contentId: string): Promise<void> {
    const store = useContentStore.getState();
    const content = store.getContent(contentId);
    if (!content) return;

    store.updateContent(contentId, { failureReason: undefined });

    switch (content.status) {
      case 'failed':
        // If it was rendering, retry render
        if (content.voiceStatus === 'ready' && content.visuals && content.visuals.length > 0) {
          await demoEngine.simulateRendering(contentId);
        } else if (content.voiceStatus === 'ready') {
          await demoEngine.simulateVisualGeneration(contentId);
        } else if (content.script) {
          await demoEngine.simulateVoiceGeneration(contentId);
        } else {
          await demoEngine.simulateScriptGeneration(contentId);
        }
        break;
      default:
        store.addNotification({ type: 'info', title: 'Retrying', message: content.title });
        break;
    }
  },
};
