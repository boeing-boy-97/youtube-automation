import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ShieldCheck, FileCheck, Mail, ArrowUpRight, Send } from 'lucide-react';
import { Dialog, DialogHeader, DialogTitle, DialogContent, DialogFooter, DialogDescription } from '../ui/Dialog';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { useUIStore } from '../../stores/uiStore';

export function LandingFooter() {
  const showToast = useUIStore((s) => s.showToast);
  const [legalModal, setLegalModal] = useState<'privacy' | 'terms' | 'contact' | null>(null);
  const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' });
  const [submitting, setSubmitting] = useState(false);

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactForm.name || !contactForm.email || !contactForm.message) {
      showToast({ type: 'error', title: 'Missing fields', message: 'Please complete all required fields.' });
      return;
    }
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setLegalModal(null);
      setContactForm({ name: '', email: '', message: '' });
      showToast({
        type: 'success',
        title: 'Message Sent',
        message: 'Thank you. Our engineering team will follow up within 24 hours.',
      });
    }, 600);
  };

  return (
    <footer className="bg-paper-subtle border-t border-paper-border pt-16 pb-12 px-4 sm:px-6 lg:px-8 text-ink">
      <div className="max-w-7xl mx-auto space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-lg bg-ink flex items-center justify-center text-lime shadow-xs">
                <Sparkles className="h-4 w-4 fill-current" />
              </div>
              <span className="font-bold text-ink text-lg tracking-tight">ShortForge</span>
            </Link>
            <p className="text-xs sm:text-sm text-stone-muted leading-relaxed max-w-sm">
              The autonomous video creation operating system. Transforming creator strategies into high-retention vertical shorts with real FFmpeg rendering and verified YouTube OAuth.
            </p>
            <div className="flex items-center gap-2 text-xs font-mono text-forest">
              <span className="h-2 w-2 rounded-full bg-forest animate-pulse" />
              <span>All Systems Operational • 17 Active Queues</span>
            </div>
          </div>

          {/* Product Nav Column */}
          <div className="space-y-3 text-xs">
            <span className="font-mono font-bold text-ink uppercase tracking-wider block">Product</span>
            <ul className="space-y-2 text-stone-muted">
              <li><a href="#pipeline" className="hover:text-ink transition-colors">Production Pipeline</a></li>
              <li><a href="#showcase" className="hover:text-ink transition-colors">Interactive Studio</a></li>
              <li><a href="#automation" className="hover:text-ink transition-colors">Automation Rules</a></li>
              <li><a href="#pricing" className="hover:text-ink transition-colors">Pricing Plans</a></li>
              <li><Link to="/login" className="hover:text-ink transition-colors">Creator Sign In</Link></li>
            </ul>
          </div>

          {/* Infrastructure Column */}
          <div className="space-y-3 text-xs">
            <span className="font-mono font-bold text-ink uppercase tracking-wider block">Architecture</span>
            <ul className="space-y-2 text-stone-muted">
              <li><a href="#security" className="hover:text-ink transition-colors">FFmpeg Compositor</a></li>
              <li><a href="#security" className="hover:text-ink transition-colors">ElevenLabs Neural TTS</a></li>
              <li><a href="#security" className="hover:text-ink transition-colors">Redis Redlock v2</a></li>
              <li><a href="#security" className="hover:text-ink transition-colors">Google OAuth v3</a></li>
              <li><a href="#security" className="hover:text-ink transition-colors">Argon2id Cryptography</a></li>
            </ul>
          </div>

          {/* Legal & Contact Column */}
          <div className="space-y-3 text-xs">
            <span className="font-mono font-bold text-ink uppercase tracking-wider block">Governance</span>
            <ul className="space-y-2 text-stone-muted">
              <li>
                <button
                  type="button"
                  onClick={() => setLegalModal('privacy')}
                  className="hover:text-ink transition-colors text-left"
                >
                  Privacy Policy
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => setLegalModal('terms')}
                  className="hover:text-ink transition-colors text-left"
                >
                  Terms of Service
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => setLegalModal('contact')}
                  className="hover:text-ink transition-colors text-left font-semibold text-forest"
                >
                  Contact & Support
                </button>
              </li>
              <li>
                <a
                  href="https://github.com/boeing-boy-97/youtube-automation"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-ink transition-colors flex items-center gap-1.5"
                >
                  <svg className="h-3.5 w-3.5 fill-current" viewBox="0 0 24 24"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/></svg>
                  <span>GitHub Repository</span>
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-paper-border flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-muted">
          <div>© {new Date().getFullYear()} ShortForge AI Inc. All rights reserved.</div>
          <div className="flex items-center gap-4">
            <span>Built for high-retention video creators worldwide.</span>
          </div>
        </div>
      </div>

      {/* Privacy Policy Modal */}
      <Dialog open={legalModal === 'privacy'} onClose={() => setLegalModal(null)} size="lg">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-forest" />
            <DialogTitle>Privacy Policy</DialogTitle>
          </div>
          <DialogDescription>Effective Date: October 2026</DialogDescription>
        </DialogHeader>
        <DialogContent className="max-h-[60vh] overflow-y-auto space-y-4 text-xs text-stone-muted leading-relaxed">
          <div>
            <h4 className="font-semibold text-ink text-sm mb-1">1. Information We Collect</h4>
            <p>
              ShortForge collects email addresses, workspace metadata, and creative input parameters for generating short-form video scripts and media. When you connect third-party platforms such as YouTube or Google OAuth, we store encrypted access and refresh tokens.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-ink text-sm mb-1">2. Google API Services Limited Use Compliance</h4>
            <p>
              ShortForge's use and transfer to any other app of information received from Google APIs will adhere to the{' '}
              <a href="https://developers.google.com/terms/api-services-user-data-policy" target="_blank" rel="noreferrer" className="text-forest underline">
                Google API Services User Data Policy
              </a>
              , including the Limited Use requirements. We request only scopes strictly required for uploading vertical Shorts and viewing channel performance metrics.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-ink text-sm mb-1">3. Data Security & Storage</h4>
            <p>
              User passwords are protected using Argon2id cryptographic hashing. OAuth credentials are AES-256 encrypted at rest. Rendered video assets are retained in private cloud storage according to your workspace retention policies.
            </p>
          </div>
        </DialogContent>
        <DialogFooter>
          <Button onClick={() => setLegalModal(null)}>I Understand</Button>
        </DialogFooter>
      </Dialog>

      {/* Terms of Service Modal */}
      <Dialog open={legalModal === 'terms'} onClose={() => setLegalModal(null)} size="lg">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <FileCheck className="h-5 w-5 text-forest" />
            <DialogTitle>Terms of Service</DialogTitle>
          </div>
          <DialogDescription>Production & Usage Agreement</DialogDescription>
        </DialogHeader>
        <DialogContent className="max-h-[60vh] overflow-y-auto space-y-4 text-xs text-stone-muted leading-relaxed">
          <div>
            <h4 className="font-semibold text-ink text-sm mb-1">1. Production & Content Ownership</h4>
            <p>
              You retain full commercial rights and intellectual property ownership over all scripts, audio voiceovers, visuals, and rendered MP4 video deliverables generated through your ShortForge account.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-ink text-sm mb-1">2. YouTube Terms of Service</h4>
            <p>
              By utilizing the automated YouTube publishing features, you agree to be bound by the{' '}
              <a href="https://www.youtube.com/t/terms" target="_blank" rel="noreferrer" className="text-forest underline">
                YouTube Terms of Service
              </a>
              . You are responsible for ensuring your published content complies with YouTube Community Guidelines.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-ink text-sm mb-1">3. Automated Operations Guardrails</h4>
            <p>
              ShortForge provides assisted and autonomous publishing options. You remain responsible for configuring posting limits, budget thresholds, and content pillar rules.
            </p>
          </div>
        </DialogContent>
        <DialogFooter>
          <Button onClick={() => setLegalModal(null)}>I Understand</Button>
        </DialogFooter>
      </Dialog>

      {/* Contact & Support Modal */}
      <Dialog open={legalModal === 'contact'} onClose={() => setLegalModal(null)} size="md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-forest" />
            <DialogTitle>Contact Engineering & Support</DialogTitle>
          </div>
          <DialogDescription>Direct communication with our product team.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleContactSubmit}>
          <DialogContent className="space-y-4">
            <Input
              label="Your Name"
              placeholder="e.g. Alex Morgan"
              value={contactForm.name}
              onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
              required
            />
            <Input
              label="Email Address"
              type="email"
              placeholder="alex@creatorstudio.com"
              value={contactForm.email}
              onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
              required
            />
            <div>
              <label className="field-label">Message / Inquiry</label>
              <textarea
                rows={4}
                className="input-field py-2.5 h-auto text-xs"
                placeholder="Describe your inquiry, channel requirements, or API access needs..."
                value={contactForm.message}
                onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                required
              />
            </div>
          </DialogContent>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setLegalModal(null)} type="button">
              Cancel
            </Button>
            <Button type="submit" loading={submitting}>
              <Send className="h-3.5 w-3.5" />
              Send Message
            </Button>
          </DialogFooter>
        </form>
      </Dialog>
    </footer>
  );
}
