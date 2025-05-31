import { useQuery } from '@tanstack/react-query';
import type { Activity, Creator } from '@shared/schema';

export interface DashboardMetrics {
  invitesSent: number;
  acceptanceRate: number;
  activeCreators: number;
  estimatedRevenue: number;
  dailyProgress: {
    current: number;
    target: number;
  };
}

export function useDashboardMetrics() {
  return useQuery<DashboardMetrics>({
    queryKey: ['/api/dashboard/metrics'],
    refetchInterval: 30000, // Refresh every 30 seconds
  });
}


export function useActivities(limit: number = 50) {
  return useQuery<Activity[]>({
    queryKey: ['/api/activities', limit],
    refetchInterval: 10000, // Refresh every 10 seconds
  });
}

export interface ActivitySummary {
  total: number;
  byType: Record<string, number>;
  errors: number;
  invitesSent: number;
  invitesAccepted: number;
  timeline: {
    timestamp: string;
    count: number;
    invites: number;
    errors: number;
  }[];
}

export function useActivitySummary(hours: number = 24) {
  return useQuery<ActivitySummary>({
    queryKey: ['/api/activities/summary', hours],
    refetchInterval: 60000, // Refresh every minute
  });
}

export function useCreators(limit: number = 20) {
  return useQuery<Creator[]>({
    queryKey: ['/api/creators', limit],
    refetchInterval: 30000, // Refresh every 30 seconds
  });
}

export function useCreatorStats() {
  return useQuery<{ total: number; active: number; pending: number }>({
    queryKey: ['/api/creators/stats'],
    refetchInterval: 30000, // Refresh every 30 seconds
  });
}
