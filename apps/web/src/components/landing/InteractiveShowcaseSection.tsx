import { useState } from 'react';
import {
  Lightbulb,
  FileText,
  Volume2,
  Film,
  Sliders,
  Send,
  Play,
  Pause,
  Check,
  ArrowRight,
} from 'lucide-react';
import { cn } from '../../lib/utils';

export function InteractiveShowcaseSection() {
  const [activeTab, setActiveTab] = useState<'ideas' | 'script' | 'voice' | 'visuals' | 'timeline' | 'publish'>('ideas');

  const [selectedTopic, setSelectedTopic] = useState(0);
  const [activeVoice, setActiveVoice] = useState<'adam' | 'rachel' | 'antoni'>('adam');
  const [voicePlaying, setVoicePlaying] = useState(false);
  const [captionPreset, setCaptionPreset] = useState<'clean' | 'impact' | 'minimal'>('clean');

  const topics = [
    { title: 'Why asynchronous architectures outperform microservices', category: 'Backend Architecture', duration: '45s' },
    { title: 'The first 3 seconds: Anatomy of a viral hook', category: 'Creator Strategy', duration: '40s' },
    { title: 'Argon2id vs Bcrypt: Cryptographic security in 2026', category: 'Engineering Security', duration: '48s' },
  ];

  return (
    <section id="studio" className="py-20 px-4 sm:px-6 lg:px-8 bg-canvas text-ink border-t border-border">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Section Header */}
        <div className="max-w-2xl space-y-3">
          <span className="text-xs font-mono font-semibold uppercase tracking-wider text-vermilion">
            Interactive Studio Engine
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-ink leading-tight">
            Creative control across <br />
            <span className="font-editorial italic font-normal text-vermilion">every production layer.</span>
          </h2>
          <p className="text-base text-stone leading-relaxed">
            ShortForge gives creators direct oversight at every stage, from hook writing to subtitle placement. Explore each studio layer below.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center justify-start overflow-x-auto pb-1">
          <div className="flex items-center gap-1.5 p-1 bg-canvas-subtle rounded-lg border border-border">
            {[
              { id: 'ideas', label: '1. Concept Lab', icon: Lightbulb },
              { id: 'script', label: '2. Script Studio', icon: FileText },
              { id: 'voice', label: '3. Neural Voice', icon: Volume2 },
              { id: 'visuals', label: '4. Visual Director', icon: Film },
              { id: 'timeline', label: '5. Subtitles & Cuts', icon: Sliders },
              { id: 'publish', label: '6. Auto-Publish', icon: Send },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id as any)}
                  className={cn(
                    'flex items-center gap-2 px-3.5 py-2 rounded-md text-xs font-medium transition-all whitespace-nowrap',
                    isActive
                      ? 'bg-surface text-ink shadow-xs border border-border font-semibold'
                      : 'text-stone hover:text-ink'
                  )}
                >
                  <Icon className={cn('h-3.5 w-3.5', isActive ? 'text-vermilion' : 'text-stone')} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Studio Layer Canvas */}
        <div className="p-6 sm:p-8 rounded-xl bg-surface border border-border shadow-xs">
          {/* TAB 1: Concept Lab */}
          {activeTab === 'ideas' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-4">
                <div>
                  <h3 className="text-lg font-bold text-ink">Concept Lab</h3>
                  <p className="text-xs text-stone">Filter topics by content pillars, hook intrigue, and estimated duration.</p>
                </div>
                <span className="text-xs font-mono text-vermilion">STAGE 01</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {topics.map((t, idx) => (
                  <div
                    key={idx}
                    onClick={() => setSelectedTopic(idx)}
                    className={cn(
                      'p-4 rounded-lg border text-left cursor-pointer transition-all space-y-2',
                      selectedTopic === idx
                        ? 'bg-canvas-subtle border-vermilion/50 shadow-xs'
                        : 'bg-surface border-border hover:border-border-strong'
                    )}
                  >
                    <div className="flex items-center justify-between text-[11px] text-stone">
                      <span className="font-mono">{t.category}</span>
                      <span className="font-mono text-vermilion">{t.duration}</span>
                    </div>
                    <div className="text-sm font-semibold text-ink line-clamp-2">{t.title}</div>
                    <div className="text-[11px] text-stone-muted pt-1 border-t border-border">
                      {selectedTopic === idx ? 'Selected for production' : 'Click to select concept'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: Script Studio */}
          {activeTab === 'script' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-4">
                <div>
                  <h3 className="text-lg font-bold text-ink">Script Studio</h3>
                  <p className="text-xs text-stone">3-Act screenplay drafting with strict 145 WPM pacing control.</p>
                </div>
                <span className="text-xs font-mono text-vermilion">STAGE 02</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-md bg-canvas-subtle border border-border space-y-2">
                  <div className="text-xs font-mono font-semibold text-vermilion">ACT I: HOOK (0:00 - 0:04)</div>
                  <p className="text-xs text-ink leading-relaxed font-sans">
                    "If your dev team is still writing boilerplate by hand in 2026, stop immediately."
                  </p>
                  <div className="text-[11px] text-stone-muted pt-2 border-t border-border">
                    Curiosity opening without greetings.
                  </div>
                </div>

                <div className="p-4 rounded-md bg-canvas-subtle border border-border space-y-2">
                  <div className="text-xs font-mono font-semibold text-stone">ACT II: BODY (0:04 - 0:28)</div>
                  <p className="text-xs text-ink leading-relaxed font-sans">
                    "Most developers waste three hours configuring agent memory. In reality, a persistent SQLite graph solves this in 40 lines of code."
                  </p>
                  <div className="text-[11px] text-stone-muted pt-2 border-t border-border">
                    Contrarian truth with concrete proof.
                  </div>
                </div>

                <div className="p-4 rounded-md bg-canvas-subtle border border-border space-y-2">
                  <div className="text-xs font-mono font-semibold text-stone">ACT III: LOOP (0:28 - 0:45)</div>
                  <p className="text-xs text-ink leading-relaxed font-sans">
                    "Here is the repository template. Clone it before your next sprint."
                  </p>
                  <div className="text-[11px] text-stone-muted pt-2 border-t border-border">
                    Clear call to action feeding seamless replay.
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Neural Voice */}
          {activeTab === 'voice' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-4">
                <div>
                  <h3 className="text-lg font-bold text-ink">Neural Voice Direction</h3>
                  <p className="text-xs text-stone">ElevenLabs voice synthesis with breath-accurate cadence.</p>
                </div>
                <span className="text-xs font-mono text-vermilion">STAGE 03</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {[
                  { id: 'adam', name: 'Adam', style: 'Authoritative Tech', desc: 'Direct, clear, low pitch' },
                  { id: 'rachel', name: 'Rachel', style: 'Conversational', desc: 'Engaging, friendly narrative' },
                  { id: 'antoni', name: 'Antoni', style: 'Fast Narrative', desc: 'Dynamic, high-energy pacing' },
                ].map((v) => (
                  <div
                    key={v.id}
                    onClick={() => setActiveVoice(v.id as any)}
                    className={cn(
                      'p-4 rounded-lg border text-left cursor-pointer transition-all space-y-2',
                      activeVoice === v.id
                        ? 'bg-canvas-subtle border-vermilion/50 shadow-xs'
                        : 'bg-surface border-border hover:border-border-strong'
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-sm text-ink">{v.name}</span>
                      <span className="text-xs text-vermilion font-mono">{v.style}</span>
                    </div>
                    <div className="text-xs text-stone">{v.desc}</div>
                    <div className="pt-2 border-t border-border flex items-center justify-between text-[11px]">
                      <span className="text-stone-muted">48kHz Master</span>
                      {activeVoice === v.id && <span className="text-vermilion font-medium">Selected</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: Visual Director */}
          {activeTab === 'visuals' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-4">
                <div>
                  <h3 className="text-lg font-bold text-ink">Visual Scene Directing</h3>
                  <p className="text-xs text-stone">9:16 portrait scene composition tailored to vertical platforms.</p>
                </div>
                <span className="text-xs font-mono text-vermilion">STAGE 04</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { scene: 'Scene 01', prompt: 'Macro focus on spinning mechanical gears in warm cinematic studio lighting', duration: '0:00 - 0:04' },
                  { scene: 'Scene 02', prompt: 'Isometric workstation showing architecture diagram with flowing data lines', duration: '0:04 - 0:28' },
                  { scene: 'Scene 03', prompt: 'Clean code terminal displaying successful build confirmation and telemetry', duration: '0:28 - 0:45' },
                ].map((s, idx) => (
                  <div key={idx} className="p-4 rounded-md bg-canvas-subtle border border-border space-y-2">
                    <div className="flex items-center justify-between text-xs font-mono text-stone">
                      <span className="font-semibold text-ink">{s.scene}</span>
                      <span>{s.duration}</span>
                    </div>
                    <p className="text-xs text-stone leading-relaxed font-mono">{s.prompt}</p>
                    <div className="text-[11px] text-vermilion font-mono pt-1">Resolution: 1080×1920</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: Subtitles & Cuts */}
          {activeTab === 'timeline' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-4">
                <div>
                  <h3 className="text-lg font-bold text-ink">Kinetic Subtitles & Safe-Zone Alignment</h3>
                  <p className="text-xs text-stone">Frame-accurate subtitle styling burned into YouTube Shorts safe zones.</p>
                </div>
                <span className="text-xs font-mono text-vermilion">STAGE 05</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {[
                  { id: 'clean', name: 'Clean Sans', font: 'Inter 600', desc: 'Minimalist high-contrast subtitles for educational content' },
                  { id: 'impact', name: 'Impact Bold', font: 'Montserrat 800', desc: 'Bold kinetic pop-ins with drop shadow for storytelling' },
                  { id: 'minimal', name: 'Editorial Serif', font: 'Newsreader Italic', desc: 'Refined literary typography for documentary shorts' },
                ].map((preset) => (
                  <div
                    key={preset.id}
                    onClick={() => setCaptionPreset(preset.id as any)}
                    className={cn(
                      'p-4 rounded-lg border text-left cursor-pointer transition-all space-y-2',
                      captionPreset === preset.id
                        ? 'bg-canvas-subtle border-vermilion/50 shadow-xs'
                        : 'bg-surface border-border hover:border-border-strong'
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-sm text-ink">{preset.name}</span>
                      <span className="text-xs text-vermilion font-mono">{preset.font}</span>
                    </div>
                    <p className="text-xs text-stone leading-relaxed">{preset.desc}</p>
                    <div className="pt-2 border-t border-border flex items-center justify-between text-[11px]">
                      <span className="text-stone-muted">Safe-Zone Check</span>
                      <span className="text-success font-medium">Verified</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 6: Auto-Publish */}
          {activeTab === 'publish' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-4">
                <div>
                  <h3 className="text-lg font-bold text-ink">Authorized YouTube Publishing</h3>
                  <p className="text-xs text-stone">Direct OAuth upload with scheduling slots and privacy settings.</p>
                </div>
                <span className="text-xs font-mono text-vermilion">STAGE 06</span>
              </div>

              <div className="p-4 rounded-md bg-canvas-subtle border border-border space-y-3">
                <div className="flex items-center justify-between text-xs text-stone border-b border-border pb-2">
                  <span className="font-semibold text-ink">Connected Destination</span>
                  <span className="text-vermilion font-mono">Google OAuth v3</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-stone">
                  <div>
                    <span className="text-stone-muted block">Visibility Mode:</span>
                    <span className="font-semibold text-ink">Public YouTube Short</span>
                  </div>
                  <div>
                    <span className="text-stone-muted block">Target Slot:</span>
                    <span className="font-semibold text-ink">Daily 18:30 UTC</span>
                  </div>
                  <div>
                    <span className="text-stone-muted block">Quality Check:</span>
                    <span className="text-success font-semibold">ffprobe Passed</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
