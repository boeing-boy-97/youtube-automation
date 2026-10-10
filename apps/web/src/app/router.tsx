import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { useWorkspaceStore } from '../stores/workspaceStore';
import { AppLayout } from '../components/shell/AppLayout';

// Lazy load pages
const Landing = lazy(() => import('../pages/Landing').then(m => ({ default: m.Landing })));
const Login = lazy(() => import('../pages/Login').then(m => ({ default: m.Login })));
const Signup = lazy(() => import('../pages/Signup').then(m => ({ default: m.Signup })));
const Onboarding = lazy(() => import('../pages/Onboarding').then(m => ({ default: m.Onboarding })));
const Dashboard = lazy(() => import('../pages/Dashboard').then(m => ({ default: m.Dashboard })));
const Ideas = lazy(() => import('../pages/Ideas').then(m => ({ default: m.Ideas })));
const ContentLibrary = lazy(() => import('../pages/ContentLibrary').then(m => ({ default: m.ContentLibrary })));
const ContentDetails = lazy(() => import('../pages/ContentDetails').then(m => ({ default: m.ContentDetails })));
const Create = lazy(() => import('../pages/Create').then(m => ({ default: m.Create })));
const ScriptLab = lazy(() => import('../pages/ScriptLab').then(m => ({ default: m.ScriptLab })));
const VideoStudio = lazy(() => import('../pages/VideoStudio').then(m => ({ default: m.VideoStudio })));
const Queue = lazy(() => import('../pages/Queue').then(m => ({ default: m.Queue })));
const Calendar = lazy(() => import('../pages/Calendar').then(m => ({ default: m.Calendar })));
const Automation = lazy(() => import('../pages/Automation').then(m => ({ default: m.Automation })));
const Workflow = lazy(() => import('../pages/Workflow').then(m => ({ default: m.Workflow })));
const Templates = lazy(() => import('../pages/Templates').then(m => ({ default: m.Templates })));
const BrandKit = lazy(() => import('../pages/BrandKit').then(m => ({ default: m.BrandKit })));
const Assets = lazy(() => import('../pages/Assets').then(m => ({ default: m.Assets })));
const Analytics = lazy(() => import('../pages/Analytics').then(m => ({ default: m.Analytics })));
const YouTube = lazy(() => import('../pages/YouTube').then(m => ({ default: m.YouTubePage })));
const Notifications = lazy(() => import('../pages/Notifications').then(m => ({ default: m.Notifications })));
const Settings = lazy(() => import('../pages/Settings').then(m => ({ default: m.Settings })));
const Help = lazy(() => import('../pages/Help').then(m => ({ default: m.Help })));
const NotFound = lazy(() => import('../pages/NotFound').then(m => ({ default: m.NotFound })));

function PageLoader() {
  return (
    <div className="flex items-center justify-center py-24">
      <div className="flex items-center gap-3 text-text-muted">
        <div className="h-5 w-5 border-2 border-accent border-t-transparent rounded-full animate-spin" />
        <span className="text-sm">Loading...</span>
      </div>
    </div>
  );
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore(s => s.isAuthenticated);
  const isLoading = useAuthStore(s => s.isLoading);

  if (isLoading) return <PageLoader />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function OnboardingRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore(s => s.isAuthenticated);
  const workspace = useWorkspaceStore(s => s.workspace);

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (workspace?.onboardingComplete) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}

function AuthenticatedRedirect({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore(s => s.isAuthenticated);
  const workspace = useWorkspaceStore(s => s.workspace);

  if (isAuthenticated) {
    if (workspace?.onboardingComplete) return <Navigate to="/dashboard" replace />;
    return <Navigate to="/onboarding" replace />;
  }
  return <>{children}</>;
}

export function AppRouter() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Public */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={
          <AuthenticatedRedirect>
            <Login />
          </AuthenticatedRedirect>
        } />
        <Route path="/signup" element={
          <AuthenticatedRedirect>
            <Signup />
          </AuthenticatedRedirect>
        } />

        {/* Onboarding */}
        <Route path="/onboarding" element={
          <OnboardingRoute>
            <Onboarding />
          </OnboardingRoute>
        } />
        <Route path="/onboarding/:step" element={
          <OnboardingRoute>
            <Onboarding />
          </OnboardingRoute>
        } />

        {/* App */}
        <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/ideas" element={<Ideas />} />
          <Route path="/content" element={<ContentLibrary />} />
          <Route path="/content/:id" element={<ContentDetails />} />
          <Route path="/create" element={<Create />} />
          <Route path="/script-lab" element={<ScriptLab />} />
          <Route path="/script-lab/:id" element={<ScriptLab />} />
          <Route path="/script-lab/new" element={<ScriptLab />} />
          <Route path="/studio" element={<VideoStudio />} />
          <Route path="/studio/:id" element={<VideoStudio />} />
          <Route path="/studio/new" element={<VideoStudio />} />
          <Route path="/queue" element={<Queue />} />
          <Route path="/calendar" element={<Calendar />} />
          <Route path="/automation" element={<Automation />} />
          <Route path="/workflow" element={<Workflow />} />
          <Route path="/templates" element={<Templates />} />
          <Route path="/brand-kit" element={<BrandKit />} />
          <Route path="/assets" element={<Assets />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/youtube" element={<YouTube />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/help" element={<Help />} />
        </Route>

        <Route path="/404" element={<NotFound />} />
        <Route path="*" element={<Navigate to="/404" replace />} />
      </Routes>
    </Suspense>
  );
}
