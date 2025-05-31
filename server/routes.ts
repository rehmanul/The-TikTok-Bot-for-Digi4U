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

      // Set optimized timeouts for login verification
      page.setDefaultTimeout(15000);
      page.setDefaultNavigationTimeout(20000);
      
      // Try multiple URLs to verify login status, starting with most reliable
      const urlsToCheck = [
        'https://seller-uk.tiktok.com/compass',
        'https://seller-uk.tiktok.com/',
        'https://seller-uk.tiktok.com/university',
        'https://seller-uk.tiktok.com/dashboard'
      ];

      let isLoggedIn = false;
      let finalUrl = '';
      let verificationMethod = 'none';
      let lastError = null;

      for (let i = 0; i < urlsToCheck.length; i++) {
        const url = urlsToCheck[i];
        
        try {
          console.log(`Attempt ${i + 1}: Checking login status at: ${url}`);
          
          await page.goto(url, { 
            waitUntil: 'domcontentloaded',
            timeout: 20000 
          });
          
          // Wait for page to fully load and potential redirects
          await new Promise(resolve => setTimeout(resolve, 4000));
          
          finalUrl = page.url();
          console.log(`Final URL after navigation: ${finalUrl}`);
          
          // Enhanced login page detection
          const isOnLoginPage = finalUrl.includes('/login') || 
                               finalUrl.includes('/account/login') ||
                               finalUrl.includes('accounts.tiktok.com') ||
                               finalUrl.includes('auth.') ||
                               finalUrl.includes('/signin') ||
                               finalUrl.includes('/authenticate');
          
          if (!isOnLoginPage) {
            // Multi-layer verification approach
            
            // 1. Check for seller-specific elements
            try {
              const hasSellerElements = await Promise.race([
                page.evaluate(() => {
                  const sellerIndicators = [
                    '.seller-layout', '.seller-header', '.seller-nav', '.seller-sidebar',
                    '[data-testid*="seller"]', '.compass-layout', '.university-layout',
                    '.navigation-bar', '.main-content', '.sidebar-menu', '.seller-center',
                    '.dashboard-layout', '.nav-container', '.header-container'
                  ];
                  
                  const foundElements = sellerIndicators.filter(selector => 
                    document.querySelector(selector) !== null
                  );
                  
                  return foundElements.length > 0;
                }),
                new Promise(resolve => setTimeout(() => resolve(false), 5000))
              ]);

              if (hasSellerElements) {
                isLoggedIn = true;
                verificationMethod = 'element_detection';
                break;
              }
            } catch (evalError) {
              console.log('Element evaluation failed:', evalError);
            }

            // 2. Check for authentication tokens/cookies
            try {
              const hasAuthData = await Promise.race([
                page.evaluate(() => {
                  const cookieString = document.cookie;
                  const hasAuthCookies = cookieString.includes('sessionid') ||
                                       cookieString.includes('csrf') ||
                                       cookieString.includes('auth') ||
                                       cookieString.includes('token') ||
                                       cookieString.includes('tiktok_');
                  
                  const hasStorageAuth = !!(
                    localStorage.getItem('user') ||
                    localStorage.getItem('token') ||
                    sessionStorage.getItem('auth') ||
                    localStorage.getItem('tiktok_auth')
                  );
                  
                  return hasAuthCookies || hasStorageAuth;
                }),
                new Promise(resolve => setTimeout(() => resolve(false), 3000))
              ]);

              if (hasAuthData) {
                isLoggedIn = true;
                verificationMethod = 'auth_data_detection';
                break;
              }
            } catch (authError) {
              console.log('Auth data check failed:', authError);
            }

            // 3. Check page title and content for seller center indicators
            try {
              const hasSellerContent = await Promise.race([
                page.evaluate(() => {
                  const title = document.title.toLowerCase();
                  const hasSellerTitle = title.includes('seller') || 
                                       title.includes('center') || 
                                       title.includes('compass') ||
                                       title.includes('dashboard');
                  
                  const bodyText = document.body.innerText.toLowerCase();
                  const hasSellerText = bodyText.includes('seller center') ||
                                      bodyText.includes('dashboard') ||
                                      bodyText.includes('analytics') ||
                                      bodyText.includes('products');
                  
                  return hasSellerTitle || hasSellerText;
                }),
                new Promise(resolve => setTimeout(() => resolve(false), 3000))
              ]);

              if (hasSellerContent) {
                isLoggedIn = true;
                verificationMethod = 'content_analysis';
                break;
              }
            } catch (contentError) {
              console.log('Content analysis failed:', contentError);
            }

            // 4. Final check: if we're not on login page and URL looks right, assume logged in
            if (finalUrl.includes('seller-uk.tiktok.com') && !isOnLoginPage) {
              isLoggedIn = true;
              verificationMethod = 'url_analysis';
              break;
            }
          }
          
        } catch (navigationError) {
          lastError = navigationError;
          console.log(`Navigation to ${url} failed:`, navigationError.message);
          
          // If it's the last URL and all failed, continue to error handling
          if (i === urlsToCheck.length - 1) {
            throw navigationError;
          }
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
        
        res.json({ 
          success: true, 
          isLoggedIn: true,
          currentUrl: finalUrl,
          verificationMethod,
          elapsedTime,
          message: `Login verified successfully using ${verificationMethod}`
        });
      } else {
        await activityLogger.logUserAction("TikTok login verification failed", undefined, { 
          url: finalUrl, 
          method: verificationMethod,
          elapsedTime 
        });
        
        res.json({ 
          success: true, 
          isLoggedIn: false,
          currentUrl: finalUrl,
          verificationMethod,
          elapsedTime,
          message: 'Not logged in. Please complete the login process in TikTok Seller Center.'
        });
      }
      
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
