import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { 
  Play, 
  Square, 
  Bot, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  Users,
  TrendingUp,
  Zap
} from 'lucide-react';

interface BotStatus {
  isRunning: boolean;
  status: string;
  sessionId: number | null;
  stats?: {
    invitesSent: number;
    successfulInvites: number;
    uptime: string;
  };
}

export default function RealBot() {
  const [credentials, setCredentials] = useState({
    email: '',
    password: ''
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Query bot status
  const { data: botStatus, isLoading: statusLoading } = useQuery<BotStatus>({
    queryKey: ['/api/bot/status-real'],
    refetchInterval: 3000, // Refresh every 3 seconds
  });

  // Start bot mutation
  const startBotMutation = useMutation({
    mutationFn: async (creds: { email: string; password: string }) => {
      const response = await fetch('/api/bot/start-real', {
        method: 'POST',
        body: JSON.stringify(creds),
        headers: { 'Content-Type': 'application/json' }
      });
      return response.json();
    },
    onSuccess: (data: any) => {
      if (data.success) {
        toast({
          title: "Bot Started Successfully!",
          description: "Your TikTok bot is now running and will begin inviting creators automatically.",
        });
        setCredentials({ email: '', password: '' }); // Clear credentials
      } else {
        toast({
          title: "Failed to Start Bot",
          description: data.message || "Please check your TikTok credentials and try again.",
          variant: "destructive"
        });
      }
      queryClient.invalidateQueries({ queryKey: ['/api/bot/status-real'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error Starting Bot",
        description: error.message || "An unexpected error occurred",
        variant: "destructive"
      });
    }
  });

  // Stop bot mutation
  const stopBotMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/bot/stop-real', {
        method: 'POST'
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Bot Stopped",
        description: "Your TikTok bot has been stopped successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/bot/status-real'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error Stopping Bot",
        description: error.message || "An unexpected error occurred",
        variant: "destructive"
      });
    }
  });

  const handleStartBot = () => {
    if (!credentials.email || !credentials.password) {
      toast({
        title: "Missing Credentials",
        description: "Please enter your TikTok email and password",
        variant: "destructive"
      });
      return;
    }
    startBotMutation.mutate(credentials);
  };

  const handleStopBot = () => {
    stopBotMutation.mutate();
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'running':
        return <Badge className="bg-green-500 text-white">Running</Badge>;
      case 'stopped':
        return <Badge variant="secondary">Stopped</Badge>;
      case 'error':
        return <Badge variant="destructive">Error</Badge>;
      default:
        return <Badge variant="outline">Idle</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'error':
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  // Safe access to bot status with fallbacks
  const status = botStatus?.status || 'idle';
  const isRunning = botStatus?.isRunning || false;
  const sessionId = botStatus?.sessionId || null;
  const stats = botStatus?.stats;

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-pink-50 to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border-b border-red-200 dark:border-gray-700 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Bot className="h-8 w-8 text-red-500 mr-3" />
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">Real TikTok Bot</h1>
                <p className="text-sm text-gray-600 dark:text-gray-300">Automated creator invitation system</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        
        {/* Bot Status Card */}
        <Card className="tiktok-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {getStatusIcon(botStatus?.status || 'idle')}
              Bot Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <span className="font-medium text-lg">
                  {isRunning ? 'Active & Running' : 'Stopped'}
                </span>
                {getStatusBadge(status)}
              </div>
              <div className="text-sm text-gray-500">
                Session ID: {sessionId || 'None'}
              </div>
            </div>

            {stats && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                <div className="text-center p-4 bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 rounded-lg">
                  <div className="text-2xl font-bold text-red-600">{stats.invitesSent}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">Invites Sent</div>
                </div>
                <div className="text-center p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{stats.successfulInvites}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">Successful</div>
                </div>
                <div className="text-center p-4 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{stats.uptime}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">Uptime</div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Bot Controls */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Start Bot Card */}
          {!isRunning && (
            <Card className="tiktok-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Play className="h-5 w-5 text-green-500" />
                  Start Real Bot
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert>
                  <Zap className="h-4 w-4" />
                  <AlertDescription>
                    This is a real automation bot that will log into your TikTok account and automatically invite creators. 
                    It uses browser automation to perform actual actions on TikTok.
                  </AlertDescription>
                </Alert>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="email">TikTok Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="your.email@example.com"
                      value={credentials.email}
                      onChange={(e) => setCredentials(prev => ({ ...prev, email: e.target.value }))}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="password">TikTok Password</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Your TikTok password"
                      value={credentials.password}
                      onChange={(e) => setCredentials(prev => ({ ...prev, password: e.target.value }))}
                    />
                  </div>

                  <Button
                    onClick={handleStartBot}
                    disabled={startBotMutation.isPending}
                    className="w-full tiktok-button"
                  >
                    {startBotMutation.isPending ? (
                      'Starting Bot...'
                    ) : (
                      <>
                        <Play className="w-4 h-4 mr-2" />
                        Start Real TikTok Bot
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Stop Bot Card */}
          {isRunning && (
            <Card className="tiktok-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Square className="h-5 w-5 text-red-500" />
                  Stop Bot
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    The bot is currently running and actively inviting creators. Click below to stop it.
                  </AlertDescription>
                </Alert>

                <Button
                  onClick={handleStopBot}
                  disabled={stopBotMutation.isPending}
                  variant="destructive"
                  className="w-full"
                >
                  {stopBotMutation.isPending ? (
                    'Stopping Bot...'
                  ) : (
                    <>
                      <Square className="w-4 h-4 mr-2" />
                      Stop Real TikTok Bot
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Bot Features Card */}
          <Card className="tiktok-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Bot Features
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span>Automated TikTok login</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span>Creator discovery & filtering</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span>Automated invitation sending</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span>Human-like behavior simulation</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span>Real-time activity logging</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span>Smart delay management</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Warning */}
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Important:</strong> This bot performs real actions on your TikTok account. 
            Make sure you have proper authorization to use automation tools with your TikTok business account. 
            Use responsibly and in compliance with TikTok's terms of service.
          </AlertDescription>
        </Alert>

      </main>
    </div>
  );
}