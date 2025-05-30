import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useDashboardMetrics } from '@/hooks/use-metrics';
import { Send, CheckCircle, Users, DollarSign, TrendingUp, TrendingDown } from 'lucide-react';

export function MetricsCards() {
  const { data: metrics, isLoading, error } = useDashboardMetrics();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-20 bg-muted rounded-lg" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card className="p-6">
        <div className="text-center text-muted-foreground">
          Failed to load metrics. Please try again.
        </div>
      </Card>
    );
  }

  if (!metrics) {
    return null;
  }

  const cards = [
    {
      title: 'Invites Sent Today',
      value: metrics.invitesSent.toLocaleString(),
      icon: Send,
      color: 'from-blue-500 to-blue-600',
      change: '+12%',
      trend: 'up' as const,
    },
    {
      title: 'Acceptance Rate',
      value: `${metrics.acceptanceRate}%`,
      icon: CheckCircle,
      color: 'from-green-500 to-green-600',
      change: '+8%',
      trend: 'up' as const,
    },
    {
      title: 'Active Creators',
      value: metrics.activeCreators.toLocaleString(),
      icon: Users,
      color: 'from-purple-500 to-purple-600',
      change: '+15%',
      trend: 'up' as const,
    },
    {
      title: 'Est. Monthly Revenue',
      value: `$${metrics.estimatedRevenue.toLocaleString()}`,
      icon: DollarSign,
      color: 'from-orange-500 to-orange-600',
      change: '+22%',
      trend: 'up' as const,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card, index) => {
        const Icon = card.icon;
        const TrendIcon = card.trend === 'up' ? TrendingUp : TrendingDown;
        
        return (
          <Card key={index} className="relative overflow-hidden border-border shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <Badge 
                  variant="secondary" 
                  className={`text-xs ${
                    card.trend === 'up' 
                      ? 'text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-950' 
                      : 'text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-950'
                  }`}
                >
                  <TrendIcon className="w-3 h-3 mr-1" />
                  {card.change}
                </Badge>
              </div>
              
              <div>
                <h3 className="text-2xl font-bold text-foreground mb-1">
                  {card.value}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {card.title}
                </p>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
