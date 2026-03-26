import {
  pgTable,
  serial,
  text,
  integer,
  boolean,
  timestamp,
  doublePrecision,
  jsonb,
  primaryKey,
  foreignKey,
} from "drizzle-orm/pg-core";

// 1. USER TABLE
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  fullName: text("full_name").notNull(),
  username: text("username").unique().notNull(),
  email: text("email").unique().notNull(),
  passwordHash: text("password_hash").notNull(),
  mobileNo: text("mobile_no").unique(),
  role: text("role").default("PM"), // PM, Admin, Developer
  isActive: boolean("is_active").default(true),
  lastLogin: timestamp("last_login"),
  createdAt: timestamp("created_at").defaultNow(),
});

// 2. PROJECT TABLE
export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  customId: text("custom_id").unique().notNull(), // e.g., PX0001
  name: text("name").notNull(),
  description: text("description"),
  ownerId: integer("owner_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// 3. PROJECT CONFIGURATION
export const projectConfigs = pgTable("project_configs", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").references(() => projects.id, {
    onDelete: "cascade",
  }),
  totalBudget: doublePrecision("total_budget").default(0),
  estimatedDuration: integer("estimated_duration").default(0), // in days
  budgetTolerancePct: doublePrecision("budget_tolerance_pct").default(0.2),
  scheduleTolerancePct: doublePrecision("schedule_tolerance_pct").default(0.15),
  hourlyRate: doublePrecision("hourly_rate"),
  teamSize: integer("team_size"),
  teamExpLevel: integer("team_exp_level").default(5), // 1-10
});

// 4. MODULES
export const modules = pgTable("modules", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").references(() => projects.id, {
    onDelete: "cascade",
  }),
  name: text("name").notNull(), // e.g., Payments, Auth
  techStack: text("tech_stack"),
});

// 5. MODULE DEPENDENCIES (Self-referencing relationship)
export const moduleDependencies = pgTable("module_dependencies", {
  id: serial("id").primaryKey(),
  parentModuleId: integer("parent_module_id").references(() => modules.id),
  childModuleId: integer("child_module_id").references(() => modules.id),
  depType: text("dep_type").default("Hard"), // Hard/Soft/Ghost
});

// 6. BASELINES (Historical Versions)
export const baselines = pgTable("baselines", {
  id: serial("id").primaryKey(),
  customId: text("custom_id").unique().notNull(), // e.g., BX0001
  projectId: integer("project_id").references(() => projects.id),
  versionLabel: text("version_label").notNull(), // v1.2
  totalEffortHours: doublePrecision("total_effort_hours"),
  totalBudgetEst: doublePrecision("total_budget_est"),
  isActive: boolean("is_active").default(false), // True for the CURRENT project state
});

// 7. BASELINE MODULE SNAPSHOTS (M:N between Baseline and Module)
export const baselineModuleSnapshots = pgTable("baseline_module_snapshots", {
  id: serial("id").primaryKey(),
  baselineId: integer("baseline_id").references(() => baselines.id, {
    onDelete: "cascade",
  }),
  moduleId: integer("module_id").references(() => modules.id),
  screenCount: integer("screen_count").default(0),
  integrationCount: integer("integration_count").default(0),
  logicRuleCount: integer("logic_rule_count").default(0),
  complexityScore: integer("complexity_score").default(5),
});

// 8. CHANGE REQUESTS
export const changeRequests = pgTable("change_requests", {
  id: serial("id").primaryKey(),
  customId: text("custom_id").unique().notNull(), // CX0001
  projectId: integer("project_id").references(() => projects.id),
  baselineId: integer("baseline_id").references(() => baselines.id), // The benchmark version
  primaryModuleId: integer("primary_module_id").references(() => modules.id),
  title: text("title").notNull(),
  description: text("description"),
  sliderInputs: jsonb("slider_inputs"), // Stores { complexity: 8, risk: 4, roi: 9... }
  numericDeltas: jsonb("numeric_deltas"), // Stores { screens: 2, apis: 1 }
  status: text("status").default("Pending"), // Pending/Accepted/Rejected
});

// 9. IMPACT RESULTS
export const impactResults = pgTable("impact_results", {
  id: serial("id").primaryKey(),
  changeId: integer("change_id").references(() => changeRequests.id, {
    onDelete: "cascade",
  }),
  finalScore: doublePrecision("final_score").notNull(), // 0-100
  predictedCostIncrease: doublePrecision("predicted_cost_increase"),
  predictedDelayDays: doublePrecision("predicted_delay_days"),
  ghostScopeFindings: jsonb("ghost_scope_findings"), // Resolved dependency list
  recommendationText: text("recommendation_text"),
  // Industry-grade metadata for transparency and audit
  weightedBreakdown: jsonb("weighted_breakdown"), // Stores { sliderContribution: 45, numericContribution: 22 }
  calculationLog: text("calculation_log"), // Store string of the formula used for transparency
  generatedAt: timestamp("generated_at").defaultNow(),
});
