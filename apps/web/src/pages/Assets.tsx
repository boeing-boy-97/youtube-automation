import { useState } from 'react';
import { PageHeader } from '../components/common/PageHeader';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { EmptyState } from '../components/common/EmptyState';
import { cn } from '../lib/utils';
import { formatFileSize } from '../lib/formatters';
import {
  Upload,
  Search,
  Image,
  Video,
  Music,
  FileAudio,
  Type as TypeIcon,
  Star,
  Image as ImageIcon,
} from 'lucide-react';

const TABS = [
  { key: 'images', label: 'Images', icon: Image },
  { key: 'videos', label: 'Videos', icon: Video },
  { key: 'audio', label: 'Audio', icon: FileAudio },
  { key: 'music', label: 'Music', icon: Music },
  { key: 'fonts', label: 'Fonts', icon: TypeIcon },
  { key: 'logos', label: 'Logos', icon: ImageIcon },
] as const;

const mockAssets = [
  { id: 1, name: 'hook-bg-01.png', type: 'image', size: 240000, color: 'from-emerald-800 to-teal-600' },
  { id: 2, name: 'ai-tool-demo.png', type: 'image', size: 380000, color: 'from-slate-800 to-emerald-900' },
  { id: 3, name: 'tech-bg-pattern.png', type: 'image', size: 190000, color: 'from-gray-900 to-slate-800' },
  { id: 4, name: 'intro-music.mp3', type: 'music', size: 2400000 },
  { id: 5, name: 'voiceover-01.mp3', type: 'audio', size: 890000 },
];

export function Assets() {
  const [activeTab, setActiveTab] = useState<typeof TABS[number]['key']>('images');
  const [search, setSearch] = useState('');

  const filtered = mockAssets.filter(a => a.type === activeTab && (!search || a.name.toLowerCase().includes(search.toLowerCase())));
  const used = 1.4;
  const total = 10;

  return (
    <div className="space-y-5">
      <PageHeader
        title="Asset Manager"
        description="Manage images, videos, audio, and brand files."
        actions={<Button><Upload className="h-4 w-4" />Upload</Button>}
      />

      {/* Storage */}
      <Card className="p-4">
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <div className="flex justify-between text-xs mb-1.5">
              <span className="text-text-muted">Storage</span>
              <span className="text-text-primary font-medium">{used} GB / {total} GB</span>
            </div>
            <div className="h-2 bg-surface-subtle rounded-full overflow-hidden">
              <div className="h-full bg-accent rounded-full" style={{ width: `${(used/total)*100}%` }} />
            </div>
          </div>
        </div>
      </Card>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-border overflow-x-auto">
        {TABS.map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                'flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap -mb-px',
                activeTab === tab.key ? 'border-accent text-accent' : 'border-transparent text-text-secondary hover:text-text-primary'
              )}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      <div className="max-w-sm">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
          <input placeholder="Search assets..." value={search} onChange={e => setSearch(e.target.value)} className="w-full pl-9 pr-3 py-2 rounded-md border border-border bg-surface text-sm placeholder:text-text-muted focus:border-accent/40 focus:outline-none focus:ring-2 focus:ring-accent/20" />
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={Upload}
          title={`No ${activeTab} yet`}
          description="Upload files or they will appear as the engine generates visuals."
          action={{ label: 'Upload Files', onClick: () => {} }}
        />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {filtered.map(asset => (
            <Card key={asset.id} interactive className="overflow-hidden group">
              <div className={cn('aspect-square bg-gradient-to-br relative', asset.color || 'from-surface-muted to-surface')}>
                {asset.type !== 'image' ? (
                  <div className="absolute inset-0 flex items-center justify-center">
                    {asset.type === 'music' || asset.type === 'audio' ? <Music className="h-8 w-8 text-white/50" /> : <Video className="h-8 w-8 text-white/50" />}
                  </div>
                ) : null}
                <button className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 rounded-full bg-black/50 flex items-center justify-center">
                  <Star className="h-3 w-3 text-white" />
                </button>
              </div>
              <div className="p-2">
                <p className="text-xs font-medium text-text-primary truncate">{asset.name}</p>
                <p className="text-[10px] text-text-muted">{formatFileSize(asset.size)}</p>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Badge variant="default">DEMO MODE</Badge>
    </div>
  );
}
