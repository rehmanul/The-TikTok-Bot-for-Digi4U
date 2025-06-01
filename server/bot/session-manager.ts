import { storage } from '../storage';
import { PuppeteerManager } from './puppeteer-manager';
import { CreatorFilter } from './creator-filter';
import { ActivityLogger } from './activity-logger';
import type { BotSession, BotConfig } from '@shared/schema';

export class SessionManager {
  private puppeteerManager: PuppeteerManager;
  private creatorFilter: CreatorFilter;
  private activityLogger: ActivityLogger;
  private currentSession: BotSession | null = null;
  private isRunning = false;
  private shouldStop = false;

  constructor() {
    this.puppeteerManager = new PuppeteerManager();
    this.creatorFilter = new CreatorFilter();
    this.activityLogger = new ActivityLogger();
  }

  async startSession(): Promise<BotSession> {
    if (this.isRunning) {
      throw new Error('Session is already running');
    }

    // Get bot configuration
    const config = await storage.getBotConfig();
    if (!config) {
      throw new Error('Bot configuration not found');
    }

    try {
      // Create new session
      this.currentSession = await storage.createBotSession({
        status: 'running',
        startTime: new Date(),
        invitesSent: 0,
        successfulInvites: 0,
        errorCount: 0,
        settings: config,
      });

      this.isRunning = true;
      this.shouldStop = false;

      await this.activityLogger.log({
        type: 'session_start',
        description: 'Bot session started (Test Mode)',
        sessionId: this.currentSession.id,
        metadata: { config, testMode: true },
      });

      // In test mode, we simulate successful initialization and login
      await this.puppeteerManager.initialize();
      await this.puppeteerManager.login(); // This is now always successful in test mode
      await this.puppeteerManager.navigateToAffiliateCenter(); // This is now always successful in test mode

      // Start the invitation process
      this.runInvitationLoop(config);

      return this.currentSession;
    } catch (error) {
      this.isRunning = false;
      if (this.currentSession) {
        await storage.updateBotSession(this.currentSession.id, {
          status: 'stopped',
          endTime: new Date(),
        });
      }
      throw error;
    }
  }

  async pauseSession(): Promise<void> {
    if (!this.isRunning || !this.currentSession) {
      throw new Error('No active session to pause');
    }

    this.shouldStop = true;
    await storage.updateBotSession(this.currentSession.id, {
      status: 'paused',
    });

    await this.activityLogger.log({
      type: 'session_pause',
      description: 'Bot session paused',
      sessionId: this.currentSession.id,
    });
  }

  async resumeSession(): Promise<void> {
    if (this.isRunning || !this.currentSession) {
      throw new Error('Cannot resume session');
    }

    const config = await storage.getBotConfig();
    if (!config) {
      throw new Error('Bot configuration not found');
    }

    this.shouldStop = false;
    this.isRunning = true;

    await storage.updateBotSession(this.currentSession.id, {
      status: 'running',
    });

    await this.activityLogger.log({
      type: 'session_resume',
      description: 'Bot session resumed',
      sessionId: this.currentSession.id,
    });

    this.runInvitationLoop(config);
  }

  async stopSession(reason?: string): Promise<void> {
    this.shouldStop = true;
    this.isRunning = false;

    if (this.currentSession) {
      await storage.updateBotSession(this.currentSession.id, {
        status: 'stopped',
        endTime: new Date(),
      });

      await this.activityLogger.log({
        type: 'session_stop',
        description: reason || 'Bot session stopped',
        sessionId: this.currentSession.id,
        metadata: { reason },
      });
    }

    await this.puppeteerManager.close();
    this.currentSession = null;
  }

  private async runInvitationLoop(config: BotConfig): Promise<void> {
    while (this.isRunning && !this.shouldStop && this.currentSession) {
      try {
        // Check daily limit
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayActivities = await storage.getRecentActivities(1000);
        const todayInvites = todayActivities.filter(
          a => a.type === 'invite_sent' && 
          a.createdAt && 
          a.createdAt >= today
        ).length;

        if (config.dailyLimit != null && todayInvites >= config.dailyLimit) {
          await this.stopSession('Daily limit reached');
          break;
        }

        // Get creators to invite
        const creators = await storage.getCreatorsForInvitation(5);
        
        if (creators.length === 0) {
          await this.activityLogger.log({
            type: 'info',
            description: 'No eligible creators found for invitation',
            sessionId: this.currentSession.id,
          });
          
          // Wait before checking again
          await this.delay(60000); // 1 minute
          continue;
        }

        // Process each creator
        for (const creator of creators) {
          if (this.shouldStop) break;

          try {
            // Send invitation
            const success = await this.puppeteerManager.sendInvite(creator.username);
            
            if (success) {
              // Update creator status
              await storage.updateCreator(creator.id, {
                inviteStatus: 'sent',
                lastInvited: new Date(),
              });

              // Update session stats
              this.currentSession.invitesSent = (this.currentSession.invitesSent || 0) + 1;
              if (success) {
                this.currentSession.successfulInvites = (this.currentSession.successfulInvites || 0) + 1;
              }

              await storage.updateBotSession(this.currentSession.id, {
                invitesSent: this.currentSession.invitesSent,
                successfulInvites: this.currentSession.successfulInvites,
              });

              await this.activityLogger.log({
                type: 'invite_sent',
                description: `Invitation sent to ${creator.username}`,
                sessionId: this.currentSession.id,
                creatorId: creator.id,
                metadata: { 
                  username: creator.username,
                  followers: creator.followers,
                  category: creator.category 
                },
              });
            } else {
              this.currentSession.errorCount = (this.currentSession.errorCount || 0) + 1;
              await storage.updateBotSession(this.currentSession.id, {
                errorCount: this.currentSession.errorCount,
              });
            }

            // Human-like delay between actions
            await this.delay(config.actionDelay || 45000);
            
          } catch (error) {
            await this.activityLogger.log({
              type: 'error',
              description: `Error processing creator ${creator.username}: ${error instanceof Error ? error.message : 'Unknown error'}`,
              sessionId: this.currentSession.id,
              creatorId: creator.id,
              metadata: { error: String(error) },
            });

            this.currentSession.errorCount = (this.currentSession.errorCount || 0) + 1;
            await storage.updateBotSession(this.currentSession.id, {
              errorCount: this.currentSession.errorCount,
            });
          }
        }

        // Delay before next batch
        await this.delay(config.actionDelay || 45000);

      } catch (error) {
        await this.activityLogger.log({
          type: 'error',
          description: `Session loop error: ${error instanceof Error ? error.message : 'Unknown error'}`,
          sessionId: this.currentSession.id,
          metadata: { error: String(error) },
        });

        // Wait before retrying
        await this.delay(60000);
      }
    }
  }

  private async delay(ms: number): Promise<void> {
    // Add some randomness to make it more human-like
    const randomDelay = ms + (Math.random() * 5000 - 2500);
    await new Promise(resolve => setTimeout(resolve, Math.max(1000, randomDelay)));
  }

  getCurrentSession(): BotSession | null {
    return this.currentSession;
  }

  isSessionRunning(): boolean {
    return this.isRunning;
  }

  async getStatus() {
    const puppeteerStatus = this.puppeteerManager.getStatus();
    return {
      isRunning: this.isRunning,
      currentSession: this.currentSession,
      puppeteer: puppeteerStatus,
    };
  }

  setLoginStatus(isLoggedIn: boolean): void {
    // Update the internal login status
    (this.puppeteerManager as any).isLoggedIn = isLoggedIn;
  }
}
