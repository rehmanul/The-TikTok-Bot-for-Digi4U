import TikTokAPIService, { TikTokAPIConfig, CreatorSearchParams, InvitationRequest } from './tiktok-api';
import { ActivityLogger } from '../bot/activity-logger';
import { CreatorFilter } from '../bot/creator-filter';
import { storage } from '../storage';
import { BotSession, BotConfig, Creator, InsertCreator } from '../../shared/schema';

export class TikTokSessionManager {
  private apiService: TikTokAPIService;
  private activityLogger: ActivityLogger;
  private creatorFilter: CreatorFilter;
  private currentSession: BotSession | null = null;
  private isRunning = false;
  private shouldStop = false;

  constructor() {
    const config: TikTokAPIConfig = {
      appId: process.env.TIKTOK_APP_ID || '7512649815700963329',
      appSecret: process.env.TIKTOK_APP_SECRET || 'e448a875d92832486230db13be28db0444035303',
      accessToken: process.env.TIKTOK_ACCESS_TOKEN || '',
      redirectUri: 'https://the-tiktok-bot-for-digi4u.rehmanshoj.repl.co/oauth-callback'
    };

    this.apiService = new TikTokAPIService(config);
    this.activityLogger = new ActivityLogger();
    this.creatorFilter = new CreatorFilter();
  }

  /**
   * Generate OAuth URL for TikTok authorization
   */
  generateAuthUrl(): string {
    return this.apiService.generateAuthUrl();
  }

  /**
   * Handle OAuth callback and exchange code for token
   */
  async handleOAuthCallback(authCode: string): Promise<string> {
    try {
      const accessToken = await this.apiService.exchangeCodeForToken(authCode);
      await this.activityLogger.logBotAction('oauth_complete', undefined, undefined, {
        success: true,
        timestamp: new Date().toISOString()
      });
      return accessToken;
    } catch (error) {
      await this.activityLogger.logError(error as Error, 'oauth_callback');
      throw error;
    }
  }

  /**
   * Validate API token and connection
   */
  async validateConnection(): Promise<boolean> {
    try {
      const isValid = await this.apiService.validateToken();
      await this.activityLogger.logBotAction('api_validation', undefined, undefined, {
        valid: isValid,
        timestamp: new Date().toISOString()
      });
      return isValid;
    } catch (error) {
      await this.activityLogger.logError(error as Error, 'api_validation');
      return false;
    }
  }

  /**
   * Start a new bot session using TikTok API
   */
  async startSession(): Promise<BotSession> {
    if (this.isRunning) {
      throw new Error('Session already running');
    }

    // Validate API connection first
    const isValid = await this.validateConnection();
    if (!isValid) {
      throw new Error('TikTok API connection invalid. Please re-authenticate.');
    }

    // Create new session
    this.currentSession = await storage.createBotSession({
      status: 'running',
      invitesSent: 0,
      successfulInvites: 0,
      errorCount: 0,
      startTime: new Date(),
      metadata: {
        apiMode: 'official',
        timestamp: new Date().toISOString()
      }
    });

    this.isRunning = true;
    this.shouldStop = false;

    await this.activityLogger.logBotAction('session_started', this.currentSession.id, undefined, {
      sessionId: this.currentSession.id,
      mode: 'api'
    });

    // Start the invitation process
    this.runInvitationLoop().catch(error => {
      console.error('Session error:', error);
      this.stopSession('error');
    });

    return this.currentSession;
  }

  /**
   * Stop the current session
   */
  async stopSession(reason: string = 'manual'): Promise<void> {
    if (!this.currentSession) return;

    this.shouldStop = true;
    this.isRunning = false;

    await storage.updateBotSession(this.currentSession.id, {
      status: 'stopped',
      endTime: new Date(),
      metadata: {
        ...this.currentSession.metadata,
        stopReason: reason,
        sessionDuration: Date.now() - (this.currentSession.startTime?.getTime() || Date.now())
      }
    });

    await this.activityLogger.logBotAction('session_stopped', this.currentSession.id, undefined, {
      reason,
      duration: Date.now() - (this.currentSession.startTime?.getTime() || Date.now())
    });

    this.currentSession = null;
  }

  /**
   * Main invitation loop using TikTok API
   */
  private async runInvitationLoop(): Promise<void> {
    const config = await storage.getBotConfig();
    if (!config) {
      throw new Error('Bot configuration not found');
    }

    while (this.isRunning && !this.shouldStop && this.currentSession) {
      try {
        await this.processCreatorBatch(config);

        // Respect rate limits and delays
        const delay = config.action_delay || 30000;
        await this.sleep(delay);

        // Check daily limits
        if (this.currentSession.invited_count >= config.daily_limit) {
          await this.stopSession('daily_limit_reached');
          break;
        }
      } catch (error) {
        console.error('Invitation loop error:', error);
        await this.activityLogger.logError(error as Error, 'invitation_loop');

        // Continue after error with exponential backoff
        await this.sleep(60000);
      }
    }
  }

  /**
   * Process a batch of creators using TikTok API
   */
  private async processCreatorBatch(config: BotConfig): Promise<void> {
    try {
      // Search for creators using official API
      const searchParams: CreatorSearchParams = {
        min_followers: config.min_followers,
        max_followers: config.max_followers,
        category: config.categories?.[0] || 'lifestyle',
        location: 'GB',
        limit: 10
      };

      const apiCreators = await this.apiService.searchCreators(searchParams);

      await this.activityLogger.logBotAction('creators_found', this.currentSession?.id, undefined, {
        count: apiCreators.length,
        searchParams
      });

      // Convert API creators to database format and filter
      for (const apiCreator of apiCreators) {
        if (this.shouldStop) break;

        // Check if creator already exists
        const existingCreator = await storage.getCreatorByUsername(apiCreator.username);
        if (existingCreator && existingCreator.status === 'invited') {
          continue; // Skip already invited creators
        }

        // Create or update creator in database
        const creatorData: InsertCreator = {
          username: apiCreator.username,
          display_name: apiCreator.display_name,
          followers_count: apiCreator.follower_count,
          bio: apiCreator.bio_description || '',
          category: apiCreator.category || 'lifestyle',
          status: 'pending',
          metadata: {
            tiktok_id: apiCreator.id,
            is_verified: apiCreator.is_verified,
            engagement_rate: apiCreator.engagement_rate,
            profile_image: apiCreator.profile_image
          }
        };

        let creator: Creator;
        if (existingCreator) {
          creator = await storage.updateCreator(existingCreator.id, creatorData) || existingCreator;
        } else {
          creator = await storage.createCreator(creatorData);
        }

        // Send invitation using API
        await this.sendInvitationToCreator(creator, apiCreator.id);

        // Update session stats
        if (this.currentSession) {
          await storage.updateBotSession(this.currentSession.id, {
            invited_count: this.currentSession.invited_count + 1
          });
          this.currentSession.invited_count += 1;
        }
      }
    } catch (error) {
      await this.activityLogger.logError(error as Error, 'process_creator_batch');
      throw error;
    }
  }

  /**
   * Send invitation to creator using TikTok API
   */
  private async sendInvitationToCreator(creator: Creator, tikTokCreatorId: string): Promise<void> {
    try {
      const invitation: InvitationRequest = {
        creator_id: tikTokCreatorId,
        message: `Hi ${creator.display_name}! Join Digi4U's affiliate program and earn commissions promoting our tech products. Great fit for your ${creator.category} content!`,
        commission_rate: 0.15 // 15% commission
      };

      const success = await this.apiService.sendInvitation(invitation);

      if (success) {
        await storage.updateCreator(creator.id, {
          status: 'invited',
          last_contacted: new Date(),
          metadata: {
            ...creator.metadata,
            lastInvitation: new Date().toISOString(),
            invitationMethod: 'api'
          }
        });

        if (this.currentSession) {
          await storage.updateBotSession(this.currentSession.id, {
            success_count: this.currentSession.success_count + 1
          });
          this.currentSession.success_count += 1;
        }

        await this.activityLogger.logBotAction('invitation_sent', this.currentSession?.id, creator.id, {
          username: creator.username,
          method: 'api',
          success: true
        });
      } else {
        await storage.updateCreator(creator.id, {
          status: 'failed'
        });

        if (this.currentSession) {
          await storage.updateBotSession(this.currentSession.id, {
            error_count: this.currentSession.error_count + 1
          });
          this.currentSession.error_count += 1;
        }

        await this.activityLogger.logBotAction('invitation_failed', this.currentSession?.id, creator.id, {
          username: creator.username,
          method: 'api',
          success: false
        });
      }
    } catch (error) {
      await this.activityLogger.logError(error as Error, 'send_invitation', {
        creatorId: creator.id,
        username: creator.username
      });
    }
  }

  /**
   * Get current session status
   */
  getCurrentSession(): BotSession | null {
    return this.currentSession;
  }

  /**
   * Check if session is running
   */
  isSessionRunning(): boolean {
    return this.isRunning;
  }

  /**
   * Get invitation history from TikTok API
   */
  async getInvitationHistory(): Promise<any[]> {
    return await this.apiService.getInvitationHistory();
  }

  /**
   * Get campaign metrics
   */
  async getCampaignMetrics(): Promise<any> {
    return await this.apiService.getCampaignMetrics();
  }

  /**
   * Update API access token
   */
  updateAccessToken(token: string): void {
    this.apiService.updateAccessToken(token);
  }

  /**
   * Utility function for delays
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Start API session for automated operations
   */
  async startAPISession(): Promise<void> {
    if (!this.apiService.isConnected) {
      throw new Error('TikTok API is not connected');
    }

    this.isSessionRunning = true;
    await this.activityLogger.logBotAction('api_session_started', undefined, undefined, {
      timestamp: new Date().toISOString()
    });

    // Start periodic creator discovery and invitation
    this.startPeriodicOperations();
  }

  /**
   * Stop API session
   */
  async stopAPISession(): Promise<void> {
    this.isSessionRunning = false;

    if (this.sessionInterval) {
      clearInterval(this.sessionInterval);
      this.sessionInterval = null;
    }

    await this.activityLogger.logBotAction('api_session_stopped', undefined, undefined, {
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Check if API session is running
   */
  isAPISessionRunning(): boolean {
    return this.isSessionRunning;
  }

  /**
   * Start periodic operations for creator discovery and invitations
   */
  private startPeriodicOperations(): void {
    if (this.sessionInterval) {
      clearInterval(this.sessionInterval);
    }

    // Run creator discovery and invitations every 30 minutes
    this.sessionInterval = setInterval(async () => {
      if (!this.isSessionRunning) return;

      try {
        await this.runPeriodicTasks();
      } catch (error) {
        console.error('Periodic task error:', error);
        await this.activityLogger.logError(error as Error, 'periodic_tasks');
      }
    }, 30 * 60 * 1000); // 30 minutes

    // Run initial task after 5 seconds
    setTimeout(async () => {
      if (this.isSessionRunning) {
        await this.runPeriodicTasks();
      }
    }, 5000);
  }

  /**
   * Run periodic tasks for creator discovery and invitations
   */
  private async runPeriodicTasks(): Promise<void> {
    if (!this.apiService || !this.isSessionRunning) return;

    try {
      // Search for creators
      const creators = await this.apiService.searchCreators({
        min_followers: 1000,
        max_followers: 100000,
        limit: 10
      });

      await this.activityLogger.logBotAction('creators_found', undefined, undefined, {
        count: creators.length,
        timestamp: new Date().toISOString()
      });

      // Send invitations to creators
      for (const creator of creators.slice(0, 5)) { // Limit to 5 invitations per run
        if (!this.isSessionRunning) break;

        try {
          const success = await this.apiService.sendInvitation({
            creator_id: creator.id,
            message: 'Join our affiliate program and earn commissions promoting our products!'
          });

          if (success) {
            this.metrics.total_invitations++;
            this.metrics.successful_invitations++;
          } else {
            this.metrics.total_invitations++;
            this.metrics.failed_invitations++;
          }
        } catch (error) {
          this.metrics.total_invitations++;
          this.metrics.failed_invitations++;
          console.error(`Failed to invite creator ${creator.id}:`, error);
        }

        // Wait 5 seconds between invitations to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 5000));
      }

      await this.activityLogger.logBotAction('periodic_invitations_completed', undefined, undefined, {
        metrics: this.metrics,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Periodic task error:', error);
      await this.activityLogger.logError(error as Error, 'periodic_tasks');
    }
  }

  /**
   * Get API client configuration
   */
  getConfig(): TikTokAPIConfig {
    return this.apiService ? this.apiService.getConfig() : { appId: '', appSecret: '', redirectUri: '' };
  }

  private isSessionRunning: boolean = false;
  private sessionInterval: NodeJS.Timeout | null = null;

  private metrics = {
    total_invitations: 0,
    successful_invitations: 0,
    failed_invitations: 0
  };

  get isConnected(): boolean {
        return this.apiService.isConnected;
  }
}

export default TikTokSessionManager;