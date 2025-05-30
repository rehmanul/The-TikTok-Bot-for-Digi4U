import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

export interface BotStatus {
  status: string;
  currentSession?: any;
  metrics: {
    todayInvites: number;
    successRate: number;
    activeCreators: number;
    uptime: string;
  };
  session: {
    isRunning: boolean;
    currentSession: any;
    puppeteer: {
      isInitialized: boolean;
      isLoggedIn: boolean;
    };
  };
}

export function useBotStatus() {
  return useQuery<BotStatus>({
    queryKey: ['/api/bot/status'],
    refetchInterval: 5000, // Refresh every 5 seconds
  });
}

export function useStartBot() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/bot/start');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/bot/status'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/metrics'] });
    },
  });
}

export function usePauseBot() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/bot/pause');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/bot/status'] });
    },
  });
}

export function useResumeBot() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/bot/resume');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/bot/status'] });
    },
  });
}

export function useStopBot() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/bot/stop');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/bot/status'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/metrics'] });
    },
  });
}

export function useEmergencyStop() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/bot/emergency-stop');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/bot/status'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/metrics'] });
    },
  });
}
