import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import { 
  Key, 
  CheckCircle, 
  AlertTriangle, 
  ExternalLink,
  Copy,
  ArrowRight,
  Globe,
  Settings
} from 'lucide-react';

export default function ConnectionGuide() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [accessToken, setAccessToken] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleConnect = async () => {
    if (!accessToken.trim()) {
      toast({
        title: "Missing Token",
        description: "Please paste your access token first",
        variant: "destructive",
      });
      return;
    }

    setIsConnecting(true);
    setConnectionStatus('idle');
    setErrorMessage('');

    try {
      const response = await fetch('/api/tiktok/set-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ access_token: accessToken.trim() })
      });

      const data = await response.json();

      if (data.success) {
        setConnectionStatus('success');
        toast({
          title: "Connected Successfully",
          description: "TikTok API is now connected and ready",
        });
        queryClient.invalidateQueries({ queryKey: ['/api/tiktok/validate'] });
        setAccessToken('');
      } else {
        setConnectionStatus('error');
        setErrorMessage(data.message || 'Connection failed');
        toast({
          title: "Connection Failed",
          description: data.message || "Please check your access token",
          variant: "destructive",
        });
      }
    } catch (error) {
      setConnectionStatus('error');
      const message = error instanceof Error ? error.message : 'Network error';
      setErrorMessage(message);
      toast({
        title: "Connection Error",
        description: message,
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
      number: 1,
      title: "Access TikTok Business API Dashboard",
      description: "Log into your TikTok Business account and navigate to the API section",
      action: (
        <Button 
          onClick={() => window.open('https://business-api.tiktok.com/', '_blank')}
          className="w-full"
        >
          <ExternalLink className="w-4 h-4 mr-2" />
          Open TikTok Business API
        </Button>
      )
    },
    {
      number: 2,
      title: "Generate Access Token",
      description: "Create a new access token with creator collaboration permissions",
      details: [
        "Navigate to 'API Management' section",
        "Click 'Create New Token'",
        "Select scopes: biz.creator.info, tcm.order.update, tto.campaign.link",
        "Copy the generated token immediately"
      ]
    },
    {
      number: 3,
      title: "Configure Bot Connection",
      description: "Paste your access token below to connect the bot",
      action: (
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
    }
  ];

  return (
    <div className="flex-1 bg-background">
      <header className="h-20 bg-gradient-to-r from-primary/5 to-pink-50 dark:from-primary/10 dark:to-pink-950/20 border-b border-border/50 flex items-center px-8">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
            <Globe className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-foreground">API Connection Guide</h2>
            <p className="text-sm text-muted-foreground">Step-by-step setup for TikTok Business API</p>
          </div>
        </div>
      </header>

      <main className="p-8 max-w-4xl mx-auto space-y-8">
        {/* Current Status */}
        <Card className="border-border/50 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Connection Status</span>
              <Badge variant={connectionStatus === 'success' ? 'default' : connectionStatus === 'error' ? 'destructive' : 'secondary'}>
                {connectionStatus === 'success' ? 'Connected' : connectionStatus === 'error' ? 'Failed' : 'Not Connected'}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {connectionStatus === 'success' && (
              <Alert className="border-green-200 bg-green-50 dark:bg-green-950/20">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <AlertDescription className="text-green-800 dark:text-green-200">
                  TikTok API is successfully connected. You can now start using the bot features.
                </AlertDescription>
              </Alert>
            )}
            {connectionStatus === 'error' && (
              <Alert className="border-red-200 bg-red-50 dark:bg-red-950/20">
                <AlertTriangle className="w-4 h-4 text-red-600" />
                <AlertDescription className="text-red-800 dark:text-red-200">
                  Connection failed: {errorMessage}
                </AlertDescription>
              </Alert>
            )}
            {connectionStatus === 'idle' && (
              <Alert className="border-yellow-200 bg-yellow-50 dark:bg-yellow-950/20">
                <AlertTriangle className="w-4 h-4 text-yellow-600" />
                <AlertDescription className="text-yellow-800 dark:text-yellow-200">
                  TikTok API connection required. Follow the steps below to connect.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Setup Steps */}
        <div className="space-y-6">
          {steps.map((step, index) => (
            <Card key={index} className="border-border/50 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-sm font-bold text-primary">
                    {step.number}
                  </div>
                  <span>{step.title}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">{step.description}</p>
                
                {step.details && (
                  <div className="p-4 bg-muted/20 rounded-lg">
                    <h4 className="font-medium mb-2">Instructions:</h4>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      {step.details.map((detail, i) => (
                        <li key={i} className="flex items-start space-x-2">
                          <ArrowRight className="w-3 h-3 mt-1 text-primary flex-shrink-0" />
                          <span>{detail}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {step.action && <div>{step.action}</div>}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* API Configuration */}
        <Card className="border-border/50 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Settings className="w-5 h-5 text-primary" />
              <span>API Configuration</span>
            </CardTitle>
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
              <div className="p-3 bg-muted/30 rounded-lg">
                <div className="text-sm font-medium text-muted-foreground">API Version</div>
                <div className="text-sm text-foreground">v1.3</div>
              </div>
              <div className="p-3 bg-muted/30 rounded-lg">
                <div className="text-sm font-medium text-muted-foreground">Region</div>
                <div className="text-sm text-foreground">United Kingdom</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Required Scopes */}
        <Card className="border-border/50 shadow-lg">
          <CardHeader>
            <CardTitle>Required API Scopes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { scope: 'user.info.basic', description: 'Basic user information access' },
                { scope: 'biz.creator.info', description: 'Creator profile and statistics' },
                { scope: 'biz.creator.insights', description: 'Creator performance metrics' },
                { scope: 'video.list', description: 'Video content information' },
                { scope: 'tcm.order.update', description: 'Campaign order management' },
                { scope: 'tto.campaign.link', description: 'Campaign link generation' }
              ].map((item) => (
                <div key={item.scope} className="p-3 bg-muted/20 rounded-lg border">
                  <div className="font-mono text-sm text-primary mb-1">{item.scope}</div>
                  <div className="text-xs text-muted-foreground">{item.description}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Success Actions */}
        {connectionStatus === 'success' && (
          <Card className="border-green-200 bg-green-50 dark:bg-green-950/20 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-green-800 dark:text-green-200">
                <CheckCircle className="w-5 h-5" />
                <span>Ready to Start</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-green-700 dark:text-green-300 mb-4">
                Your TikTok API is connected successfully. You can now configure your bot and start sending invitations.
              </p>
              <div className="flex space-x-3">
                <Button className="bg-green-600 hover:bg-green-700">
                  Configure Bot Settings
                </Button>
                <Button variant="outline" className="border-green-300 dark:border-green-700">
                  View Dashboard
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}