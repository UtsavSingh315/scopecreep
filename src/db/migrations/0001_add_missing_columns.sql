ALTER TABLE "baselines" ADD COLUMN "name" text;--> statement-breakpoint
ALTER TABLE "baselines" ADD COLUMN "description" text;--> statement-breakpoint
ALTER TABLE "baselines" ADD COLUMN "created_at" timestamp DEFAULT now();--> statement-breakpoint
ALTER TABLE "project_configs" ADD COLUMN "total_budget" double precision DEFAULT 0;--> statement-breakpoint
ALTER TABLE "project_configs" ADD COLUMN "estimated_duration" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "project_configs" ADD COLUMN "created_at" timestamp DEFAULT now();--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "username" text NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_username_unique" UNIQUE("username");