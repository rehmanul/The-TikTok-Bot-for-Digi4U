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
        'width=800,height=600,scrollbars=yes,resizable=yes'
      );

      if (!loginWindow) {
        throw new Error('Please allow popups to login to TikTok');
      }

      setLoginStatus('manual');

      // Monitor the login window
      const checkInterval = setInterval(() => {
        try {
          if (loginWindow.closed) {
            clearInterval(checkInterval);
            setLoginStatus('checking');
            // Wait a moment before checking to ensure login cookies are set
            setTimeout(() => checkLoginStatus(), 1000);
          }
        } catch (error) {
          // Window might be on different domain, that's expected
        }
      }, 1000);

      // Auto-close after 10 minutes
      setTimeout(() => {
        if (!loginWindow.closed) {
          loginWindow.close();
          clearInterval(checkInterval);
          setIsConnecting(false);
          setLoginStatus('idle');
          toast({
            title: "Login Timeout",
            description: "Login window closed automatically after 10 minutes",
            variant: "destructive",
          });
        }
      }, 600000);

    } catch (error) {
      setIsConnecting(false);
      setLoginStatus('idle');
      toast({
        title: "Connection Failed",
        description: error instanceof Error ? error.message : "Failed to open TikTok login",
        variant: "destructive",
      });
    }
  };

  const checkLoginStatus = async () => {
    try {
      setLoginStatus('checking');
      
      // Add a small delay to ensure the login process has completed
      await new Promise(resolve => setTimeout(resolve, 3000));

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

      const response = await fetch('/api/bot/check-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('Login verification result:', result);

      if (result.success && result.isLoggedIn) {
        setLoginStatus('success');
        toast({
          title: "Login Successful",
          description: result.message || "Successfully connected to TikTok Seller Center",
        });

        // Redirect to dashboard after short delay
        setTimeout(() => {
          setLocation('/dashboard');
        }, 2000);
      } else {
        setIsConnecting(false);
        setLoginStatus('idle');
        
        // Provide more specific error messages
        let errorMessage = result.message || "Please complete the login process in TikTok Seller Center";
        
        if (result.error) {
          if (result.error.includes('timeout')) {
            errorMessage = "Login verification timed out. Please try again.";
          } else if (result.error.includes('navigation')) {
            errorMessage = "Unable to access TikTok Seller Center. Please check your connection.";
          }
        }

        toast({
          title: "Login Verification Failed",
          description: errorMessage,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Login check error:', error);
      setIsConnecting(false);
      setLoginStatus('idle');
      
      let errorMessage = "Unable to verify login status. Please try again.";
      
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          errorMessage = "Login verification timed out. Please try again.";
        } else if (error.message.includes('fetch')) {
          errorMessage = "Network error. Please check your connection and try again.";
        }
      }

      toast({
        title: "Verification Failed",
        description: errorMessage,
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
