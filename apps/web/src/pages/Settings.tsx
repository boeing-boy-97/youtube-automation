import { useState, useEffect } from 'react';
import { useAuthStore } from '../stores/authStore';
import { useWorkspaceStore } from '../stores/workspaceStore';
import { useUIStore } from '../stores/uiStore';
import { PageHeader } from '../components/common/PageHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { apiClient, type HealthStatus } from '../services/apiClient';
import { cn } from '../lib/utils';
import { PLANS } from '../lib/constants';
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
  XCircle,
  Trash2,
  Server,
  RefreshCw,
  ExternalLink,
  Plus,
  X,
  Key,
} from 'lucide-react';

const SECTIONS = [
  { key: 'profile', label: 'Profile', icon: User },
  { key: 'workspace', label: 'Workspace', icon: Building2 },
  { key: 'strategy', label: 'Content Strategy', icon: Target },
  { key: 'brand', label: 'Brand Kit', icon: Palette },
  { key: 'providers', label: 'AI & Media Providers', icon: Cpu },
  { key: 'system', label: 'Backend & API Health', icon: Server },
  { key: 'youtube', label: 'YouTube Integration', icon: YoutubeIcon },
  { key: 'notifications', label: 'Notifications', icon: Bell },
  { key: 'security', label: 'Security', icon: Shield },
  { key: 'billing', label: 'Billing & Plans', icon: CreditCard },
  { key: 'danger', label: 'Danger Zone', icon: AlertTriangle },
];

const TIMEZONES = [
  'UTC',
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'Europe/London',
  'Europe/Paris',
  'Europe/Berlin',
  'Asia/Calcutta',
  'Asia/Tokyo',
  'Asia/Singapore',
  'Australia/Sydney',
];

export function Settings() {
  const [activeSection, setActiveSection] = useState('profile');
  const { user, updateUser, logout } = useAuthStore();
  const { workspace, updateWorkspace, youtubeChannel, connectYouTubeOAuth, disconnectYouTube, resetDemoData } = useWorkspaceStore();
  const { theme, toggleTheme, showToast } = useUIStore();

  // Profile Form State
  const [profileName, setProfileName] = useState(user?.name || '');
  const [profileEmail, setProfileEmail] = useState(user?.email || '');
  const [profileTimeZone, setProfileTimeZone] = useState('Asia/Calcutta');
  const [savingProfile, setSavingProfile] = useState(false);

  // Workspace Form State
  const [channelName, setChannelName] = useState(workspace?.channelName || '');
  const [workspaceName, setWorkspaceName] = useState(workspace?.name || '');
  const [niche, setNiche] = useState(workspace?.niche || '');
  const [targetAudience, setTargetAudience] = useState(workspace?.targetAudience || '');
  const [pillars, setPillars] = useState<string[]>(workspace?.pillars?.map(p => p.name) || ['AI Tools', 'Workflow Hacks', 'Automation']);
  const [newPillarInput, setNewPillarInput] = useState('');
  const [savingWorkspace, setSavingWorkspace] = useState(false);

  // Brand Kit State
  const [brandName, setBrandName] = useState(workspace?.brand?.name || 'ShortForge');
  const [primaryColor, setPrimaryColor] = useState(workspace?.brand?.primaryAccent || '#10b981');
  const [fontFamily, setFontFamily] = useState('Inter');
  const [watermarkEnabled, setWatermarkEnabled] = useState(false);
  const [savingBrand, setSavingBrand] = useState(false);

  // System Health State
  const [healthLoading, setHealthLoading] = useState(false);
  const [healthStatus, setHealthStatus] = useState<HealthStatus | null>(null);
  const [healthLatency, setHealthLatency] = useState<number | null>(null);

  // YouTube OAuth State
  const [connectingOAuth, setConnectingOAuth] = useState(false);
  const [oauthError, setOauthError] = useState<string | null>(null);

  // Notifications State
  const [notifs, setNotifs] = useState({
    videoReady: true,
    renderCompleted: true,
    uploadCompleted: true,
    approvalRequired: true,
    providerErrors: true,
  });

  // Password Change State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Sync state with stores on load or change
  useEffect(() => {
    if (user) {
      setProfileName(user.name);
      setProfileEmail(user.email);
    }
  }, [user]);

  useEffect(() => {
    if (workspace) {
      setChannelName(workspace.channelName || '');
      setWorkspaceName(workspace.name || '');
      setNiche(workspace.niche || '');
      setTargetAudience(workspace.targetAudience || '');
      if (workspace.pillars) {
        setPillars(workspace.pillars.map(p => p.name));
      }
      if (workspace.brand) {
        setBrandName(workspace.brand.name || '');
        setPrimaryColor(workspace.brand.primaryAccent || '#10b981');
      }
    }
  }, [workspace]);

  const checkBackendHealth = async () => {
    setHealthLoading(true);
    const start = performance.now();
    try {
      const res = await apiClient.health.check();
      setHealthLatency(Math.round(performance.now() - start));
      setHealthStatus(res);
    } catch {
      setHealthLatency(Math.round(performance.now() - start));
      setHealthStatus({ status: 'offline' });
    } finally {
      setHealthLoading(false);
    }
  };

  useEffect(() => {
    if (activeSection === 'system') {
      checkBackendHealth();
    }
  }, [activeSection]);

  const handleSaveProfile = async () => {
    setSavingProfile(true);
    try {
      await updateUser({ name: profileName });
      showToast({ type: 'success', title: 'Profile updated', message: 'Your personal details have been saved.' });
    } catch {
      showToast({ type: 'error', title: 'Save failed', message: 'Could not update profile.' });
    } finally {
      setSavingProfile(false);
    }
  };

  const handleSaveWorkspace = async () => {
    setSavingWorkspace(true);
    try {
      await updateWorkspace({
        name: workspaceName,
        channelName,
        niche,
        targetAudience,
        pillars: pillars.map((name, i) => ({ id: `p_${i + 1}`, name, description: name, targetRatio: Math.round(100 / pillars.length) })),
      });
      showToast({ type: 'success', title: 'Workspace updated', message: 'Channel settings and content strategy saved.' });
    } catch {
      showToast({ type: 'error', title: 'Save failed', message: 'Could not update workspace.' });
    } finally {
      setSavingWorkspace(false);
    }
  };

  const handleAddPillar = () => {
    const trimmed = newPillarInput.trim();
    if (trimmed && !pillars.includes(trimmed)) {
      setPillars([...pillars, trimmed]);
      setNewPillarInput('');
    }
  };

  const handleRemovePillar = (pillarToRemove: string) => {
    setPillars(pillars.filter(p => p !== pillarToRemove));
  };

  const handleSaveBrand = async () => {
    setSavingBrand(true);
    try {
      await updateWorkspace({
        brand: {
          name: brandName,
          primaryAccent: primaryColor,
          font: fontFamily,
          captionStyle: 'Bold',
          captionPosition: 'bottom',
          watermark: watermarkEnabled ? brandName : undefined,
        },
      });
      showToast({ type: 'success', title: 'Brand kit saved', message: 'Visual identity and color presets updated.' });
    } catch {
      showToast({ type: 'error', title: 'Save failed', message: 'Could not update brand kit.' });
    } finally {
      setSavingBrand(false);
    }
  };

  const handleConnectYouTube = async () => {
    setConnectingOAuth(true);
    setOauthError(null);
    try {
      const res = await connectYouTubeOAuth();
      if (res.authUrl) {
        window.location.href = res.authUrl;
      } else {
        setOauthError(res.error || 'Unable to connect to Google OAuth service');
        showToast({ type: 'warning', title: 'OAuth Setup Required', message: res.error || 'Check Google Client ID in backend .env' });
      }
    } catch (err: any) {
      setOauthError(err.message || 'Error initiating connection');
    } finally {
      setConnectingOAuth(false);
    }
  };

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword) {
      showToast({ type: 'error', title: 'Validation error', message: 'Please enter your current password.' });
      return;
    }
    if (newPassword.length < 8) {
      showToast({ type: 'error', title: 'Validation error', message: 'New password must be at least 8 characters long.' });
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast({ type: 'error', title: 'Validation error', message: 'New passwords do not match.' });
      return;
    }
    showToast({ type: 'success', title: 'Password updated', message: 'Your security credentials have been updated.' });
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  return (
    <div className="grid lg:grid-cols-[240px_1fr] gap-6">
      {/* Settings Navigation */}
      <nav className="space-y-1">
        <PageHeader title="Settings" description="Platform configuration" className="lg:hidden" />
        {SECTIONS.map((s) => {
          const Icon = s.icon;
          return (
            <button
              key={s.key}
              onClick={() => setActiveSection(s.key)}
              className={cn(
                'w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-xs font-medium transition-colors text-left',
                activeSection === s.key
                  ? 'bg-vermilion-soft text-vermilion font-semibold'
                  : 'text-stone hover:bg-canvas-subtle hover:text-ink'
              )}
            >
              <Icon className="h-4 w-4" />
              <span>{s.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Settings Content Area */}
      <div className="space-y-5">
        {/* Profile Section */}
        {activeSection === 'profile' && (
          <Card>
            <CardHeader>
              <CardTitle>User Profile</CardTitle>
              <CardDescription>Manage your personal account information and presentation time zone.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <Input
                  label="Display Name"
                  value={profileName}
                  onChange={e => setProfileName(e.target.value)}
                  placeholder="Your full name"
                />
                <Input
                  label="Email Address"
                  value={profileEmail}
                  onChange={e => setProfileEmail(e.target.value)}
                  type="email"
                  placeholder="you@domain.com"
                />
              </div>

              <div>
                <label className="label mb-1.5 block">Time Zone</label>
                <select
                  value={profileTimeZone}
                  onChange={e => setProfileTimeZone(e.target.value)}
                  className="w-full bg-surface border border-border rounded-md px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-1 focus:ring-accent"
                >
                  {TIMEZONES.map(tz => (
                    <option key={tz} value={tz}>{tz}</option>
                  ))}
                </select>
                <p className="text-xs text-text-muted mt-1">All scheduling timestamps are stored UTC and converted at presentation boundaries.</p>
              </div>

              <div className="pt-2 flex justify-end">
                <Button onClick={handleSaveProfile} loading={savingProfile}>
                  <CheckCircle className="h-4 w-4" />Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Workspace Section */}
        {activeSection === 'workspace' && (
          <Card>
            <CardHeader>
              <CardTitle>Workspace Configuration</CardTitle>
              <CardDescription>Channel profile, content scope, and automated targeting parameters.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <Input
                  label="Workspace Name"
                  value={workspaceName}
                  onChange={e => setWorkspaceName(e.target.value)}
                  placeholder="e.g. ShortForge Studio"
                />
                <Input
                  label="Channel Name"
                  value={channelName}
                  onChange={e => setChannelName(e.target.value)}
                  placeholder="e.g. AI Tools & Future Tech"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <Input
                  label="Core Niche"
                  value={niche}
                  onChange={e => setNiche(e.target.value)}
                  placeholder="e.g. Generative AI & Automation"
                />
                <Input
                  label="Target Audience"
                  value={targetAudience}
                  onChange={e => setTargetAudience(e.target.value)}
                  placeholder="e.g. Software engineers, founders, and creators"
                />
              </div>

              <div>
                <label className="label mb-1.5 block">Content Pillars</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {pillars.map(pillar => (
                    <Badge key={pillar} variant="accent" className="flex items-center gap-1.5 py-1 px-2.5 text-xs">
                      {pillar}
                      <button
                        type="button"
                        onClick={() => handleRemovePillar(pillar)}
                        className="hover:text-red-300 ml-1"
                        aria-label={`Remove ${pillar}`}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    placeholder="Add new content pillar..."
                    value={newPillarInput}
                    onChange={e => setNewPillarInput(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddPillar(); } }}
                  />
                  <Button variant="secondary" onClick={handleAddPillar} type="button">
                    <Plus className="h-4 w-4" />Add
                  </Button>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <Button onClick={handleSaveWorkspace} loading={savingWorkspace}>
                  <CheckCircle className="h-4 w-4" />Save Workspace
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Content Strategy */}
        {activeSection === 'strategy' && (
          <Card>
            <CardHeader>
              <CardTitle>Content Strategy & Rules</CardTitle>
              <CardDescription>Target durations, pacing standards, and quality guardrails.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-3 gap-4">
                <div className="p-4 rounded-lg border border-border bg-surface-subtle">
                  <div className="text-xs font-semibold text-text-muted uppercase">Target Duration</div>
                  <div className="text-xl font-bold text-text-primary mt-1">45 - 58s</div>
                  <p className="text-xs text-text-secondary mt-1">Optimized for vertical short retention algorithms.</p>
                </div>
                <div className="p-4 rounded-lg border border-border bg-surface-subtle">
                  <div className="text-xs font-semibold text-text-muted uppercase">Hook Window</div>
                  <div className="text-xl font-bold text-text-primary mt-1">0 - 3.2s</div>
                  <p className="text-xs text-text-secondary mt-1">First breath delivers the core tension or question.</p>
                </div>
                <div className="p-4 rounded-lg border border-border bg-surface-subtle">
                  <div className="text-xs font-semibold text-text-muted uppercase">Aspect Ratio</div>
                  <div className="text-xl font-bold text-text-primary mt-1">9:16 (1080x1920)</div>
                  <p className="text-xs text-text-secondary mt-1">Strict vertical canvas for Shorts, Reels & TikTok.</p>
                </div>
              </div>

              <div className="p-4 rounded-lg border border-border">
                <h4 className="text-sm font-semibold text-text-primary mb-2">Automated Quality Guardrails</h4>
                <ul className="text-xs text-text-secondary space-y-1.5 list-disc list-inside">
                  <li>Trigram + semantic duplicate detection on hooks and titles</li>
                  <li>ffprobe codec and audio level validation prior to final publish</li>
                  <li>Safe margin enforcement (keeps text inside 9:16 safe UI overlay boundaries)</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Brand Kit */}
        {activeSection === 'brand' && (
          <Card>
            <CardHeader>
              <CardTitle>Brand Kit & Visual Styling</CardTitle>
              <CardDescription>Custom colors, typography, and watermark for generated short videos.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                label="Brand / Channel Watermark Text"
                value={brandName}
                onChange={e => setBrandName(e.target.value)}
                placeholder="e.g. ShortForge"
              />

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="label mb-1.5 block">Primary Accent Color</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={primaryColor}
                      onChange={e => setPrimaryColor(e.target.value)}
                      className="h-10 w-20 rounded border border-border cursor-pointer bg-surface"
                    />
                    <span className="text-sm font-mono text-text-primary uppercase">{primaryColor}</span>
                  </div>
                </div>

                <div>
                  <label className="label mb-1.5 block">Video Subtitle Typography</label>
                  <select
                    value={fontFamily}
                    onChange={e => setFontFamily(e.target.value)}
                    className="w-full bg-surface border border-border rounded-md px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-1 focus:ring-accent"
                  >
                    <option value="Inter">Inter (Clean Modern Sans)</option>
                    <option value="Montserrat">Montserrat (Bold Impact)</option>
                    <option value="Poppins">Poppins (Friendly Geometric)</option>
                    <option value="Roboto">Roboto (Classic Tech)</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <input
                  type="checkbox"
                  id="watermarkToggle"
                  checked={watermarkEnabled}
                  onChange={e => setWatermarkEnabled(e.target.checked)}
                  className="h-4 w-4 rounded border-border text-accent focus:ring-accent"
                />
                <label htmlFor="watermarkToggle" className="text-sm text-text-primary cursor-pointer">
                  Render small watermark logo in top-right safe zone
                </label>
              </div>

              <div className="pt-2 flex justify-end">
                <Button onClick={handleSaveBrand} loading={savingBrand}>
                  <CheckCircle className="h-4 w-4" />Save Brand Kit
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* AI & Media Providers */}
        {activeSection === 'providers' && (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>AI & Media Provider Integrations</CardTitle>
                <CardDescription>
                  ShortForge uses real provider adapters. All provider keys are securely loaded into the backend environment.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="divide-y divide-border border border-border rounded-lg overflow-hidden">
                  <div className="p-4 flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-text-primary flex items-center gap-2">
                        <Cpu className="h-4 w-4 text-accent" /> OpenAI
                      </div>
                      <div className="text-xs text-text-muted mt-0.5">GPT-4o / GPT-4o-mini scriptwriting & DALL-E / GPT-Image generation</div>
                    </div>
                    <Badge variant="accent">Server Configured</Badge>
                  </div>

                  <div className="p-4 flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-text-primary flex items-center gap-2">
                        <Mic className="h-4 w-4 text-info" /> ElevenLabs
                      </div>
                      <div className="text-xs text-text-muted mt-0.5">Neural multi-lingual voice synthesis & voice cloning</div>
                    </div>
                    <Badge variant="accent">Server Configured</Badge>
                  </div>

                  <div className="p-4 flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-text-primary flex items-center gap-2">
                        <Video className="h-4 w-4 text-warning" /> FFmpeg Engine
                      </div>
                      <div className="text-xs text-text-muted mt-0.5">Hardware-accelerated 1080x1920 9:16 rendering, filter graphs & ffprobe QC</div>
                    </div>
                    <Badge variant="success">Local Binary Available</Badge>
                  </div>

                  <div className="p-4 flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-text-primary flex items-center gap-2">
                        <YoutubeIcon className="h-4 w-4 text-red-500" /> Google / YouTube Data API v3
                      </div>
                      <div className="text-xs text-text-muted mt-0.5">OAuth 2.0 channel link, video upload, category & privacy tagging</div>
                    </div>
                    {youtubeChannel?.connectionStatus === 'connected' ? (
                      <Badge variant="success">Connected</Badge>
                    ) : (
                      <Badge variant="neutral">Ready to Connect</Badge>
                    )}
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-surface-subtle text-xs text-text-secondary space-y-2">
                  <div className="font-semibold text-text-primary flex items-center gap-1.5">
                    <Key className="h-3.5 w-3.5" /> Managing Credentials Securely
                  </div>
                  <p>
                    Per the Zero-Trust Architecture, client browsers NEVER receive API keys or OAuth refresh tokens.
                    To configure production keys, populate <code>apps/api/.env</code> or your host environment variables:
                  </p>
                  <pre className="bg-surface p-2.5 rounded font-mono text-[11px] text-text-primary overflow-x-auto">
{`OPENAI_API_KEY=sk-...
ELEVENLABS_API_KEY=...
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GOOGLE_REDIRECT_URI=http://localhost:4000/api/v1/youtube/callback
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_S3_BUCKET=shortforge-media`}
                  </pre>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Backend & API Health */}
        {activeSection === 'system' && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle>Backend & API Health</CardTitle>
                <CardDescription>Live diagnostics for the Fastify monolith, PostgreSQL database, and Redis queues.</CardDescription>
              </div>
              <Button variant="secondary" size="sm" onClick={checkBackendHealth} loading={healthLoading}>
                <RefreshCw className="h-4 w-4" />Recheck Health
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-3 gap-4">
                <div className="p-4 rounded-lg border border-border bg-surface-subtle">
                  <div className="text-xs font-semibold text-text-muted uppercase">Fastify API Status</div>
                  <div className="flex items-center gap-2 mt-1">
                    {healthStatus?.status === 'ok' ? (
                      <Badge variant="success"><CheckCircle className="h-3 w-3" />Online</Badge>
                    ) : (
                      <Badge variant="neutral"><AlertTriangle className="h-3 w-3" />Standalone Mode</Badge>
                    )}
                  </div>
                  <p className="text-xs text-text-muted mt-2">Endpoint: <code>/api/v1</code></p>
                </div>

                <div className="p-4 rounded-lg border border-border bg-surface-subtle">
                  <div className="text-xs font-semibold text-text-muted uppercase">Database (PostgreSQL / Prisma)</div>
                  <div className="flex items-center gap-2 mt-1">
                    {healthStatus?.checks?.db === 'ok' ? (
                      <Badge variant="success"><CheckCircle className="h-3 w-3" />Connected</Badge>
                    ) : (
                      <Badge variant="neutral">Local Storage Cache</Badge>
                    )}
                  </div>
                  <p className="text-xs text-text-muted mt-2">Prisma Client v5.22.0</p>
                </div>

                <div className="p-4 rounded-lg border border-border bg-surface-subtle">
                  <div className="text-xs font-semibold text-text-muted uppercase">Redis / BullMQ Queues</div>
                  <div className="flex items-center gap-2 mt-1">
                    {healthStatus?.checks?.redis === 'ok' ? (
                      <Badge variant="success"><CheckCircle className="h-3 w-3" />Ready</Badge>
                    ) : (
                      <Badge variant="neutral">In-Memory Engine</Badge>
                    )}
                  </div>
                  <p className="text-xs text-text-muted mt-2">Latency: {healthLatency !== null ? `${healthLatency}ms` : '—'}</p>
                </div>
              </div>

              <div className="p-4 rounded-lg border border-border">
                <h4 className="text-sm font-semibold text-text-primary mb-1">Architecture Diagnostic Information</h4>
                <div className="text-xs text-text-secondary space-y-1">
                  <div><strong>Architecture:</strong> Modular Monolith (Fastify + BullMQ + Prisma)</div>
                  <div><strong>Security:</strong> Argon2id hashing, encrypted OAuth refresh tokens, distributed locks</div>
                  <div><strong>Storage:</strong> Multi-provider adapter (S3 / R2 / Local temporary render workdirs)</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* YouTube Integration */}
        {activeSection === 'youtube' && (
          <Card>
            <CardHeader>
              <CardTitle>YouTube Integration</CardTitle>
              <CardDescription>Link your YouTube channel via Google OAuth 2.0 to publish Shorts and sync metrics.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {youtubeChannel?.connectionStatus === 'connected' ? (
                <div className="p-5 rounded-lg bg-success/5 border border-success/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-full bg-red-600 flex items-center justify-center shrink-0">
                      <YoutubeIcon className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-text-primary">{youtubeChannel.title || 'Connected YouTube Channel'}</span>
                        <Badge variant="success" dot>Active</Badge>
                      </div>
                      <p className="text-xs text-text-muted mt-0.5">
                        {youtubeChannel.subscriberCount?.toLocaleString() || '0'} subscribers • Channel ID: {youtubeChannel.channelId || youtubeChannel.id}
                      </p>
                    </div>
                  </div>
                  <Button variant="secondary" size="sm" onClick={disconnectYouTube}>
                    Disconnect Channel
                  </Button>
                </div>
              ) : (
                <div className="p-6 rounded-lg bg-surface-subtle border border-border text-center space-y-4">
                  <div className="h-12 w-12 rounded-full bg-red-600/10 text-red-500 mx-auto flex items-center justify-center">
                    <YoutubeIcon className="h-6 w-6" />
                  </div>
                  <div className="max-w-md mx-auto">
                    <h4 className="text-base font-semibold text-text-primary mb-1">Connect your YouTube Channel</h4>
                    <p className="text-xs text-text-secondary">
                      Authorize ShortForge to upload vertical Shorts directly to your channel and pull view retention analytics.
                    </p>
                  </div>
                  <div>
                    <Button onClick={handleConnectYouTube} loading={connectingOAuth}>
                      <YoutubeIcon className="h-4 w-4" />Connect with Google OAuth
                    </Button>
                  </div>
                  {oauthError && (
                    <div className="p-3 rounded bg-danger/10 border border-danger/20 text-xs text-danger max-w-lg mx-auto text-left">
                      <strong>OAuth notice:</strong> {oauthError}
                    </div>
                  )}
                </div>
              )}

              <div className="p-4 rounded-lg border border-border space-y-2 text-xs text-text-secondary">
                <div className="font-semibold text-text-primary">Google OAuth Setup Requirements:</div>
                <ol className="list-decimal list-inside space-y-1">
                  <li>Create a project in the <a href="https://console.cloud.google.com" target="_blank" rel="noreferrer" className="text-accent underline">Google Cloud Console</a>.</li>
                  <li>Enable the <strong>YouTube Data API v3</strong>.</li>
                  <li>Configure the OAuth consent screen with scopes: <code>youtube.upload</code> and <code>youtube.readonly</code>.</li>
                  <li>Add Authorized Redirect URI: <code>http://localhost:4000/api/v1/youtube/callback</code>.</li>
                </ol>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Notifications */}
        {activeSection === 'notifications' && (
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>Choose which pipeline events trigger in-app alerts and notifications.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { key: 'videoReady', label: 'Video Ready for Review', desc: 'When automated generation and rendering complete successfully.' },
                { key: 'renderCompleted', label: 'FFmpeg Render Job Completed', desc: 'When video timeline compilation passes validation.' },
                { key: 'uploadCompleted', label: 'YouTube Upload Published', desc: 'When scheduled or manual publishing to YouTube finishes.' },
                { key: 'approvalRequired', label: 'Quality Control Gate Approval', desc: 'When a video draft needs explicit human sign-off.' },
                { key: 'providerErrors', label: 'Provider API Errors & Retries', desc: 'When external rate limits or provider failures occur.' },
              ].map(item => (
                <label key={item.key} className="flex items-start gap-3 p-3 rounded-lg border border-border hover:bg-surface-subtle cursor-pointer transition-colors">
                  <input
                    type="checkbox"
                    checked={(notifs as any)[item.key]}
                    onChange={e => {
                      setNotifs(prev => ({ ...prev, [item.key]: e.target.checked }));
                      showToast({ type: 'info', title: 'Preference saved', message: `${item.label} updated` });
                    }}
                    className="h-4 w-4 rounded border-border text-accent focus:ring-accent mt-0.5"
                  />
                  <div>
                    <div className="text-sm font-medium text-text-primary">{item.label}</div>
                    <div className="text-xs text-text-muted">{item.desc}</div>
                  </div>
                </label>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Security */}
        {activeSection === 'security' && (
          <Card>
            <CardHeader>
              <CardTitle>Security & Password</CardTitle>
              <CardDescription>Update your credentials and review security posture.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-3 rounded-md bg-success/5 border border-success/20 text-xs text-text-secondary flex items-center gap-2">
                <Shield className="h-4 w-4 text-success shrink-0" />
                Backend utilizes Argon2id password hashing and encrypted at-rest OAuth token storage.
              </div>

              <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md">
                <Input
                  label="Current Password"
                  type="password"
                  value={currentPassword}
                  onChange={e => setCurrentPassword(e.target.value)}
                  placeholder="••••••••••••"
                />
                <Input
                  label="New Password"
                  type="password"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  placeholder="Minimum 8 characters"
                />
                <Input
                  label="Confirm New Password"
                  type="password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="Repeat new password"
                />
                <Button type="submit">Update Password</Button>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Billing */}
        {activeSection === 'billing' && (
          <Card>
            <CardHeader>
              <CardTitle>Subscription & Plans</CardTitle>
              <CardDescription>Manage your production tier and monthly video limits.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-3 gap-4">
                {PLANS.map(plan => (
                  <div
                    key={plan.id}
                    className={cn(
                      'rounded-lg border p-4 flex flex-col justify-between',
                      plan.popular ? 'border-accent bg-accent-soft/40 shadow-sm' : 'border-border'
                    )}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-text-primary">{plan.name}</span>
                        {plan.popular && <Badge variant="accent">Most Popular</Badge>}
                      </div>
                      <div className="text-2xl font-bold text-text-primary my-1">
                        {plan.price === 0 ? 'Free' : `$${plan.price}`}
                        <span className="text-xs font-normal text-text-muted">/month</span>
                      </div>
                      <p className="text-xs text-text-secondary mb-4">{plan.description}</p>
                    </div>

                    <Button
                      variant={user?.plan === plan.id ? 'secondary' : plan.popular ? 'primary' : 'secondary'}
                      size="sm"
                      onClick={() => {
                        updateUser({ plan: plan.id as any });
                        showToast({ type: 'success', title: 'Plan changed', message: `Switched to ${plan.name} plan.` });
                      }}
                      className="w-full"
                    >
                      {user?.plan === plan.id ? 'Current Plan' : 'Select Plan'}
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Danger Zone */}
        {activeSection === 'danger' && (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Appearance Theme</CardTitle>
                <CardDescription>Switch between dark and light color modes.</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="secondary" onClick={toggleTheme}>
                  {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                  Switch to {theme === 'dark' ? 'Light' : 'Dark'} Mode
                </Button>
              </CardContent>
            </Card>

            <Card className="border-danger/30">
              <CardHeader>
                <CardTitle className="text-danger">Reset Workspace Cache & Data</CardTitle>
                <CardDescription>
                  Wipes local cached drafts, ideas, and configurations and restores the default environment.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  variant="danger"
                  onClick={() => {
                    if (window.confirm('Are you sure you want to reset demo data and restart onboarding?')) {
                      resetDemoData();
                      showToast({ type: 'info', title: 'Data reset', message: 'Workspace cleared.' });
                      window.location.href = '/onboarding';
                    }
                  }}
                >
                  <Trash2 className="h-4 w-4" />Reset Workspace Data
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Sign Out</CardTitle>
                <CardDescription>End your current session safely.</CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  variant="secondary"
                  onClick={() => {
                    logout();
                    window.location.href = '/login';
                  }}
                >
                  <LogOut className="h-4 w-4" />Log Out of ShortForge
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
