CREATE TABLE "baseline_module_snapshots" (
	"id" serial PRIMARY KEY NOT NULL,
	"baseline_id" integer,
	"module_id" integer,
	"screen_count" integer DEFAULT 0,
	"integration_count" integer DEFAULT 0,
	"logic_rule_count" integer DEFAULT 0,
	"complexity_score" integer DEFAULT 5
);
--> statement-breakpoint
CREATE TABLE "baselines" (
	"id" serial PRIMARY KEY NOT NULL,
	"custom_id" text NOT NULL,
	"project_id" integer,
	"version_label" text NOT NULL,
	"total_effort_hours" double precision,
	"total_budget_est" double precision,
	"locked_at" timestamp DEFAULT now(),
	"is_active" boolean DEFAULT false,
	CONSTRAINT "baselines_custom_id_unique" UNIQUE("custom_id")
);
--> statement-breakpoint
CREATE TABLE "change_requests" (
	"id" serial PRIMARY KEY NOT NULL,
	"custom_id" text NOT NULL,
	"project_id" integer,
	"baseline_id" integer,
	"primary_module_id" integer,
	"title" text NOT NULL,
	"description" text,
	"slider_inputs" jsonb,
	"numeric_deltas" jsonb,
	"status" text DEFAULT 'Pending',
	CONSTRAINT "change_requests_custom_id_unique" UNIQUE("custom_id")
);
--> statement-breakpoint
CREATE TABLE "impact_results" (
	"id" serial PRIMARY KEY NOT NULL,
	"change_id" integer,
	"final_score" double precision NOT NULL,
	"predicted_cost_increase" double precision,
	"predicted_delay_days" double precision,
	"ghost_scope_findings" jsonb,
	"recommendation_text" text,
	"weighted_breakdown" jsonb,
	"calculation_log" text,
	"generated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "module_dependencies" (
	"id" serial PRIMARY KEY NOT NULL,
	"parent_module_id" integer,
	"child_module_id" integer,
	"dep_type" text DEFAULT 'Hard'
);
--> statement-breakpoint
CREATE TABLE "modules" (
	"id" serial PRIMARY KEY NOT NULL,
	"project_id" integer,
	"name" text NOT NULL,
	"tech_stack" text
);
--> statement-breakpoint
CREATE TABLE "project_configs" (
	"id" serial PRIMARY KEY NOT NULL,
	"project_id" integer,
	"budget_tolerance_pct" double precision DEFAULT 0.2,
	"schedule_tolerance_pct" double precision DEFAULT 0.15,
	"hourly_rate" double precision,
	"team_size" integer,
	"team_exp_level" integer DEFAULT 5
);
--> statement-breakpoint
CREATE TABLE "projects" (
	"id" serial PRIMARY KEY NOT NULL,
	"custom_id" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"owner_id" integer,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "projects_custom_id_unique" UNIQUE("custom_id")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"full_name" text NOT NULL,
	"email" text NOT NULL,
	"password_hash" text NOT NULL,
	"mobile_no" text,
	"role" text DEFAULT 'PM',
	"is_active" boolean DEFAULT true,
	"last_login" timestamp,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "users_email_unique" UNIQUE("email"),
	CONSTRAINT "users_mobile_no_unique" UNIQUE("mobile_no")
);
--> statement-breakpoint
ALTER TABLE "baseline_module_snapshots" ADD CONSTRAINT "baseline_module_snapshots_baseline_id_baselines_id_fk" FOREIGN KEY ("baseline_id") REFERENCES "public"."baselines"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "baseline_module_snapshots" ADD CONSTRAINT "baseline_module_snapshots_module_id_modules_id_fk" FOREIGN KEY ("module_id") REFERENCES "public"."modules"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "baselines" ADD CONSTRAINT "baselines_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "change_requests" ADD CONSTRAINT "change_requests_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "change_requests" ADD CONSTRAINT "change_requests_baseline_id_baselines_id_fk" FOREIGN KEY ("baseline_id") REFERENCES "public"."baselines"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "change_requests" ADD CONSTRAINT "change_requests_primary_module_id_modules_id_fk" FOREIGN KEY ("primary_module_id") REFERENCES "public"."modules"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "impact_results" ADD CONSTRAINT "impact_results_change_id_change_requests_id_fk" FOREIGN KEY ("change_id") REFERENCES "public"."change_requests"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "module_dependencies" ADD CONSTRAINT "module_dependencies_parent_module_id_modules_id_fk" FOREIGN KEY ("parent_module_id") REFERENCES "public"."modules"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "module_dependencies" ADD CONSTRAINT "module_dependencies_child_module_id_modules_id_fk" FOREIGN KEY ("child_module_id") REFERENCES "public"."modules"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "modules" ADD CONSTRAINT "modules_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_configs" ADD CONSTRAINT "project_configs_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;