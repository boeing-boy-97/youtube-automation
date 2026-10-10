import { useState, useRef, useEffect } from 'react';
import { PageHeader } from '../components/common/PageHeader';
import { Card } from '../components/ui/Card';
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
  Type as TypeIcon,
  Star,
  Image as ImageIcon,
  Trash2,
  ExternalLink,
} from 'lucide-react';

const TABS = [
  { key: 'images', label: 'Images', icon: Image },
  { key: 'videos', label: 'Videos', icon: Video },
  { key: 'audio', label: 'Voiceover', icon: FileAudio },
  { key: 'music', label: 'Background Music', icon: Music },
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
  { id: 'ast_1', name: 'hook-gradient-bg.png', type: 'images', size: 340000, gradient: 'from-emerald-900 to-teal-800', createdAt: '2 days ago' },
  { id: 'ast_2', name: 'code-editor-demo.png', type: 'images', size: 520000, gradient: 'from-slate-900 to-zinc-800', createdAt: '1 day ago' },
  { id: 'ast_3', name: 'ai-chip-abstract.png', type: 'images', size: 410000, gradient: 'from-teal-900 to-emerald-700', createdAt: 'Yesterday' },
  { id: 'ast_4', name: 'lofi-ambient-focus.mp3', type: 'music', size: 3200000, createdAt: '3 days ago' },
  { id: 'ast_5', name: 'neural-narration-01.wav', type: 'audio', size: 1400000, createdAt: 'Just now' },
  { id: 'ast_6', name: 'render-9-16-preview.mp4', type: 'videos', size: 14200000, gradient: 'from-slate-800 to-black', createdAt: 'Today' },
];

export function Assets() {
  const [activeTab, setActiveTab] = useState<typeof TABS[number]['key']>('images');
  const [search, setSearch] = useState('');
  const [assets, setAssets] = useState<AssetItem[]>(INITIAL_ASSETS);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const showToast = useUIStore(s => s.showToast);

  useEffect(() => {
    apiClient.get<any[]>('/assets')
      .then((items) => {
        if (Array.isArray(items) && items.length > 0) {
          const mapped: AssetItem[] = items.map((it: any) => {
            let t: 'images' | 'videos' | 'audio' | 'music' = 'images';
            if (it.type === 'VIDEO') t = 'videos';
            else if (it.type === 'AUDIO') {
              t = it.kind === 'MUSIC' ? 'music' : 'audio';
            }
            return {
              id: it.id,
              name: it.filename || 'asset.bin',
              type: t,
              size: it.sizeBytes || 0,
              createdAt: it.createdAt ? new Date(it.createdAt).toLocaleDateString() : 'Recent',
              gradient: 'from-slate-800 to-zinc-900',
            };
          });
          setAssets(mapped);
        }
      })
      .catch(() => undefined);
  }, []);

  const filtered = assets.filter(
    a => a.type === activeTab && (!search || a.name.toLowerCase().includes(search.toLowerCase()))
  );

  const totalBytes = assets.reduce((sum, a) => sum + a.size, 0);
  const usedMB = (totalBytes / (1024 * 1024)).toFixed(1);
  const quotaMB = 5000;

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    const mime = file.type;
    let type: 'images' | 'videos' | 'audio' | 'music' = 'images';
    if (mime.startsWith('video/')) type = 'videos';
    else if (mime.startsWith('audio/')) type = 'audio';

    setUploading(true);
    showToast({ type: 'info', title: 'Uploading', message: `Uploading ${file.name}...` });

    try {
      const formData = new FormData();
      formData.append('file', file);
      const token = localStorage.getItem('sf_auth_token');
      const wsId = localStorage.getItem('sf_active_workspace_id');

      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;
      if (wsId) headers['X-Workspace-Id'] = wsId;

      const res = await fetch('/api/v1/assets/upload', {
        method: 'POST',
        headers,
        body: formData,
        credentials: 'include',
      });

      if (res.ok) {
        const json = await res.json();
        const created = json.data;
        const newAsset: AssetItem = {
          id: created.id,
          name: created.filename || file.name,
          type,
          size: created.sizeBytes || file.size,
          gradient: 'from-emerald-800 to-slate-900',
          createdAt: 'Just now',
        };
        setAssets(prev => [newAsset, ...prev]);
        setActiveTab(type);
        showToast({ type: 'success', title: 'Upload complete', message: `${file.name} saved to workspace.` });
      } else {
        throw new Error('Upload rejected by server');
      }
    } catch (err: any) {
      showToast({ type: 'error', title: 'Upload failed', message: err.message || 'File upload failed.' });
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDeleteAsset = async (id: string) => {
    try {
      await apiClient.delete(`/assets/${id}`);
      setAssets(prev => prev.filter(a => a.id !== id));
      showToast({ type: 'info', title: 'Asset removed' });
    } catch {
      setAssets(prev => prev.filter(a => a.id !== id));
      showToast({ type: 'info', title: 'Asset removed from view' });
    }
  };

  return (
    <div className="space-y-5">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept="image/*,video/*,audio/*"
      />

      <PageHeader
        title="Asset Manager"
        description="Workspace media library: visual scenes, neural voiceover tracks, background music, and render artifacts."
        actions={
          <Button onClick={handleUploadClick}>
            <Upload className="h-4 w-4" /> Upload Asset
          </Button>
        }
      />

      {/* Storage Bar */}
      <Card className="p-4">
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <div className="flex justify-between text-xs mb-1.5">
              <span className="text-text-muted">Storage Utilization</span>
              <span className="text-text-primary font-mono font-medium">
                {usedMB} MB / {(quotaMB / 1024).toFixed(0)} GB ({((totalBytes / (quotaMB * 1024 * 1024)) * 100).toFixed(1)}%)
              </span>
            </div>
            <div className="h-2 bg-surface-subtle rounded-full overflow-hidden">
              <div
                className="h-full bg-accent rounded-full transition-all duration-300"
                style={{ width: `${Math.max(2, (totalBytes / (quotaMB * 1024 * 1024)) * 100)}%` }}
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-border overflow-x-auto">
        {TABS.map(tab => {
          const Icon = tab.icon;
          const count = assets.filter(a => a.type === tab.key).length;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                'flex items-center gap-2 px-4 py-2.5 text-xs font-medium border-b-2 transition-colors whitespace-nowrap -mb-px',
                activeTab === tab.key
                  ? 'border-accent text-accent font-semibold'
                  : 'border-transparent text-text-secondary hover:text-text-primary'
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              {tab.label}
              <span className="text-[10px] text-text-muted ml-0.5">({count})</span>
            </button>
          );
        })}
      </div>

      <div className="max-w-sm">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-text-muted" />
          <input
            placeholder={`Search ${activeTab}...`}
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-md border border-border bg-surface text-xs placeholder:text-text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={Upload}
          title={`No ${activeTab} yet`}
          description="Upload files directly or they will automatically register when scenes are generated."
          action={{ label: 'Upload Files', onClick: handleUploadClick }}
        />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {filtered.map(asset => (
            <Card key={asset.id} className="overflow-hidden group border border-border">
              <div className={cn('aspect-square bg-gradient-to-br relative flex items-center justify-center', asset.gradient || 'from-surface-muted to-surface')}>
                {asset.type !== 'images' ? (
                  <div className="flex items-center justify-center">
                    {asset.type === 'music' || asset.type === 'audio' ? (
                      <Music className="h-8 w-8 text-white/60" />
                    ) : (
                      <Video className="h-8 w-8 text-white/60" />
                    )}
                  </div>
                ) : (
                  <ImageIcon className="h-8 w-8 text-white/40" />
                )}

                <button
                  type="button"
                  onClick={() => handleDeleteAsset(asset.id)}
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 rounded bg-black/60 text-white flex items-center justify-center hover:bg-danger"
                  title="Delete Asset"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
              <div className="p-2.5">
                <p className="text-xs font-semibold text-text-primary truncate" title={asset.name}>
                  {asset.name}
                </p>
                <div className="flex justify-between items-center text-[10px] text-text-muted mt-1">
                  <span>{formatFileSize(asset.size)}</span>
                  <span>{asset.createdAt}</span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
