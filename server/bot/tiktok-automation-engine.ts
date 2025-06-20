import puppeteer, { Browser, Page } from 'puppeteer';
import { storage } from '../storage';
import { ActivityLogger } from './activity-logger';
import type { BotSession, BotConfig, Creator, InsertCreator } from '@shared/schema';

export class TikTokAutomationEngine {
  private browser: Browser | null = null;
  private page: Page | null = null;
  private activityLogger: ActivityLogger;
  private isRunning = false;
  private currentSession: BotSession | null = null;

  constructor() {
    this.activityLogger = new ActivityLogger();
  }

  async initialize(): Promise<void> {
    try {
      this.browser = await puppeteer.launch({
        headless: false,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--single-process',
          '--disable-gpu'
        ]
      });

      this.page = await this.browser.newPage();
      
      // Set realistic viewport and user agent
      await this.page.setViewport({ width: 1366, height: 768 });
      await this.page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

      await this.activityLogger.logBotAction('automation_engine_initialized', undefined, undefined, {
        browser: 'puppeteer',
        headless: false,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      await this.activityLogger.logError(error instanceof Error ? error : new Error('Failed to initialize automation engine'), 'initialization');
      throw error;
    }
  }

  async loginToTikTok(email: string, password: string): Promise<boolean> {
    if (!this.page) {
      throw new Error('Browser not initialized');
    }

    try {
      await this.activityLogger.logBotAction('login_attempt', undefined, undefined, {
        email,
        timestamp: new Date().toISOString()
      });

      // Navigate to TikTok Business login
      await this.page.goto('https://seller-uk.tiktok.com/account/login', { 
        waitUntil: 'networkidle2',
        timeout: 30000 
      });

      // Wait for login form
      await this.page.waitForSelector('input[type="email"], input[name="email"]', { timeout: 10000 });

      // Fill email
      await this.humanType('input[type="email"], input[name="email"]', email);
      await this.humanDelay(1000, 2000);

      // Fill password
      await this.humanType('input[type="password"], input[name="password"]', password);
      await this.humanDelay(1000, 2000);

      // Click login button
      const loginButton = await this.page.$('button[type="submit"], .login-btn, [data-testid="login-submit"]');
      if (loginButton) {
        await this.humanClick(loginButton);
      }

      // Wait for navigation or error
      await this.page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 15000 });

      // Check if login was successful
      const currentUrl = this.page.url();
      const loginSuccess = !currentUrl.includes('/login') && !currentUrl.includes('/signin');

      if (loginSuccess) {
        await this.activityLogger.logBotAction('login_success', undefined, undefined, {
          redirectUrl: currentUrl,
          timestamp: new Date().toISOString()
        });
      } else {
        await this.activityLogger.logBotAction('login_failed', undefined, undefined, {
          currentUrl,
          timestamp: new Date().toISOString()
        });
      }

      return loginSuccess;

    } catch (error) {
      await this.activityLogger.logError(error instanceof Error ? error : new Error('Login failed'), 'login_process');
      return false;
    }
  }

  async startAutomatedInvitations(sessionId: number): Promise<void> {
    if (!this.page) {
      throw new Error('Browser not initialized');
    }

    this.isRunning = true;
    this.currentSession = (await storage.getCurrentSession()) || null;
    
    const config = await storage.getBotConfig();
    if (!config) {
      throw new Error('Bot configuration not found');
    }

    try {
      await this.activityLogger.logBotAction('automated_invitations_started', sessionId, undefined, {
        dailyLimit: config.dailyLimit,
        timestamp: new Date().toISOString()
      });

      let invitesSentToday = 0;
      const maxInvites = config.dailyLimit || 50;

      while (this.isRunning && invitesSentToday < maxInvites) {
        try {
          // Navigate to creator marketplace
          await this.navigateToCreatorMarketplace();
          
          // Find creators to invite
          const creators = await this.discoverCreators();
          
          for (const creator of creators) {
            if (!this.isRunning || invitesSentToday >= maxInvites) break;

            const success = await this.sendInvitationToCreator(creator);
            
            if (success) {
              invitesSentToday++;
              await this.updateSessionStats(sessionId, invitesSentToday, true);
              
              // Human-like delay between invitations (30-90 seconds)
              await this.humanDelay(30000, 90000);
            } else {
              await this.updateSessionStats(sessionId, invitesSentToday, false);
              // Shorter delay on failure
              await this.humanDelay(10000, 20000);
            }
          }

          // If no creators found, wait longer before retrying
          if (creators.length === 0) {
            await this.humanDelay(120000, 180000); // 2-3 minutes
          }

        } catch (error) {
          await this.activityLogger.logError(error instanceof Error ? error : new Error('Error in invitation loop'), 'invitation_loop');
          await this.humanDelay(60000, 120000); // Wait 1-2 minutes on error
        }
      }

      await this.activityLogger.logBotAction('automated_invitations_completed', sessionId, undefined, {
        totalInvitesSent: invitesSentToday,
        maxReached: invitesSentToday >= maxInvites,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      await this.activityLogger.logError(error instanceof Error ? error : new Error('Failed to start automated invitations'), 'automation_start');
      throw error;
    }
  }

  private async navigateToCreatorMarketplace(): Promise<void> {
    if (!this.page) return;

    try {
      // Navigate to TikTok Shop Creator Marketplace
      await this.page.goto('https://seller-uk.tiktok.com/university/course/creator-marketplace', {
        waitUntil: 'networkidle2',
        timeout: 30000
      });

      // Wait for the page to load
      await this.humanDelay(2000, 4000);

      await this.activityLogger.logBotAction('navigated_to_creator_marketplace', this.currentSession?.id, undefined, {
        url: this.page.url(),
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      await this.activityLogger.logError(error instanceof Error ? error : new Error('Failed to navigate to creator marketplace'), 'navigation');
      throw error;
    }
  }

  private async discoverCreators(): Promise<Creator[]> {
    if (!this.page) return [];

    try {
      const creators: Creator[] = [];

      // Look for creator cards or profiles on the page
      const creatorElements = await this.page.$$('.creator-card, .creator-profile, [data-testid*="creator"]');

      for (let i = 0; i < Math.min(creatorElements.length, 10); i++) {
        const element = creatorElements[i];
        
        try {
          const username = await element.$eval('.username, .creator-name', el => el.textContent?.trim() || '');
          const followersText = await element.$eval('.followers, .follower-count', el => el.textContent?.trim() || '0');
          const category = await element.$eval('.category, .creator-category', el => el.textContent?.trim() || 'general');

          if (username) {
            const followerCount = this.parseFollowerCount(followersText);
            
            const creator: Creator = {
              id: Date.now() + i, // Temporary ID
              username,
              displayName: username,
              followerCount,
              category,
              inviteStatus: 'pending',
              lastInviteDate: null,
              createdAt: new Date(),
              updatedAt: new Date()
            };

            creators.push(creator);
          }
        } catch (error) {
          // Skip this creator if we can't parse their info
          continue;
        }
      }

      await this.activityLogger.logBotAction('creators_discovered', this.currentSession?.id, undefined, {
        count: creators.length,
        timestamp: new Date().toISOString()
      });

      return creators;

    } catch (error) {
      await this.activityLogger.logError(error instanceof Error ? error : new Error('Failed to discover creators'), 'creator_discovery');
      return [];
    }
  }

  private async sendInvitationToCreator(creator: Creator): Promise<boolean> {
    if (!this.page) return false;

    try {
      await this.activityLogger.logBotAction('sending_invitation', this.currentSession?.id, creator.id, {
        username: creator.username,
        followers: creator.followerCount,
        category: creator.category,
        timestamp: new Date().toISOString()
      });

      // Look for invite button
      const inviteButton = await this.page.$(`[data-creator="${creator.username}"] .invite-btn, .invite-button, button:contains("Invite")`);
      
      if (inviteButton) {
        await this.humanClick(inviteButton);
        await this.humanDelay(1000, 2000);

        // Check if invitation modal opened
        const modalExists = await this.page.$('.invitation-modal, .invite-modal, [data-testid="invite-modal"]');
        
        if (modalExists) {
          // Fill invitation message
          const messageField = await this.page.$('textarea, .message-input');
          if (messageField) {
            const message = this.generateInvitationMessage(creator);
            await this.humanType('textarea, .message-input', message);
            await this.humanDelay(1000, 2000);
          }

          // Click send button
          const sendButton = await this.page.$('.send-btn, button:contains("Send"), [data-testid="send-invitation"]');
          if (sendButton) {
            await this.humanClick(sendButton);
            await this.humanDelay(2000, 3000);

            // Store creator in database
            await storage.createCreator({
              username: creator.username,
              displayName: creator.displayName,
              followerCount: creator.followerCount,
              category: creator.category,
              inviteStatus: 'sent',
              lastInviteDate: new Date()
            });

            await this.activityLogger.logBotAction('invitation_sent', this.currentSession?.id, creator.id, {
              username: creator.username,
              timestamp: new Date().toISOString()
            });

            return true;
          }
        }
      }

      return false;

    } catch (error) {
      await this.activityLogger.logError(error instanceof Error ? error : new Error(`Failed to send invitation to ${creator.username}`), 'invitation_send');
      return false;
    }
  }

  private generateInvitationMessage(creator: Creator): string {
    const messages = [
      `Hi ${creator.username}! We'd love to collaborate with you on promoting our products. Your content style aligns perfectly with our brand. Interested in a partnership?`,
      `Hello ${creator.username}! We're impressed by your ${creator.category} content and would like to explore a collaboration opportunity. Let's discuss!`,
      `Hi there! Your engaging content caught our attention. Would you be interested in a brand partnership with competitive commission rates?`,
      `Hello ${creator.username}! We think your audience would love our products. Let's partner up for a mutually beneficial collaboration!`
    ];

    return messages[Math.floor(Math.random() * messages.length)];
  }

  private parseFollowerCount(text: string): number {
    const match = text.match(/[\d,]+/);
    if (!match) return 0;

    const number = parseInt(match[0].replace(/,/g, ''));
    
    if (text.toLowerCase().includes('k')) {
      return number * 1000;
    } else if (text.toLowerCase().includes('m')) {
      return number * 1000000;
    }
    
    return number;
  }

  private async updateSessionStats(sessionId: number, invitesSent: number, success: boolean): Promise<void> {
    if (this.currentSession) {
      await storage.updateBotSession(sessionId, {
        invitesSent,
        successfulInvites: success ? this.currentSession.successfulInvites + 1 : this.currentSession.successfulInvites,
        errorCount: success ? this.currentSession.errorCount : this.currentSession.errorCount + 1
      });
    }
  }

  private async humanType(selector: string, text: string): Promise<void> {
    if (!this.page) return;

    await this.page.focus(selector);
    await this.page.keyboard.type(text, { delay: Math.random() * 100 + 50 });
  }

  private async humanClick(element: any): Promise<void> {
    if (!this.page) return;

    // Random small delay before click
    await this.humanDelay(100, 500);
    await element.click();
  }

  private async humanDelay(min: number, max: number): Promise<void> {
    const delay = Math.random() * (max - min) + min;
    await new Promise(resolve => setTimeout(resolve, delay));
  }

  async stopSession(): Promise<void> {
    this.isRunning = false;
    
    if (this.currentSession) {
      await storage.updateBotSession(this.currentSession.id, {
        status: 'stopped',
        endTime: new Date()
      });

      await this.activityLogger.logBotAction('session_stopped', this.currentSession.id, undefined, {
        reason: 'user_requested',
        timestamp: new Date().toISOString()
      });
    }
  }

  async cleanup(): Promise<void> {
    this.isRunning = false;
    
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
      this.page = null;
    }

    await this.activityLogger.logBotAction('automation_engine_cleanup', undefined, undefined, {
      timestamp: new Date().toISOString()
    });
  }
}