import { useState } from 'react';
import { useAuthStore } from '../stores/authStore';
import { useWorkspaceStore } from '../stores/workspaceStore';
import { useUIStore } from '../stores/uiStore';
import { PageHeader } from '../components/common/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { cn } from '../lib/utils';
import { PROVIDERS, PLANS } from '../lib/constants';
import {
  User,
  Building2,
  Target,
  Cpu,
  Mic,
  Image as ImageIcon,
  Video,
  Play as YoutubeIcon,
  Bell,
  Palette,
  Shield,
  CreditCard,
  AlertTriangle,
  Moon,
  Sun,
  LogOut,
  CheckCircle,
  Trash2,
} from 'lucide-react';

const SECTIONS = [
  { key: 'profile', label: 'Profile', icon: User },
  { key: 'workspace', label: 'Workspace', icon: Building2 },
  { key: 'strategy', label: 'Content Strategy', icon: Target },
  { key: 'ai', label: 'AI Providers', icon: Cpu },
  { key: 'voice', label: 'Voice', icon: Mic },
  { key: 'visual', label: 'Visual Generation', icon: ImageIcon },
  { key: 'video', label: 'Video Rendering', icon: Video },
  { key: 'youtube', label: 'YouTube', icon: YoutubeIcon },
  { key: 'notifications', label: 'Notifications', icon: Bell },
  { key: 'brand', label: 'Brand', icon: Palette },
  { key: 'security', label: 'Security', icon: Shield },
  { key: 'billing', label: 'Billing', icon: CreditCard },
  { key: 'danger', label: 'Danger Zone', icon: AlertTriangle },
];

export function Settings() {
  const [activeSection, setActiveSection] = useState('profile');
  const { user, logout } = useAuthStore();
  const workspace = useWorkspaceStore(s => s.workspace);
  const youtube = useWorkspaceStore(s => s.youtubeChannel);
  const { theme, toggleTheme } = useUIStore();
  const resetDemoData = useWorkspaceStore(s => s.resetDemoData);
  const navigate = (path: string) => { window.location.href = path; };

  return (
    <div className="grid lg:grid-cols-[240px_1fr] gap-6">
      <nav className="space-y-1">
        <PageHeader title="Settings" description="" className="lg:hidden" />
        {SECTIONS.map(s => {
          const Icon = s.icon;
          return (
            <button
              key={s.key}
              onClick={() => setActiveSection(s.key)}
              className={cn(
                'w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-sm font-medium transition-colors text-left',
                activeSection === s.key ? 'bg-accent/10 text-accent' : 'text-text-secondary hover:bg-surface-subtle hover:text-text-primary'
              )}
            >
              <Icon className="h-4 w-4" />
              {s.label}
            </button>
          );
        })}
      </nav>

      <div className="space-y-5">
        {activeSection === 'profile' && (
          <Card>
            <CardHeader><CardTitle>Profile</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <Input label="Name" defaultValue={user?.name} />
              <Input label="Email" defaultValue={user?.email} type="email" />
              <Button>Save Changes</Button>
            </CardContent>
          </Card>
        )}

        {activeSection === 'workspace' && (
          <Card>
            <CardHeader><CardTitle>Workspace</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <Input label="Channel Name" defaultValue={workspace?.channelName} />
              <Input label="Niche" defaultValue={workspace?.niche} />
              <Input label="Target Audience" defaultValue={workspace?.targetAudience} />
              <Button>Save Changes</Button>
            </CardContent>
          </Card>
        )}

        {activeSection === 'strategy' && (
          <Card>
            <CardHeader><CardTitle>Content Strategy</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <span className="label mb-2 block">Content Pillars</span>
                  <div className="flex flex-wrap gap-1.5">
                    {workspace?.pillars.map(p => <Badge key={p.id} variant="accent">{p.name}</Badge>)}
                  </div>
                </div>
                <p className="text-sm text-text-muted">Configure pillars during onboarding or brand kit.</p>
              </div>
            </CardContent>
          </Card>
        )}

        {(activeSection === 'ai' || activeSection === 'voice' || activeSection === 'visual' || activeSection === 'video') && (
          <ProviderSection type={activeSection as 'ai' | 'voice' | 'visual' | 'video'} />
        )}

        {activeSection === 'youtube' && (
          <Card>
            <CardHeader><CardTitle>YouTube</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {youtube?.connectionStatus === 'connected' ? (
                <div className="p-4 rounded-lg bg-success/5 border border-success/20 flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-success" />
                  <div>
                    <p className="text-sm font-medium text-text-primary">Connected to {youtube.title}</p>
                    <p className="text-xs text-text-muted">{youtube.subscriberCount?.toLocaleString()} subscribers</p>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-lg bg-surface-subtle text-center">
                  <p className="text-sm text-text-secondary">Not connected</p>
                  <Button className="mt-3"><YoutubeIcon className="h-4 w-4" />Connect YouTube</Button>
                </div>
              )}
              <p className="text-xs text-text-muted">API keys are managed server-side and never exposed in the frontend.</p>
            </CardContent>
          </Card>
        )}

        {activeSection === 'notifications' && (
          <Card>
            <CardHeader><CardTitle>Notifications</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {['Video ready', 'Render completed', 'Upload completed', 'Approval required', 'Provider errors'].map(n => (
                <label key={n} className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" defaultChecked className="h-4 w-4 rounded border-border text-accent" />
                  <span className="text-sm text-text-primary">{n}</span>
                </label>
              ))}
            </CardContent>
          </Card>
        )}

        {activeSection === 'brand' && (
          <Card>
            <CardHeader><CardTitle>Brand</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <Input label="Brand Name" defaultValue={workspace?.brand.name} />
              <div>
                <label className="label mb-1.5 block">Primary Accent</label>
                <input type="color" defaultValue={workspace?.brand.primaryAccent} className="h-10 w-16 rounded-md border border-border cursor-pointer" />
              </div>
              <Button>Save Brand</Button>
            </CardContent>
          </Card>
        )}

        {activeSection === 'security' && (
          <Card>
            <CardHeader><CardTitle>Security</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="p-3 rounded-md bg-surface-subtle/50 text-sm text-text-secondary">
                <Shield className="h-4 w-4 inline mr-2 text-success" />
                Your session is secure. Demo mode uses local storage only.
              </div>
              <Button variant="secondary">Change Password</Button>
            </CardContent>
          </Card>
        )}

        {activeSection === 'billing' && (
          <Card>
            <CardHeader><CardTitle>Billing</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <Badge variant="accent">DEMO BILLING</Badge>
              <div className="grid md:grid-cols-3 gap-3">
                {PLANS.map(plan => (
                  <div key={plan.id} className={cn('rounded-lg border p-4', plan.popular ? 'border-accent bg-accent-soft/40' : 'border-border')}>
                    <div className="font-semibold text-text-primary">{plan.name}</div>
                    <div className="text-2xl font-bold text-text-primary my-1">{plan.price === 0 ? 'Free' : `$${plan.price}`}</div>
                    <div className="text-xs text-text-muted mb-3">{plan.description}</div>
                    <Button variant={plan.popular ? 'primary' : 'secondary'} size="sm" className="w-full">
                      {user?.plan === plan.id ? 'Current Plan' : 'Upgrade'}
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {activeSection === 'danger' && (
          <div className="space-y-4">
            <Card>
              <CardHeader><CardTitle>Appearance</CardTitle></CardHeader>
              <CardContent>
                <Button variant="secondary" onClick={toggleTheme}>
                  {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                  Switch to {theme === 'dark' ? 'Light' : 'Dark'} Mode
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Reset Demo Data</CardTitle></CardHeader>
              <CardContent>
                <p className="text-sm text-text-secondary mb-3">Clear all demo content, ideas, jobs, and settings, and restart onboarding.</p>
                <Button variant="danger" onClick={() => { resetDemoData(); navigate('/onboarding'); }}>
                  <Trash2 className="h-4 w-4" />Reset Demo Data
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Log Out</CardTitle></CardHeader>
              <CardContent>
                <Button variant="secondary" onClick={() => { logout(); navigate('/login'); }}>
                  <LogOut className="h-4 w-4" />Log Out
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

function ProviderSection({ type }: { type: 'ai' | 'voice' | 'visual' | 'video' }) {
  const providers = PROVIDERS[type];
  const titles = { ai: 'AI Providers', voice: 'Voice Providers', visual: 'Visual Generation', video: 'Video Rendering' };
  return (
    <Card>
      <CardHeader><CardTitle>{titles[type]}</CardTitle></CardHeader>
      <CardContent className="space-y-3">
        {providers.map(p => (
          <div key={p.id} className="flex items-center justify-between p-3 rounded-md border border-border">
            <div>
              <div className="text-sm font-medium text-text-primary">{p.name}</div>
              <div className="text-xs text-text-muted">{p.id}</div>
            </div>
            {p.status === 'connected' ? (
              <Badge variant="success"><CheckCircle className="h-3 w-3" />Connected</Badge>
            ) : (
              <Button variant="secondary" size="sm">Connect</Button>
            )}
          </div>
        ))}
        <p className="text-xs text-text-muted mt-2">API keys are managed securely on the backend and never exposed to the browser.</p>
      </CardContent>
    </Card>
  );
}
