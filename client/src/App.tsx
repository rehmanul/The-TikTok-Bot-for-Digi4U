import { useState } from 'react';
import { Route, Switch } from 'wouter';
import { QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/toaster';
import { queryClient } from '@/lib/queryClient';
import Dashboard from '@/pages/dashboard';
import Settings from '@/pages/settings';
import Login from '@/pages/login';
import NotFound from '@/pages/not-found';
import Creators from '@/pages/creators';
import Analytics from '@/pages/analytics';
import Logs from '@/pages/logs';
import TikTokAPI from '@/pages/tiktok-api';
import Guide from '@/pages/guide';
import Help from '@/pages/help';
import OAuthCallback from '@/pages/oauth-callback';
import RealBot from '@/pages/real-bot';
import { Sidebar, MobileMenuButton } from '@/components/sidebar';
import { useMobile } from '@/hooks/use-mobile';

// Import the new theme
import '@/styles/theme.css';

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isMobile = useMobile();

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light">
        <div className="min-h-screen flex">
          <Route path="/login" component={Login} />
          <Route path="*">
            {(match) =>
              match ? (
                <div className="flex-1 flex h-screen overflow-hidden">
                  <Sidebar 
                    isOpen={sidebarOpen} 
                    onClose={() => setSidebarOpen(false)} 
                  />
                  <div className="flex-1 flex flex-col overflow-hidden">
                    {/* Mobile Header */}
                    {isMobile && (
                      <header className="h-16 bg-background border-b border-border flex items-center justify-between px-4 lg:hidden">
                        <MobileMenuButton onClick={() => setSidebarOpen(true)} />
                        <h1 className="text-lg font-semibold">TikTok Bot</h1>
                        <div className="w-10" /> {/* Spacer for centering */}
                      </header>
                    )}
                    
                    {/* Main Content */}
                    <main className="flex-1 overflow-auto">
                      <Switch>
                        <Route path="/" component={Dashboard} />
                        <Route path="/dashboard" component={Dashboard} />
                        <Route path="/guide" component={Guide} />
                        <Route path="/help" component={Help} />
                        <Route path="/oauth-callback" component={OAuthCallback} />
                        <Route path="/tiktok-api" component={TikTokAPI} />
                        <Route path="/real-bot" component={RealBot} />
                        <Route path="/settings" component={Settings} />
                        <Route path="/creators" component={Creators} />
                        <Route path="/analytics" component={Analytics} />
                        <Route path="/logs" component={Logs} />
                        <Route component={NotFound} />
                      </Switch>
                    </main>
                  </div>
                </div>
              ) : null
            }
          </Route>
          <Toaster />
        </div>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
