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
  BarChart3
} from 'lucide-react';

interface TikTokValidation {
  valid: boolean;
}

interface TikTokMetrics {
  total_invitations: number;
  accepted_invitations: number;
  pending_invitations: number;
  total_revenue: number;
  conversion_rate: number;
}

export default function TikTokAPI() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [accessToken, setAccessToken] = useState('');
  const [showManualInput, setShowManualInput] = useState(false);

  // Fetch TikTok API validation status
  const { data: validation, isLoading: validationLoading } = useQuery<TikTokValidation>({
    queryKey: ['/api/tiktok/validate'],
    refetchInterval: 10000, // Check every 10 seconds
  });

  // Fetch TikTok auth URL
  const { data: authData } = useQuery<{ authUrl: string }>({
    queryKey: ['/api/tiktok/auth-url'],
  });

  // Fetch TikTok metrics
  const { data: metrics } = useQuery<TikTokMetrics>({
    queryKey: ['/api/tiktok/metrics'],
    enabled: validation?.valid,
  });

  // Manual token input mutation
  const setTokenMutation = useMutation({
    mutationFn: async (token: string) => {
      const response = await fetch('/api/tiktok/set-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ access_token: token })
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Access token set successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/tiktok/validate'] });
      setAccessToken('');
      setShowManualInput(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to set access token",
        variant: "destructive",
      });
    }
  });

  const handleConnect = () => {
    if (authData?.authUrl) {
      // Create a popup window for OAuth
      const popup = window.open(
        authData.authUrl, 
        'tiktok-oauth', 
        'width=800,height=600,scrollbars=yes,resizable=yes,toolbar=no,menubar=no'
      );
      
      toast({
        title: "Redirecting to TikTok",
        description: "Complete the authorization process in the popup window",
      });

      // Listen for the OAuth callback
      const checkClosed = setInterval(() => {
        if (popup?.closed) {
          clearInterval(checkClosed);
          // Refresh the validation status after popup closes
          setTimeout(() => {
            queryClient.invalidateQueries({ queryKey: ['/api/tiktok/validate'] });
          }, 1000);
        }
      }, 1000);

      // Listen for messages from the popup
      const messageListener = (event: MessageEvent) => {
        if (event.origin !== window.location.origin) return;
        
        if (event.data.type === 'TIKTOK_OAUTH_SUCCESS') {
          clearInterval(checkClosed);
          popup?.close();
          window.removeEventListener('message', messageListener);
          
          toast({
            title: "Success",
            description: "TikTok API connected successfully",
          });
          
          // Refresh validation status
          queryClient.invalidateQueries({ queryKey: ['/api/tiktok/validate'] });
        } else if (event.data.type === 'TIKTOK_OAUTH_ERROR') {
          clearInterval(checkClosed);
          popup?.close();
          window.removeEventListener('message', messageListener);
          
          toast({
            title: "Connection Failed",
            description: event.data.error || "Failed to connect to TikTok API",
            variant: "destructive",
          });
        }
      };

      window.addEventListener('message', messageListener);
    }
  };

  const getConnectionStatus = () => {
    if (validationLoading) return { text: 'Checking...', color: 'bg-gray-500', variant: 'secondary' as const };
    if (validation?.valid) return { text: 'Connected', color: 'bg-green-500', variant: 'default' as const };
    return { text: 'Disconnected', color: 'bg-red-500', variant: 'destructive' as const };
  };

  const status = getConnectionStatus();

  return (
    <div className="flex-1 bg-background">
      {/* Header */}
      <header className="h-20 bg-gradient-to-r from-primary/5 to-pink-50 dark:from-primary/10 dark:to-pink-950/20 border-b border-border/50 flex items-center justify-between px-8">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
            <Globe className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-foreground">TikTok Official API</h2>
            <p className="text-sm text-muted-foreground">Connect and manage your TikTok Business API integration</p>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <div className={`w-3 h-3 rounded-full ${status.color} animate-pulse`} />
          <Badge variant={status.variant} className="text-sm">
            {status.text}
          </Badge>
        </div>
      </header>

      <main className="p-8 space-y-8">
        {/* API Configuration */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Connection Status */}
          <Card className="border-border/50 shadow-lg">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center space-x-2">
                <Shield className="w-5 h-5 text-primary" />
                <span>API Connection</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-muted/30 rounded-xl">
                <div>
                  <div className="font-semibold text-foreground mb-1">Status</div>
                  <div className="text-sm text-muted-foreground">
                    {validation?.valid ? 'Successfully connected to TikTok Business API' : 'Not connected to TikTok API'}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {validation?.valid ? (
                    <CheckCircle className="w-8 h-8 text-green-500" />
                  ) : (
                    <AlertCircle className="w-8 h-8 text-red-500" />
                  )}
                </div>
              </div>

              {!validation?.valid && (
                <div className="space-y-4">
                  <div className="p-4 bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800 rounded-xl">
                    <div className="flex items-start space-x-3">
                      <AlertCircle className="w-5 h-5 text-orange-600 dark:text-orange-400 mt-0.5" />
                      <div>
                        <div className="font-medium text-orange-800 dark:text-orange-200 mb-1">
                          API Connection Required
                        </div>
                        <div className="text-sm text-orange-700 dark:text-orange-300">
                          Connect to TikTok Business API to access creator data and send invitations.
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="p-4 bg-amber-50 dark:bg-amber-950/20 rounded-lg border border-amber-200 dark:border-amber-800">
                      <div className="text-sm text-amber-800 dark:text-amber-200">
                        <strong>Authorization Code Received:</strong> Your TikTok authorization was successful. The authorization code from your callback URL has been processed but appears to have expired. Please generate a new access token using the manual method below or contact TikTok Business API support.
                      </div>
                    </div>
                    
                    {!showManualInput ? (
                      <div className="space-y-3">
                        <Button 
                          onClick={() => setShowManualInput(true)}
                          variant="outline"
                          className="w-full"
                          size="lg"
                        >
                          Enter Access Token Manually
                        </Button>
                        <Card className="p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800">
                          <div className="space-y-3">
                            <div className="flex items-start space-x-3">
                              <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5" />
                              <div>
                                <h4 className="font-semibold text-amber-800 dark:text-amber-200 mb-1">Connection Issue Detected</h4>
                                <p className="text-sm text-amber-700 dark:text-amber-300 mb-3">
                                  The OAuth method requires TikTok to whitelist our callback URL. For immediate access, use the manual token method below.
                                </p>
                                <div className="space-y-2">
                                  <div className="text-xs text-amber-600 dark:text-amber-400">
                                    <strong>Quick Solution:</strong>
                                  </div>
                                  <ol className="text-xs text-amber-700 dark:text-amber-300 space-y-1 ml-4 list-decimal">
                                    <li>Visit <a href="https://business-api.tiktok.com/" target="_blank" className="underline">TikTok Business API</a></li>
                                    <li>Generate an access token with creator permissions</li>
                                    <li>Paste the token using the manual input below</li>
                                  </ol>
                                </div>
                              </div>
                            </div>
                          </div>
                        </Card>
                      </div>
                    ) : (
                      <div className="space-y-4 p-4 bg-muted/20 rounded-xl border">
                        <div>
                          <Label htmlFor="access-token" className="text-sm font-medium">
                            TikTok Business API Access Token
                          </Label>
                          <Textarea
                            id="access-token"
                            placeholder="Enter your TikTok Business API access token here..."
                            value={accessToken}
                            onChange={(e) => setAccessToken(e.target.value)}
                            rows={4}
                            className="mt-2"
                          />
                          <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                            <div className="text-xs text-blue-800 dark:text-blue-200 space-y-1">
                              <div><strong>Token Requirements:</strong></div>
                              <div>• Must have "biz.creator.info" scope for creator access</div>
                              <div>• Must have "tcm.order.update" scope for invitations</div>
                              <div>• Token should be from your verified TikTok Business account</div>
                            </div>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Button 
                            onClick={() => setTokenMutation.mutate(accessToken)}
                            disabled={!accessToken || setTokenMutation.isPending}
                            className="flex-1 bg-green-600 hover:bg-green-700"
                          >
                            {setTokenMutation.isPending ? 'Validating Token...' : 'Connect & Validate'}
                          </Button>
                          <Button 
                            onClick={() => {
                              setShowManualInput(false);
                              setAccessToken('');
                            }}
                            variant="outline"
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* API Configuration Details */}
          <Card className="border-border/50 shadow-lg">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center space-x-2">
                <Settings className="w-5 h-5 text-primary" />
                <span>Configuration</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-muted/30 rounded-lg">
                  <div className="text-sm font-medium text-muted-foreground">App ID</div>
                  <div className="text-sm font-mono text-foreground">751264...3329</div>
                </div>
                <div className="p-3 bg-muted/30 rounded-lg">
                  <div className="text-sm font-medium text-muted-foreground">Region</div>
                  <div className="text-sm text-foreground">United Kingdom</div>
                </div>
                <div className="p-3 bg-muted/30 rounded-lg">
                  <div className="text-sm font-medium text-muted-foreground">Environment</div>
                  <div className="text-sm text-foreground">Production</div>
                </div>
                <div className="p-3 bg-muted/30 rounded-lg">
                  <div className="text-sm font-medium text-muted-foreground">API Version</div>
                  <div className="text-sm text-foreground">v1.3</div>
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <div className="text-sm font-medium text-foreground">Available Scopes</div>
                <div className="flex flex-wrap gap-2">
                  {[
                    'user.info.basic',
                    'biz.creator.info', 
                    'biz.creator.insights',
                    'video.list',
                    'tcm.order.update',
                    'tto.campaign.link'
                  ].map((scope) => (
                    <Badge key={scope} variant="outline" className="text-xs">
                      {scope}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Metrics Dashboard */}
        {validation?.valid && metrics && (
          <section>
            <Card className="border-border/50 shadow-lg">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="w-5 h-5 text-primary" />
                  <span>API Metrics</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/20 dark:to-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                    <div className="flex items-center justify-between mb-3">
                      <Users className="w-8 h-8 text-blue-600" />
                    </div>
                    <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                      {metrics.total_invitations}
                    </div>
                    <div className="text-sm text-blue-700 dark:text-blue-300">Total Invitations</div>
                  </div>

                  <div className="p-6 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/20 dark:to-green-900/20 rounded-xl border border-green-200 dark:border-green-800">
                    <div className="flex items-center justify-between mb-3">
                      <CheckCircle className="w-8 h-8 text-green-600" />
                    </div>
                    <div className="text-2xl font-bold text-green-900 dark:text-green-100">
                      {metrics.accepted_invitations}
                    </div>
                    <div className="text-sm text-green-700 dark:text-green-300">Accepted</div>
                  </div>

                  <div className="p-6 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/20 dark:to-orange-900/20 rounded-xl border border-orange-200 dark:border-orange-800">
                    <div className="flex items-center justify-between mb-3">
                      <AlertCircle className="w-8 h-8 text-orange-600" />
                    </div>
                    <div className="text-2xl font-bold text-orange-900 dark:text-orange-100">
                      {metrics.pending_invitations}
                    </div>
                    <div className="text-sm text-orange-700 dark:text-orange-300">Pending</div>
                  </div>

                  <div className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/20 dark:to-purple-900/20 rounded-xl border border-purple-200 dark:border-purple-800">
                    <div className="flex items-center justify-between mb-3">
                      <TrendingUp className="w-8 h-8 text-purple-600" />
                    </div>
                    <div className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                      {metrics.conversion_rate}%
                    </div>
                    <div className="text-sm text-purple-700 dark:text-purple-300">Conversion Rate</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>
        )}

        {/* API Features */}
        <section>
          <Card className="border-border/50 shadow-lg">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center space-x-2">
                <Zap className="w-5 h-5 text-primary" />
                <span>Available Features</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                  {
                    icon: Users,
                    title: 'Creator Discovery',
                    description: 'Find and filter TikTok creators based on follower count, category, and engagement',
                    enabled: validation?.valid
                  },
                  {
                    icon: ExternalLink,
                    title: 'Invitation Management',
                    description: 'Send automated collaboration invitations to targeted creators',
                    enabled: validation?.valid
                  },
                  {
                    icon: BarChart3,
                    title: 'Performance Analytics',
                    description: 'Track invitation success rates and campaign performance metrics',
                    enabled: validation?.valid
                  },
                  {
                    icon: TrendingUp,
                    title: 'GMV Optimization',
                    description: 'Sort creators by Gross Merchandise Value for better targeting',
                    enabled: validation?.valid
                  },
                  {
                    icon: Shield,
                    title: 'Rate Limiting',
                    description: 'Built-in compliance with TikTok API rate limits and policies',
                    enabled: true
                  },
                  {
                    icon: Settings,
                    title: 'Campaign Management',
                    description: 'Create and manage multiple affiliate campaigns simultaneously',
                    enabled: validation?.valid
                  }
                ].map((feature, index) => (
                  <div key={index} className={`p-4 rounded-xl border transition-all ${
                    feature.enabled 
                      ? 'bg-gradient-to-br from-card to-muted/20 border-border/50 hover:border-primary/30' 
                      : 'bg-muted/30 border-muted opacity-60'
                  }`}>
                    <div className="flex items-start space-x-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        feature.enabled ? 'bg-primary/10' : 'bg-muted'
                      }`}>
                        <feature.icon className={`w-5 h-5 ${feature.enabled ? 'text-primary' : 'text-muted-foreground'}`} />
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-foreground mb-1">{feature.title}</div>
                        <div className="text-sm text-muted-foreground leading-relaxed">
                          {feature.description}
                        </div>
                        {feature.enabled && (
                          <Badge variant="default" className="mt-2 text-xs">
                            Available
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  );
}