import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { signupSchema } from '../lib/validators';
import type { SignupInput } from '../lib/validators';
import { useAuthStore } from '../stores/authStore';
import { useWorkspaceStore } from '../stores/workspaceStore';
import { useContentStore } from '../stores/contentStore';
import { useUIStore } from '../stores/uiStore';
import { seedContent, seedIdeas, seedNotifications, seedYouTubeChannel } from '../mock/seedData';
import { storageSet } from '../lib/utils';
import { STORAGE_KEYS } from '../lib/constants';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Sparkles } from 'lucide-react';

export function Signup() {
  const navigate = useNavigate();
  const signup = useAuthStore(s => s.signup);
  const setOnboardingComplete = useWorkspaceStore(s => s.setOnboardingComplete);
  const initContent = useContentStore(s => s.init);
  const showToast = useUIStore(s => s.showToast);
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<SignupInput>({
    resolver: zodResolver(signupSchema),
    defaultValues: { name: 'Creator', email: 'creator@shortforge.io', password: 'demo1234' },
  });

  const onSubmit = async (data: SignupInput) => {
    setLoading(true);
    try {
      await signup(data.name, data.email, data.password);
      showToast({ type: 'success', title: 'Account created', message: 'Let\'s set up your channel' });
      navigate('/onboarding');
    } catch {
      showToast({ type: 'error', title: 'Signup failed' });
    } finally {
      setLoading(false);
    }
  };

  const handleDemoAccess = async () => {
    setLoading(true);
    try {
      const login = useAuthStore.getState().login;
      await login('demo@shortforge.io', 'demo1234');
      storageSet(STORAGE_KEYS.content, seedContent());
      storageSet(STORAGE_KEYS.ideas, seedIdeas());
      storageSet(STORAGE_KEYS.notifications, seedNotifications());
      storageSet(STORAGE_KEYS.youtube, seedYouTubeChannel());
      setOnboardingComplete();
      initContent();
      showToast({ type: 'success', title: 'Demo Mode Activated', message: 'Welcome to ShortForge Studio' });
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="h-8 w-8 rounded-md bg-accent flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <span className="font-bold text-text-primary text-xl tracking-tight">ShortForge</span>
          </Link>
          <h1 className="text-section-title text-text-primary mb-2">Create your account</h1>
          <p className="text-sm text-text-secondary">Start building your content engine</p>
        </div>

        <div className="bg-surface border border-border rounded-xl p-6 shadow-sm">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Name"
              autoComplete="name"
              error={errors.name?.message}
              {...register('name')}
            />
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
              autoComplete="new-password"
              hint="At least 8 characters"
              error={errors.password?.message}
              {...register('password')}
            />

            <Button type="submit" className="w-full" loading={loading}>
              Create Account
            </Button>
          </form>

          <div className="mt-4 pt-4 border-t border-border">
            <Button
              type="button"
              variant="secondary"
              className="w-full"
              disabled={loading}
              onClick={handleDemoAccess}
            >
              <Sparkles className="h-4 w-4 text-accent" />
              1-Click Demo Access
            </Button>
            <p className="text-xs text-text-muted text-center mt-2">Skip signup and explore immediately</p>
          </div>
        </div>

        <p className="text-center text-sm text-text-secondary mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-accent hover:underline font-medium">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
