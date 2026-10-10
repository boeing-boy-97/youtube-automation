import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';

export function NotFound() {
  return (
    <div className="min-h-screen bg-canvas flex items-center justify-center p-6 text-ink">
      <div className="text-center space-y-4">
        <Link to="/" className="inline-flex items-center gap-2 mb-4 group">
          <div className="h-8 w-8 rounded-md bg-ink flex items-center justify-center text-canvas font-mono font-bold text-xs group-hover:bg-vermilion transition-colors shadow-xs">
            SF
          </div>
          <span className="font-bold text-ink text-lg tracking-tight">ShortForge</span>
          <span className="h-1.5 w-1.5 rounded-full bg-vermilion" />
        </Link>
        <h1 className="text-5xl font-bold font-mono text-vermilion">404</h1>
        <p className="text-sm text-stone max-w-sm mx-auto">
          This studio route does not exist or has been relocated in the latest workspace update.
        </p>
        <div className="pt-2">
          <Link to="/dashboard">
            <Button className="btn-primary h-9 px-4 text-xs">
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
