import {
  ShieldCheck,
  Lock,
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
        'User passwords are protected with Argon2id cryptographic hashing. Google and YouTube OAuth refresh tokens are encrypted at rest with AES-256-GCM and never exposed to client browsers.',
    },
    {
      icon: FileCheck,
      title: 'Automated Media Quality Control',
      description:
        'No video is marked as RENDERED or approved for publication until ffprobe inspects the actual MP4 file to verify frame rate, H.264 video streams, and audio normalization.',
    },
    {
      icon: Server,
      title: 'Idempotent Distributed Locking',
      description:
        'Publishing and scheduling jobs acquire Redis Redlock distributed locks with unique idempotency keys, guaranteeing network retries never duplicate a video upload.',
    },
    {
      icon: Lock,
      title: 'Strict Workspace Tenant Isolation',
      description:
        'Every database query is tenant-scoped by workspace ID. Role-Based Access Control enforces strict OWNER, ADMIN, EDITOR, and VIEWER permissions across assets.',
    },
    {
      icon: Eye,
      title: 'Full Audit Logging & Cost Controls',
      description:
        'Every external provider call is tracked in ProviderUsage and AuditLog tables with execution latency, token counts, and cost estimation so you maintain complete oversight.',
    },
  ];

  return (
    <section id="security" className="py-20 px-4 sm:px-6 lg:px-8 bg-canvas border-t border-border text-ink">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Section Header */}
        <div className="max-w-2xl space-y-3">
          <span className="text-xs font-mono font-semibold uppercase tracking-wider text-coral">
            Engineering Standards & Security
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-ink leading-tight">
            Reliability built for <br />
            <span className="font-editorial italic font-normal text-coral">real production workflows.</span>
          </h2>
          <p className="text-base text-stone leading-relaxed">
            ShortForge operates on production infrastructure with strict safety guarantees. Here is how our architecture protects your channels, credentials, and data.
          </p>
        </div>

        {/* 6 Guarantees Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {guarantees.map((g, idx) => {
            const Icon = g.icon;
            return (
              <div
                key={idx}
                className="bg-surface border border-border rounded-lg p-5 space-y-3 hover:border-border-strong transition-all shadow-xs"
              >
                <div className="h-9 w-9 rounded-md bg-canvas-subtle text-coral flex items-center justify-center border border-border">
                  <Icon className="h-4 w-4" />
                </div>
                <h3 className="font-bold text-sm text-ink">{g.title}</h3>
                <p className="text-xs text-stone leading-relaxed">
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
