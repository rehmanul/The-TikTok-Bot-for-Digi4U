import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useBotStatus } from '@/hooks/use-bot-status';
import { useTheme } from './theme-provider';
import { 
  LayoutDashboard, 
  Settings, 
  Users, 
  BarChart3, 
  ScrollText, 
  Rocket, 
  Moon, 
  Sun, 
  Play, 
  Pause,
  Wrench 
} from 'lucide-react';

export function Sidebar() {
  const [location] = useLocation();
  const { theme, setTheme } = useTheme();
  const { data: botStatus } = useBotStatus();

  const navigationItems = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/settings', label: 'Bot Settings', icon: Settings },
    { path: '/creators', label: 'Creators', icon: Users },
    { path: '/analytics', label: 'Analytics', icon: BarChart3 },
    { path: '/logs', label: 'Activity Logs', icon: ScrollText },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'bg-primary-blue';
      case 'paused': return 'bg-warning';
      case 'stopped': return 'bg-danger';
      default: return 'bg-dark-grey';
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

  return (
    <aside className="sidebar w-64 flex flex-col h-full">
      {/* Header */}
      <div className="sidebar-header">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-lg bg-ocean-gradient flex items-center justify-center">
            <Wrench className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white">TikTok Affiliator</h1>
            <div className="flex items-center">
              <span className="text-sm text-white opacity-90">v2.0</span>
              <span className="mx-2 text-white opacity-50">|</span>
              <span className="text-sm text-white opacity-90">Digi4u Repair</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bot Status */}
      <div className="p-4 border-b border-opacity-10 border-white">
        <Card className="metric-card">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium">Bot Status</span>
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${getStatusColor(botStatus?.status || 'idle')} animate-pulse`} />
              <Badge variant={botStatus?.status === 'running' ? 'default' : 'secondary'}>
                {getStatusText(botStatus?.status || 'idle')}
              </Badge>
            </div>
          </div>
          
          {botStatus?.metrics && (
            <div className="space-y-2 text-xs text-muted">
              <div className="flex justify-between">
                <span>Today's Invites:</span>
                <span className="font-medium">{botStatus.metrics.todayInvites}</span>
              </div>
              <div className="flex justify-between">
                <span>Success Rate:</span>
                <span className="font-medium">{botStatus.metrics.successRate}%</span>
              </div>
              <div className="flex justify-between">
                <span>Uptime:</span>
                <span className="font-medium">{botStatus.metrics.uptime}</span>
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <div className="space-y-2">
          {navigationItems.map((item) => {
            const isActive = location === item.path;
            const Icon = item.icon;
            
            return (
              <Link key={item.path} href={item.path}>
                <Button
                  variant={isActive ? 'default' : 'ghost'}
                  className={`nav-item w-full justify-start space-x-3 ${
                    isActive ? 'active' : ''
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Button>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Theme Toggle */}
      <div className="p-4 border-t border-opacity-10 border-white">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
          className="w-full justify-start space-x-3 text-white hover:bg-white hover:bg-opacity-10"
        >
          {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
          <span>{theme === 'light' ? 'Dark Mode' : 'Light Mode'}</span>
        </Button>
      </div>
    </aside>
  );
}
