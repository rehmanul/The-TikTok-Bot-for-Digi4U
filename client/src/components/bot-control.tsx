import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useBotStatus, useStartBot, usePauseBot, useResumeBot, useStopBot, useEmergencyStop } from '@/hooks/use-bot-status';
import { useDashboardMetrics } from '@/hooks/use-metrics';
import { useToast } from '@/hooks/use-toast';
import { Play, Pause, Square, AlertTriangle, Loader2 } from 'lucide-react';

export function BotControl() {
  const { toast } = useToast();
  const { data: botStatus } = useBotStatus();
  const { data: metrics } = useDashboardMetrics();
  
  const startBot = useStartBot();
  const pauseBot = usePauseBot();
  const resumeBot = useResumeBot();
  const stopBot = useStopBot();
  const emergencyStop = useEmergencyStop();

  const handleStartBot = async () => {
    try {
      await startBot.mutateAsync();
      toast({
        title: "Success",
        description: "Bot started successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to start bot",
        variant: "destructive",
      });
    }
  };

  const handlePauseBot = async () => {
    try {
      await pauseBot.mutateAsync();
      toast({
        title: "Success",
        description: "Bot paused successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to pause bot",
        variant: "destructive",
      });
    }
  };

  const handleResumeBot = async () => {
    try {
      await resumeBot.mutateAsync();
      toast({
        title: "Success",
        description: "Bot resumed successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to resume bot",
        variant: "destructive",
      });
    }
  };

  const handleStopBot = async () => {
    try {
      await stopBot.mutateAsync();
      toast({
        title: "Success",
        description: "Bot stopped successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to stop bot",
        variant: "destructive",
      });
    }
  };

  const handleEmergencyStop = async () => {
    try {
      await emergencyStop.mutateAsync();
      toast({
        title: "Emergency Stop",
        description: "Bot emergency stopped successfully",
        variant: "destructive",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to emergency stop bot",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'bg-green-500';
      case 'paused': return 'bg-tiktok-secondary';
      case 'stopped': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'running': return 'Running';
      case 'paused': return 'Paused';
      case 'stopped': return 'Stopped';
      default: return 'Idle';
    }
  };

  const dailyProgress = metrics?.dailyProgress ? 
    (metrics.dailyProgress.current / metrics.dailyProgress.target) * 100 : 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Bot Control Panel */}
      <div className="lg:col-span-2">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl">Bot Control Panel</CardTitle>
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${getStatusColor(botStatus?.status || 'idle')} animate-pulse`} />
                <Badge variant={botStatus?.status === 'running' ? 'default' : 'secondary'}>
                  {getStatusText(botStatus?.status || 'idle')}
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Progress Indicators */}
            {metrics?.dailyProgress && (
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-muted-foreground">Daily Progress</span>
                    <span className="font-medium">
                      {metrics.dailyProgress.current} / {metrics.dailyProgress.target}
                    </span>
                  </div>
                  <Progress value={dailyProgress} className="h-2" />
                </div>

                {botStatus?.currentSession && (
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-muted-foreground">Session Progress</span>
                      <span className="font-medium">
                        {botStatus.currentSession.invitesSent || 0} invites sent
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Success Rate: {botStatus.currentSession.successfulInvites || 0} / {botStatus.currentSession.invitesSent || 0}
                      {botStatus.currentSession.invitesSent > 0 && 
                        ` (${Math.round(((botStatus.currentSession.successfulInvites || 0) / botStatus.currentSession.invitesSent) * 100)}%)`
                      }
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Control Buttons */}
            <div className="grid grid-cols-2 gap-4">
              {botStatus?.status === 'running' ? (
                <>
                  <Button
                    onClick={handlePauseBot}
                    disabled={pauseBot.isPending}
                    variant="outline"
                    size="lg"
                    className="h-12"
                  >
                    {pauseBot.isPending ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Pause className="w-4 h-4 mr-2" />
                    )}
                    Pause Bot
                  </Button>
                  <Button
                    onClick={handleStopBot}
                    disabled={stopBot.isPending}
                    variant="destructive"
                    size="lg"
                    className="h-12"
                  >
                    {stopBot.isPending ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Square className="w-4 h-4 mr-2" />
                    )}
                    Stop Bot
                  </Button>
                </>
              ) : botStatus?.status === 'paused' ? (
                <>
                  <Button
                    onClick={handleResumeBot}
                    disabled={resumeBot.isPending}
                    size="lg"
                    className="h-12 bg-gradient-to-r from-tiktok-primary to-tiktok-secondary hover:opacity-90"
                  >
                    {resumeBot.isPending ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Play className="w-4 h-4 mr-2" />
                    )}
                    Resume Bot
                  </Button>
                  <Button
                    onClick={handleStopBot}
                    disabled={stopBot.isPending}
                    variant="destructive"
                    size="lg"
                    className="h-12"
                  >
                    {stopBot.isPending ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Square className="w-4 h-4 mr-2" />
                    )}
                    Stop Bot
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    onClick={handleStartBot}
                    disabled={startBot.isPending}
                    size="lg"
                    className="h-12 bg-gradient-to-r from-tiktok-primary to-tiktok-secondary hover:opacity-90 col-span-2"
                  >
                    {startBot.isPending ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Play className="w-4 h-4 mr-2" />
                    )}
                    Start Bot
                  </Button>
                </>
              )}
            </div>

            {/* Emergency Stop */}
            <div className="pt-4 border-t border-border">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="destructive"
                    size="sm"
                    className="w-full"
                    disabled={botStatus?.status === 'idle' || botStatus?.status === 'stopped'}
                  >
                    <AlertTriangle className="w-4 h-4 mr-2" />
                    Emergency Stop
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Emergency Stop</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will immediately stop the bot and close all browser sessions. 
                      Any current operations will be terminated. Are you sure you want to continue?
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleEmergencyStop}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      Emergency Stop
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Session Info */}
      <div>
        <Card>
          <CardHeader>
            <CardTitle>Session Info</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {botStatus?.currentSession ? (
              <>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Started</span>
                  <span className="text-sm font-medium">
                    {botStatus.currentSession.startTime ? 
                      new Date(botStatus.currentSession.startTime).toLocaleTimeString() : 
                      'N/A'
                    }
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Duration</span>
                  <span className="text-sm font-medium">
                    {botStatus.metrics.uptime}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Invites Sent</span>
                  <span className="text-sm font-medium text-green-600">
                    {botStatus.currentSession.invitesSent || 0}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Success Rate</span>
                  <span className="text-sm font-medium text-green-600">
                    {botStatus.currentSession.invitesSent > 0 ?
                      Math.round(((botStatus.currentSession.successfulInvites || 0) / botStatus.currentSession.invitesSent) * 100) :
                      0
                    }%
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Errors</span>
                  <span className="text-sm font-medium text-red-600">
                    {botStatus.currentSession.errorCount || 0}
                  </span>
                </div>
              </>
            ) : (
              <div className="text-center text-muted-foreground py-8">
                <Play className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No active session</p>
                <p className="text-xs">Start the bot to begin tracking</p>
              </div>
            )}

            {/* System Status */}
            <div className="pt-4 border-t border-border space-y-2">
              <h4 className="text-sm font-semibold">System Status</h4>
              
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">TikTok Session</span>
                <Badge variant={botStatus?.session?.puppeteer?.isLoggedIn ? 'default' : 'secondary'} className="text-xs">
                  {botStatus?.session?.puppeteer?.isLoggedIn ? 'Active' : 'Inactive'}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Browser</span>
                <Badge variant={botStatus?.session?.puppeteer?.isInitialized ? 'default' : 'secondary'} className="text-xs">
                  {botStatus?.session?.puppeteer?.isInitialized ? 'Ready' : 'Not Ready'}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Bot Engine</span>
                <Badge variant={botStatus?.session?.isRunning ? 'default' : 'secondary'} className="text-xs">
                  {botStatus?.session?.isRunning ? 'Running' : 'Idle'}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
