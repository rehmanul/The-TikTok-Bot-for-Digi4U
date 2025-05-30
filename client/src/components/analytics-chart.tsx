import { useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useActivitySummary } from '@/hooks/use-metrics';
import { BarChart3, TrendingUp } from 'lucide-react';

export function AnalyticsChart() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { data: summary, isLoading, error } = useActivitySummary(24);

  useEffect(() => {
    if (!summary?.timeline || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * window.devicePixelRatio;
    canvas.height = rect.height * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    // Clear canvas
    ctx.clearRect(0, 0, rect.width, rect.height);

    // Chart configuration
    const padding = 40;
    const chartWidth = rect.width - padding * 2;
    const chartHeight = rect.height - padding * 2;
    
    const data = summary.timeline;
    const maxValue = Math.max(...data.map(d => d.invites), 1);
    
    // Draw grid lines
    ctx.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue('--border').replace('hsl(', '').replace(')', '');
    ctx.lineWidth = 1;
    
    // Horizontal grid lines
    for (let i = 0; i <= 5; i++) {
      const y = padding + (chartHeight / 5) * i;
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(padding + chartWidth, y);
      ctx.stroke();
    }

    // Draw bars
    const barWidth = chartWidth / data.length;
    
    data.forEach((point, index) => {
      const x = padding + index * barWidth;
      const height = (point.invites / maxValue) * chartHeight;
      const y = padding + chartHeight - height;
      
      // Create gradient
      const gradient = ctx.createLinearGradient(0, y, 0, y + height);
      gradient.addColorStop(0, '#ff0050'); // TikTok pink
      gradient.addColorStop(1, '#25f4ee'); // TikTok cyan
      
      ctx.fillStyle = gradient;
      ctx.fillRect(x + barWidth * 0.1, y, barWidth * 0.8, height);
      
      // Draw error indicators if any
      if (point.errors > 0) {
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(x + barWidth * 0.1, y - 3, barWidth * 0.8, 3);
      }
    });

    // Draw labels
    ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--muted-foreground').replace('hsl(', '').replace(')', '');
    ctx.font = '12px Inter, system-ui, sans-serif';
    ctx.textAlign = 'center';
    
    data.forEach((point, index) => {
      const x = padding + index * barWidth + barWidth / 2;
      const time = new Date(point.timestamp).toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false 
      });
      ctx.fillText(time, x, rect.height - 10);
    });

    // Draw y-axis labels
    ctx.textAlign = 'right';
    for (let i = 0; i <= 5; i++) {
      const value = Math.round((maxValue / 5) * (5 - i));
      const y = padding + (chartHeight / 5) * i + 5;
      ctx.fillText(value.toString(), padding - 10, y);
    }

  }, [summary]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Activity Analytics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 bg-muted rounded-lg animate-pulse" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Activity Analytics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground py-16">
            <BarChart3 className="w-8 h-8 mx-auto mb-2" />
            <p>Failed to load analytics data</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <BarChart3 className="w-5 h-5" />
            <span>Activity Analytics</span>
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="text-xs">
              <TrendingUp className="w-3 h-3 mr-1" />
              24 Hours
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {summary ? (
          <div className="space-y-4">
            {/* Summary Stats */}
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-foreground">
                  {summary.invitesSent}
                </div>
                <div className="text-xs text-muted-foreground">Invites Sent</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {summary.invitesAccepted}
                </div>
                <div className="text-xs text-muted-foreground">Accepted</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-red-600">
                  {summary.errors}
                </div>
                <div className="text-xs text-muted-foreground">Errors</div>
              </div>
            </div>

            {/* Chart */}
            <div className="h-64 relative">
              <canvas
                ref={canvasRef}
                className="w-full h-full"
                style={{ width: '100%', height: '100%' }}
              />
            </div>

            {/* Legend */}
            <div className="flex items-center justify-center space-x-4 text-xs">
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 bg-gradient-to-r from-tiktok-primary to-tiktok-secondary rounded-sm" />
                <span className="text-muted-foreground">Invitations</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 bg-red-500 rounded-sm" />
                <span className="text-muted-foreground">Errors</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center text-muted-foreground py-16">
            <BarChart3 className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>No data available</p>
            <p className="text-xs">Start the bot to generate analytics</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
