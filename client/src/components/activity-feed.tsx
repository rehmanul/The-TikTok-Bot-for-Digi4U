import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useActivities } from '@/hooks/use-metrics';
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Info, 
  Send, 
  UserPlus, 
  Play, 
  Pause, 
  Square,
  AlertCircle,
  Activity
} from 'lucide-react';

export function ActivityFeed() {
  const { data: activities, isLoading, error } = useActivities(20);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-start space-x-3 animate-pulse">
                <div className="w-8 h-8 bg-muted rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4" />
                  <div className="h-3 bg-muted rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground py-8">
            <AlertCircle className="w-8 h-8 mx-auto mb-2" />
            <p>Failed to load activities</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'invite_sent': return Send;
      case 'invite_accepted': return CheckCircle;
      case 'invite_rejected': return XCircle;
      case 'creator_discovery': return UserPlus;
      case 'session_start': return Play;
      case 'session_pause': return Pause;
      case 'session_stop': return Square;
      case 'error': return AlertTriangle;
      case 'login_success': return CheckCircle;
      case 'login_failed': return XCircle;
      default: return Info;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'invite_sent': return 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-950';
      case 'invite_accepted': return 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-950';
      case 'invite_rejected': return 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-950';
      case 'creator_discovery': return 'text-purple-600 bg-purple-100 dark:text-purple-400 dark:bg-purple-950';
      case 'session_start': return 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-950';
      case 'session_pause': return 'text-tiktok-secondary bg-tiktok-secondary/10 dark:text-tiktok-secondary dark:bg-tiktok-secondary/20';
      case 'session_stop': return 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-950';
      case 'error': return 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-950';
      case 'login_success': return 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-950';
      case 'login_failed': return 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-950';
      default: return 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-950';
    }
  };

  const getActivityBadge = (type: string) => {
    switch (type) {
      case 'invite_sent': return { text: 'Invite', variant: 'default' as const };
      case 'invite_accepted': return { text: 'Success', variant: 'default' as const };
      case 'invite_rejected': return { text: 'Rejected', variant: 'destructive' as const };
      case 'creator_discovery': return { text: 'Discovery', variant: 'secondary' as const };
      case 'session_start': return { text: 'Start', variant: 'default' as const };
      case 'session_pause': return { text: 'Pause', variant: 'secondary' as const };
      case 'session_stop': return { text: 'Stop', variant: 'destructive' as const };
      case 'error': return { text: 'Error', variant: 'destructive' as const };
      case 'login_success': return { text: 'Login', variant: 'default' as const };
      case 'login_failed': return { text: 'Login Failed', variant: 'destructive' as const };
      default: return { text: 'Info', variant: 'secondary' as const };
    }
  };

  const formatRelativeTime = (date: string | Date) => {
    const now = new Date();
    const activityDate = new Date(date);
    const diffMs = now.getTime() - activityDate.getTime();
    
    const diffSeconds = Math.floor(diffMs / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) return `${diffDays}d ago`;
    if (diffHours > 0) return `${diffHours}h ago`;
    if (diffMinutes > 0) return `${diffMinutes}m ago`;
    return 'Just now';
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Activity className="w-5 h-5" />
            <span>Recent Activity</span>
          </CardTitle>
          <Badge variant="outline" className="text-xs">
            Live Updates
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-80">
          {activities && activities.length > 0 ? (
            <div className="space-y-4">
              {activities.map((activity) => {
                const Icon = getActivityIcon(activity.type);
                const badge = getActivityBadge(activity.type);
                
                return (
                  <div
                    key={activity.id}
                    className="flex items-start space-x-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${getActivityColor(activity.type)}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <p className="text-sm font-medium text-foreground truncate">
                          {activity.description}
                        </p>
                        <Badge variant={badge.variant} className="text-xs">
                          {badge.text}
                        </Badge>
                      </div>
                      
                      {activity.metadata ? (
                        <div className="text-xs text-muted-foreground mb-1">
                          {(activity.metadata as any).username && (
                            <span>@{(activity.metadata as any).username}</span>
                          )}
                          {(activity.metadata as any).followers && (
                            <span> • {(activity.metadata as any).followers} followers</span>
                          )}
                          {(activity.metadata as any).category && (
                            <span> • {(activity.metadata as any).category}</span>
                          )}
                        </div>
                      ) : null}
                      
                      <p className="text-xs text-muted-foreground">
                        {formatRelativeTime(activity.createdAt ?? new Date())}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center text-muted-foreground py-8">
              <Activity className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>No recent activity</p>
              <p className="text-xs">Start the bot to see activity updates</p>
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
