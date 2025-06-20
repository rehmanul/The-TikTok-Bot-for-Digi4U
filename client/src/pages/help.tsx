import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { 
  Search,
  HelpCircle,
  AlertTriangle,
  CheckCircle,
  Settings,
  Users,
  Globe,
  Zap,
  RefreshCw,
  MessageSquare,
  Book,
  Phone
} from 'lucide-react';

interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
  tags: string[];
}

interface TroubleshootingStep {
  issue: string;
  solution: string;
  severity: 'low' | 'medium' | 'high';
}

export default function Help() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const faqs: FAQ[] = [
    {
      id: '1',
      question: 'How do I connect my TikTok Business API?',
      answer: 'Go to the TikTok API page, click "Connect to TikTok Business API", and complete the OAuth process in the popup window. Ensure you have proper business account permissions.',
      category: 'setup',
      tags: ['api', 'connection', 'oauth']
    },
    {
      id: '2',
      question: 'What follower count range should I target?',
      answer: 'Start with 10,000-500,000 followers. Micro-influencers (10K-100K) often have higher engagement rates, while macro-influencers (100K+) provide broader reach.',
      category: 'targeting',
      tags: ['followers', 'targeting', 'strategy']
    },
    {
      id: '3',
      question: 'How many invitations should I send per day?',
      answer: 'Begin with 20-50 invitations daily to test the system and stay within TikTok rate limits. Gradually increase based on your acceptance rates and platform feedback.',
      category: 'limits',
      tags: ['daily limits', 'rate limiting', 'best practices']
    },
    {
      id: '4',
      question: 'Why is my bot not sending invitations?',
      answer: 'Check: 1) API connection status, 2) Bot configuration completeness, 3) Available creators matching your criteria, 4) Rate limits not exceeded, 5) TikTok account permissions.',
      category: 'troubleshooting',
      tags: ['not working', 'invitations', 'debugging']
    },
    {
      id: '5',
      question: 'What is a good acceptance rate for creator invitations?',
      answer: 'Typical acceptance rates range from 10-30%. Rates above 20% are considered good. Focus on quality targeting rather than quantity to improve acceptance rates.',
      category: 'performance',
      tags: ['acceptance rate', 'metrics', 'success']
    },
    {
      id: '6',
      question: 'How do I improve my invitation success rate?',
      answer: 'Refine targeting criteria, personalize invitation messages, focus on creators whose content aligns with your products, and avoid over-saturated categories.',
      category: 'optimization',
      tags: ['optimization', 'success rate', 'targeting']
    },
    {
      id: '7',
      question: 'Can I run multiple campaigns simultaneously?',
      answer: 'No, run one bot session at a time to avoid conflicts and ensure proper tracking. You can configure different targeting criteria for different campaigns sequentially.',
      category: 'campaigns',
      tags: ['multiple campaigns', 'sessions', 'limitations']
    },
    {
      id: '8',
      question: 'How often should I monitor the bot?',
      answer: 'Check daily during the first week, then 2-3 times per week once stable. Monitor more frequently when making configuration changes or during high-volume periods.',
      category: 'monitoring',
      tags: ['monitoring', 'frequency', 'maintenance']
    }
  ];

  const troubleshootingSteps: TroubleshootingStep[] = [
    {
      issue: 'Bot shows "Disconnected" status',
      solution: 'Reconnect TikTok API through the TikTok API page. Check if your business account permissions are still valid.',
      severity: 'high'
    },
    {
      issue: 'No creators found matching criteria',
      solution: 'Broaden your targeting criteria: increase follower range, add more categories, or adjust GMV thresholds.',
      severity: 'medium'
    },
    {
      issue: 'Invitations sending slowly',
      solution: 'This is normal due to rate limiting. The system respects TikTok API limits to prevent restrictions.',
      severity: 'low'
    },
    {
      issue: 'High rejection rate (>80%)',
      solution: 'Review targeting criteria, ensure brand alignment, check invitation messaging, and verify creator content quality.',
      severity: 'medium'
    },
    {
      issue: 'Bot stops unexpectedly',
      solution: 'Check error logs, verify API connection, restart the bot session, and ensure no system timeouts occurred.',
      severity: 'high'
    },
    {
      issue: 'API rate limit exceeded',
      solution: 'Wait for the rate limit to reset (usually 1 hour), then reduce daily invitation limits in bot settings.',
      severity: 'medium'
    }
  ];

  const categories = [
    { id: 'all', label: 'All Topics', icon: HelpCircle },
    { id: 'setup', label: 'Setup & Configuration', icon: Settings },
    { id: 'targeting', label: 'Creator Targeting', icon: Users },
    { id: 'troubleshooting', label: 'Troubleshooting', icon: AlertTriangle },
    { id: 'performance', label: 'Performance & Metrics', icon: Zap },
    { id: 'optimization', label: 'Optimization', icon: RefreshCw }
  ];

  const filteredFAQs = faqs.filter(faq => {
    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory;
    const matchesSearch = searchTerm === '' || 
      faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    return matchesCategory && matchesSearch;
  });

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200';
      case 'medium': return 'bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-200';
      case 'low': return 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800 text-green-800 dark:text-green-200';
      default: return 'bg-gray-50 dark:bg-gray-950/20 border-gray-200 dark:border-gray-800 text-gray-800 dark:text-gray-200';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'high': return <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400" />;
      case 'medium': return <AlertTriangle className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />;
      case 'low': return <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />;
      default: return <HelpCircle className="w-4 h-4 text-gray-600 dark:text-gray-400" />;
    }
  };

  return (
    <div className="flex-1 bg-background">
      {/* Header */}
      <header className="h-20 bg-gradient-to-r from-primary/5 to-pink-50 dark:from-primary/10 dark:to-pink-950/20 border-b border-border/50 flex items-center justify-between px-8">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
            <HelpCircle className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-foreground">Help & Support</h2>
            <p className="text-sm text-muted-foreground">Find answers and troubleshoot common issues</p>
          </div>
        </div>
        <Badge variant="outline" className="text-sm">
          24/7 Self-Help
        </Badge>
      </header>

      <main className="p-8 space-y-6">
        {/* Search and Filter */}
        <Card className="border-border/50 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Search className="w-5 h-5 text-primary" />
              <span>Search Help Topics</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search for help topics, errors, or keywords..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => {
                const Icon = category.icon;
                return (
                  <Button
                    key={category.id}
                    variant={selectedCategory === category.id ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedCategory(category.id)}
                    className="flex items-center space-x-2"
                  >
                    <Icon className="w-4 h-4" />
                    <span>{category.label}</span>
                  </Button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Quick Troubleshooting */}
        <Card className="border-border/50 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-primary" />
              <span>Quick Troubleshooting</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {troubleshootingSteps.map((step, index) => (
                <div key={index} className={`p-4 rounded-xl border ${getSeverityColor(step.severity)}`}>
                  <div className="flex items-start space-x-3">
                    {getSeverityIcon(step.severity)}
                    <div className="flex-1">
                      <h4 className="font-semibold mb-2">{step.issue}</h4>
                      <p className="text-sm">{step.solution}</p>
                    </div>
                    <Badge variant="outline" className="text-xs capitalize">
                      {step.severity}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* FAQ Section */}
        <Card className="border-border/50 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <MessageSquare className="w-5 h-5 text-primary" />
                <span>Frequently Asked Questions</span>
              </div>
              <Badge variant="secondary" className="text-xs">
                {filteredFAQs.length} results
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredFAQs.map((faq) => (
                <div key={faq.id} className="p-4 bg-muted/20 rounded-xl border border-border/50">
                  <h4 className="font-semibold text-foreground mb-2">{faq.question}</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-3">{faq.answer}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex flex-wrap gap-1">
                      {faq.tags.map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    <Badge variant="secondary" className="text-xs capitalize">
                      {faq.category}
                    </Badge>
                  </div>
                </div>
              ))}
              
              {filteredFAQs.length === 0 && (
                <div className="text-center py-8">
                  <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">No results found</h3>
                  <p className="text-muted-foreground">Try different keywords or browse all categories</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Contact Support */}
        <Card className="border-border/50 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Phone className="w-5 h-5 text-primary" />
              <span>Additional Support</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 bg-blue-50 dark:bg-blue-950/20 rounded-xl border border-blue-200 dark:border-blue-800 text-center">
                <Book className="w-8 h-8 text-blue-600 mx-auto mb-3" />
                <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Documentation</h4>
                <p className="text-sm text-blue-700 dark:text-blue-300 mb-4">
                  Complete guides and API documentation
                </p>
                <Button variant="outline" size="sm" className="border-blue-300 dark:border-blue-700">
                  View Docs
                </Button>
              </div>
              
              <div className="p-6 bg-green-50 dark:bg-green-950/20 rounded-xl border border-green-200 dark:border-green-800 text-center">
                <MessageSquare className="w-8 h-8 text-green-600 mx-auto mb-3" />
                <h4 className="font-semibold text-green-900 dark:text-green-100 mb-2">Live Chat</h4>
                <p className="text-sm text-green-700 dark:text-green-300 mb-4">
                  Get help from our support team
                </p>
                <Button variant="outline" size="sm" className="border-green-300 dark:border-green-700">
                  Start Chat
                </Button>
              </div>
              
              <div className="p-6 bg-purple-50 dark:bg-purple-950/20 rounded-xl border border-purple-200 dark:border-purple-800 text-center">
                <Phone className="w-8 h-8 text-purple-600 mx-auto mb-3" />
                <h4 className="font-semibold text-purple-900 dark:text-purple-100 mb-2">Priority Support</h4>
                <p className="text-sm text-purple-700 dark:text-purple-300 mb-4">
                  Premium support for urgent issues
                </p>
                <Button variant="outline" size="sm" className="border-purple-300 dark:border-purple-700">
                  Contact Us
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}