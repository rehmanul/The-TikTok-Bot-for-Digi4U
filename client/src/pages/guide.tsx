import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  BookOpen, 
  ChevronDown, 
  ChevronRight,
  Play,
  Settings,
  Users,
  Shield,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Globe,
  Zap,
  Target,
  BarChart3
} from 'lucide-react';

interface GuideStep {
  id: string;
  title: string;
  description: string;
  icon: any;
  steps: string[];
  tips?: string[];
  warnings?: string[];
}

export default function Guide() {
  const [openSections, setOpenSections] = useState<string[]>(['setup']);

  const toggleSection = (sectionId: string) => {
    setOpenSections(prev => 
      prev.includes(sectionId) 
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  const guideSteps: GuideStep[] = [
    {
      id: 'setup',
      title: 'Initial Setup & API Connection',
      description: 'Connect your TikTok Business API and configure basic settings',
      icon: Settings,
      steps: [
        'Navigate to the "TikTok API" page from the sidebar',
        'Click "Connect to TikTok Business API" button',
        'Complete the OAuth authorization in the popup window',
        'Log in with your TikTok Business account credentials',
        'Grant the required permissions for creator access',
        'Verify the connection shows "Connected" status',
        'Review your API configuration and available scopes'
      ],
      tips: [
        'Ensure you have a TikTok Business account with affiliate program access',
        'Use the official TikTok Business credentials provided in your account',
        'The authorization process may take 1-2 minutes to complete'
      ],
      warnings: [
        'Never share your API credentials with unauthorized users',
        'Ensure your TikTok Business account has proper permissions for creator invitations'
      ]
    },
    {
      id: 'configuration',
      title: 'Bot Configuration',
      description: 'Set up your targeting criteria and invitation parameters',
      icon: Target,
      steps: [
        'Go to "Bot Settings" in the sidebar',
        'Configure minimum follower count (e.g., 10,000)',
        'Set maximum follower count (e.g., 500,000)',
        'Select product categories relevant to your business',
        'Set GMV (Gross Merchandise Value) thresholds',
        'Configure daily invitation limits (recommended: 20-50 per day)',
        'Set success rate targets and monitoring preferences',
        'Save your configuration settings'
      ],
      tips: [
        'Start with conservative follower ranges to test the system',
        'Focus on 2-3 product categories initially for better targeting',
        'Set realistic daily limits to avoid platform restrictions'
      ],
      warnings: [
        'Avoid setting extremely high follower counts that may limit creator pool',
        'Respect TikTok\'s rate limiting guidelines to prevent API restrictions'
      ]
    },
    {
      id: 'creator-discovery',
      title: 'Creator Discovery & Filtering',
      description: 'Find and evaluate potential creators for collaboration',
      icon: Users,
      steps: [
        'Navigate to the "Creators" page',
        'Review the list of discovered creators matching your criteria',
        'Sort creators by GMV score (highest to lowest recommended)',
        'Review individual creator profiles and engagement rates',
        'Check creator categories and content alignment',
        'Mark preferred creators for priority targeting',
        'Exclude any creators that don\'t fit your brand values'
      ],
      tips: [
        'Focus on creators with consistent engagement rates above 3%',
        'Look for creators whose content aligns with your product categories',
        'Review recent posts to ensure content quality and brand safety'
      ]
    },
    {
      id: 'automation',
      title: 'Starting the Bot',
      description: 'Launch automated invitation campaigns',
      icon: Play,
      steps: [
        'Return to the "Dashboard" page',
        'Review your current metrics and bot status',
        'Ensure your configuration is properly saved',
        'Click the "Start Bot" button in the Bot Control Center',
        'Monitor the real-time progress in the activity feed',
        'Watch invitation success rates in the metrics cards',
        'Check for any error messages or warnings'
      ],
      tips: [
        'Start during business hours for better monitoring',
        'Keep the dashboard open to monitor progress',
        'Allow 30-60 minutes for the first batch of invitations'
      ],
      warnings: [
        'Never start multiple bot sessions simultaneously',
        'Monitor the system closely during the first campaign'
      ]
    },
    {
      id: 'monitoring',
      title: 'Monitoring & Analytics',
      description: 'Track performance and optimize your campaigns',
      icon: BarChart3,
      steps: [
        'Check the "Analytics" page for detailed performance metrics',
        'Monitor invitation acceptance rates and response times',
        'Review creator engagement statistics',
        'Track revenue attribution from successful partnerships',
        'Analyze which creator categories perform best',
        'Identify optimal invitation timing patterns',
        'Export performance reports for record keeping'
      ],
      tips: [
        'Review analytics daily for the first week',
        'Focus on acceptance rate trends over individual rejections',
        'Use performance data to refine your targeting criteria'
      ]
    },
    {
      id: 'optimization',
      title: 'Campaign Optimization',
      description: 'Improve targeting and increase success rates',
      icon: TrendingUp,
      steps: [
        'Analyze which creator segments have highest acceptance rates',
        'Adjust follower count ranges based on performance data',
        'Refine product category targeting',
        'Modify invitation messaging for better response rates',
        'Test different GMV thresholds',
        'Adjust daily invitation limits based on capacity',
        'Update targeting criteria based on market changes'
      ],
      tips: [
        'Make incremental changes rather than major overhauls',
        'Test changes with small creator groups first',
        'Document what works for future reference'
      ]
    },
    {
      id: 'maintenance',
      title: 'System Maintenance',
      description: 'Keep your bot running smoothly and efficiently',
      icon: Shield,
      steps: [
        'Check API connection status weekly',
        'Review and update creator exclusion lists',
        'Monitor system logs for errors or warnings',
        'Update bot configuration as business needs change',
        'Refresh API tokens when prompted',
        'Backup important configuration settings',
        'Stay updated with TikTok API policy changes'
      ],
      warnings: [
        'Always backup configurations before making major changes',
        'Monitor for TikTok policy updates that may affect operations'
      ]
    },
    {
      id: 'troubleshooting',
      title: 'Troubleshooting Common Issues',
      description: 'Resolve typical problems and error conditions',
      icon: AlertTriangle,
      steps: [
        'Check API connection if invitations stop sending',
        'Verify your TikTok Business account permissions',
        'Review error logs in the "Activity Logs" section',
        'Restart the bot if it becomes unresponsive',
        'Check rate limiting messages from TikTok API',
        'Verify creator targeting criteria aren\'t too restrictive',
        'Contact support if errors persist after troubleshooting'
      ],
      tips: [
        'Most issues resolve with a simple bot restart',
        'Check the system status before troubleshooting',
        'Keep records of error messages for support requests'
      ]
    }
  ];

  return (
    <div className="flex-1 bg-background">
      {/* Header */}
      <header className="h-20 bg-gradient-to-r from-primary/5 to-pink-50 dark:from-primary/10 dark:to-pink-950/20 border-b border-border/50 flex items-center justify-between px-8">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
            <BookOpen className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-foreground">Bot Operation Guide</h2>
            <p className="text-sm text-muted-foreground">Step-by-step instructions for operating your TikTok affiliate bot</p>
          </div>
        </div>
        <Badge variant="outline" className="text-sm">
          Complete Guide
        </Badge>
      </header>

      <main className="p-8 space-y-6">
        {/* Introduction */}
        <Card className="border-border/50 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Zap className="w-5 h-5 text-primary" />
              <span>Quick Start Overview</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground leading-relaxed">
              This guide will walk you through the complete process of setting up and operating your TikTok affiliate bot. 
              Follow each section in order for the best results. The entire setup process typically takes 15-30 minutes.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-xl border border-blue-200 dark:border-blue-800">
                <div className="flex items-center space-x-2 mb-2">
                  <Globe className="w-4 h-4 text-blue-600" />
                  <span className="font-medium text-blue-900 dark:text-blue-100">Setup Time</span>
                </div>
                <p className="text-sm text-blue-700 dark:text-blue-300">15-30 minutes initial setup</p>
              </div>
              
              <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-xl border border-green-200 dark:border-green-800">
                <div className="flex items-center space-x-2 mb-2">
                  <Target className="w-4 h-4 text-green-600" />
                  <span className="font-medium text-green-900 dark:text-green-100">Daily Management</span>
                </div>
                <p className="text-sm text-green-700 dark:text-green-300">5-10 minutes monitoring</p>
              </div>
              
              <div className="p-4 bg-purple-50 dark:bg-purple-950/20 rounded-xl border border-purple-200 dark:border-purple-800">
                <div className="flex items-center space-x-2 mb-2">
                  <TrendingUp className="w-4 h-4 text-purple-600" />
                  <span className="font-medium text-purple-900 dark:text-purple-100">Expected Results</span>
                </div>
                <p className="text-sm text-purple-700 dark:text-purple-300">10-30% acceptance rate</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Step-by-Step Guide */}
        <div className="space-y-4">
          {guideSteps.map((step, index) => {
            const isOpen = openSections.includes(step.id);
            const Icon = step.icon;
            
            return (
              <Card key={step.id} className="border-border/50 shadow-lg overflow-hidden">
                <Collapsible open={isOpen} onOpenChange={() => toggleSection(step.id)}>
                  <CollapsibleTrigger asChild>
                    <CardHeader className="cursor-pointer hover:bg-muted/20 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                            <Icon className="w-6 h-6 text-primary" />
                          </div>
                          <div className="text-left">
                            <CardTitle className="flex items-center space-x-3">
                              <span className="text-sm font-medium text-primary">Step {index + 1}</span>
                              <span>{step.title}</span>
                            </CardTitle>
                            <p className="text-sm text-muted-foreground mt-1">{step.description}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline" className="text-xs">
                            {step.steps.length} steps
                          </Badge>
                          {isOpen ? (
                            <ChevronDown className="w-4 h-4 text-muted-foreground" />
                          ) : (
                            <ChevronRight className="w-4 h-4 text-muted-foreground" />
                          )}
                        </div>
                      </div>
                    </CardHeader>
                  </CollapsibleTrigger>
                  
                  <CollapsibleContent>
                    <CardContent className="pt-0 space-y-6">
                      {/* Main Steps */}
                      <div>
                        <h4 className="font-medium text-foreground mb-3 flex items-center space-x-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span>Instructions</span>
                        </h4>
                        <div className="space-y-3">
                          {step.steps.map((stepText, stepIndex) => (
                            <div key={stepIndex} className="flex items-start space-x-3">
                              <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center text-xs font-medium text-primary mt-0.5">
                                {stepIndex + 1}
                              </div>
                              <p className="text-sm text-foreground leading-relaxed flex-1">{stepText}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Tips */}
                      {step.tips && (
                        <>
                          <Separator />
                          <div>
                            <h4 className="font-medium text-foreground mb-3 flex items-center space-x-2">
                              <TrendingUp className="w-4 h-4 text-blue-500" />
                              <span>Pro Tips</span>
                            </h4>
                            <div className="space-y-2">
                              {step.tips.map((tip, tipIndex) => (
                                <div key={tipIndex} className="flex items-start space-x-3 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                                  <p className="text-sm text-blue-800 dark:text-blue-200">{tip}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        </>
                      )}

                      {/* Warnings */}
                      {step.warnings && (
                        <>
                          <Separator />
                          <div>
                            <h4 className="font-medium text-foreground mb-3 flex items-center space-x-2">
                              <AlertTriangle className="w-4 h-4 text-orange-500" />
                              <span>Important Warnings</span>
                            </h4>
                            <div className="space-y-2">
                              {step.warnings.map((warning, warningIndex) => (
                                <div key={warningIndex} className="flex items-start space-x-3 p-3 bg-orange-50 dark:bg-orange-950/20 rounded-lg border border-orange-200 dark:border-orange-800">
                                  <AlertTriangle className="w-4 h-4 text-orange-600 dark:text-orange-400 mt-0.5" />
                                  <p className="text-sm text-orange-800 dark:text-orange-200">{warning}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        </>
                      )}
                    </CardContent>
                  </CollapsibleContent>
                </Collapsible>
              </Card>
            );
          })}
        </div>

        {/* Quick Actions */}
        <Card className="border-border/50 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Zap className="w-5 h-5 text-primary" />
              <span>Quick Actions</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Button variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2">
                <Globe className="w-6 h-6 text-primary" />
                <span className="text-sm">Connect API</span>
              </Button>
              <Button variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2">
                <Settings className="w-6 h-6 text-primary" />
                <span className="text-sm">Configure Bot</span>
              </Button>
              <Button variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2">
                <Play className="w-6 h-6 text-primary" />
                <span className="text-sm">Start Campaign</span>
              </Button>
              <Button variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2">
                <BarChart3 className="w-6 h-6 text-primary" />
                <span className="text-sm">View Analytics</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}