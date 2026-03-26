"use server";

import { initDb } from "@/db/index";
import * as schema from "@/db/schema";
import { eq } from "drizzle-orm";

// Get all projects for a user
export async function getUserProjects(userId) {
  try {
    const db = await initDb();
    if (!db) return { error: "Database connection failed" };

    const projects = await db
      .select()
      .from(schema.projects)
      .where(eq(schema.projects.ownerId, userId));

    return { success: true, data: projects };
  } catch (error) {
    console.error("Error fetching projects:", error);
    return { error: error.message || "Failed to fetch projects" };
  }
}

// Get single project
export async function getProject(projectId) {
  try {
    const db = await initDb();
    if (!db) return { error: "Database connection failed" };

    const project = await db
      .select()
      .from(schema.projects)
      .where(eq(schema.projects.id, projectId));

    return { success: true, data: project[0] || null };
  } catch (error) {
    console.error("Error fetching project:", error);
    return { error: error.message || "Failed to fetch project" };
  }
}

// Get project configuration
export async function getProjectConfig(projectId) {
  try {
    const db = await initDb();
    if (!db) return { error: "Database connection failed" };

    const config = await db
      .select()
      .from(schema.projectConfigs)
      .where(eq(schema.projectConfigs.projectId, projectId));

    return { success: true, data: config[0] || null };
  } catch (error) {
    console.error("Error fetching project config:", error);
    return { error: error.message || "Failed to fetch project config" };
  }
}

// Get all changes for a project
export async function getProjectChanges(projectId) {
  try {
    const db = await initDb();
    if (!db) return { error: "Database connection failed" };

    const changes = await db
      .select()
      .from(schema.changeRequests)
      .where(eq(schema.changeRequests.projectId, projectId));

    return { success: true, data: changes };
  } catch (error) {
    console.error("Error fetching changes:", error);
    return { error: error.message || "Failed to fetch changes" };
  }
}

// Get single change request
export async function getChangeRequest(changeId) {
  try {
    const db = await initDb();
    if (!db) return { error: "Database connection failed" };

    const change = await db
      .select()
      .from(schema.changeRequests)
      .where(eq(schema.changeRequests.id, changeId));

    return { success: true, data: change[0] || null };
  } catch (error) {
    console.error("Error fetching change request:", error);
    return { error: error.message || "Failed to fetch change request" };
  }
}

// Get all baselines for a project
export async function getProjectBaselines(projectId) {
  try {
    const db = await initDb();
    if (!db) return { error: "Database connection failed" };

    const baselines = await db
      .select()
      .from(schema.baselines)
      .where(eq(schema.baselines.projectId, projectId));

    return { success: true, data: baselines };
  } catch (error) {
    console.error("Error fetching baselines:", error);
    return { error: error.message || "Failed to fetch baselines" };
  }
}

// Get single baseline
export async function getBaseline(baselineId) {
  try {
    const db = await initDb();
    if (!db) return { error: "Database connection failed" };

    const baseline = await db
      .select()
      .from(schema.baselines)
      .where(eq(schema.baselines.id, baselineId));

    return { success: true, data: baseline[0] || null };
  } catch (error) {
    console.error("Error fetching baseline:", error);
    return { error: error.message || "Failed to fetch baseline" };
  }
}

// Get all modules for a project
export async function getProjectModules(projectId) {
  try {
    const db = await initDb();
    if (!db) return { error: "Database connection failed" };

    const modules = await db
      .select()
      .from(schema.modules)
      .where(eq(schema.modules.projectId, projectId));

    return { success: true, data: modules };
  } catch (error) {
    console.error("Error fetching modules:", error);
    return { error: error.message || "Failed to fetch modules" };
  }
}

// Get impact results for a change
export async function getChangeImpactResults(changeId) {
  try {
    const db = await initDb();
    if (!db) return { error: "Database connection failed" };

    const impacts = await db
      .select()
      .from(schema.impactResults)
      .where(eq(schema.impactResults.changeId, changeId));

    return { success: true, data: impacts[0] || null };
  } catch (error) {
    console.error("Error fetching impact results:", error);
    return { error: error.message || "Failed to fetch impact results" };
  }
}

// Create new project
export async function createProject(userId, projectData) {
  try {
    const db = await initDb();
    if (!db) return { error: "Database connection failed" };

    const result = await db
      .insert(schema.projects)
      .values({
        ...projectData,
        ownerId: userId,
        createdAt: new Date(),
      })
      .returning();

    return { success: true, data: result[0] };
  } catch (error) {
    console.error("Error creating project:", error);
    return { error: error.message || "Failed to create project" };
  }
}

// Create new change request
export async function createChangeRequest(projectId, changeData) {
  try {
    const db = await initDb();
    if (!db) return { error: "Database connection failed" };

    const result = await db
      .insert(schema.changeRequests)
      .values({
        ...changeData,
        projectId: projectId,
        createdAt: new Date(),
      })
      .returning();

    return { success: true, data: result[0] };
  } catch (error) {
    console.error("Error creating change request:", error);
    return { error: error.message || "Failed to create change request" };
  }
}

// Update change request
export async function updateChangeRequest(changeId, changeData) {
  try {
    const db = await initDb();
    if (!db) return { error: "Database connection failed" };

    const result = await db
      .update(schema.changeRequests)
      .set(changeData)
      .where(eq(schema.changeRequests.id, changeId))
      .returning();

    return { success: true, data: result[0] };
  } catch (error) {
    console.error("Error updating change request:", error);
    return { error: error.message || "Failed to update change request" };
  }
}

// Update project configuration
export async function updateProjectConfig(projectId, configData) {
  try {
    const db = await initDb();
    if (!db) return { error: "Database connection failed" };

    const result = await db
      .update(schema.projectConfigs)
      .set(configData)
      .where(eq(schema.projectConfigs.projectId, projectId))
      .returning();

    return { success: true, data: result[0] };
  } catch (error) {
    console.error("Error updating project config:", error);
    return { error: error.message || "Failed to update project config" };
  }
}
