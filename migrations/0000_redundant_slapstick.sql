CREATE TABLE "activities" (
	"id" serial PRIMARY KEY NOT NULL,
	"type" text NOT NULL,
	"description" text NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"session_id" integer,
	"creator_id" integer,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "bot_config" (
	"id" serial PRIMARY KEY NOT NULL,
	"min_followers" integer DEFAULT 1000,
	"max_followers" integer DEFAULT 1000000,
	"daily_limit" integer DEFAULT 500,
	"action_delay" integer DEFAULT 45000,
	"categories" text[] DEFAULT '{}',
	"sub_categories" text[] DEFAULT '{}',
	"product_names" text[] DEFAULT '{}',
	"is_active" boolean DEFAULT false,
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "bot_sessions" (
	"id" serial PRIMARY KEY NOT NULL,
	"status" text DEFAULT 'idle' NOT NULL,
	"start_time" timestamp,
	"end_time" timestamp,
	"invites_sent" integer DEFAULT 0,
	"successful_invites" integer DEFAULT 0,
	"error_count" integer DEFAULT 0,
	"settings" jsonb,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "creators" (
	"id" serial PRIMARY KEY NOT NULL,
	"username" text NOT NULL,
	"followers" integer,
	"category" text,
	"last_invited" timestamp,
	"invite_status" text DEFAULT 'pending',
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "creators_username_unique" UNIQUE("username")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"username" text NOT NULL,
	"password" text NOT NULL,
	CONSTRAINT "users_username_unique" UNIQUE("username")
);
--> statement-breakpoint
ALTER TABLE "activities" ADD CONSTRAINT "activities_session_id_bot_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."bot_sessions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "activities" ADD CONSTRAINT "activities_creator_id_creators_id_fk" FOREIGN KEY ("creator_id") REFERENCES "public"."creators"("id") ON DELETE no action ON UPDATE no action;