import { Browser, Page } from 'puppeteer';
import puppeteerExtra from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import { storage } from '../storage';
import { HumanBehavior } from './human-behavior';

puppeteerExtra.use(StealthPlugin());

export class EnhancedPuppeteerManager {
  private browser: Browser | null = null;
  private page: Page | null = null;
  private isLoggedIn = false;
  private humanBehavior: HumanBehavior;

  constructor() {
    this.humanBehavior = new HumanBehavior();
  }

  async initialize(): Promise<void> {
    try {
      if (this.browser) {
        await this.close();
      }

      const launchOptions = {
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--disable-gpu',
          '--window-size=1920,1080',
          '--disable-background-timer-throttling',
          '--disable-backgrounding-occluded-windows',
          '--disable-renderer-backgrounding'
        ],
        defaultViewport: {
          width: 1920,
          height: 1080
        }
      };

      this.browser = await puppeteerExtra.launch(launchOptions);
      this.page = await this.browser.newPage();

      // Set realistic viewport and user agent
      await this.page.setViewport({ width: 1920, height: 1080 });
      await this.page.setUserAgent(
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      );

      // Enable human-like behavior
      await this.setupHumanBehavior();

      await storage.logActivity({
        type: 'system',
        description: 'Enhanced browser initialized with human-like behavior',
        metadata: { viewport: '1920x1080' },
      });
    } catch (error) {
      console.error('Browser initialization failed:', error);
      throw error;
    }
  }

  private async setupHumanBehavior(): Promise<void> {
    if (!this.page) return;

    // Add random mouse movements
    await this.page.evaluateOnNewDocument(() => {
      let lastMouseX = 0;
      let lastMouseY = 0;

      document.addEventListener('mousemove', (e) => {
        lastMouseX = e.clientX;
        lastMouseY = e.clientY;
      });

      // Simulate natural scrolling behavior
      let isScrolling = false;
      document.addEventListener('scroll', () => {
        if (!isScrolling) {
          isScrolling = true;
          setTimeout(() => {
            isScrolling = false;
          }, Math.random() * 500 + 500);
        }
      });
    });
  }

  async login(): Promise<boolean> {
    if (!this.page) throw new Error('Browser not initialized');

    try {
      // Navigate to login page with human-like behavior
      await this.humanBehavior.navigateNaturally(
        this.page,
        'https://seller-uk.tiktok.com/account/login'
      );

      // Wait for login form
      await this.page.waitForSelector('input[type="email"], input[name="email"]', { timeout: 10000 });

      // Simulate human typing for email
      const email = process.env.TIKTOK_EMAIL || '';
      await this.humanBehavior.typeHumanly(this.page, 'input[type="email"]', email);

      // Random pause before password
      await this.humanBehavior.randomDelay(1000, 2000);

      // Type password with human-like behavior
      const password = process.env.TIKTOK_PASSWORD || '';
      await this.humanBehavior.typeHumanly(this.page, 'input[type="password"]', password);

      // Random pause before clicking login
      await this.humanBehavior.randomDelay(800, 1500);

      // Click login button naturally
      await this.humanBehavior.clickHumanly(this.page, 'button[type="submit"]');

      // Wait for navigation with extended timeout
      await this.page.waitForNavigation({ timeout: 30000 });

      // Verify login success
      const isDashboard = await this.page.evaluate(() => {
        return window.location.href.includes('/dashboard');
      });

      if (isDashboard) {
        this.isLoggedIn = true;
        await storage.logActivity({
          type: 'login_success',
          description: 'Successfully logged into TikTok Seller Center',
          metadata: { url: await this.page.url() },
        });
        return true;
      }

      return false;
    } catch (error) {
      console.error('Login failed:', error);
      await storage.logActivity({
        type: 'login_error',
        description: `Login failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        metadata: { error: String(error) },
      });
      throw error;
    }
  }

  async navigateToAffiliateCenter(): Promise<boolean> {
    if (!this.page || !this.isLoggedIn) {
      throw new Error('Not logged in or browser not initialized');
    }

    try {
      // Navigate with human-like behavior
      await this.humanBehavior.navigateNaturally(
        this.page,
        'https://affiliate.tiktok.com/connection/creator?shop_region=GB'
      );

      // Simulate reading the page
      await this.humanBehavior.randomDelay(2000, 4000);

      // Scroll naturally
      await this.humanBehavior.scrollNaturally(this.page, 500);

      await storage.logActivity({
        type: 'navigation',
        description: 'Navigated to TikTok Affiliate Creator Connection',
        metadata: { url: await this.page.url() },
      });

      return true;
    } catch (error) {
      console.error('Navigation failed:', error);
      throw error;
    }
  }

  async findCreators(limit: number = 10): Promise<Array<{username: string; followers: string; category: string}>> {
    if (!this.page || !this.isLoggedIn) {
      throw new Error('Not logged in or browser not initialized');
    }

    try {
      // Navigate to creator discovery with human-like behavior
      await this.humanBehavior.navigateNaturally(
        this.page,
        'https://affiliate.tiktok.com/connection/creator/discovery'
      );

      // Wait for creator list with natural delay
      await this.humanBehavior.randomDelay(2000, 4000);
      await this.page.waitForSelector('.creator-card, [data-testid="creator-card"]');

      // Scroll through results naturally
      for (let i = 0; i < 3; i++) {
        await this.humanBehavior.scrollNaturally(this.page, 300);
        await this.humanBehavior.randomDelay(1000, 2000);
      }

      // Extract creator information
      const creators = await this.page.evaluate((searchLimit: number) => {
        const creatorElements = document.querySelectorAll('.creator-card, [data-testid="creator-card"]');
        const foundCreators: Array<{username: string; followers: string; category: string}> = [];

        for (let i = 0; i < Math.min(creatorElements.length, searchLimit); i++) {
          const element = creatorElements[i];
          foundCreators.push({
            username: element.querySelector('.username, [data-testid="username"]')?.textContent?.trim() || '',
            followers: element.querySelector('.followers, [data-testid="followers"]')?.textContent?.trim() || '0',
            category: element.querySelector('.category, [data-testid="category"]')?.textContent?.trim() || 'Unknown',
          });
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
      console.error('Error finding creators:', error);
      throw error;
    }
  }

  async sendInvite(creatorUsername: string): Promise<boolean> {
    if (!this.page || !this.isLoggedIn) {
      throw new Error('Not logged in or browser not initialized');
    }

    try {
      // Find and click the invite button with human-like behavior
      const inviteButton = await this.page.$(`button[data-username="${creatorUsername}"]`);
      if (!inviteButton) {
        throw new Error('Invite button not found');
      }

      // Move mouse naturally to the button
      const box = await inviteButton.boundingBox();
      if (box) {
        await this.humanBehavior.moveMouseInHumanPattern(
          this.page,
          box.x + box.width / 2,
          box.y + box.height / 2,
          box.x + box.width / 2 + (Math.random() * 10 - 5),
          box.y + box.height / 2 + (Math.random() * 10 - 5)
        );
      }

      // Click with natural delay
      await this.humanBehavior.randomDelay(300, 700);
      await inviteButton.click();

      // Wait for confirmation with natural timing
      await this.humanBehavior.randomDelay(1000, 2000);

      await storage.logActivity({
        type: 'invite_sent',
        description: `Invitation sent to ${creatorUsername}`,
        metadata: { username: creatorUsername },
      });

      return true;
    } catch (error) {
      console.error('Error sending invite:', error);
      return false;
    }
  }

  async close(): Promise<void> {
    try {
      if (this.page) {
        await this.page.close();
        this.page = null;
      }
      
      if (this.browser) {
        await this.browser.close();
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
}
