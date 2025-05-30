import { useQuery } from '@tanstack/react-query';

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
  return useQuery({
    queryKey: ['/api/activities', limit],
    refetchInterval: 10000, // Refresh every 10 seconds
  });
}

export function useActivitySummary(hours: number = 24) {
  return useQuery({
    queryKey: ['/api/activities/summary', hours],
    refetchInterval: 60000, // Refresh every minute
  });
}

export function useCreators(limit: number = 20) {
  return useQuery({
    queryKey: ['/api/creators', limit],
    refetchInterval: 30000, // Refresh every 30 seconds
  });
}

export function useCreatorStats() {
  return useQuery({
    queryKey: ['/api/creators/stats'],
    refetchInterval: 30000, // Refresh every 30 seconds
  });
}
