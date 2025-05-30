import { storage } from '../storage';
import type { InsertActivity } from '@shared/schema';

export class ActivityLogger {
  async log(activity: InsertActivity): Promise<void> {
    try {
      await storage.logActivity(activity);
      
      // Also log to console in development
      if (process.env.NODE_ENV === 'development') {
        console.log(`[${new Date().toISOString()}] ${activity.type}: ${activity.description}`);
        if (activity.metadata) {
          console.log('Metadata:', activity.metadata);
        }
      }
    } catch (error) {
      console.error('Failed to log activity:', error);
    }
  }

  async logError(error: Error, context: string, metadata?: any): Promise<void> {
    await this.log({
      type: 'error',
      description: `${context}: ${error.message}`,
      metadata: {
        ...metadata,
        stack: error.stack,
        timestamp: new Date().toISOString(),
      },
    });
  }

  async logPerformanceMetric(metric: string, value: number, unit: string = 'ms'): Promise<void> {
    await this.log({
      type: 'performance',
      description: `${metric}: ${value}${unit}`,
      metadata: {
        metric,
        value,
        unit,
        timestamp: new Date().toISOString(),
      },
    });
  }

  async logUserAction(action: string, userId?: number, metadata?: any): Promise<void> {
    await this.log({
      type: 'user_action',
      description: action,
      metadata: {
        ...metadata,
        userId,
        timestamp: new Date().toISOString(),
      },
    });
  }

  async logBotAction(action: string, sessionId?: number, creatorId?: number, metadata?: any): Promise<void> {
    await this.log({
      type: 'bot_action',
      description: action,
      sessionId,
      creatorId,
      metadata: {
        ...metadata,
        timestamp: new Date().toISOString(),
      },
    });
  }

  async getActivitySummary(hours: number = 24): Promise<any> {
    const since = new Date(Date.now() - hours * 60 * 60 * 1000);
    const activities = await storage.getRecentActivities(1000);
    
    const recentActivities = activities.filter(
      activity => activity.createdAt && activity.createdAt >= since
    );

    const summary = {
      total: recentActivities.length,
      byType: {} as Record<string, number>,
      errors: recentActivities.filter(a => a.type === 'error').length,
      invitesSent: recentActivities.filter(a => a.type === 'invite_sent').length,
      invitesAccepted: recentActivities.filter(a => a.type === 'invite_accepted').length,
      timeline: this.createTimeline(recentActivities, hours),
    };

    // Count by type
    recentActivities.forEach(activity => {
      summary.byType[activity.type] = (summary.byType[activity.type] || 0) + 1;
    });

    return summary;
  }

  private createTimeline(activities: any[], hours: number): any[] {
    const buckets = Math.min(hours, 24); // Max 24 buckets for visualization
    const bucketSize = hours / buckets;
    const now = Date.now();
    const timeline = [];

    for (let i = 0; i < buckets; i++) {
      const bucketStart = new Date(now - (i + 1) * bucketSize * 60 * 60 * 1000);
      const bucketEnd = new Date(now - i * bucketSize * 60 * 60 * 1000);
      
      const bucketActivities = activities.filter(activity => 
        activity.createdAt &&
        activity.createdAt >= bucketStart && 
        activity.createdAt < bucketEnd
      );

      timeline.unshift({
        timestamp: bucketEnd.toISOString(),
        count: bucketActivities.length,
        invites: bucketActivities.filter(a => a.type === 'invite_sent').length,
        errors: bucketActivities.filter(a => a.type === 'error').length,
      });
    }

    return timeline;
  }
}
