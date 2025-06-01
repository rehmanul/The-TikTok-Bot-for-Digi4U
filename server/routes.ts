import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { SessionManager } from "./bot/session-manager";
import { ActivityLogger } from "./bot/activity-logger";
import { z } from "zod";

const sessionManager = new SessionManager();
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

  // Start bot session
  app.post("/api/bot/start", async (req: Request, res: Response) => {
    try {
      if (sessionManager.isSessionRunning()) {
        return res.status(400).json({ message: "Bot session is already running" });
      }

      const session = await sessionManager.startSession();
      await activityLogger.logUserAction("Started bot session");
      
      res.json({ 
        message: "Bot session started successfully",
        session 
      });
    } catch (error) {
      await activityLogger.logError(
        error instanceof Error ? error : new Error(String(error)),
        "Failed to start bot session"
      );
      res.status(500).json({ 
        message: "Failed to start bot session",
        error: error instanceof Error ? error.message : "Unknown error"
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
        email: user.email,
        imageUrl: user.imageUrl,
        role: 'Administrator'
      });
    } catch (error) {
      res.status(500).json({ 
        message: "Failed to fetch user data",
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
