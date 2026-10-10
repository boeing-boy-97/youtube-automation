import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Mic,
  Database,
  Film,
  Play,
  Layers,
  Mail,
  ChevronLeft,
  ChevronRight,
  Pause,
  ExternalLink,
  CheckCircle2,
  Sliders,
  ShieldCheck,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '../../lib/utils';
import { useMotionSafe, motionTokens } from '../../lib/motion';

interface EcosystemItem {
  id: string;
  name: string;
  category: string;
  badge: string;
  role: string;
  techStack: string;
  statusText: string;
  statusType: 'live' | 'native' | 'oauth' | 'ready';
  icon: React.ComponentType<{ className?: string }>;
  accentColor: string;
  bgLight: string;
  actionLabel: string;
  actionLink: string;
  details: string[];
}

const ECOSYSTEM_ITEMS: EcosystemItem[] = [
  {
    id: 'openai',
    name: 'OpenAI GPT-4o & Reasoning',
    category: 'Script & Story Architecture',
    badge: 'CORE SCRIPT ENGINE',
    role: 'Synthesizes structured 3-Act vertical video screenplays with strict retention pacing and 3-second opening hook variants.',
    techStack: 'OpenAI API v1 (GPT-4o / Claude 3.7 Sonnet) via server-side secure client',
    statusText: 'API Client Active • Streaming Enabled',
    statusType: 'live',
    icon: Sparkles,
    accentColor: '#10A37F',
    bgLight: 'rgba(16, 163, 127, 0.08)',
    actionLabel: 'Test in Script Lab',
    actionLink: '/script-lab',
    details: [
      'Strict character-to-duration pacing formulas',
      'Curiosity gap hook alternatives',
      'Structured scene beat breakdowns with audio cues',
    ],
  },
  {
    id: 'elevenlabs',
    name: 'ElevenLabs Neural TTS',
    category: 'Voiceover & Cadence',
    badge: 'AUDIO SYNTHESIS',
    role: 'Generates studio-grade vocal masters with emotion inflection, conversational cadence, and sub-syllable word timestamping.',
    techStack: 'ElevenLabs WebSocket / REST v1 with 48 kHz lossless output',
    statusText: '12 Studio Voices Configured',
    statusType: 'live',
    icon: Mic,
    accentColor: '#E96D50',
    bgLight: 'rgba(236, 90, 58, 0.08)',
    actionLabel: 'Explore Studio Voices',
    actionLink: '/brand-kit',
    details: [
      'Word-level timestamps for kinetic subtitle synchronization',
      'Dynamic speed control for target video length',
      'Studio normalization (-14 LUFS YouTube standard)',
    ],
  },
  {
    id: 'storage',
    name: 'Cloudflare R2 & AWS S3',
    category: 'Lossless Media Storage',
    badge: 'DISTRIBUTED ASSETS',
    role: 'Durably persists high-bitrate video clips, background music, rendered MP4 deliverables, and visual compositions with signed CDN delivery.',
    techStack: 'AWS S3 / Cloudflare R2 via AWS SDK v3 with pre-signed upload URLs',
    statusText: 'Encrypted Object Storage Active',
    statusType: 'live',
    icon: Database,
    accentColor: '#F38020',
    bgLight: 'rgba(243, 128, 32, 0.08)',
    actionLabel: 'Inspect Media Library',
    actionLink: '/assets',
    details: [
      'Pre-signed streaming URLs with token expiration',
      'Zero-egress cost Cloudflare R2 integration',
      'Automated cache invalidation upon re-renders',
    ],
  },
  {
    id: 'ffmpeg',
    name: 'FFmpeg Dual-Pass Engine',
    category: 'Server-Side Compositor',
    badge: 'VIDEO COMPILER',
    role: 'Assembles 1080×1920 vertical video deliverables directly on server workers with hardware acceleration, audio normalization, and burned subtitles.',
    techStack: 'Native system FFmpeg 6.1 with libx264, libass, and filter_complex graph',
    statusText: 'Local Binary Validated • H.264/AAC',
    statusType: 'native',
    icon: Film,
    accentColor: '#007808',
    bgLight: 'rgba(0, 120, 8, 0.08)',
    actionLabel: 'View Render Queue',
    actionLink: '/queue',
    details: [
      'Sub-pixel kinetic subtitle positioning within safe zones',
      'Dual-pass encoding (CRF 18) for zero artifacting',
      'Durable ffprobe media integrity validation',
    ],
  },
  {
    id: 'youtube',
    name: 'YouTube Data API v3',
    category: 'Channel Publishing & Analytics',
    badge: 'AUTHORIZED PUBLISHING',
    role: 'Directly uploads rendered shorts to verified YouTube channels via Google OAuth 2.0 with scheduled posting windows and real-time retention metrics.',
    techStack: 'Google APIs Client Library with refresh token encryption at rest',
    statusText: 'OAuth 2.0 Client • Connectable',
    statusType: 'oauth',
    icon: Play,
    accentColor: '#FF0000',
    bgLight: 'rgba(255, 0, 0, 0.08)',
    actionLabel: 'Connect YouTube Channel',
    actionLink: '/youtube',
    details: [
      'Zero-touch publishing at scheduled creator slots',
      'Automated tag, category, and metadata payload generation',
      'Daily view velocity and retention sync into analytics',
    ],
  },
  {
    id: 'bullmq',
    name: 'BullMQ & Redis Outbox',
    category: 'Distributed Processing',
    badge: 'QUEUE ENGINE',
    role: 'Guarantees reliable asynchronous execution for multi-minute rendering tasks, retry policies with exponential backoff, and event dispatch.',
    techStack: 'BullMQ 5.x with Redis 7 and Redlock distributed locks',
    statusText: 'Redis Worker Pipeline Active',
    statusType: 'ready',
    icon: Layers,
    accentColor: '#DC382D',
    bgLight: 'rgba(220, 56, 45, 0.08)',
    actionLabel: 'Monitor Automations',
    actionLink: '/automation',
    details: [
      'Transactional outbox pattern prevents orphaned jobs',
      'Server-Sent Events (SSE) stream real-time progress',
      'Idempotent job keys prevent duplicate rendering',
    ],
  },
  {
    id: 'resend',
    name: 'Resend Transactional SMTP',
    category: 'Operational Alerts',
    badge: 'DELIVERY NOTIFICATIONS',
    role: 'Dispatches instant creator alerts when autonomous jobs complete, render errors require attention, or YouTube quota limits approach threshold.',
    techStack: 'Resend Node SDK with transactional templating',
    statusText: 'Transactional Email Worker Ready',
    statusType: 'ready',
    icon: Mail,
    accentColor: '#25211F',
    bgLight: 'rgba(37, 33, 31, 0.08)',
    actionLabel: 'Notification Settings',
    actionLink: '/settings',
    details: [
      'Instant failure alerts with exact ffprobe error logs',
      'Scheduled publish confirmation with live video link',
      'Weekly performance digests with view velocity',
    ],
  },
];

export function CurvedIntegrationSection() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const { shouldReduce } = useMotionSafe();

  const totalItems = ECOSYSTEM_ITEMS.length;

  const nextItem = useCallback(() => {
    setActiveIndex((prev) => (prev + 1) % totalItems);
  }, [totalItems]);

  const prevItem = useCallback(() => {
    setActiveIndex((prev) => (prev - 1 + totalItems) % totalItems);
  }, [totalItems]);

  // Autoplay progression: advances smoothly every 4.5 seconds when not paused
  useEffect(() => {
    if (isPaused || shouldReduce) return;
    const interval = setInterval(nextItem, 4500);
    return () => clearInterval(interval);
  }, [isPaused, shouldReduce, nextItem]);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowRight') {
      nextItem();
    } else if (e.key === 'ArrowLeft') {
      prevItem();
    }
  };

  const activeItem = ECOSYSTEM_ITEMS[activeIndex];

  return (
    <section
      id="integrations"
      className="py-24 px-4 sm:px-6 lg:px-8 bg-canvas border-t border-border text-ink overflow-hidden"
      onKeyDown={handleKeyDown}
      tabIndex={0}
      aria-label="ShortForge Production Ecosystem Integrations"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="max-w-7xl mx-auto space-y-16">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-canvas-subtle border border-border text-xs font-mono font-medium text-stone">
            <span className="h-1.5 w-1.5 rounded-full bg-coral" />
            <span>ShortForge Production Ecosystem</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-ink leading-[1.12]">
            Integrated creative tools, <br />
            <span className="font-editorial italic font-normal text-coral">
              one unified production pipeline.
            </span>
          </h2>

          <p className="text-base text-stone leading-relaxed max-w-2xl mx-auto text-balance">
            ShortForge orchestrates genuine production APIs into an end-to-end studio. No disconnected browser tabs, no manual file copying, and no simulated outputs.
          </p>
        </div>

        {/* 1.1 Curved Spatial Integration Showcase */}
        <div className="relative pt-6 pb-4 select-none" ref={containerRef}>
          {/* Subtle curved track background guideline */}
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[780px] h-[340px] rounded-[50%] border border-border/50 pointer-events-none hidden md:block"
            style={{ clipPath: 'polygon(0% 40%, 100% 40%, 100% 100%, 0% 100%)' }}
          />

          {/* Curved Integration Tiles Container */}
          <div className="relative h-[240px] sm:h-[270px] flex items-center justify-center max-w-4xl mx-auto">
            {ECOSYSTEM_ITEMS.map((item, index) => {
              // Calculate circular offset relative to activeIndex
              let diff = index - activeIndex;
              // Wrap around shortest path
              if (diff > totalItems / 2) diff -= totalItems;
              if (diff < -totalItems / 2) diff += totalItems;

              const isActive = diff === 0;
              const isVisible = Math.abs(diff) <= 3;

              if (!isVisible) return null;

              // Compute mathematical arc positions
              // Parabolic curve: y = diff^2 * factor
              // Rotation: diff * angle
              // X: diff * horizontal spacing
              const xDesktop = diff * 125;
              const yDesktop = Math.pow(diff, 2) * 9.5;
              const rotateDesktop = diff * 5.5;
              const scaleDesktop = isActive ? 1.1 : 1 - Math.abs(diff) * 0.08;
              const opacityDesktop = isActive ? 1 : Math.max(0.4, 0.95 - Math.abs(diff) * 0.18);
              const zIndex = 10 - Math.abs(diff);

              const Icon = item.icon;

              return (
                <motion.button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveIndex(index)}
                  className={cn(
                    'absolute p-3.5 sm:p-4 rounded-xl border text-left cursor-pointer transition-colors',
                    'flex flex-col items-center justify-center gap-2.5 shadow-sm',
                    isActive
                      ? 'bg-surface border-coral shadow-md ring-2 ring-coral/20'
                      : 'bg-surface/90 border-border hover:border-coral/40 hover:bg-surface'
                  )}
                  style={{
                    zIndex,
                    width: '104px',
                    height: '112px',
                  }}
                  animate={
                    shouldReduce
                      ? { opacity: opacityDesktop }
                      : {
                          x: xDesktop,
                          y: yDesktop,
                          rotate: rotateDesktop,
                          scale: scaleDesktop,
                          opacity: opacityDesktop,
                        }
                  }
                  transition={{
                    type: 'spring',
                    stiffness: 320,
                    damping: 28,
                    mass: 0.8,
                  }}
                  whileHover={shouldReduce ? undefined : { scale: scaleDesktop * 1.05 }}
                  aria-pressed={isActive}
                  aria-label={`${item.name} (${item.category})`}
                >
                  <div
                    className={cn(
                      'h-11 w-11 rounded-lg flex items-center justify-center transition-all',
                      isActive ? 'shadow-xs' : ''
                    )}
                    style={{
                      backgroundColor: isActive ? item.bgLight : 'rgba(37, 33, 31, 0.04)',
                      color: item.accentColor,
                    }}
                  >
                    <Icon className="h-6 w-6 stroke-[1.8]" />
                  </div>

                  <span
                    className={cn(
                      'text-[11px] font-bold text-center leading-tight line-clamp-2',
                      isActive ? 'text-ink' : 'text-stone'
                    )}
                  >
                    {item.name.split(' ')[0]}
                  </span>

                  {isActive && (
                    <motion.div
                      layoutId="active-indicator-dot"
                      className="absolute -bottom-1.5 h-1.5 w-6 rounded-full bg-coral"
                      transition={{ duration: 0.25 }}
                    />
                  )}
                </motion.button>
              );
            })}
          </div>

          {/* Navigation Controls & Autoplay Indicator */}
          <div className="flex items-center justify-center gap-4 mt-4">
            <button
              type="button"
              onClick={prevItem}
              className="h-8 w-8 rounded-full border border-border bg-surface text-stone hover:text-ink hover:border-ink/40 flex items-center justify-center transition-colors shadow-xs"
              aria-label="Previous integration"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            {/* Pagination Dots */}
            <div className="flex items-center gap-1.5">
              {ECOSYSTEM_ITEMS.map((item, idx) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveIndex(idx)}
                  className={cn(
                    'h-1.5 rounded-full transition-all duration-300',
                    activeIndex === idx
                      ? 'w-6 bg-coral'
                      : 'w-1.5 bg-border hover:bg-stone-muted'
                  )}
                  aria-label={`Jump to ${item.name}`}
                />
              ))}
            </div>

            <button
              type="button"
              onClick={nextItem}
              className="h-8 w-8 rounded-full border border-border bg-surface text-stone hover:text-ink hover:border-ink/40 flex items-center justify-center transition-colors shadow-xs"
              aria-label="Next integration"
            >
              <ChevronRight className="h-4 w-4" />
            </button>

            <button
              type="button"
              onClick={() => setIsPaused(!isPaused)}
              className="ml-2 text-stone-muted hover:text-stone transition-colors p-1"
              title={isPaused ? 'Resume autoplay' : 'Pause autoplay'}
              aria-label={isPaused ? 'Resume autoplay' : 'Pause autoplay'}
            >
              {isPaused ? <Play className="h-3.5 w-3.5 fill-current" /> : <Pause className="h-3.5 w-3.5" />}
            </button>
          </div>
        </div>

        {/* Coordinated Active Detail Card */}
        <div className="max-w-3xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeItem.id}
              initial={shouldReduce ? { opacity: 0 } : { opacity: 0, y: 12, scale: 0.98 }}
              animate={shouldReduce ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
              exit={shouldReduce ? { opacity: 0 } : { opacity: 0, y: -12, scale: 0.98 }}
              transition={{ duration: motionTokens.duration.standard, ease: motionTokens.ease.editorial }}
              className="p-6 sm:p-8 rounded-xl bg-surface border border-border shadow-xs space-y-6"
            >
              {/* Active Header Row */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-5">
                <div className="flex items-center gap-3">
                  <div
                    className="h-12 w-12 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: activeItem.bgLight, color: activeItem.accentColor }}
                  >
                    <activeItem.icon className="h-6 w-6 stroke-[2]" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-mono font-bold text-coral uppercase tracking-wide">
                        {activeItem.badge}
                      </span>
                      <span className="text-border">•</span>
                      <span className="text-xs text-stone font-medium">{activeItem.category}</span>
                    </div>
                    <h3 className="text-xl font-bold text-ink mt-0.5">{activeItem.name}</h3>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-mono font-medium',
                      activeItem.statusType === 'live' || activeItem.statusType === 'native'
                        ? 'bg-moss/10 text-moss-dark border border-moss/20'
                        : 'bg-marigold/15 text-stone-dark border border-marigold/30'
                    )}
                  >
                    <span
                      className={cn(
                        'h-1.5 w-1.5 rounded-full',
                        activeItem.statusType === 'live' || activeItem.statusType === 'native'
                          ? 'bg-moss'
                          : 'bg-marigold-dark'
                      )}
                    />
                    {activeItem.statusText}
                  </span>
                </div>
              </div>

              {/* Role & Technical Architecture */}
              <div className="space-y-4">
                <p className="text-sm sm:text-base text-ink leading-relaxed">
                  {activeItem.role}
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  <div className="p-4 rounded-lg bg-canvas-subtle border border-border space-y-1.5">
                    <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-stone">
                      Engine Implementation
                    </span>
                    <p className="text-xs font-mono text-ink">
                      {activeItem.techStack}
                    </p>
                  </div>

                  <div className="p-4 rounded-lg bg-canvas-subtle border border-border space-y-2">
                    <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-stone">
                      Verified Capabilities
                    </span>
                    <ul className="space-y-1 text-xs text-stone">
                      {activeItem.details.map((detail, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <CheckCircle2 className="h-3.5 w-3.5 text-moss shrink-0 mt-0.5" />
                          <span>{detail}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Footer Action Row */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4 border-t border-border text-xs text-stone">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4 text-moss" />
                  <span>Real adapter pattern — no simulated responses.</span>
                </span>

                <Link
                  to={activeItem.actionLink}
                  className="btn-primary text-xs h-9 px-4 inline-flex items-center gap-2 self-start sm:self-auto"
                >
                  <span>{activeItem.actionLabel}</span>
                  <ExternalLink className="h-3.5 w-3.5" />
                </Link>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
