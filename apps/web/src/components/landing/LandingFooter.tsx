import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, FileCheck, Mail, Send } from 'lucide-react';
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
    <footer className="bg-canvas-subtle border-t border-border pt-16 pb-12 px-4 sm:px-6 lg:px-8 text-ink">
      <div className="max-w-7xl mx-auto space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-md bg-ink flex items-center justify-center text-canvas font-mono font-bold text-xs shadow-xs">
                SF
              </div>
              <span className="font-bold text-ink text-base tracking-tight">ShortForge</span>
              <span className="h-1.5 w-1.5 rounded-full bg-vermilion" />
            </Link>
            <p className="text-xs sm:text-sm text-stone leading-relaxed max-w-sm">
              The continuous vertical video studio. Turning raw creator concepts into high-retention 9:16 shorts with neural voiceover, scene directing, and verified YouTube publishing.
            </p>
            <div className="flex items-center gap-2 text-xs font-mono text-stone-muted">
              <span className="h-2 w-2 rounded-full bg-moss" />
              <span>Modular Backend Online • Port 4000</span>
            </div>
          </div>

          {/* Product Nav Column */}
          <div className="space-y-3 text-xs">
            <span className="font-mono font-bold text-ink uppercase tracking-wider block">Product</span>
            <ul className="space-y-2 text-stone">
              <li><a href="#workflow" className="hover:text-ink transition-colors">Production Workflow</a></li>
              <li><a href="#scripts" className="hover:text-ink transition-colors">Script Architecture</a></li>
              <li><a href="#studio" className="hover:text-ink transition-colors">Interactive Studio</a></li>
              <li><a href="#output" className="hover:text-ink transition-colors">Sample Outputs</a></li>
              <li><a href="#pricing" className="hover:text-ink transition-colors">Pricing Plans</a></li>
            </ul>
          </div>

          {/* Infrastructure Column */}
          <div className="space-y-3 text-xs">
            <span className="font-mono font-bold text-ink uppercase tracking-wider block">Technology</span>
            <ul className="space-y-2 text-stone">
              <li><a href="#security" className="hover:text-ink transition-colors">FFmpeg Compositor</a></li>
              <li><a href="#security" className="hover:text-ink transition-colors">ElevenLabs Neural TTS</a></li>
              <li><a href="#security" className="hover:text-ink transition-colors">BullMQ Workers</a></li>
              <li><a href="#security" className="hover:text-ink transition-colors">Google OAuth v3</a></li>
              <li><a href="#security" className="hover:text-ink transition-colors">Argon2id Hashes</a></li>
            </ul>
          </div>

          {/* Governance & Contact Column */}
          <div className="space-y-3 text-xs">
            <span className="font-mono font-bold text-ink uppercase tracking-wider block">Governance</span>
            <ul className="space-y-2 text-stone">
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
                  className="hover:text-ink transition-colors text-left font-semibold text-vermilion"
                >
                  Contact & Support
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-muted">
          <div>© {new Date().getFullYear()} ShortForge Studio. All rights reserved.</div>
          <div>Built for focused short-form video creation.</div>
        </div>
      </div>

      {/* Privacy Policy Modal */}
      <Dialog open={legalModal === 'privacy'} onClose={() => setLegalModal(null)} size="lg">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-vermilion" />
            <DialogTitle>Privacy Policy</DialogTitle>
          </div>
          <DialogDescription>Effective Date: October 2026</DialogDescription>
        </DialogHeader>
        <DialogContent className="max-h-[60vh] overflow-y-auto space-y-4 text-xs text-stone leading-relaxed">
          <div>
            <h4 className="font-semibold text-ink text-sm mb-1">1. Information We Collect</h4>
            <p>
              ShortForge collects account credentials, workspace metadata, and creative input parameters for generating short-form video scripts and media. When you connect third-party platforms such as YouTube or Google OAuth, we store encrypted access and refresh tokens.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-ink text-sm mb-1">2. Google API Services Limited Use Compliance</h4>
            <p>
              ShortForge's use and transfer to any other app of information received from Google APIs will adhere to the Google API Services User Data Policy, including the Limited Use requirements.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-ink text-sm mb-1">3. Data Security & Storage</h4>
            <p>
              User passwords are protected using Argon2id cryptographic hashing. OAuth credentials are AES-256 encrypted at rest. Rendered video assets are retained in private cloud storage.
            </p>
          </div>
        </DialogContent>
        <DialogFooter>
          <Button onClick={() => setLegalModal(null)} className="btn-primary text-xs">
            I Understand
          </Button>
        </DialogFooter>
      </Dialog>

      {/* Terms of Service Modal */}
      <Dialog open={legalModal === 'terms'} onClose={() => setLegalModal(null)} size="lg">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <FileCheck className="h-5 w-5 text-vermilion" />
            <DialogTitle>Terms of Service</DialogTitle>
          </div>
          <DialogDescription>Production & Usage Agreement</DialogDescription>
        </DialogHeader>
        <DialogContent className="max-h-[60vh] overflow-y-auto space-y-4 text-xs text-stone leading-relaxed">
          <div>
            <h4 className="font-semibold text-ink text-sm mb-1">1. Production & Content Ownership</h4>
            <p>
              You retain full commercial rights and intellectual property ownership over all scripts, audio voiceovers, visuals, and rendered MP4 video deliverables generated through your ShortForge account.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-ink text-sm mb-1">2. YouTube Terms of Service</h4>
            <p>
              By utilizing automated YouTube publishing features, you agree to comply with the YouTube Terms of Service and YouTube Community Guidelines.
            </p>
          </div>
        </DialogContent>
        <DialogFooter>
          <Button onClick={() => setLegalModal(null)} className="btn-primary text-xs">
            I Understand
          </Button>
        </DialogFooter>
      </Dialog>

      {/* Contact & Support Modal */}
      <Dialog open={legalModal === 'contact'} onClose={() => setLegalModal(null)} size="md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-vermilion" />
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
            <Button variant="secondary" onClick={() => setLegalModal(null)} type="button" className="btn-secondary text-xs">
              Cancel
            </Button>
            <Button type="submit" loading={submitting} className="btn-primary text-xs">
              <Send className="h-3.5 w-3.5" />
              Send Message
            </Button>
          </DialogFooter>
        </form>
      </Dialog>
    </footer>
  );
}
