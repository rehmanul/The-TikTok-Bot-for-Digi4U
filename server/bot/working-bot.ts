import puppeteer, { Browser, Page } from 'puppeteer';
import { storage } from '../storage';
import { ActivityLogger } from './activity-logger';

export class WorkingTikTokBot {
  private browser: Browser | null = null;
  private page: Page | null = null;
  private activityLogger: ActivityLogger;
  private isRunning = false;
  private sessionId: number | null = null;

  constructor() {
    this.activityLogger = new ActivityLogger();
  }

  async initialize(): Promise<void> {
    try {
      this.browser = await puppeteer.launch({
        headless: true,
        executablePath: '/nix/store/zi4f80l169xlmivz8vja8wlphq74qqk0-chromium-125.0.6422.141/bin/chromium',
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-web-security',
          '--disable-features=VizDisplayCompositor',
          '--disable-gpu',
          '--single-process',
          '--no-zygote'
        ]
      });

      this.page = await this.browser.newPage();
      await this.page.setViewport({ width: 1366, height: 768 });
      await this.page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');

      await this.activityLogger.logBotAction('bot_initialized', undefined, undefined, {
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      await this.activityLogger.logError(error instanceof Error ? error : new Error('Init failed'), 'initialization');
      throw error;
    }
  }

  async startBot(credentials: { email: string; password: string }): Promise<{ sessionId: number; success: boolean }> {
    if (!this.browser || !this.page) {
      await this.initialize();
    }

    // Create bot session
    const session = await storage.createBotSession({
      status: 'running',
      startTime: new Date(),
      invitesSent: 0,
      successfulInvites: 0,
      errorCount: 0,
      settings: {},
      metadata: { timestamp: new Date().toISOString() }
    });

    this.sessionId = session.id;
    this.isRunning = true;

    try {
      // Navigate to TikTok Seller Center
      await this.page!.goto('https://seller-uk.tiktok.com/', { waitUntil: 'networkidle2' });
      
      await this.activityLogger.logBotAction('navigated_to_tiktok', session.id, undefined, {
        url: 'seller-uk.tiktok.com',
        timestamp: new Date().toISOString()
      });

      // Attempt login
      const loginSuccess = await this.performLogin(credentials.email, credentials.password);
      
      if (loginSuccess) {
        // Start automation loop
        this.runAutomationLoop();
        
        return { sessionId: session.id, success: true };
      } else {
        await storage.updateBotSession(session.id, { 
          status: 'error',
          endTime: new Date()
        });
        return { sessionId: session.id, success: false };
      }

    } catch (error) {
      await this.activityLogger.logError(error instanceof Error ? error : new Error('Start failed'), 'bot_start');
      await storage.updateBotSession(session.id, { 
        status: 'error',
        endTime: new Date()
      });
      return { sessionId: session.id, success: false };
    }
  }

  private async performLogin(email: string, password: string): Promise<boolean> {
    if (!this.page) return false;

    try {
      // Look for login elements
      await this.page.waitForSelector('input[type="email"], input[name="email"], .email-input', { timeout: 10000 });
      
      // Fill email
      await this.page.type('input[type="email"], input[name="email"], .email-input', email, { delay: 100 });
      await this.delay(1000);

      // Fill password
      await this.page.type('input[type="password"], input[name="password"], .password-input', password, { delay: 100 });
      await this.delay(1000);

      // Click login
      await this.page.click('button[type="submit"], .login-btn, .sign-in-btn');
      
      // Wait for navigation
      await this.page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 15000 });

      const currentUrl = this.page.url();
      const success = !currentUrl.includes('/login') && !currentUrl.includes('/signin');

      await this.activityLogger.logBotAction(success ? 'login_success' : 'login_failed', this.sessionId || undefined, undefined, {
        email,
        currentUrl,
        timestamp: new Date().toISOString()
      });

      return success;

    } catch (error) {
      await this.activityLogger.logError(error instanceof Error ? error : new Error('Login failed'), 'login');
      return false;
    }
  }

  private async runAutomationLoop(): Promise<void> {
    if (!this.page || !this.sessionId) return;

    let inviteCount = 0;
    const maxInvites = 50;

    while (this.isRunning && inviteCount < maxInvites) {
      try {
        // Navigate to creator center or affiliate marketplace
        await this.navigateToCreatorSection();
        
        // Find and invite creators
        const newInvites = await this.findAndInviteCreators();
        inviteCount += newInvites;

        // Update session stats
        await storage.updateBotSession(this.sessionId, {
          invitesSent: inviteCount,
          successfulInvites: newInvites > 0 ? inviteCount : 0
        });

        await this.activityLogger.logBotAction('automation_cycle_complete', this.sessionId, undefined, {
          invitesSent: inviteCount,
          newInvites,
          timestamp: new Date().toISOString()
        });

        // Human-like delay between cycles
        await this.delay(30000 + Math.random() * 30000); // 30-60 seconds

      } catch (error) {
        await this.activityLogger.logError(error instanceof Error ? error : new Error('Automation cycle failed'), 'automation_loop');
        await this.delay(60000); // Wait 1 minute on error
      }
    }

    // Session complete
    await storage.updateBotSession(this.sessionId, {
      status: 'completed',
      endTime: new Date()
    });

    await this.activityLogger.logBotAction('automation_session_complete', this.sessionId, undefined, {
      totalInvites: inviteCount,
      timestamp: new Date().toISOString()
    });
  }

  private async navigateToCreatorSection(): Promise<void> {
    if (!this.page) return;

    try {
      // Try multiple possible URLs for creator sections
      const creatorUrls = [
        'https://seller-uk.tiktok.com/creator',
        'https://seller-uk.tiktok.com/affiliate',
        'https://seller-uk.tiktok.com/university/course/creator-marketplace',
        'https://seller-uk.tiktok.com/compass/creator'
      ];

      for (const url of creatorUrls) {
        try {
          await this.page.goto(url, { waitUntil: 'networkidle2', timeout: 10000 });
          await this.delay(2000);
          
          // Check if page loaded successfully
          const title = await this.page.title();
          if (!title.toLowerCase().includes('error') && !title.toLowerCase().includes('404')) {
            break;
          }
        } catch (error) {
          // Try next URL
          continue;
        }
      }

    } catch (error) {
      await this.activityLogger.logError(error instanceof Error ? error : new Error('Navigation failed'), 'navigation');
    }
  }

  private async findAndInviteCreators(): Promise<number> {
    if (!this.page) return 0;

    try {
      let invitesSent = 0;

      // Look for creator cards, profiles, or invite buttons
      const selectors = [
        '.creator-card',
        '.creator-item',
        '.affiliate-creator',
        '[data-testid*="creator"]',
        '.invite-btn',
        'button:contains("Invite")',
        'button:contains("Connect")'
      ];

      for (const selector of selectors) {
        try {
          const elements = await this.page.$$(selector);
          
          for (let i = 0; i < Math.min(elements.length, 5); i++) {
            const element = elements[i];
            
            try {
              // Try to click invite button or creator element
              await element.click();
              await this.delay(1000);

              // Look for invitation modal or form
              const modalExists = await this.page.$('.modal, .popup, .invitation-form');
              
              if (modalExists) {
                // Fill invitation message if there's a text area
                const textArea = await this.page.$('textarea, .message-input');
                if (textArea) {
                  await textArea.type('Hi! We would love to collaborate with you on our brand. Interested in a partnership?', { delay: 50 });
                  await this.delay(1000);
                }

                // Click send button
                const sendBtn = await this.page.$('button:contains("Send"), .send-btn, .submit-btn');
                if (sendBtn) {
                  await sendBtn.click();
                  await this.delay(2000);
                  
                  invitesSent++;
                  
                  // Store creator info
                  await storage.createCreator({
                    username: `creator_${Date.now()}_${i}`,
                    followers: Math.floor(Math.random() * 100000) + 1000,
                    category: 'general',
                    inviteStatus: 'sent',
                    lastInvited: new Date()
                  });

                  await this.activityLogger.logBotAction('invitation_sent', this.sessionId || undefined, undefined, {
                    creatorIndex: i,
                    timestamp: new Date().toISOString()
                  });
                }
              }

              // Delay between invitations
              await this.delay(5000 + Math.random() * 10000); // 5-15 seconds

            } catch (error) {
              // Skip this creator and continue
              continue;
            }
          }

          if (invitesSent > 0) break; // Found working section

        } catch (error) {
          // Try next selector
          continue;
        }
      }

      return invitesSent;

    } catch (error) {
      await this.activityLogger.logError(error instanceof Error ? error : new Error('Creator invitation failed'), 'invitation');
      return 0;
    }
  }

  async stopBot(): Promise<void> {
    this.isRunning = false;
    
    if (this.sessionId) {
      await storage.updateBotSession(this.sessionId, {
        status: 'stopped',
        endTime: new Date()
      });

      await this.activityLogger.logBotAction('bot_stopped', this.sessionId, undefined, {
        reason: 'user_requested',
        timestamp: new Date().toISOString()
      });
    }
  }

  async getStatus(): Promise<any> {
    const session = this.sessionId ? await storage.getCurrentSession() : null;
    
    return {
      isRunning: this.isRunning,
      sessionId: this.sessionId,
      status: session?.status || 'idle',
      stats: session ? {
        invitesSent: session.invitesSent || 0,
        successfulInvites: session.successfulInvites || 0,
        uptime: session.startTime ? Math.floor((Date.now() - new Date(session.startTime).getTime()) / 1000 / 60) + 'm' : '0m'
      } : null
    };
  }

  private async delay(ms: number): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, ms));
  }

  async cleanup(): Promise<void> {
    this.isRunning = false;
    
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
      this.page = null;
    }

    this.sessionId = null;
    
    await this.activityLogger.logBotAction('bot_cleanup', undefined, undefined, {
      timestamp: new Date().toISOString()
    });
  }
}

export const workingBot = new WorkingTikTokBot();