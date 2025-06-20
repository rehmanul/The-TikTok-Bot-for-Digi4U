import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  ExternalLink, 
  Copy, 
  CheckCircle, 
  AlertTriangle,
  ArrowRight,
  Key,
  User,
  Shield
} from 'lucide-react';

export default function GetAccessTokenGuide() {
  const [step, setStep] = useState(1);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const authUrl = "https://www.tiktok.com/v2/auth/authorize?client_key=7512649815700963329&scope=user.info.basic%2Cbiz.creator.info%2Cbiz.creator.insights%2Cvideo.list%2Ctcm.order.update%2Ctto.campaign.link&response_type=code&redirect_uri=https%3A%2F%2Fseller-uk-accounts.tiktok.com%2Faccount%2Fregister";

  return (
    <div className="flex-1 bg-background">
      <header className="h-20 bg-gradient-to-r from-primary/5 to-pink-50 dark:from-primary/10 dark:to-pink-950/20 border-b border-border/50 flex items-center px-8">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
            <Key className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-foreground">Get Your TikTok Access Token</h2>
            <p className="text-sm text-muted-foreground">Follow these steps to authorize your app and get the access token</p>
          </div>
        </div>
      </header>

      <main className="p-8 max-w-4xl mx-auto">
        {/* Current Status */}
        <Card className="mb-8 border-amber-200 bg-amber-50 dark:bg-amber-950/20">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-amber-800 dark:text-amber-200">
              <AlertTriangle className="w-5 h-5" />
              <span>Missing Access Token</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-amber-700 dark:text-amber-300 mb-4">
              Your app configuration shows the App ID and Secret, but you need to generate an access token through TikTok's authorization process.
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-white/50 dark:bg-black/20 rounded-lg">
                <div className="text-sm font-medium text-muted-foreground">App ID</div>
                <div className="text-sm font-mono text-foreground">7512649815700963329</div>
              </div>
              <div className="p-3 bg-white/50 dark:bg-black/20 rounded-lg">
                <div className="text-sm font-medium text-muted-foreground">Status</div>
                <Badge variant="outline" className="text-red-600 border-red-200">Access Token Missing</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Authorization Steps */}
        <div className="space-y-6">
          {/* Step 1: Authorization */}
          <Card className="border-border/50 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-sm font-bold text-primary">
                  1
                </div>
                <div>
                  <span>Authorize Your App</span>
                  <p className="text-sm text-muted-foreground font-normal mt-1">
                    Click the authorization link to grant permissions to your app
                  </p>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Alert>
                  <User className="w-4 h-4" />
                  <AlertDescription>
                    This will open TikTok's authorization page where you'll log in with your TikTok Business account and approve the app permissions.
                  </AlertDescription>
                </Alert>
                
                <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">Permissions Being Requested:</h4>
                  <div className="grid grid-cols-1 gap-2 text-sm">
                    {[
                      'user.info.basic - Basic user information',
                      'biz.creator.info - Creator profile data', 
                      'biz.creator.insights - Creator analytics',
                      'video.list - Video content access',
                      'tcm.order.update - Campaign order management',
                      'tto.campaign.link - Campaign linking'
                    ].map((scope) => (
                      <div key={scope} className="flex items-center space-x-2">
                        <CheckCircle className="w-3 h-3 text-blue-600" />
                        <span className="text-blue-700 dark:text-blue-300">{scope}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <Button 
                  onClick={() => window.open(authUrl, '_blank')}
                  className="w-full bg-gradient-to-r from-primary to-pink-500 hover:from-primary/90 hover:to-pink-500/90"
                  size="lg"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Authorize App & Get Access Token
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Step 2: What Happens Next */}
          <Card className="border-border/50 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-sm font-bold text-primary">
                  2
                </div>
                <div>
                  <span>Authorization Process</span>
                  <p className="text-sm text-muted-foreground font-normal mt-1">
                    What happens when you click the authorization link
                  </p>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <ArrowRight className="w-4 h-4 mt-1 text-primary" />
                  <div>
                    <div className="font-medium">TikTok Login Page</div>
                    <div className="text-sm text-muted-foreground">You'll be redirected to TikTok's login page</div>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <ArrowRight className="w-4 h-4 mt-1 text-primary" />
                  <div>
                    <div className="font-medium">Permission Approval</div>
                    <div className="text-sm text-muted-foreground">Review and approve the requested permissions</div>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <ArrowRight className="w-4 h-4 mt-1 text-primary" />
                  <div>
                    <div className="font-medium">Authorization Code</div>
                    <div className="text-sm text-muted-foreground">TikTok will provide an authorization code in the redirect URL</div>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <ArrowRight className="w-4 h-4 mt-1 text-primary" />
                  <div>
                    <div className="font-medium">Exchange for Token</div>
                    <div className="text-sm text-muted-foreground">Use the code to get your access token via API call</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Step 3: Alternative Method */}
          <Card className="border-border/50 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900/20 rounded-full flex items-center justify-center text-sm font-bold text-orange-600">
                  Alt
                </div>
                <div>
                  <span>Alternative: Contact TikTok Support</span>
                  <p className="text-sm text-muted-foreground font-normal mt-1">
                    If authorization doesn't work, contact TikTok Business API support
                  </p>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Alert>
                  <Shield className="w-4 h-4" />
                  <AlertDescription>
                    For business accounts, TikTok sometimes provides access tokens directly through their support team.
                  </AlertDescription>
                </Alert>
                
                <div className="p-3 bg-orange-50 dark:bg-orange-950/20 rounded-lg border border-orange-200 dark:border-orange-800">
                  <h4 className="font-semibold text-orange-800 dark:text-orange-200 mb-2">Contact Information:</h4>
                  <div className="space-y-2 text-sm text-orange-700 dark:text-orange-300">
                    <div>• Email: business-api-support@tiktok.com</div>
                    <div>• Provide your App ID: 7512649815700963329</div>
                    <div>• Request access token for creator marketplace integration</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Important Notes */}
        <Card className="mt-8 border-border/50 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              <span>Important Notes</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              <div className="p-3 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-200 dark:border-red-800">
                <strong className="text-red-800 dark:text-red-200">OAuth Limitation:</strong>
                <div className="text-red-700 dark:text-red-300 mt-1">
                  The redirect URI in your app points to TikTok's seller registration page, which is not designed for token extraction. 
                  This is why the OAuth button in the bot doesn't work properly.
                </div>
              </div>
              
              <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <strong className="text-blue-800 dark:text-blue-200">Token Format:</strong>
                <div className="text-blue-700 dark:text-blue-300 mt-1">
                  Access tokens typically start with "act." followed by a long string of characters.
                </div>
              </div>
              
              <div className="p-3 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
                <strong className="text-green-800 dark:text-green-200">Once You Have the Token:</strong>
                <div className="text-green-700 dark:text-green-300 mt-1">
                  Go to the "TikTok API" page in your bot, click "Enter Access Token Manually", paste the token, and click "Connect & Validate".
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}