import { TikTokAutomationEngine } from './tiktok-automation-engine';
import { storage } from '../storage';
import { ActivityLogger } from './activity-logger';
import type { BotSession, BotConfig } from '@shared/schema';

export class RealBotController {
  private automationEngine: TikTokAutomationEngine;
  private activityLogger: ActivityLogger;
  private currentSession: BotSession | null = null;
  private isInitialized = false;

  constructor() {
    this.automationEngine = new TikTokAutomationEngine();
    this.activityLogger = new ActivityLogger();
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      await this.automationEngine.initialize();
      this.isInitialized = true;
      
      await this.activityLogger.logBotAction('bot_controller_initialized', undefined, undefined, {
        timestamp: new Date().toISOString(),
        engine: 'TikTokAutomationEngine'
      });
    } catch (error) {
      await this.activityLogger.logError(
        error instanceof Error ? error : new Error('Failed to initialize bot controller'),
        'bot_initialization'
      );
      throw error;
    }
  }

  async startBot(credentials?: { email: string; password: string }): Promise<BotSession> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    // Check if bot is already running
    const existingSession = await storage.getCurrentSession();
    if (existingSession && existingSession.status === 'running') {
      throw new Error('Bot is already running');
    }

    const config = await storage.getBotConfig();
    if (!config) {
      throw new Error('Bot configuration not found. Please configure the bot first.');
    }

    try {
      // Create new session
      this.currentSession = await storage.createBotSession({
        status: 'initializing',
        startTime: new Date(),
        invitesSent: 0,
        successfulInvites: 0,
        errorCount: 0,
        settings: config,
        metadata: {
          userAgent: 'TikTok-Bot-v1.0',
          sessionType: 'automated_invitations',
          timestamp: new Date().toISOString()
        }
      });

      await this.activityLogger.logBotAction('bot_session_started', this.currentSession.id, undefined, {
        sessionId: this.currentSession.id,
        maxInvitesPerDay: config.maxInvitesPerDay,
        targetCategories: config.targetCategories,
        timestamp: new Date().toISOString()
      });

      // If credentials provided, attempt login
      if (credentials) {
        const loginSuccess = await this.automationEngine.loginToTikTok(credentials.email, credentials.password);
        
        if (!loginSuccess) {
          await storage.updateBotSession(this.currentSession.id, {
            status: 'error',
            endTime: new Date(),
            metadata: {
              error: 'Login failed',
              timestamp: new Date().toISOString()
            }
          });
          throw new Error('Login failed. Please check your credentials.');
        }

        await this.activityLogger.logBotAction('bot_login_successful', this.currentSession.id, undefined, {
          email: credentials.email,
          timestamp: new Date().toISOString()
        });
      }

      // Update session status to running
      await storage.updateBotSession(this.currentSession.id, {
        status: 'running'
      });

      // Start automated invitations
      this.automationEngine.startAutomatedInvitations(this.currentSession.id).catch(async (error) => {
        await this.handleAutomationError(error);
      });

      return this.currentSession;

    } catch (error) {
      if (this.currentSession) {
        await storage.updateBotSession(this.currentSession.id, {
          status: 'error',
          endTime: new Date(),
          metadata: {
            error: error instanceof Error ? error.message : String(error),
            timestamp: new Date().toISOString()
          }
        });
      }

      await this.activityLogger.logError(
        error instanceof Error ? error : new Error('Failed to start bot'),
        'bot_start'
      );
      
      throw error;
    }
  }

  async pauseBot(): Promise<void> {
    const session = await storage.getCurrentSession();
    if (!session || session.status !== 'running') {
      throw new Error('No active bot session to pause');
    }

    await storage.updateBotSession(session.id, {
      status: 'paused',
      metadata: {
        pauseTime: new Date().toISOString(),
        timestamp: new Date().toISOString()
      }
    });

    await this.activityLogger.logBotAction('bot_session_paused', session.id, undefined, {
      sessionId: session.id,
      pauseTime: new Date().toISOString()
    });
  }

  async resumeBot(): Promise<void> {
    const session = await storage.getCurrentSession();
    if (!session || session.status !== 'paused') {
      throw new Error('No paused bot session to resume');
    }

    await storage.updateBotSession(session.id, {
      status: 'running',
      metadata: {
        resumeTime: new Date().toISOString(),
        timestamp: new Date().toISOString()
      }
    });

    await this.activityLogger.logBotAction('bot_session_resumed', session.id, undefined, {
      sessionId: session.id,
      resumeTime: new Date().toISOString()
    });

    // Resume automated invitations
    this.automationEngine.startAutomatedInvitations(session.id).catch(async (error) => {
      await this.handleAutomationError(error);
    });
  }

  async stopBot(): Promise<void> {
    const session = await storage.getCurrentSession();
    if (!session) {
      throw new Error('No active bot session to stop');
    }

    await this.automationEngine.stopSession();
    
    await storage.updateBotSession(session.id, {
      status: 'stopped',
      endTime: new Date(),
      metadata: {
        stopReason: 'user_requested',
        sessionDuration: Date.now() - new Date(session.startTime).getTime(),
        timestamp: new Date().toISOString()
      }
    });

    await this.activityLogger.logBotAction('bot_session_stopped', session.id, undefined, {
      sessionId: session.id,
      reason: 'user_requested',
      finalStats: {
        invitesSent: session.invitesSent,
        successfulInvites: session.successfulInvites,
        errorCount: session.errorCount
      },
      timestamp: new Date().toISOString()
    });

    this.currentSession = null;
  }

  async emergencyStop(): Promise<void> {
    try {
      await this.automationEngine.cleanup();
      
      const session = await storage.getCurrentSession();
      if (session) {
        await storage.updateBotSession(session.id, {
          status: 'emergency_stopped',
          endTime: new Date(),
          metadata: {
            stopReason: 'emergency_stop',
            timestamp: new Date().toISOString()
          }
        });

        await this.activityLogger.logBotAction('bot_emergency_stop', session.id, undefined, {
          sessionId: session.id,
          reason: 'emergency_stop',
          timestamp: new Date().toISOString()
        });
      }

      this.currentSession = null;
      this.isInitialized = false;

    } catch (error) {
      await this.activityLogger.logError(
        error instanceof Error ? error : new Error('Emergency stop failed'),
        'emergency_stop'
      );
      throw error;
    }
  }

  async getBotStatus(): Promise<any> {
    const session = await storage.getCurrentSession();
    const config = await storage.getBotConfig();
    
    return {
      isRunning: session?.status === 'running',
      status: session?.status || 'idle',
      currentSession: session,
      configuration: config,
      uptime: session?.startTime ? 
        Math.floor((Date.now() - new Date(session.startTime).getTime()) / 1000 / 60) + 'm' : 
        '0m',
      stats: session ? {
        invitesSent: session.invitesSent,
        successfulInvites: session.successfulInvites,
        errorCount: session.errorCount,
        successRate: session.invitesSent > 0 ? 
          Math.round((session.successfulInvites / session.invitesSent) * 100) : 0
      } : null
    };
  }

  async updateBotConfig(newConfig: Partial<BotConfig>): Promise<BotConfig> {
    const updatedConfig = await storage.updateBotConfig(newConfig);
    
    await this.activityLogger.logBotAction('bot_config_updated', this.currentSession?.id, undefined, {
      config: newConfig,
      timestamp: new Date().toISOString()
    });

    return updatedConfig;
  }

  async testBotConnection(): Promise<boolean> {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      // Simple test to check if the automation engine is working
      await this.activityLogger.logBotAction('bot_connection_test', undefined, undefined, {
        result: 'success',
        timestamp: new Date().toISOString()
      });

      return true;
    } catch (error) {
      await this.activityLogger.logError(
        error instanceof Error ? error : new Error('Bot connection test failed'),
        'connection_test'
      );
      return false;
    }
  }

  private async handleAutomationError(error: any): Promise<void> {
    if (this.currentSession) {
      await storage.updateBotSession(this.currentSession.id, {
        status: 'error',
        endTime: new Date(),
        errorCount: this.currentSession.errorCount + 1,
        metadata: {
          error: error instanceof Error ? error.message : String(error),
          timestamp: new Date().toISOString()
        }
      });

      await this.activityLogger.logError(
        error instanceof Error ? error : new Error('Automation error'),
        'automation_engine',
        { sessionId: this.currentSession.id }
      );
    }
  }

  async cleanup(): Promise<void> {
    await this.automationEngine.cleanup();
    this.isInitialized = false;
    this.currentSession = null;
  }
}

// Export singleton instance
export const realBotController = new RealBotController();