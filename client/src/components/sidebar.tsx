import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useBotStatus } from '@/hooks/use-bot-status';
import { useTheme } from './theme-provider';
import { UserProfile } from './user-profile';
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
      <div className="p-4 border-b border-border/10">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-tiktok-primary to-tiktok-secondary flex items-center justify-center">
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
        <UserProfile />
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
      <div className="p-4 border-t border-border/10">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
          className="w-full justify-between group relative overflow-hidden transition-all duration-300"
        >
          <div className="flex items-center space-x-2">
            <div className="relative z-10 transition-transform duration-500 transform group-hover:rotate-180">
              {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            </div>
            <span className="relative z-10">{theme === 'light' ? 'Dark Mode' : 'Light Mode'}</span>
          </div>
          <div className={`absolute inset-0 transition-transform duration-300 ${
            theme === 'light' 
              ? 'bg-gradient-to-r from-gray-900/10 to-gray-900/20' 
              : 'bg-gradient-to-r from-yellow-500/10 to-yellow-500/20'
          } transform ${
            theme === 'light' ? 'translate-x-full' : 'translate-x-0'
          } group-hover:translate-x-0`}></div>
        </Button>
      </div>
    </aside>
  );
}
