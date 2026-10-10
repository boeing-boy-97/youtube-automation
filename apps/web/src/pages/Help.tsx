import { useState } from 'react';
import { PageHeader } from '../components/common/PageHeader';
import { Card, CardContent } from '../components/ui/Card';
import {
  Search,
  ChevronDown,
  ChevronRight,
  BookOpen,
  Zap,
  Video,
  Play as YoutubeIcon,
  BarChart3,
  HelpCircle,
  Server,
  ShieldCheck,
  ExternalLink,
} from 'lucide-react';

const SECTIONS = [
  {
    icon: BookOpen,
    title: 'Platform Architecture & Getting Started',
    items: [
      {
        q: 'How does the ShortForge production pipeline work?',
        a: 'ShortForge combines a Fastify modular monolith backend, BullMQ Redis job queues, and Prisma PostgreSQL database. It coordinates OpenAI for structured script generation, ElevenLabs for neural voiceover synthesis, and FFmpeg for hardware-accelerated 1080x1920 9:16 vertical video compilation.',
      },
      {
        q: 'Where are API credentials configured?',
        a: 'Per our Zero-Trust Security Architecture, API keys (OpenAI, ElevenLabs, AWS S3/R2, Google OAuth) are stored strictly server-side in apps/api/.env or hosting environment variables. Client browsers never receive secret tokens or refresh keys.',
      },
      {
        q: 'How do I start generating vertical Shorts?',
        a: 'Navigate to "Create" in the sidebar or press "C". Define your hook or select an AI-generated concept, verify the 4-scene script structure, select your voice model, generate scene visuals, and execute the render pipeline.',
      },
    ],
  },
  {
    icon: Zap,
    title: 'Automation & Publishing Modes',
    items: [
      {
        q: 'What are Manual, Assisted, and Autonomous modes?',
        a: 'Manual mode gives you hands-on control over every scene and render stage. Assisted mode automatically generates scripts and visuals but pauses at Quality Control for human sign-off. Autonomous mode runs scheduled pipelines on background workers, running pre-export QC and publishing directly.',
      },
      {
        q: 'How does ShortForge prevent scheduling conflicts?',
        a: 'The Content Calendar automatically inspects scheduled upload slots. If two videos are scheduled within 2 hours of each other on the same channel, a conflict warning is surfaced with a 1-click auto-resolve action that applies safe 4-hour spacing to protect audience retention.',
      },
      {
        q: 'Can I emergency stop the automation engine?',
        a: 'Yes. At any time, you can click "Pause Engine" or "Emergency Stop" in the Automation Command Center or use the global Command Palette (Cmd+K). All active queue workers immediately freeze.',
      },
    ],
  },
  {
    icon: YoutubeIcon,
    title: 'YouTube OAuth & Publishing Integration',
    items: [
      {
        q: 'How do I connect my real YouTube channel?',
        a: 'Go to Settings → YouTube Integration or visit the YouTube page. Ensure GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET are configured in the backend environment. Click "Connect with Google OAuth" to authorize YouTube upload and analytics scopes via Google’s official OAuth 2.0 flow.',
      },
      {
        q: 'Which OAuth permissions does ShortForge require?',
        a: 'ShortForge adheres to the Google API Services User Data Policy, requesting only https://www.googleapis.com/auth/youtube.upload (to upload vertical Shorts) and https://www.googleapis.com/auth/youtube.readonly (to retrieve retention and view analytics).',
      },
      {
        q: 'How are OAuth refresh tokens secured?',
        a: 'All Google OAuth refresh tokens are encrypted at rest using AES-256-GCM before storage in the PostgreSQL database. Tokens are refreshed automatically via background workers with distributed Redis locks.',
      },
    ],
  },
  {
    icon: Video,
    title: 'Video Studio & FFmpeg Rendering',
    items: [
      {
        q: 'What video format and resolution does ShortForge produce?',
        a: 'Output files are rendered as MP4 containers using H.264 video codec and AAC stereo audio (48kHz) at native 1080x1920 (9:16 vertical aspect ratio), perfectly formatted for YouTube Shorts, Instagram Reels, and TikTok.',
      },
      {
        q: 'Can I regenerate a single scene without re-rendering the whole video?',
        a: 'Yes. In the Video Studio, open the Scene Storyboard on the left panel and click "Regen" on any scene. ShortForge will resynthesize that specific scene’s visual prompt or narration while preserving approved scenes.',
      },
      {
        q: 'How do automated captions work?',
        a: 'Captions are burned into the video stream using FFmpeg filtergraphs with subtitle styling presets (Bold, Minimal, Karaoke, Highlight, Clean). Captions are placed strictly within vertical safe zones so platform UI overlays do not obscure text.',
      },
    ],
  },
  {
    icon: ShieldCheck,
    title: 'Quality Assurance & Observability',
    items: [
      {
        q: 'What automated checks are performed prior to export?',
        a: 'ShortForge runs automated QC inspecting resolution bounds, -14.0 LUFS audio loudness compliance, speech duration synchronization, safe margin boundaries, and trigram duplicate detection against existing published titles.',
      },
      {
        q: 'How do I inspect live system health?',
        a: 'Visit Settings → Backend & API Health. ShortForge provides live diagnostics querying the Fastify server, PostgreSQL database connection, Redis BullMQ queues, and response latency.',
      },
    ],
  },
];

export function Help() {
  const [search, setSearch] = useState('');
  const [openItems, setOpenItems] = useState<Set<string>>(new Set(['0-0', '1-0', '2-0']));

  const toggle = (key: string) => {
    setOpenItems(prev => {
      const n = new Set(prev);
      if (n.has(key)) n.delete(key);
      else n.add(key);
      return n;
    });
  };

  const filtered = SECTIONS.map(s => ({
    ...s,
    items: s.items.filter(
      i =>
        !search ||
        i.q.toLowerCase().includes(search.toLowerCase()) ||
        i.a.toLowerCase().includes(search.toLowerCase())
    ),
  })).filter(s => s.items.length > 0);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <PageHeader
        title="Help & Documentation"
        description="Comprehensive technical guides, pipeline architecture, and integration troubleshooting."
      />

      <div className="relative max-w-lg">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
        <input
          placeholder="Search technical documentation, OAuth, or FFmpeg guides..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2 rounded-lg border border-border bg-surface text-xs placeholder:text-text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
        />
      </div>

      <div className="space-y-4">
        {filtered.map((section, sIdx) => {
          const Icon = section.icon;
          return (
            <Card key={section.title} className="overflow-hidden">
              <div className="p-4 border-b border-border bg-surface-subtle/50 flex items-center gap-2.5">
                <Icon className="h-4 w-4 text-accent" />
                <h3 className="font-semibold text-xs text-text-primary uppercase tracking-wider">{section.title}</h3>
              </div>
              <div className="divide-y divide-border">
                {section.items.map((item, iIdx) => {
                  const key = `${sIdx}-${iIdx}`;
                  const isOpen = openItems.has(key);
                  return (
                    <div key={item.q} className="p-4 transition-colors">
                      <button
                        type="button"
                        onClick={() => toggle(key)}
                        className="w-full flex items-center justify-between text-left gap-4"
                      >
                        <span className="text-xs font-semibold text-text-primary">{item.q}</span>
                        {isOpen ? (
                          <ChevronDown className="h-4 w-4 text-accent shrink-0" />
                        ) : (
                          <ChevronRight className="h-4 w-4 text-text-muted shrink-0" />
                        )}
                      </button>
                      {isOpen && (
                        <p className="text-xs text-text-secondary mt-2.5 leading-relaxed bg-surface-subtle p-3 rounded-md border border-border/60">
                          {item.a}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
