import puppeteer, { Browser, Page } from 'puppeteer';
import { existsSync } from 'fs';
import puppeteerExtra from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import { storage } from '../storage';

puppeteerExtra.use(StealthPlugin());

export class PuppeteerManager {
  private browser: Browser | null = null;
  private page: Page | null = null;
  private isLoggedIn = false;

  async initialize(): Promise<void> {
    try {
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

      const envPath = process.env.PUPPETEER_EXECUTABLE_PATH;
      const executablePath = envPath && existsSync(envPath)
        ? envPath
        : puppeteer.executablePath();

      this.browser = await puppeteerExtra.launch({
        headless: true, // Force headless for Replit
        executablePath,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--disable-gpu',
          '--disable-web-security',
          '--disable-features=VizDisplayCompositor',
          '--disable-background-timer-throttling',
          '--disable-backgrounding-occluded-windows',
          '--disable-renderer-backgrounding'
        ],
        defaultViewport: {
          width: parseInt(process.env.PUPPETEER_VIEWPORT_WIDTH || '1920'),
          height: parseInt(process.env.PUPPETEER_VIEWPORT_HEIGHT || '1080'),
        },
        timeout: 30000,
      });

      this.page = await this.browser.newPage();
      
      // Set timeouts
      this.page.setDefaultTimeout(15000);
      this.page.setDefaultNavigationTimeout(20000);
      
      await this.page.setUserAgent(
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      );

      await storage.logActivity({
        type: 'system',
        description: 'Browser initialized successfully',
        metadata: {
          headless: process.env.PUPPETEER_HEADLESS !== 'false',
          executablePath,
        },
      });
    } catch (error) {
      await storage.logActivity({
        type: 'system_error',
        description: `Browser initialization failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        metadata: { error: String(error) },
      });
      throw error;
    }
  }

  async login(): Promise<boolean> {
    // Test mode - simulate successful login
    this.isLoggedIn = true;
    
    await storage.logActivity({
      type: 'login_success',
      description: 'Successfully logged into TikTok Seller Center (Test Mode)',
      metadata: { testMode: true },
    });

    return true;
  }

  async navigateToAffiliateCenter(): Promise<boolean> {
    // Test mode - simulate successful navigation
    await storage.logActivity({
      type: 'navigation',
      description: 'Navigated to TikTok Affiliate Creator Connection (Test Mode)',
      metadata: { testMode: true },
    });

    return true;
  }

  async createCollaborationLink(productName: string, targetInvites: number = 300): Promise<string[]> {
    if (!this.page) throw new Error('Browser not initialized');

    const invitationLinks: string[] = [];
    const linksNeeded = Math.ceil(targetInvites / 50); // 50 creators per link

    try {
      await this.page.goto('https://affiliate.tiktok.com/connection/collaboration', {
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
          const link = await linkElement.evaluate(el => el.textContent);
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
    // Test mode - simulate successful invite
    await storage.logActivity({
      type: 'invite_sent',
      description: `Invitation sent to ${creatorUsername} (Test Mode)`,
      metadata: { username: creatorUsername, testMode: true },
    });

    return true;
  }

  async humanDelay(min: number = 2000, max: number = 5000): Promise<void> {
    const delay = Math.random() * (max - min) + min;
    await new Promise(resolve => setTimeout(resolve, delay));
  }

  async close(): Promise<void> {
    try {
      if (this.page) {
        await this.page.close().catch(() => {});
        this.page = null;
      }
      
      if (this.browser) {
        await this.browser.close().catch(() => {});
        this.browser = null;
      }
      
      this.isLoggedIn = false;

      await storage.logActivity({
        type: 'system',
        description: 'Browser closed',
        metadata: {},
      });
    } catch (error) {
      console.error('Error closing browser:', error);
      // Force cleanup even if there are errors
      this.browser = null;
      this.page = null;
      this.isLoggedIn = false;
    }
  }

  getStatus(): { isInitialized: boolean; isLoggedIn: boolean } {
    return {
      isInitialized: !!this.browser,
      isLoggedIn: this.isLoggedIn,
    };
  }

  getPage(): Page | null {
    return this.page;
  }

  async cleanup(): Promise<void> {
    try {
      // Close page first
      if (this.page && !this.page.isClosed()) {
        await this.page.close().catch(err => console.log('Error closing page:', err));
        this.page = null;
      }
      
      // Then close browser
      if (this.browser) {
        await this.browser.close().catch(err => console.log('Error closing browser:', err));
        this.browser = null;
      }
      
      this.isLoggedIn = false;
      
      await storage.logActivity({
        type: 'system',
        description: 'Browser cleanup completed',
        metadata: {},
      });
    } catch (error) {
      console.error('Error during cleanup:', error);
      // Force reset even if cleanup fails
      this.browser = null;
      this.page = null;
      this.isLoggedIn = false;
    }
  }
}
