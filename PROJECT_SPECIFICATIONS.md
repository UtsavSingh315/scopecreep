Project Specification: Scope Creep Analyzer (SCA)

1. Project Vision & Executive Summary
   The Scope Creep Analyzer (SCA) is a specialized project management tool designed to combat "Scope Creep"—the uncontrolled growth of a project's scope without adjustments to time, cost, and resources.

Unlike traditional project management software (like Jira or Trello) which simply tracks tasks, the SCA acts as a Decision Support System. It uses a Hybrid Analysis Model to evaluate new change requests by combining:

Quantitative Data: Numeric increases in screens, APIs, and logic units.

Subjective Insights: A "6-Slider" system representing the Project Manager's intuition on risk, ROI, and complexity.

Artificial Intelligence: An NLP service that "reads" change descriptions to find "Ghost Scope" (hidden dependencies the PM might have missed).

The system maintains an immutable Baseline History, allowing teams to see exactly how a project evolved from its original "Gold Standard" to its current state through a series of "Version Bumps."

2. Technical Stack Constraints
   Framework: Next.js 14+ (App Router, JavaScript only)

Styling: Tailwind CSS + Shadcn/UI (Lucide Icons)

Database: PostgreSQL

ORM: Drizzle ORM

Animations: Framer Motion (for interactive sliders and gauges)

3. Core Logic & Drizzle Schema
   The database must support a Snapshot Architecture. Every project has an Active Baseline. When a change is accepted, the system "clones" the current state and applies deltas to create a new version.

JavaScript
// db/schema.js
import { pgTable, serial, text, integer, timestamp, boolean } from 'drizzle-orm/pg-core';

export const projects = pgTable('projects', {
id: serial('id').primaryKey(),
name: text('name').notNull(),
description: text('description'),
createdAt: timestamp('created_at').defaultNow(),
});

export const baselines = pgTable('baselines', {
id: serial('id').primaryKey(),
projectId: integer('project_id').references(() => projects.id),
versionTag: text('version_tag').notNull(), // e.g., "v1.0", "v1.1"
isActive: boolean('is_active').default(true),
createdAt: timestamp('created_at').defaultNow(),
});

export const moduleSnapshots = pgTable('module_snapshots', {
id: serial('id').primaryKey(),
baselineId: integer('baseline_id').references(() => baselines.id),
moduleName: text('module_name').notNull(),
screens: integer('screens').default(0),
apis: integer('apis').default(0),
complexity: integer('complexity').default(5), // 1-10 slider value
}); 4. Feature Requirements (Phase 1: UI & Workflow)
A. The Interactive Change Form (/changes)
The 6-Slider System: Create a custom slider component for:

Complexity

Technical Risk

ROI (Return on Investment)

Strategic Value

Resource Effort

Logic Rules Intensity

Visual Feedback: Sliders should transition from Green (1) to Red (10) based on value.

Numeric Deltas: "Plus/Minus" counters for adding/removing Screens and APIs.

B. Impact Analysis (/impacts)
Impact Gauge: A semi-circle visualization showing a score from 0 to 100.

Verdict Logic: Display a color-coded recommendation:

Score < 30: "Low Risk - Safe to Proceed" (Green)

Score 30-70: "Moderate Risk - Review Constraints" (Yellow)

Score > 70: "High Risk - Potential Scope Creep" (Red)

C. Baseline Orchestrator (/baselines)
Implement the Version Bumping Algorithm:

On "Accept," fetch the current isActive: true baseline.

Set isActive: false for the old baseline.

Create a new baseline record.

Clone all module_snapshots from the old version to the new version, applying the deltas to the updated module.

5. UI/UX Guidelines (Engaging Design)
   Glassmorphism: Use bg-white/10 backdrop-blur-md for cards and sidebars.

Modern Palette: Dark slate backgrounds with vibrant accents (Indigo, Emerald, Rose).

Transitions: Use framer-motion for page transitions and "Success" animations when a baseline is promoted.

6. Development Instructions for Agent
   Initialize: Create Next.js project with Tailwind and Shadcn.

Database: Set up Drizzle with pg and run initial migration.

Layout: Build a persistent sidebar with links to Projects, Baselines, and Changes.

Mock Service: Create an API route that simulates the Impact Engine by returning a calculated score based on slider averages.

State Management: Use React useState to manage the complex object of sliders and deltas.
