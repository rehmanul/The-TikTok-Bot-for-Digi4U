import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'wouter';
import { 
  Key, 
  CheckCircle, 
  AlertTriangle, 
  ExternalLink,
  ArrowLeft,
  Copy,
  Eye,
  EyeOff
} from 'lucide-react';

export default function TokenSetup() {
  const { toast } = useToast();
  const [accessToken, setAccessToken] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [showToken, setShowToken] = useState(false);
  const [validationResult, setValidationResult] = useState<{ success?: boolean; message?: string } | null>(null);

  const handleSetToken = async () => {
    if (!accessToken.trim()) {
      toast({
        title: "Error",
        description: "Please enter a valid access token",
        variant: "destructive",
      });
      return;
    }

    setIsValidating(true);
    setValidationResult(null);

    try {
      const response = await fetch('/api/tiktok/set-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ access_token: accessToken.trim() })
      });

      const data = await response.json();

      if (data.success) {
        setValidationResult({ success: true, message: data.message });
        toast({
          title: "Success",
          description: "TikTok API connected successfully",
        });
        setAccessToken('');
      } else {
        setValidationResult({ success: false, message: data.message });
        toast({
          title: "Connection Failed",
          description: data.message || "Invalid access token",
          variant: "destructive",
        });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Connection failed";
      setValidationResult({ success: false, message: errorMessage });
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsValidating(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied",
      description: "Text copied to clipboard",
    });
  };

  return (
    <div className="flex-1 bg-background">
      {/* Header */}
      <header className="h-20 bg-gradient-to-r from-primary/5 to-pink-50 dark:from-primary/10 dark:to-pink-950/20 border-b border-border/50 flex items-center justify-between px-8">
        <div className="flex items-center space-x-4">
          <Link href="/tiktok-api">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to API
            </Button>
          </Link>
          <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
            <Key className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-foreground">TikTok API Setup</h2>
            <p className="text-sm text-muted-foreground">Configure your TikTok Business API access token</p>
          </div>
        </div>
      </header>

      <main className="p-8 max-w-4xl mx-auto space-y-6">
        {/* Instructions */}
        <Card className="border-border/50 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-orange-500" />
              <span>Before You Begin</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-xl border border-blue-200 dark:border-blue-800">
              <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Requirements</h4>
              <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                <li>• Active TikTok Business account</li>
                <li>• Access to TikTok Business API dashboard</li>
                <li>• Valid API access token from your developer account</li>
                <li>• Proper permissions for creator collaboration features</li>
              </ul>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-xl border border-green-200 dark:border-green-800">
                <h4 className="font-semibold text-green-900 dark:text-green-100 mb-2">Step 1: Get Your Token</h4>
                <p className="text-sm text-green-800 dark:text-green-200 mb-3">
                  Visit your TikTok Business API dashboard to generate an access token
                </p>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="w-full border-green-300 dark:border-green-700"
                  onClick={() => window.open('https://business-api.tiktok.com/', '_blank')}
                >
                  <ExternalLink className="w-3 h-3 mr-2" />
                  Open TikTok Business API
                </Button>
              </div>

              <div className="p-4 bg-purple-50 dark:bg-purple-950/20 rounded-xl border border-purple-200 dark:border-purple-800">
                <h4 className="font-semibold text-purple-900 dark:text-purple-100 mb-2">Step 2: Configure Access</h4>
                <p className="text-sm text-purple-800 dark:text-purple-200 mb-3">
                  Ensure your token has creator collaboration and campaign management permissions
                </p>
                <div className="text-xs text-purple-700 dark:text-purple-300">
                  Required scopes: biz.creator.info, tcm.order.update
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Token Input */}
        <Card className="border-border/50 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Key className="w-5 h-5 text-primary" />
              <span>Access Token Configuration</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <Label htmlFor="access-token" className="text-sm font-medium">
                TikTok Business API Access Token
              </Label>
              <div className="relative">
                <Textarea
                  id="access-token"
                  placeholder="Paste your TikTok Business API access token here..."
                  value={accessToken}
                  onChange={(e) => setAccessToken(e.target.value)}
                  rows={4}

                  className="pr-20 font-mono text-sm"
                />
                <div className="absolute right-2 top-2 flex space-x-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowToken(!showToken)}
                    className="h-8 w-8 p-0"
                  >
                    {showToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                  {accessToken && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(accessToken)}
                      className="h-8 w-8 p-0"
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Your token is encrypted and stored securely. We never log or expose access tokens.
              </p>
            </div>

            {/* Validation Result */}
            {validationResult && (
              <Alert className={validationResult.success ? 'border-green-200 bg-green-50 dark:bg-green-950/20' : 'border-red-200 bg-red-50 dark:bg-red-950/20'}>
                <div className="flex items-center space-x-2">
                  {validationResult.success ? (
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-red-600" />
                  )}
                  <AlertDescription className={validationResult.success ? 'text-green-800 dark:text-green-200' : 'text-red-800 dark:text-red-200'}>
                    {validationResult.message}
                  </AlertDescription>
                </div>
              </Alert>
            )}

            <div className="flex space-x-3">
              <Button 
                onClick={handleSetToken}
                disabled={!accessToken || isValidating}
                className="flex-1"
                size="lg"
              >
                {isValidating ? 'Validating...' : 'Connect API'}
              </Button>
              <Button 
                onClick={() => setAccessToken('')}
                variant="outline"
                disabled={!accessToken}
              >
                Clear
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* App Configuration Preview */}
        <Card className="border-border/50 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <span>Current Configuration</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-muted/30 rounded-lg">
                <div className="text-sm font-medium text-muted-foreground">App ID</div>
                <div className="text-sm font-mono text-foreground">7512649815700963329</div>
              </div>
              <div className="p-3 bg-muted/30 rounded-lg">
                <div className="text-sm font-medium text-muted-foreground">Environment</div>
                <div className="text-sm text-foreground">Production</div>
              </div>
              <div className="p-3 bg-muted/30 rounded-lg">
                <div className="text-sm font-medium text-muted-foreground">API Version</div>
                <div className="text-sm text-foreground">v1.3</div>
              </div>
              <div className="p-3 bg-muted/30 rounded-lg">
                <div className="text-sm font-medium text-muted-foreground">Target Region</div>
                <div className="text-sm text-foreground">United Kingdom</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Next Steps */}
        {validationResult?.success && (
          <Card className="border-green-200 bg-green-50 dark:bg-green-950/20 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-green-800 dark:text-green-200">
                <CheckCircle className="w-5 h-5" />
                <span>Connection Successful</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-green-700 dark:text-green-300">
                Your TikTok Business API is now connected and ready for use. You can now:
              </p>
              <ul className="text-green-700 dark:text-green-300 space-y-1">
                <li>• Configure bot targeting criteria</li>
                <li>• Start automated creator discovery</li>
                <li>• Send collaboration invitations</li>
                <li>• Monitor campaign performance</li>
              </ul>
              <div className="flex space-x-3 pt-2">
                <Link href="/tiktok-api">
                  <Button variant="outline" className="border-green-300 dark:border-green-700">
                    View API Status
                  </Button>
                </Link>
                <Link href="/settings">
                  <Button className="bg-green-600 hover:bg-green-700">
                    Configure Bot Settings
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}