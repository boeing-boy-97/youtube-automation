import { useState } from 'react';
import { PageHeader } from '../components/common/PageHeader';
import { Card, CardContent } from '../components/ui/Card';
import { Search, ChevronDown, ChevronRight, BookOpen, Zap, Video, Play,  BarChart3, HelpCircle } from 'lucide-react';

const SECTIONS = [
  { icon: BookOpen, title: 'Getting Started', items: [
    { q: 'How do I set up my channel?', a: 'Complete the onboarding flow: connect YouTube, set your niche, choose content pillars, configure your voice and brand.' },
    { q: 'What is demo mode?', a: 'Demo mode simulates all backend operations locally. No real API calls are made to YouTube, AI providers, or TTS services. Your data is persisted in local storage.' },
    { q: 'How do I create my first video?', a: 'Click Create in the sidebar. Follow the guided workflow: idea → strategy → script → voice → visuals → edit → quality → publish.' },
  ]},
  { icon: Zap, title: 'Automation', items: [
    { q: 'What is the difference between Manual, Assisted, and Autonomous?', a: 'Manual requires you to trigger each step. Assisted generates content automatically but asks for approval. Autonomous generates, approves, and publishes without intervention.' },
    { q: 'Is autonomous mode safe?', a: 'You can stop the engine at any time with the Emergency Stop button. We recommend starting with Assisted mode to build confidence.' },
    { q: 'How often does the engine run?', a: 'Configure your posting frequency and times in Publishing Settings. The engine respects your daily limits.' },
  ]},
  { icon: Video, title: 'Content & Video Studio', items: [
    { q: 'How do renders work in demo mode?', a: 'Renders simulate the real process with staged progress updates. No actual video file is generated, but all status transitions and timing behave realistically.' },
    { q: 'Can I edit scripts manually?', a: 'Yes. Open Script Lab to edit, request AI improvements, and view metrics like hook strength and readability.' },
  ]},
  { icon: Play,  title: 'YouTube', items: [
    { q: 'Will ShortForge publish to my real channel?', a: 'In demo mode, no. Publishing is fully simulated. When a real backend is connected, publishing will follow YouTube API guidelines and require proper OAuth.' },
  ]},
  { icon: BarChart3, title: 'Analytics', items: [
    { q: 'Where do analytics numbers come from?', a: 'Demo data is seeded to be coherent and demonstrate what real analytics will look like. The learning engine will analyze your patterns.' },
  ]},
  { icon: HelpCircle, title: 'Troubleshooting', items: [
    { q: 'My render failed. What now?', a: 'Click Retry from the content details or queue page. In demo mode, failures are random to demonstrate error recovery.' },
    { q: 'How do I reset everything?', a: 'Go to Settings → Danger Zone → Reset Demo Data. This clears all content and returns you to onboarding.' },
    { q: 'My data disappeared after refresh?', a: 'Check that your browser allows local storage. All demo data is persisted in localStorage for your session.' },
  ]},
];

export function Help() {
  const [search, setSearch] = useState('');
  const [openItems, setOpenItems] = useState<Set<string>>(new Set());

  const toggle = (key: string) => {
    setOpenItems(prev => {
      const n = new Set(prev);
      if (n.has(key)) n.delete(key); else n.add(key);
      return n;
    });
  };

  const filtered = SECTIONS.map(s => ({
    ...s,
    items: s.items.filter(i => !search || i.q.toLowerCase().includes(search.toLowerCase()) || i.a.toLowerCase().includes(search.toLowerCase())),
  })).filter(s => s.items.length > 0);

  return (
    <div className="space-y-5 max-w-3xl">
      <PageHeader title="Help Center" description="Documentation, guides, and troubleshooting." />

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
        <input
          placeholder="Search help..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-3 rounded-lg border border-border bg-surface text-sm placeholder:text-text-muted focus:border-accent/40 focus:outline-none focus:ring-2 focus:ring-accent/20"
        />
      </div>

      {filtered.map(section => {
        const Icon = section.icon;
        return (
          <Card key={section.title}>
            <div className="px-5 py-4 border-b border-border flex items-center gap-2">
              <Icon className="h-4 w-4 text-accent" />
              <h3 className="font-semibold text-text-primary">{section.title}</h3>
            </div>
            <CardContent className="p-0">
              {section.items.map((item, i) => {
                const key = `${section.title}-${i}`;
                const isOpen = openItems.has(key);
                return (
                  <div key={key} className="border-b border-border last:border-0">
                    <button onClick={() => toggle(key)} className="w-full flex items-center justify-between px-5 py-3 text-left hover:bg-surface-subtle transition-colors">
                      <span className="text-sm font-medium text-text-primary">{item.q}</span>
                      {isOpen ? <ChevronDown className="h-4 w-4 text-text-muted shrink-0" /> : <ChevronRight className="h-4 w-4 text-text-muted shrink-0" />}
                    </button>
                    {isOpen && (
                      <div className="px-5 pb-4">
                        <p className="text-sm text-text-secondary leading-relaxed">{item.a}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
