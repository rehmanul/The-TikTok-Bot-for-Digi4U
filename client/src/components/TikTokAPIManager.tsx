import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, XCircle, ExternalLink, Activity, TrendingUp } from 'lucide-react';

interface APIStatus {
  valid: boolean;
  connected: boolean;
  hasToken: boolean;
}

interface InvitationMetrics {
  total: number;
  successful: number;
  pending: number;
  failed: number;
}

export function TikTokAPIManager() {
  const [apiStatus, setApiStatus] = useState<APIStatus>({ valid: false, connected: false, hasToken: false });
  const [isValidating, setIsValidating] = useState(false);
  const [authUrl, setAuthUrl] = useState<string>('');
  const [metrics, setMetrics] = useState<InvitationMetrics | null>(null);
  const [isStarting, setIsStarting] = useState(false);
  const [sessionRunning, setSessionRunning] = useState(false);
  const { toast } = useToast();

  // Check API status on component mount
  useEffect(() => {
    validateConnection();
    fetchMetrics();
  }, []);

  const validateConnection = async () => {
    setIsValidating(true);
    try {
      const response = await fetch('/api/tiktok/validate');
      const data = await response.json();
      
      if (response.ok) {
        setApiStatus({
          valid: data.valid,
          connected: data.valid,
          hasToken: data.valid
        });
      } else {
        setApiStatus({ valid: false, connected: false, hasToken: false });
      }
    } catch (error) {
      console.error('Validation error:', error);
      setApiStatus({ valid: false, connected: false, hasToken: false });
    } finally {
      setIsValidating(false);
    }
  };

  const generateAuthUrl = async () => {
    try {
      const response = await fetch('/api/tiktok/auth-url');
      const data = await response.json();
      
      if (response.ok) {
        setAuthUrl(data.authUrl);
        window.open(data.authUrl, '_blank');
        toast({
          title: "Authorization URL Generated",
          description: "Please complete authorization in the new window, then return here to validate."
        });
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to generate authorization URL",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate authorization URL",
        variant: "destructive"
      });
    }
  };

  const fetchMetrics = async () => {
    try {
      const response = await fetch('/api/tiktok/metrics');
      if (response.ok) {
        const data = await response.json();
        if (data && typeof data === 'object') {
          setMetrics({
            total: data.total_invitations || 0,
            successful: data.successful_invitations || 0,
            pending: data.pending_invitations || 0,
            failed: data.failed_invitations || 0
          });
        }
      }
    } catch (error) {
      console.error('Failed to fetch metrics:', error);
    }
  };

  const startAPISession = async () => {
    if (!apiStatus.valid) {
      toast({
        title: "API Not Connected",
        description: "Please connect to TikTok API first",
        variant: "destructive"
      });
      return;
    }

    setIsStarting(true);
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
    } finally {
      setIsStarting(false);
    }
  };

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
        fetchMetrics(); // Refresh metrics after stopping
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

  return (
    <div className="space-y-6">
      {/* API Connection Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            TikTok Official API Connection
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {apiStatus.connected ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <XCircle className="h-5 w-5 text-red-500" />
              )}
              <span className="font-medium">
                {apiStatus.connected ? 'Connected' : 'Not Connected'}
              </span>
              <Badge variant={apiStatus.connected ? 'default' : 'destructive'}>
                {apiStatus.connected ? 'Active' : 'Inactive'}
              </Badge>
            </div>
            
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={validateConnection}
                disabled={isValidating}
              >
                {isValidating ? 'Validating...' : 'Refresh Status'}
              </Button>
              
              {!apiStatus.connected && (
                <Button
                  onClick={generateAuthUrl}
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <ExternalLink className="h-4 w-4" />
                  Connect API
                </Button>
              )}
            </div>
          </div>

          {!apiStatus.connected && (
            <Alert>
              <AlertDescription>
                To use the TikTok Official API, click "Connect API" to authorize this application. 
                You'll be redirected to TikTok's authorization page.
              </AlertDescription>
            </Alert>
          )}

          {apiStatus.connected && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                TikTok API is connected and ready. You can now use official API endpoints 
                for creator discovery and invitation management.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* API Session Control */}
      {apiStatus.connected && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
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
                    disabled={isStarting}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {isStarting ? 'Starting...' : 'Start API Session'}
                  </Button>
                ) : (
                  <Button
                    onClick={stopAPISession}
                    variant="destructive"
                  >
                    Stop Session
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* API Metrics */}
      {metrics && apiStatus.connected && (
        <Card>
          <CardHeader>
            <CardTitle>API Performance Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{metrics.total}</div>
                <div className="text-sm text-muted-foreground">Total Invitations</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{metrics.successful}</div>
                <div className="text-sm text-muted-foreground">Successful</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">{metrics.pending}</div>
                <div className="text-sm text-muted-foreground">Pending</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{metrics.failed}</div>
                <div className="text-sm text-muted-foreground">Failed</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}