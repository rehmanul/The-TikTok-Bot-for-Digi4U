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
import { Sidebar } from '@/components/sidebar';

// Import the new theme
import '@/styles/theme.css';

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light">
        <div className="min-h-screen flex">
          <Route path="/login" component={Login} />
          <Route path="*">
            {(match) =>
              match ? (
                <div className="flex-1 flex">
                  <Sidebar />
                  <Switch>
                    <Route path="/" component={Dashboard} />
                    <Route path="/dashboard" component={Dashboard} />
                    <Route path="/settings" component={Settings} />
                    <Route path="/creators" component={Creators} />
                    <Route path="/analytics" component={Analytics} />
                    <Route path="/logs" component={Logs} />
                    <Route component={NotFound} />
                  </Switch>
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
