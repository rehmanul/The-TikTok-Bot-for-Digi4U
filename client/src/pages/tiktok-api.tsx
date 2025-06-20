
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { 
  ExternalLink, 
  Shield, 
  Users, 
  TrendingUp, 
  CheckCircle, 
  AlertCircle, 
  AlertTriangle,
  Settings,
  Zap,
  Globe,
  BarChart3,
  Key,
  RefreshCw,
  Play,
  Pause
} from 'lucide-react';

interface TikTokValidation {
  valid: boolean;
  hasToken?: boolean;
  connected?: boolean;
}

interface TikTokMetrics {
  total_invitations: number;
  successful_invitations: number;
  pending_invitations: number;
  failed_invitations: number;
  total_revenue?: number;
  conversion_rate?: number;
}

interface APIStatus {
  valid: boolean;
  connected: boolean;
  hasToken: boolean;
}

export default function TikTokAPI() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [accessToken, setAccessToken] = useState('');
  const [showManualInput, setShowManualInput] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [sessionRunning, setSessionRunning] = useState(false);

  // Fetch TikTok API validation status
  const { data: validation, isLoading: validationLoading, refetch: refetchValidation } = useQuery<TikTokValidation>({
    queryKey: ['/api/tiktok/validate'],
    refetchInterval: 10000, // Check every 10 seconds
  });

  // Fetch TikTok auth URL
  const { data: authData } = useQuery<{ authUrl: string }>({
    queryKey: ['/api/tiktok/auth-url'],
  });

  // Fetch TikTok metrics
  const { data: metrics, refetch: refetchMetrics } = useQuery<TikTokMetrics>({
    queryKey: ['/api/tiktok/metrics'],
    enabled: validation?.valid,
  });

  // Mutation for connecting with access token
  const connectMutation = useMutation({
    mutationFn: async (token: string) => {
      const response = await fetch('/api/tiktok/set-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ access_token: token.trim() })
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Connection failed');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      if (data.success) {
        toast({
          title: "Connected Successfully",
          description: "TikTok API is now connected and validated",
        });
        setAccessToken('');
        setShowManualInput(false);
        queryClient.invalidateQueries({ queryKey: ['/api/tiktok/validate'] });
        queryClient.invalidateQueries({ queryKey: ['/api/tiktok/metrics'] });
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Connection Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Handle manual token connection
  const handleConnect = () => {
    if (!accessToken.trim()) {
      toast({
        title: "Missing Token",
        description: "Please enter your access token",
        variant: "destructive",
      });
      return;
    }
    connectMutation.mutate(accessToken);
  };

  // Generate auth URL and open in new window
  const handleGenerateAuthUrl = async () => {
    try {
      const response = await fetch('/api/tiktok/auth-url');
      const data = await response.json();
      
      if (response.ok && data.authUrl) {
        window.open(data.authUrl, '_blank', 'width=800,height=600');
        toast({
          title: "Authorization Window Opened",
          description: "Please complete the authorization process and return here",
        });
      } else {
        throw new Error(data.message || 'Failed to generate authorization URL');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to generate authorization URL",
        variant: "destructive",
      });
    }
  };

  // Start API session
  const startAPISession = async () => {
    if (!validation?.valid) {
      toast({
        title: "API Not Connected",
        description: "Please connect to TikTok API first",
        variant: "destructive"
      });
      return;
    }

    try {
      const response = await fetch('/api/bot/start-api', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setSessionRunning(true);
        toast({
          title: "API Session Started",
          description: "Bot is now running using TikTok Official API"
        });
        refetchMetrics();
      } else {
        toast({
          title: "Failed to Start",
          description: data.message || "Failed to start API session",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to start API session",
        variant: "destructive"
      });
    }
  };

  // Stop API session
  const stopAPISession = async () => {
    try {
      const response = await fetch('/api/bot/stop-api', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setSessionRunning(false);
        toast({
          title: "API Session Stopped",
          description: "Bot session has been stopped"
        });
        refetchMetrics();
      } else {
        toast({
          title: "Failed to Stop",
          description: data.message || "Failed to stop API session",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to stop API session",
        variant: "destructive"
      });
    }
  };

  const getStatusColor = (valid: boolean) => {
    return valid ? 'bg-green-500' : 'bg-red-500';
  };

  const getStatusText = (valid: boolean) => {
    return valid ? 'Connected' : 'Not Connected';
  };

  return (
    <div className="flex-1 bg-background">
      {/* Header */}
      <header className="h-20 bg-gradient-to-r from-primary/5 to-pink-50 dark:from-primary/10 dark:to-pink-950/20 border-b border-border/50 flex items-center px-8">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
            <Globe className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-foreground">TikTok Official API</h2>
            <p className="text-sm text-muted-foreground">Connect and manage your TikTok Business API integration</p>
          </div>
        </div>
      </header>

      <main className="p-8 space-y-6">
        {/* Connection Status Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              API Connection Status
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetchValidation()}
                disabled={validationLoading}
                className="ml-auto"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${validationLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${getStatusColor(validation?.valid || false)} animate-pulse`} />
                <span className="font-medium">
                  {getStatusText(validation?.valid || false)}
                </span>
                <Badge variant={validation?.valid ? 'default' : 'destructive'}>
                  {validation?.valid ? 'Active' : 'Inactive'}
                </Badge>
              </div>
            </div>

            {!validation?.valid && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  TikTok API is not connected. You need to provide a valid access token to use the official API features.
                </AlertDescription>
              </Alert>
            )}

            {validation?.valid && (
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  TikTok API is successfully connected and validated. You can now use all official API features.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Connection Setup */}
        {!validation?.valid && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                Connect TikTok API
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* OAuth Flow */}
              <div className="space-y-4">
                <h4 className="font-semibold">Option 1: OAuth Authorization (Recommended)</h4>
                <p className="text-sm text-muted-foreground">
                  Generate an authorization URL and complete the OAuth flow to get your access token automatically.
                </p>
                <Button 
                  onClick={handleGenerateAuthUrl}
                  className="w-full"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Generate Authorization URL
                </Button>
              </div>

              <Separator />

              {/* Manual Token Input */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold">Option 2: Manual Token Entry</h4>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowManualInput(!showManualInput)}
                  >
                    {showManualInput ? 'Hide' : 'Show'} Manual Entry
                  </Button>
                </div>

                {showManualInput && (
                  <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
                    <div className="space-y-2">
                      <Label htmlFor="access-token">Access Token</Label>
                      <Textarea
                        id="access-token"
                        placeholder="Paste your TikTok Business API access token here..."
                        value={accessToken}
                        onChange={(e) => setAccessToken(e.target.value)}
                        rows={3}
                      />
                    </div>
                    <Button
                      onClick={handleConnect}
                      disabled={connectMutation.isPending || !accessToken.trim()}
                      className="w-full"
                    >
                      {connectMutation.isPending ? (
                        <>
                          <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                          Connecting...
                        </>
                      ) : (
                        <>
                          <Shield className="w-4 h-4 mr-2" />
                          Connect & Validate
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </div>

              {/* Help Links */}
              <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg">
                <h5 className="font-medium mb-2">Need Help Getting Your Token?</h5>
                <div className="space-y-2 text-sm">
                  <Button
                    variant="link"
                    size="sm"
                    onClick={() => window.open('https://business-api.tiktok.com/', '_blank')}
                    className="p-0 h-auto"
                  >
                    <ExternalLink className="w-3 h-3 mr-1" />
                    Visit TikTok Business API Portal
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* API Features (shown when connected) */}
        {validation?.valid && (
          <>
            {/* Session Control */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  API Bot Session Control
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">
                      Session Status: {sessionRunning ? 'Running' : 'Stopped'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {sessionRunning 
                        ? 'Bot is actively finding and inviting creators using TikTok API'
                        : 'Click start to begin automated creator invitations'
                      }
                    </p>
                  </div>
                  
                  <div className="flex gap-2">
                    {!sessionRunning ? (
                      <Button
                        onClick={startAPISession}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <Play className="w-4 h-4 mr-2" />
                        Start API Session
                      </Button>
                    ) : (
                      <Button
                        onClick={stopAPISession}
                        variant="destructive"
                      >
                        <Pause className="w-4 h-4 mr-2" />
                        Stop Session
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Metrics */}
            {metrics && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    API Performance Metrics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">{metrics.total_invitations || 0}</div>
                      <div className="text-sm text-muted-foreground">Total Invitations</div>
                    </div>
                    <div className="text-center p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">{metrics.successful_invitations || 0}</div>
                      <div className="text-sm text-muted-foreground">Successful</div>
                    </div>
                    <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg">
                      <div className="text-2xl font-bold text-yellow-600">{metrics.pending_invitations || 0}</div>
                      <div className="text-sm text-muted-foreground">Pending</div>
                    </div>
                    <div className="text-center p-4 bg-red-50 dark:bg-red-950/20 rounded-lg">
                      <div className="text-2xl font-bold text-red-600">{metrics.failed_invitations || 0}</div>
                      <div className="text-sm text-muted-foreground">Failed</div>
                    </div>
                  </div>

                  {metrics.total_invitations > 0 && (
                    <div className="mt-4 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Success Rate</span>
                        <span>{Math.round((metrics.successful_invitations / metrics.total_invitations) * 100)}%</span>
                      </div>
                      <Progress 
                        value={(metrics.successful_invitations / metrics.total_invitations) * 100} 
                        className="h-2"
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* API Features */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Available API Features
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Creator Discovery</h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      Find and filter creators based on follower count, engagement rate, and categories.
                    </p>
                    <Badge variant="outline">Available</Badge>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Automated Invitations</h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      Send collaboration invitations to creators automatically through the API.
                    </p>
                    <Badge variant="outline">Available</Badge>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Performance Analytics</h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      Track invitation success rates and campaign performance metrics.
                    </p>
                    <Badge variant="outline">Available</Badge>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Real-time Monitoring</h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      Monitor bot activities and API responses in real-time.
                    </p>
                    <Badge variant="outline">Available</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </main>
    </div>
  );
}
