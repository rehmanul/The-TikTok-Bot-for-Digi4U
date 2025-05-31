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
    <div className="min-h-screen bg-black flex items-center justify-center p-6">
      <div className="w-full max-w-md space-y-8">
        {/* Logo and Title */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-tiktok-primary to-tiktok-secondary mb-6">
            <Rocket className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">
            TikTok Affiliator v2
          </h1>
          <p className="text-gray-300">
            Automate your TikTok Shop affiliate invitations
          </p>
        </div>

        {/* Login Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-center text-white">Connect to TikTok</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Status Display */}
            <div className="flex items-center justify-center space-x-2 p-4 bg-gray-800 rounded-lg border border-gray-700">
              {getStatusIcon()}
              <span className="text-sm font-medium text-white">{getStatusMessage()}</span>
            </div>

            {/* Connect Button */}
            <Button
              onClick={handleConnectToTikTok}
              disabled={isConnecting}
              size="lg"
              className="w-full bg-gradient-to-r from-tiktok-primary to-tiktok-secondary hover:opacity-90 text-white font-semibold shadow-lg"
            >
              {isConnecting ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin text-white" />
              ) : (
                <LogIn className="w-4 h-4 mr-2 text-white" />
              )}
              {isConnecting ? 'Connecting...' : 'Connect to TikTok Seller UK'}
            </Button>

            {/* Instructions */}
            <div className="space-y-3 text-sm">
              <h4 className="font-semibold text-white">How it works:</h4>
              <ol className="space-y-1 list-decimal list-inside text-gray-300">
                <li className="text-gray-300">Click "Connect to TikTok Seller UK" above</li>
                <li className="text-gray-300">Complete login manually in the popup window</li>
                <li className="text-gray-300">Close the popup when login is complete</li>
                <li className="text-gray-300">The dashboard will appear automatically</li>
              </ol>
            </div>

            {/* System Status */}
            <div className="pt-4 border-t border-gray-700">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-300">System Status</span>
                <Badge variant="outline" className="text-xs text-gray-300 border-gray-600 bg-gray-800">
                  {botStatus?.session?.puppeteer?.isInitialized ? 'Ready' : 'Initializing'}
                </Badge>
              </div>
            </div>

            {/* Warning */}
            <div className="flex items-start space-x-2 p-3 bg-orange-950/30 border border-orange-800 rounded-lg">
              <AlertCircle className="w-4 h-4 text-orange-400 mt-0.5 flex-shrink-0" />
              <div className="text-xs text-orange-200">
                <strong>Important:</strong> Only use with your own TikTok Seller account. 
                Ensure you comply with TikTok's terms of service.
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-xs text-gray-400">
          <p>Created by Digi4U_RDEV</p>
          <p>For production use by Digi4U Repair</p>
        </div>
      </div>
    </div>
  );
}
