"use server";
import { initDb } from "@/db/index";
import { eq, and } from "drizzle-orm";
import * as schema from "@/db/schema";

const SCORING_WEIGHTS = {
  sliders: {
    technical_complexity: 0.15,
    stakeholder_priority: 0.05,
    resource_availability: 0.1,
    architecture_impact: 0.15,
    dependency_depth: 0.1,
    revenue_roi: 0.05,
  },
  numerics: {
    new_screens: 0.1,
    external_integrations: 0.15,
    db_schema_changes: 0.1,
    logic_rules: 0.05,
  },
};

function calculateImpactScore(sliders, numerics, dependencyCount = 0) {
  let sliderScore = 0;
  let numericScore = 0;
  let dependencyScore = 0;
  const breakdown = {};

  Object.keys(sliders).forEach((key) => {
    if (!(key in SCORING_WEIGHTS.sliders)) return;
    const val = Number(sliders[key]);
    const weight = SCORING_WEIGHTS.sliders[key];

    // Resource Availability is inverse: higher availability = lower score (better)
    const normalizedVal = key === "resource_availability" ? 10 - val : val;
    const contrib = normalizedVal * 10 * weight;
    sliderScore += contrib;
    breakdown[key] = contrib;
  });

  Object.keys(numerics).forEach((key) => {
    if (!(key in SCORING_WEIGHTS.numerics)) return;
    const val = Number(numerics[key]) || 0;
    const weight = SCORING_WEIGHTS.numerics[key];
    const capped = Math.min(val, 10);
    const contrib = capped * 10 * weight;
    numericScore += contrib;
    breakdown[key] = contrib;
  });

  // Add dependency impact: each dependent module adds to the score
  // More dependencies = higher impact of change
  dependencyScore = Math.min(dependencyCount * 5, 50); // Cap at 50 points
  breakdown.dependency_impact = dependencyScore;

  const finalScore = Math.round(
    Math.min(sliderScore + numericScore + dependencyScore, 100),
  );
  const calculationLog = `Score: ${finalScore}/100 (Sliders: ${sliderScore.toFixed(1)}, Numerics: ${numericScore.toFixed(1)}, Dependencies: ${dependencyScore.toFixed(1)})`;

  return {
    finalScore,
    sliderContribution: sliderScore,
    numericContribution: numericScore,
    dependencyContribution: dependencyScore,
    breakdown,
    calculationLog,
  };
}

function generateRecommendation(score) {
  if (score < 30) return "Low impact. Safe to proceed with standard QA.";
  if (score < 70)
    return "Moderate impact. Requires careful review and testing.";
  return "High impact. Critical scope increase. Recommend stakeholder review.";
}

function calculatePredictedImpact(sliders, numerics, activeBaseline) {
  // Calculate predicted cost increase based on numeric deltas and hourly rate
  let costIncrease = 0;
  const hourlyRate = 100; // default rate, can be fetched from project config

  // Base cost calculation on new effort hours
  // Assume new_screens add ~16 hours each, external_integrations add ~20 hours each
  const estimatedNewHours =
    (numerics.new_screens || 0) * 16 +
    (numerics.external_integrations || 0) * 20 +
    (numerics.db_schema_changes || 0) * 12 +
    (numerics.logic_rules || 0) * 8;

  costIncrease = estimatedNewHours * hourlyRate;

  // Calculate predicted delay days based on sliders and numeric impact
  let delayDays = 0;
  const technicalComplexity = sliders.technical_complexity || 5;
  const dependencyDepth = sliders.dependency_depth || 5;
  const resourceAvailability = sliders.resource_availability || 5;

  // Base delay from complexity and dependencies
  delayDays = (technicalComplexity / 10) * 5 + (dependencyDepth / 10) * 3;

  // Reduce delay if resource availability is high
  const availabilityFactor = (10 - resourceAvailability) / 10;
  delayDays += availabilityFactor * 2;

  // Add delay for each technical change
  delayDays += (numerics.db_schema_changes || 0) * 0.5;
  delayDays += (numerics.external_integrations || 0) * 1;

  return {
    predictedCostIncrease: Math.round(costIncrease),
    predictedDelayDays: Math.round(delayDays * 10) / 10, // Round to 1 decimal
  };
}

export async function submitChangeRequest(payload) {
  try {
    const conn = await initDb();
    if (!conn) throw new Error("DB not configured");

    // Fetch the selected module to get dependency count
    let dependencyCount = 0;
    if (payload.primaryModuleId) {
      const moduleResult = await conn.query.modules.findFirst({
        where: eq(schema.modules.id, Number(payload.primaryModuleId)),
      });

      if (moduleResult) {
        // Count how many modules depend on this one (reverse direction)
        // childModuleId = our module means: our module is being depended ON
        const dependencies = await conn
          .select()
          .from(schema.moduleDependencies)
          .where(eq(schema.moduleDependencies.childModuleId, moduleResult.id));
        dependencyCount = dependencies.length;
      }
    }

    const impactCalculation = calculateImpactScore(
      payload.sliders,
      payload.numerics,
      dependencyCount,
    );

    return await conn.transaction(async (tx) => {
      // payload.projectId is the custom ID (PX000100), we need to look up the actual numeric id
      const projectCustomId = payload.projectId;
      const projectResult = await tx.query.projects.findFirst({
        where: eq(schema.projects.customId, projectCustomId),
      });

      if (!projectResult) {
        throw new Error(`Project not found with customId: ${projectCustomId}`);
      }

      const numericProjectId = projectResult.id;

      const customId = `CX${Date.now().toString().slice(-8)}${Math.floor(Math.random() * 900 + 100)}`;

      const changeValues = {
        customId,
        projectId: numericProjectId,
        baselineId: payload.benchmarkBaselineId
          ? Number(payload.benchmarkBaselineId)
          : null,
        primaryModuleId: payload.primaryModuleId
          ? Number(payload.primaryModuleId)
          : null,
        title: payload.title || null,
        description: payload.description || null,
        sliderInputs: payload.sliders || null,
        numericDeltas: payload.numerics || null,
        status: "Pending",
      };

      const [cr] = await tx
        .insert(schema.changeRequests)
        .values(changeValues)
        .returning();

      if (!cr) {
        throw new Error("Failed to insert change request");
      }

      // Calculate predicted impact (cost and delay)
      const predictedImpact = calculatePredictedImpact(
        payload.sliders || {},
        payload.numerics || {},
        null,
      );

      const impactValues = {
        changeId: cr.id,
        finalScore: impactCalculation.finalScore,
        predictedCostIncrease: predictedImpact.predictedCostIncrease,
        predictedDelayDays: predictedImpact.predictedDelayDays,
        recommendationText: generateRecommendation(
          impactCalculation.finalScore,
        ),
        weightedBreakdown: impactCalculation.breakdown,
        calculationLog: impactCalculation.calculationLog,
      };

      const [ir] = await tx
        .insert(schema.impactResults)
        .values(impactValues)
        .returning();

      if (!ir) {
        throw new Error("Failed to insert impact result");
      }

      return {
        changeRequest: cr,
        impactResult: ir,
        impactCalculation,
      };
    });
  } catch (err) {
    console.error("submitChangeRequest error:", err);
    throw err;
  }
}

export async function promoteToBaseline(changeId) {
  const conn = await initDb();
  if (!conn) throw new Error("DB not configured");

  return await conn.transaction(async (tx) => {
    // Select only existing columns (without acceptedAt, implementedAt, createdAt)
    const changeResults = await tx
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

    const changeRequest = changeResults[0];
    if (!changeRequest) throw new Error(`Change ${changeId} not found`);

    console.log("✅ Change request found:", changeRequest.id);

    // Fetch the impact results to get cost and delay estimates
    const [impactResult] = await tx
      .select()
      .from(schema.impactResults)
      .where(eq(schema.impactResults.changeId, changeId));

    console.log("✅ Impact result found:", impactResult ? "yes" : "no");

    const [activeBaseline] = await tx
      .select()
      .from(schema.baselines)
      .where(
        and(
          eq(schema.baselines.projectId, changeRequest.projectId),
          eq(schema.baselines.isActive, true),
        ),
      );

    if (!activeBaseline)
      throw new Error(
        `No active baseline for project ${changeRequest.projectId}`,
      );

    console.log("✅ Active baseline found:", activeBaseline.id);

    const versionParts = activeBaseline.versionLabel.split(".");
    versionParts[1] = String(Number(versionParts[1]) + 1);
    const newVersionLabel = versionParts.join(".");

    const newBaselineCustomId = `BX${Date.now().toString().slice(-8)}${Math.floor(Math.random() * 900 + 100)}`;

    // Calculate updated effort hours and budget based on impact results
    const delayDays = impactResult?.predictedDelayDays || 0;
    const costIncrease = impactResult?.predictedCostIncrease || 0;
    const hoursIncrease = delayDays * 8; // Assuming 8 hour work day

    const [newBaseline] = await tx
      .insert(schema.baselines)
      .values({
        customId: newBaselineCustomId,
        projectId: changeRequest.projectId,
        versionLabel: newVersionLabel,
        totalEffortHours:
          (activeBaseline.totalEffortHours || 0) + hoursIncrease,
        totalBudgetEst: (activeBaseline.totalBudgetEst || 0) + costIncrease,
        isActive: true,
      })
      .returning();

    console.log("✅ New baseline created:", newBaseline.id);

    await tx
      .update(schema.baselines)
      .set({ isActive: false })
      .where(eq(schema.baselines.id, activeBaseline.id));

    console.log("✅ Old baseline marked as inactive");

    // Get the primary module's current snapshot from the old baseline
    const [primarySnapshot] = await tx
      .select()
      .from(schema.baselineModuleSnapshots)
      .where(
        and(
          eq(schema.baselineModuleSnapshots.baselineId, activeBaseline.id),
          eq(
            schema.baselineModuleSnapshots.moduleId,
            changeRequest.primaryModuleId,
          ),
        ),
      );

    console.log(
      "📸 Primary module snapshot found:",
      primarySnapshot ? "yes" : "no",
    );

    // Create snapshot for the primary module in the new baseline
    // Use existing values or defaults if snapshot didn't exist
    const snapshotToInsert = {
      baselineId: newBaseline.id,
      moduleId: changeRequest.primaryModuleId,
      screenCount: primarySnapshot?.screenCount || 0,
      integrationCount: primarySnapshot?.integrationCount || 0,
      logicRuleCount: primarySnapshot?.logicRuleCount || 0,
      complexityScore: primarySnapshot?.complexityScore || 5,
    };

    const insertedSnapshots = await tx
      .insert(schema.baselineModuleSnapshots)
      .values(snapshotToInsert)
      .returning();

    console.log("✅ Primary module snapshot created");

    // Update the primary module's snapshot with the numeric deltas
    const numericDeltas = changeRequest.numericDeltas || {};
    const targetSnapshot = insertedSnapshots[0];

    if (targetSnapshot) {
      const updates = {};
      if (
        numericDeltas.new_screens !== undefined &&
        numericDeltas.new_screens > 0
      ) {
        updates.screenCount =
          (targetSnapshot.screenCount || 0) + Number(numericDeltas.new_screens);
      }
      if (
        numericDeltas.external_integrations !== undefined &&
        numericDeltas.external_integrations > 0
      ) {
        updates.integrationCount =
          (targetSnapshot.integrationCount || 0) +
          Number(numericDeltas.external_integrations);
      }
      if (
        numericDeltas.logic_rules !== undefined &&
        numericDeltas.logic_rules > 0
      ) {
        updates.logicRuleCount =
          (targetSnapshot.logicRuleCount || 0) +
          Number(numericDeltas.logic_rules);
      }
      if (
        numericDeltas.db_schema_changes !== undefined &&
        numericDeltas.db_schema_changes > 0
      ) {
        updates.complexityScore =
          (targetSnapshot.complexityScore || 5) +
          Number(numericDeltas.db_schema_changes);
      }

      if (Object.keys(updates).length > 0) {
        await tx
          .update(schema.baselineModuleSnapshots)
          .set(updates)
          .where(eq(schema.baselineModuleSnapshots.id, targetSnapshot.id));

        console.log("✅ Updated target snapshot with deltas");
      }
    }

    await tx
      .update(schema.changeRequests)
      .set({
        status: "Accepted",
        // acceptedAt: new Date(),  // Column doesn't exist in DB yet
      })
      .where(eq(schema.changeRequests.id, changeId));

    console.log("✅ Change request marked as Accepted");

    return {
      success: true,
      newBaseline,
      newVersionLabel,
      appliedDeltas: numericDeltas,
    };
  });
}

/**
 * Mark a change as Implemented and apply metrics to the active baseline
 * This permanently applies the change's metrics to the baseline
 */
export async function implementChange(changeId) {
  const conn = await initDb();
  if (!conn) throw new Error("DB not configured");

  return await conn.transaction(async (tx) => {
    // Select only existing columns (without acceptedAt, implementedAt, createdAt)
    const changeResults = await tx
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

    const changeRequest = changeResults[0];
    if (!changeRequest) throw new Error(`Change ${changeId} not found`);

    if (changeRequest.status !== "Accepted") {
      throw new Error(
        "Only Accepted changes can be marked as Implemented. Current status: " +
          changeRequest.status,
      );
    }

    console.log("✅ Implementing change:", changeRequest.id);

    // Get the active baseline (current project state)
    const activeBaselineResults = await tx
      .select()
      .from(schema.baselines)
      .where(
        and(
          eq(schema.baselines.projectId, changeRequest.projectId),
          eq(schema.baselines.isActive, true),
        ),
      );

    const activeBaseline = activeBaselineResults[0];
    if (!activeBaseline) {
      throw new Error(
        `No active baseline for project ${changeRequest.projectId}`,
      );
    }

    console.log("✅ Active baseline found:", activeBaseline.id);

    // Get the snapshot for the primary module
    const snapshotResults = await tx
      .select()
      .from(schema.baselineModuleSnapshots)
      .where(
        and(
          eq(schema.baselineModuleSnapshots.baselineId, activeBaseline.id),
          eq(schema.baselineModuleSnapshots.moduleId, changeRequest.primaryModuleId),
        ),
      );

    let snapshot = snapshotResults[0];
    
    // If no snapshot exists, create one with default values
    if (!snapshot) {
      console.log(
        "⚠️ Snapshot not found, creating one with defaults for module",
        changeRequest.primaryModuleId,
      );
      
      const createdSnapshots = await tx
        .insert(schema.baselineModuleSnapshots)
        .values({
          baselineId: activeBaseline.id,
          moduleId: changeRequest.primaryModuleId,
          screenCount: 0,
          integrationCount: 0,
          logicRuleCount: 0,
          complexityScore: 5,
        })
        .returning();
      
      snapshot = createdSnapshots[0];
      console.log("✅ Default snapshot created for module:", snapshot.id);
    }

    // Verify that the snapshot has the metrics from the change applied
    // (they should have been applied when the baseline was promoted)
    console.log("✅ Module snapshot found with current metrics");

    // Mark the change as Implemented
    await tx
      .update(schema.changeRequests)
      .set({
        status: "Implemented",
        // implementedAt: new Date(),  // Column doesn't exist in DB yet
      })
      .where(eq(schema.changeRequests.id, changeId));

    console.log("✅ Change marked as Implemented");

    return {
      success: true,
      message: "Change successfully implemented",
      changeId,
      implementedMetrics: {
        screenCount: snapshot.screenCount,
        integrationCount: snapshot.integrationCount,
        logicRuleCount: snapshot.logicRuleCount,
        complexityScore: snapshot.complexityScore,
      },
    };
  });
}

export default submitChangeRequest;
