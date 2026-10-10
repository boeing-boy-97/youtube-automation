import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema } from '../lib/validators';
import type { LoginInput } from '../lib/validators';
import { useAuthStore } from '../stores/authStore';
import { useWorkspaceStore } from '../stores/workspaceStore';
import { useContentStore } from '../stores/contentStore';
import { useUIStore } from '../stores/uiStore';
import { seedContent, seedIdeas, seedNotifications, seedYouTubeChannel } from '../mock/seedData';
import { storageSet } from '../lib/utils';
import { STORAGE_KEYS } from '../lib/constants';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';

export function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const login = useAuthStore((s) => s.login);
  const setOnboardingComplete = useWorkspaceStore((s) => s.setOnboardingComplete);
  const initContent = useContentStore((s) => s.init);
  const showToast = useUIStore((s) => s.showToast);
  const [loading, setLoading] = useState(false);

  // Preserve intended destination after login
  const from = (location.state as { from?: { pathname?: string } })?.from?.pathname || '/dashboard';

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: 'demo@shortforge.io', password: 'demo1234' },
  });

  const onSubmit = async (data: LoginInput) => {
    setLoading(true);
    try {
      await login(data.email, data.password);
      showToast({ type: 'success', title: 'Welcome back' });
      navigate(from, { replace: true });
    } catch {
      showToast({ type: 'error', title: 'Login failed', message: 'Please check your credentials' });
    } finally {
      setLoading(false);
    }
  };

  const handleDemoAccess = async () => {
    setLoading(true);
    try {
      await login('demo@shortforge.io', 'demo1234');
      storageSet(STORAGE_KEYS.content, seedContent());
      storageSet(STORAGE_KEYS.ideas, seedIdeas());
      storageSet(STORAGE_KEYS.notifications, seedNotifications());
      storageSet(STORAGE_KEYS.youtube, seedYouTubeChannel());
      setOnboardingComplete();
      initContent();
      showToast({
        type: 'success',
        title: 'Studio Tour Activated',
        message: 'Welcome to your ShortForge Creative Studio.',
      });
      navigate(from, { replace: true });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-canvas flex items-center justify-center p-6 text-ink">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-2 mb-4 group">
            <div className="h-8 w-8 rounded-md bg-ink flex items-center justify-center text-canvas font-mono font-bold text-xs group-hover:bg-coral transition-colors shadow-xs">
              SF
            </div>
            <span className="font-bold text-ink text-lg tracking-tight">ShortForge</span>
            <span className="h-1.5 w-1.5 rounded-full bg-coral" />
          </Link>
          <h1 className="text-xl font-bold text-ink tracking-tight">Sign in to your studio</h1>
          <p className="text-xs text-stone">Access your continuous short-form production pipeline.</p>
        </div>

        <div className="bg-surface border border-border rounded-xl p-6 shadow-xs space-y-4">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Email"
              type="email"
              autoComplete="email"
              error={errors.email?.message}
              {...register('email')}
            />
            <Input
              label="Password"
              type="password"
              autoComplete="current-password"
              error={errors.password?.message}
              {...register('password')}
            />

            <Button
              type="submit"
              className="btn-primary w-full h-10 text-xs justify-center"
              loading={loading}
            >
              Sign In
            </Button>
          </form>

          <div className="pt-4 border-t border-border space-y-2">
            <Button
              type="button"
              variant="secondary"
              className="btn-secondary w-full h-10 text-xs justify-center"
              disabled={loading}
              onClick={handleDemoAccess}
            >
              <span>Explore Studio Tour</span>
            </Button>
            <p className="text-[11px] text-stone-muted text-center">
              Pre-loaded with sample shorts, scripts, and timeline.
            </p>
          </div>
        </div>

        <p className="text-center text-xs text-stone">
          Need an account?{' '}
          <Link to="/signup" className="text-coral hover:underline font-semibold">
            Create account
          </Link>
        </p>
      </div>
    </div>
  );
}
