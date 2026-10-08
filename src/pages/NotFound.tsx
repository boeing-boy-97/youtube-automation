import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Sparkles } from 'lucide-react';

export function NotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="text-center">
        <Link to="/" className="inline-flex items-center gap-2 mb-8">
          <div className="h-8 w-8 rounded-md bg-accent flex items-center justify-center">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <span className="font-bold text-text-primary text-xl">ShortForge</span>
        </Link>
        <h1 className="text-display text-text-primary mb-3">404</h1>
        <p className="text-text-secondary mb-6">This page doesn't exist or has been moved.</p>
        <Link to="/dashboard"><Button>Go to Dashboard</Button></Link>
      </div>
    </div>
  );
}
