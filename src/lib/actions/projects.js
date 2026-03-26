"use server";

import { initDb } from "@/db/index";
import * as schema from "@/db/schema";
import { eq, sql } from "drizzle-orm";

/**
 * Get user by username
 */
export async function getUserByUsername(username) {
  try {
    const db = await initDb();
    if (!db) return { error: "Database connection failed" };

    const user = await db
      .select({
        id: schema.users.id,
        fullName: schema.users.fullName,
        username: schema.users.username,
        email: schema.users.email,
        role: schema.users.role,
        isActive: schema.users.isActive,
      })
      .from(schema.users)
      .where(eq(schema.users.username, username));

    return { success: true, data: user[0] || null };
  } catch (error) {
    console.error("Error fetching user:", error);
    return { error: error.message || "Failed to fetch user" };
  }
}

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

    const numbers = projects.map((p) => parseInt(p.customId.replace("PX", "")));
    const maxNum = Math.max(...numbers);
    return `PX${String(maxNum + 1).padStart(6, "0")}`;
  } catch (error) {
    console.error("Error generating custom ID:", error);
    return `PX${String(100 + (Date.now() % 900000)).padStart(6, "0")}`;
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
      parseInt(b.customId.replace("BX", "")),
    );
    const maxNum = Math.max(...numbers);
    return `BX${String(maxNum + 1).padStart(6, "0")}`;
  } catch (error) {
    console.error("Error generating baseline custom ID:", error);
    return `BX${String(100 + (Date.now() % 900000)).padStart(6, "0")}`;
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

    // Fetch changes with their impact results
    const changes = await db
      .select({
        id: schema.changeRequests.id,
        customId: schema.changeRequests.customId,
        projectId: schema.changeRequests.projectId,
        baselineId: schema.changeRequests.baselineId,
        primaryModuleId: schema.changeRequests.primaryModuleId,
        title: schema.changeRequests.title,
        description: schema.changeRequests.description,
        sliderInputs: schema.changeRequests.sliderInputs,
        numericDeltas: schema.changeRequests.numericDeltas,
        status: schema.changeRequests.status,
        impactScore: schema.impactResults.finalScore,
        recommendation: schema.impactResults.recommendationText,
      })
      .from(schema.changeRequests)
      .leftJoin(
        schema.impactResults,
        eq(schema.changeRequests.id, schema.impactResults.changeId),
      )
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
      .select({
        id: schema.changeRequests.id,
        customId: schema.changeRequests.customId,
        projectId: schema.changeRequests.projectId,
        baselineId: schema.changeRequests.baselineId,
        primaryModuleId: schema.changeRequests.primaryModuleId,
        title: schema.changeRequests.title,
        description: schema.changeRequests.description,
        sliderInputs: schema.changeRequests.sliderInputs,
        numericDeltas: schema.changeRequests.numericDeltas,
        status: schema.changeRequests.status,
      })
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

    // Fetch snapshots for each baseline
    const baselinesWithSnapshots = await Promise.all(
      baselines.map(async (baseline) => {
        const snapshots = await db
          .select()
          .from(schema.baselineModuleSnapshots)
          .where(eq(schema.baselineModuleSnapshots.baselineId, baseline.id));

        // Fetch module names for snapshots
        const snapshotsWithNames = await Promise.all(
          snapshots.map(async (snapshot) => {
            const module = await db
              .select({ name: schema.modules.name })
              .from(schema.modules)
              .where(eq(schema.modules.id, snapshot.moduleId));
            return {
              ...snapshot,
              moduleName: module[0]?.name || "Unknown",
            };
          }),
        );

        return {
          ...baseline,
          snapshots: snapshotsWithNames,
        };
      }),
    );

    return { success: true, data: baselinesWithSnapshots };
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
async function getAllTransitiveDependencies(db, moduleId, visited = new Set()) {
  if (visited.has(moduleId)) return [];
  visited.add(moduleId);

  // Get direct dependencies (what this module depends ON)
  const directDeps = await db
    .select({
      childModuleId: schema.moduleDependencies.childModuleId,
      depType: schema.moduleDependencies.depType,
    })
    .from(schema.moduleDependencies)
    .where(eq(schema.moduleDependencies.parentModuleId, moduleId));

  // Recursively get transitive dependencies
  let allDeps = [...directDeps];
  for (const dep of directDeps) {
    const transitiveDeps = await getAllTransitiveDependencies(
      db,
      dep.childModuleId,
      visited,
    );
    allDeps = [
      ...allDeps,
      ...transitiveDeps.filter(
        (td) => !allDeps.find((ad) => ad.childModuleId === td.childModuleId),
      ),
    ];
  }

  return allDeps;
}

async function getAllTransitiveDependents(db, moduleId, visited = new Set()) {
  if (visited.has(moduleId)) return [];
  visited.add(moduleId);

  // Get direct dependents (what depends ON this module)
  const directDependents = await db
    .select({
      parentModuleId: schema.moduleDependencies.parentModuleId,
      depType: schema.moduleDependencies.depType,
    })
    .from(schema.moduleDependencies)
    .where(eq(schema.moduleDependencies.childModuleId, moduleId));

  // Recursively get transitive dependents
  let allDependents = [...directDependents];
  for (const dependent of directDependents) {
    const transitiveDependents = await getAllTransitiveDependents(
      db,
      dependent.parentModuleId,
      visited,
    );
    allDependents = [
      ...allDependents,
      ...transitiveDependents.filter(
        (td) =>
          !allDependents.find((ad) => ad.parentModuleId === td.parentModuleId),
      ),
    ];
  }

  return allDependents;
}

export async function getProjectModulesForImpact(customId) {
  try {
    const db = await initDb();
    if (!db) return { error: "Database connection failed" };

    const projectId = await getProjectIdByCustomId(customId);
    if (!projectId) return { error: "Project not found" };

    const modules = await db
      .select()
      .from(schema.modules)
      .where(eq(schema.modules.projectId, projectId));

    // Fetch DIRECT dependents only for each module (for impact analysis hierarchy)
    const modulesWithImpact = await Promise.all(
      modules.map(async (module) => {
        // Get only direct modules that depend on this module (one level only)
        const directDependents = await db
          .select({
            parentModuleId: schema.moduleDependencies.parentModuleId,
            depType: schema.moduleDependencies.depType,
          })
          .from(schema.moduleDependencies)
          .where(eq(schema.moduleDependencies.childModuleId, module.id));

        // Deduplicate by parentModuleId
        const uniqueDependents = Array.from(
          new Map(directDependents.map((d) => [d.parentModuleId, d])).values(),
        );

        return {
          ...module,
          dependencyList: uniqueDependents.map((d) => ({
            id: d.parentModuleId,
            type: d.depType,
          })),
        };
      }),
    );

    return { success: true, data: modulesWithImpact };
  } catch (error) {
    console.error("Error fetching modules for impact:", error);
    return { error: error.message || "Failed to fetch modules" };
  }
}

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

    // Fetch all transitive dependencies for each module
    const modulesWithDeps = await Promise.all(
      modules.map(async (module) => {
        // Get all modules this module depends on (direct + transitive)
        // For display: show what THIS module depends on
        const allDeps = await getAllTransitiveDependencies(db, module.id);

        // Deduplicate by childModuleId to avoid showing same module twice
        const uniqueDeps = Array.from(
          new Map(allDeps.map((d) => [d.childModuleId, d])).values(),
        );

        return {
          ...module,
          dependencyList: uniqueDeps.map((d) => ({
            id: d.childModuleId,
            type: d.depType,
          })),
        };
      }),
    );

    return { success: true, data: modulesWithDeps };
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
      // Convert estimated duration (days) to effort hours (8 hours per day)
      const estimatedDurationDays = projectData.estimatedDuration || 0;
      const totalEffortHours = estimatedDurationDays * 8;

      // Insert baseline without locked_at - let database use DEFAULT
      baselineResult = await db
        .insert(schema.baselines)
        .values({
          customId: baselineCustomId,
          projectId: project.id,
          versionLabel: "v1.0",
          totalEffortHours: totalEffortHours,
          totalBudgetEst: projectData.totalBudget || 0,
          isActive: true,
        })
        .returning();
    } catch (err) {
      console.error("Error inserting baseline:", err.message);
      console.error("Full error:", err);
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

    // Serialize dates to ISO strings for client
    const serializedProject = {
      ...project,
      createdAt:
        project.createdAt instanceof Date
          ? project.createdAt.toISOString().split("T")[0]
          : project.createdAt,
    };

    return {
      success: true,
      data: serializedProject,
    };
  } catch (error) {
    console.error("Error creating project:", error);
    console.error("Error details:", error.message || error);
    return { error: error.message || "Failed to create project" };
  }
}

// Helper function to get next sequential custom ID for changes
async function getNextChangeCustomId(projectId) {
  try {
    const db = await initDb();
    if (!db) return "CX000100";

    const changes = await db
      .select({ customId: schema.changeRequests.customId })
      .from(schema.changeRequests)
      .where(eq(schema.changeRequests.projectId, projectId));

    if (changes.length === 0) return "CX000100";

    const numbers = changes.map((c) => parseInt(c.customId.replace("CX", "")));
    const maxNum = Math.max(...numbers);
    return `CX${String(maxNum + 1).padStart(6, "0")}`;
  } catch (error) {
    console.error("Error generating change custom ID:", error);
    return `CX${String(100 + (Date.now() % 900000)).padStart(6, "0")}`;
  }
}

// Create new change request
export async function createChangeRequest(customId, changeData) {
  try {
    const db = await initDb();
    if (!db) return { error: "Database connection failed" };

    const projectId = await getProjectIdByCustomId(customId);
    if (!projectId) return { error: "Project not found" };

    const changeCustomId = await getNextChangeCustomId(projectId);

    const result = await db
      .insert(schema.changeRequests)
      .values({
        customId: changeCustomId,
        projectId,
        title: changeData.title,
        description: changeData.description,
        changeType: changeData.changeType,
        priority: changeData.priority,
        status: changeData.status || "Pending",
        primaryModuleId: changeData.primaryModuleId || null,
        estimatedImpactScore: changeData.estimatedImpactScore || 0,
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

// Create new module
export async function createModule(customId, moduleData) {
  try {
    const db = await initDb();
    if (!db) return { error: "Database connection failed" };

    const projectId = await getProjectIdByCustomId(customId);
    if (!projectId) return { error: "Project not found" };

    return await db.transaction(async (tx) => {
      // Insert the module
      const result = await tx
        .insert(schema.modules)
        .values({
          projectId,
          name: moduleData.name,
          techStack: moduleData.techStack || null,
        })
        .returning();

      const newModule = result[0];

      // Insert module dependencies if any
      if (moduleData.dependencies && moduleData.dependencies.length > 0) {
        const depValues = moduleData.dependencies.map((dep) => {
          // Handle both old format (just ID) and new format ({id, type})
          const childModuleId = typeof dep === "object" ? dep.id : dep;
          const depType = typeof dep === "object" ? dep.type || "Hard" : "Hard";

          return {
            parentModuleId: newModule.id,
            childModuleId: childModuleId,
            depType: depType,
          };
        });

        await tx.insert(schema.moduleDependencies).values(depValues);
      }

      return { success: true, data: newModule };
    });
  } catch (error) {
    console.error("Error creating module:", error);
    return { error: error.message || "Failed to create module" };
  }
}

// Update module
export async function updateModule(moduleId, moduleData) {
  try {
    const db = await initDb();
    if (!db) return { error: "Database connection failed" };

    const result = await db
      .update(schema.modules)
      .set(moduleData)
      .where(eq(schema.modules.id, moduleId))
      .returning();

    return { success: true, data: result[0] };
  } catch (error) {
    console.error("Error updating module:", error);
    return { error: error.message || "Failed to update module" };
  }
}

/**
 * Get a single change request by ID
 */
export async function getChangeRequestById(changeId, projectCustomId = null) {
  try {
    const db = await initDb();
    if (!db) {
      console.error("Database connection failed for getChangeRequestById");
      throw new Error("Database connection failed");
    }

    // Ensure changeId is a number
    const numericChangeId = parseInt(changeId);
    if (isNaN(numericChangeId)) {
      console.error("Invalid change ID:", changeId);
      return null;
    }

    console.log(
      "Fetching change request with ID:",
      numericChangeId,
      "Type:",
      typeof numericChangeId,
    );
    
    // Select only columns that actually exist in the database
    const result = await db
      .select({
        id: schema.changeRequests.id,
        customId: schema.changeRequests.customId,
        projectId: schema.changeRequests.projectId,
        baselineId: schema.changeRequests.baselineId,
        primaryModuleId: schema.changeRequests.primaryModuleId,
        title: schema.changeRequests.title,
        description: schema.changeRequests.description,
        sliderInputs: schema.changeRequests.sliderInputs,
        numericDeltas: schema.changeRequests.numericDeltas,
        status: schema.changeRequests.status,
      })
      .from(schema.changeRequests)
      .where(eq(schema.changeRequests.id, numericChangeId))
      .limit(1);

    console.log("Change request query result for ID", numericChangeId, ":", result);
    
    if (result.length === 0) {
      console.warn(`No change request found with ID ${numericChangeId}`);
      return null;
    }
    
    // If we need to validate it's in the right project
    if (projectCustomId && result[0].projectId) {
      const project = await db
        .select({ id: schema.projects.id })
        .from(schema.projects)
        .where(eq(schema.projects.customId, projectCustomId))
        .limit(1);
      
      if (project.length === 0 || project[0].id !== result[0].projectId) {
        console.warn(`Change ${numericChangeId} doesn't belong to project ${projectCustomId}`);
        return null;
      }
    }
    
    return result[0];
  } catch (error) {
    console.error("Error fetching change request:", error);
    return null;
  }
}

/**
 * Get impact results for a specific change
 */
export async function getImpactResultsByChangeId(changeId) {
  try {
    const db = await initDb();
    if (!db) {
      console.error(
        "Database connection failed for getImpactResultsByChangeId",
      );
      throw new Error("Database connection failed");
    }

    console.log("Fetching impact results for change ID:", changeId);
    const result = await db
      .select()
      .from(schema.impactResults)
      .where(eq(schema.impactResults.changeId, changeId))
      .limit(1);

    console.log("Impact results query result:", result);
    return result[0] || null;
  } catch (error) {
    console.error("Error fetching impact results:", error);
    return null;
  }
}

/**
 * Calculate scope creep for a project
 * Compares accepted/implemented changes against the original baseline
 */
export async function getProjectScopeCreep(customId) {
  try {
    const db = await initDb();
    if (!db) return { error: "Database connection failed" };

    const projectId = await getProjectIdByCustomId(customId);
    if (!projectId) return { error: "Project not found" };

    // Get the original/first baseline
    const originalBaseline = await db
      .select()
      .from(schema.baselines)
      .where(eq(schema.baselines.projectId, projectId))
      .orderBy(schema.baselines.id)
      .limit(1);

    if (originalBaseline.length === 0) {
      return {
        success: true,
        data: {
          originalBudget: 0,
          originalHours: 0,
          acceptedCostIncrease: 0,
          acceptedDelayDays: 0,
          implementedCostIncrease: 0,
          implementedDelayDays: 0,
          budgetOverrun: 0,
          scheduleOverrun: 0,
          scopeCreepPct: 0,
        },
      };
    }

    const baseline = originalBaseline[0];

    // Get all accepted and implemented changes
    const changes = await db
      .select({
        id: schema.changeRequests.id,
        customId: schema.changeRequests.customId,
        projectId: schema.changeRequests.projectId,
        baselineId: schema.changeRequests.baselineId,
        primaryModuleId: schema.changeRequests.primaryModuleId,
        title: schema.changeRequests.title,
        description: schema.changeRequests.description,
        sliderInputs: schema.changeRequests.sliderInputs,
        numericDeltas: schema.changeRequests.numericDeltas,
        status: schema.changeRequests.status,
      })
      .from(schema.changeRequests)
      .where(eq(schema.changeRequests.projectId, projectId));

    // Get impact results for changes
    const acceptedChanges = changes.filter(
      (c) => c.status === "Accepted" || c.status === "Implemented",
    );
    const implementedChanges = changes.filter(
      (c) => c.status === "Implemented",
    );

    // Sum up cost and delay increases
    let acceptedCostIncrease = 0;
    let acceptedDelayDays = 0;
    let implementedCostIncrease = 0;
    let implementedDelayDays = 0;

    for (const change of acceptedChanges) {
      const impact = await db
        .select()
        .from(schema.impactResults)
        .where(eq(schema.impactResults.changeId, change.id))
        .limit(1);

      if (impact.length > 0) {
        const costIncrease = impact[0].predictedCostIncrease || 0;
        const delayDays = impact[0].predictedDelayDays || 0;

        acceptedCostIncrease += costIncrease;
        acceptedDelayDays += delayDays;

        if (change.status === "Implemented") {
          implementedCostIncrease += costIncrease;
          implementedDelayDays += delayDays;
        }
      }
    }

    const budgetOverrun = (acceptedCostIncrease / (baseline.totalBudgetEst || 1)) * 100;
    const scheduleOverrun = (acceptedDelayDays / ((baseline.totalEffortHours || 1) / 8)) * 100;
    const scopeCreepPct =
      acceptedChanges.length > 0 ? (acceptedChanges.length / changes.length) * 100 : 0;

    return {
      success: true,
      data: {
        originalBudget: baseline.totalBudgetEst || 0,
        originalHours: baseline.totalEffortHours || 0,
        acceptedChangesCount: acceptedChanges.length,
        implementedChangesCount: implementedChanges.length,
        acceptedCostIncrease,
        acceptedDelayDays,
        implementedCostIncrease,
        implementedDelayDays,
        budgetOverrun: Math.round(budgetOverrun * 10) / 10,
        scheduleOverrun: Math.round(scheduleOverrun * 10) / 10,
        scopeCreepPct: Math.round(scopeCreepPct),
      },
    };
  } catch (error) {
    console.error("Error calculating scope creep:", error);
    return { error: error.message || "Failed to calculate scope creep" };
  }
}

/**
 * Diagnostic function to check what changes exist in the database
 */
export async function getDiagnosticInfo(projectCustomId) {
  try {
    const db = await initDb();
    if (!db) return { error: "Database connection failed" };

    // Get project ID
    const project = await db
      .select({ id: schema.projects.id })
      .from(schema.projects)
      .where(eq(schema.projects.customId, projectCustomId));

    if (project.length === 0) {
      return { error: `Project ${projectCustomId} not found` };
    }

    const projectId = project[0].id;

    // Get all changes for this project
    const allChanges = await db
      .select({
        id: schema.changeRequests.id,
        customId: schema.changeRequests.customId,
        title: schema.changeRequests.title,
        status: schema.changeRequests.status,
        projectId: schema.changeRequests.projectId,
      })
      .from(schema.changeRequests)
      .where(eq(schema.changeRequests.projectId, projectId));

    return {
      projectCustomId,
      projectId,
      totalChanges: allChanges.length,
      changes: allChanges.map(c => ({
        id: c.id,
        customId: c.customId,
        title: c.title,
        status: c.status,
        projectId: c.projectId
      })),
    };
  } catch (error) {
    console.error("Error in getDiagnosticInfo:", error);
    return { error: error.message || "Failed to get diagnostic info" };
  }
}
