import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { apiRequest } from '@/lib/queryClient';

export default function OAuthCallback() {
  const [, setLocation] = useLocation();

  useEffect(() => {
    const handleCallback = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');
      const state = urlParams.get('state');
      const error = urlParams.get('error');

      if (error) {
        // Send error message to parent window
        if (window.opener) {
          window.opener.postMessage({
            type: 'TIKTOK_OAUTH_ERROR',
            error: error
          }, window.location.origin);
          window.close();
        } else {
          setLocation('/tiktok-api?error=' + encodeURIComponent(error));
        }
        return;
      }

      if (code) {
        try {
          // Exchange code for access token
          const response = await fetch('/api/tiktok/oauth/callback', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ code, state })
          });

          const data = await response.json();

          if (data.success) {
            // Send success message to parent window
            if (window.opener) {
              window.opener.postMessage({
                type: 'TIKTOK_OAUTH_SUCCESS',
                data: data
              }, window.location.origin);
              window.close();
            } else {
              setLocation('/tiktok-api?success=true');
            }
          } else {
            throw new Error(data.error || 'OAuth callback failed');
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          
          if (window.opener) {
            window.opener.postMessage({
              type: 'TIKTOK_OAUTH_ERROR',
              error: errorMessage
            }, window.location.origin);
            window.close();
          } else {
            setLocation('/tiktok-api?error=' + encodeURIComponent(errorMessage));
          }
        }
      } else {
        // No code or error, redirect to TikTok API page
        if (window.opener) {
          window.opener.postMessage({
            type: 'TIKTOK_OAUTH_ERROR',
            error: 'No authorization code received'
          }, window.location.origin);
          window.close();
        } else {
          setLocation('/tiktok-api');
        }
      }
    };

    handleCallback();
  }, [setLocation]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Processing TikTok authorization...</p>
      </div>
    </div>
  );
}