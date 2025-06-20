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
    // Main sections
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, section: 'main' },
    { path: '/real-bot', label: 'Real Bot', icon: Rocket, section: 'main' },
    
    // Configuration & Management
    { path: '/settings', label: 'Bot Settings', icon: Settings, section: 'config' },
    { path: '/creators', label: 'Creators', icon: Users, section: 'config' },
    { path: '/tiktok-api', label: 'TikTok API', icon: Rocket, section: 'config' },
    
    // Monitoring & Analytics
    { path: '/analytics', label: 'Analytics', icon: BarChart3, section: 'monitoring' },
    { path: '/logs', label: 'Activity Logs', icon: ScrollText, section: 'monitoring' },
    
    // Help & Support
    { path: '/guide', label: 'Operation Guide', icon: Wrench, section: 'help' },
    { path: '/help', label: 'Help & Support', icon: Play, section: 'help' },
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
    <aside className="sidebar w-64 flex flex-col h-full bg-gradient-to-b from-slate-900 to-slate-800 dark:from-slate-950 dark:to-slate-900 border-r border-border/20">
      {/* Header */}
      <div className="p-6 border-b border-border/20">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-primary to-pink-500 flex items-center justify-center shadow-lg">
            <Rocket className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white">TikTok Bot</h1>
            <div className="flex items-center">
              <span className="text-sm text-white/70">v2.0</span>
              <span className="mx-2 text-white/40">|</span>
              <span className="text-sm text-white/70">Digi4u</span>
            </div>
          </div>
        </div>

      </div>

      {/* Bot Status */}
      <div className="p-6 border-b border-border/20">
        <div className="p-4 bg-black/20 rounded-xl border border-white/10">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-white">Bot Status</span>
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${getStatusColor(botStatus?.status || 'idle')} animate-pulse`} />
              <Badge variant={botStatus?.status === 'running' ? 'default' : 'secondary'} className="text-xs">
                {getStatusText(botStatus?.status || 'idle')}
              </Badge>
            </div>
          </div>
          
          {botStatus?.metrics && (
            <div className="space-y-2 text-xs text-white/70">
              <div className="flex justify-between">
                <span>Today's Invites:</span>
                <span className="font-medium text-white">{botStatus.metrics.todayInvites}</span>
              </div>
              <div className="flex justify-between">
                <span>Success Rate:</span>
                <span className="font-medium text-white">{botStatus.metrics.successRate}%</span>
              </div>
              <div className="flex justify-between">
                <span>Uptime:</span>
                <span className="font-medium text-white">{botStatus.metrics.uptime}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-6">
        <div className="space-y-6">
          {/* Main Section */}
          <div className="space-y-2">
            {navigationItems.filter(item => item.section === 'main').map((item) => {
              const isActive = location === item.path;
              const Icon = item.icon;
              
              return (
                <Link key={item.path} href={item.path}>
                  <Button
                    variant={isActive ? 'default' : 'ghost'}
                    className={`w-full justify-start space-x-3 text-white/90 hover:text-white hover:bg-white/10 transition-all duration-200 ${
                      isActive ? 'bg-primary/20 border border-primary/30 text-white shadow-lg' : ''
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="sidebar-text">{item.label}</span>
                  </Button>
                </Link>
              );
            })}
          </div>

          {/* Configuration & Management */}
          <div className="space-y-2">
            <h3 className="text-xs font-semibold text-white/60 uppercase tracking-wider px-2">
              Configuration
            </h3>
            {navigationItems.filter(item => item.section === 'config').map((item) => {
              const isActive = location === item.path;
              const Icon = item.icon;
              
              return (
                <Link key={item.path} href={item.path}>
                  <Button
                    variant={isActive ? 'default' : 'ghost'}
                    className={`w-full justify-start space-x-3 text-white/90 hover:text-white hover:bg-white/10 transition-all duration-200 ${
                      isActive ? 'bg-primary/20 border border-primary/30 text-white shadow-lg' : ''
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="sidebar-text">{item.label}</span>
                  </Button>
                </Link>
              );
            })}
          </div>

          {/* Monitoring & Analytics */}
          <div className="space-y-2">
            <h3 className="text-xs font-semibold text-white/60 uppercase tracking-wider px-2">
              Monitoring
            </h3>
            {navigationItems.filter(item => item.section === 'monitoring').map((item) => {
              const isActive = location === item.path;
              const Icon = item.icon;
              
              return (
                <Link key={item.path} href={item.path}>
                  <Button
                    variant={isActive ? 'default' : 'ghost'}
                    className={`w-full justify-start space-x-3 text-white/90 hover:text-white hover:bg-white/10 transition-all duration-200 ${
                      isActive ? 'bg-primary/20 border border-primary/30 text-white shadow-lg' : ''
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="sidebar-text">{item.label}</span>
                  </Button>
                </Link>
              );
            })}
          </div>

          {/* Help & Support */}
          <div className="space-y-2">
            <h3 className="text-xs font-semibold text-white/60 uppercase tracking-wider px-2">
              Help & Support
            </h3>
            {navigationItems.filter(item => item.section === 'help').map((item) => {
              const isActive = location === item.path;
              const Icon = item.icon;
              
              return (
                <Link key={item.path} href={item.path}>
                  <Button
                    variant={isActive ? 'default' : 'ghost'}
                    className={`w-full justify-start space-x-3 text-white/90 hover:text-white hover:bg-white/10 transition-all duration-200 ${
                      isActive ? 'bg-primary/20 border border-primary/30 text-white shadow-lg' : ''
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="sidebar-text">{item.label}</span>
                  </Button>
                </Link>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Theme Toggle */}
      <div className="p-6 border-t border-border/20">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
          className="w-full justify-start space-x-3 text-white/70 hover:text-white hover:bg-white/10 border-white/20"
        >
          {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
          <span>{theme === 'light' ? 'Dark Mode' : 'Light Mode'}</span>
        </Button>
      </div>
    </aside>
  );
}
