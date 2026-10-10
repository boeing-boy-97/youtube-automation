import { useState, useRef, useEffect } from 'react';
import { PageHeader } from '../components/common/PageHeader';
import { Button } from '../components/ui/Button';
import { EmptyState } from '../components/common/EmptyState';
import { useUIStore } from '../stores/uiStore';
import { apiClient } from '../services/apiClient';
import { cn } from '../lib/utils';
import { formatFileSize } from '../lib/formatters';
import {
  Upload,
  Search,
  Image,
  Video,
  Music,
  FileAudio,
  Trash2,
} from 'lucide-react';

const TABS = [
  { key: 'images', label: 'Scene Frames', icon: Image },
  { key: 'videos', label: 'Rendered Videos', icon: Video },
  { key: 'audio', label: 'Voiceover Audio', icon: FileAudio },
  { key: 'music', label: 'Background Audio', icon: Music },
] as const;

interface AssetItem {
  id: string;
  name: string;
  type: 'images' | 'videos' | 'audio' | 'music';
  size: number;
  url?: string;
  gradient?: string;
  createdAt: string;
}

const INITIAL_ASSETS: AssetItem[] = [
  { id: 'ast_1', name: 'hook-gradient-bg.png', type: 'images', size: 340000, gradient: 'from-stone-900 to-stone-800', createdAt: '2 days ago' },
  { id: 'ast_2', name: 'code-architecture-diagram.png', type: 'images', size: 520000, gradient: 'from-stone-900 to-stone-800', createdAt: '1 day ago' },
  { id: 'ast_3', name: 'mechanical-lens-macro.png', type: 'images', size: 410000, gradient: 'from-stone-900 to-stone-800', createdAt: 'Yesterday' },
  { id: 'ast_4', name: 'studio-ambient-track.mp3', type: 'music', size: 3200000, createdAt: '3 days ago' },
  { id: 'ast_5', name: 'neural-narration-master.wav', type: 'audio', size: 1400000, createdAt: 'Just now' },
  { id: 'ast_6', name: 'output-1080x1920-preview.mp4', type: 'videos', size: 14200000, gradient: 'from-stone-900 to-black', createdAt: 'Today' },
];

export function Assets() {
  const [activeTab, setActiveTab] = useState<(typeof TABS)[number]['key']>('images');
  const [search, setSearch] = useState('');
  const [assets, setAssets] = useState<AssetItem[]>(INITIAL_ASSETS);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const showToast = useUIStore((s) => s.showToast);

  useEffect(() => {
    apiClient
      .get<any[]>('/assets')
      .then((items) => {
        if (Array.isArray(items) && items.length > 0) {
          setAssets(
            items.map((i: any) => ({
              id: i.id,
              name: i.name || i.path?.split('/').pop() || 'Asset',
              type: i.mimeType?.startsWith('video')
                ? 'videos'
                : i.mimeType?.startsWith('audio')
                ? 'audio'
                : 'images',
              size: i.sizeBytes || 102400,
              url: i.url || i.path,
              createdAt: 'Recently synced',
            }))
          );
        }
      })
      .catch(() => {});
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const storedToken = localStorage.getItem('sf_auth_token');
      const res = await fetch('/api/v1/assets/upload', {
        method: 'POST',
        body: formData,
        headers: storedToken ? { Authorization: `Bearer ${storedToken}` } : {},
      }).then((r) => (r.ok ? r.json() : null));

      const newAsset: AssetItem = {
        id: res?.id || `ast_${Date.now()}`,
        name: file.name,
        type: file.type.startsWith('image')
          ? 'images'
          : file.type.startsWith('video')
          ? 'videos'
          : 'audio',
        size: file.size,
        url: res?.url || URL.createObjectURL(file),
        createdAt: 'Just now',
      };
      setAssets((prev) => [newAsset, ...prev]);
      showToast({ type: 'success', title: 'Asset Uploaded', message: `${file.name} saved to media library.` });
    } catch {
      showToast({ type: 'error', title: 'Upload Failed', message: 'Could not upload file.' });
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDelete = (id: string, name: string) => {
    setAssets((prev) => prev.filter((a) => a.id !== id));
    showToast({ type: 'info', title: 'Asset Deleted', message: `${name} removed.` });
  };

  const filtered = assets.filter((a) => {
    if (activeTab === 'images') return a.type === 'images';
    if (activeTab === 'videos') return a.type === 'videos';
    if (activeTab === 'audio') return a.type === 'audio';
    if (activeTab === 'music') return a.type === 'music';
    return true;
  }).filter((a) => a.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Assets & Media Library"
        description="Scene background frames, synthesized voice masters, and rendered deliverables."
        actions={
          <div>
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              onChange={handleFileUpload}
            />
            <Button
              onClick={() => fileInputRef.current?.click()}
              loading={uploading}
              className="btn-primary h-9 px-4 text-xs"
            >
              <Upload className="h-3.5 w-3.5" />
              <span>Upload Media</span>
            </Button>
          </div>
        }
      />

      {/* Tabs & Search */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-border pb-3">
        <div className="flex items-center gap-1 overflow-x-auto">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const count = assets.filter((a) => a.type === tab.key).length;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all border',
                  activeTab === tab.key
                    ? 'bg-surface border-coral text-coral font-semibold shadow-xs'
                    : 'bg-canvas-subtle border-border text-stone hover:text-ink'
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{tab.label}</span>
                <span className="text-[10px] font-mono text-stone-muted ml-1">({count})</span>
              </button>
            );
          })}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-stone-muted" />
          <input
            type="search"
            placeholder="Filter assets..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-8 pl-8 pr-3 text-xs rounded-md border border-border bg-surface text-ink placeholder:text-stone-muted focus:border-coral focus:outline-none"
          />
        </div>
      </div>

      {/* Assets Grid */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={Image}
          title={`No ${activeTab} found`}
          description="Upload media assets or generate visual scenes to view them here."
          action={{ label: 'Upload Media', onClick: () => fileInputRef.current?.click() }}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="p-4 rounded-xl bg-surface border border-border shadow-xs hover:border-coral/50 transition-all flex flex-col justify-between space-y-3"
            >
              <div
                className={cn(
                  'aspect-video rounded-lg flex items-center justify-center text-white/50 bg-gradient-to-br',
                  item.gradient || 'from-stone-900 to-black'
                )}
              >
                {item.type === 'videos' ? (
                  <Video className="h-8 w-8 text-coral" />
                ) : item.type === 'audio' || item.type === 'music' ? (
                  <FileAudio className="h-8 w-8 text-moss" />
                ) : (
                  <Image className="h-8 w-8 text-marigold" />
                )}
              </div>

              <div className="space-y-1">
                <span className="text-xs font-semibold text-ink truncate block">
                  {item.name}
                </span>
                <div className="flex items-center justify-between text-[10px] font-mono text-stone-muted">
                  <span>{formatFileSize(item.size)}</span>
                  <span>{item.createdAt}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-border flex justify-end">
                <button
                  type="button"
                  onClick={() => handleDelete(item.id, item.name)}
                  className="p-1 rounded text-stone hover:text-danger transition-colors"
                  title="Delete asset"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
