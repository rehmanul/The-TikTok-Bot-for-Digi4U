import puppeteer, { Browser, Page, LaunchOptions } from 'puppeteer';
import puppeteerExtra from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import { storage } from '../storage';
import * as fs from 'fs';

puppeteerExtra.use(StealthPlugin());

export class PuppeteerManager {
  private browser: Browser | null = null;
  private page: Page | null = null;
  private isLoggedIn = false;

  private async humanDelay(min: number = 2000, max: number = 5000): Promise<void> {
    const delay = Math.random() * (max - min) + min;
    await new Promise(resolve => setTimeout(resolve, delay));
  }

  async initialize(): Promise<void> {
    try {
      if (this.browser) {
        await this.close();
      }

      // Try to get Chrome executable path with fallbacks
      let executablePath: string | undefined;
      
      try {
        // First try environment variable
        if (process.env.PUPPETEER_EXECUTABLE_PATH) {
          executablePath = process.env.PUPPETEER_EXECUTABLE_PATH;
        } else {
          // Try to get default Puppeteer Chrome path
          executablePath = puppeteer.executablePath();
        }
      } catch (error) {
        console.warn('Could not find Chrome executable, trying system Chrome paths...');
        
        const possiblePaths = [
          // Windows paths
          'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
          'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
          // Linux paths
          '/usr/bin/google-chrome',
          '/usr/bin/google-chrome-stable',
          '/usr/bin/chromium-browser',
          '/usr/bin/chromium',
          // macOS paths
          '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
        ];
        
        for (const chromePath of possiblePaths) {
          if (fs.existsSync(chromePath)) {
            executablePath = chromePath;
            break;
          }
        }
        
        if (!executablePath) {
          throw new Error('Chrome executable not found. Please install Chrome or set PUPPETEER_EXECUTABLE_PATH environment variable.');
        }
      }

      const launchOptions: LaunchOptions = {
        headless: true,
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
          '--disable-renderer-backgrounding',
          '--disable-extensions',
          '--disable-plugins',
          '--disable-default-apps'
        ],
        defaultViewport: {
          width: parseInt(process.env.PUPPETEER_VIEWPORT_WIDTH || '1920'),
          height: parseInt(process.env.PUPPETEER_VIEWPORT_HEIGHT || '1080'),
        },
        timeout: 30000,
      };

      // Only set executablePath if we found one
      if (executablePath) {
        launchOptions.executablePath = executablePath;
      }

      this.browser = await puppeteerExtra.launch(launchOptions);
      this.page = await this.browser.newPage();
      
      // Set timeouts
      await this.page.setDefaultTimeout(15000);
      await this.page.setDefaultNavigationTimeout(20000);
      
      await this.page.setUserAgent(
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      );

      await storage.logActivity({
        type: 'system',
        description: 'Browser initialized successfully',
        metadata: { 
          headless: true,
          executablePath: executablePath || 'default'
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
    try {
      if (!this.page) throw new Error('Browser not initialized');

      // Navigate to TikTok Seller login page
      await this.page.goto('https://seller-uk.tiktok.com/account/login', {
        waitUntil: 'networkidle2',
        timeout: 30000
      });

      // Wait for login to complete (this will happen manually in the popup window)
      // We'll know it's complete when we can access the dashboard
      try {
        await this.page.waitForNavigation({
          waitUntil: 'networkidle2',
          timeout: 300000 // 5 minutes timeout for manual login
        });

        // Check if we're logged in by looking for dashboard elements
        const isDashboard = await this.page.evaluate(() => {
          return window.location.href.includes('/dashboard');
        });

        if (isDashboard) {
          this.isLoggedIn = true;
          
          // Fetch user profile info after successful login
          const userInfo = await this.fetchUserProfile();
          
          await storage.logActivity({
            type: 'login_success',
            description: 'Successfully logged into TikTok Seller Center',
            metadata: { userInfo },
          });

          return true;
        }
      } catch (error) {
        console.error('Login error:', error);
        throw error;
      }

      return false;
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  }

  async fetchUserProfile(): Promise<{ email: string; imageUrl: string | null }> {
    if (!this.page || !this.isLoggedIn) {
      throw new Error('Not logged in or browser not initialized');
    }

    try {
      // Navigate to profile settings page
      await this.page.goto('https://seller-uk.tiktok.com/account/settings', {
        waitUntil: 'networkidle2',
        timeout: 30000
      });

      // Extract user info from the page
      const userInfo = await this.page.evaluate(() => {
        // These selectors need to be updated based on actual TikTok Seller page structure
        const emailElement = document.querySelector('[data-testid="email-field"], .email-field, input[name="email"]');
        const imageElement = document.querySelector('[data-testid="profile-image"], .profile-image img, .avatar img');

        return {
          email: emailElement ? (emailElement as HTMLInputElement).value || emailElement.textContent : '',
          imageUrl: imageElement ? (imageElement as HTMLImageElement).src : null
        };
      });

      if (!userInfo.email) {
        throw new Error('Could not fetch user email');
      }

      // Update user info in storage
      const user = await storage.getUser(1);
      if (user) {
        await storage.updateUser(user.id, {
          email: userInfo.email,
          imageUrl: userInfo.imageUrl
        });
      }

      return userInfo;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      throw error;
    }
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

  async findCreators(limit: number = 10): Promise<Array<{username: string; followers: string; category: string}>> {
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
      const creators = await this.page.evaluate((searchLimit: number) => {
        const creatorElements = document.querySelectorAll('.creator-card, [data-testid="creator-card"]');
        const foundCreators: Array<{username: string; followers: string; category: string}> = [];

        for (let i = 0; i < Math.min(creatorElements.length, searchLimit); i++) {
          const element = creatorElements[i];
          const usernameEl = element.querySelector('.username, [data-testid="username"]');
          const followersEl = element.querySelector('.followers, [data-testid="followers"]');
          const categoryEl = element.querySelector('.category, [data-testid="category"]');

          if (usernameEl) {
            foundCreators.push({
              username: usernameEl.textContent?.trim() || '',
              followers: followersEl?.textContent?.trim() || '0',
              category: categoryEl?.textContent?.trim() || 'Unknown',
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
    } catch (error: unknown) {
      await storage.logActivity({
        type: 'discovery_error',
        description: `Error finding creators: ${error instanceof Error ? error.message : 'Unknown error'}`,
        metadata: { error: String(error) },
      });
      return [];
    }
  }

  async sendInvite(creatorUsername: string): Promise<boolean> {
    try {
      // Test mode - simulate successful invite
      await storage.logActivity({
        type: 'invite_sent',
        description: `Invitation sent to ${creatorUsername} (Test Mode)`,
        metadata: { username: creatorUsername, testMode: true },
      });

      return true;
    } catch (error: unknown) {
      console.error('Error sending invite:', error);
      return false;
    }
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
        await this.page.close().catch((err: any) => console.log('Error closing page:', err));
        this.page = null;
      }
      
      // Then close browser
      if (this.browser) {
        await this.browser.close().catch((err: any) => console.log('Error closing browser:', err));
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
