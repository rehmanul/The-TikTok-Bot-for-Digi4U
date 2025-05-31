import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { Sidebar } from "@/components/sidebar";
import Login from "@/pages/login";
import Dashboard from "@/pages/dashboard";
import Settings from "@/pages/settings";
import NotFound from "@/pages/not-found";
import { useBotStatus } from "@/hooks/use-bot-status";

function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-foreground flex">
      <Sidebar />
      {children}
    </div>
  );
}

function Router() {
  const [location] = useLocation();
  const { data: botStatus } = useBotStatus();
  
  // Check if user is authenticated (has active TikTok session)
  const isAuthenticated = botStatus?.session?.puppeteer?.isLoggedIn || 
                          botStatus?.session?.isLoggedIn || 
                          false;
  
  // Redirect to login if not authenticated and not already on login page
  if (!isAuthenticated && location !== '/' && !location.startsWith('/login')) {
    return <Login />;
  }
  
  return (
    <Switch>
      <Route path="/" component={Login} />
      <Route path="/login" component={Login} />
      <Route path="/dashboard">
        <AuthenticatedLayout>
          <Dashboard />
        </AuthenticatedLayout>
      </Route>
      <Route path="/settings">
        <AuthenticatedLayout>
          <Settings />
        </AuthenticatedLayout>
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light" storageKey="tiktok-affiliator-theme">
        <TooltipProvider>
          <Router />
          <Toaster />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
