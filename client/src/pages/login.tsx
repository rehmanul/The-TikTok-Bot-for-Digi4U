import { useState } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useBotStatus } from '@/hooks/use-bot-status';
import { useToast } from '@/hooks/use-toast';
import { 
  Rocket, 
  LogIn, 
  CheckCircle, 
  AlertCircle, 
  Loader2,
  ExternalLink 
} from 'lucide-react';

export default function Login() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { data: botStatus } = useBotStatus();
  const [isConnecting, setIsConnecting] = useState(false);
  const [loginStatus, setLoginStatus] = useState<'idle' | 'connecting' | 'manual' | 'checking' | 'success'>('idle');

  const handleConnectToTikTok = async () => {
    setIsConnecting(true);
    setLoginStatus('connecting');

    try {
      // Open TikTok Seller UK login in new window
      const loginWindow = window.open(
        'https://seller-uk-accounts.tiktok.com/account/login',
        'tiktok-login',
        'width=1000,height=700,scrollbars=yes,resizable=yes'
      );

      if (!loginWindow) {
        throw new Error('Please allow popups for this site to continue');
      }

      setLoginStatus('manual');

      // Monitor the login window
      let attempts = 0;
      const maxAttempts = 90; // 3 minutes timeout
      let lastError = '';

      const checkLoginStatus = async (): Promise<{ success: boolean; error?: string }> => {
        try {
          const response = await fetch('/api/bot/check-login', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
          });

          const result = await response.json();

          if (result.success && result.isLoggedIn) {
            loginWindow.close();
            setLoginStatus('success');
            toast({
              title: "Login Successful",
              description: result.message || "Successfully connected to TikTok Seller Center",
            });

            // Redirect to dashboard immediately since login is verified
            setTimeout(() => {
              setLocation('/dashboard');
              // Force a page refresh to ensure the app recognizes the new auth state
              window.location.reload();
            }, 1500);
            return { success: true };
          }

          // Update UI with current status
          if (result.message) {
            console.log('Login status:', result.message);
          }

          return { success: false, error: result.error };
        } catch (error) {
          console.error('Login check failed:', error);
          return { success: false, error: 'Network error during verification' };
        }
      };

      const pollLogin = async () => {
        attempts++;

        // Check if popup is still open
        try {
          if (loginWindow.closed) {
            // window closed unexpectedly; check login status one last time
            const closedResult = await checkLoginStatus();
            if (!closedResult.success) {
              setIsConnecting(false);
              setLoginStatus('idle');
              toast({
                title: "Login Verification Failed",
                description: 'Login window was closed. Please complete the login process and try again.',
                variant: "destructive",
              });
            }
            return;
          }
        } catch (e) {
          // Popup might be closed or inaccessible
          setIsConnecting(false);
          setLoginStatus('idle');
          toast({
            title: "Login Verification Failed",
            description: 'Login window closed unexpectedly. Please try again.',
            variant: "destructive",
          });
          return;
        }

        if (attempts >= maxAttempts) {
          try {
            loginWindow.close();
          } catch (e) {
            // Ignore popup close errors
          }
          setIsConnecting(false);
          setLoginStatus('idle');
          toast({
            title: "Login Verification Failed",
            description: 'Login verification timeout. Please ensure you completed the login and try again.',
            variant: "destructive",
          });
          return;
        }

        const result = await checkLoginStatus();

        if (!result.success) {
          // Update last error but don't fail immediately
          if (result.error && result.error !== lastError) {
            lastError = result.error;
            console.log('Login verification attempt:', attempts, 'Error:', result.error);
          }

          // Show progress to user
          if (attempts % 10 === 0) {
            console.log(`Checking login status... (${attempts}/${maxAttempts})`);
          }

          setTimeout(pollLogin, 2000);
        }
      };

      // Start polling after allowing popup to load
      setTimeout(pollLogin, 5000);

    } catch (error) {
      setIsConnecting(false);
      setLoginStatus('idle');
      toast({
        title: "Connection Failed",
        description: error instanceof Error ? error.message : "Failed to initiate login process",
        variant: "destructive",
      });
    }
  };

  const getStatusMessage = () => {
    switch (loginStatus) {
      case 'connecting': return 'Opening TikTok login...';
      case 'manual': return 'Please complete login in the popup window';
      case 'checking': return 'Verifying login status...';
      case 'success': return 'Login successful! Redirecting...';
      default: return 'Ready to connect';
    }
  };

  const getStatusIcon = () => {
    switch (loginStatus) {
      case 'connecting':
      case 'checking':
        return <Loader2 className="w-5 h-5 animate-spin" />;
      case 'manual':
        return <ExternalLink className="w-5 h-5" />;
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      default:
        return <LogIn className="w-5 h-5" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gray-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gray-700/20 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gray-400/10 rounded-full blur-3xl animate-pulse delay-500" />
      </div>

      {/* Grid pattern overlay */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 32 32%27 width=%2732%27 height=%2732%27 fill=%27none%27 stroke=%27rgb(148 163 184 / 0.05)%27%3e%3cpath d=%27m0 .5 32 0M.5 0v32%27/%3e%3c/svg%3e')] opacity-50" />

      <div className="w-full max-w-md space-y-8 relative z-10">
        {/* Logo and Title */}
        <div className="text-center">
          <div className="relative inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-gray-600 via-gray-500 to-gray-400 mb-6 shadow-lg shadow-gray-500/25">
            <Rocket className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent mb-3">
            TikTok Affiliator v2
          </h1>
          <p className="text-slate-300 text-lg font-medium">
            Automate your TikTok Shop affiliate invitations
          </p>
        </div>

        {/* Login Card */}
        <Card className="backdrop-blur-xl bg-white/10 border-white/20 shadow-2xl shadow-black/20">
          <CardHeader className="pb-4">
            <CardTitle className="text-center text-white text-xl font-semibold">Connect to TikTok</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Status Display */}
            <div className="flex items-center justify-center space-x-3 p-4 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
              <div className="p-2 rounded-lg bg-white/10">
                {getStatusIcon()}
              </div>
              <span className="text-sm font-medium text-white">{getStatusMessage()}</span>
            </div>

            {/* Connect Button */}
            <Button
              onClick={handleConnectToTikTok}
              disabled={isConnecting}
              size="lg"
              className="w-full h-12 bg-gradient-to-r from-gray-600 to-gray-500 hover:from-gray-700 hover:to-gray-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 border-0"
            >
              {isConnecting ? (
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              ) : (
                <LogIn className="w-5 h-5 mr-2" />
              )}
              {isConnecting ? 'Connecting...' : 'Connect to TikTok Seller UK'}
            </Button>

            {/* Instructions */}
            <div className="space-y-4 p-4 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
              <h4 className="font-semibold text-white flex items-center">
                <div className="w-2 h-2 bg-gray-400 rounded-full mr-2"></div>
                How it works:
              </h4>
              <div className="space-y-3">
                {[
                  'Click "Connect to TikTok Seller UK" above',
                  'Complete login manually in the popup window',
                  'Close the popup when login is complete',
                  'The dashboard will appear automatically'
                ].map((step, index) => (
                  <div key={index} className="flex items-start space-x-3 text-sm text-slate-300">
                    <div className="flex-shrink-0 w-6 h-6 bg-gradient-to-br from-gray-600 to-gray-500 rounded-full flex items-center justify-center text-white text-xs font-bold mt-0.5">
                      {index + 1}
                    </div>
                    <span>{step}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* System Status */}
            <div className="flex items-center justify-between p-3 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10">
              <span className="text-sm text-slate-300 font-medium">System Status</span>
              <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 font-medium">
                {botStatus?.session?.puppeteer?.isInitialized ? 'Ready' : 'Initializing'}
              </Badge>
            </div>

            {/* Warning */}
            <div className="flex items-start space-x-3 p-4 bg-amber-500/10 backdrop-blur-sm border border-amber-500/20 rounded-xl">
              <div className="p-1 rounded-lg bg-amber-500/20">
                <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0" />
              </div>
              <div className="text-sm text-amber-200">
                <strong className="font-semibold">Important:</strong> Only use with your own TikTok Seller account.
                Ensure you comply with TikTok's terms of service.
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center space-y-1">
          <p className="text-sm text-slate-400 font-medium">Created by Digi4U_RDEV</p>
          <p className="text-xs text-slate-500">For production use by Digi4U Repair</p>
        </div>
      </div>
    </div>
  );
}
