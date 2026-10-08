import { ReactNode, useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { useUIStore } from '../stores/uiStore';
import { useAuthStore } from '../stores/authStore';
import { useWorkspaceStore } from '../stores/workspaceStore';
import { useContentStore } from '../stores/contentStore';
import { useAutomationStore } from '../stores/automationStore';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function StoreInitializer({ children }: { children: ReactNode }) {
  const initAuth = useAuthStore(s => s.init);
  const initWorkspace = useWorkspaceStore(s => s.initWorkspace);
  const initContent = useContentStore(s => s.init);
  const initAutomation = useAutomationStore(s => s.init);
  const theme = useUIStore(s => s.theme);

  useEffect(() => {
    initAuth();
    initWorkspace();
    initContent();
    initAutomation();
  }, [initAuth, initWorkspace, initContent, initAutomation]);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  return <>{children}</>;
}

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <StoreInitializer>
          {children}
        </StoreInitializer>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
