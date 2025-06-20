import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { SessionManager } from "./bot/session-manager";
import TikTokSessionManager from "./services/tiktok-session-manager";
import { ActivityLogger } from "./bot/activity-logger";
import { workingBot } from "./bot/working-bot";
import { z } from "zod";

const sessionManager = new SessionManager();
const tikTokSessionManager = new TikTokSessionManager();
const activityLogger = new ActivityLogger();

export async function registerRoutes(app: Express): Promise<Server> {

  // Dashboard metrics endpoint
  app.get("/api/dashboard/metrics", async (req: Request, res: Response) => {
    try {
      const metrics = await storage.getDashboardMetrics();
      res.json(metrics);
    } catch (error) {
      res.status(500).json({ 
        message: "Failed to fetch dashboard metrics",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Bot status endpoint
  app.get("/api/bot/status", async (req: Request, res: Response) => {
    try {
      const status = await storage.getBotStatus();
      const sessionStatus = await sessionManager.getStatus();

      res.json({
        ...status,
        session: sessionStatus,
      });
    } catch (error) {
      res.status(500).json({ 
        message: "Failed to fetch bot status",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Real working bot routes
  app.post('/api/bot/start-real', async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ 
          message: "Email and password are required for TikTok login" 
        });
      }

      const result = await workingBot.startBot({ email, password });
      
      await activityLogger.logBotAction('real_bot_started', result.sessionId, undefined, {
        success: result.success,
        timestamp: new Date().toISOString()
      });

      res.json({
        success: result.success,
        sessionId: result.sessionId,
        message: result.success 
          ? "Real TikTok bot started successfully! It will now begin finding and inviting creators automatically."
          : "Failed to start bot. Check your TikTok credentials."
      });
    } catch (error) {
      res.status(500).json({ 
        message: "Failed to start real bot",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  app.post('/api/bot/stop-real', async (req: Request, res: Response) => {
    try {
      await workingBot.stopBot();
      
      await activityLogger.logBotAction('real_bot_stopped', undefined, undefined, {
        reason: 'user_requested',
        timestamp: new Date().toISOString()
      });

      res.json({
        success: true,
        message: "Real TikTok bot stopped successfully"
      });
    } catch (error) {
      res.status(500).json({ 
        message: "Failed to stop real bot",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  app.get('/api/bot/status-real', async (req: Request, res: Response) => {
    try {
      const status = await workingBot.getStatus();
      res.json(status);
    } catch (error) {
      res.status(500).json({ 
        message: "Failed to get real bot status",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Bot control routes
  app.post('/api/bot/start', async (req, res) => {
    try {
      const { SessionManager } = await import('./bot/session-manager');
      const sessionManager = new SessionManager();
      await sessionManager.startSession();
      res.json({ success: true, message: 'Bot session started successfully' });
    } catch (error) {
      await activityLogger.logError(error as Error, 'start_bot_session');
      res.status(500).json({ 
        message: 'Failed to start bot session', 
        error: (error as Error).message 
      });
    }
  });

  app.post('/api/bot/start-api', async (req, res) => {
    try {
      const { TikTokSessionManager } = await import('./services/tiktok-session-manager');
      const tiktokManager = new TikTokSessionManager();
      const isValid = await tiktokManager.validateConnection();

      if (!isValid) {
        return res.status(400).json({ 
          success: false, 
          message: 'TikTok API connection is not valid. Please connect first.' 
        });
      }

      // Start the API session
      await tiktokManager.startAPISession();
      await activityLogger.logBotAction('api_session_started', undefined, undefined, { timestamp: new Date().toISOString() });

      res.json({ success: true, message: 'TikTok API session started successfully' });
    } catch (error) {
      await activityLogger.logError(error as Error, 'start_api_session');
      res.status(500).json({ 
        success: false,
        message: 'Failed to start API session', 
        error: (error as Error).message 
      });
    }
  });

  app.post('/api/bot/stop-api', async (req, res) => {
    try {
      const { TikTokSessionManager } = await import('./services/tiktok-session-manager');
      const tiktokManager = new TikTokSessionManager();
      await tiktokManager.stopAPISession();
      await activityLogger.logBotAction('api_session_stopped', undefined, undefined, { timestamp: new Date().toISOString() });

      res.json({ success: true, message: 'TikTok API session stopped successfully' });
    } catch (error) {
      await activityLogger.logError(error as Error, 'stop_api_session');
      res.status(500).json({ 
        success: false,
        message: 'Failed to stop API session', 
        error: (error as Error).message 
      });
    }
  });

  // Pause bot session
  app.post("/api/bot/pause", async (req: Request, res: Response) => {
    try {
      await sessionManager.pauseSession();
      await activityLogger.logUserAction("Paused bot session");

      res.json({ message: "Bot session paused successfully" });
    } catch (error) {
      await activityLogger.logError(
        error instanceof Error ? error : new Error(String(error)),
        "Failed to pause bot session"
      );
      res.status(500).json({ 
        message: "Failed to pause bot session",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Resume bot session
  app.post("/api/bot/resume", async (req: Request, res: Response) => {
    try {
      await sessionManager.resumeSession();
      await activityLogger.logUserAction("Resumed bot session");

      res.json({ message: "Bot session resumed successfully" });
    } catch (error) {
      await activityLogger.logError(
        error instanceof Error ? error : new Error(String(error)),
        "Failed to resume bot session"
      );
      res.status(500).json({ 
        message: "Failed to resume bot session",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Stop bot session
  app.post("/api/bot/stop", async (req: Request, res: Response) => {
    try {
      await sessionManager.stopSession("Manual stop requested");
      await activityLogger.logUserAction("Stopped bot session");

      res.json({ message: "Bot session stopped successfully" });
    } catch (error) {
      await activityLogger.logError(
        error instanceof Error ? error : new Error(String(error)),
        "Failed to stop bot session"
      );
      res.status(500).json({ 
        message: "Failed to stop bot session",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Get bot configuration
  app.get("/api/bot/config", async (req: Request, res: Response) => {
    try {
      const config = await storage.getBotConfig();
      if (!config) {
        return res.status(404).json({ message: "Bot configuration not found" });
      }
      res.json(config);
    } catch (error) {
      res.status(500).json({ 
        message: "Failed to fetch bot configuration",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Update bot configuration
  app.put("/api/bot/config", async (req: Request, res: Response) => {
    try {
      const configSchema = z.object({
        minFollowers: z.number().min(0).optional(),
        maxFollowers: z.number().min(0).optional(),
        dailyLimit: z.number().min(1).max(10000).optional(),
        actionDelay: z.number().min(1000).max(300000).optional(),
        categories: z.array(z.string()).optional(),
        subCategories: z.array(z.string()).optional(),
        productNames: z.array(z.string()).optional(),
        isActive: z.boolean().optional(),
      });

      const validatedConfig = configSchema.parse(req.body);

      // Validate that maxFollowers > minFollowers if both are provided
      if (validatedConfig.minFollowers && validatedConfig.maxFollowers) {
        if (validatedConfig.maxFollowers <= validatedConfig.minFollowers) {
          return res.status(400).json({ 
            message: "Maximum followers must be greater than minimum followers" 
          });
        }
      }

      const updatedConfig = await storage.updateBotConfig(validatedConfig);
      await activityLogger.logUserAction("Updated bot configuration", undefined, validatedConfig);

      res.json(updatedConfig);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Invalid configuration data",
          errors: error.errors 
        });
      }

      await activityLogger.logError(
        error instanceof Error ? error : new Error(String(error)),
        "Failed to update bot configuration"
      );
      res.status(500).json({ 
        message: "Failed to update bot configuration",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Get recent activities
  app.get("/api/activities", async (req: Request, res: Response) => {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const activities = await storage.getRecentActivities(Math.min(limit, 200));
      res.json(activities);
    } catch (error) {
      res.status(500).json({ 
        message: "Failed to fetch activities",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Get activity summary
  app.get("/api/activities/summary", async (req: Request, res: Response) => {
    try {
      const hours = parseInt(req.query.hours as string) || 24;
      const summary = await activityLogger.getActivitySummary(hours);
      res.json(summary);
    } catch (error) {
      res.status(500).json({ 
        message: "Failed to fetch activity summary",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Get creators
  app.get("/api/creators", async (req: Request, res: Response) => {
    try {
      const limit = parseInt(req.query.limit as string) || 20;
      const creators = await storage.getCreatorsForInvitation(limit);
      res.json(creators);
    } catch (error) {
      res.status(500).json({ 
        message: "Failed to fetch creators",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Get creator statistics
  app.get("/api/creators/stats", async (req: Request, res: Response) => {
    try {
      const stats = await storage.getCreatorStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ 
        message: "Failed to fetch creator statistics",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Emergency stop endpoint
  app.post("/api/bot/emergency-stop", async (req: Request, res: Response) => {
    try {
      await sessionManager.stopSession("Emergency stop activated");
      await activityLogger.logUserAction("Emergency stop activated");

      res.json({ message: "Emergency stop activated successfully" });
    } catch (error) {
      await activityLogger.logError(
        error instanceof Error ? error : new Error(String(error)),
        "Failed to execute emergency stop"
      );
      res.status(500).json({ 
        message: "Failed to execute emergency stop",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Check login status endpoint (Test Mode)
  app.post("/api/bot/check-login", async (req: Request, res: Response) => {
    const startTime = Date.now();

    try {
      // In test mode, simulate successful login verification
      const elapsedTime = Date.now() - startTime;

      // Update the session manager's login status
      sessionManager.setLoginStatus(true);

      await activityLogger.logUserAction("TikTok login verified successfully (Test Mode)", undefined, { 
        testMode: true,
        elapsedTime 
      });

      res.json({ 
        success: true, 
        isLoggedIn: true,
        currentUrl: 'https://seller-uk.tiktok.com/dashboard',
        verificationMethod: 'test_mode',
        elapsedTime,
        message: 'Login verified successfully in test mode'
      });

    } catch (error) {
      const elapsedTime = Date.now() - startTime;
      console.error('Login check error:', error);

      await activityLogger.logError(
        error instanceof Error ? error : new Error(String(error)),
        "Failed to check login status",
        { elapsedTime }
      );

      res.json({ 
        success: false, 
        isLoggedIn: false,
        error: error instanceof Error ? error.message : "Unknown error",
        elapsedTime,
        message: "Unable to verify login status. Please try again or contact support if the issue persists."
      });
    }
  });

  // Get current user endpoint
  app.get("/api/user/current", async (req: Request, res: Response) => {
    try {
      const user = await storage.getUser(1); // Get default user
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json({
        name: 'Digi4U Repair',
        email: 'rehman.sho@gmail.com',
        role: 'Administrator'
      });
    } catch (error) {
      res.status(500).json({ 
        message: "Failed to fetch user data",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // TikTok API OAuth endpoints
  app.get("/api/tiktok/auth-url", async (req: Request, res: Response) => {
    try {
      const baseUrl = process.env.REPL_URL || `${req.protocol}://${req.get('host')}`;
      const redirectUri = `${baseUrl}/oauth-callback`;
      const appId = process.env.TIKTOK_APP_ID || '7512649815700963329';
      const authUrl = `https://business-api.tiktok.com/portal/auth?app_id=${appId}&state=auth_request&redirect_uri=${encodeURIComponent(redirectUri)}&scope=user.info.basic,business.get`;
      res.json({ authUrl });
    } catch (error) {
      res.status(500).json({ 
        message: "Failed to generate auth URL",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  app.post("/api/tiktok/oauth/callback", async (req: Request, res: Response) => {
    try {
      const { code } = req.body;
      if (!code) {
        return res.status(400).json({ message: "Authorization code is required" });
      }

      const accessToken = await tikTokSessionManager.handleOAuthCallback(code);
      res.json({ 
        success: true, 
        message: "TikTok API connected successfully",
        hasToken: !!accessToken
      });
    } catch (error) {
      res.status(500).json({ 
        message: "OAuth callback failed",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  app.post("/api/tiktok/exchange-code", async (req: Request, res: Response) => {
    try {
      const { authorizationCode } = req.body;

      if (!authorizationCode) {
        return res.status(400).json({ 
          success: false,
          message: "Authorization code is required"
        });
      }

      // Extract code from URL if full URL provided
      let code = authorizationCode;
      if (code.includes('code=')) {
        const urlParams = new URLSearchParams(code.split('?')[1]);
        code = urlParams.get('code') || '';
      }

      if (!code) {
        return res.status(400).json({ 
          success: false,
          message: "Could not extract authorization code"
        });
      }

      // Exchange code for access token using TikTok API
      const response = await fetch('https://business-api.tiktok.com/open_api/v1.3/oauth2/access_token/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          app_id: process.env.TIKTOK_APP_ID || '7512649815700963329',
          secret: process.env.TIKTOK_APP_SECRET || 'e448a875d92832486230db13be28db0444035303',
          auth_code: code,
          grant_type: 'authorization_code'
        })
      });

      const tokenData = await response.json();

      if (tokenData.code === 0 && tokenData.data?.access_token) {
        // Set the access token in the session manager
        tikTokSessionManager.updateAccessToken(tokenData.data.access_token);

        // Validate the token
        const isValid = await tikTokSessionManager.validateConnection();

        if (isValid) {
          res.json({
            success: true,
            message: "Access token obtained and validated successfully",
            token: tokenData.data.access_token.substring(0, 20) + "..."
          });
        } else {
          res.status(400).json({
            success: false,
            message: "Token obtained but validation failed"
          });
        }
      } else {
        res.status(400).json({
          success: false,
          message: tokenData.message || "Failed to obtain access token",
          error: tokenData
        });
      }
    } catch (error) {
      res.status(500).json({ 
        success: false,
        message: "Failed to exchange authorization code",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  app.post("/api/tiktok/set-token", async (req: Request, res: Response) => {
    try {
      const { access_token } = req.body;
      if (!access_token) {
        return res.status(400).json({ message: "Access token is required" });
      }

      // Set the access token in the TikTok API service
      tikTokSessionManager.updateAccessToken(access_token);

      // Validate the token
      const isValid = await tikTokSessionManager.validateConnection();

      if (isValid) {
        res.json({ 
          success: true, 
          message: "Access token set and validated successfully"
        });
      } else {
        res.status(400).json({ 
          success: false,
          message: "Invalid access token provided"
        });
      }
    } catch (error) {
      res.status(500).json({ 
        message: "Failed to set access token",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  app.get("/api/tiktok/validate", async (req: Request, res: Response) => {
    try {
      const isValid = await tikTokSessionManager.validateConnection();
      res.json({ valid: isValid });
    } catch (error) {
      res.status(500).json({ 
        message: "Validation failed",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  app.get("/api/tiktok/invitation-history", async (req: Request, res: Response) => {
    try {
      const history = await tikTokSessionManager.getInvitationHistory();
      res.json(history);
    } catch (error) {
      res.status(500).json({ 
        message: "Failed to fetch invitation history",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  app.get("/api/tiktok/metrics", async (req: Request, res: Response) => {
    try {
      const metrics = await tikTokSessionManager.getCampaignMetrics();
      res.json(metrics || {});
    } catch (error) {
      res.status(500).json({ 
        message: "Failed to fetch campaign metrics",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Enhanced bot start with API mode selection
  app.post("/api/bot/start-api", async (req: Request, res: Response) => {
    try {
      const session = await tikTokSessionManager.startSession();
      res.json({ 
        success: true, 
        session,
        mode: 'api',
        message: 'Bot started using TikTok Official API'
      });
    } catch (error) {
      res.status(500).json({ 
        message: "Failed to start API session",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  app.post("/api/bot/stop-api", async (req: Request, res: Response) => {
    try {
      await tikTokSessionManager.stopSession('manual');
      res.json({ 
        success: true,
        message: 'API session stopped successfully'
      });
    } catch (error) {
      res.status(500).json({ 
        message: "Failed to stop API session",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Health check endpoint
  app.get("/api/health", async (req: Request, res: Response) => {
    try {
      const status = await sessionManager.getStatus();
      res.json({
        status: "healthy",
        timestamp: new Date().toISOString(),
        bot: status,
        uptime: process.uptime(),
      });
    } catch (error) {
      res.status(500).json({
        status: "unhealthy",
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}