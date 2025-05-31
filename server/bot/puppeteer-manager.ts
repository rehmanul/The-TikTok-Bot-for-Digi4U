import puppeteer, { Browser, Page } from 'puppeteer';
import puppeteerExtra from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import { storage } from '../storage';

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
      headless: true, // Force headless for Replit
      executablePath: '/nix/store/zi4f80l169xlmivz8vja8wlphq74qqk0-chromium-125.0.6422.141/bin/chromium',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu',
        '--disable-web-security',
        '--disable-features=VizDisplayCompositor'
      ],
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
      const sellerBaseUrl = process.env.TIKTOK_SELLER_URL || 'https://seller-us.tiktok.com';
      await this.page.goto(`${sellerBaseUrl}/account/login`, {
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
      // Navigate to TikTok affiliate creator connection page
      const region = process.env.TIKTOK_SHOP_REGION || 'GB';
      await this.page.goto(`https://affiliate.tiktok.com/connection/creator?shop_region=${region}`, {
        waitUntil: 'networkidle2',
        timeout: 30000
      });

      await this.page.waitForSelector('.creator-list, [data-testid="creator-list"], .affiliate-page', { 
        timeout: 15000 
      });

      await storage.logActivity({
        type: 'navigation',
        description: 'Navigated to TikTok Affiliate Creator Connection',
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

  async createCollaborationLink(productName: string, targetInvites: number = 300): Promise<string[]> {
    if (!this.page) throw new Error('Browser not initialized');
    
    const invitationLinks: string[] = [];
    const linksNeeded = Math.ceil(targetInvites / 50); // 50 creators per link
    
    try {
      const region = process.env.TIKTOK_SHOP_REGION || 'GB';
      await this.page.goto(`https://affiliate.tiktok.com/connection/collaboration?shop_region=${region}`, {
        waitUntil: 'networkidle2',
        timeout: 30000
      });

      for (let i = 1; i <= linksNeeded; i++) {
        const collaborationName = `${productName}-${i}`;
        
        // Click create collaboration button
        await this.page.waitForSelector('button[data-testid="create-collaboration"], .create-collaboration-btn', { timeout: 10000 });
        await this.page.click('button[data-testid="create-collaboration"], .create-collaboration-btn');
        
        // Fill collaboration details
        await this.page.waitForSelector('input[placeholder*="name"], input[name="collaboration_name"]', { timeout: 10000 });
        await this.page.type('input[placeholder*="name"], input[name="collaboration_name"]', collaborationName);
        
        // Set 10% commission rate
        const commissionInput = await this.page.$('input[placeholder*="commission"], input[name="commission_rate"]');
        if (commissionInput) {
          await commissionInput.click({ clickCount: 3 });
          await commissionInput.type('10');
        }
        
        // Enable manual review
        const manualReviewCheckbox = await this.page.$('input[type="checkbox"][data-testid*="manual"], input[name*="manual_review"]');
        if (manualReviewCheckbox) {
          await manualReviewCheckbox.click();
        }
        
        // Set validation period to 1 month
        const validitySelect = await this.page.$('select[data-testid*="validity"], select[name*="validity"]');
        if (validitySelect) {
          await this.page.select('select[data-testid*="validity"], select[name*="validity"]', '30');
        }
        
        // Save collaboration
        await this.page.click('button[data-testid="save"], button[type="submit"]');
        await this.humanDelay(2000, 4000);
        
        // Get the generated link
        const linkElement = await this.page.$('.collaboration-link, [data-testid="collaboration-link"]');
        if (linkElement) {
          const link = await linkElement.textContent();
          if (link) invitationLinks.push(link.trim());
        }
        
        await storage.logActivity({
          type: 'collaboration_created',
          description: `Created collaboration link: ${collaborationName}`,
          metadata: { name: collaborationName, commission: 10 },
        });
      }
      
      return invitationLinks;
    } catch (error) {
      await storage.logActivity({
        type: 'collaboration_error',
        description: `Failed to create collaboration links: ${error instanceof Error ? error.message : 'Unknown error'}`,
        metadata: { error: String(error) },
      });
      return [];
    }
  }

  async findCreators(limit: number = 10): Promise<any[]> {
    if (!this.page || !this.isLoggedIn) {
      throw new Error('Not logged in or browser not initialized');
    }

    try {
      // Navigate to creator discovery section
      const sellerBaseUrl = process.env.TIKTOK_SELLER_URL || 'https://seller-us.tiktok.com';
      await this.page.goto(`${sellerBaseUrl}/compass/affiliate/creators`, {
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
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Click on the creator profile or invite button
      const inviteSelector = `button:contains("Invite"), button[data-action="invite"]`;
      await this.page.waitForSelector(inviteSelector, { timeout: 10000 });
      await this.page.click(inviteSelector);

      // Wait for confirmation or success message
      await new Promise(resolve => setTimeout(resolve, 2000));

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
    await new Promise(resolve => setTimeout(resolve, delay));
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
