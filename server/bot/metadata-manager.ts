import type { SessionMetadata, CreatorMetadata, ActivityMetadata } from '@shared/schema';

export class MetadataManager {
  static createSessionMetadata(data: Partial<SessionMetadata>): SessionMetadata {
    return {
      ...data,
      timestamp: new Date().toISOString()
    };
  }

  static createCreatorMetadata(data: Partial<CreatorMetadata>): CreatorMetadata {
    return {
      inviteTime: new Date().toISOString(),
      ...data,
    };
  }

  static createActivityMetadata(data: Partial<ActivityMetadata>): ActivityMetadata {
    return {
      ...data,
      timing: {
        ...data.timing,
        inviteTime: new Date().toISOString(),
      }
    };
  }

  static updateSessionMetadata(
    existing: SessionMetadata | undefined,
    updates: Partial<SessionMetadata>
  ): SessionMetadata {
    return {
      ...(existing || {}),
      ...updates,
      timestamp: new Date().toISOString()
    };
  }

  static updateCreatorMetadata(
    existing: CreatorMetadata | undefined,
    updates: Partial<CreatorMetadata>
  ): CreatorMetadata {
    return {
      ...(existing || {}),
      ...updates,
      lastInteraction: new Date().toISOString()
    };
  }

  static addInteractionToCreatorHistory(
    metadata: CreatorMetadata | undefined,
    type: string,
    sessionId: number
  ): CreatorMetadata {
    const history = metadata?.interactionHistory || [];
    return {
      ...(metadata || {}),
      lastInteraction: new Date().toISOString(),
      interactionHistory: [
        ...history,
        {
          type,
          timestamp: new Date().toISOString(),
          sessionId
        }
      ]
    };
  }

  static calculateSessionDuration(startTime: Date): number {
    return Date.now() - startTime.getTime();
  }

  static createErrorMetadata(error: Error | string): ActivityMetadata {
    return {
      error: error instanceof Error ? error.message : error,
      timestamp: new Date().toISOString()
    };
  }

  static createInitialSessionMetadata(): SessionMetadata {
    return {
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      viewport: '1920x1080',
      sessionType: 'enhanced',
      timestamp: new Date().toISOString()
    };
  }

  static createSessionPauseMetadata(startTime: Date): SessionMetadata {
    return {
      pauseTime: new Date().toISOString(),
      timeSinceStart: this.calculateSessionDuration(startTime),
      timestamp: new Date().toISOString()
    };
  }

  static createSessionResumeMetadata(): SessionMetadata {
    return {
      resumeTime: new Date().toISOString(),
      timestamp: new Date().toISOString()
    };
  }

  static createSessionStopMetadata(
    startTime: Date,
    reason: string | undefined,
    stats: { invitesSent: number; successfulInvites: number; errorCount: number }
  ): SessionMetadata {
    return {
      stopReason: reason,
      sessionDuration: this.calculateSessionDuration(startTime),
      finalStats: stats,
      timestamp: new Date().toISOString()
    };
  }
}
