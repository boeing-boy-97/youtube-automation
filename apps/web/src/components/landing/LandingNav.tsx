import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, ArrowRight, Play } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useAuthStore } from '../../stores/authStore';

interface LandingNavProps {
  onDemoClick: () => void;
}

export function LandingNav({ onDemoClick }: LandingNavProps) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mobileMenuOpen]);

  const navLinks = [
    { label: 'Workflow', href: '#workflow' },
    { label: 'Ecosystem', href: '#integrations' },
    { label: 'Scripts', href: '#scripts' },
    { label: 'Studio', href: '#studio' },
    { label: 'Outputs', href: '#output' },
    { label: 'Pricing', href: '#pricing' },
    { label: 'FAQ', href: '#faq' },
  ];

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-200',
        scrolled
          ? 'bg-canvas/95 backdrop-blur-md border-b border-border shadow-xs py-3'
          : 'bg-transparent py-4'
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="h-7 w-7 rounded-md bg-ink flex items-center justify-center text-canvas shadow-xs font-mono font-bold text-xs group-hover:bg-coral transition-colors">
              SF
            </div>
            <span className="font-bold text-ink text-base tracking-tight">ShortForge</span>
            <span className="h-1.5 w-1.5 rounded-full bg-coral ml-0.5" />
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-stone">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="hover:text-ink transition-colors"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Right Action Buttons */}
          <div className="hidden sm:flex items-center gap-3">
            {isAuthenticated ? (
              <Link to="/dashboard" className="btn-primary h-9 px-4 text-xs">
                <span>Open Dashboard</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            ) : (
              <>
                <Link to="/login" className="btn-ghost text-xs">
                  Sign in
                </Link>
                <button
                  type="button"
                  onClick={onDemoClick}
                  className="btn-secondary h-9 px-3.5 text-xs"
                >
                  <Play className="h-3 w-3 fill-current text-coral" />
                  <span>Studio Tour</span>
                </button>
                <Link to="/signup" className="btn-primary h-9 px-4 text-xs">
                  <span>Start creating</span>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-md text-stone hover:text-ink focus:outline-none"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-x-0 top-[57px] bg-canvas border-b border-border shadow-lg p-6 space-y-4 animate-in slide-in-from-top-2 duration-150">
          <nav className="space-y-3">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="block text-sm font-medium text-stone hover:text-ink py-1"
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="pt-4 border-t border-border flex flex-col gap-2">
            {isAuthenticated ? (
              <Link to="/dashboard" className="btn-primary w-full justify-center">
                Open Dashboard
              </Link>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onDemoClick();
                  }}
                  className="btn-secondary w-full justify-center"
                >
                  <Play className="h-3.5 w-3.5 text-coral fill-current" />
                  <span>Explore Studio Tour</span>
                </button>
                <Link
                  to="/signup"
                  onClick={() => setMobileMenuOpen(false)}
                  className="btn-primary w-full justify-center"
                >
                  Start creating free
                </Link>
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-xs text-center text-stone hover:text-ink py-2"
                >
                  Existing creator? Sign in
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
