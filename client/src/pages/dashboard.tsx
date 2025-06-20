import { Link } from 'wouter';
import { MetricsCards } from '@/components/metrics-cards';
import { BotControl } from '@/components/bot-control';
import { ActivityFeed } from '@/components/activity-feed';
import { AnalyticsChart } from '@/components/analytics-chart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { HelpTooltip } from '@/components/ui/tooltip-help';
import { FeatureCallout } from '@/components/ui/feature-callout';
import { StaggerContainer, StaggerItem, FloatingElement, PulseElement } from '@/components/ui/page-transition';
import { useEmergencyStop } from '@/hooks/use-bot-status';
import { useToast } from '@/hooks/use-toast';
import { AlertTriangle, Users, Activity, BarChart3 } from 'lucide-react';

export default function Dashboard() {
  const { toast } = useToast();
  const emergencyStop = useEmergencyStop();

  const handleEmergencyStop = async () => {
    if (confirm('Are you sure you want to emergency stop the bot? This will immediately terminate all operations.')) {
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
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-background">
      {/* Header */}
      <header className="h-16 lg:h-20 bg-gradient-to-r from-primary/5 to-pink-50 dark:from-primary/10 dark:to-pink-950/20 border-b border-border/50 flex items-center justify-between px-4 lg:px-8">
        <div className="flex items-center space-x-3 lg:space-x-4">
          <div className="w-10 h-10 lg:w-12 lg:h-12 bg-primary/10 rounded-xl flex items-center justify-center">
            <BarChart3 className="w-5 h-5 lg:w-6 lg:h-6 text-primary" />
          </div>
          <div className="hidden sm:block">
            <h2 className="text-lg lg:text-2xl font-bold text-foreground">TikTok Affiliate Bot</h2>
            <p className="text-xs lg:text-sm text-muted-foreground">Monitor and control your automation</p>
          </div>
        </div>
        <div className="flex items-center space-x-2 lg:space-x-4">
          <PulseElement>
            <Badge variant="outline" className="text-xs bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800 hidden sm:flex">
              <Activity className="w-3 h-3 mr-1 text-green-600 dark:text-green-400" />
              System Online
            </Badge>
          </PulseElement>
          <div className="flex items-center space-x-2">
            <HelpTooltip 
              content="Immediately stops all bot operations and terminates any running sessions. Use this if you need to halt the bot urgently."
              variant="default"
              side="bottom"
            >
              <Button
                variant="destructive"
                size="sm"
                onClick={handleEmergencyStop}
                disabled={emergencyStop.isPending}
                className="text-xs lg:text-sm"
              >
                <AlertTriangle className="w-4 h-4 mr-1 lg:mr-2" />
                <span className="hidden sm:inline">{emergencyStop.isPending ? 'Stopping...' : 'Emergency Stop'}</span>
                <span className="sm:hidden">Stop</span>
              </Button>
            </HelpTooltip>
          </div>
        </div>
      </header>

      {/* Dashboard Content */}
      <main className="flex-1 p-4 lg:p-8 overflow-auto">
        <StaggerContainer className="space-y-4 lg:space-y-8">
          {/* Welcome Feature Callout */}
          <StaggerItem>
            <FeatureCallout
              title="Welcome to TikTok Affiliate Bot"
              description="Your automated system is ready to find and invite TikTok creators to your affiliate program. Start by configuring your bot settings."
              variant="info"
            >
              <div className="flex space-x-2">
                <Link href="/settings">
                  <Button size="sm" variant="outline" className="hover:scale-105 transition-transform duration-200">
                    Configure Bot
                  </Button>
                </Link>
                <Link href="/guide">
                  <Button size="sm" variant="ghost" className="hover:scale-105 transition-transform duration-200">
                    View Guide
                  </Button>
                </Link>
              </div>
            </FeatureCallout>
          </StaggerItem>

          {/* Metrics Cards */}
          <StaggerItem>
            <section>
              <MetricsCards />
            </section>
          </StaggerItem>

          {/* Bot Control */}
          <StaggerItem>
            <section>
              <BotControl />
            </section>
          </StaggerItem>

          {/* Analytics and Activity */}
          <StaggerItem>
            <section className="grid grid-cols-1 xl:grid-cols-2 gap-8">
              {/* Analytics Chart */}
              <div className="space-y-6">
                <AnalyticsChart />
              </div>

              {/* Activity Feed */}
              <div className="space-y-6">
                <ActivityFeed />
              </div>
            </section>
          </StaggerItem>

          {/* Quick Actions */}
          <StaggerItem>
            <section>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <FloatingElement delay={0}>
                      <Activity className="w-4 h-4 lg:w-5 lg:h-5" />
                    </FloatingElement>
                    <span className="text-sm lg:text-base">Quick Actions</span>
                    <HelpTooltip 
                      content="Quick navigation to key sections of your TikTok bot dashboard. Access creators, analytics, and activity logs with one click."
                      variant="tip"
                      side="right"
                    />
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <HelpTooltip 
                      content="Manage your TikTok creator database. View stats, track invitation status, and discover new creators to invite."
                      side="top"
                    >
                      <Link href="/creators" className="w-full">
                        <Button variant="outline" className="h-16 lg:h-20 flex flex-col space-y-2 w-full hover:scale-105 hover:shadow-lg transition-all duration-300">
                          <FloatingElement delay={0.2}>
                            <Users className="w-5 h-5 lg:w-6 lg:h-6" />
                          </FloatingElement>
                          <span className="text-xs lg:text-sm">View Creators</span>
                        </Button>
                      </Link>
                    </HelpTooltip>
                    
                    <HelpTooltip 
                      content="View detailed analytics and performance metrics. Track invitation success rates, creator engagement, and revenue estimates."
                      side="top"
                    >
                      <Link href="/analytics" className="w-full">
                        <Button variant="outline" className="h-16 lg:h-20 flex flex-col space-y-2 w-full hover:scale-105 hover:shadow-lg transition-all duration-300">
                          <FloatingElement delay={0.4}>
                            <BarChart3 className="w-5 h-5 lg:w-6 lg:h-6" />
                          </FloatingElement>
                          <span className="text-xs lg:text-sm">Analytics</span>
                        </Button>
                      </Link>
                    </HelpTooltip>
                    
                    <HelpTooltip 
                      content="Monitor all bot activities and system events. View detailed logs of invitations, errors, and system status changes."
                      side="top"
                    >
                      <Link href="/logs" className="w-full">
                        <Button variant="outline" className="h-16 lg:h-20 flex flex-col space-y-2 w-full hover:scale-105 hover:shadow-lg transition-all duration-300">
                          <FloatingElement delay={0.6}>
                            <Activity className="w-5 h-5 lg:w-6 lg:h-6" />
                          </FloatingElement>
                          <span className="text-xs lg:text-sm">Activity Logs</span>
                        </Button>
                      </Link>
                    </HelpTooltip>
                  </div>
                </CardContent>
              </Card>
            </section>
          </StaggerItem>
        </StaggerContainer>
      </main>
    </div>
  );
}
