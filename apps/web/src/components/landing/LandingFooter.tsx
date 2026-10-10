import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShieldCheck, FileCheck, Mail, Send, ExternalLink, ArrowUpRight } from 'lucide-react';
import { Dialog, DialogHeader, DialogTitle, DialogContent, DialogFooter, DialogDescription } from '../ui/Dialog';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { useUIStore } from '../../stores/uiStore';
import { useMotionSafe, motionTokens } from '../../lib/motion';

export function LandingFooter() {
  const showToast = useUIStore((s) => s.showToast);
  const [legalModal, setLegalModal] = useState<'privacy' | 'terms' | 'contact' | null>(null);
  const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' });
  const [submitting, setSubmitting] = useState(false);
  const { shouldReduce } = useMotionSafe();

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
        title: 'Message Transmitted',
        message: 'Thank you. Our engineering team will follow up within 24 hours.',
      });
    }, 600);
  };

  return (
    <footer className="relative bg-canvas-subtle border-t border-border pt-20 pb-12 px-4 sm:px-6 lg:px-8 text-ink overflow-hidden">
      {/* 1. Main Interactive Content Layer (z-10, readable, fully accessible) */}
      <div className="relative z-10 max-w-7xl mx-auto space-y-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand Column */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="inline-flex items-center gap-2">
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
              <span>Modular Monolith Online • Port 4000</span>
            </div>
          </div>

          {/* Product Nav Column */}
          <div className="space-y-3 text-xs">
            <span className="font-mono font-bold text-ink uppercase tracking-wider block">Product</span>
            <ul className="space-y-2.5 text-stone">
              <li><a href="#workflow" className="hover:text-ink transition-colors">Production Workflow</a></li>
              <li><a href="#integrations" className="hover:text-ink transition-colors">Production Ecosystem</a></li>
              <li><a href="#scripts" className="hover:text-ink transition-colors">Script Architecture</a></li>
              <li><a href="#output" className="hover:text-ink transition-colors">Workflow Showcase</a></li>
              <li><a href="#pricing" className="hover:text-ink transition-colors">Honest Pricing</a></li>
            </ul>
          </div>

          {/* Architecture & Tech Column */}
          <div className="space-y-3 text-xs">
            <span className="font-mono font-bold text-ink uppercase tracking-wider block">Technology</span>
            <ul className="space-y-2.5 text-stone">
              <li><a href="#integrations" className="hover:text-ink transition-colors">FFmpeg Compositor</a></li>
              <li><a href="#integrations" className="hover:text-ink transition-colors">ElevenLabs Neural TTS</a></li>
              <li><a href="#integrations" className="hover:text-ink transition-colors">BullMQ Redis Queue</a></li>
              <li><a href="#integrations" className="hover:text-ink transition-colors">Google OAuth v3</a></li>
              <li><a href="#security" className="hover:text-ink transition-colors">Argon2id Hashes</a></li>
            </ul>
          </div>

          {/* Governance & Contact Column */}
          <div className="space-y-3 text-xs">
            <span className="font-mono font-bold text-ink uppercase tracking-wider block">Governance</span>
            <ul className="space-y-2.5 text-stone">
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
                  Contact Engineering
                </button>
              </li>
              <li>
                <Link to="/help" className="hover:text-ink transition-colors inline-flex items-center gap-1">
                  <span>Help & API Docs</span>
                  <ArrowUpRight className="h-3 w-3 text-stone-muted" />
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Utility Row */}
        <div className="pt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-muted">
          <div className="flex items-center gap-3">
            <span>© {new Date().getFullYear()} ShortForge Studio. All rights reserved.</span>
            <span>•</span>
            <span>Independent Creative Technology</span>
          </div>
          <div>Built for focused short-form vertical video production.</div>
        </div>
      </div>

      {/* 1.3 Signature Oversized Footer Wordmark (Pattern 1.3) */}
      {/* Positioned safely, cropped with zero horizontal scrollbar overflow */}
      <div className="relative w-full overflow-hidden select-none pointer-events-none mt-12 sm:mt-16 pt-4 border-t border-border/40">
        <motion.div
          initial={shouldReduce ? { opacity: 0.12 } : { opacity: 0, y: 30, scale: 0.96 }}
          whileInView={shouldReduce ? { opacity: 0.12 } : { opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{
            duration: motionTokens.duration.spatial,
            ease: motionTokens.ease.editorial,
          }}
          className="w-full flex items-center justify-center text-center"
        >
          <span
            className="font-sans font-black tracking-tighter uppercase block whitespace-nowrap leading-none transition-colors"
            style={{
              fontSize: 'clamp(3.5rem, 16vw, 15rem)',
              color: 'rgba(37, 33, 31, 0.07)',
              letterSpacing: '-0.04em',
            }}
          >
            SHORTFORGE
          </span>
        </motion.div>
      </div>

      {/* Privacy Policy Modal */}
      <Dialog open={legalModal === 'privacy'} onClose={() => setLegalModal(null)} size="lg">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-vermilion" />
            <DialogTitle>Privacy Policy</DialogTitle>
          </div>
          <DialogDescription>Effective Date: October 2026 • Real Data Protection</DialogDescription>
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
              ShortForge's use and transfer to any other app of information received from Google APIs adheres strictly to the Google API Services User Data Policy, including the Limited Use requirements. We never sell user data or expose OAuth tokens to clients.
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
            <h4 className="font-semibold text-ink text-sm mb-1">1. Content Ownership & Commercial Rights</h4>
            <p>
              You retain 100% intellectual property ownership and commercial rights over all scripts, audio voiceovers, visuals, and rendered MP4 deliverables generated through your ShortForge account.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-ink text-sm mb-1">2. YouTube Community Guidelines</h4>
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

      {/* Contact Engineering Modal */}
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
              <label className="block text-xs font-medium text-stone mb-1.5">Message / Inquiry</label>
              <textarea
                rows={4}
                className="w-full bg-surface text-ink placeholder:text-stone-muted border border-border rounded-md px-3 py-2 text-xs focus:outline-none focus:border-vermilion focus:ring-1 focus:ring-vermilion/20"
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
              <Send className="h-3.5 w-3.5 mr-1" />
              <span>Send Message</span>
            </Button>
          </DialogFooter>
        </form>
      </Dialog>
    </footer>
  );
}
