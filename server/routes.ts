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
    let puppeteerManager = null;
    const startTime = Date.now();
    
    try {
      // Get or create a puppeteer manager instance
      const { PuppeteerManager } = await import('./bot/puppeteer-manager');
      puppeteerManager = new PuppeteerManager();
      
      await puppeteerManager.initialize();
      
      // Navigate to seller center to check if logged in
      const page = puppeteerManager.getPage();
      if (!page) {
        throw new Error('Failed to initialize browser page');
      }

      // Set shorter timeouts for login verification
      page.setDefaultTimeout(10000);
      page.setDefaultNavigationTimeout(12000);
      
      // Try multiple URLs to verify login status
      const urlsToCheck = [
        'https://seller-uk.tiktok.com/',
        'https://seller-uk.tiktok.com/compass',
        'https://seller-uk.tiktok.com/university'
      ];

      let isLoggedIn = false;
      let finalUrl = '';
      let verificationMethod = 'none';

      for (const url of urlsToCheck) {
        try {
          console.log(`Checking login status at: ${url}`);
          
          await page.goto(url, { 
            waitUntil: 'domcontentloaded',
            timeout: 12000 
          });
          
          // Wait for potential redirects
          await new Promise(resolve => setTimeout(resolve, 3000));
          
          finalUrl = page.url();
          console.log(`Final URL after navigation: ${finalUrl}`);
          
          // Check if we're on a login page
          const isOnLoginPage = finalUrl.includes('/login') || 
                               finalUrl.includes('/account/login') ||
                               finalUrl.includes('accounts.tiktok.com') ||
                               finalUrl.includes('auth.');
          
          if (!isOnLoginPage) {
            // Try to find seller-specific elements that indicate successful login
            try {
              const hasSellerElements = await Promise.race([
                page.evaluate(() => {
                  // Look for seller center specific elements
                  const sellerIndicators = [
                    '.seller-layout',
                    '.seller-header', 
                    '.seller-nav',
                    '.seller-sidebar',
                    '[data-testid*="seller"]',
                    '.compass-layout',
                    '.university-layout',
                    '.navigation-bar',
                    '.main-content',
                    '.sidebar-menu'
                  ];
                  
                  const foundElements = sellerIndicators.filter(selector => 
                    document.querySelector(selector) !== null
                  );
                  
                  console.log('Found seller elements:', foundElements);
                  return foundElements.length > 0;
                }),
                new Promise(resolve => setTimeout(() => resolve(false), 4000))
              ]);

              if (hasSellerElements) {
                isLoggedIn = true;
                verificationMethod = 'element_detection';
                break;
              }
            } catch (evalError) {
              console.log('Element evaluation failed:', evalError);
            }

            // Additional check: try to access user info from page context
            try {
              const hasUserData = await Promise.race([
                page.evaluate(() => {
                  // Check for user data in common places
                  return !!(
                    window.localStorage.getItem('user') ||
                    window.sessionStorage.getItem('token') ||
                    document.cookie.includes('session') ||
                    document.cookie.includes('auth') ||
                    window.__INITIAL_STATE__?.user ||
                    window.userData
                  );
                }),
                new Promise(resolve => setTimeout(() => resolve(false), 3000))
              ]);

              if (hasUserData) {
                isLoggedIn = true;
                verificationMethod = 'user_data_detection';
                break;
              }
            } catch (userDataError) {
              console.log('User data check failed:', userDataError);
            }

            // If we made it here and we're not on login page, assume logged in
            if (!isOnLoginPage) {
              isLoggedIn = true;
              verificationMethod = 'url_analysis';
              break;
            }
          }
        } catch (navigationError) {
          console.log(`Navigation to ${url} failed:`, navigationError);
          continue;
        }
      }

      const elapsedTime = Date.now() - startTime;
      
      if (isLoggedIn) {
        await activityLogger.logUserAction("TikTok login verified successfully", undefined, { 
          url: finalUrl, 
          method: verificationMethod,
          elapsedTime 
        });
      } else {
        await activityLogger.logUserAction("TikTok login verification failed - not logged in", undefined, { 
          url: finalUrl, 
          method: verificationMethod,
          elapsedTime 
        });
      }
      
      res.json({ 
        success: true, 
        isLoggedIn,
        currentUrl: finalUrl,
        verificationMethod,
        elapsedTime,
        message: isLoggedIn ? 
          `Login verified successfully using ${verificationMethod}` : 
          'Please complete the login process in TikTok Seller Center and try again'
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
        message: "Unable to verify login status. Please ensure you completed the login process and try again."
      });
    } finally {
      // Always clean up the puppeteer instance
      if (puppeteerManager) {
        try {
          await puppeteerManager.cleanup();
        } catch (cleanupError) {
          console.error('Cleanup error:', cleanupError);
        }
      }
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
