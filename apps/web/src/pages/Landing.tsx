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
import { ProductProofSection } from '../components/landing/ProductProofSection';
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
        message: 'Welcome to your ShortForge Creative Command Center.',
      });
      navigate('/dashboard');
    } catch {
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen bg-paper text-ink font-sans selection:bg-lime/30 selection:text-ink">
      {/* 1. Refined, Compact Sticky Navigation */}
      <LandingNav onDemoClick={handleExploreDemo} />

      {/* 2. Section A: Asymmetric Editorial Hero with Interactive Workspace */}
      <HeroSection onDemoClick={handleExploreDemo} />

      {/* 3. Section B: Product Proof — 7-Stage Connected Production Sequence */}
      <ProductProofSection />

      {/* 4. Section C: Standout Interactive Product Showcase */}
      <InteractiveShowcaseSection />

      {/* 5. Section D: Art-Directed Feature Storytelling */}
      <FeatureStorytellingSection />

      {/* 6. Section E: Studio Workspace Deep-Dive */}
      <VideoStudioWorkspaceSection />

      {/* 7. Section F: Automation Flow Diagram & Execution Guardrails */}
      <AutomationFlowSection />

      {/* 8. Section G: Curated Output Gallery */}
      <OutputGallerySection />

      {/* 9. Section H: Trust, Reliability & Security Standards */}
      <TrustSecuritySection />

      {/* 10. Section I: Transparent Pricing */}
      <PricingSection />

      {/* 11. Section J: Accessible Smooth FAQ Accordion */}
      <FAQSection />

      {/* 12. Section K: Final Memorable CTA & Comprehensive Footer */}
      <FinalCTASection onDemoClick={handleExploreDemo} />
      <LandingFooter />
    </div>
  );
}
