import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema } from '../lib/validators';
import type { LoginInput } from "../lib/validators";
import { useAuthStore } from '../stores/authStore';
import { useUIStore } from '../stores/uiStore';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Sparkles } from 'lucide-react';

export function Login() {
  const navigate = useNavigate();
  const login = useAuthStore(s => s.login);
  const showToast = useUIStore(s => s.showToast);
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: 'demo@shortforge.io', password: 'demo1234' },
  });

  const onSubmit = async (data: LoginInput) => {
    setLoading(true);
    try {
      await login(data.email, data.password);
      showToast({ type: 'success', title: 'Welcome back' });
      navigate('/onboarding');
    } catch {
      showToast({ type: 'error', title: 'Login failed', message: 'Please check your credentials' });
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
          <h1 className="text-section-title text-text-primary mb-2">Welcome back</h1>
          <p className="text-sm text-text-secondary">Sign in to your content engine</p>
        </div>

        <div className="bg-surface border border-border rounded-xl p-6 shadow-sm">
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

            <Button type="submit" className="w-full" loading={loading}>
              Sign In
            </Button>
          </form>

          <div className="mt-4 text-center">
            <p className="text-xs text-text-muted">Demo mode: any email with 6+ characters works</p>
          </div>
        </div>

        <p className="text-center text-sm text-text-secondary mt-6">
          Don't have an account?{' '}
          <Link to="/signup" className="text-accent hover:underline font-medium">Sign up</Link>
        </p>
      </div>
    </div>
  );
}
