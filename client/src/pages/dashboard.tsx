import { Link } from 'wouter';
import { MetricsCards } from '@/components/metrics-cards';
import { BotControl } from '@/components/bot-control';
import { ActivityFeed } from '@/components/activity-feed';
import { AnalyticsChart } from '@/components/analytics-chart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
    <div className="flex-1 flex flex-col">
      {/* Header */}
      <header className="h-16 bg-card border-b border-border flex items-center justify-between px-6">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Dashboard</h2>
          <p className="text-sm text-muted-foreground">Monitor your TikTok affiliate automation</p>
        </div>
        <div className="flex items-center space-x-4">
          <Badge variant="outline" className="text-xs">
            <Activity className="w-3 h-3 mr-1" />
            Live Updates
          </Badge>
          <Button
            variant="destructive"
            size="sm"
            onClick={handleEmergencyStop}
            disabled={emergencyStop.isPending}
          >
            <AlertTriangle className="w-4 h-4 mr-2" />
            Emergency Stop
          </Button>
        </div>
      </header>

      {/* Dashboard Content */}
      <main className="flex-1 p-6 overflow-auto space-y-8">
        {/* Metrics Cards */}
        <section>
          <MetricsCards />
        </section>

        {/* Bot Control */}
        <section>
          <BotControl />
        </section>

        {/* Analytics and Activity */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Analytics Chart */}
          <div>
            <AnalyticsChart />
          </div>

          {/* Activity Feed */}
          <div>
            <ActivityFeed />
          </div>
        </section>

        {/* Quick Actions */}
        <section>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Activity className="w-5 h-5" />
                <span>Quick Actions</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Link href="/creators">
                  <Button variant="outline" className="h-20 flex flex-col space-y-2 w-full">
                    <Users className="w-6 h-6" />
                    <span className="text-sm">View Creators</span>
                  </Button>
                </Link>
                <Link href="/analytics">
                  <Button variant="outline" className="h-20 flex flex-col space-y-2 w-full">
                    <BarChart3 className="w-6 h-6" />
                    <span className="text-sm">Analytics</span>
                  </Button>
                </Link>
                <Link href="/logs">
                  <Button variant="outline" className="h-20 flex flex-col space-y-2 w-full">
                    <Activity className="w-6 h-6" />
                    <span className="text-sm">Activity Logs</span>
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  );
}
