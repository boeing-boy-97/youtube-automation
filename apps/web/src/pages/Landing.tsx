import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { useWorkspaceStore } from '../stores/workspaceStore';
import { useContentStore } from '../stores/contentStore';
import { useUIStore } from '../stores/uiStore';
import { seedContent, seedIdeas, seedNotifications, seedYouTubeChannel } from '../mock/seedData';
import { storageSet } from '../lib/utils';
import { STORAGE_KEYS } from '../lib/constants';

// Modular Art-Directed Landing Sections
import { LandingNav } from '../components/landing/LandingNav';
import { HeroSection } from '../components/landing/HeroSection';
import { CreativeProblemSection } from '../components/landing/CreativeProblemSection';
import { ProductProofSection } from '../components/landing/ProductProofSection';
import { ScriptStoryWorkspaceSection } from '../components/landing/ScriptStoryWorkspaceSection';
import { InteractiveShowcaseSection } from '../components/landing/InteractiveShowcaseSection';
import { FeatureStorytellingSection } from '../components/landing/FeatureStorytellingSection';
import { VideoStudioWorkspaceSection } from '../components/landing/VideoStudioWorkspaceSection';
import { AutomationFlowSection } from '../components/landing/AutomationFlowSection';
import { OutputGallerySection } from '../components/landing/OutputGallerySection';
import { TrustSecuritySection } from '../components/landing/TrustSecuritySection';
import { PricingSection } from '../components/landing/PricingSection';
import { FAQSection } from '../components/landing/FAQSection';
import { FinalCTASection } from '../components/landing/FinalCTASection';
import { LandingFooter } from '../components/landing/LandingFooter';

export function Landing() {
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);
  const setOnboardingComplete = useWorkspaceStore((s) => s.setOnboardingComplete);
  const initContent = useContentStore((s) => s.init);
  const showToast = useUIStore((s) => s.showToast);

  const handleExploreDemo = async () => {
    try {
      await login('demo@shortforge.io', 'password123');
      storageSet(STORAGE_KEYS.content, seedContent());
      storageSet(STORAGE_KEYS.ideas, seedIdeas());
      storageSet(STORAGE_KEYS.notifications, seedNotifications());
      storageSet(STORAGE_KEYS.youtube, seedYouTubeChannel());
      setOnboardingComplete();
      initContent();
      showToast({
        type: 'success',
        title: 'Studio Tour Activated',
        message: 'Welcome to your ShortForge Creative Studio.',
      });
      navigate('/dashboard');
    } catch {
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen bg-canvas text-ink font-sans selection:bg-vermilion-soft selection:text-ink">
      {/* 1. Header Navigation */}
      <LandingNav onDemoClick={handleExploreDemo} />

      {/* 2. Asymmetric Hero & Scrubbable 9:16 Video Player */}
      <HeroSection onDemoClick={handleExploreDemo} />

      {/* 3. The Creative Problem & Friction of Short-Form Video */}
      <CreativeProblemSection />

      {/* 4. Connected 7-Stage Production Pipeline */}
      <ProductProofSection />

      {/* 5. Screenplay & Story Architecture (Script Studio) */}
      <ScriptStoryWorkspaceSection />

      {/* 6. Interactive Studio Engine Showcase */}
      <InteractiveShowcaseSection />

      {/* 7. Editorial Feature Storytelling */}
      <FeatureStorytellingSection />

      {/* 8. Studio Workspace Deep-Dive */}
      <VideoStudioWorkspaceSection />

      {/* 9. Automation Execution Graph & Governance */}
      <AutomationFlowSection />

      {/* 10. Curated Output Gallery */}
      <OutputGallerySection />

      {/* 11. Architectural Trust & Security Standards */}
      <TrustSecuritySection />

      {/* 12. Transparent Pricing Plans */}
      <PricingSection />

      {/* 13. Creator & Engineering FAQ */}
      <FAQSection />

      {/* 14. Final Conversion CTA */}
      <FinalCTASection onDemoClick={handleExploreDemo} />

      {/* 15. Comprehensive Legal & Operational Footer */}
      <LandingFooter />
    </div>
  );
}
