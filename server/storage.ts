import { 
  users, 
  botSessions, 
  creators, 
  activities, 
  botConfig,
  type User, 
  type InsertUser,
  type BotSession,
  type InsertBotSession,
  type Creator,
  type InsertCreator,
  type Activity,
  type InsertActivity,
  type BotConfig,
  type InsertBotConfig,
  type BotStatus,
  type DashboardMetrics
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, sql } from "drizzle-orm";

export interface IStorage {
  // User management
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<User>): Promise<User | undefined>;

  // Bot sessions
  createBotSession(session: InsertBotSession): Promise<BotSession>;
  updateBotSession(id: number, updates: Partial<BotSession>): Promise<BotSession | undefined>;
  getCurrentSession(): Promise<BotSession | undefined>;
  getRecentSessions(limit?: number): Promise<BotSession[]>;

  // Creators
  createCreator(creator: InsertCreator): Promise<Creator>;
  updateCreator(id: number, updates: Partial<Creator>): Promise<Creator | undefined>;
  getCreatorByUsername(username: string): Promise<Creator | undefined>;
  getCreatorsForInvitation(limit: number): Promise<Creator[]>;
  getCreatorStats(): Promise<{ total: number; active: number; pending: number }>;

  // Activities
  logActivity(activity: InsertActivity): Promise<Activity>;
  getRecentActivities(limit?: number): Promise<Activity[]>;
  getActivitiesBySession(sessionId: number): Promise<Activity[]>;

  // Bot configuration
  getBotConfig(): Promise<BotConfig | undefined>;
  updateBotConfig(config: Partial<BotConfig>): Promise<BotConfig>;

  // Dashboard metrics
  getDashboardMetrics(): Promise<DashboardMetrics>;
  getBotStatus(): Promise<BotStatus>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private botSessions: Map<number, BotSession>;
  private creators: Map<number, Creator>;
  private activities: Map<number, Activity>;
  private botConfigs: Map<number, BotConfig>;
  private currentUserId: number;
  private currentSessionId: number;
  private currentCreatorId: number;
  private currentActivityId: number;
  private currentConfigId: number;

  constructor() {
    this.users = new Map();
    this.botSessions = new Map();
    this.creators = new Map();
    this.activities = new Map();
    this.botConfigs = new Map();
    this.currentUserId = 1;
    this.currentSessionId = 1;
    this.currentCreatorId = 1;
    this.currentActivityId = 1;
    this.currentConfigId = 1;

    // Initialize default user
    this.initializeDefaultUser();
    
    // Initialize default config
    this.initializeDefaultConfig();
  }

  private initializeDefaultUser() {
    const defaultUser: User = {
      id: 1,
      username: 'digi4u_admin',
      password: 'admin123',
    };
    this.users.set(1, defaultUser);
  }

  private initializeDefaultConfig() {
    const defaultConfig: BotConfig = {
      id: 1,
      minFollowers: 10000,
      maxFollowers: 1000000,
      dailyLimit: 500,
      actionDelay: 45000,
      categories: [
        'REPAIR PARTS',
        'TABLET PARTS', 
        'PARTS & TOOLS',
        'GADGET & ACCESSORIES',
        'SCOOTER',
        'BUSSINESS PARTNERS',
        'CONTACT'
      ],
      subCategories: [],
      productNames: [],
      isActive: false,
      updatedAt: new Date(),
    };
    this.botConfigs.set(1, defaultConfig);
    
    // Initialize sample creators
    this.initializeSampleCreators();
  }

  private initializeSampleCreators() {
    const sampleCreators = [
      { username: '@repair_expert', followers: 125000, category: 'REPAIR PARTS' },
      { username: '@tablet_repair_uk', followers: 89000, category: 'TABLET PARTS' },
      { username: '@tools_expert', followers: 156000, category: 'PARTS & TOOLS' },
      { username: '@gadget_reviews', followers: 67000, category: 'GADGET & ACCESSORIES' },
      { username: '@scooter_pro', followers: 234000, category: 'SCOOTER' },
      { username: '@business_tech', followers: 78000, category: 'BUSSINESS PARTNERS' }
    ];

    sampleCreators.forEach(creator => {
      const id = this.currentCreatorId++;
      const creatorData: Creator = {
        id,
        username: creator.username,
        followers: creator.followers,
        category: creator.category,
        lastInvited: null,
        inviteStatus: null,
        metadata: {},
        createdAt: new Date(),
      };
      this.creators.set(id, creatorData);
    });

    // Add some sample activities
    this.initializeSampleActivities();
  }

  private initializeSampleActivities() {
    const sampleActivities = [
      { type: 'system' as const, description: 'Browser initialized successfully' },
      { type: 'login_success' as const, description: 'Successfully logged into TikTok Seller Center' },
      { type: 'invite_sent' as const, description: 'Invitation sent to @home_supplies_expert' },
      { type: 'invite_accepted' as const, description: '@beauty_by_sarah accepted invitation' },
      { type: 'system' as const, description: 'Bot session started' },
    ];

    sampleActivities.forEach(activity => {
      const id = this.currentActivityId++;
      const activityData: Activity = {
        id,
        type: activity.type,
        description: activity.description,
        metadata: null,
        sessionId: null,
        creatorId: null,
        createdAt: new Date(Date.now() - Math.random() * 86400000), // Random time in last 24h
      };
      this.activities.set(id, activityData);
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: number, updates: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...updates };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Bot session methods
  async createBotSession(insertSession: InsertBotSession): Promise<BotSession> {
    const id = this.currentSessionId++;
    const session: BotSession = {
      id,
      status: insertSession.status || 'idle',
      startTime: insertSession.startTime || null,
      endTime: insertSession.endTime || null,
      invitesSent: insertSession.invitesSent || 0,
      successfulInvites: insertSession.successfulInvites || 0,
      errorCount: insertSession.errorCount || 0,
      settings: insertSession.settings || null,
      metadata: {},
      createdAt: new Date(),
    };
    this.botSessions.set(id, session);
    return session;
  }

  async updateBotSession(id: number, updates: Partial<BotSession>): Promise<BotSession | undefined> {
    const session = this.botSessions.get(id);
    if (!session) return undefined;
    
    const updatedSession = { ...session, ...updates };
    this.botSessions.set(id, updatedSession);
    return updatedSession;
  }

  async getCurrentSession(): Promise<BotSession | undefined> {
    return Array.from(this.botSessions.values())
      .filter(session => session.status === 'running' || session.status === 'paused')
      .sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0))[0];
  }

  async getRecentSessions(limit = 10): Promise<BotSession[]> {
    return Array.from(this.botSessions.values())
      .sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0))
      .slice(0, limit);
  }

  // Creator methods
  async createCreator(insertCreator: InsertCreator): Promise<Creator> {
    const id = this.currentCreatorId++;
    const creator: Creator = {
      id,
      username: insertCreator.username,
      followers: insertCreator.followers || null,
      category: insertCreator.category || null,
      lastInvited: insertCreator.lastInvited || null,
      inviteStatus: insertCreator.inviteStatus || null,
      metadata: {},
      createdAt: new Date(),
    };
    this.creators.set(id, creator);
    return creator;
  }

  async updateCreator(id: number, updates: Partial<Creator>): Promise<Creator | undefined> {
    const creator = this.creators.get(id);
    if (!creator) return undefined;
    
    const updatedCreator = { ...creator, ...updates };
    this.creators.set(id, updatedCreator);
    return updatedCreator;
  }

  async getCreatorByUsername(username: string): Promise<Creator | undefined> {
    return Array.from(this.creators.values()).find(creator => creator.username === username);
  }

  async getCreatorsForInvitation(limit: number): Promise<Creator[]> {
    const config = await this.getBotConfig();
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    
    return Array.from(this.creators.values())
      .filter(creator => {
        // Filter by follower count
        const followersInRange = creator.followers && 
          creator.followers >= (config?.minFollowers || 0) &&
          creator.followers <= (config?.maxFollowers || 999999999);
        
        // Filter by last invited (not invited in last 24 hours)
        const notRecentlyInvited = !creator.lastInvited || creator.lastInvited < oneDayAgo;
        
        // Filter by status (not already accepted)
        const availableForInvite = creator.inviteStatus !== 'accepted';
        
        return followersInRange && notRecentlyInvited && availableForInvite;
      })
      .slice(0, limit);
  }

  async getCreatorStats(): Promise<{ total: number; active: number; pending: number }> {
    const creators = Array.from(this.creators.values());
    return {
      total: creators.length,
      active: creators.filter(c => c.inviteStatus === 'accepted').length,
      pending: creators.filter(c => c.inviteStatus === 'pending' || c.inviteStatus === 'sent').length,
    };
  }

  // Activity methods
  async logActivity(insertActivity: InsertActivity): Promise<Activity> {
    const id = this.currentActivityId++;
    const activity: Activity = {
      id,
      type: insertActivity.type,
      description: insertActivity.description,
      metadata: insertActivity.metadata || null,
      sessionId: insertActivity.sessionId || null,
      creatorId: insertActivity.creatorId || null,
      createdAt: new Date(),
    };
    this.activities.set(id, activity);
    return activity;
  }

  async getRecentActivities(limit = 50): Promise<Activity[]> {
    return Array.from(this.activities.values())
      .sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0))
      .slice(0, limit);
  }

  async getActivitiesBySession(sessionId: number): Promise<Activity[]> {
    return Array.from(this.activities.values())
      .filter(activity => activity.sessionId === sessionId)
      .sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0));
  }

  // Bot configuration methods
  async getBotConfig(): Promise<BotConfig | undefined> {
    return this.botConfigs.get(1); // Single config for now
  }

  async updateBotConfig(updates: Partial<BotConfig>): Promise<BotConfig> {
    const existing = this.botConfigs.get(1);
    const config: BotConfig = {
      ...existing!,
      ...updates,
      updatedAt: new Date(),
    };
    this.botConfigs.set(1, config);
    return config;
  }

  // Dashboard metrics
  async getDashboardMetrics(): Promise<DashboardMetrics> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayActivities = Array.from(this.activities.values())
      .filter(activity => activity.createdAt && activity.createdAt >= today);
    
    const invitesSent = todayActivities.filter(a => a.type === 'invite_sent').length;
    const invitesAccepted = todayActivities.filter(a => a.type === 'invite_accepted').length;
    
    const creatorStats = await this.getCreatorStats();
    const config = await this.getBotConfig();
    
    return {
      invitesSent,
      acceptanceRate: invitesSent > 0 ? Math.round((invitesAccepted / invitesSent) * 100) : 0,
      activeCreators: creatorStats.active,
      estimatedRevenue: creatorStats.active * 50, // Mock calculation
      dailyProgress: {
        current: invitesSent,
        target: config?.dailyLimit || 500,
      },
    };
  }

  async getBotStatus(): Promise<BotStatus> {
    const currentSession = await this.getCurrentSession();
    const metrics = await this.getDashboardMetrics();
    
    let uptime = '0m';
    if (currentSession?.startTime) {
      const uptimeMs = Date.now() - currentSession.startTime.getTime();
      const hours = Math.floor(uptimeMs / (1000 * 60 * 60));
      const minutes = Math.floor((uptimeMs % (1000 * 60 * 60)) / (1000 * 60));
      uptime = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
    }

    return {
      status: currentSession?.status || 'idle',
      currentSession,
      metrics: {
        todayInvites: metrics.invitesSent,
        successRate: metrics.acceptanceRate,
        activeCreators: metrics.activeCreators,
        uptime,
      },
    };
  }
}

// Database Storage implementation
export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async updateUser(id: number, updates: Partial<User>): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set(updates)
      .where(eq(users.id, id))
      .returning();
    return user || undefined;
  }

  async createBotSession(session: InsertBotSession): Promise<BotSession> {
    const [newSession] = await db
      .insert(botSessions)
      .values(session)
      .returning();
    return newSession;
  }

  async updateBotSession(id: number, updates: Partial<BotSession>): Promise<BotSession | undefined> {
    const [session] = await db
      .update(botSessions)
      .set(updates)
      .where(eq(botSessions.id, id))
      .returning();
    return session || undefined;
  }

  async getCurrentSession(): Promise<BotSession | undefined> {
    const [session] = await db
      .select()
      .from(botSessions)
      .orderBy(desc(botSessions.createdAt))
      .limit(1);
    return session || undefined;
  }

  async getRecentSessions(limit = 10): Promise<BotSession[]> {
    return await db
      .select()
      .from(botSessions)
      .orderBy(desc(botSessions.createdAt))
      .limit(limit);
  }

  async createCreator(creator: InsertCreator): Promise<Creator> {
    const [newCreator] = await db
      .insert(creators)
      .values(creator)
      .returning();
    return newCreator;
  }

  async updateCreator(id: number, updates: Partial<Creator>): Promise<Creator | undefined> {
    const [creator] = await db
      .update(creators)
      .set(updates)
      .where(eq(creators.id, id))
      .returning();
    return creator || undefined;
  }

  async getCreatorByUsername(username: string): Promise<Creator | undefined> {
    const [creator] = await db
      .select()
      .from(creators)
      .where(eq(creators.username, username));
    return creator || undefined;
  }

  async getCreatorsForInvitation(limit: number): Promise<Creator[]> {
    return await db
      .select()
      .from(creators)
      .where(eq(creators.inviteStatus, 'pending'))
      .limit(limit);
  }

  async getCreatorStats(): Promise<{ total: number; active: number; pending: number }> {
    const [stats] = await db
      .select({
        total: sql<number>`count(*)::int`,
        active: sql<number>`count(case when invite_status = 'accepted' then 1 end)::int`,
        pending: sql<number>`count(case when invite_status = 'pending' then 1 end)::int`,
      })
      .from(creators);
    
    return stats || { total: 0, active: 0, pending: 0 };
  }

  async logActivity(activity: InsertActivity): Promise<Activity> {
    const [newActivity] = await db
      .insert(activities)
      .values(activity)
      .returning();
    return newActivity;
  }

  async getRecentActivities(limit = 50): Promise<Activity[]> {
    return await db
      .select()
      .from(activities)
      .orderBy(desc(activities.createdAt))
      .limit(limit);
  }

  async getActivitiesBySession(sessionId: number): Promise<Activity[]> {
    return await db
      .select()
      .from(activities)
      .where(eq(activities.sessionId, sessionId))
      .orderBy(desc(activities.createdAt));
  }

  async getBotConfig(): Promise<BotConfig | undefined> {
    const [config] = await db
      .select()
      .from(botConfig)
      .limit(1);
    return config || undefined;
  }

  async updateBotConfig(config: Partial<BotConfig>): Promise<BotConfig> {
    const existingConfig = await this.getBotConfig();
    
    if (existingConfig) {
      const [updated] = await db
        .update(botConfig)
        .set({ ...config, updatedAt: new Date() })
        .where(eq(botConfig.id, existingConfig.id))
        .returning();
      return updated;
    } else {
      const [newConfig] = await db
        .insert(botConfig)
        .values(config)
        .returning();
      return newConfig;
    }
  }

  async getDashboardMetrics(): Promise<DashboardMetrics> {
    // Use parallel queries for better performance
    const [inviteStats, creatorStats] = await Promise.all([
      db.select({
        invitesSent: sql<number>`count(case when type = 'invite_sent' then 1 end)::int`,
        acceptedInvites: sql<number>`count(case when type = 'invite_accepted' then 1 end)::int`,
      }).from(activities),
      this.getCreatorStats()
    ]);

    const { invitesSent, acceptedInvites } = inviteStats[0];
    
    return {
      invitesSent,
      acceptanceRate: invitesSent > 0 ? (acceptedInvites / invitesSent) * 100 : 0,
      activeCreators: creatorStats.active,
      estimatedRevenue: acceptedInvites * 50, // $50 per accepted invite
      dailyProgress: {
        current: invitesSent,
        target: 500,
      },
    };
  }

  async getBotStatus(): Promise<BotStatus> {
    // Use parallel queries for better performance
    const [currentSession, inviteStats, creatorStats] = await Promise.all([
      this.getCurrentSession(),
      db.select({
        todayInvites: sql<number>`count(case when type = 'invite_sent' and date(created_at) = current_date then 1 end)::int`,
        acceptedInvites: sql<number>`count(case when type = 'invite_accepted' then 1 end)::int`,
      }).from(activities),
      this.getCreatorStats()
    ]);

    const { todayInvites, acceptedInvites } = inviteStats[0];
    
    return {
      status: currentSession?.status || 'idle',
      currentSession,
      metrics: {
        todayInvites,
        successRate: todayInvites > 0 ? (acceptedInvites / todayInvites) * 100 : 0,
        activeCreators: creatorStats.active,
        uptime: currentSession?.startTime ? 
          Math.floor((Date.now() - new Date(currentSession.startTime).getTime()) / 1000 / 60) + 'm' : 
          '0m',
      },
    };
  }
}

export const storage = new DatabaseStorage();
