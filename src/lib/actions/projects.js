"use server";

import { initDb } from "@/db/index";
import * as schema from "@/db/schema";
import { eq } from "drizzle-orm";

// Helper function to get next sequential custom ID for projects
async function getNextProjectCustomId(userId) {
  try {
    const db = await initDb();
    if (!db) return "PX000100";

    const projects = await db
      .select({ customId: schema.projects.customId })
      .from(schema.projects)
      .where(eq(schema.projects.ownerId, userId));

    if (projects.length === 0) return "PX000100";

    const numbers = projects.map((p) =>
      parseInt(p.customId.replace("PX", ""))
    );
    const maxNum = Math.max(...numbers);
    return `PX${String(maxNum + 1).padStart(6, "0")}`;
  } catch (error) {
    console.error("Error generating custom ID:", error);
    return `PX${String(100 + Date.now() % 900000).padStart(6, "0")}`;
  }
}

// Helper function to get next sequential custom ID for baselines
async function getNextBaselineCustomId(projectId) {
  try {
    const db = await initDb();
    if (!db) return "BX000100";

    const baselines = await db
      .select({ customId: schema.baselines.customId })
      .from(schema.baselines)
      .where(eq(schema.baselines.projectId, projectId));

    if (baselines.length === 0) return "BX000100";

    const numbers = baselines.map((b) =>
      parseInt(b.customId.replace("BX", ""))
    );
    const maxNum = Math.max(...numbers);
    return `BX${String(maxNum + 1).padStart(6, "0")}`;
  } catch (error) {
    console.error("Error generating baseline custom ID:", error);
    return `BX${String(100 + Date.now() % 900000).padStart(6, "0")}`;
  }
}

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

// Get single project by customId (from URL)
export async function getProject(customId) {
  try {
    const db = await initDb();
    if (!db) return { error: "Database connection failed" };

    const project = await db
      .select()
      .from(schema.projects)
      .where(eq(schema.projects.customId, customId));

    return { success: true, data: project[0] || null };
  } catch (error) {
    console.error("Error fetching project:", error);
    return { error: error.message || "Failed to fetch project" };
  }
}

// Get project ID by customId (helper function)
async function getProjectIdByCustomId(customId) {
  try {
    const db = await initDb();
    if (!db) return null;

    const project = await db
      .select({ id: schema.projects.id })
      .from(schema.projects)
      .where(eq(schema.projects.customId, customId));

    return project[0]?.id || null;
  } catch (error) {
    console.error("Error fetching project ID:", error);
    return null;
  }
}

// Get project configuration by customId
export async function getProjectConfig(customId) {
  try {
    const db = await initDb();
    if (!db) return { error: "Database connection failed" };

    const projectId = await getProjectIdByCustomId(customId);
    if (!projectId) return { error: "Project not found" };

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

// Get all changes for a project by customId
export async function getProjectChanges(customId) {
  try {
    const db = await initDb();
    if (!db) return { error: "Database connection failed" };

    const projectId = await getProjectIdByCustomId(customId);
    if (!projectId) return { error: "Project not found" };

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

// Get all baselines for a project by customId
export async function getProjectBaselines(customId) {
  try {
    const db = await initDb();
    if (!db) return { error: "Database connection failed" };

    const projectId = await getProjectIdByCustomId(customId);
    if (!projectId) return { error: "Project not found" };

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

// Get all modules for a project by customId
export async function getProjectModules(customId) {
  try {
    const db = await initDb();
    if (!db) return { error: "Database connection failed" };

    const projectId = await getProjectIdByCustomId(customId);
    if (!projectId) return { error: "Project not found" };

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

    // Validate required fields
    if (!projectData.name || !projectData.name.trim()) {
      return { error: "Project name is required" };
    }

    // Generate sequential custom ID for project
    const customId = await getNextProjectCustomId(userId);

    // Create project
    let projectResult;
    try {
      projectResult = await db
        .insert(schema.projects)
        .values({
          name: projectData.name,
          description: projectData.description,
          customId,
          ownerId: userId,
          createdAt: new Date(),
        })
        .returning();
    } catch (err) {
      console.error("Error inserting project:", err.message);
      return { error: `Failed to create project: ${err.message}` };
    }

    if (projectResult.length === 0) {
      return { error: "Failed to create project in database" };
    }

    const project = projectResult[0];

    // Create initial baseline
    const baselineCustomId = await getNextBaselineCustomId(project.id);
    let baselineResult;
    try {
      baselineResult = await db
        .insert(schema.baselines)
        .values({
          customId: baselineCustomId,
          projectId: project.id,
          versionLabel: "v1.0",
          totalEffortHours: 0,
          totalBudgetEst: projectData.totalBudget || 0,
          isActive: true,
        })
        .returning();
    } catch (err) {
      console.error("Error inserting baseline:", err.message);
      return { error: `Failed to create baseline: ${err.message}` };
    }

    if (baselineResult.length === 0) {
      return { error: "Failed to create initial baseline" };
    }

    // Create initial project configuration
    let configResult;
    try {
      configResult = await db
        .insert(schema.projectConfigs)
        .values({
          projectId: project.id,
          totalBudget: projectData.totalBudget || 0,
          estimatedDuration: projectData.estimatedDuration || 0,
          budgetTolerancePct: 0.15,
          scheduleTolerancePct: 0.15,
          hourlyRate: 0,
          teamSize: 1,
          teamExpLevel: 5,
        })
        .returning();
    } catch (err) {
      console.error("Error inserting config:", err.message);
      return { error: `Failed to create config: ${err.message}` };
    }

    if (configResult.length === 0) {
      return { error: "Failed to create project configuration" };
    }

    return {
      success: true,
      data: project,
    };
  } catch (error) {
    console.error("Error creating project:", error);
    console.error("Error details:", error.message || error);
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
