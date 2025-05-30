import puppeteer, { Browser, Page } from 'puppeteer';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import { storage } from '../storage';

const puppeteerExtra = require('puppeteer-extra');
puppeteerExtra.use(StealthPlugin());

export class PuppeteerManager {
  private browser: Browser | null = null;
  private page: Page | null = null;
  private isLoggedIn = false;

  async initialize(): Promise<void> {
    if (this.browser) {
      await this.close();
    }

    const puppeteerArgs = process.env.PUPPETEER_ARGS?.split(',') || [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--no-first-run',
      '--no-zygote',
      '--single-process',
      '--disable-gpu'
    ];

    this.browser = await puppeteerExtra.launch({
      headless: process.env.PUPPETEER_HEADLESS !== 'false',
      args: puppeteerArgs,
      defaultViewport: {
        width: parseInt(process.env.PUPPETEER_VIEWPORT_WIDTH || '1920'),
        height: parseInt(process.env.PUPPETEER_VIEWPORT_HEIGHT || '1080'),
      },
    });

    this.page = await this.browser.newPage();
    await this.page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    );

    await storage.logActivity({
      type: 'system',
      description: 'Browser initialized successfully',
      metadata: { headless: process.env.PUPPETEER_HEADLESS !== 'false' },
    });
  }

  async login(): Promise<boolean> {
    if (!this.page) {
      throw new Error('Browser not initialized');
    }

    const email = process.env.TIKTOK_EMAIL;
    const password = process.env.TIKTOK_PASSWORD;

    if (!email || !password) {
      throw new Error('TikTok credentials not provided in environment variables');
    }

    try {
      await this.page.goto('https://seller-us.tiktok.com/account/login', { 
        waitUntil: 'networkidle2',
        timeout: 30000 
      });

      // Wait for email input
      await this.page.waitForSelector('input[type="email"], input[name="email"]', { timeout: 10000 });
      await this.page.type('input[type="email"], input[name="email"]', email);

      // Wait for password input
      await this.page.waitForSelector('input[type="password"], input[name="password"]', { timeout: 10000 });
      await this.page.type('input[type="password"], input[name="password"]', password);

      // Click login button
      await this.page.click('button[type="submit"], button:contains("Log in")');

      // Wait for navigation or error
      await this.page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 30000 });

      // Check if login was successful
      const currentUrl = this.page.url();
      this.isLoggedIn = !currentUrl.includes('/login') && !currentUrl.includes('/account/login');

      if (this.isLoggedIn) {
        await storage.logActivity({
          type: 'login_success',
          description: 'Successfully logged into TikTok Seller Center',
          metadata: { url: currentUrl },
        });
      } else {
        await storage.logActivity({
          type: 'login_failed',
          description: 'Failed to login to TikTok Seller Center',
          metadata: { url: currentUrl },
        });
      }

      return this.isLoggedIn;
    } catch (error) {
      await storage.logActivity({
        type: 'login_error',
        description: `Login error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        metadata: { error: String(error) },
      });
      return false;
    }
  }

  async navigateToAffiliateCenter(): Promise<boolean> {
    if (!this.page || !this.isLoggedIn) {
      throw new Error('Not logged in or browser not initialized');
    }

    try {
      await this.page.goto('https://seller-us.tiktok.com/compass/affiliate', {
        waitUntil: 'networkidle2',
        timeout: 30000
      });

      await this.page.waitForSelector('[data-testid="affiliate-center"], .affiliate-management', { 
        timeout: 15000 
      });

      await storage.logActivity({
        type: 'navigation',
        description: 'Navigated to TikTok Affiliate Center',
        metadata: { url: this.page.url() },
      });

      return true;
    } catch (error) {
      await storage.logActivity({
        type: 'navigation_error',
        description: `Failed to navigate to affiliate center: ${error instanceof Error ? error.message : 'Unknown error'}`,
        metadata: { error: String(error) },
      });
      return false;
    }
  }

  async findCreators(limit: number = 10): Promise<any[]> {
    if (!this.page || !this.isLoggedIn) {
      throw new Error('Not logged in or browser not initialized');
    }

    try {
      // Navigate to creator discovery section
      await this.page.goto('https://seller-us.tiktok.com/compass/affiliate/creators', {
        waitUntil: 'networkidle2',
        timeout: 30000
      });

      // Wait for creator list to load
      await this.page.waitForSelector('.creator-list, [data-testid="creator-card"]', { timeout: 15000 });

      // Extract creator information
      const creators = await this.page.evaluate((limit) => {
        const creatorElements = document.querySelectorAll('.creator-card, [data-testid="creator-card"]');
        const foundCreators = [];

        for (let i = 0; i < Math.min(creatorElements.length, limit); i++) {
          const element = creatorElements[i];
          const usernameEl = element.querySelector('.username, [data-testid="username"]');
          const followersEl = element.querySelector('.followers, [data-testid="followers"]');
          const categoryEl = element.querySelector('.category, [data-testid="category"]');

          if (usernameEl) {
            foundCreators.push({
              username: usernameEl.textContent?.trim(),
              followers: followersEl?.textContent?.trim(),
              category: categoryEl?.textContent?.trim(),
            });
          }
        }

        return foundCreators;
      }, limit);

      await storage.logActivity({
        type: 'creator_discovery',
        description: `Found ${creators.length} creators`,
        metadata: { count: creators.length },
      });

      return creators;
    } catch (error) {
      await storage.logActivity({
        type: 'discovery_error',
        description: `Error finding creators: ${error instanceof Error ? error.message : 'Unknown error'}`,
        metadata: { error: String(error) },
      });
      return [];
    }
  }

  async sendInvite(creatorUsername: string): Promise<boolean> {
    if (!this.page || !this.isLoggedIn) {
      throw new Error('Not logged in or browser not initialized');
    }

    try {
      // Search for the creator
      const searchSelector = 'input[placeholder*="search"], input[type="search"]';
      await this.page.waitForSelector(searchSelector, { timeout: 10000 });
      await this.page.type(searchSelector, creatorUsername);
      await this.page.keyboard.press('Enter');

      // Wait for search results
      await this.page.waitForTimeout(3000);

      // Click on the creator profile or invite button
      const inviteSelector = `button:contains("Invite"), button[data-action="invite"]`;
      await this.page.waitForSelector(inviteSelector, { timeout: 10000 });
      await this.page.click(inviteSelector);

      // Wait for confirmation or success message
      await this.page.waitForTimeout(2000);

      await storage.logActivity({
        type: 'invite_sent',
        description: `Invitation sent to ${creatorUsername}`,
        metadata: { username: creatorUsername },
      });

      return true;
    } catch (error) {
      await storage.logActivity({
        type: 'invite_error',
        description: `Failed to send invite to ${creatorUsername}: ${error instanceof Error ? error.message : 'Unknown error'}`,
        metadata: { username: creatorUsername, error: String(error) },
      });
      return false;
    }
  }

  async humanDelay(min: number = 2000, max: number = 5000): Promise<void> {
    const delay = Math.random() * (max - min) + min;
    await this.page?.waitForTimeout(delay);
  }

  async close(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
      this.page = null;
      this.isLoggedIn = false;

      await storage.logActivity({
        type: 'system',
        description: 'Browser closed',
        metadata: {},
      });
    }
  }

  getStatus(): { isInitialized: boolean; isLoggedIn: boolean } {
    return {
      isInitialized: !!this.browser,
      isLoggedIn: this.isLoggedIn,
    };
  }
}
