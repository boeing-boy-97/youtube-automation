import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight, Menu, X, ShieldCheck, Zap } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useAuthStore } from '../../stores/authStore';

interface LandingNavProps {
  onDemoClick: () => void;
}

export function LandingNav({ onDemoClick }: LandingNavProps) {
  const isAuthenticated = useAuthStore(s => s.isAuthenticated);
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on Escape
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
    { label: 'Pipeline', href: '#pipeline' },
    { label: 'Showcase', href: '#showcase' },
    { label: 'Studio', href: '#studio' },
    { label: 'Automation', href: '#automation' },
    { label: 'Security', href: '#security' },
    { label: 'Pricing', href: '#pricing' },
    { label: 'FAQ', href: '#faq' },
  ];

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        scrolled
          ? 'bg-paper/90 backdrop-blur-md border-b border-paper-border shadow-xs py-3'
          : 'bg-transparent py-4'
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo & Operational Status */}
          <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="h-8 w-8 rounded-lg bg-ink flex items-center justify-center text-lime shadow-xs group-hover:scale-105 transition-transform duration-200">
                <Sparkles className="h-4 w-4 fill-current" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-ink text-base tracking-tight leading-none">
                  ShortForge
                </span>
                <span className="text-[10px] text-stone-muted tracking-wider uppercase font-mono mt-0.5">
                  Creative Engine
                </span>
              </div>
            </Link>

            {/* Subtle Operational Pill */}
            <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-forest-soft border border-forest/20 text-forest text-[11px] font-medium">
              <span className="h-1.5 w-1.5 rounded-full bg-forest animate-pulse" />
              <span>v2.4 Production • Real Providers</span>
            </div>
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center gap-7 text-[13px] font-medium text-stone-muted">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="hover:text-ink transition-colors duration-150 py-1"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Action CTAs */}
          <div className="hidden sm:flex items-center gap-2.5">
            {isAuthenticated ? (
              <Link
                to="/dashboard"
                className="h-9 px-4 rounded-lg bg-ink text-paper text-xs font-semibold hover:bg-ink-surface transition-all duration-150 shadow-xs flex items-center gap-1.5"
              >
                <span>Open Dashboard</span>
                <ArrowRight className="h-3.5 w-3.5 text-lime" />
              </Link>
            ) : (
              <>
                <button
                  type="button"
                  onClick={onDemoClick}
                  className="h-9 px-3.5 rounded-lg text-xs font-semibold text-ink hover:bg-paper-muted border border-paper-border transition-colors flex items-center gap-1.5"
                >
                  <Zap className="h-3.5 w-3.5 text-forest" />
                  <span>Live Studio Tour</span>
                </button>
                <Link
                  to="/login"
                  className="h-9 px-3 rounded-lg text-xs font-medium text-stone-muted hover:text-ink transition-colors"
                >
                  Sign in
                </Link>
                <Link
                  to="/signup"
                  className="h-9 px-4 rounded-lg bg-ink text-lime text-xs font-semibold hover:bg-ink-surface transition-all duration-150 shadow-xs flex items-center gap-1.5"
                >
                  <span>Start Free</span>
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </>
            )}
          </div>

          {/* Mobile Hamburger Toggle */}
          <div className="flex sm:hidden items-center gap-2">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-ink hover:bg-paper-muted border border-paper-border focus:outline-none"
              aria-label="Toggle navigation menu"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="sm:hidden fixed inset-x-0 top-[61px] bg-paper border-b border-paper-border p-5 shadow-lg animate-fade-in">
          <nav className="flex flex-col space-y-3">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-medium text-ink hover:text-forest transition-colors py-1.5 border-b border-paper-border/40"
              >
                {link.label}
              </a>
            ))}

            <div className="pt-3 flex flex-col gap-2">
              {isAuthenticated ? (
                <Link
                  to="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full h-10 rounded-lg bg-ink text-paper text-sm font-semibold flex items-center justify-center gap-2"
                >
                  <span>Open Dashboard</span>
                  <ArrowRight className="h-4 w-4 text-lime" />
                </Link>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onDemoClick();
                    }}
                    className="w-full h-10 rounded-lg text-sm font-semibold text-ink border border-paper-border hover:bg-paper-muted flex items-center justify-center gap-2"
                  >
                    <Zap className="h-4 w-4 text-forest" />
                    <span>Live Studio Tour</span>
                  </button>
                  <div className="grid grid-cols-2 gap-2 mt-1">
                    <Link
                      to="/login"
                      onClick={() => setMobileMenuOpen(false)}
                      className="h-10 rounded-lg border border-paper-border text-sm font-medium text-ink flex items-center justify-center hover:bg-paper-muted"
                    >
                      Sign in
                    </Link>
                    <Link
                      to="/signup"
                      onClick={() => setMobileMenuOpen(false)}
                      className="h-10 rounded-lg bg-ink text-lime text-sm font-semibold flex items-center justify-center gap-1.5"
                    >
                      <span>Start Free</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
