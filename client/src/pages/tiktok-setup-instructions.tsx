import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import { 
  ExternalLink, 
  Copy, 
  CheckCircle, 
  AlertTriangle,
  ArrowRight,
  Key,
  Settings
} from 'lucide-react';

export default function TikTokSetupInstructions() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [accessToken, setAccessToken] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [step, setStep] = useState(1);

  const handleConnect = async () => {
    if (!accessToken.trim()) {
      toast({
        title: "Error",
        description: "Please enter your access token",
        variant: "destructive",
      });
      return;
    }

    setIsConnecting(true);

    try {
      const response = await fetch('/api/tiktok/set-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ access_token: accessToken.trim() })
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: "Connected Successfully",
          description: "TikTok API is now connected",
        });
        queryClient.invalidateQueries({ queryKey: ['/api/tiktok/validate'] });
        setStep(5);
      } else {
        toast({
          title: "Connection Failed",
          description: data.message || "Invalid access token",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Connection failed",
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied",
      description: "Copied to clipboard",
    });
  };

  const steps = [
    {
      title: "Access TikTok Developer Portal",
      description: "Log into your TikTok For Business developer account",
      content: (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Visit the TikTok For Business developer portal to manage your API access.
          </p>
          <Button 
            onClick={() => window.open('https://developers.tiktok.com/', '_blank')}
            className="w-full"
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            Open TikTok Developer Portal
          </Button>
        </div>
      )
    },
    {
      title: "Navigate to App Management",
      description: "Find your app and access API credentials",
      content: (
        <div className="space-y-3">
          <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
            <ol className="text-sm space-y-2">
              <li className="flex items-start space-x-2">
                <ArrowRight className="w-4 h-4 mt-0.5 text-blue-600" />
                <span>Go to "Manage Apps" in the dashboard</span>
              </li>
              <li className="flex items-start space-x-2">
                <ArrowRight className="w-4 h-4 mt-0.5 text-blue-600" />
                <span>Find your app with ID: <code className="bg-blue-100 dark:bg-blue-900 px-1 rounded">7512649815700963329</code></span>
              </li>
              <li className="flex items-start space-x-2">
                <ArrowRight className="w-4 h-4 mt-0.5 text-blue-600" />
                <span>Click "View Details" or "Manage"</span>
              </li>
            </ol>
          </div>
        </div>
      )
    },
    {
      title: "Generate Access Token",
      description: "Create a new access token with proper permissions",
      content: (
        <div className="space-y-3">
          <Alert>
            <Key className="w-4 h-4" />
            <AlertDescription>
              Look for "Generate Access Token" or "API Credentials" section in your app dashboard.
            </AlertDescription>
          </Alert>
          <div className="p-3 bg-amber-50 dark:bg-amber-950/20 rounded-lg border border-amber-200 dark:border-amber-800">
            <h4 className="font-semibold text-amber-800 dark:text-amber-200 mb-2">Required Scopes:</h4>
            <div className="grid grid-cols-1 gap-2 text-sm">
              {[
                'user.info.basic',
                'biz.creator.info',
                'biz.creator.insights', 
                'video.list',
                'tcm.order.update',
                'tto.campaign.link'
              ].map((scope) => (
                <div key={scope} className="flex items-center space-x-2">
                  <CheckCircle className="w-3 h-3 text-amber-600" />
                  <code className="text-amber-700 dark:text-amber-300">{scope}</code>
                </div>
              ))}
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Enter Access Token",
      description: "Paste your token to connect the bot",
      content: (
        <div className="space-y-4">
          <div>
            <Textarea
              placeholder="Paste your TikTok Business API access token here..."
              value={accessToken}
              onChange={(e) => setAccessToken(e.target.value)}
              rows={4}
              className="font-mono text-sm"
            />
          </div>
          <Button 
            onClick={handleConnect}
            disabled={!accessToken || isConnecting}
            className="w-full"
            size="lg"
          >
            {isConnecting ? 'Connecting...' : 'Connect API'}
          </Button>
        </div>
      )
    },
    {
      title: "Connection Successful",
      description: "Your TikTok API is now connected and ready",
      content: (
        <div className="space-y-4">
          <Alert className="border-green-200 bg-green-50 dark:bg-green-950/20">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <AlertDescription className="text-green-800 dark:text-green-200">
              TikTok API successfully connected. You can now use all bot features.
            </AlertDescription>
          </Alert>
          <div className="flex space-x-3">
            <Button className="flex-1">Configure Bot Settings</Button>
            <Button variant="outline">View Dashboard</Button>
          </div>
        </div>
      )
    }
  ];

  return (
    <div className="flex-1 bg-background">
      <header className="h-20 bg-gradient-to-r from-primary/5 to-pink-50 dark:from-primary/10 dark:to-pink-950/20 border-b border-border/50 flex items-center px-8">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
            <Settings className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-foreground">TikTok API Setup</h2>
            <p className="text-sm text-muted-foreground">Complete guide to connect your TikTok Business API</p>
          </div>
        </div>
      </header>

      <main className="p-8 max-w-4xl mx-auto">
        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Setup Progress</h3>
            <Badge variant="outline">{step}/5 Steps</Badge>
          </div>
          <div className="flex space-x-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div 
                key={i}
                className={`h-2 flex-1 rounded-full ${
                  i <= step ? 'bg-primary' : 'bg-muted'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Current Step */}
        <Card className="border-border/50 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-sm font-bold text-primary">
                {step}
              </div>
              <div>
                <span>{steps[step - 1].title}</span>
                <p className="text-sm text-muted-foreground font-normal mt-1">
                  {steps[step - 1].description}
                </p>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {steps[step - 1].content}
            
            {step < 4 && step !== 5 && (
              <div className="mt-6 flex justify-end">
                <Button 
                  onClick={() => setStep(step + 1)}
                  variant="outline"
                >
                  Next Step
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Common Issues */}
        <Card className="mt-8 border-border/50 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-orange-500" />
              <span>Common Issues & Solutions</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-3 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-200 dark:border-red-800">
                <h4 className="font-semibold text-red-800 dark:text-red-200 mb-1">OAuth Redirect Error</h4>
                <p className="text-sm text-red-700 dark:text-red-300">
                  The OAuth method fails because redirect URIs must be pre-registered in TikTok's developer portal. 
                  Use the manual token method above instead.
                </p>
              </div>
              
              <div className="p-3 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                <h4 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-1">Invalid Token Error</h4>
                <p className="text-sm text-yellow-700 dark:text-yellow-300">
                  Ensure your token has all required scopes listed above and is from the correct TikTok Business account.
                </p>
              </div>
              
              <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-1">Account Access Issues</h4>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  Verify your TikTok Business account has proper permissions for creator collaboration features.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* App Configuration Reference */}
        <Card className="mt-8 border-border/50 shadow-lg">
          <CardHeader>
            <CardTitle>Your App Configuration</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-muted/30 rounded-lg">
                <div className="text-sm font-medium text-muted-foreground">App ID</div>
                <div className="text-sm font-mono text-foreground flex items-center justify-between">
                  7512649815700963329
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard('7512649815700963329')}
                    className="h-6 w-6 p-0"
                  >
                    <Copy className="w-3 h-3" />
                  </Button>
                </div>
              </div>
              <div className="p-3 bg-muted/30 rounded-lg">
                <div className="text-sm font-medium text-muted-foreground">Environment</div>
                <div className="text-sm text-foreground">Production</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}