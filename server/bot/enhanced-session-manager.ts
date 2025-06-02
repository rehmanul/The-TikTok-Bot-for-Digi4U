import { storage } from '../storage';
import { EnhancedPuppeteerManager } from './enhanced-puppeteer-manager';
import { CreatorFilter } from './creator-filter';
import { ActivityLogger } from './activity-logger';
import { MetadataManager } from './metadata-manager';
import type { BotSession, BotConfig, SessionMetadata, CreatorMetadata, ActivityMetadata } from '@shared/schema';

export class EnhancedSessionManager {
  private puppeteerManager: EnhancedPuppeteerManager;
  private creatorFilter: CreatorFilter;
  private activityLogger: ActivityLogger;
  private currentSession: BotSession | null = null;
  private isRunning = false;
  private shouldStop = false;
  private lastActionTime: number = 0;

  constructor() {
    this.puppeteerManager = new EnhancedPuppeteerManager();
    this.creatorFilter = new CreatorFilter();
    this.activityLogger = new ActivityLogger();
  }

  private async enforceHumanLikeDelay(minDelay: number = 30000, maxDelay: number = 60000): Promise<void> {
    const now = Date.now();
    const timeSinceLastAction = now - this.lastActionTime;
    
    if (timeSinceLastAction < minDelay) {
      const delay = Math.random() * (maxDelay - minDelay) + minDelay;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
    
    this.lastActionTime = Date.now();
  }

  async startSession(): Promise<BotSession> {
    if (this.isRunning) {
      throw new Error('Session is already running');
    }

    const config = await storage.getBotConfig();
    if (!config) {
      throw new Error('Bot configuration not found');
    }

    try {
      this.currentSession = await storage.createBotSession({
        status: 'initializing',
        startTime: new Date(),
        invitesSent: 0,
        successfulInvites: 0,
        errorCount: 0,
        settings: config,
        metadata: MetadataManager.createInitialSessionMetadata()
      });

      this.isRunning = true;
      this.shouldStop = false;
      this.lastActionTime = Date.now();

      await this.activityLogger.log({
        type: 'session_start',
        description: 'Enhanced bot session started with human-like behavior',
        sessionId: this.currentSession.id,
        metadata: MetadataManager.createActivityMetadata({
          config,
          enhanced: true
        })
      });

      await this.puppeteerManager.initialize();
      const loginSuccess = await this.puppeteerManager.login();

      if (!loginSuccess) {
        throw new Error('Login failed');
      }

      await storage.updateBotSession(this.currentSession.id, {
        status: 'running'
      });

      this.runEnhancedInvitationLoop(config);

      return this.currentSession;
    } catch (error) {
      this.isRunning = false;
      if (this.currentSession) {
        await storage.updateBotSession(this.currentSession.id, {
          status: 'error',
          endTime: new Date(),
          metadata: MetadataManager.createErrorMetadata(error instanceof Error ? error : String(error))
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
      metadata: MetadataManager.createSessionPauseMetadata(this.currentSession.startTime || new Date())
    });

    await this.activityLogger.log({
      type: 'session_pause',
      description: 'Bot session paused',
      sessionId: this.currentSession.id,
      metadata: MetadataManager.createActivityMetadata({
        sessionDuration: MetadataManager.calculateSessionDuration(this.currentSession.startTime || new Date())
      })
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
    this.lastActionTime = Date.now();

    await storage.updateBotSession(this.currentSession.id, {
      status: 'running',
      metadata: MetadataManager.createSessionResumeMetadata()
    });

    await this.activityLogger.log({
      type: 'session_resume',
      description: 'Bot session resumed',
      sessionId: this.currentSession.id,
      metadata: MetadataManager.createActivityMetadata({
        timestamp: new Date().toISOString()
      })
    });

    this.runEnhancedInvitationLoop(config);
  }

  async stopSession(reason?: string): Promise<void> {
    this.shouldStop = true;
    this.isRunning = false;

    if (this.currentSession) {
      const stats = {
        invitesSent: this.currentSession.invitesSent || 0,
        successfulInvites: this.currentSession.successfulInvites || 0,
        errorCount: this.currentSession.errorCount || 0
      };

      await storage.updateBotSession(this.currentSession.id, {
        status: 'stopped',
        endTime: new Date(),
        metadata: MetadataManager.createSessionStopMetadata(
          this.currentSession.startTime || new Date(),
          reason,
          stats
        )
      });

      await this.activityLogger.log({
      type: 'session_stop',
      description: reason || 'Bot session stopped',
      sessionId: this.currentSession.id,
      metadata: MetadataManager.createActivityMetadata({
        reason,
        stats,
        sessionDuration: MetadataManager.calculateSessionDuration(this.currentSession.startTime || new Date())
      })
      });
    }

    await this.puppeteerManager.close();
    this.currentSession = null;
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
      lastActionTime: this.lastActionTime,
      timeSinceLastAction: Date.now() - this.lastActionTime
    };
  }

  private async runEnhancedInvitationLoop(config: BotConfig): Promise<void> {
    while (this.isRunning && !this.shouldStop && this.currentSession) {
      try {
        await this.enforceHumanLikeDelay();
        await this.processCreatorBatch(config);
      } catch (error) {
        await this.handleLoopError(error);
      }
    }
  }

  private async processCreatorBatch(config: BotConfig): Promise<void> {
    const creators = await this.creatorFilter.getRecommendedCreators(5);
    
    if (creators.length === 0) {
      await this.activityLogger.log({
        type: 'info',
        description: 'No eligible creators found for invitation',
        sessionId: this.currentSession!.id,
        metadata: MetadataManager.createActivityMetadata({})
      });
      
      await this.enforceHumanLikeDelay(120000, 180000);
      return;
    }

    for (const creator of creators) {
      if (this.shouldStop) break;

      try {
        await this.enforceHumanLikeDelay(45000, 90000);
        await this.processCreator(creator);
      } catch (error) {
        await this.handleCreatorError(creator, error);
      }
    }
  }

  private async processCreator(creator: any): Promise<void> {
    const success = await this.puppeteerManager.sendInvite(creator.username);
    
    if (success && this.currentSession) {
      await this.updateCreatorStatus(creator);
      await this.updateSessionStats();
      await this.logCreatorSuccess(creator);
    }
  }

  private async updateCreatorStatus(creator: any): Promise<void> {
    await storage.updateCreator(creator.id, {
      inviteStatus: 'sent',
      lastInvited: new Date(),
      metadata: MetadataManager.createCreatorMetadata({
        sessionId: this.currentSession!.id
      })
    });
  }

  private async updateSessionStats(): Promise<void> {
    if (!this.currentSession) return;

    this.currentSession.invitesSent = (this.currentSession.invitesSent || 0) + 1;
    this.currentSession.successfulInvites = (this.currentSession.successfulInvites || 0) + 1;

    await storage.updateBotSession(this.currentSession.id, {
      invitesSent: this.currentSession.invitesSent,
      successfulInvites: this.currentSession.successfulInvites
    });
  }

  private async logCreatorSuccess(creator: any): Promise<void> {
    await this.activityLogger.log({
      type: 'invite_sent',
      description: `Successfully sent invitation to ${creator.username}`,
      sessionId: this.currentSession!.id,
      creatorId: creator.id,
      metadata: MetadataManager.createActivityMetadata({
        username: creator.username,
        followers: creator.followers,
        category: creator.category,
        timing: {
          timeSinceLastAction: Date.now() - this.lastActionTime
        }
      })
    });
  }

  private async handleCreatorError(creator: any, error: any): Promise<void> {
    if (!this.currentSession) return;

    await this.activityLogger.log({
      type: 'error',
      description: `Error processing creator ${creator.username}`,
      sessionId: this.currentSession.id,
      creatorId: creator.id,
      metadata: MetadataManager.createErrorMetadata(error)
    });

    this.currentSession.errorCount = (this.currentSession.errorCount || 0) + 1;
    await storage.updateBotSession(this.currentSession.id, {
      errorCount: this.currentSession.errorCount
    });

    await this.enforceHumanLikeDelay(60000, 120000);
  }

  private async handleLoopError(error: any): Promise<void> {
    if (!this.currentSession) return;

    await this.activityLogger.log({
      type: 'error',
      description: 'Session loop error',
      sessionId: this.currentSession.id,
      metadata: MetadataManager.createErrorMetadata(error)
    });

    await this.enforceHumanLikeDelay(180000, 300000);
  }
}
