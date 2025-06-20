import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useBotStatus } from '@/hooks/use-bot-status';
import { useTheme } from './theme-provider';
import { useMobile } from '@/hooks/use-mobile';

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
  Wrench,
  Menu,
  X
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const [location] = useLocation();
  const { theme, setTheme } = useTheme();
  const { data: botStatus } = useBotStatus();
  const isMobile = useMobile();

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
    <>
      {/* Mobile Overlay */}
      {isMobile && isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <aside className={`
        sidebar flex flex-col h-full 
        bg-gradient-to-b from-blue-900/95 to-slate-900/95 
        dark:from-slate-900/98 dark:to-black/95
        backdrop-blur-sm border-r border-border/30
        ${isMobile ? 'fixed top-0 left-0 z-50 w-80 transition-transform duration-300' : 'w-64'}
        ${isMobile && !isOpen ? '-translate-x-full' : 'translate-x-0'}
      `}>
      {/* Header */}
      <div className="p-4 lg:p-6 border-b border-border/30 bg-gradient-to-r from-blue-800/20 to-slate-800/20 dark:from-slate-800/40 dark:to-black/40">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 dark:from-blue-500 dark:to-cyan-400 flex items-center justify-center shadow-lg">
              <Rocket className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-base lg:text-lg font-bold text-white dark:text-slate-100">TikTok Bot</h1>
              <div className="flex items-center">
                <span className="text-xs lg:text-sm text-white/80 dark:text-slate-300">v2.0</span>
                <span className="mx-2 text-white/50 dark:text-slate-500">|</span>
                <span className="text-xs lg:text-sm text-white/80 dark:text-slate-300">Digi4u</span>
              </div>
            </div>
          </div>
          
          {/* Mobile Close Button */}
          {isMobile && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-white dark:text-slate-200 hover:bg-white/10 dark:hover:bg-slate-700/50 lg:hidden"
            >
              <X className="w-5 h-5" />
            </Button>
          )}
        </div>
      </div>

      {/* Bot Status */}
      <div className="p-4 lg:p-6 border-b border-border/30">
        <div className="p-4 bg-blue-900/30 dark:bg-black/40 rounded-xl border border-blue-500/20 dark:border-slate-600/30">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-white dark:text-slate-200">Bot Status</span>
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${getStatusColor(botStatus?.status || 'idle')} animate-pulse`} />
              <Badge variant={botStatus?.status === 'running' ? 'default' : 'secondary'} className="text-xs">
                {getStatusText(botStatus?.status || 'idle')}
              </Badge>
            </div>
          </div>
          
          {botStatus?.metrics && (
            <div className="space-y-2 text-xs text-white/80 dark:text-slate-300">
              <div className="flex justify-between">
                <span>Today's Invites:</span>
                <span className="font-medium text-white dark:text-slate-100">{botStatus.metrics.todayInvites}</span>
              </div>
              <div className="flex justify-between">
                <span>Success Rate:</span>
                <span className="font-medium text-white dark:text-slate-100">{botStatus.metrics.successRate}%</span>
              </div>
              <div className="flex justify-between">
                <span>Uptime:</span>
                <span className="font-medium text-white dark:text-slate-100">{botStatus.metrics.uptime}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 lg:p-6 overflow-y-auto">
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
                    className={`w-full justify-start space-x-2 lg:space-x-3 transition-all duration-200 text-sm lg:text-base ${
                      isActive 
                        ? 'bg-blue-600/30 dark:bg-blue-500/20 border border-blue-400/40 dark:border-blue-400/30 text-white dark:text-slate-100 shadow-lg' 
                        : 'text-white/90 dark:text-slate-300 hover:text-white dark:hover:text-slate-100 hover:bg-white/10 dark:hover:bg-slate-700/30'
                    }`}
                    onClick={isMobile ? onClose : undefined}
                  >
                    <Icon className="w-4 h-4 lg:w-5 lg:h-5" />
                    <span className="sidebar-text truncate">{item.label}</span>
                  </Button>
                </Link>
              );
            })}
          </div>

          {/* Configuration & Management */}
          <div className="space-y-2">
            <h3 className="text-xs font-semibold text-white/70 dark:text-slate-400 uppercase tracking-wider px-2">
              Configuration
            </h3>
            {navigationItems.filter(item => item.section === 'config').map((item) => {
              const isActive = location === item.path;
              const Icon = item.icon;
              
              return (
                <Link key={item.path} href={item.path}>
                  <Button
                    variant={isActive ? 'default' : 'ghost'}
                    className={`w-full justify-start space-x-2 lg:space-x-3 transition-all duration-200 text-sm lg:text-base ${
                      isActive 
                        ? 'bg-blue-600/30 dark:bg-blue-500/20 border border-blue-400/40 dark:border-blue-400/30 text-white dark:text-slate-100 shadow-lg' 
                        : 'text-white/90 dark:text-slate-300 hover:text-white dark:hover:text-slate-100 hover:bg-white/10 dark:hover:bg-slate-700/30'
                    }`}
                    onClick={isMobile ? onClose : undefined}
                  >
                    <Icon className="w-4 h-4 lg:w-5 lg:h-5" />
                    <span className="sidebar-text truncate">{item.label}</span>
                  </Button>
                </Link>
              );
            })}
          </div>

          {/* Monitoring & Analytics */}
          <div className="space-y-2">
            <h3 className="text-xs font-semibold text-white/70 dark:text-slate-400 uppercase tracking-wider px-2">
              Monitoring
            </h3>
            {navigationItems.filter(item => item.section === 'monitoring').map((item) => {
              const isActive = location === item.path;
              const Icon = item.icon;
              
              return (
                <Link key={item.path} href={item.path}>
                  <Button
                    variant={isActive ? 'default' : 'ghost'}
                    className={`w-full justify-start space-x-2 lg:space-x-3 transition-all duration-200 text-sm lg:text-base ${
                      isActive 
                        ? 'bg-blue-600/30 dark:bg-blue-500/20 border border-blue-400/40 dark:border-blue-400/30 text-white dark:text-slate-100 shadow-lg' 
                        : 'text-white/90 dark:text-slate-300 hover:text-white dark:hover:text-slate-100 hover:bg-white/10 dark:hover:bg-slate-700/30'
                    }`}
                    onClick={isMobile ? onClose : undefined}
                  >
                    <Icon className="w-4 h-4 lg:w-5 lg:h-5" />
                    <span className="sidebar-text truncate">{item.label}</span>
                  </Button>
                </Link>
              );
            })}
          </div>

          {/* Help & Support */}
          <div className="space-y-2">
            <h3 className="text-xs font-semibold text-white/70 dark:text-slate-400 uppercase tracking-wider px-2">
              Help & Support
            </h3>
            {navigationItems.filter(item => item.section === 'help').map((item) => {
              const isActive = location === item.path;
              const Icon = item.icon;
              
              return (
                <Link key={item.path} href={item.path}>
                  <Button
                    variant={isActive ? 'default' : 'ghost'}
                    className={`w-full justify-start space-x-2 lg:space-x-3 transition-all duration-200 text-sm lg:text-base ${
                      isActive 
                        ? 'bg-blue-600/30 dark:bg-blue-500/20 border border-blue-400/40 dark:border-blue-400/30 text-white dark:text-slate-100 shadow-lg' 
                        : 'text-white/90 dark:text-slate-300 hover:text-white dark:hover:text-slate-100 hover:bg-white/10 dark:hover:bg-slate-700/30'
                    }`}
                    onClick={isMobile ? onClose : undefined}
                  >
                    <Icon className="w-4 h-4 lg:w-5 lg:h-5" />
                    <span className="sidebar-text truncate">{item.label}</span>
                  </Button>
                </Link>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Theme Toggle */}
      <div className="p-4 lg:p-6 border-t border-border/30 bg-gradient-to-r from-blue-800/10 to-slate-800/10 dark:from-slate-800/30 dark:to-black/30">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
          className="w-full justify-start space-x-2 lg:space-x-3 text-white/80 dark:text-slate-300 hover:text-white dark:hover:text-slate-100 hover:bg-white/10 dark:hover:bg-slate-700/30 border-white/30 dark:border-slate-600/40 text-sm lg:text-base"
        >
          {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
          <span className="truncate">{theme === 'light' ? 'Dark Mode' : 'Light Mode'}</span>
        </Button>
      </div>
      </aside>
    </>
  );
}

// Mobile Menu Button Component
export function MobileMenuButton({ onClick }: { onClick: () => void }) {
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={onClick}
      className="lg:hidden text-slate-700 dark:text-slate-300 hover:bg-blue-100 dark:hover:bg-slate-700"
    >
      <Menu className="w-5 h-5" />
    </Button>
  );
}
