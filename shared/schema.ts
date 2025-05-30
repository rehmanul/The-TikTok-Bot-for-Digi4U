import { pgTable, text, serial, integer, boolean, timestamp, decimal, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const botSessions = pgTable("bot_sessions", {
  id: serial("id").primaryKey(),
  status: text("status").notNull().default("idle"), // idle, running, paused, stopped
  startTime: timestamp("start_time"),
  endTime: timestamp("end_time"),
  invitesSent: integer("invites_sent").default(0),
  successfulInvites: integer("successful_invites").default(0),
  errorCount: integer("error_count").default(0),
  settings: jsonb("settings"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const creators = pgTable("creators", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  followers: integer("followers"),
  category: text("category"),
  lastInvited: timestamp("last_invited"),
  inviteStatus: text("invite_status").default("pending"), // pending, sent, accepted, rejected
  createdAt: timestamp("created_at").defaultNow(),
});

export const activities = pgTable("activities", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(), // invite_sent, invite_accepted, error, session_start, etc.
  description: text("description").notNull(),
  metadata: jsonb("metadata"),
  sessionId: integer("session_id").references(() => botSessions.id),
  creatorId: integer("creator_id").references(() => creators.id),
  createdAt: timestamp("created_at").defaultNow(),
});

export const botConfig = pgTable("bot_config", {
  id: serial("id").primaryKey(),
  minFollowers: integer("min_followers").default(1000),
  maxFollowers: integer("max_followers").default(1000000),
  dailyLimit: integer("daily_limit").default(500),
  actionDelay: integer("action_delay").default(45000), // in milliseconds
  categories: text("categories").array().default([]),
  isActive: boolean("is_active").default(false),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertBotSessionSchema = createInsertSchema(botSessions).omit({
  id: true,
  createdAt: true,
});

export const insertCreatorSchema = createInsertSchema(creators).omit({
  id: true,
  createdAt: true,
});

export const insertActivitySchema = createInsertSchema(activities).omit({
  id: true,
  createdAt: true,
});

export const insertBotConfigSchema = createInsertSchema(botConfig).omit({
  id: true,
  updatedAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type BotSession = typeof botSessions.$inferSelect;
export type InsertBotSession = z.infer<typeof insertBotSessionSchema>;

export type Creator = typeof creators.$inferSelect;
export type InsertCreator = z.infer<typeof insertCreatorSchema>;

export type Activity = typeof activities.$inferSelect;
export type InsertActivity = z.infer<typeof insertActivitySchema>;

export type BotConfig = typeof botConfig.$inferSelect;
export type InsertBotConfig = z.infer<typeof insertBotConfigSchema>;

// Additional types for API responses
export type BotStatus = {
  status: string;
  currentSession?: BotSession;
  metrics: {
    todayInvites: number;
    successRate: number;
    activeCreators: number;
    uptime: string;
  };
};

export type DashboardMetrics = {
  invitesSent: number;
  acceptanceRate: number;
  activeCreators: number;
  estimatedRevenue: number;
  dailyProgress: {
    current: number;
    target: number;
  };
};
