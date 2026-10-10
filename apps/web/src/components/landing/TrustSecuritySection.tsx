import {
  ShieldCheck,
  Lock,
  Cpu,
  CheckCircle2,
  FileCheck,
  Server,
  KeyRound,
  Eye,
} from 'lucide-react';

export function TrustSecuritySection() {
  const guarantees = [
    {
      icon: ShieldCheck,
      title: 'Zero Simulated Jobs in Production',
      description:
        'We never use mock timeouts or fake progress indicators. If an upstream provider fails or credentials are missing, our system reports the exact operational code clearly and safely.',
    },
    {
      icon: KeyRound,
      title: 'Argon2id & AES-256 Token Encryption',
      description:
        'User passwords are protected with Argon2id cryptographic hashing. Third-party Google and YouTube OAuth refresh tokens are encrypted at rest with AES-256-GCM and never exposed to client browsers.',
    },
    {
      icon: FileCheck,
      title: 'Automated Media QC (ffprobe)',
      description:
        'No video is marked as RENDERED or approved for publication until ffprobe inspects the actual MP4 file to verify 60fps frame rate, H.264 video streams, and normalized -14 LUFS broadcast audio.',
    },
    {
      icon: Server,
      title: 'Idempotent Distributed Locking',
      description:
        'All publishing and scheduling jobs acquire Redis Redlock distributed locks with unique idempotency keys, guaranteeing that network retries can never double-post a video to your YouTube channel.',
    },
    {
      icon: Lock,
      title: 'Strict Multi-Tenant Isolation',
      description:
        'Every database query is tenant-scoped by workspace ID. Role-Based Access Control (RBAC) enforces strict OWNER, ADMIN, EDITOR, and VIEWER permissions across content and brand assets.',
    },
    {
      icon: Eye,
      title: '100% Audit Logging & Cost Controls',
      description:
        'Every external provider call is tracked in ProviderUsage and AuditLog tables with execution latency, token counts, and cost estimation so you maintain complete oversight.',
    },
  ];

  return (
    <section id="security" className="py-24 px-4 sm:px-6 lg:px-8 bg-paper border-t border-paper-border">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Section Header */}
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-forest-soft border border-forest/20 text-forest text-xs font-semibold tracking-wider uppercase font-mono mb-3">
            <Lock className="h-3.5 w-3.5" />
            <span>Architecture & Security Standards</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-ink tracking-tight">
            Built for reliability, not demos.
          </h2>
          <p className="text-base sm:text-lg text-stone-muted mt-3 leading-relaxed">
            Content creators and media studios trust ShortForge to automate their channels safely.
            Here is how our engineering architecture protects your brand, credentials, and audience.
          </p>
        </div>

        {/* 6 Guarantees Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {guarantees.map((g, idx) => {
            const Icon = g.icon;
            return (
              <div
                key={idx}
                className="bg-paper-subtle border border-paper-border rounded-2xl p-6 space-y-3 hover:border-forest/50 transition-colors duration-150"
              >
                <div className="h-10 w-10 rounded-xl bg-forest-soft text-forest flex items-center justify-center">
                  <Icon className="h-5 w-5" />
                </div>
                <h4 className="font-bold text-base text-ink">{g.title}</h4>
                <p className="text-xs sm:text-sm text-stone-muted leading-relaxed">
                  {g.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
