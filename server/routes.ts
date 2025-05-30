import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { SessionManager } from "./bot/session-manager";
import { ActivityLogger } from "./bot/activity-logger";
import { z } from "zod";

const sessionManager = new SessionManager();
const activityLogger = new ActivityLogger();

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Dashboard metrics endpoint
  app.get("/api/dashboard/metrics", async (req, res) => {
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
  app.get("/api/bot/status", async (req, res) => {
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
  app.post("/api/bot/start", async (req, res) => {
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
  app.post("/api/bot/pause", async (req, res) => {
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
  app.post("/api/bot/resume", async (req, res) => {
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
  app.post("/api/bot/stop", async (req, res) => {
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
  app.get("/api/bot/config", async (req, res) => {
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
  app.put("/api/bot/config", async (req, res) => {
    try {
      const configSchema = z.object({
        minFollowers: z.number().min(0).optional(),
        maxFollowers: z.number().min(0).optional(),
        dailyLimit: z.number().min(1).max(10000).optional(),
        actionDelay: z.number().min(1000).max(300000).optional(),
        categories: z.array(z.string()).optional(),
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
  app.get("/api/activities", async (req, res) => {
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
  app.get("/api/activities/summary", async (req, res) => {
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
  app.get("/api/creators", async (req, res) => {
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
  app.get("/api/creators/stats", async (req, res) => {
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
  app.post("/api/bot/emergency-stop", async (req, res) => {
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

  // Check login status endpoint
  app.post("/api/bot/check-login", async (req, res) => {
    try {
      // Initialize browser and check if we can access TikTok Seller Center
      const puppeteerManager = sessionManager['puppeteerManager'] || new (await import('./bot/puppeteer-manager')).PuppeteerManager();
      
      await puppeteerManager.initialize();
      
      // Navigate to seller center to check if logged in
      await puppeteerManager['page']?.goto('https://seller-uk.tiktok.com/compass', { 
        waitUntil: 'networkidle2',
        timeout: 10000 
      });
      
      const currentUrl = puppeteerManager['page']?.url() || '';
      const isLoggedIn = !currentUrl.includes('/login') && !currentUrl.includes('/account/login');
      
      if (isLoggedIn) {
        await activityLogger.logUserAction("TikTok login verified successfully");
      }
      
      res.json({ 
        success: true, 
        isLoggedIn,
        currentUrl 
      });
      
    } catch (error) {
      await activityLogger.logError(
        error instanceof Error ? error : new Error(String(error)),
        "Failed to check login status"
      );
      res.json({ 
        success: false, 
        isLoggedIn: false,
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Health check endpoint
  app.get("/api/health", async (req, res) => {
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
